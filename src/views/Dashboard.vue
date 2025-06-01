<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 添加数字动画相关的状态
const stats = ref({
  totalUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  totalTags: 0
})

// 数字动画函数
const animateNumber = (start, end, duration, callback) => {
  const startTime = performance.now()
  const update = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用 easeOutExpo 缓动函数使动画更自然
    const easeProgress = 1 - Math.pow(2, -10 * progress)
    const current = Math.floor(start + (end - start) * easeProgress)
    
    callback(current)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  requestAnimationFrame(update)
}

// 初始化数据
const initStats = () => {
  // 模拟数据，实际项目中应该从API获取
  const finalStats = {
    totalUsers: 1234,
    totalPosts: 567,
    totalComments: 890,
    totalTags: 45
  }
  
  // 为每个数字添加动画
  Object.keys(finalStats).forEach(key => {
    animateNumber(0, finalStats[key], 2000, (value) => {
      stats.value[key] = value
    })
  })
}

onMounted(() => {
  initStats()
})

// 快捷操作处理函数
const handleQuickAction = (action) => {
  switch (action) {
    case 'addUser':
      router.push('/users/add')
      break
    case 'addPost':
      router.push('/posts/add')
      break
    case 'addTag':
      router.push('/tags/add')
      break
    case 'viewAnalytics':
      router.push('/analytics')
      break
  }
}
</script>

<template>
  <div class="dashboard-container">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="(stat, key) in stats" :key="key">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40">
                <component :is="
                  key === 'totalUsers' ? 'User' :
                  key === 'totalPosts' ? 'Document' :
                  key === 'totalComments' ? 'ChatDotRound' :
                  'Collection'
                " />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat }}</div>
              <div class="stat-label">
                {{ 
                  key === 'totalUsers' ? '用户总数' :
                  key === 'totalPosts' ? '动态总数' :
                  key === 'totalComments' ? '评论总数' :
                  '标签总数'
                }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作区域 -->
    <el-card class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
          <el-button type="primary" link @click="handleQuickAction('viewAnalytics')">
            查看详细分析
          </el-button>
        </div>
      </template>
      <div class="quick-actions-grid">
        <div class="action-item" @click="handleQuickAction('addUser')">
          <el-icon :size="24"><UserPlus /></el-icon>
          <span>添加用户</span>
        </div>
        <div class="action-item" @click="handleQuickAction('addPost')">
          <el-icon :size="24"><DocumentAdd /></el-icon>
          <span>发布动态</span>
        </div>
        <div class="action-item" @click="handleQuickAction('addTag')">
          <el-icon :size="24"><CollectionAdd /></el-icon>
          <span>添加标签</span>
        </div>
      </div>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里可以添加实际的图表组件 -->
            <div class="chart-placeholder">暂无数据</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>内容分布</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里可以添加实际的图表组件 -->
            <div class="chart-placeholder">暂无数据</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
  position: relative;
  z-index: 1;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, var(--el-bg-color) 100%);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary-light-5);
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: var(--el-color-primary-light-7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.quick-actions-card {
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  background: #ffffff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 12px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 10px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-light);

  &:hover {
    background: var(--el-color-primary-light-8);
    transform: translateY(-2px);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.1);
  }

  .el-icon {
    color: var(--el-color-primary);
    font-size: 24px;
  }

  span {
    font-size: 14px;
    color: var(--el-text-color-regular);
    font-weight: 500;
  }
}

.charts-row {
  margin-top: 20px;
  margin-bottom: 40px;
  min-height: 420px;
}

.chart-card {
  height: 400px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  background: #ffffff;
  position: relative;
  z-index: 1;
  margin-bottom: 0;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }
}

.chart-container {
  height: calc(100% - 55px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.chart-placeholder {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
  border-radius: 4px;
  border: 1px dashed var(--el-border-color);
}
</style> 