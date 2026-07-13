import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('./pages/Home.vue') },
  { path: '/restaurants/:category', component: () => import('./pages/Restaurants.vue') },
  { path: '/menu/:shopSlug', component: () => import('./pages/Menu.vue') },
  { path: '/checkout', component: () => import('./pages/Checkout.vue') },
  { path: '/waiting', component: () => import('./pages/Waiting.vue') },
  { path: '/merchant', component: () => import('./pages/merchant/Entry.vue') },
  { path: '/merchant/new', component: () => import('./pages/merchant/NewShop.vue') },
  { path: '/merchant/dashboard', component: () => import('./pages/merchant/Dashboard.vue') },
  { path: '/merchant/dish/new', component: () => import('./pages/merchant/NewDish.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
