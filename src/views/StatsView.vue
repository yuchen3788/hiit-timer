<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecordsStore } from '@/stores/records'

const recordsStore = useRecordsStore()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const monthLabel = computed(() => `${currentYear.value}年${currentMonth.value + 1}月`)

const stats = computed(() => recordsStore.monthStats(currentYear.value, currentMonth.value))

const trainedDays = computed(() => recordsStore.getTrainedDays(currentYear.value, currentMonth.value))

const monthRecords = computed(() => {
  return recordsStore
    .getRecordsByMonth(currentYear.value, currentMonth.value)
    .slice()
    .sort((a, b) => b.completedAt - a.completedAt)
})

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

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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
      <!-- 顶部汇总 -->
      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-value">{{ stats.count }}</span>
          <span class="summary-label">次训练</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-value">{{ formatDuration(stats.totalDuration) }}</span>
          <span class="summary-label">总时长</span>
        </div>
      </div>

      <!-- 月份切换 -->
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="month-label">{{ monthLabel }}</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
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

      <!-- 记录列表 -->
      <div class="records-section">
        <h3 class="section-title">训练记录</h3>
        <div v-if="monthRecords.length" class="records-list">
          <div v-for="record in monthRecords" :key="record.id" class="record-item">
            <div class="record-info">
              <span class="record-name">{{ record.planName }}</span>
              <span class="record-date">{{ formatDate(record.completedAt) }}</span>
            </div>
            <span class="record-duration">{{ formatDuration(record.totalDuration) }}</span>
          </div>
        </div>
        <p v-else class="empty-records">本月暂无训练记录</p>
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

.summary-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: var(--bg-card);
  padding: 24px;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 24px;
}

[data-theme="light"] .summary-row {
  border-color: rgba(0, 0, 0, 0.06);
  box-shadow: var(--shadow-sm);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.summary-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.summary-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.summary-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .summary-divider {
  background: rgba(0, 0, 0, 0.08);
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

[data-theme="light"] .nav-btn {
  background: rgba(0, 0, 0, 0.04);
}

.nav-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.1);
}

.month-label {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 100px;
  text-align: center;
}

.calendar {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 24px;
}

[data-theme="light"] .calendar {
  border-color: rgba(0, 0, 0, 0.06);
  box-shadow: var(--shadow-sm);
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
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
  gap: 4px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  position: relative;
}

.calendar-cell.empty {
  visibility: hidden;
}

.calendar-cell.today {
  color: var(--text-primary);
  font-weight: 700;
}

.calendar-cell.today::after {
  content: '';
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
}

.calendar-cell.trained {
  background: linear-gradient(135deg, var(--exercise-start), var(--exercise-end));
  color: #fff;
  font-weight: 700;
}

.calendar-cell.trained.today::after {
  background: rgba(255, 255, 255, 0.7);
}

.records-section {
  margin-top: 8px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

[data-theme="light"] .record-item {
  border-color: rgba(0, 0, 0, 0.06);
  box-shadow: var(--shadow-sm);
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.record-date {
  font-size: 12px;
  color: var(--text-muted);
}

.record-duration {
  font-size: 14px;
  font-weight: 600;
  color: var(--rest-start);
}

.empty-records {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 32px 0;
}
</style>
