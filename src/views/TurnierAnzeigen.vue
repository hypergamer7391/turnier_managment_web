<template>
  <div class="container" v-if="!loading && tournament">
    <h1>Turnier: {{ tournament.name }}</h1>

    <!-- TURNIERBAUM -->
    <div class="bracket">
      <div v-for="(round, roundIndex) in computedRounds" :key="roundIndex" class="round">
        <div class="round-label">{{ getRoundName(roundIndex) }}</div>

        <div
          v-for="(match, matchIndex) in round"
          :key="matchIndex"
        >
          <div
            class="match"
            v-if="match && !(isBye(match.player1) && isBye(match.player2))"
          >
            <div class="match-label">{{ getMatchLabel(roundIndex, matchIndex) }}</div>

            <div class="player-with-score">
              <span class="player-clickable" @click="openPlayerPopup(match.player1)">{{ match.player1 }}</span>

              <span
                v-if="match.result1 !== undefined && match.result1 !== null && match.result1 !== ''"
                class="score"
              >{{ match.result1 }}</span>
            </div>

            <span class="vs">vs</span>

            <div class="player-with-score">
              <span class="player-clickable" @click="openPlayerPopup(match.player2)">{{ match.player2 }}</span>

              <span
                v-if="match.result2 !== undefined && match.result2 !== null && match.result2 !== ''"
                class="score"
              >{{ match.result2 }}</span>
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

    <!-- AKTIONS‑LEISTE -->
    <div class="actions">
      <button @click="router.push(`/turnier/${tournament.id}/bearbeiten`)">
        ✏️ Bearbeiten
      </button>
      <button @click="exportBracketAsPDF">
        📄 Als PDF herunterladen
      </button>
    </div>
  </div>

  <!-- Lade‑/Fehler‑States -->
  <div v-if="loading" class="loading">Turnier wird geladen …(bis zu 1 Minute)</div>
  <div v-if="error" class="error">{{ error }}</div>

  <!-- Spieler Stats Popup -->
<div v-if="showPlayerPopup" class="popup-overlay" @click.self="closePlayerPopup">
  <div class="popup-content">
    <h2>Alle Spiele von: {{ selectedPlayer }}</h2>
    <table>
      <thead>
        <tr>
          <th>Runde</th>
          <th>Match</th>
          <th>Spieler 1</th>
          <th>Ergebnis</th>
          <th>Spieler 2</th>
          <th>Gewinner</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(m, i) in playerMatches" :key="i">
          <td>{{ getRoundName(m.roundIndex) }}</td>
          <td>{{ getMatchLabel(m.roundIndex, m.matchIndex) }}</td>
          <td>{{ m.player1 }}</td>
          <td>{{ m.result1 }} : {{ m.result2 }}</td>
          <td>{{ m.player2 }}</td>
          <td>{{ m.winner ?? '–' }}</td>
        </tr>
      </tbody>
    </table>
    <button @click="closePlayerPopup">Schließen</button>
  </div>
</div>

</template>

<script setup>
/* ------------------------------------------------------------------ */
/* Imports                                                            */
/* ------------------------------------------------------------------ */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

/* PDF‑Libs */
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const showPlayerPopup = ref(false)
const selectedPlayer = ref('')
const playerMatches = ref([])

// Spieler-Popup öffnen und alle Matches mit dem Spieler sammeln
function openPlayerPopup(playerName) {
  if (!playerName || playerName.trim() === '' || playerName === '--- Freilos ---') return

  selectedPlayer.value = playerName

  // Alle Matches aus allen Runden filtern, bei denen der Spieler mitspielt
  playerMatches.value = []
  computedRounds.value.forEach((round, roundIndex) => {
    round.forEach((match, matchIndex) => {
      if (match.player1 === playerName || match.player2 === playerName) {
        playerMatches.value.push({
          roundIndex,
          matchIndex,
          player1: match.player1,
          player2: match.player2,
          result1: match.result1,
          result2: match.result2,
          winner: match.winner
        })
      }
    })
  })

  showPlayerPopup.value = true
}

function closePlayerPopup() {
  showPlayerPopup.value = false
  selectedPlayer.value = ''
  playerMatches.value = []
}

