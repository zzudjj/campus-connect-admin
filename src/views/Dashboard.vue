<script setup>
import { ref, onMounted, reactive, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getUserStatistics, getOnlineUserCount, getNewUserStats } from '@/api/user'
import { getPostStatistics, getTodayNewPostCount } from '@/api/post'
import { getTagStatistics } from '@/api/tag'

const router = useRouter()

// 数据统计状态
const dashboardStats = reactive({
  // 用户相关统计
  totalUsers: 0,
  authenticatedUsers: 0,
  unauthenticatedUsers: 0,
  authenticatingUsers: 0,
  disabledUsers: 0,
  newUsersToday: 0,
  
  // 动态相关统计
  totalPosts: 0,
  publicPosts: 0,
  friendOnlyPosts: 0,
  privateOnlyPosts: 0,
  blockedPosts: 0,
  postsToday: 0,
  todayPostDate: '',
  
  // 标签统计
  totalTags: 0,
  systemTags: 0,
  userTags: 0,
  topUsedTags: [],
  
  // 在线用户数
  onlineUserCount: 0,
  lastUpdatedTime: null,
  
  // 热门动态
  topHotPosts: [],
  
  // 加载状态
  loading: true,
  error: null
})

// 简化显示的数据
const stats = computed(() => {
  return {
    totalUsers: dashboardStats.totalUsers,
    totalPosts: dashboardStats.totalPosts,
    onlineUsers: dashboardStats.onlineUserCount,
    postsToday: dashboardStats.postsToday
  }
})

// 数字动画函数
const animateNumber = (start, end, duration, callback) => {
  // 先将最终值设置到组件状态中，确保数据的准确性
  callback(end)
  
  // 然后执行动画效果
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
    } else {
      // 确保最终值是准确的
      callback(end)
    }
  }
  requestAnimationFrame(update)
}

// 获取用户统计数据
const fetchUserStatistics = async () => {
  try {
    console.log('正在请求用户统计数据...')
    console.log('请求URL:', '/admin/user/statistics')
    const res = await getUserStatistics()
    console.log('用户统计原始返回数据:', JSON.stringify(res))
    
    if (res.code === 200 && res.data) {
      // 显示API返回的完整数据结构
      console.log('用户统计API返回数据结构:', Object.keys(res.data))
      console.log('用户统计详细数据:', res.data)
      
      // 根据API文档，字段应该是 snake_case 格式
      // 直接使用API返回的数据，不进行动画过渡
      dashboardStats.totalUsers = res.data.total_users || 0
      dashboardStats.authenticatedUsers = res.data.authenticated_users || 0
      dashboardStats.unauthenticatedUsers = res.data.unauthenticated_users || 0
      // API中实际没有authenticating_users字段，而是有rejected_users
      dashboardStats.authenticatingUsers = 0  // 不存在该字段，设置为0
      dashboardStats.rejectedUsers = res.data.rejected_users || 0  // 新增被拒绝用户字段
      dashboardStats.disabledUsers = res.data.disabled_users || 0
      dashboardStats.newUsersToday = res.data.new_users_today || 0
      
      console.log('处理后的用户统计数据:', {
        totalUsers: dashboardStats.totalUsers,
        authenticatedUsers: dashboardStats.authenticatedUsers,
        unauthenticatedUsers: dashboardStats.unauthenticatedUsers,
        authenticatingUsers: dashboardStats.authenticatingUsers,
        rejectedUsers: dashboardStats.rejectedUsers,
        disabledUsers: dashboardStats.disabledUsers,
        newUsersToday: dashboardStats.newUsersToday
      })
      
      // 由于数字准确性问题，先暂停动画效果
      // 直接保持数据原始值
      /*
      animateNumber(0, dashboardStats.totalUsers, 2000, (value) => {
        dashboardStats.totalUsers = value
      })
      */
    } else {
      console.error('用户统计API返回错误:', res.message || '未知错误')
    }
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    dashboardStats.error = '获取用户统计数据失败'
  }
}

