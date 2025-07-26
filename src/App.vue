<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useTheme } from './composables/useTheme'

const { isDark } = useTheme()
</script>

<template>
  <div :class="{ dark: isDark }">
    <RouterView />
    <Toaster 
      position="top-right"
      :theme="isDark ? 'dark' : 'light'"
      rich-colors
    />
  </div>
</template>

<style scoped>
</style>