/* ------------------------------------------------------------------ */
/* Routing / State                                                    */
/* ------------------------------------------------------------------ */
const route        = useRoute()
const router       = useRouter()
const tournamentId = route.params.id

const tournament   = ref(null)
const loading      = ref(true)
const error        = ref(null)
const totalRounds  = ref(0)

/* ------------------------------------------------------------------ */
/* Helfer                                                             */
/* ------------------------------------------------------------------ */
function isBye (player) {
  return !player || player.trim() === '' || player.trim() === '--- Freilos ---'
}

function getRoundName (index) {
  const map        = ['Achtelfinale', 'Viertelfinale', 'Halbfinale', 'Finale']
  const nameIndex  = map.length - (computedRounds.value.length - index)
  return map[nameIndex] ?? `Runde ${index + 1}`
}

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

/* ------------------------------------------------------------------ */
/* Turnier‑Daten laden + verarbeiten                                  */
/* ------------------------------------------------------------------ */
async function loadTournament () {
  loading.value = true
  try {
    const res       = await axios.get(
      `https://turnier-managment-web-backend.onrender.com/api/tournaments/${tournamentId}`
    )
    
  
    console.log('Turnier geladen:', res.data.data)
    totalRounds.value = res.data.data.rounds.length
    tournament.value  = res.data
    console.log('Runden:', tournament.value.data.rounds)
console.log('Typ:', Array.isArray(tournament.value.data.rounds))
console.log('Länge:', tournament.value.data.rounds.length)

  } catch (e) {
    error.value = 'Fehler beim Laden des Turniers'
  } finally {
    loading.value = false
  }
}

function processFreilos (rounds) {
  return rounds.map(round =>
    round.map(match => {
      if (!match.winner) {
        if (isBye(match.player1) && !isBye(match.player2) && !match.player2.startsWith('Gewinner')) {
          match.winner = match.player2
        } else if (!isBye(match.player1) && isBye(match.player2) && !match.player1.startsWith('Gewinner')) {
          match.winner = match.player1
        }
      }
      return match
    })
  )
}

const computedRounds = computed(() => {
  if (!tournament.value) return []

  /* Dynamisch Runden bauen, beginnend mit der 1. */
  const baseRounds = processFreilos([tournament.value.data.rounds[0]])
  const allRounds  = [...baseRounds]

  while (allRounds[allRounds.length - 1].length > 1) {
    const prevRound = allRounds.at(-1)
    const nextRound = []
    const n         = prevRound.length

    for (let i = 0; i < Math.floor(n / 2); i++) {
      const m1      = prevRound[i]
      const m2      = prevRound[n - 1 - i]
      const roundIx = allRounds.length
      const old     = tournament.value.data.rounds[roundIx]?.[nextRound.length]

      nextRound.push({
        player1: m1?.winner ? m1.winner : `Gewinner ${getRoundAbbr(roundIx - 1)}${i + 1}`,
        player2: m2?.winner ? m2.winner : `Gewinner ${getRoundAbbr(roundIx - 1)}${n - i}`,
        winner : old?.winner  ?? null,
        result1: old?.result1 ?? '',
        result2: old?.result2 ?? ''
      })
    }

    /* ungerade Anzahl ⇒ Freilos */
    if (n % 2 === 1) {
      const m        = prevRound[Math.floor(n / 2)]
      const old      = tournament.value.data.rounds[allRounds.length]?.[nextRound.length]
      nextRound.push({
        player1: m?.winner ? m.winner : `Gewinner ${getRoundAbbr(allRounds.length - 1)}${Math.floor(n / 2) + 1}`,
        player2: '--- Freilos ---',
        winner : null,
        result1: old?.result1 ?? '',
        result2: old?.result2 ?? ''
      })
    }

    processFreilos([nextRound])
    allRounds.push(nextRound)
  }

  tournament.value.data.rounds = allRounds.map(r => r.map(m => ({ ...m })))
  saveChanges()
  totalRounds.value = allRounds.length
  return allRounds
})

