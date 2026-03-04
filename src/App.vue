<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showTabBar = computed(() => {
  return route.name === 'plans' || route.name === 'stats'
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>

  <nav v-if="showTabBar" class="tab-bar">
    <router-link to="/" class="tab-item" :class="{ active: route.name === 'plans' }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 6H20M4 12H20M4 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>训练</span>
    </router-link>
    <router-link to="/stats" class="tab-item" :class="{ active: route.name === 'stats' }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
        <rect x="10" y="7" width="4" height="14" rx="1" stroke="currentColor" stroke-width="2"/>
        <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>统计</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--bg-secondary);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px 0;
  padding-bottom: calc(8px + var(--safe-area-bottom));
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

[data-theme="light"] .tab-bar {
  border-top-color: rgba(0, 0, 0, 0.06);
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.04);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 20px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  transition: color var(--transition-fast);
}

.tab-item.active {
  color: var(--exercise-start);
}
</style>
