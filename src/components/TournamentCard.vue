<template>
  <div class="card">
    <div class="card-header">
      <div class="header-left">
        <div class="title-row">
          <h3>{{ title }}</h3>
          
        </div>
        <p class="game">{{ game }}</p>
      </div>
      <span :class="['badge', statusClass]">{{ statusText }}</span>
    </div>

    <div class="card-content">
      <div class="info-grid">
        <div class="info-item">
          <Users class="icon" />
          <span>{{ participants }}</span>
        </div>
        <div class="info-item">
          <Calendar class="icon" />
          <span class="start-date">{{ startDate }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      
    </div>

    <div class="card-footer">
      <button 
        v-if="status !== 'finished' && inviteLink" 
        class="btn-outline" 
        @click="copyInviteLink"
      >
        <Link2 class="icon-link" /> Link kopieren
      </button>

      <button 
        :class="['btn', status === 'active' ? 'btn-default' : 'btn-secondary']" 
        :disabled="status === 'finished'"
      >
        {{ status === 'active' ? 'Ansehen' : status === 'upcoming' ? 'Verwalten' : 'Ergebnisse' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, Users, Link2, EyeOff } from "lucide-vue-next"
import { useRouter } from 'vue-router'

const router = useRouter()

interface Props {
  title: string;
  game: string;
  participants: number;
  
  startDate: string;
  status: "upcoming" | "active" | "finished";
  
  inviteLink?: string;
}

const props = defineProps<Props>()

const { title, game, participants, startDate, status, inviteLink } = props

const statusClass = computed(() => {
  switch(status) {
    case 'active': return 'badge-active'
    case 'upcoming': return 'badge-upcoming'
    case 'finished': return 'badge-finished'
    default: return ''
  }
})

const statusText = computed(() => {
  switch(status) {
    case 'active': return 'Aktiv'
    case 'upcoming': return 'Bevorstehend'
    case 'finished': return 'Beendet'
    default: return 'Status'
  }
})

const copyInviteLink = () => {
  if(inviteLink) navigator.clipboard.writeText(inviteLink)
}
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease;
  font-family: Arial, sans-serif;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.header-left {
  flex: 1;
}

.title-row {
  display: flex;
  /* align-items: center; */
  gap: 8px;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.icon-private {
  width: 16px;
  height: 16px;
  color: #999;
}

.game {
  font-size: 0.875rem;
  color: #666;
  margin: 2px 0 0;
}

.badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
}

.badge-active { background: #3b82f6; }
.badge-upcoming { background: #f59e0b; }
.badge-finished { background: #6b7280; }

.card-content {
  padding: 12px 16px;
}

.info-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #555;
}

.icon { width: 16px; height: 16px; color: #999; }

.start-date { font-size: 0.75rem; }

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #999;
}

.progress-bar-bg {
  width: 100%;
  background: #e5e7eb;
  height: 6px;
  border-radius: 6px;
}

.progress-bar {
  background: #3b82f6;
  height: 6px;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

.btn, .btn-outline {
  flex: 1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-default { background: #3b82f6; color: #fff; }
.btn-secondary { background: #e5e7eb; color: #555; }

.btn-outline {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-link {
  width: 16px;
  height: 16px;
}
</style>
