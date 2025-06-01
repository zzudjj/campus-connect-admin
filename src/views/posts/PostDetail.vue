<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPostDetail, getPostMedia } from '@/api/post';
import { ElMessage } from 'element-plus';
import { ArrowLeft, RefreshRight, Picture, VideoPlay } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const postId = route.query.postId ? Number(route.query.postId) : null;
const loading = ref(false);
const mediaLoading = ref(false);
const postDetail = ref(null);
const mediaList = ref([]);
const error = ref('');

// 获取动态详情
// 获取动态媒体文件
const fetchPostMedia = async () => {
  if (!postId) return;
  
  mediaLoading.value = true;
  try {
    // 严格按照API文档调用媒体文件接口
    const res = await getPostMedia({ postId });
    console.log('媒体文件API响应:', res);
    
    if (res.code === 200 && res.data) {
      // 处理媒体文件列表并按sortOrder排序
      const mediaFiles = res.data;
      
      // 检查是否所有sortOrder都为0
      const allZeroOrder = mediaFiles.every(media => !media.sortOrder || media.sortOrder === 0);
      
      // 如果所有sortOrder都为0，根据数组索引分配序号
      if (allZeroOrder) {
        mediaList.value = mediaFiles.map((media, index) => ({
          ...media,
          displayOrder: index + 1 // 显示序号从1开始
        }));
      } else {
        // 如果sortOrder有效，按sortOrder排序
        mediaList.value = [...mediaFiles].sort((a, b) => {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }).map(media => ({
          ...media,
          displayOrder: media.sortOrder || 0
        }));
      }
      
      console.log('处理后的媒体文件数据:', mediaList.value);
    } else {
      ElMessage.warning('获取媒体文件失败: ' + (res.message || '未知错误'));
    }
  } catch (err) {
    console.error('获取媒体文件出错:', err);
    ElMessage.warning('获取媒体文件时发生错误');
  } finally {
    mediaLoading.value = false;
  }
};

const fetchPostDetail = async () => {
  loading.value = true;
  error.value = '';
  postDetail.value = null;
  mediaList.value = [];
  
  try {
    if (!postId) {
      error.value = '动态ID不能为空';
      ElMessage.error('动态ID不能为空');
      return;
    }

    const res = await getPostDetail({ postId });
    console.log('动态详情API响应:', res);
    
    if (res.code === 200 && res.data) {
      // 处理成功响应，注意data是嵌套的
      postDetail.value = {
        ...res.data.data, // 主要数据
        tags: res.data.tags || [] // 标签列表
      };
      console.log('处理后的数据:', postDetail.value);
      
      // 获取媒体文件
      fetchPostMedia();
    } else {
      error.value = res.message || '获取动态详情失败';
      ElMessage.error(error.value);
    }
  } catch (err) {
    console.error('获取动态详情出错:', err);
    error.value = '网络错误，请稍后重试';
    ElMessage.error('获取动态详情时发生错误');
  } finally {
    loading.value = false;
  }
};

// 返回列表页
const goBack = () => {
  router.push('/posts');
};

// 刷新数据
const refreshData = () => {
  ElMessage.info('正在刷新数据...');
  fetchPostDetail(); // 这会调用fetchPostMedia
};

// 获取媒体类型图标
const getMediaTypeIcon = (type) => {
  return type === 0 ? Picture : VideoPlay;
};

// 获取媒体类型文本
const getMediaTypeText = (type) => {
  return type === 0 ? '图片' : '视频';
};

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  const date = new Date(dateTimeString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '正常',
    1: '已删除',
    2: '已置顶',
    3: '已屏蔽'
  };
  return statusMap[status] || '未知';
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'success',
    1: 'danger',
    2: 'warning',
    3: 'info'
  };
  return typeMap[status] || '';
};

onMounted(() => {
  fetchPostDetail();
});
</script>

