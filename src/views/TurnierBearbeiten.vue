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

  <div v-else class="container" v-if="tournament">
    <h1>Turnier bearbeiten: {{ tournament.name }}</h1>

    <div class="bracket">
      <div
        v-for="(round, roundIndex) in tournament.data.rounds"
        :key="roundIndex"
        class="round"
      >
        <h3>Runde {{ roundIndex + 1 }}</h3>
        <div
          v-for="(match, matchIndex) in round"
          :key="matchIndex"
          class="match"
        >
          <div class="names-row">
  <template v-if="roundIndex === 0">
    <input
      v-model="match.player1"
      class="player-name-input"
      placeholder="Spieler 1"
    />
    <span class="vs">vs</span>
    <input
      v-model="match.player2"
      class="player-name-input"
      placeholder="Spieler 2"
    />
  </template>
  <template v-else>
    <span class="player-name">{{ match.player1 || '---' }}</span>
    <span class="vs">vs</span>
    <span class="player-name">{{ match.player2 || '---' }}</span>
  </template>
</div>
          <div class="scores-row">
            <input
              v-model="match.result1"
              type="number"
              min="0"
              class="score-input"
              placeholder="0"
              :disabled="match.player1 === '--- Freilos ---' || match.player2 === '--- Freilos ---'"
              @input="onScoreInput(roundIndex, matchIndex)"
            />
            <span style="width: 24px"></span>
            <input
              v-model="match.result2"
              type="number"
              min="0"
              class="score-input"
              placeholder="0"
              :disabled="match.player1 === '--- Freilos ---' || match.player2 === '--- Freilos ---'"
              @input="onScoreInput(roundIndex, matchIndex)"
            />
          </div>
          <div v-if="match.winner" class="winner">
            Gewinner: {{ match.winner }}
          </div>
        </div>
      </div>
    </div>

    <button class="save-btn" @click="saveChanges">💾 Änderungen speichern</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

// Login-Logik
const isAdmin = ref(false);
const adminPassword = ref('');
const loginError = ref('');

function login() {
  // Beispiel-Passwort: "admin123"
  if (adminPassword.value === 'geheim') {
    isAdmin.value = true;
    loginError.value = '';
  } else {
    loginError.value = 'Falsches Passwort!';
  }
}

const route = useRoute();
const router = useRouter();
const tournament = ref(null);

function isPlaceholder(player) {
  return typeof player === 'string' && player.startsWith('Gewinner');
}

function fillNextRounds(data) {
  // Kopiere alle bisherigen Runden, damit wir die Ergebnisse retten können
  const previousRounds = data.rounds.map(round => round.map(match => ({ ...match })));
  // Runde 0 bleibt, alle weiteren werden neu aufgebaut
  let rounds = [previousRounds[0].map(match => ({ ...match }))];

  // Baue alle weiteren Runden basierend auf den Gewinnern der vorherigen Runde (Außen gegen Innen)
  while (rounds[rounds.length - 1].length > 1) {
    const prevRound = rounds[rounds.length - 1];
    const nextRound = [];
    const n = prevRound.length;
    // Hole die "alten" Matches aus previousRounds, falls vorhanden
    const oldNext = previousRounds[rounds.length] || [];

    for (let i = 0; i < Math.floor(n / 2); i++) {
      const m1 = prevRound[i];
      const m2 = prevRound[n - 1 - i];
      // Freilos-vs-Freilos-Matches überspringen
      if (
        (m1?.winner === '--- Freilos ---' || !m1?.winner) &&
        (m2?.winner === '--- Freilos ---' || !m2?.winner)
      ) continue;

      const oldMatch = oldNext[nextRound.length];
      const winner = oldMatch?.winner ?? null;
      nextRound.push({
        player1: m1?.winner || null,
        player2: m2?.winner || null,
        winner,
        result1: oldMatch?.result1 ?? '',
        result2: oldMatch?.result2 ?? ''
      });
    }

    // Falls ungerade Anzahl: Mittleres Match bekommt Freilos
    if (n % 2 === 1) {
      const m = prevRound[Math.floor(n / 2)];
      if (m?.winner !== '--- Freilos ---' && m?.winner) {
        const oldMatch = oldNext[nextRound.length];
        const winner = oldMatch?.winner ?? null;
        nextRound.push({
          player1: m.winner,
          player2: "--- Freilos ---",
          winner,
          result1: oldMatch?.result1 ?? '',
          result2: oldMatch?.result2 ?? ''
        });
      }
    }

    // Automatisch Gewinner bei Freilos setzen (wie in processFreilos)
    for (let match of nextRound) {
      if (!match.winner) {
        if (match.player1 === '--- Freilos ---' && match.player2 && match.player2 !== '--- Freilos ---') {
          match.winner = match.player2;
          match.result1 = 0;
          match.result2 = 11;
        } else if (match.player2 === '--- Freilos ---' && match.player1 && match.player1 !== '--- Freilos ---') {
          match.winner = match.player1;
          match.result1 = 11;
          match.result2 = 0;
        }
      }
    }

    rounds.push(nextRound);
  }

  data.rounds = rounds;
}

