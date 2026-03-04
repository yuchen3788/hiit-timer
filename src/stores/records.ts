import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { WorkoutRecord } from '@/types'
import { getUid, setDoc, onSnapshot } from '@/utils/cloudbase'

// 使用平级集合名（CloudBase 文档数据库不支持路径中含 / 的嵌套集合）
const COLLECTION = 'records'
const LOCAL_STORAGE_KEY = 'hiit-records'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function saveToLocal(data: WorkoutRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

function loadFromLocal(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useRecordsStore = defineStore('records', () => {
  const records = ref<WorkoutRecord[]>(loadFromLocal())
  let unsubscribe: (() => void) | null = null

  watch(records, (val) => saveToLocal(val), { deep: true })

  async function loadRecords() {
    const uid = getUid()
    if (!uid) return

    try {
      unsubscribe = onSnapshot(
        COLLECTION,
        (docs) => {
          if (docs.length > 0) {
            records.value = docs as WorkoutRecord[]
          }
        },
        (error) => {
          console.error('Failed to load records:', error)
        },
        { uid },
      )
    } catch (error) {
      console.error('Failed to setup records listener:', error)
    }
  }

  async function addRecord(planName: string, totalDuration: number) {
    const uid = getUid()
    if (!uid) throw new Error('User not authenticated')

    const record: WorkoutRecord = {
      id: generateId(),
      planName,
      totalDuration,
      completedAt: Date.now(),
    }

    // 先写入本地
    records.value = [...records.value, record]
    try {
      await setDoc(COLLECTION, record.id, { ...record, uid })
    } catch (error) {
      console.error('Failed to sync record to cloud:', error)
    }
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

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return {
    records,
    loadRecords,
    addRecord,
    getRecordsByMonth,
    getTrainedDays,
    monthStats,
    cleanup,
  }
})