// 获取动态统计数据
const fetchPostStatistics = async () => {
  try {
    console.log('正在请求动态统计数据...')
    console.log('请求URL:', '/admin/post/statistics')
    const res = await getPostStatistics()
    console.log('动态统计原始返回数据:', JSON.stringify(res))
    
    if (res.code === 200 && res.data) {
      // 显示API返回的完整数据结构
      console.log('动态统计API返回数据结构:', Object.keys(res.data))
      console.log('动态统计详细数据:', res.data)
      
      // 根据实际API返回，字段使用的是 snake_case 格式
      dashboardStats.totalPosts = res.data.total_posts || 0
      dashboardStats.publicPosts = res.data.public_posts || 0
      dashboardStats.friendOnlyPosts = res.data.friend_only_posts || 0
      dashboardStats.privateOnlyPosts = res.data.private_posts || 0
      dashboardStats.blockedPosts = res.data.disabled_posts || 0 // 注意API中是disabled_posts而不是blocked_posts
      dashboardStats.postsToday = res.data.posts_today || 0
      
      // 热门动态数据处理 - 从hot_scores对象转换为数组格式
      if (res.data.hot_scores) {
        dashboardStats.topHotPosts = Object.entries(res.data.hot_scores).map(([postId, score]) => ({
          postId: parseInt(postId),
          hotScore: score,
          title: `动态 #${postId}` // 由于API没有返回标题，暂时使用ID作为标题
        })).sort((a, b) => b.hotScore - a.hotScore).slice(0, 5) // 取分数最高的5条
      } else {
        dashboardStats.topHotPosts = []
      }
      
      console.log('处理后的动态统计数据:', {
        totalPosts: dashboardStats.totalPosts,
        publicPosts: dashboardStats.publicPosts,
        friendOnlyPosts: dashboardStats.friendOnlyPosts,
        privateOnlyPosts: dashboardStats.privateOnlyPosts,
        blockedPosts: dashboardStats.blockedPosts,
        postsToday: dashboardStats.postsToday,
        topHotPosts: dashboardStats.topHotPosts,
        topHotPostsCount: dashboardStats.topHotPosts.length
      })
      
      // 由于数字准确性问题，先暂停动画效果
      // 直接保持数据原始值
      /*
      animateNumber(0, dashboardStats.totalPosts, 2000, (value) => {
        dashboardStats.totalPosts = value
      })
      */
      
      // 初始化内容分布图表
      initContentDistributionChart()
    } else {
      console.error('动态统计API返回错误:', res.message || '未知错误')
    }
  } catch (error) {
    console.error('获取动态统计数据失败:', error)
    dashboardStats.error = '获取动态统计数据失败'
  }
}

// 获取当天新增动态数量
const fetchTodayNewPostCount = async () => {
  try {
    const res = await getTodayNewPostCount()
    if (res.code === 200 && res.data) {
      dashboardStats.postsToday = res.data.count || 0
      dashboardStats.todayPostDate = res.data.date || ''
      console.log('当天新增动态数量:', res.data)
    } else {
      console.warn('获取当天新增动态数量失败:', res.message || '未知错误')
    }
  } catch (err) {
    console.error('获取当天新增动态数量出错:', err)
  }
}

// 获取在线用户数
const fetchOnlineUserCount = async () => {
  try {
    console.log('正在请求在线用户数据...')
    console.log('请求URL:', '/admin/user/onlineCount')
    const res = await getOnlineUserCount()
    console.log('在线用户原始返回数据:', JSON.stringify(res))
    
    if (res.code === 200 && res.data) {
      // 显示API返回的完整数据结构
      console.log('在线用户API返回数据结构:', Object.keys(res.data))
      console.log('在线用户详细数据:', res.data)
      
      dashboardStats.onlineUserCount = res.data.onlineCount || 0
      dashboardStats.lastUpdatedTime = res.data.timestamp 
        ? new Date(res.data.timestamp).toLocaleTimeString() 
        : new Date().toLocaleTimeString()
      
      console.log('处理后的在线用户数据:', {
        onlineUserCount: dashboardStats.onlineUserCount,
        lastUpdatedTime: dashboardStats.lastUpdatedTime
      })
      
      // 由于数字准确性问题，先暂停动画效果
      // 直接保持数据原始值
      /*
      animateNumber(0, dashboardStats.onlineUserCount, 1500, (value) => {
        dashboardStats.onlineUserCount = value
      })
      */
    } else {
      console.error('在线用户API返回错误:', res.message || '未知错误')
    }
  } catch (error) {
    console.error('获取在线用户数失败:', error)
  }
}

