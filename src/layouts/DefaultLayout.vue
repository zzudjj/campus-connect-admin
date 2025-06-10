<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, Document, DataLine, Platform, Fold, Expand, CaretBottom, Warning, Collection, DocumentChecked } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)
const activeMenu = ref('dashboard')
const showUserMenu = ref(false)

// 计算当前菜单项
const currentMenuItem = computed(() => {
  // 检查是否有父菜单
  if (route.meta.parentMenu) {
    const parentPath = `/${route.meta.parentMenu}`;
    const parentItem = menuItems.find(item => item.path === parentPath);
    if (parentItem) return parentItem;
  }
  // 直接匹配当前路径
  return menuItems.find(item => item.path === route.path) || menuItems[0];
});

// 计算当前页面标题
const pageTitle = computed(() => {
  return route.meta.title || currentMenuItem.value.title;
});

// 更新 activeMenu
const updateActiveMenu = () => {
  // 使用父菜单或当前菜单的index
  if (route.meta.parentMenu) {
    activeMenu.value = route.meta.parentMenu;
  } else {
    activeMenu.value = currentMenuItem.value.index;
  }
}

// 监听路由变化
router.beforeEach((to, from, next) => {
  cleanupDOM(); // 路由切换前清理DOM
  next();
});

router.afterEach(() => {
  updateActiveMenu();
  cleanupDOM(); // 路由切换后再次清理DOM
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'custom-message-box',
    confirmButtonClass: 'custom-confirm-button',
    cancelButtonClass: 'custom-cancel-button',
    center: true,
    roundButton: true,
    draggable: true,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    showClose: true,
    distinguishCancelAndClose: true,
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '退出中...'
        setTimeout(() => {
          done()
        }, 500)
      } else {
        done()
      }
    }
  }).then(() => {
    localStorage.removeItem('token')
    router.push('/login')
  }).catch(() => {
    // 用户取消操作
  })
}

const menuItems = [
  {
    index: 'dashboard',
    icon: 'DataLine',
    title: '仪表盘',
    path: '/'
  },
  {
    index: 'users',
    icon: 'User',
    title: '用户管理',
    path: '/users'
  },
  {
    index: 'posts',
    icon: 'Document',
    title: '动态管理',
    path: '/posts'
  },
  {
    index: 'tags',
    icon: 'Collection',
    title: '标签管理',
    path: '/tags'
  },
  {
    index: 'reports',
    icon: 'Warning',
    title: '举报管理',
    path: '/reports'
  },
  {
    index: 'audit',
    icon: 'DocumentChecked',
    title: '审计日志',
    path: '/audit'
  }
]

// 简化过渡动画处理，移除复杂的JavaScript动画

// 全局清理函数 - 简化版本，移除多余日志
const cleanupDOM = () => {
  // 移除所有可能的Element Plus全局元素
  const elementsToRemove = [
    '.el-overlay', 
    '.el-message-box__wrapper',
    '.el-image-viewer__wrapper',
    '.el-message',
    '.el-notification',
    '.el-popper',
    '.el-dialog__wrapper'
  ];
  
  elementsToRemove.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });
  
  // 移除body上可能添加的类和样式
  document.body.classList.remove('el-popup-parent--hidden');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// 关闭用户菜单的函数
const closeUserMenu = (e) => {
  // 检查点击事件是否发生在菜单外部
  const adminDropdown = document.querySelector('.admin-dropdown');
  if (adminDropdown && !adminDropdown.contains(e.target)) {
    showUserMenu.value = false;
  }
};

// 组件挂载时
onMounted(() => {
  cleanupDOM();
  updateActiveMenu();
  
  // 添加点击事件监听器，点击页面其他地方时关闭用户菜单
  document.addEventListener('click', closeUserMenu);
});

// 组件卸载前清理
onBeforeUnmount(() => {
  cleanupDOM();
  // 移除点击事件监听器
  document.removeEventListener('click', closeUserMenu);
});
</script>

