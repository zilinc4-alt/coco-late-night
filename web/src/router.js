import { createRouter, createWebHashHistory } from 'vue-router'

const TITLE = 'COCO 的深夜食堂'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('./pages/Home.vue'), meta: { title: '今晚想点外卖吗？' } },
  { path: '/restaurants/:category', component: () => import('./pages/Restaurants.vue'), meta: { title: '附近这些店还开着' } },
  { path: '/menu/:shopSlug', component: () => import('./pages/Menu.vue'), meta: { title: '店铺菜单' } },
  { path: '/checkout', component: () => import('./pages/Checkout.vue'), meta: { title: '确认今晚这单' } },
  { path: '/waiting', component: () => import('./pages/Waiting.vue'), meta: { title: '骑手正在赶来' } },
  { path: '/merchant', component: () => import('./pages/merchant/Entry.vue'), meta: { title: '我是店家' } },
  { path: '/merchant/new', component: () => import('./pages/merchant/NewShop.vue'), meta: { title: '新开小店' } },
  { path: '/merchant/dashboard', component: () => import('./pages/merchant/Dashboard.vue'), meta: { title: '店家后台' } },
  { path: '/merchant/dish/new', component: () => import('./pages/merchant/NewDish.vue'), meta: { title: '新增菜品' } },
  { path: '/merchant/edit', component: () => import('./pages/merchant/EditShop.vue'), meta: { title: '编辑店铺信息' } },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const pageTitle = to.meta?.title
  document.title = pageTitle ? `${pageTitle} · ${TITLE}` : TITLE
})

export default router
