<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isTimerPage = computed(() => route.name === 'timer')
</script>

<template>
  <router-view />
  <nav v-if="!isTimerPage" class="tab-bar">
    <router-link to="/" class="tab-item" active-class="active">
      <span class="tab-icon">📋</span>
      <span class="tab-label">方案</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tab-bar {
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 0;
  padding-bottom: calc(8px + var(--safe-area-bottom));
  background: var(--bg-primary);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 24px;
  text-decoration: none;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.tab-item.active {
  color: var(--exercise-start);
}

.tab-icon {
  font-size: 22px;
}

.tab-label {
  font-size: 11px;
  font-weight: 600;
}
</style>
