<template>
    <div class="page">
        <main class="main">
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <!-- <button class="back-btn" @click="goBack">← Zurück</button> -->

                    <div class="header-top">
                        <div class="header-info">
                            <div class="title-row">
                                <h1 class="title">{{ tournament.title }}</h1>
                                <span :class="['status-badge', getStatusColor()]">
                                    {{ getStatusText() }}
                                </span>
                            </div>
                            <p class="subtitle">{{ tournament.game }}</p>
                            <p class="description">{{ tournament.description }}</p>
                        </div>

                        <div class="header-actions">
                            <!-- <button class="btn" @click="copyInviteLink">🔗 Link kopieren</button> -->
                            <button class="btn primary" @click="router.push(`/turnier/${tournament.id}/bearbeiten`)">🏆
                                Verwalten</button>
                            <button class="btn primary" @click="exportBracketAsPDF"> Als PDF herunterladen</button>
                        </div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div class="info-grid">
                    <div class="info-card">
                        👥
                        <div>
                            <p class="info-label">Teilnehmer</p>
                            <p class="info-value">{{ tournament.participants
                                }}<!-- /{{ tournament.maxParticipants }} --></p>
                        </div>
                    </div>

                    <div class="info-card">
                        📅
                        <div>
                            <p class="info-label">Start</p>
                            <p class="info-value">{{ tournament.startDate }}</p>
                        </div>
                    </div>

                    <!-- <div class="info-card">
                        ⏰
                        <div>
                            <p class="info-label">Uhrzeit</p>
                            <p class="info-value">{{ tournament.startTime }}</p>
                        </div>
                    </div> -->

                    <!-- <div class="info-card">
                        🏆
                        <div>
                            <p class="info-label">Format</p>
                            <p class="info-value">{{ tournament.format }}</p>
                        </div>
                    </div> -->
                </div>

                <!-- Tabs -->
                <div>
                    <div class="tabs">
                        <button v-for="tab in tabs" :key="tab" class="tab-btn" :class="{ active: selectedTab === tab }"
                            @click="selectTab(tab)">
                            {{ tab === 'participants' ? 'Teilnehmer' : tab === 'matches' ? 'Spiele' : 'Bracket' }}
                        </button>
                    </div>

                    <!-- Teilnehmer -->
                    <div v-if="selectedTab === 'participants'" class="tab-content">
                        <div class="card">
                            <div class="card-header">Teilnehmer ({{ tournament.participants }}/{{
                                tournament.maxParticipants }})</div>
                            <div class="card-body">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>

                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(p, i) in participants" :key="i">
                                            <td>{{ p.name }}</td>

                                            <td>
                                                <span class="status"
                                                    :class="playerStatuses[p.name]?.text?.startsWith('Ausgeschieden') ? 'status-out' : 'status-confirmed'">
                                                    {{ playerStatuses[p.name]?.text || "Unbekannt" }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Spiele -->
                    <div v-if="selectedTab === 'matches'" class="tab-content">
                        <div class="card">
                            <div class="card-header">Spiele</div>
                            <div class="card-body table-wrapper">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Runde</th>
                                            <th class="desktop-only">Spieler 1</th>
                                            <th class="desktop-only">Spieler 2</th>
                                            <th class="mobile-only">Spieler</th>
                                            <th>Ergebnis</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(m, i) in flattenedMatches" :key="i">
                                            <td>{{ m.round }}</td>

                                            <!-- Desktop: zwei Spalten -->
                                            <td class="desktop-only">{{ m.player1 }}</td>
                                            <td class="desktop-only">{{ m.player2 }}</td>

                                            <!-- Mobile: beide Spieler untereinander -->
                                            <td class="mobile-only">
                                                <div>{{ m.player1 }}</div>
                                                <div>{{ m.player2 }}</div>
                                            </td>

                                            <td class="mono">{{ m.score }}</td>
                                            <td>
                                                <span class="status"
                                                    :class="m.status === 'finished' ? 'status-confirmed' : m.status === 'upcoming' ? 'status-upcoming' : 'status-pending'">
                                                    {{ m.status === 'finished' ? 'Beendet' : m.status === 'upcoming' ?
                                                    'Anstehend' : 'Ausstehend' }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Bracket -->
                    <div v-if="selectedTab === 'bracket'" class="tab-content">
                        <div class="card">
                            <div class="card-header">Turnier-Bracket</div>
                            <div class="card-body">
                                <pre>{{ computedRounds }}</pre> <!-- Nur zum Test -->
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="js">
import { ref, computed } from "vue";  // ⬅️ computed hinzugefügt
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import jsPDF from "jspdf";

defineProps(['id'])

const route = useRoute();
const router = useRouter();
const id = route.params.id || "unknown";

const tabs = ["participants", "matches"/* , "bracket" */];
const selectedTab = ref("participants");
const tournament = ref({});
const loading = ref(true);
const error = ref(null);


const participants = ref([]);
const matches = ref([]);


const roundNames = ["Viertelfinale", "Halbfinale", "Finale"];


const flattenedMatches = computed(() => {
    if (!computedRounds.value) return [];

    return computedRounds.value.flatMap((round, rIndex) =>
        round
            .map((match, mIndex) => {
                // Beide Freilos -> überspringen
                if (match.player1 === "--- Freilos ---" && match.player2 === "--- Freilos ---") {
                    return null;
                }

                // Ein Spieler Freilos -> sofort beenden
                // Ein Spieler Freilos -> prüfen ob der andere ein echter Spieler ist
                if (match.player1 === "--- Freilos ---") {
                    const isReal = match.player2 && !match.player2.startsWith("Gewinner");
                    return {
                        round: `${getRoundAbbr(rIndex)}/${mIndex + 1}`,
                        player1: match.player1,
                        player2: match.player2,
                        score: "-",
                        status: isReal ? "finished" : "upcoming",
                    };
                }
                if (match.player2 === "--- Freilos ---") {
                    const isReal = match.player1 && !match.player1.startsWith("Gewinner");
                    return {
                        round: `${getRoundAbbr(rIndex)}/${mIndex + 1}`,
                        player1: match.player1,
                        player2: match.player2,
                        score: "-",
                        status: isReal ? "finished" : "upcoming",
                    };
                }


                let score = "";

                if (match.result1 || match.result2) {
                    score = `${match.result1} - ${match.result2}`;

                }
                else {
                    score = "-";

                }
                console.log("Match:", match, "Score:", score);

                // Normales Match
                return {
                    round: `${getRoundAbbr(rIndex)}/${mIndex + 1}`,
                    player1: match.player1,
                    player2: match.player2,
                    score: score,
                    status: match.winner ? "finished" : "upcoming",
                };
            })
            .filter(Boolean) // nulls (doppelte Freilos) rausfiltern
    );
});



// reactive Variable für die Gesamtanzahl der Runden
const totalRounds = ref(0);

const allRounds = ref([]);

const computedRounds = computed(() => {
    if (!tournament.value?.data?.rounds) return [];

    // 1. Erste Runde vorbereiten (inkl. Freilos)
    const baseRounds = processFreilos([tournament.value.data.rounds[0]]);
    const rounds = [...baseRounds];

    while (rounds[rounds.length - 1].length > 1) {
        const prev = rounds.at(-1);
        const next = [];
        const n = prev.length;

        for (let i = 0; i < Math.floor(n / 2); i++) {
            const m1 = prev[i];
            const m2 = prev[n - 1 - i];
            const old = tournament.value.data.rounds[rounds.length]?.[next.length] ?? {};

            next.push({
                player1: m1?.winner ?? `Gewinner ${getRoundAbbr(rounds.length - 1)}/${i + 1}`,
                player2: m2?.winner ?? `Gewinner ${getRoundAbbr(rounds.length - 1)}/${n - i}`,
                winner: old.winner ?? null,
                result1: old.result1 ?? '',
                result2: old.result2 ?? '',
            });
        }

        // Ungerade Anzahl ⇒ Freilos
        if (n % 2 === 1) {
            const m = prev[Math.floor(n / 2)];
            const old = tournament.value.data.rounds[rounds.length]?.[next.length] ?? {};
            next.push({
                player1: m?.winner ?? `Gewinner ${getRoundAbbr(rounds.length - 1)}${Math.floor(n / 2) + 1}`,
                player2: '--- Freilos ---',
                winner: old.winner ?? null,
                result1: old.result1 ?? '',
                result2: old.result2 ?? ''
            });
        }

        processFreilos([next]);
        rounds.push(next);
    }

    allRounds.value = rounds.map(r => r.map(m => ({ ...m })));
    totalRounds.value = allRounds.value.length;

    return allRounds.value;
});

const playerStatuses = computed(() => {
    const status = {};

    if (!computedRounds.value.length) return status;

    computedRounds.value.forEach((round, rIndex) => {
        round.forEach((match, mIndex) => {
            const roundName = getRoundName(rIndex);

            // Beide Spieler mit Status versehen
            [match.player1, match.player2].forEach(player => {
                if (!player || player === "--- Freilos ---") return;

                if (!status[player]) {
                    status[player] = { text: `Aktuell in ${roundName}`, roundIndex: rIndex };
                }
            });

            // Wenn es einen Sieger gibt → Verlierer als "ausgeschieden" markieren
            if (match.winner) {
                const loser =
                    match.winner === match.player1 ? match.player2 : match.player1;

                if (loser && loser !== "--- Freilos ---") {
                    status[loser] = { text: `Ausgeschieden im ${roundName}`, roundIndex: rIndex };
                }

                // Siegerstatus updaten (falls noch aktiv)
                status[match.winner] = { text: `Aktuell in ${getRoundName(rIndex + 1)}`, roundIndex: rIndex + 1 };
            }
        });
    });

    // Am Ende: Gewinner bestimmen (Finalrunde Sieger)
    const finalRound = computedRounds.value.at(-1);
    if (finalRound?.[0]?.winner) {
        const champ = finalRound[0].winner;
        status[champ] = { text: "🏆 Gewinner", roundIndex: totalRounds.value };
    }

    return status;
});

function getRoundAbbr(roundIndex) {
    if (roundIndex === totalRounds.value - 4) return "AF";
    if (roundIndex === totalRounds.value - 3) return "VF";
    if (roundIndex === totalRounds.value - 2) return "HF";
    if (roundIndex === totalRounds.value - 1) return "F";
    return `R${roundIndex + 1}`;
}

function getRoundName(roundIndex) {
    if (roundIndex === totalRounds.value - 4) return "Achtelfinale";
    if (roundIndex === totalRounds.value - 3) return "Viertelfinale";
    if (roundIndex === totalRounds.value - 2) return "Halbfinale";
    if (roundIndex === totalRounds.value - 1) return "Finale";
    return `Runde ${roundIndex + 1}`;
}



// Freilos-Logik: wenn ein Match mit "Freilos", Gewinner automatisch setzen
function processFreilos(rounds) {
    rounds.forEach((round) => {
        round.forEach((match) => {
            if (match.player2 === "--- Freilos ---") {
                match.winner = match.player1;
            }
        });
    });
    return rounds;
}

/* // Turnier speichern (Dummy / API-Call)
async function saveChanges() {
    try {
        // Beispiel: Änderungen an Backend senden
        await axios.post(`/api/tournaments/${id}/save`, {
            data: tournament.value.data,
        });
        console.log("Änderungen gespeichert");
    } catch (err) {
        console.error("Speichern fehlgeschlagen", err);
    }
} */


function selectTab(tab) {
    selectedTab.value = tab;
}



async function loadTournament() {
    /* loading.value = true */
    try {
        const res = await axios.get(
            `https://turnier-managment-web-backend.onrender.com/api/tournaments/${id}`
        )


        console.log('Turnier geladen:', res.data)
        totalRounds.value = res.data.data.rounds.length
        tournament.value = res.data
        participants.value = res.data.data.rounds[0]
            .flatMap(match => {
                const players = [match.player1, match.player2];
                // Filtert Spieler mit dem Namen 'freilos' raus
                return players
                    .filter(player => player && player !== '--- Freilos ---')
                    .map(player => ({
                        name: player,

                        status: 'confirmed' // Beispielstatus
                    }));
            });

        res.data.data.rounds.forEach((round, roundIndex) => {
            round.forEach(match => {
                // Prüfen ob beide Spieler Freilos sind
                if (
                    match.player1 === '--- Freilos ---' &&
                    match.player2 === '--- Freilos ---'
                ) {
                    return; // dieses Match überspringen
                }

                matches.value.push({
                    round: roundNames[roundIndex] || `Runde ${roundIndex + 1}`,
                    player1: match.player1,
                    player2: match.player2,
                    score: `${match.result1 ?? ""}:${match.result2 ?? ""}`,
                    status: match.winner ? "finished" : "upcoming"
                });
            });
        });




        console.log('Teilnehmer:', participants.value)
        console.log('Runden:', tournament.value.data.rounds)
        console.log('Typ:', Array.isArray(tournament.value.data.rounds))
        console.log('Länge:', tournament.value.data.rounds.length)

    } catch (e) {
        console.error('Fehler beim Laden des Turniers:', e)
        /* error.value = 'Fehler beim Laden des Turniers' */
    } finally {
        /*   loading.value = false */
    }
}

async function exportBracketAsPDF() {
    if (!tournament.value || !tournament.value.data?.rounds) return

    const rounds = computedRounds.value;
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

loadTournament();
console.log('Turnier:', tournament.value);



const statusMap = {
    active: { text: "Aktiv", color: "status-green" },
    upcoming: { text: "Bevorstehend", color: "status-yellow" },
    finished: { text: "Beendet", color: "status-gray" },
};

function getStatusColor() {
    return statusMap[tournament.status]?.color || "status-default";
}

function getStatusText() {
    if (!tournament.value.status) {
        return "Lade Turnier...";
    }
    return statusMap[tournament.value.status]?.text || "Status";
}


function copyInviteLink() {
    if (navigator.clipboard && tournament.inviteLink) {
        navigator.clipboard.writeText(tournament.inviteLink);
    } else {
        alert("Kopieren nicht möglich!");
    }
}

function goBack() {
    window.history.back();
}
</script>


<style>
/* Layout */
.page {
    min-height: 100vh;
    background: #f8f9fa;
}

.main {
    padding: 5rem 1.5rem 2rem;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
}

/* Header */
.header {
    margin-bottom: 2rem;
}

.back-btn {
    margin-bottom: 1rem;
    padding: 0.3rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    font-size: 0.9rem;
    cursor: pointer;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.title {
    font-size: 2rem;
    font-weight: bold;
}

.subtitle {
    font-size: 1.2rem;
    color: #555;
}

.description {
    color: #666;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.btn {
    padding: 0.4rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
}

.btn.primary {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

/* Status */
.status-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
}

.status-green {
    background: #28a745;
    color: white;
}

.status-yellow {
    background: #ffc107;
    color: black;
}

.status-gray {
    background: #6c757d;
    color: white;
}

.status-default {
    background: #e0e0e0;
    color: black;
}

/* Info Cards */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.info-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
}

.info-label {
    font-size: 0.85rem;
    color: #666;
}

.info-value {
    font-size: 1.2rem;
    font-weight: bold;
}

/* Tabs */
.tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid #ddd;
    margin-bottom: 1rem;
}

.tab-btn {
    padding: 0.6rem;
    text-align: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #666;
}

.tab-btn.active {
    border-bottom: 2px solid #007bff;
    font-weight: bold;
    color: black;
}

/* Cards */
.card {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
}

.card-header {
    padding: 0.8rem;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
}

.card-body {
    padding: 1rem;
}

.muted {
    font-size: 0.9rem;
    color: #777;
}

/* Tables */
.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 0.3rem;
    border-bottom: 1px solid #eee;
    text-align: left;
}

.table th {
    font-weight: bold;
    background: #fafafa;
}

.mono {
    font-family: monospace;
}

/* Status Labels */
.status {
    padding: 0.2rem 0.3rem;
    border-radius: 4px;
    font-size: 0.75rem;
}

.status-confirmed {
    background: #007bff;
    color: white;
}

.status-out {
    background: #ff2929;
    color: white;
}

.status-pending {
    background: #ccc;
    color: black;
}

.status-upcoming {
    background: #eee;
    border: 1px solid #bbb;
}

/* Nur auf Desktop sichtbar */
.desktop-only {
  display: table-cell;
}

/* Nur auf Mobile sichtbar */
.mobile-only {
  display: none;
}

/* Ab 768px runter → Mobile Style */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: table-cell;
  }
}

/* .table-wrapper {
  width: 100%;
  overflow-x: auto;   /* Scrollbar nur, wenn nötig 
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto; /* passt Spalten an 
} */

</style>
