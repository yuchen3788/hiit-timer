import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Plan } from '@/types'

const STORAGE_KEY = 'hiit-timer-plans'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadFromStorage(): Plan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(plans: Plan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export const usePlansStore = defineStore('plans', () => {
  const plans = ref<Plan[]>(loadFromStorage())

  function addPlan(plan: Omit<Plan, 'id'>): Plan {
    const newPlan: Plan = { ...plan, id: generateId() }
    plans.value.push(newPlan)
    saveToStorage(plans.value)
    return newPlan
  }

  function updatePlan(id: string, data: Partial<Omit<Plan, 'id'>>) {
    const index = plans.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      Object.assign(plans.value[index]!, data)
      saveToStorage(plans.value)
    }
  }

  function deletePlan(id: string) {
    plans.value = plans.value.filter((p) => p.id !== id)
    saveToStorage(plans.value)
  }

  function getPlan(id: string): Plan | undefined {
    return plans.value.find((p) => p.id === id)
  }

  function getPlanTotalDuration(plan: Plan): number {
    const exerciseTotal = plan.exercises.reduce((sum, e) => sum + e.duration, 0)
    const restTotal = plan.restDuration * Math.max(plan.exercises.length - 1, 0)
    return (exerciseTotal + restTotal) * plan.rounds
  }

  return { plans, addPlan, updatePlan, deletePlan, getPlan, getPlanTotalDuration }
})
