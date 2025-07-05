<template>
  <div class="app-wrapper">
    <div class="überschrift">
      <h1>Impressum</h1>
    </div>

    <div class="content">
      <p><strong>Betreiber:</strong> Julius Weiling</p>
      <p><strong>Adresse:</strong><br />
        Wahrkamp 6<br />
        48653 Coesfeld</p>
      <p><strong>Kontakt:</strong><br />
        E-Mail: <a href="mailto:julius.weiling@icloud.com">julius.weiling@icloud.com</a><br />
        Telefon: +49 178 6807523</p>
      <p><strong>Verantwortlich für den Inhalt:</strong><br />
        Julius Weiling</p>
      <p><strong>Haftungsausschluss:</strong><br />
        Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.</p>
        
    </div>
    <div class="footer" style="position: fixed; bottom: 2%; left:50%; width: 100%;"><a href="/">Startseite</a></div>
  </div>
</template>

<style scoped>
.app-wrapper {
  
  color: black;
  font-family: 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 1rem;
  user-select: none;
}

.überschrift {
  margin-bottom: 2rem;

}

h1 {
  font-weight: 900;
  font-size: 2.5rem;
  letter-spacing: 0.15rem;

}

.content {
  max-width: 600px;
  line-height: 1.6;
  font-size: 1.1rem;
}

a {
  color: black;
  text-decoration: underline;
  cursor: pointer;
}

a:hover {
  color: grey;
}
</style>
