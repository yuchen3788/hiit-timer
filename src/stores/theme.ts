import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'hiit-timer-theme'

export const useThemeStore = defineStore('theme', () => {
  // 默认暗色
  const theme = ref<Theme>(
    (localStorage.getItem(STORAGE_KEY) as Theme) || 'dark'
  )

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
  }

  // 监听变化并持久化，同时更新 DOM
  watch(
    theme,
    (val) => {
      localStorage.setItem(STORAGE_KEY, val)
      document.documentElement.setAttribute('data-theme', val)
      
      // 更新 meta theme-color 用于移动端状态栏
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          val === 'dark' ? '#0f1115' : '#f8f9fa'
        )
      }
    },
    { immediate: true }
  )

  return { theme, toggleTheme, setTheme }
})
