import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import User from '../views/User.vue'
import Users from '../views/Users.vue'
import Line from '../views/Line.vue'
import Record from '../views/Record.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/user',
    name: 'User',
    component: User
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/line',
    name: 'Line',
    component: Line
  },
  {
    path: '/record',
    name: 'Record',
    component: Record
  },

]

const router = new VueRouter({
  routes
})

export default router
