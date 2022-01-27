import Vue from 'vue'
import VueRouter from 'vue-router'
import Events from '@/views/Events/Events'
import EventsContent from '@/views/Events/EventsContent'
import EventsContentUpdate from '@/views/Events/EventsContentUpdate'
import Notfound from '@/views/NotFound'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'root',
    redirect: {name: 'events'}
  },
  {
    path: '/events',
    name: 'events',
    component: Events,
    props: true,
    children: [
      {
        path: ':id',
        name: 'events.content',
        component: EventsContent,
        props: true,
        children: [
          {
            path: 'update',
            name: 'events.content.update',
            component: EventsContentUpdate,
            props: true
          }
        ]
      }
    ]
  },
  {
    path: '*',
    name: 'notFound',
    component: Notfound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
