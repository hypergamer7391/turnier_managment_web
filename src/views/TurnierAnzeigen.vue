<template>
  <div class="container" v-if="!loading && tournament">
    <h1>Turnier: {{ tournament.name }}</h1>

    <div class="bracket">
      <div v-for="(round, roundIndex) in computedRounds" :key="roundIndex" class="round">
        <div class="round-label">{{ getRoundName(roundIndex) }}</div>

        <div v-for="(match, matchIndex) in round" :key="matchIndex" class="" >
          <div class="match" v-if="match && !(isBye(match.player1) && isBye(match.player2))">
          <div class="match-label">{{ getMatchLabel(roundIndex, matchIndex) }}</div>
          <div class="player-with-score">
            <span>{{ match.player1 }}</span>
            <span v-if="match.result1 !== undefined && match.result1 !== null && match.result1 !== ''" class="score">{{ match.result1 }}</span>
          </div>
          <span class="vs">vs</span>
          <div class="player-with-score">
            <span>{{ match.player2 }}</span>
            <span v-if="match.result2 !== undefined && match.result2 !== null && match.result2 !== ''" class="score">{{ match.result2 }}</span>
          </div>
          <div
            v-if="match.winner && match.winner !== '--- Freilos ---'"
            class="winner"
          >
            🏆 {{ match.winner }}
          </div>
          </div>
        </div>
      </div>
    </div>

  <a @click=" router.push(`/turnier/${tournament.id}/bearbeiten`);">Bearbeiten</a>
  </div>

  <div v-if="loading" class="loading">Turnier wird geladen...</div>
  <div v-if="error" class="error">{{ error }}</div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tournamentId = route.params.id
const tournament = ref(null)
const loading = ref(true)
const error = ref(null)
const totalRounds = ref(0)

async function saveChanges() {
  try {
    await axios.put(`https://turnier-managment-web-backend.onrender.com/api/tournaments/${tournament.value.id}`, {
      data: tournament.value.data
    });
    /* console.log("save", tournament.value.data) */
    
  

  } catch (err) {
    console.log(err)
  }
}

function isBye(player) {
  return !player || player.trim() === '' || player.trim() === '--- Freilos ---' 
}

function getRoundName(index) {
  const roundNames = ['Achtelfinale', 'Viertelfinale', 'Halbfinale', 'Finale'];
  const totalRounds = computedRounds.value.length;
  const nameIndex = roundNames.length - (totalRounds - index);
  if (nameIndex >= 0 && nameIndex < roundNames.length) {
    return roundNames[nameIndex];
  }
  return `Runde ${index + 1}`;
}

// Berechne automatisch Gewinner bei Freilos
function processFreilos(rounds) {
  return rounds.map((round) =>
    round.map((match) => {
   
      // Nur setzen, wenn winner noch nicht gesetzt ist!
      if (!match.winner) {
        if ((isBye(match.player1) && !isBye(match.player2))&&!match.player2.startsWith("Gewinner")) match.winner = match.player2
        else if (!isBye(match.player1) && isBye(match.player2)&&!match.player1.startsWith("Gewinner")) match.winner = match.player1
      }
      return match
    })
  )
}

// Generiere alle Runden bis Finale
const computedRounds = computed(() => {
  if (!tournament.value) return []

  // Starte IMMER nur mit der ersten Runde und generiere alles dynamisch!
  const baseRounds = processFreilos([tournament.value.data.rounds[0]])
  const allRounds = [...baseRounds]

  while (allRounds[allRounds.length - 1].length > 1) {
    const prevRound = allRounds[allRounds.length - 1];
    const nextRound = [];
    const n = prevRound.length;

    for (let i = 0; i < Math.floor(n / 2); i++) {
      const m1 = prevRound[i];
      const m2 = prevRound[n - 1 - i];
      const roundIdx = allRounds.length;
      const oldMatch = tournament.value.data.rounds[roundIdx]?.[nextRound.length];

      nextRound.push({
        player1: m1?.winner ? m1.winner : `Gewinner ${getRoundAbbr(roundIdx - 1, allRounds.length + 1)}${i + 1}`,
        player2: m2?.winner ? m2.winner : `Gewinner ${getRoundAbbr(roundIdx - 1, allRounds.length + 1)}${n - i}`,
        winner: oldMatch?.winner || null,
        result1: oldMatch?.result1 ?? '',
        result2: oldMatch?.result2 ?? ''
      });
    }

    // Falls ungerade Anzahl: Mittleres Match bekommt Freilos
    if (n % 2 === 1) {
      const m = prevRound[Math.floor(n / 2)];
      nextRound.push({
        player1: m?.winner ? m.winner : `Gewinner ${getRoundAbbr(allRounds.length - 1, allRounds.length + 1)}${Math.floor(n / 2) + 1}`,
        player2: "--- Freilos ---",
        winner: null,
        result1: oldMatch?.result1 ?? '',
        result2: oldMatch?.result2 ?? ''
      });
    }

    processFreilos([nextRound]);
    allRounds.push(nextRound);
  }
  tournament.value.data.rounds = allRounds.map(round => round.map(match => ({ ...match })))
  saveChanges()

  return allRounds

})

