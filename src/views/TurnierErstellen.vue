

<template>
  <div class="container">
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
    const res = await axios.post('http://localhost:3000/api/tournaments', {
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
</style>
