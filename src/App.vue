<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>


  <RouterView :key="$route.url"/>
</template>

<style scoped>

</style>
