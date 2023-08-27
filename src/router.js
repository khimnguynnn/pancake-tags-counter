import {createRouter,createWebHistory} from "vue-router"
import {StoreToken} from "./store.js"


const routes = [
    {path: '/', component: () => import('./components/HomeView.vue')},
    {path: '/dashboard', component: () => import('./components/DashboardView.vue'), meta: { requiresAuth: true }},
    {path: '/:id/tags', component: () => import('./components/TagCounter.vue'), meta: { requiresAuth: true },props: true,}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const store = StoreToken()
    if (to.meta.requiresAuth && !store.isAuthenticated ) {
        next("/");
    } else {
        next();
    }
});

export default router;