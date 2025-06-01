<script setup>
// 组件逻辑将由路由系统处理
</script>

<template>
  <router-view />
</template>

<style lang="scss">
@use './styles/theme.scss' as *;

/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--el-bg-color);
}

#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto; /* 改为auto允许滚动 */
  min-height: 100vh;
}

/* Element Plus 组件样式覆盖 */
.el-card {
  margin: 0;
  border: none;
}

.el-card__body {
  padding: 20px;
}

.el-table {
  width: 100%;
}

.el-form {
  width: 100%;
}

.el-form-item {
  margin-bottom: 18px;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--el-bg-color);
}

::-webkit-scrollbar-thumb {
  background: var(--el-color-primary-light-5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-primary-light-3);
}

/* 响应式布局断点 */
@media screen and (max-width: 768px) {
  .el-card__body {
    padding: 15px;
  }
}

@media screen and (max-width: 480px) {
  .el-card__body {
    padding: 10px;
  }
}
</style>
