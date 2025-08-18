<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import TournamentCard from './TournamentCard.vue'

const tournaments = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('all')
const router = useRouter()

onMounted(async () => {
  try {
    const res = await axios.get('https://turnier-managment-web-backend.onrender.com/api/tournaments')
    tournaments.value = res.data
    console.log('Tournaments loaded:', tournaments.value)   
  } catch (e) {
    error.value = 'Fehler beim Laden der Turniere'
  } finally {
    loading.value = false
  }
})

function goToTournament(id) {
  router.push(`/turnier/${id}`)
}

const filteredTournaments = computed(() => {
  if (activeTab.value === 'all') return tournaments.value
  return tournaments.value.filter(t => t.status === activeTab.value)
})
</script>

<template>
  <section class="dashboard">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h2>Meine Turniere</h2>
        <p>Verwalte deine privaten Turniere und lade Freunde ein</p>
        <button @click="router.push({ path: 'turnier-erstellen' })" class="primary-btn">
          <span class="icon">+</span>
          Neues Turnier
        </button>
      </div>

      <!-- Join by Link -->
      <!-- <div class="join-section">
        <h3>Per Einladungslink beitreten</h3>
        <div class="join-input">
          <input placeholder="Einladungslink einfügen..." />
          <button class="outline-btn">
            <span class="icon">🔗</span>
            Beitreten
          </button>
        </div>
      </div> -->

      <!-- Tabs -->
      <div class="tabs">
        <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          Alle ({{ tournaments.length }})
        </button>
        <button :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
          Aktiv ({{ tournaments.filter(t => t.status === 'active').length }})
        </button>
        <button :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">
          Bevorstehend ({{ tournaments.filter(t => t.status === 'upcoming').length }})
        </button>
        <button :class="{ active: activeTab === 'finished' }" @click="activeTab = 'finished'">
          Beendet ({{ tournaments.filter(t => t.status === 'finished').length }})
        </button>
      </div>

      <!-- Loading/Error -->
      <div v-if="loading" class="loading">Lade Turniere...(bis zu 1 Minute)</div>
      <div v-if="error" class="error">{{ error }}</div>

      <!-- Tournament Cards -->
      <div v-if="!loading && filteredTournaments.length" class="tournament-grid">
        <TournamentCard 
          v-for="t in filteredTournaments" 
          :key="t.id" 
          v-bind="t" 
          @click="goToTournament(t.id)" 
        />
      </div>

      <div v-else-if="!loading && tournaments.length === 0" class="no-tournaments">
        Keine Turniere gefunden.
      </div>
    </div>
  </section>
</template>

<style>
.dashboard {
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 80vh;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.primary-btn {
  background-color: #1e40af;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.primary-btn:hover {
  background-color: #1b3b99;
}
.outline-btn {
  background: white;
  color: #1e40af;
  border: 2px solid #1e40af;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.outline-btn:hover {
  background: #f0f4ff;
}
.join-section {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid #d1d5db;
}
.join-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.join-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.tabs button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  background: #e5e7eb;
}
.tabs button.active {
  background: #1e40af;
  color: white;
}
.tournament-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.loading, .error, .no-tournaments {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
  color: #374151;
}
.error {
  color: red;
}
</style>
