<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecordsStore } from '@/stores/records'

const recordsStore = useRecordsStore()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const monthLabel = computed(() => `${currentYear.value}年${currentMonth.value + 1}月`)

const stats = computed(() => recordsStore.monthStats(currentYear.value, currentMonth.value))
const annualStats = computed(() => recordsStore.yearStats(currentYear.value))

const trainedDays = computed(() => recordsStore.getTrainedDays(currentYear.value, currentMonth.value))

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }
  return days
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}秒`
  return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`
}

const isToday = (day: number) => {
  const today = new Date()
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
}
</script>

<template>
  <div class="stats-view">
    <header class="top-bar">
      <h1>统计</h1>
    </header>

    <div class="stats-content">
      <!-- 年度汇总 -->
      <div class="section-label">{{ currentYear }}年</div>
      <div class="summary-row">
        <div class="summary-card">
          <span class="summary-value exercise-text">{{ annualStats.count }}</span>
          <span class="summary-label">次训练</span>
        </div>
        <div class="summary-card">
          <span class="summary-value exercise-text">{{ formatDuration(annualStats.totalDuration) }}</span>
          <span class="summary-label">总时长</span>
        </div>
      </div>

      <!-- 月份导航 -->
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="month-label">{{ monthLabel }}</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 月度汇总 -->
      <div class="summary-row">
        <div class="summary-card">
          <span class="summary-value rest-text">{{ stats.count }}</span>
          <span class="summary-label">次训练</span>
        </div>
        <div class="summary-card">
          <span class="summary-value rest-text">{{ formatDuration(stats.totalDuration) }}</span>
          <span class="summary-label">总时长</span>
        </div>
      </div>

      <!-- 日历 -->
      <div class="calendar">
        <div class="calendar-header">
          <span v-for="w in weekdays" :key="w" class="weekday">{{ w }}</span>
        </div>
        <div class="calendar-grid">
          <div
            v-for="(day, i) in calendarDays"
            :key="i"
            class="calendar-cell"
            :class="{
              empty: day === null,
              trained: day !== null && trainedDays.has(day),
              today: day !== null && isToday(day),
            }"
          >
            <span v-if="day !== null">{{ day }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

.top-bar {
  padding: 20px 24px;
  padding-top: calc(20px + var(--safe-area-top));
}

.top-bar h1 {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.stats-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 32px;
  padding-bottom: calc(80px + var(--safe-area-bottom));
}

/* 区域标签 */
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

/* 汇总卡片行 */
.summary-row {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.summary-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

[data-theme="light"] .summary-card {
  background: var(--bg-card);
}

.summary-card .summary-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
}

.summary-card .summary-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.exercise-text {
  color: var(--exercise-start);
}

.rest-text {
  color: var(--rest-start);
}

/* 月份导航 */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.nav-btn:active {
  transform: scale(0.9);
  color: var(--text-primary);
}

.month-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 100px;
  text-align: center;
}

/* 日历 */
.calendar {
  padding: 8px 0;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  max-width: 320px;
  margin: 0 auto;
}

.calendar-cell {
  width: 36px;
  height: 36px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: 50%;
}

.calendar-cell.empty {
  visibility: hidden;
}

.calendar-cell.today {
  color: var(--text-primary);
  font-weight: 700;
  box-shadow: inset 0 0 0 1.5px var(--text-muted);
}

.calendar-cell.trained {
  background: var(--exercise-start);
  color: #fff;
  font-weight: 700;
}

.calendar-cell.trained.today {
  box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.5);
}
</style>
