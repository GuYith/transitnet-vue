import Vue from 'vue'
import MapVisual from '../components/MapVisual'
import VueRouter from 'vue-router'


Vue.use(VueRouter)
const router =  new VueRouter({
    routes: [
        {
            path: '/',
            name: 'MapVisual',
            component: ()=>import('@/components/MapVisual.vue'),
        }
    ],
    mode: 'history',
    base: '/bus/'
})

export default router;