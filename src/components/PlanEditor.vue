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
const rounds = ref(3)
const exercises = ref<{ name: string; duration: number }[]>([])

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    if (props.plan) {
      name.value = props.plan.name
      restDuration.value = props.plan.restDuration
      rounds.value = props.plan.rounds
      exercises.value = props.plan.exercises.map((e) => ({
        name: e.name,
        duration: e.duration,
      }))
    } else {
      name.value = ''
      restDuration.value = 15
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
            <input v-model="name" type="text" placeholder="如：晨间燃脂" />
          </div>

          <div class="field-row">
            <div class="field">
              <label>休息时长（秒）</label>
              <input v-model.number="restDuration" type="number" min="1" />
            </div>
            <div class="field">
              <label>循环次数</label>
              <input v-model.number="rounds" type="number" min="1" />
            </div>
          </div>

          <div class="field">
            <label>动作列表</label>
            <div
              v-for="(exercise, index) in exercises"
              :key="index"
              class="exercise-row"
            >
              <input
                v-model="exercise.name"
                type="text"
                placeholder="动作名称"
                class="exercise-name"
              />
              <input
                v-model.number="exercise.duration"
                type="number"
                min="1"
                class="exercise-duration"
              />
              <span class="unit">秒</span>
              <button
                class="btn-remove"
                @click="removeExercise(index)"
                :disabled="exercises.length <= 1"
              >
                ✕
              </button>
            </div>
            <button class="btn-add" @click="addExercise">+ 添加动作</button>
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
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.editor-sheet {
  width: 100%;
  max-height: 85vh;
  background: #2a2a2a;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: calc(16px + var(--safe-area-bottom));
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.editor-header h3 {
  font-size: 17px;
  font-weight: 700;
}

.btn-text {
  background: none;
  color: var(--text-secondary);
  font-size: 15px;
  padding: 4px 8px;
}

.btn-text.primary {
  color: var(--exercise-start);
  font-weight: 700;
}

.editor-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.field input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 16px;
}

.field input::placeholder {
  color: var(--text-muted);
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-row .field {
  flex: 1;
}

.exercise-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.exercise-name {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 15px;
}

.exercise-name::placeholder {
  color: var(--text-muted);
}

.exercise-duration {
  width: 60px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: 10px 8px;
  color: var(--text-primary);
  font-size: 15px;
  text-align: center;
}

.unit {
  font-size: 13px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-remove:disabled {
  opacity: 0.3;
  pointer-events: none;
}

.btn-add {
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-sm);
  padding: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.btn-add:active {
  background: rgba(255, 255, 255, 0.1);
}
</style>