// 获取标签统计数据
const fetchTagStatistics = async () => {
  try {
    console.log('开始获取标签统计数据...')
    const res = await getTagStatistics()
    console.log('标签统计 API 原始响应:', JSON.stringify(res))
    
    if (res.code === 200 && res.data) {
      dashboardStats.totalTags = res.data.totalTags || 0
      dashboardStats.systemTags = res.data.systemTags || 0
      dashboardStats.userTags = res.data.userTags || 0
      dashboardStats.topUsedTags = res.data.topUsedTags || []
      
      console.log('标签统计数据处理后:', {
        totalTags: dashboardStats.totalTags,
        systemTags: dashboardStats.systemTags,
        userTags: dashboardStats.userTags,
        topUsedTags: dashboardStats.topUsedTags
      })
    } else {
      console.warn('获取标签统计数据失败:', res.message || '未知错误')
    }
  } catch (err) {
    console.error('获取标签统计数据出错:', err)
  }
}

// 初始化所有数据
const initDashboardData = async () => {
  dashboardStats.loading = true
  dashboardStats.error = null
  
  try {
    await Promise.all([
      fetchUserStatistics(),
      fetchPostStatistics(),
      fetchTodayNewPostCount(),
      fetchOnlineUserCount(),
      fetchTagStatistics()
    ])
  } catch (error) {
    console.error('初始化仪表盘数据失败:', error)
  } finally {
    dashboardStats.loading = false
  }
}

// 图表相关
let contentDistributionChart = null
let userGrowthChart = null

// 定义重新初始化图表的函数
const initCharts = () => {
  // 等待DOM渲染完成后初始化图表
  setTimeout(() => {
    try {
      initUserGrowthChart()
    } catch (error) {
      console.error('初始化用户增长图表错误:', error)
    }
  }, 300)
}

// 初始化内容分布饼图
const initContentDistributionChart = () => {
  const chartDOM = document.getElementById('contentDistributionChart')
  if (!chartDOM) return
  
  contentDistributionChart = echarts.init(chartDOM)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['公开动态', '好友可见', '仅自己可见', '已屏蔽']
    },
    series: [
      {
        name: '动态分布',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: dashboardStats.publicPosts, name: '公开动态' },
          { value: dashboardStats.friendOnlyPosts, name: '好友可见' },
          { value: dashboardStats.privateOnlyPosts, name: '仅自己可见' },
          { value: dashboardStats.blockedPosts, name: '已屏蔽/禁用' }
        ]
      }
    ]
  }
  
  contentDistributionChart.setOption(option)
}

