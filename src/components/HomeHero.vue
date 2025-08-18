<template>
  <section class="hero">
    <div class="container">
      <div class="intro">
        <h1>Private Turniere<br />einfach organisiert</h1>
        <p>Erstelle private Turniere und lade Teilnehmer per Link ein. Sicher und ohne öffentliche Einsicht.</p>
      </div>

      <div class="buttons">
        <button @click="router.push({ path: 'turnier-erstellen' })" class="primary-btn">
          <span class="icon"></span>
          Turnier erstellen
        </button>
        <!-- <button class="outline-btn">
          <span class="icon"></span>
          Per Link beitreten
        </button> -->
      </div>

      <div class="features">
        <div class="feature-card">
          <div class="feature-title">Privat</div>
          <div class="feature-desc">Nur eingeladene Teilnehmer</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Einfach</div>
          <div class="feature-desc">Turnier per Link teilen</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Sicher</div>
          <div class="feature-desc">Keine öffentliche Einsicht</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #0d0d0d;
  padding: 0 1.5rem;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}

.intro h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #0d0d0d;
}

@media(min-width: 768px) {
  .intro h1 {
    font-size: 3.75rem;
  }
}

.intro p {
  font-size: 1rem;
  max-width: 640px;
  margin: 0 auto 2rem auto;
  color: #666666;
}

@media(min-width: 768px) {
  .intro p {
    font-size: 1.25rem;
  }
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

@media(min-width: 640px) {
  .buttons {
    flex-direction: row;
  }
}

.primary-btn {
  background-color: #0A3976;
  color: #ffffff;
  padding: 1.5rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: #1c3b8f;
}

.outline-btn {
  background-color: #ffffff;
  color: #1e3a8a;
  border: 2px solid #1e3a8a;
  padding: 1.5rem 2rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.outline-btn:hover {
  background-color: #f3f4f6;
}

.icon {
  font-size: 1.25rem;
}

/* Features */
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 640px;
  margin: 0 auto;
}

@media(min-width: 500px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0A3976;
}

.feature-desc {
  font-size: 0.875rem;
  color: #666666;
}
</style>

<script lang="js" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>