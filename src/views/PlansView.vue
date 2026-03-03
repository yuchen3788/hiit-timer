<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlansStore } from '@/stores/plans'
import PlanEditor from '@/components/PlanEditor.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
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
      <div class="actions-group">
        <ThemeToggle />
        <button class="btn-add" @click="openCreate">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>

    <div class="plans-list" v-if="plansStore.plans.length">
      <div
        v-for="plan in plansStore.plans"
        :key="plan.id"
        class="plan-card"
        @click="goTimer(plan.id)"
      >
        <div class="card-glow" />
        <div class="card-content">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-meta">
            <span class="meta-tag">
              {{ plan.exercises.length }} 动作
            </span>
            <span class="meta-tag">
              {{ plan.rounds }} 轮
            </span>
            <span class="meta-tag duration">
              {{ formatDuration(plansStore.getPlanTotalDuration(plan)) }}
            </span>
          </div>
        </div>
        <div class="card-actions" @click.stop>
          <button class="btn-icon" @click="openEdit(plan)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-icon danger" @click="handleDelete(plan.id)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon-wrapper">
        <div class="empty-icon">🏋️</div>
      </div>
      <p class="empty-title">还没有训练方案</p>
      <p class="empty-hint">点击右上角 + 创建你的第一个计划</p>
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
  background: var(--bg-primary);
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(to bottom, var(--bg-primary) 80%, transparent);
  z-index: 10;
}

.top-bar h1 {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-add {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--exercise-start), var(--exercise-end));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(255, 81, 47, 0.4);
  transition: all var(--transition-normal);
}

.btn-add:active {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(255, 81, 47, 0.3);
}

.plans-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: calc(80px + var(--safe-area-bottom)); /* 为底部栏留空间 */
}

.plan-card {
  position: relative;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all var(--transition-normal);
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent 60%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.plan-card:active {
  transform: scale(0.98);
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.12);
}

.plan-card:active .card-glow {
  opacity: 1;
}

.card-content {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.plan-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
  line-height: 1.2;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.meta-tag.duration {
  color: var(--rest-start);
  background: rgba(67, 206, 162, 0.1);
}

.card-actions {
  display: flex;
  gap: 12px;
  margin-left: 16px;
  position: relative;
  z-index: 2;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.btn-icon:active {
  transform: scale(0.9);
}

.btn-icon.danger {
  color: #ff453a;
  background: rgba(255, 69, 58, 0.1);
}

.btn-icon.danger:hover {
  background: rgba(255, 69, 58, 0.2);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon {
  font-size: 48px;
  filter: grayscale(0.5);
  opacity: 0.8;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 15px;
  color: var(--text-muted);
}
</style>