<template>
  <div class="post-detail-container">
    <el-card class="post-detail-card">
      <template #header>
        <div class="detail-header">
          <div class="header-left">
            <span class="page-title">动态详情</span>
            <el-tag
              v-if="postDetail && postDetail.visibility !== undefined"
              :type="getStatusType(postDetail.visibility)"
              class="status-tag"
            >
              {{ getStatusText(postDetail.visibility) }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button @click="goBack" text>
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <el-button @click="refreshData" text>
              <el-icon><RefreshRight /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-loading="loading">
        <!-- 错误提示 -->
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
        
        <!-- 数据为空 -->
        <el-empty 
          v-else-if="!postDetail" 
          description="暂无动态数据" 
        />
        
        <!-- 动态详情内容 -->
        <div v-else class="detail-content">
          <!-- 基础信息 -->
          <el-descriptions title="基础信息" :column="2" border>
            <el-descriptions-item label="动态ID">{{ postDetail.postId }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ postDetail.userId }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ postDetail.title || '无标题' }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ formatDateTime(postDetail.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(postDetail.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(postDetail.visibility)">
                {{ getStatusText(postDetail.visibility) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 统计信息 -->
          <el-descriptions title="统计信息" :column="4" border class="mt-20">
            <el-descriptions-item label="查看数">{{ postDetail.viewNum || 0 }}</el-descriptions-item>
            <el-descriptions-item label="点赞数">{{ postDetail.likeNum || 0 }}</el-descriptions-item>
            <el-descriptions-item label="评论数">{{ postDetail.commentNum || 0 }}</el-descriptions-item>
            <el-descriptions-item label="热度评分">{{ postDetail.hotScore || 0 }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 动态内容 -->
          <div class="section">
            <h3>动态内容</h3>
            <el-card shadow="never" class="content-card">
              <div v-if="postDetail.content" class="content-text">{{ postDetail.content }}</div>
              <el-empty v-else description="暂无内容" />
            </el-card>
          </div>
          
          <!-- 标签信息 -->
          <div class="section">
            <h3>标签</h3>
            <div v-if="postDetail.tags && postDetail.tags.length > 0" class="tags-container">
              <el-tag 
                v-for="tag in postDetail.tags" 
                :key="tag.tagId"
                class="tag-item"
                type="info"
                effect="light"
              >
                {{ tag.name }}
              </el-tag>
            </div>
            <el-empty v-else description="暂无标签" />
          </div>
          
          <!-- 媒体文件 -->
          <!-- 媒体文件 -->
          <div class="section">
            <h3>媒体文件 ({{ mediaList.length }})</h3>
            <div v-loading="mediaLoading">
              <div v-if="mediaList.length > 0" class="media-list">
                <el-card 
                  v-for="media in mediaList" 
                  :key="media.mediaId"
                  class="media-item"
                  shadow="hover"
                >
                  <template #header>
                    <div class="media-header">
                      <div class="media-type">
                        <el-icon><component :is="getMediaTypeIcon(media.mediaType)" /></el-icon>
                        <span>{{ getMediaTypeText(media.mediaType) }}</span>
                      </div>
                      <span class="sort-order">顺序: {{ media.displayOrder || media.sortOrder || 0 }}</span>
                    </div>
                  </template>
                  <div class="media-content">
                    <el-image 
                      v-if="media.mediaType === 0"
                      :src="media.mediaUrl" 
                      fit="contain"
                      :preview-src-list="[media.mediaUrl]"
                      class="media-image"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>加载失败</span>
                        </div>
                      </template>
                    </el-image>
                    <video 
                      v-else-if="media.mediaType === 1" 
                      :src="media.mediaUrl"
                      class="media-video"
                      controls
                    ></video>
                    <div class="media-url">
                      <span class="url-label">链接:</span>
                      <el-link type="primary" :href="media.mediaUrl" target="_blank" class="url-value">{{ media.mediaUrl }}</el-link>
                    </div>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无媒体文件" />
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.post-detail-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.status-tag {
  margin-left: 10px;
}

.detail-content {
  margin-top: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.section {
  margin-top: 25px;
}

.section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #303133;
}

.content-card {
  background-color: var(--el-bg-color-page);
}

.content-text {
  padding: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  margin-bottom: 5px;
}

.media-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 10px;
}

.media-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.media-item:hover {
  transform: translateY(-3px);
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.media-type {
  display: flex;
  align-items: center;
  gap: 5px;
}

.media-content {
  padding: 15px;
}

.media-image, .media-video {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 10px;
}

.media-url {
  display: flex;
  align-items: flex-start;
  margin-top: 10px;
  font-size: 13px;
}

.url-label {
  margin-right: 8px;
  white-space: nowrap;
  color: #606266;
}

.url-value {
  word-break: break-all;
}

.image-error {
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #909399;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>