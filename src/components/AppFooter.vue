<template>
  <footer class="app-footer">
    <span>
      <RouterLink to="/impressum">Impressum</RouterLink>
    </span>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app-footer {
  margin-top: 0px;
  padding: 18px 0 10px 0;
  text-align: center;
  color: #888;
  background: #f5f7fa;
  border-top: 1px solid #e0e0e0;
  font-size: 0.95em;
}
.app-footer a {
  color: #234;
  text-decoration: underline;
}
</style>