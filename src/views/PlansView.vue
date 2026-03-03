<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlansStore } from '@/stores/plans'
import PlanEditor from '@/components/PlanEditor.vue'
import type { Plan } from '@/types'

const router = useRouter()
const plansStore = usePlansStore()

const editorVisible = ref(false)
const editingPlan = ref<Plan | undefined>()

function openCreate() {
  editingPlan.value = undefined
  editorVisible.value = true
}

function openEdit(plan: Plan) {
  editingPlan.value = plan
  editorVisible.value = true
}

function handleSave(data: Omit<Plan, 'id'>) {
  if (editingPlan.value) {
    plansStore.updatePlan(editingPlan.value.id, data)
  } else {
    plansStore.addPlan(data)
  }
}

function handleDelete(id: string) {
  plansStore.deletePlan(id)
}

function goTimer(planId: string) {
  router.push(`/timer/${planId}`)
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}秒`
  return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`
}
</script>

<template>
  <div class="plans-view">
    <header class="top-bar">
      <h1>训练方案</h1>
      <button class="btn-add" @click="openCreate">+</button>
    </header>

    <div class="plans-list" v-if="plansStore.plans.length">
      <div
        v-for="plan in plansStore.plans"
        :key="plan.id"
        class="plan-card"
        @click="goTimer(plan.id)"
      >
        <div class="card-content">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-meta">
            <span>{{ plan.exercises.length }} 个动作</span>
            <span>·</span>
            <span>{{ plan.rounds }} 轮</span>
            <span>·</span>
            <span>{{ formatDuration(plansStore.getPlanTotalDuration(plan)) }}</span>
          </div>
        </div>
        <div class="card-actions" @click.stop>
          <button class="btn-icon" @click="openEdit(plan)">✎</button>
          <button class="btn-icon danger" @click="handleDelete(plan.id)">🗑</button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">🏋️</div>
      <p>还没有训练方案</p>
      <p class="empty-hint">点击 + 创建一个吧</p>
    </div>

    <PlanEditor
      :visible="editorVisible"
      :plan="editingPlan"
      @close="editorVisible = false"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.plans-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.top-bar h1 {
  font-size: 28px;
  font-weight: 800;
}

.btn-add {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--exercise-start), var(--exercise-end));
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.3);
}

.btn-add:active {
  transform: scale(0.9);
}

.plans-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease;
}

.plan-card:active {
  background: var(--bg-card-hover);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.plan-meta {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:active {
  transform: scale(0.9);
}

.btn-icon.danger {
  background: rgba(255, 59, 48, 0.12);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 16px;
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 14px;
  color: var(--text-muted);
}
</style>
