import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPassword.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('../layouts/DefaultLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'users',
          meta: { title: '用户管理' },
          component: () => import('../views/users/UserList.vue')
        },
        {
          path: 'users/detail/:userId',
          name: 'userDetail',
          meta: { title: '用户详情', parentMenu: 'users' },
          component: () => import('../views/users/UserDetail.vue'),
          props: true
        },
        {
          path: 'users/auth/:userId',
          name: 'userAuthDetail',
          meta: { title: '用户认证详情', parentMenu: 'users' },
          component: () => import('../views/users/UserAuthDetail.vue'),
          props: true
        },
        {
          path: 'posts',
          name: 'posts',
          meta: { title: '动态管理' },
          component: () => import('../views/posts/PostList.vue')
        },
        {
          path: 'posts/detail',
          name: 'postDetail',
          meta: { title: '动态详情', parentMenu: 'posts' },
          component: () => import('../views/posts/PostDetail.vue')
        },
        {
          path: 'tags',
          name: 'tags',
          meta: { title: '标签管理' },
          component: () => import('../views/tags/TagList.vue')
        },
        {
          path: 'reports',
          name: 'reports',
          meta: { title: '举报管理' },
          component: () => import('../views/reports/ReportList.vue')
        },
        {
          path: 'reports/:id',
          name: 'reportDetail',
          meta: { title: '举报详情', parentMenu: 'reports' },
          component: () => import('../views/reports/ReportDetail.vue'),
          props: true
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router 