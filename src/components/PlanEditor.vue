<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Plan } from '@/types'

const props = defineProps<{
  visible: boolean
  plan?: Plan
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<Plan, 'id'>]
}>()

const name = ref('')
const restDuration = ref(15)
const roundRestDuration = ref(60)
const rounds = ref(3)
const exercises = ref<{ name: string; duration: number }[]>([])

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    if (props.plan) {
      name.value = props.plan.name
      restDuration.value = props.plan.restDuration
      roundRestDuration.value = props.plan.roundRestDuration ?? 60
      rounds.value = props.plan.rounds
      exercises.value = props.plan.exercises.map((e) => ({
        name: e.name,
        duration: e.duration,
      }))
    } else {
      name.value = ''
      restDuration.value = 15
      roundRestDuration.value = 60
      rounds.value = 3
      exercises.value = [{ name: '', duration: 30 }]
    }
  }
)

function addExercise() {
  exercises.value.push({ name: '', duration: 30 })
}

function removeExercise(index: number) {
  exercises.value.splice(index, 1)
}

function handleSave() {
  const trimmedName = name.value.trim()
  const validExercises = exercises.value.filter((e) => e.name.trim())
  if (!trimmedName || validExercises.length === 0) return

  emit('save', {
    name: trimmedName,
    restDuration: restDuration.value,
    roundRestDuration: roundRestDuration.value,
    rounds: rounds.value,
    exercises: validExercises.map((e) => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: e.name.trim(),
      duration: e.duration,
    })),
  })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="editor-overlay" @click.self="emit('close')">
      <div class="editor-sheet">
        <div class="editor-header">
          <button class="btn-text" @click="emit('close')">取消</button>
          <h3>{{ plan ? '编辑方案' : '新建方案' }}</h3>
          <button class="btn-text primary" @click="handleSave">保存</button>
        </div>

        <div class="editor-body">
          <div class="field">
            <label>方案名称</label>
            <input v-model="name" type="text" placeholder="如：晨间燃脂" class="input-lg" />
          </div>

          <div class="field-row">
            <div class="field">
              <label>动作间休息</label>
              <div class="input-wrapper">
                <input v-model.number="restDuration" type="number" min="1" />
                <span class="suffix">秒</span>
              </div>
            </div>
            <div class="field">
              <label>循环次数</label>
              <div class="input-wrapper">
                <input v-model.number="rounds" type="number" min="1" />
                <span class="suffix">轮</span>
              </div>
            </div>
          </div>
          
          <div class="field">
            <label>循环间休息</label>
            <div class="input-wrapper">
              <input v-model.number="roundRestDuration" type="number" min="1" />
              <span class="suffix">秒</span>
            </div>
          </div>

          <div class="field">
            <label>动作列表 ({{ exercises.length }})</label>
            <div class="exercises-list">
              <div
                v-for="(exercise, index) in exercises"
                :key="index"
                class="exercise-row"
              >
                <div class="row-num">{{ index + 1 }}</div>
                <input
                  v-model="exercise.name"
                  type="text"
                  placeholder="动作名称"
                  class="exercise-name"
                />
                <div class="duration-input">
                  <input
                    v-model.number="exercise.duration"
                    type="number"
                    min="1"
                  />
                  <span class="unit">秒</span>
                </div>
                <button
                  class="btn-remove"
                  @click="removeExercise(index)"
                  :disabled="exercises.length <= 1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <button class="btn-add" @click="addExercise">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              添加动作
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.editor-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.editor-sheet {
  width: 100%;
  max-height: 90vh;
  background: #1c1e24;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: calc(16px + var(--safe-area-bottom));
  box-shadow: 0 -8px 40px rgba(0,0,0,0.5);
  animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.editor-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.btn-text {
  background: none;
  color: var(--text-secondary);
  font-size: 16px;
  padding: 8px;
  transition: color 0.2s;
}

.btn-text:active {
  opacity: 0.7;
}

.btn-text.primary {
  color: var(--exercise-start);
  font-weight: 600;
}

.editor-body {
  padding: 24px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-left: 2px;
}

.field input {
  background: var(--bg-card);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.2s;
}

.field input:focus {
  background: var(--bg-card-hover);
  border-color: rgba(255, 81, 47, 0.3);
}

.field input.input-lg {
  font-size: 18px;
  font-weight: 600;
  padding: 16px;
}

.field-row {
  display: flex;
  gap: 16px;
}

.field-row .field {
  flex: 1;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.suffix {
  position: absolute;
  right: 14px;
  color: var(--text-muted);
  font-size: 13px;
  pointer-events: none;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.exercise-row:focus-within {
  background: var(--bg-card-hover);
}

.row-num {
  width: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.exercise-name {
  flex: 1;
  background: transparent !important;
  padding: 8px 0 !important;
  border: none !important;
  font-size: 15px !important;
}

.duration-input {
  position: relative;
  width: 72px;
  background: var(--bg-input);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
}

.duration-input input {
  width: 100%;
  background: transparent !important;
  border: none !important;
  padding: 8px 24px 8px 8px !important;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.duration-input .unit {
  position: absolute;
  right: 8px;
  font-size: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove:hover:not(:disabled) {
  background: rgba(255, 69, 58, 0.1);
  color: #ff453a;
}

.btn-remove:disabled {
  opacity: 0.2;
}

.btn-add {
  background: var(--bg-card);
  border: 1px dashed rgba(128, 128, 128, 0.3);
  border-radius: var(--radius-sm);
  padding: 14px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-add:active {
  background: var(--bg-card-hover);
  transform: scale(0.99);
}
</style>