/* ------------------------------------------------------------------ */
/* PDF‑Export                                                         */
/* ------------------------------------------------------------------ */
async function exportBracketAsPDF() {
  if (!tournament.value || !tournament.value.data?.rounds) return

  const rounds = tournament.value.data.rounds
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const columnGap = 5
  const matchHeight = 14  // Platz für Text
  const headerHeight = 12

  const half = Math.ceil(rounds.length / 2)
  const pages = [
    rounds.slice(0, half),
    rounds.slice(half),
  ]

  pdf.setFont('helvetica')
  pdf.setFontSize(10)

  pages.forEach((pageRounds, pageIndex) => {
    if (pageIndex > 0) pdf.addPage()

    const pageMarginX = margin
    const pageWidth = pdfWidth - 2 * margin
    const columnWidth = (pageWidth - (pageRounds.length - 1) * columnGap) / pageRounds.length

    pageRounds.forEach((round, roundIndex) => {
      const x = pageMarginX + (columnWidth + columnGap) * roundIndex

      // Runde als Überschrift
      pdf.setFont(undefined, 'bold')
      pdf.text(getRoundName(roundIndex + (pageIndex * half)), x + columnWidth / 2, margin, { align: 'center' })

      pdf.setFont(undefined, 'normal')

      round.forEach((match, matchIndex) => {
        const y = margin + headerHeight + matchIndex * matchHeight
        if (y + matchHeight > pdfHeight - margin) return

        // Match Box
        pdf.setDrawColor(180)
        pdf.setLineWidth(0.3)
        pdf.rect(x, y - 9, columnWidth, matchHeight - 3)

        // Spieler 1 links oben - grün, wenn Gewinner
        if (match.winner && match.winner === match.player1) {
          pdf.setTextColor(0, 128, 0)
        } else {
          pdf.setTextColor(0, 0, 0)
        }
        pdf.text(match.player1 || '---', x + 2, y - 3)

        // vs mittig oben
        pdf.setTextColor(100)
        pdf.text('vs', x + columnWidth / 2, y - 3, { align: 'center' })

        // Spieler 2 rechts oben - grün, wenn Gewinner
        if (match.winner && match.winner === match.player2) {
          pdf.setTextColor(0, 128, 0)
        } else {
          pdf.setTextColor(0, 0, 0)
        }
        pdf.text(match.player2 || '---', x + columnWidth - 2, y - 3, { align: 'right' })

        // Schriftfarbe zurücksetzen
        pdf.setTextColor(0, 0, 0)
      })
    })
  })

  pdf.save(`turnier_${tournament.value.name || 'bracket'}.pdf`)
}

/* ------------------------------------------------------------------ */
/* Init                                                               */
/* ------------------------------------------------------------------ */
onMounted(loadTournament)
</script>

<style scoped>
/* Layout */
.container {
  max-width: 90%;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.bracket {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Runden */
.round {
  width: 90%;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
.round-label {
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

/* Matches */
.match {
  background: #f9f9fc;
  margin-bottom: 18px;
  padding: 10px 8px;
  border-radius: 8px;
  border: 2px solid #b3c6ff;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  transition: box-shadow 0.2s;
}
.match:hover {
  box-shadow: 0 4px 16px rgba(80, 100, 180, 0.18);
  border-color: #5c7cfa;
}
.player-with-score { display: flex; gap: 6px; font-weight: bold; }
.score            { background: #e6f0ff; padding: 2px 8px; border-radius: 6px; }

/* Kleinkram */
.vs        { color: #888; }
.match-label,.winner { flex-basis: 100%; text-align: center; }
.winner    { color: green; font-weight: bold; }

.loading,.error { text-align: center; margin-top: 50px; font-weight: bold; }

/* Button‑Leiste */
.actions {
  margin-top: 15px;
  display: flex;
  gap: 12px;
}
.actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #5c7cfa;
  color: white;
  font-weight: bold;
}
.actions button:hover { background: #4755d4; }

.player-clickable {
  cursor: pointer;
  color: black;
  text-decoration: underline;
}

.popup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  padding: 24px;
  border-radius: 10px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  text-align: center;
}

.popup-content button {
  margin-top: 20px;
  padding: 8px 16px;
  background: #3b82f6;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.popup-content button:hover {
  background: #2563eb;
}

.popup-content table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.popup-content th,
.popup-content td {
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 0.9em;
}

.popup-content th {
  background-color: #f3f4f6;
  font-weight: bold;
}

</style>
