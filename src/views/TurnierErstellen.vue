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
    <h1>Turnier erstellen</h1>

    <input v-model="name" placeholder="Turniername" />
    <textarea v-model="players" placeholder="Spieler pro Zeile"></textarea>

    <button @click="submit">Turnier erstellen</button>

    <div v-if="createdId" class="success">
      ✅ Turnier erstellt!
      <RouterLink :to="`/turnier/${createdId}`">Zum Turnier anzeigen</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { RouterLink } from 'vue-router';

// Login-Logik
const isAdmin = ref(false);
const adminPassword = ref('');
const loginError = ref('');

function login() {
  // Beispiel-Passwort: "stufenfest"
  if (adminPassword.value === 'stufenfest') {
    isAdmin.value = true;
    loginError.value = '';
  } else {
    loginError.value = 'Falsches Passwort!';
  }
}

const name = ref('');
const players = ref('');
const createdId = ref(null);

async function submit() {
  const playerList = players.value
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean);

  if (name.value.length < 3 || playerList.length < 2) {
    alert('Mindestens 2 Spieler und Turniername notwendig');
    return;
  }

  try {
    const res = await axios.post('https://turnier-managment-web-backend.onrender.com/api/tournaments', {
      name: name.value,
      players: playerList,
    });
    createdId.value = res.data.id;
  } catch (err) {
    alert('Fehler beim Speichern');
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
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
