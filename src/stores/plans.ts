import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Plan } from '@/types'
import { getUid, onSnapshot, setDoc, updateDoc, deleteDoc } from '@/utils/cloudbase'

// 使用平级集合名（CloudBase 文档数据库不支持路径中含 / 的嵌套集合）
const COLLECTION = 'plans'
const LOCAL_STORAGE_KEY = 'hiit-plans'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function saveToLocal(data: Plan[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

function loadFromLocal(): Plan[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const usePlansStore = defineStore('plans', () => {
  // 启动时立即从 localStorage 恢复
  const plans = ref<Plan[]>(loadFromLocal())
  let unsubscribe: (() => void) | null = null

  // plans 变化时自动同步到 localStorage
  watch(plans, (val) => saveToLocal(val), { deep: true })

  async function loadPlans() {
    const uid = getUid()
    if (!uid) return

    try {
      // 按 uid 过滤，只监听当前用户的计划
      unsubscribe = onSnapshot(
        COLLECTION,
        (docs) => {
          // 只在云端有数据时才覆盖，避免空结果清掉本地数据
          if (docs.length > 0) {
            plans.value = docs as Plan[]
          }
        },
        (error) => {
          console.error('Failed to load plans:', error)
        },
        { uid },
      )
    } catch (error) {
      console.error('Failed to setup plans listener:', error)
    }
  }

  async function addPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
    const uid = getUid()
    console.log('[Plans] addPlan uid:', uid)
    if (!uid) throw new Error('User not authenticated')

    const newPlan: Plan = { ...plan, id: generateId() }
    // Optimistic update（同时写入 localStorage）
    plans.value = [...plans.value, newPlan]
    try {
      // 文档中保存 uid，用于 where 过滤和安全规则
      const docData = { ...newPlan, uid }
      console.log('[Plans] 写入 CloudBase 数据:', JSON.stringify(docData))
      await setDoc(COLLECTION, newPlan.id, docData)
      console.log('[Plans] CloudBase 写入成功')
      return newPlan
    } catch (error) {
      console.error('[Plans] CloudBase 写入失败:', error)
      // CloudBase 失败不回滚，数据保留在本地
      return newPlan
    }
  }

  async function updatePlan(id: string, data: Partial<Omit<Plan, 'id'>>) {
    const uid = getUid()
    if (!uid) throw new Error('User not authenticated')

    // Optimistic update
    plans.value = plans.value.map((p) => (p.id === id ? { ...p, ...data } : p))
    try {
      await updateDoc(COLLECTION, id, data)
    } catch (error) {
      console.error('Failed to sync plan update to cloud:', error)
    }
  }

  async function deletePlan(id: string) {
    const uid = getUid()
    if (!uid) throw new Error('User not authenticated')

    // Optimistic update
    plans.value = plans.value.filter((p) => p.id !== id)
    try {
      await deleteDoc(COLLECTION, id)
    } catch (error) {
      console.error('Failed to sync plan delete to cloud:', error)
    }
  }

  function getPlan(id: string): Plan | undefined {
    return plans.value.find((p) => p.id === id)
  }

  function getPlanTotalDuration(plan: Plan): number {
    const exerciseTotal = plan.exercises.reduce((sum, e) => sum + e.duration, 0)
    const restTotal = plan.restDuration * Math.max(plan.exercises.length - 1, 0)
    const singleRound = exerciseTotal + restTotal
    const roundRestTotal = plan.roundRestDuration * Math.max(plan.rounds - 1, 0)
    return singleRound * plan.rounds + roundRestTotal
  }

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return {
    plans,
    loadPlans,
    addPlan,
    updatePlan,
    deletePlan,
    getPlan,
    getPlanTotalDuration,
    cleanup,
  }
})
