<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <RouterView :key="$route.url"/>
  
</template>

<style scoped>

</style>