function getRoundAbbr(roundIndex) {
  const abbrs = ['AF', 'VF', 'HF', 'F'];
  const abbrIndex = abbrs.length - (totalRounds.value - roundIndex);
  console.log("getRoundAbbr", roundIndex, totalRounds.value, abbrIndex, abbrs[abbrIndex])
  if (abbrIndex >= 0 && abbrIndex < abbrs.length) {
    return abbrs[abbrIndex];
  }
  console.log("getRoundAbbr", roundIndex, totalRounds.value, abbrIndex, abbrs[abbrIndex])
  return `R${roundIndex + 1}_`;

}

function getMatchLabel(roundIndex, matchIndex) {
  const abbrs = ['AF', 'VF', 'HF', 'F'];
  const abbrIndex = abbrs.length - (totalRounds.value - roundIndex);
  const abbr = abbrs[abbrIndex] || `R${roundIndex + 1}`;
  return `${abbr}_${matchIndex + 1}`;
}

function getPlayerName(player) {
  if (!player) return '---'
  if (typeof player === 'string' && player.startsWith('Gewinner')) return 'tbd'
  return player
}

async function loadTournament() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`https://turnier-managment-web-backend.onrender.com/api/tournaments/${tournamentId}`)
    tournament.value = res.data
      totalRounds.value = tournament.value.data.rounds.length
  } catch (e) {
    error.value = 'Fehler beim Laden des Turniers'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTournament()
})
</script>

<style scoped>
.container {
  max-width: 90%;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.bracket {
  display: flex;
  flex-direction: column; /* <-- Ändere von row auf column */
  gap: 20px;
  overflow-x: unset;      /* Kein horizontaler Scrollbalken mehr */
}

@media (min-width: 700px) {
  .bracket {
    flex-direction: column;
    overflow-x: auto;
  }
}
.round {
  flex-shrink: 0;
  width: 90%;
  border: 1px solid #ccc;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
.round-label {
  font-weight: bold;
}
.round-label {
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.match {
  background: #f9f9fc;
  margin-bottom: 18px;
  padding: 10px 8px;
  border-radius: 8px;
  border: 2px solid #b3c6ff;
  box-shadow: 0 2px 8px rgba(100,120,180,0.08);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  transition: box-shadow 0.2s;
}

.match:hover {
  box-shadow: 0 4px 16px rgba(80,100,180,0.18);
  border-color: #5c7cfa;
}

.player {
  flex: 1 1 40%;
  text-align: center;
  font-weight: bold;
}

.player-with-score {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  flex: 1 1 40%;
  justify-content: center;
}

.score {
  background: #e6f0ff;
  border-radius: 6px;
  padding: 2px 8px;
  margin-left: 2px;
  font-size: 1em;
  color: #234;
  min-width: 22px;
  text-align: center;
}

.vs {
  color: #888;
  font-weight: normal;
  margin: 0 4px;
}

.match-label {
  flex-basis: 100%;
  text-align: center;
  margin-bottom: 2px;
}

.winner {
  flex-basis: 100%;
  color: green;
  font-weight: bold;
  text-align: center;
}

.result {
  font-size: 0.95em;
  color: #444;
  margin: 4px 0;
  text-align: center;
}

.loading,
.error {
  text-align: center;
  margin-top: 50px;
  font-weight: bold;
}
</style>