onMounted(async () => {
  const res = await axios.get(`https://turnier-managment-web-backend.onrender.com/api/tournaments/${route.params.id}`);
  tournament.value = res.data;
  // fillNextRounds(tournament.value.data); // NICHT direkt nach dem Laden aufrufen!
});

function setWinner(roundIndex, matchIndex, winner) {
  tournament.value.data.rounds[roundIndex][matchIndex].winner = winner;
  resetRoundsFrom(tournament.value.data, roundIndex);
  fillNextRounds(tournament.value.data);
}

async function saveChanges() {
  try {
    await axios.put(`https://turnier-managment-web-backend.onrender.com/api/tournaments/${tournament.value.id}`, {
      data: tournament.value.data
    });
    alert('Erfolgreich gespeichert!');
    router.push(`/turnier/${tournament.value.id}`);
    console.log('Turnier erfolgreich gespeichert:', tournament.value.data);
  } catch (err) {
    alert('Fehler beim Speichern!');
  }
}

function isSelectable(match) {
  const p1 = match.player1;
  const p2 = match.player2;
  return (
    p1 && p2 &&
    p1 !== '--- Freilos ---' &&
    p2 !== '--- Freilos ---' &&
    !match.winner
  );
}

// Neue Methode zum Verarbeiten der Punkteingabe
function updateWinnerByScore(match) {
  if (
    match.result1 !== undefined && match.result1 !== null && match.result1 !== '' &&
    match.result2 !== undefined && match.result2 !== null && match.result2 !== '' &&
    match.player1 && match.player2 &&
    match.player1 !== '--- Freilos ---' && match.player2 !== '--- Freilos ---'
  ) {
    const r1 = Number(match.result1);
    const r2 = Number(match.result2);
    if (r1 > r2) {
      match.winner = match.player1;
    } else if (r2 > r1) {
      match.winner = match.player2;
    } else {
      match.winner = null; // Bei Gleichstand kein Gewinner
    }
  } else {
    match.winner = null;
  }
}

// Automatisches Setzen des Gewinners bei Änderung der Punkte
function onScoreInput(roundIndex, matchIndex) {
  const match = tournament.value.data.rounds[roundIndex][matchIndex];
  // Automatisch fehlende Werte auf 0 setzen
  if (match.result1 !== '' && (match.result2 === '' || match.result2 === undefined || match.result2 === null)) {
    match.result2 = 0;
  }
  if (match.result2 !== '' && (match.result1 === '' || match.result1 === undefined || match.result1 === null)) {
    match.result1 = 0;
  }
  updateWinnerByScore(match);
  resetRoundsFrom(tournament.value.data, roundIndex);
  fillNextRounds(tournament.value.data);
}

// Entfernt alle Runden nach fromRound (exklusiv)
function resetRoundsFrom(data, fromRound) {
  data.rounds = data.rounds.slice(0, fromRound + 1);
}
</script>

<style scoped>
.container {
  padding: 10px;
  max-width: 100vw;
  box-sizing: border-box;
}

.bracket {
  display: flex;
  flex-direction: column; /* <--- Das sorgt für untereinander! */
  gap: 16px;
  margin-top: 12px;
  overflow-x: unset;
  flex-wrap: unset;
}

.round {
  min-width: unset;
  width: 100%;
}

.match {
  margin-bottom: 16px;
  padding: 10px 6px;
  border-radius: 8px;
  background: #f9f9fc;
  border: 1px solid #b3c6ff;
  box-shadow: 0 2px 8px rgba(100,120,180,0.06);
}

.pair {
  font-weight: bold;
}

.winner {
  margin-top: 5px;
  color: green;
}

.buttons button {
  margin-right: 10px;
  padding: 4px 8px;
}

.save-btn {
  margin-top: 20px;
  padding: 10px 18px;
  font-weight: bold;
  width: 100%;
  font-size: 1.1em;
}

.player-with-score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: bold;
  justify-content: center;
  font-size: 1em;
}

.score-input {
  width: 32px;
  padding: 2px 2px;
  font-size: 1em;
  margin-left: 2px;
  border: 1px solid #b3c6ff;
  border-radius: 4px;
  text-align: center;
}

.vs {
  color: #888;
  font-weight: normal;
  margin: 0 2px;
}

.login-container {
  max-width: 95vw;
  margin: 40px auto;
  padding: 16px;
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
  color: red;
  margin-top: 10px;
}

.names-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 4px;
}

.player-name {
  flex: 1 1 40%;
  text-align: center;
  font-weight: bold;
}

.scores-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 38px;
  margin-bottom: 6px;
}
</style>
