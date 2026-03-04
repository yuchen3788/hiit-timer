<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTimerStore } from '@/stores/timer'
import { usePlansStore } from '@/stores/plans'
import { getRandomQuote } from '@/utils/quotes'

const router = useRouter()
const timerStore = useTimerStore()
const plansStore = usePlansStore()

// 如果没有完成状态，重定向回首页
if (timerStore.status !== 'completed' || !timerStore.currentPlan) {
  router.replace('/')
}

const plan = timerStore.currentPlan!
const totalDuration = computed(() => plansStore.getPlanTotalDuration(plan))
const formattedDuration = computed(() => {
  const seconds = totalDuration.value
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
})

const quote = getRandomQuote()

function goHome() {
  timerStore.reset()
  router.push('/')
}

function restart() {
  timerStore.reset()
  // 重新加载并开始
  if (plan) {
    timerStore.loadPlan(plan)
    router.replace(`/timer/${plan.id}`)
  }
}

onMounted(() => {
  // 这里可以加一些撒花特效，如果需要引入 canvas-confetti 库的话
})
</script>

<template>
  <div class="completion-view">
    <div class="content-wrapper">
      <div class="medal-icon">💪</div>
      
      <h1 class="title">太棒了！</h1>
      <p class="subtitle">你刚刚完成了</p>
      <h2 class="plan-name">{{ plan?.name }}</h2>
      
      <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{{ plan?.rounds }}</span>
        <span class="stat-label">轮循环</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <span class="stat-value duration">{{ formattedDuration }}</span>
        <span class="stat-label">总时长</span>
      </div>
      </div>

      <p class="motivational-quote">
        "{{ quote }}"
      </p>
    </div>

    <div class="actions">
      <button class="btn-secondary" @click="restart">再来一次</button>
      <button class="btn-primary" @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.completion-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 24px;
  background: var(--bg-primary);
  /* 庆祝背景渐变 */
  background-image: radial-gradient(circle at 50% 20%, rgba(255, 165, 0, 0.15), transparent 60%);
  animation: bgPulse 3s infinite ease-in-out;
}

@keyframes bgPulse {
  0% { background-size: 100% 100%; }
  50% { background-size: 120% 120%; }
  100% { background-size: 100% 100%; }
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.medal-icon {
  font-size: 80px;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.plan-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 40px;
}

.stats-grid {
  display: flex;
  align-items: center;
  justify-content: center; /* 整体居中 */
  gap: 32px; /* 增加项之间的间距 */
  background: var(--bg-card);
  padding: 32px 48px; /* 增加内边距 */
  border-radius: var(--radius-xl); /* 更圆润的角 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 40px;
  box-shadow: var(--shadow-md); /* 增加一点阴影提升质感 */
}

/* 浅色模式边框适配 */
[data-theme="light"] .stats-grid {
  border-color: rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center; /* 确保内容居中对齐 */
  justify-content: center; /* 确保内容垂直居中 */
  gap: 8px; /* 增加一点间距，让视觉更舒适 */
  min-width: 80px; /* 给一个最小宽度，避免太挤 */
}

.stat-value {
  font-size: 32px; /* 加大数字，突出重点 */
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1; /* 紧凑行高，避免上下留白过多影响对齐 */
}

.stat-value.duration {
  font-size: 32px; /* 与轮循环保持一致 */
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

/* 浅色模式分割线适配 */
[data-theme="light"] .stat-divider {
  background: rgba(0, 0, 0, 0.08);
}

.motivational-quote {
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
  max-width: 280px;
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
  animation: fadeIn 0.8s ease 0.4s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 700;
  transition: transform 0.2s;
}

.btn-primary:active,
.btn-secondary:active {
  transform: scale(0.98);
}

.btn-primary {
  background: linear-gradient(135deg, var(--exercise-start), var(--exercise-end));
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 81, 47, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 浅色模式次级按钮适配 */
[data-theme="light"] .btn-secondary {
  background: rgba(124, 77, 255, 0.08); /* 使用与新 exercise-start 匹配的紫色 (7C4DFF) */
  color: #7C4DFF; /* 使用新 exercise-start 颜色 */
  border-color: rgba(124, 77, 255, 0.2);
}

/* 浅色模式主按钮阴影适配 */
[data-theme="light"] .btn-primary {
  box-shadow: 0 4px 16px rgba(124, 77, 255, 0.25); /* 柔和的紫色阴影 */
}
</style>
