import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WorkoutRecord } from '@/types'

const STORAGE_KEY = 'hiit-timer-records'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadFromStorage(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(records: WorkoutRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export const useRecordsStore = defineStore('records', () => {
  const records = ref<WorkoutRecord[]>(loadFromStorage())

  function addRecord(planName: string, totalDuration: number) {
    const record: WorkoutRecord = {
      id: generateId(),
      planName,
      totalDuration,
      completedAt: Date.now(),
    }
    records.value.push(record)
    saveToStorage(records.value)
  }

  function getRecordsByMonth(year: number, month: number): WorkoutRecord[] {
    return records.value.filter((r) => {
      const d = new Date(r.completedAt)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }

  function getTrainedDays(year: number, month: number): Set<number> {
    const days = new Set<number>()
    for (const r of records.value) {
      const d = new Date(r.completedAt)
      if (d.getFullYear() === year && d.getMonth() === month) {
        days.add(d.getDate())
      }
    }
    return days
  }

  const monthStats = computed(() => {
    return (year: number, month: number) => {
      const monthRecords = getRecordsByMonth(year, month)
      return {
        count: monthRecords.length,
        totalDuration: monthRecords.reduce((sum, r) => sum + r.totalDuration, 0),
      }
    }
  })

  return { records, addRecord, getRecordsByMonth, getTrainedDays, monthStats }
})
