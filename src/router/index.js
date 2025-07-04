import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import TurnierErstellen from '../views/TurnierErstellen.vue';
import TurnierAnzeigen from '../views/TurnierAnzeigen.vue';
import TurnierBearbeiten from '../views/TurnierBearbeiten.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/turnier-erstellen', component: TurnierErstellen },
  { path: '/turnier/:id', component: TurnierAnzeigen },
  { path: '/turnier/:id/bearbeiten', component: TurnierBearbeiten },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
