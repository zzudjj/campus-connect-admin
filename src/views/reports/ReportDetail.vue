<template>
  <div class="report-detail-container">
    <!-- 顶部标题和操作区 -->
    <div class="detail-header">
      <div class="title">
        <h2>举报详情：ID {{ reportId }}</h2>
      </div>
      <div class="operations">
        <el-button @click="goBack" type="primary" size="large">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <el-button @click="loadReportData" :loading="loading" type="info" size="large">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>
    
    <div v-loading="loading" class="detail-content">
      <el-empty v-if="!reportDetail && !loading" description="暂无举报数据" />
      
      <template v-if="reportDetail">
          <!-- 基本信息 -->
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="举报ID">
              {{ reportDetail.reportId }}
            </el-descriptions-item>
            <el-descriptions-item label="举报时间">
              {{ formatDateTime(reportDetail.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTagType(reportDetail.status)">
                {{ formatReportStatus(reportDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="类型">
              {{ reportDetail.targetTypeName }}
            </el-descriptions-item>
            <el-descriptions-item label="举报原因" :span="2">
              {{ reportDetail.reason }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 举报人信息 -->
          <div class="section-divider"></div>
          <h3 class="section-title">举报人信息</h3>
          <div class="user-info-wrapper">
            <div class="user-avatar-container">
              <el-avatar 
                :size="64" 
                :src="reportDetail.reporterInfo?.avatarUrl || reporterProfile?.avatarUrl || ''"
              ></el-avatar>
            </div>
            <div class="user-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户昵称">
                  {{ reportDetail.reporterInfo?.nickname || reporterProfile?.nickname || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="用户ID">
                  {{ reportDetail.reporterId }}
                </el-descriptions-item>
                <el-descriptions-item label="学校" v-if="reporterProfile?.school">
                  {{ reporterProfile.school }}
                </el-descriptions-item>
                <el-descriptions-item label="院系" v-if="reporterProfile?.department">
                  {{ reporterProfile.department }}
                </el-descriptions-item>
                <el-descriptions-item label="认证状态" v-if="reporterProfile">
                  <el-tag :type="reporterProfile.authStatus === 1 ? 'success' : 'info'">
                    {{ reporterProfile.authStatus === 1 ? '已认证' : '未认证' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="注册时间">
                  {{ formatDateTime(reportDetail.reporterInfo?.registerTime || reporterProfile?.createdAt) || '未知' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
          
          <!-- 被举报内容 -->
          <div class="section-divider"></div>
          <h3 class="section-title">被举报内容</h3>
          <div v-if="reportDetail.targetType === 1" class="reported-content">
            <el-descriptions :column="1" border v-if="postDetail">
              <el-descriptions-item label="动态ID">
                {{ postDetail.postId }}
              </el-descriptions-item>
              <el-descriptions-item label="发布者ID">
                {{ postDetail.userId }}
              </el-descriptions-item>
              <el-descriptions-item label="发布时间">
                {{ formatDateTime(postDetail.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="动态内容">
                <div class="content-box">
                  {{ postDetail.content }}
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="媒体文件" v-if="postDetail.mediaUrls && postDetail.mediaUrls.length > 0">
                <div class="media-list">
                  <div v-for="(media, index) in postDetail.mediaUrls" :key="index" class="media-item">
                    <el-image 
                      :src="media" 
                      :preview-src-list="postDetail.mediaUrls"
                      fit="cover"
                      class="media-image"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>加载失败</span>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </el-descriptions-item>
            </el-descriptions>
            <el-skeleton :rows="5" animated v-else-if="loadingTargetContent"/>
            <el-empty v-else description="无法加载动态内容" />
          </div>
          
          <div v-else-if="reportDetail.targetType === 2" class="reported-content">
            <el-descriptions :column="1" border v-if="commentDetail">
              <el-descriptions-item label="评论ID">
                {{ commentDetail.id }}
              </el-descriptions-item>
              <el-descriptions-item label="评论者ID">
                {{ commentDetail.userId }}
              </el-descriptions-item>
              <el-descriptions-item label="评论者昵称">
                {{ commentDetail.userNickname }}
              </el-descriptions-item>
              <el-descriptions-item label="评论时间">
                {{ formatDateTime(commentDetail.createTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="评论内容">
                <div class="content-box">
                  {{ commentDetail.content }}
                </div>
              </el-descriptions-item>
            </el-descriptions>
            <el-skeleton :rows="5" animated v-else-if="loadingTargetContent"/>
            <el-empty v-else description="无法加载评论内容" />
          </div>
          
          <div v-else class="reported-content">
            <el-empty description="不支持的举报类型" />
          </div>

          <!-- 处理操作 -->
          <div class="section-divider"></div>
          <h3 class="section-title">处理状态</h3>
          <div class="action-container">
            <div v-if="reportDetail.status === 0" class="status-pending">
              <div class="status-message">
                该举报当前状态为待处理，请选择下列操作进行处理。
              </div>

              <div class="action-buttons">
                <el-button 
                  type="success" 
                  size="large"
                  :loading="processing"
                  @click="processReport(1)"
                >
                  <el-icon><Check /></el-icon> 标记为有效举报
                </el-button>
                <el-button 
                  type="danger" 
                  size="large"
                  :loading="processing"
                  @click="processReport(2)"
                >
                  <el-icon><Close /></el-icon> 标记为无效举报
                </el-button>
              </div>
            </div>
            
            <div v-else class="status-handled">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="处理结果">
                  <el-tag :type="reportDetail.status === 1 ? 'success' : 'danger'" size="large">
                    {{ formatReportStatus(reportDetail.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="处理时间" v-if="reportDetail.handledAt">
                  {{ formatDateTime(reportDetail.handledAt) }}
                </el-descriptions-item>
                <el-descriptions-item label="处理管理员" v-if="reportDetail.handledByAdminId">
                  ID: {{ reportDetail.handledByAdminId }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReportDetail, handleReport as submitReportAction, getCommentDetail } from '@/api/report'
import { getUserPublicProfile } from '@/api/user'
import { getPostDetail as fetchPostDetail, getPostMedia } from '@/api/post'
import { formatDateTime } from '@/utils/date'
import { ArrowLeft, Refresh, Check, Close, Picture } from '@element-plus/icons-vue'
import request from '@/api/request'

const router = useRouter()
const route = useRoute()

// 从路由参数获取举报ID
const reportId = Number(route.params.id)

// 获取管理员ID
// 注意：实际中应从用户信息中获取真实的管理员ID
// 这里我们使用一个默认值作为示例
const adminId = 1

const reportDetail = ref(null)
const postDetail = ref(null)
const commentDetail = ref(null)
const reporterProfile = ref(null)
const loading = ref(false)
const loadingTargetContent = ref(false)
const processing = ref(false)

// 格式化举报状态
const formatReportStatus = (status) => {
  switch (status) {
    case 0:
      return '待处理'
    case 1:
      return '有效举报'
    case 2:
      return '无效举报'
    default:
      return '未知状态'
  }
}

// 状态标签样式
const statusTagType = (status) => {
  switch (status) {
    case 0:
      return 'danger'
    case 1:
      return 'success'
    case 2:
      return 'info'
    default:
      return ''
  }
}

// 返回上一页
const goBack = () => {
  router.push('/reports')
}

// 获取动态详情
const getPostDetail = async (postId) => {
  console.log('开始获取动态详情, 动态ID:', postId)
  loadingTargetContent.value = true
  try {
    console.log('发送动态详情请求, 参数:', { postId })
    const detailRes = await fetchPostDetail({ postId })
    
    if (detailRes.code === 200) {
      // 先设置基本信息
      // 处理可能的嵌套结构
      if (detailRes.data && detailRes.data.data) {
        // 有嵌套结构
        postDetail.value = detailRes.data.data
      } else {
        // 直接结构
        postDetail.value = detailRes.data
      }
      console.log('获取动态详情成功:', postDetail.value)
      
      // 然后获取动态媒体文件
      console.log('开始获取动态媒体文件')
      const mediaRes = await getPostMedia({ postId })
      console.log('媒体文件响应:', mediaRes)
      
      if (mediaRes.code === 200 && mediaRes.data && mediaRes.data.length > 0) {
        // 设置媒体文件URL列表
        postDetail.value.mediaUrls = mediaRes.data.map(media => media.mediaUrl || media.url || media)
        console.log('获取到的媒体文件列表:', mediaRes.data)
        console.log('处理后的媒体URL列表:', postDetail.value.mediaUrls)
      } else {
        // 确保媒体URL字段存在，即使为空
        postDetail.value.mediaUrls = postDetail.value.mediaUrls || []
      }
    } else {
      console.error('获取动态详情失败, 状态码:', detailRes.code, '错误信息:', detailRes.message)
      postDetail.value = null
    }
  } catch (error) {
    console.error('获取动态详情发生异常:', error)
    console.error('异常详情:', error.message)
    if (error.response) {
      console.error('服务器响应状态码:', error.response.status)
      console.error('服务器响应数据:', error.response.data)
    }
    postDetail.value = null
  } finally {
    loadingTargetContent.value = false
  }
}

// 获取评论详情
const getCommentDetailData = async (commentId) => {
  console.log('开始获取评论详情, 评论ID:', commentId)
  loadingTargetContent.value = true
  try {
    console.log('发送评论详情请求, 路径: /comment/detail, 参数:', { commentId })
    const res = await getCommentDetail({ commentId })
    console.log('评论详情原始响应:', JSON.stringify(res))
    
    if (res.code === 200) {
      commentDetail.value = res.data
      console.log('获取评论详情成功! 内容:', JSON.stringify(commentDetail.value))
    } else {
      console.error('获取评论详情失败, 状态码:', res.code, '错误信息:', res.message)
      commentDetail.value = null
    }
  } catch (error) {
    console.error('获取评论详情发生异常:', error)
    console.error('异常详情:', error.message, '完整错误对象:', error)
    if (error.response) {
      console.error('服务器响应状态码:', error.response.status)
      console.error('服务器响应数据:', error.response.data)
    }
    commentDetail.value = null
  } finally {
    loadingTargetContent.value = false
  }
}

// 加载举报关联的内容
const loadReportedContent = async () => {
  console.log('开始加载举报关联内容')
  
  if (!reportDetail.value) {
    console.warn('无法加载关联内容: 举报详情为空')
    return
  }
  
  console.log('举报目标类型:', reportDetail.value.targetType, '目标ID:', reportDetail.value.targetId)
  console.log('举报详情完整数据:', reportDetail.value)
  
  // 重置详情数据
  postDetail.value = null
  commentDetail.value = null
  
  // 根据目标类型加载不同内容
  if (reportDetail.value.targetType === 1) {
    // 举报的是动态
    if (reportDetail.value.targetDetail && Object.keys(reportDetail.value.targetDetail).length > 0) {
      // 直接使用API返回的targetDetail数据
      console.log('使用举报详情中的动态数据:', reportDetail.value.targetDetail)
      postDetail.value = reportDetail.value.targetDetail
      
      // 补全可能缺少的媒体URL字段
      if (!postDetail.value.mediaUrls || !Array.isArray(postDetail.value.mediaUrls)) {
        postDetail.value.mediaUrls = []
        
        // 如果有单张媒体图片URL但没有媒体数组
        if (postDetail.value.mediaUrl) {
          postDetail.value.mediaUrls = [postDetail.value.mediaUrl]
        }
        
        // 即使有内嵌数据，也尝试获取媒体文件
        if (reportDetail.value.targetId) {
          try {
            console.log('尝试额外获取媒体文件')
            const mediaRes = await getPostMedia({ postId: reportDetail.value.targetId })
            if (mediaRes.code === 200 && mediaRes.data && mediaRes.data.length > 0) {
              postDetail.value.mediaUrls = mediaRes.data.map(media => media.mediaUrl || media.url || media)
              console.log('额外获取到的媒体文件:', postDetail.value.mediaUrls)
            }
          } catch (err) {
            console.error('获取额外媒体文件失败:', err)
          }
        }
      }
    } else {
      // 如果targetDetail不存在或为空对象，调用API获取
      console.log('无法获取内嵌动态数据，尝试调用API获取')
      await getPostDetail(reportDetail.value.targetId)
    }
  } else if (reportDetail.value.targetType === 2) {
    // 举报的是评论
    await getCommentDetailData(reportDetail.value.targetId)
  }
}

// 获取举报人公开资料
const getReporterPublicProfile = async (userId) => {
  try {
    console.log('获取举报人公开资料, 用户ID:', userId)
    const res = await getUserPublicProfile({ userId })
    if (res.code === 200) {
      reporterProfile.value = res.data
      console.log('获取到举报人公开资料:', reporterProfile.value)
    } else {
      console.error('获取举报人公开资料失败:', res.message)
      reporterProfile.value = null
    }
  } catch (error) {
    console.error('获取举报人公开资料错误:', error)
    reporterProfile.value = null
  }
}

// 加载举报数据
const loadReportData = async () => {
  loading.value = true
  postDetail.value = null
  commentDetail.value = null
  reporterProfile.value = null
  
  try {
    console.log('加载举报详情, ID:', reportId)
    const res = await getReportDetail({ reportId })
    if (res.code === 200) {
      reportDetail.value = res.data
      console.log('获取到举报详情:', reportDetail.value)
      
      // 加载举报人公开资料
      if (reportDetail.value.reporterId) {
        await getReporterPublicProfile(reportDetail.value.reporterId)
      }
      
      // 加载举报关联的内容
      await loadReportedContent()
    } else {
      ElMessage.error(res.message || '加载举报详情失败')
    }
  } catch (error) {
    console.error('加载举报详情错误:', error)
    ElMessage.error('加载举报详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理举报
const processReport = async (status) => {
  const actionText = status === 1 ? '有效' : '无效'
  const confirmMessage = status === 1 
    ? '将该举报标记为有效会对举报内容进行处理，是否继续？' 
    : '将该举报标记为无效，是否继续？'

  ElMessageBox.confirm(
    confirmMessage,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    processing.value = true
    try {
      console.log('处理举报参数:', {
        reportId: reportId,
        status,
        adminId
      })
      const res = await submitReportAction({
        reportId: reportId,
        status,
        adminId: adminId
      })

      if (res.code === 200) {
        ElMessage.success(`已将举报标记为${actionText}`)
        // 重新加载详情
        loadReportData()
      } else {
        ElMessage.error(res.message || '处理举报失败')
      }
    } catch (error) {
      console.error('处理举报错误:', error)
      ElMessage.error('处理举报失败，请稍后重试')
    } finally {
      processing.value = false
    }
  }).catch(() => {
    // 取消操作
  })
}

// 初始化时加载数据
onMounted(() => {
  loadReportData()
})
</script>

<style scoped>
.report-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 0 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.detail-header .title h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.detail-header .operations {
  display: flex;
  gap: 10px;
}

.detail-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.user-card {
  margin-top: 10px;
}

.user-info-container {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 20px;
}

.user-details h4 {
  margin: 0 0 10px;
}

.user-details p {
  margin: 5px 0;
  color: #606266;
}

.content-card {
  margin-top: 10px;
}

.post-header,
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-user,
.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-time,
.comment-time {
  color: #909399;
  font-size: 14px;
}

.post-content,
.comment-content {
  margin-bottom: 15px;
  line-height: 1.6;
}

.post-media {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.media-item {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.comment-stats {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.action-section {
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.footer-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