<template>
  <el-container class="layout-container">
    <!-- 全局下拉菜单，放在最外层 -->
    <div v-if="showUserMenu" class="custom-dropdown-menu" style="position: fixed; top: 60px; right: 20px;">
      <div class="dropdown-item" @click="handleLogout('logout')">
        <span>退出登录</span>
      </div>
    </div>
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo-container">
        <h1 class="project-title" v-if="!isCollapse">校园社交平台</h1>
        <h1 class="project-title-collapsed" v-else>校</h1>
      </div>
      <el-menu :default-active="activeMenu" class="el-menu-vertical" :collapse="isCollapse" background-color="#304156"
        text-color="#bfcbd9" active-text-color="#409EFF">
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index" @click="router.push(item.path)">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.parentMenu" :to="{ path: `/${route.meta.parentMenu}` }">
              {{ currentMenuItem.title }}
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title && route.meta.parentMenu">
              {{ route.meta.title }}
            </el-breadcrumb-item>
            <el-breadcrumb-item v-else>
              {{ currentMenuItem.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- 直接使用按钮组合替代dropdown -->
          <div class="admin-dropdown">
            <div class="user-info" @click="showUserMenu = !showUserMenu">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon style="margin-left: 4px; font-size: 12px"><CaretBottom /></el-icon>
            </div>
          </div>
        </div>
      </el-header>

      <!-- 简化的路由视图，移除keep-alive以防止组件状态保留问题 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component 
              :is="Component" 
              :key="$route.fullPath" 
              class="router-view-container" 
            />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">

.layout-container {
  min-height: 100vh;
  background: var(--el-bg-color);
}

.aside {
  background: var(--el-bg-color-overlay);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-right: 1px solid var(--el-border-color);
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  background: linear-gradient(180deg, 
    var(--el-color-primary-light-9) 0%,
    var(--el-bg-color-overlay) 100%
  );

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, 
      rgba(100, 181, 246, 0.1),
      rgba(100, 181, 246, 0.3),
      rgba(100, 181, 246, 0.1)
    );
  }
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.project-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.project-title-collapsed {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.logo-svg {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLogo 2s ease forwards;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards 0.5s;
}

.header {
  background: var(--el-bg-color-overlay);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  color: var(--el-text-color-regular);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  gap: 8px;

  &:hover {
    background: var(--el-color-primary-light-9);
  }
}

.username {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.admin-dropdown {
  position: relative;
  z-index: 2000;
}

.custom-dropdown-menu {
  position: fixed;
  width: 120px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
  z-index: 9999;
  border: 1px solid #e4e7ed;
}

.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.main {
  // 添加背景过渡
  transition: background 0.3s ease;
  overflow-y: auto; // 增加垂直滚动支持
  height: calc(100vh - 60px); // 高度为全屏高度减去header高度
  padding: 15px;
  box-sizing: border-box;
  
  &::before {
    // 优化背景渐变
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.05) 60%,
      rgba(255, 255, 255, 0) 100%
    );
  }
}

.el-menu-vertical {
  border-right: none;
  background: transparent;
  padding: 8px 0;

  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    margin: 4px 0;
    border-radius: 4px;
    margin-left: 8px;
    margin-right: 8px;
    transition: all 0.3s ease;
    font-weight: 500;
    letter-spacing: 0.3px;
    background: transparent;

    &:hover {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(100, 181, 246, 0.1);
    }

    .el-icon {
      color: var(--el-text-color-regular);
      transition: all 0.3s ease;
      font-size: 18px;
      margin-right: 8px;
    }

    &:hover .el-icon,
    &.is-active .el-icon {
      color: var(--el-color-primary);
    }
  }
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 240px;
}

@keyframes drawLogo {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 优化过渡动画
.fade-transform-enter-active {
  transition: 
    transform var(--transition-duration-enter) var(--ease-soft),
    opacity var(--transition-duration-enter) var(--ease-soft),
    filter calc(var(--transition-duration-enter) * 0.8) var(--ease-soft);
  transition-delay: 0.05s; // 添加入场延迟
}

.fade-transform-leave-active {
  transition: 
    transform var(--transition-duration-leave) var(--ease-soft),
    opacity calc(var(--transition-duration-leave) * 0.9) var(--ease-soft),
    filter calc(var(--transition-duration-leave) * 0.6) var(--ease-soft);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95); // 增加缩放幅度
  filter: blur(3px); // 增强初始模糊
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.97);
  filter: blur(1px);
}

