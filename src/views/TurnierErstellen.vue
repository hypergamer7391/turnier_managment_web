<template>
  <div v-if="!isAdmin" class="login-container">
    <h2>Admin Login</h2>
    <input
      v-model="adminPassword"
      type="password"
      placeholder="Admin-Passwort"
      @keyup.enter="login"
    />
    <button @click="login">Login</button>
    <div v-if="loginError" class="error">{{ loginError }}</div>
  </div>

  <div v-else class="container">
    <h1>{{ mode === 'tournament' ? 'Turnier erstellen' : 'Teams generieren' }}</h1>

    <!-- Moduswahl -->
    <label class="mode-select">
      Modus:
      <select v-model="mode">
        <option value="tournament">Einzel</option>
        <option value="teams">Teams</option>
      </select>
    </label>
    <label class="game-select">
      Game:
      <select v-model="game">
        <option value="tennis">Tennis</option>
        <option value="teams">Anderes</option>
      </select>
    </label>

    <!-- Gemeinsame Eingaben -->
    <input v-model="name" placeholder="Titel" :disabled="mode === 'teams'" />

    <!-- Teammodus‑spezifische Eingabe -->
    <input
      v-if="mode === 'teams'"
      v-model.number="teamSize"
      type="number"
      min="2"
      placeholder="Teamgröße (z.B. 3)"
    />

    <textarea v-model="players" placeholder="Spieler pro Zeile"></textarea>

    <label style="display:block; margin-bottom:10px;">
      <input type="checkbox" v-model="withNebenrunde" />
      Nebenrunde (B-Runde) für Verlierer der 1. Runde erstellen
    </label>

    <button @click="submit">
      {{ mode === 'tournament' ? 'Turnier erstellen' : 'Teams generieren' }}
    </button>

    <!-- Rückmeldung im Turniermodus -->
    <div v-if="mode === 'tournament' && createdId" class="success">
      ✅ Turnier erstellt!
      <RouterLink :to="`/turnier/${createdId}`">Zum Turnier</RouterLink>
    </div>

    <div v-if="mode === 'teams' && createdId" class="success">
  ✅ Team-Turnier erstellt!
  <RouterLink :to="`/turnier/${createdId}`">Zum Turnier</RouterLink>
</div>

    <!-- Rückmeldung im Teammodus -->
    <div v-if="mode === 'teams' && teams.length" class="teams">
      <h2>Generierte Teams</h2>
      <ol>
        <li v-for="(team, idx) in teams" :key="idx">
          <strong>Team {{ idx + 1 }}</strong>
          <ul>
            <li v-for="member in team" :key="member">{{ member }}</li>
          </ul>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { RouterLink } from 'vue-router';

// ── Login ‑‑────────────────────────────────────────────────────────────
const isAdmin = ref(false);
const adminPassword = ref('');
const loginError = ref('');

function login() {
  if (adminPassword.value === 'geheim') {
    isAdmin.value = true;
    loginError.value = '';
  } else {
    loginError.value = 'Falsches Passwort!';
  }
}

// ── Formular‑State ─────────────────────────────────────────────────────
const mode = ref('tournament'); // 'tournament' | 'teams'
const game = ref('tennis'); // 'tournament' | 'teams'
const startDate = ref('');
const name = ref('');
const players = ref('');
const teamSize = ref(2);
const createdId = ref(null);
const teams = ref([]);
const withNebenrunde = ref(false);

// ── Absenden ──────────────────────────────────────────────────────────
async function submit() {
  const playerList = players.value
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean);

  if (playerList.length < 2) {
    alert('Mindestens 2 Spieler notwendig');
    return;
  }

  if (mode.value === 'tournament') {
    if (name.value.length < 3) {
      alert('Turniername notwendig');
      return;
    }

    try {
      const res = await axios.post(
        'https://turnier-managment-web-backend.onrender.com/api/tournaments',
        {
          title: name.value,
          players: playerList,
          participants: playerList.length,
          game: game.value,
          startDate: startDate.value,

          withNebenrunde: withNebenrunde.value,
        }
      );
      createdId.value = res.data.id;
    } catch (err) {
      alert('Fehler beim Speichern');
    }
  } else {
    // Teammodus
    if (!teamSize.value || teamSize.value < 2) {
      alert('Teamgröße muss ≥ 2 sein');
      return;
    }

    try {
      const res = await axios.post(
        'https://turnier-managment-web-backend.onrender.com/api/teams',
        {
          players: playerList,
          teamSize: teamSize.value,
        }
      );
      createdId.value = res.data.id;
      teams.value = res.data.teams;

    } catch (err) {
      alert('Fehler beim Generieren');
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.mode-select {
  display: block;
  margin-bottom: 10px;
}

textarea {
  width: 100%;
  height: 150px;
  margin-top: 10px;
  display: block;
}

input {
  display: block;
  margin-bottom: 10px;
  padding: 5px;
  width: 300px;
}

button {
  margin-top: 10px;
  padding: 6px 12px;
}

.success {
  margin-top: 20px;
  color: green;
}

.teams {
  margin-top: 20px;
}

.login-container {
  max-width: 300px;
  margin: 60px auto;
  padding: 24px;
  border: 1px solid #b3c6ff;
  border-radius: 8px;
  background: #f9f9fc;
  text-align: center;
}
.login-container input {
  margin-bottom: 12px;
  padding: 8px 10px;
  width: 90%;
  font-size: 1em;
}
.login-container button {
  padding: 8px 16px;
  font-weight: bold;
  font-size: 1em;
  width: 100%;
}
.error {
  color: #c00;
  margin-top: 10px;
}
</style>