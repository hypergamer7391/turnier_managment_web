<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'

const tournaments = ref([])
const loading = ref(true)
const error = ref(null)
const router = useRouter()

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/tournaments')
    tournaments.value = res.data
  } catch (e) {
    error.value = 'Fehler beim Laden der Turniere'
  } finally {
    loading.value = false
  }
})

function goToTournament(id) {
  router.push(`/turnier/${id}`)
}
</script>

<template>
  <div class="home-container">
    <h2>Wähle dein Turnier!</h2>
    <div v-if="loading">Lade Turniere...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-if="!loading && tournaments.length">
      <li v-for="t in tournaments" :key="t.id">
        <a @click.prevent="goToTournament(t.id)" href="#">
          {{ t.name }}
        </a>
      </li>
    </ul>
    <div v-if="!loading && tournaments.length === 0">Keine Turniere gefunden.</div>
  </div>
  <AppFooter />
</template>

<style scoped>
.home-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  background: #f9f9fc;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(100,120,180,0.06);
  text-align: center;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 12px 0;
}
a {
  color: #234;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  transition: color 0.2s;
}
a:hover {
  color: #3a6cff;
}
.error {
  color: #c00;
  margin-top: 10px;
}
</style>
