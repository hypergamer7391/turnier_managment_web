<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import AppFooter from './components/AppFooter.vue'
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <RouterView :key="$route.url"/>
  <Analytics />
</template>

<style scoped>

</style>
