<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.theme === 'dark')

function toggle() {
  themeStore.toggleTheme()
}
</script>

<template>
  <button class="theme-toggle" @click="toggle" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
    <div class="toggle-track" :class="{ 'is-light': !isDark }">
      <div class="toggle-thumb">
        <span class="icon">{{ isDark ? '🌙' : '☀️' }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.toggle-track {
  width: 52px;
  height: 28px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  position: relative;
  transition: background-color 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-track.is-light {
  background-color: #E0E0E0;
  border-color: #D1D1D1;
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 1px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-track.is-light .toggle-thumb {
  transform: translateX(24px);
  background-color: #fff;
}

.icon {
  font-size: 14px;
  line-height: 1;
  user-select: none;
}
</style>