// 新增动画曲线变量
:root {
  --transition-duration-enter: 0.7s;
  --transition-duration-leave: 0.6s;
  --ease-soft: cubic-bezier(0.175, 0.885, 0.320, 1.275);
}

// 优化路由容器
.router-view-container {
  position: relative;
  transform-origin: center top;
  will-change: transform, opacity;
  backface-visibility: hidden;
  min-height: calc(100vh - 100px); // 防止高度突变
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: 
    box-shadow 0.4s var(--ease-soft),
    transform 0.4s var(--ease-soft); // 容器自身动画
}

/* 新增简单的fade过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 鼠标悬停时增加立体感
.router-view-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 全新设计的对话框样式 */
.custom-message-box {
  width: 420px !important;
  border-radius: 24px !important;
  padding: 40px !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18) !important;
  background: var(--el-bg-color-overlay) !important;
  border: 1px solid var(--el-border-color-light) !important;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      var(--el-color-primary) 0%,
      var(--el-color-success) 100%
    );
  }

  .el-message-box__header {
    padding: 0 0 28px 0 !important;
    position: relative;
    
    .el-message-box__title {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: var(--el-text-color-primary) !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px;
      
      &::before {
        content: '\e785';
        font-family: 'element-icons' !important;
        color: var(--el-color-primary);
        font-size: 24px;
      }
    }
  }

  .el-message-box__content {
    padding: 0 0 36px 0 !important;
    font-size: 16px !important;
    line-height: 1.7 !important;
    color: var(--el-text-color-regular) !important;
    text-align: center !important;
    letter-spacing: 0.3px;
  }

  .el-message-box__btns {
    padding: 0 !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 16px !important;
  }

  .el-message-box__close {
    top: 28px !important;
    right: 28px !important;
    font-size: 20px !important;
    color: var(--el-text-color-placeholder) !important;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) !important;
    
    &:hover {
      color: var(--el-color-primary) !important;
      transform: rotate(180deg) scale(1.2) !important;
    }
  }
}

.custom-confirm-button {
  --btn-bg: var(--el-color-primary);
  --btn-hover-bg: var(--el-color-primary-light-2);
  
  width: 100% !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: var(--btn-bg) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, 
      rgba(255,255,255,0.15) 25%,
      transparent 50%,
      rgba(255,255,255,0.15) 75%
    );
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover {
    background: var(--btn-hover-bg) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(var(--el-color-primary-rgb), 0.3) !important;
    
    &::after {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(0) !important;
    box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2) !important;
  }
}

.custom-cancel-button {
  --btn-bg: var(--el-bg-color);
  --btn-hover-bg: var(--el-fill-color-light);
  
  width: 100% !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: var(--btn-bg) !important;
  border: 1px solid var(--el-border-color) !important;
  color: var(--el-text-color-regular) !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    background: var(--btn-hover-bg) !important;
    border-color: var(--el-border-color-dark) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  }
  
  &:active {
    transform: translateY(0) !important;
  }
}

.el-overlay {
  backdrop-filter: blur(12px) saturate(180%) !important;
  background: rgba(0, 0, 0, 0.35) !important;
  animation: overlay-fade 0.4s cubic-bezier(0.33, 1, 0.68, 1) !important;
  
  &.dark {
    background: rgba(0, 0, 0, 0.65) !important;
  }
}

@keyframes dialog-scale {
  0% {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes overlay-fade {
  0% {
    backdrop-filter: blur(0) saturate(100%);
    opacity: 0;
  }
  100% {
    backdrop-filter: blur(12px) saturate(180%);
    opacity: 1;
  }
}

/* 为对话框添加入场动画 */
.custom-message-box {
  animation: dialog-scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style> 