// 获取用户增长趋势图数据
const initUserGrowthChart = async () => {
  const chartDOM = document.getElementById('userGrowthChart')
  if (!chartDOM) return
  
  userGrowthChart = echarts.init(chartDOM)
  
  // 使用真实API数据
  let dates = []
  let userData = []
  
  try {
    // 调用API获取近30天的用户增长数据
    const res = await getNewUserStats()
    console.log('新增用户统计API返回数据:', res)
    
    if (res.code === 200 && Array.isArray(res.data)) {
      // 处理API返回的数据
      const statsData = res.data
      
      // 确保数据不为空
      if (statsData.length > 0) {
        // 格式化日期和提取数量
        statsData.forEach(item => {
          // 将YYYY-MM-DD格式转换为MM/DD显示
          const dateParts = item.date.split('-')
          const formattedDate = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`
          dates.push(formattedDate)
          userData.push(item.count)
        })
        
        console.log('处理后的新增用户数据:', { dates, userData })
      } else {
        console.warn('API返回的数据为空数组')
        // 生成最近30天的日期作为兜底显示
        const now = new Date()
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(now.getDate() - i)
          dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
          userData.push(0) // 设置为0表示没有新用户
        }
      }
    } else {
      console.error('获取新增用户统计失败:', res.message || '未知错误')
      // 如果API调用失败，使用空数组
      dates = []
      userData = []
    }
  } catch (error) {
    console.error('获取新增用户统计出错:', error)
    // 如果出错，使用空数组
    dates = []
    userData = []
  }
  
  // 构建图表配置
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',  // 增加底部边距，为X轴标签腾出空间
      top: '10%',    // 增加顶部边距
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        interval: 'auto',
        rotate: 30,
        margin: 8,
        fontSize: 12,
        hideOverlap: false,
        color: '#606266'
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '新增用户数',
      minInterval: 1, // 确保Y轴以整数显示
      min: 0  // 确保Y轴从0开始
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: userData,
        symbolSize: 6, // 增大数据点的大小
        itemStyle: {
          color: '#409eff' // 使用主题蓝色
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  // 应用图表配置
  userGrowthChart.setOption(option)
  
  // 确保图表正确显示
  setTimeout(() => {
    if (userGrowthChart) {
      userGrowthChart.resize()
    }
  }, 200)
}

// 自动刷新在线用户数计时器
let onlineUserTimer = null

// 处理窗口大小变化，重新调整图表大小
const handleResize = () => {
  if (contentDistributionChart) {
    contentDistributionChart.resize()
  }
  if (userGrowthChart) {
    userGrowthChart.resize()
  }
}

onMounted(() => {
  // 初始化仪表盘数据
  initDashboardData()
  
  // 设置定时器，每60秒刷新一次在线用户数
  onlineUserTimer = setInterval(fetchOnlineUserCount, 60000)
  
  // 等待DOM完全渲染后初始化图表
  initCharts()
  
  // 添加窗口大小变化事件监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清除定时器
  if (onlineUserTimer) {
    clearInterval(onlineUserTimer)
  }
  
  // 销毁图表实例
  if (contentDistributionChart) {
    contentDistributionChart.dispose()
  }
  if (userGrowthChart) {
    userGrowthChart.dispose()
  }
  
  // 移除窗口大小变化事件监听
  window.removeEventListener('resize', handleResize)
})

// 快捷操作处理函数
const handleQuickAction = (action) => {
  switch (action) {
    case 'userManage':
      router.push('/users')
      break
    case 'postManage':
      router.push('/posts')
      break
    case 'reportManage':
      router.push('/reports')
      break
    case 'refreshData':
      initDashboardData()
      ElMessage.success('数据已刷新')
      break
  }
}
</script>

<template>
  <div class="dashboard-container">
    <!-- 数据概览卡片 -->
    <el-row v-loading="dashboardStats.loading" :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardStats.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardStats.totalPosts }}</div>
              <div class="stat-label">动态总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #ecf5ff; color: #409eff;">
              <el-icon :size="40"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardStats.onlineUserCount }}</div>
              <div class="stat-label">
                当前在线用户
                <div class="update-time" v-if="dashboardStats.lastUpdatedTime">
                  更新于 {{ dashboardStats.lastUpdatedTime }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f9eb; color: #67c23a;">
              <el-icon :size="40"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardStats.postsToday }}</div>
              <div class="stat-label">今日新增动态</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作区域 -->
    <el-card class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <span>快捷管理</span>
          <el-button type="primary" link @click="handleQuickAction('refreshData')">
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </template>
      <div class="quick-actions-grid">
        <div class="action-item" @click="handleQuickAction('userManage')">
          <el-icon :size="24"><User /></el-icon>
          <span>用户管理</span>
        </div>
        <div class="action-item" @click="handleQuickAction('postManage')">
          <el-icon :size="24"><Document /></el-icon>
          <span>动态管理</span>
        </div>
        <div class="action-item" @click="handleQuickAction('reportManage')">
          <el-icon :size="24"><Warning /></el-icon>
          <span>举报管理</span>
        </div>
      </div>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3 class="chart-title">用户增长趋势</h3>
              <div class="chart-subtitle">近30天新增用户统计</div>
            </div>
          </template>
          <div class="chart-container">
            <div id="userGrowthChart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card class="chart-card tag-stats-card">
          <template #header>
            <div class="card-header">
              <span>标签使用统计</span>
              <span class="chart-subtitle">按使用频率排序</span>
            </div>
          </template>
          <div class="tag-stats-container">
            <div class="tag-stats-summary">
              <div class="tag-stat-item">
                <div class="tag-stat-value">{{ dashboardStats.totalTags }}</div>
                <div class="tag-stat-label">标签总数</div>
              </div>
              <div class="tag-stat-item">
                <div class="tag-stat-value">{{ dashboardStats.systemTags }}</div>
                <div class="tag-stat-label">系统标签</div>
              </div>
              <div class="tag-stat-item">
                <div class="tag-stat-value">{{ dashboardStats.userTags }}</div>
                <div class="tag-stat-label">用户标签</div>
              </div>
            </div>
            <div class="top-tags-list">
              <div v-for="(tag, index) in dashboardStats.topUsedTags" :key="tag.tagId" class="top-tag-item">
                <span class="tag-rank">{{ index + 1 }}</span>
                <el-tag :type="tag.type === 0 ? 'success' : 'info'" size="large" effect="light" class="tag-name">{{ tag.name }}</el-tag>
                <span class="tag-count">使用 {{ tag.useCount }} 次</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    

    
    <!-- 热门动态列表 -->
    <el-card class="hot-posts-card" v-if="dashboardStats.topHotPosts && dashboardStats.topHotPosts.length > 0">
      <template #header>
        <div class="card-header">
          <span>热门动态</span>
          <span class="chart-subtitle">根据热度分数排序</span>
        </div>
      </template>
      <el-table :data="dashboardStats.topHotPosts" style="width: 100%">
        <el-table-column prop="postId" label="动态ID" width="100" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="hotScore" label="热度分数" width="120">
          <template #default="scope">
            <el-tag type="danger">
              {{ scope.row.hotScore.toFixed(1) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button link type="primary" @click="router.push(`/posts/detail?postId=${scope.row.postId}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 用户分类条形图 -->
    <el-card class="user-types-card">
      <template #header>
        <div class="card-header">
          <span>用户类型分布</span>
        </div>
      </template>
      <div class="user-type-stats">
        <div class="user-type-item">
          <div class="user-type-title">已认证用户</div>
          <el-progress :percentage="Math.round((dashboardStats.authenticatedUsers / dashboardStats.totalUsers) * 100)" color="#67c23a" :format="() => dashboardStats.authenticatedUsers + ' 人'" />
        </div>
        <div class="user-type-item">
          <div class="user-type-title">未认证用户</div>
          <el-progress :percentage="Math.round((dashboardStats.unauthenticatedUsers / dashboardStats.totalUsers) * 100)" color="#409eff" :format="() => dashboardStats.unauthenticatedUsers + ' 人'" />
        </div>
        <div class="user-type-item">
          <div class="user-type-title">认证中用户</div>
          <el-progress :percentage="Math.round((dashboardStats.authenticatingUsers / dashboardStats.totalUsers) * 100)" color="#e6a23c" :format="() => dashboardStats.authenticatingUsers + ' 人'" />
        </div>
        <div class="user-type-item">
          <div class="user-type-title">禁用用户</div>
          <el-progress :percentage="Math.round((dashboardStats.disabledUsers / dashboardStats.totalUsers) * 100)" color="#f56c6c" :format="() => dashboardStats.disabledUsers + ' 人'" />
        </div>
      </div>
    </el-card>
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
  height: 100%;

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

.update-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.quick-actions-card,
.chart-card,
.hot-posts-card,
.user-types-card {
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

.chart-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 8px;
}

.quick-actions-grid {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 15px 0;
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
  width: 100%;

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
  width: 100%;
}

#userGrowthChart {
  width: 100%;
  height: 300px;
  min-height: 300px;
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

/* 标签统计样式 */
.tag-stats-container {
  padding: 10px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 340px; /* 确保有足够空间滚动 */
}

.tag-stats-card {
  height: 400px; /* 固定高度确保可滚动 */
  display: flex;
  flex-direction: column;
}

.tag-stats-card > .el-card__body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tag-stats-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  text-align: center;
  flex-shrink: 0;
}

.tag-stat-item {
  flex: 1;
}

.tag-stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.tag-stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.top-tags-list {
  padding: 0 10px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  max-height: 250px;
}

.top-tags-list::-webkit-scrollbar {
  width: 4px;
}

.top-tags-list::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.top-tag-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.tag-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #ff6b6b;
  color: white;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.top-tag-item:nth-child(1) .tag-rank {
  background-color: #ff6b6b;
}

.top-tag-item:nth-child(2) .tag-rank {
  background-color: #ffa26b;
}

.top-tag-item:nth-child(3) .tag-rank {
  background-color: #ffd76b;
}

.tag-name {
  flex: 1;
  margin-right: 12px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-count {
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}
</style>