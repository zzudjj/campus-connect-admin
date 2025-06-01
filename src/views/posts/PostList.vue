<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPostList, updatePostStatus, deletePost, batchDeletePosts, searchPosts, togglePostBlock } from '@/api/post'
import { Search, Delete, View, CircleCheck, CircleClose, RefreshRight } from '@element-plus/icons-vue'

// 是否处于搜索模式
const isSearchMode = ref(false)

// 排序相关参数
// 使用前端排序，不需要单独存储

// 表格引用，用于操作表格选择
const postTableRef = ref(null)

// 选择的动态
const selectedPosts = ref([])

// 搜索表单
const searchForm = ref({
  content: '',  // API文档中的content字段
  userId: '',  // 添加用户ID搜索字段
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 计算选中动态数量
const selectedCount = computed(() => selectedPosts.value.length)

// 清除选中状态
const clearSelection = () => {
  postTableRef.value?.clearSelection()
  selectedPosts.value = []
}

// 处理表格排序变化
const handleSortChange = ({ prop, order }) => {
  console.log('排序变化:', prop, order)
  // 前端排序由Element Plus自动处理，无需手动处理
  // 这里只用于调试信息输出
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedPosts.value = selection
}

// 处理搜索提交
const handleSearch = () => {
  // 如果有任意搜索条件，就设置为搜索模式
  isSearchMode.value = !!searchForm.value.content || 
                       !!searchForm.value.userId || 
                       !!searchForm.value.status || 
                       (searchForm.value.dateRange && searchForm.value.dateRange.length > 0)
  
  if (!isSearchMode.value) {
    ElMessage.warning('请至少输入一项搜索条件')
    return
  }
  
  currentPage.value = 1 // 搜索时重置到第一页
  fetchPostList()
}

// 重置搜索表单
const resetSearch = () => {
  // 清空所有搜索条件
  searchForm.value = {
    content: '',  // 与API文档中的字段保持一致
    userId: '',   // 用户ID搜索字段
    status: '',
    dateRange: []
  }
  
  // 切换回普通列表模式
  isSearchMode.value = false
  
  // 重置到第一页
  currentPage.value = 1
  
  // 清空表格选择
  clearSelection()
  
  // 重新获取动态列表
  fetchPostList()
  
  ElMessage.success('已重置搜索条件，显示全部动态')
}

// 获取动态列表
const fetchPostList = async () => {
  loading.value = true
  try {
    let res;
    
    // 搜索模式下使用searchPosts接口，普通模式使用getPostList接口
    if (isSearchMode.value) {
      // 构建符合API文档的请求体数据
      const searchData = {
        page: currentPage.value,
        size: pageSize.value,
        content: searchForm.value.content || undefined,      // 内容关键词
        startDate: searchForm.value.dateRange?.[0] || undefined,
        endDate: searchForm.value.dateRange?.[1] || undefined
      }
      
      // 处理状态参数，如果有选择状态，则传递正确的值
      if (searchForm.value.status) {
        // 转换为数字类型
        searchData.visibility = parseInt(searchForm.value.status)
      }
      
      // 如果有用户ID，添加到搜索参数中
      if (searchForm.value.userId) {
        searchData.userId = parseInt(searchForm.value.userId)
      }
      
      // 将空值属性移除，避免发送不必要的参数
      Object.keys(searchData).forEach(key => {
        if (searchData[key] === undefined || searchData[key] === '') {
          delete searchData[key];
        }
      });
      
      console.log('发送搜索请求数据:', searchData);
      // 使用POST请求发送请求体数据
      res = await searchPosts(searchData);
    } else {
      // 普通列表模式，使用GET请求发送查询参数
      const params = {
        page: currentPage.value,
        size: pageSize.value
      }
      
      console.log('发送列表请求参数:', params);
      res = await getPostList(params);
    }
    console.log('接收到响应:', res)
    
    if (res.code === 200 && res.data) {
      // 根据 API 文档结构解析数据
      const posts = Array.isArray(res.data.posts) ? res.data.posts : []
      
      // 数据预处理，确保所有必要的字段都存在
      tableData.value = posts.map(post => ({
        ...post,
        // 确保标题字段存在，如果标题不存在则使用内容前一部分
        title: post.title || (post.content ? post.content.substring(0, 30) + '...' : '无标题'),
        // 统一数字字段
        viewNum: post.viewNum ?? 0,
        likeNum: post.likeNum ?? 0,
        commentNum: post.commentNum ?? 0,
        hotScore: post.hotScore ?? 0
      }))
      
      total.value = res.data.totalCount || 0
      console.log('处理后的数据:', tableData.value)
    } else {
      tableData.value = []
      total.value = 0
      ElMessage.error(`获取动态列表失败: ${res.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('获取动态列表失败:', error)
    ElMessage.error(`获取动态列表失败: ${error.message || String(error)}`)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 更新动态状态
const handleStatusChange = async (row) => {
  // 判断当前状态并设置新状态
  const isCurrentlyBlocked = row.visibility === 3;
  const newVisibility = isCurrentlyBlocked ? 0 : 3; // 如果当前是屏蔽状态，则恢复为公开，否则屏蔽
  const statusText = isCurrentlyBlocked ? '恢复显示' : '屏蔽';
  
  try {
    await ElMessageBox.confirm(`确定要${statusText}该动态吗？`, `动态${statusText}确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: isCurrentlyBlocked ? 'success' : 'warning'
    })
    
    console.log(`发送切换状态请求: postId=${row.postId}`)
    
    // 使用togglePostBlock函数切换屏蔽状态
    const res = await togglePostBlock({
      postId: row.postId
    })
    
    console.log('更新状态响应:', res)
    
    if (res.code === 200) {
      ElMessage.success(`动态${statusText}成功`)
      // 更新本地数据
      row.visibility = newVisibility
    } else {
      ElMessage.error(`操作失败: ${res.message || '未知错误'}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新动态状态失败:', error)
      ElMessage.error(`更新动态状态失败: ${error.message || String(error)}`)
    }
  }
}

// 删除动态
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该动态吗？', '删除动态', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log(`发送删除动态请求: postId=${row.postId}`)
    
    const res = await deletePost({
      postId: row.postId
    })
    
    console.log('删除动态响应:', res)
    
    if (res.code === 200) {
      ElMessage.success('动态删除成功')
      fetchPostList()
    } else {
      ElMessage.error(`删除失败: ${res.message || '未知错误'}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除动态失败:', error)
      ElMessage.error(`删除动态失败: ${error.message || String(error)}`)
    }
  }
}

// 批量删除动态
const handleBatchDelete = async () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要删除的动态')
    return
  }
  
  const postCount = selectedPosts.value.length
  
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${postCount} 条动态吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    
    try {
      const postIds = selectedPosts.value.map(post => post.postId)
      const res = await batchDeletePosts({
        postIds: postIds
      })
      
      if (res.code === 200) {
        ElMessage.success(`批量删除成功: ${postCount} 条动态`)
        // 清空选择
        clearSelection()
        // 重新获取列表
        fetchPostList()
      } else {
        ElMessage.error(`批量删除失败: ${res.message || '未知错误'}`)
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error(`批量删除失败: ${error.message || String(error)}`)
    } finally {
      loading.value = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除操作失败:', error)
    }
  }
}

// 批量屏蔽动态
const handleBatchBlock = async () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要屏蔽的动态')
    return
  }
  
  const postCount = selectedPosts.value.length
  // 只选择非屏蔽状态的动态
  const filteredPosts = selectedPosts.value.filter(post => post.visibility !== 3) 
  
  if (filteredPosts.length === 0) {
    ElMessage.warning('所选动态已全部处于屏蔽状态')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要批量屏蔽选中的 ${filteredPosts.length} 条动态吗？`,
      '批量屏蔽确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    let successCount = 0
    let failCount = 0
    
    console.log('批量屏蔽开始处理:', filteredPosts.length, '条数据')
    
    // 使用Promise.all并发处理所有请求
    try {
      const updatePromises = filteredPosts.map(post => {
        return updatePostStatus({
          postId: post.postId,
          status: 3 // 屏蔽状态对应visibility=3
        })
      })
      
      const results = await Promise.all(updatePromises)
      console.log('批量屏蔽结果:', results)
      
      results.forEach((res, index) => {
        if (res.code === 200) {
          successCount++
          // 更新本地数据状态
          const postId = filteredPosts[index].postId
          const tablePost = tableData.value.find(p => p.postId === postId)
          if (tablePost) {
            tablePost.visibility = 3
          }
        } else {
          failCount++
        }
      })
      
      if (successCount > 0) {
        ElMessage.success(`批量屏蔽成功: ${successCount} 条动态`)
      }
      
      if (failCount > 0) {
        ElMessage.warning(`${failCount} 条动态屏蔽失败`)
      }
      
      // 清空选择
      clearSelection()
    } catch (error) {
      console.error('批量屏蔽失败:', error)
      ElMessage.error(`批量屏蔽失败: ${error.message || String(error)}`)
    } finally {
      loading.value = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量屏蔽操作失败:', error)
    }
  }
}

// 批量恢复动态
const handleBatchRestore = async () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要恢复的动态')
    return
  }
  
  // 只选择被屏蔽状态的动态
  const filteredPosts = selectedPosts.value.filter(post => post.visibility === 3) 
  
  if (filteredPosts.length === 0) {
    ElMessage.warning('所选动态中没有被屏蔽的动态')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要批量恢复选中的 ${filteredPosts.length} 条动态吗？`,
      '批量恢复确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    loading.value = true
    let successCount = 0
    let failCount = 0
    
    console.log('批量恢复开始处理:', filteredPosts.length, '条数据')
    
    // 使用Promise.all并发处理所有请求
    try {
      const updatePromises = filteredPosts.map(post => {
        return updatePostStatus({
          postId: post.postId,
          status: 0 // 恢复为公开状态，对应visibility=0
        })
      })
      
      const results = await Promise.all(updatePromises)
      console.log('批量恢复结果:', results)
      
      results.forEach((res, index) => {
        if (res.code === 200) {
          successCount++
          // 更新本地数据状态
          const postId = filteredPosts[index].postId
          const tablePost = tableData.value.find(p => p.postId === postId)
          if (tablePost) {
            tablePost.visibility = 0
          }
        } else {
          failCount++
        }
      })
      
      if (successCount > 0) {
        ElMessage.success(`批量恢复成功: ${successCount} 条动态`)
      }
      
      if (failCount > 0) {
        ElMessage.warning(`${failCount} 条动态恢复失败`)
      }
      
      // 清空选择
      clearSelection()
    } catch (error) {
      console.error('批量恢复失败:', error)
      ElMessage.error(`批量恢复失败: ${error.message || String(error)}`)
    } finally {
      loading.value = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量恢复操作失败:', error)
    }
  }
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchPostList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchPostList()
}

// 获取动态状态对应的标签类型
const getStatusType = (visibility) => {
  // 如果是负数，视为屏蔽状态
  if (visibility < 0) {
    return 'danger';
  }
  
  const types = {
    0: 'success',  // 公开可见
    1: 'warning',  // 仅关注者可见
    2: 'info',     // 仅自己可见
    3: 'danger'    // 已屏蔽
  }
  return types[visibility] || 'info'
}

// 获取动态状态对应的文本
const getStatusText = (visibility) => {
  // 如果是负数，视为屏蔽状态
  if (visibility < 0) {
    return '已屏蔽';
  }
  
  const texts = {
    0: '公开',
    1: '仅关注者',
    2: '仅自己',
    3: '已屏蔽'
  }
  return texts[visibility] || '已屏蔽'  // 默认显示为屏蔽而不是未知状态
}

// 获取动态分类对应的文本
const getCategoryText = (category) => {
  const texts = {
    'study': '学习',
    'second-hand': '二手',
    'activity': '活动',
    'other': '其他'
  }
  return texts[category] || '未知类型'
}

// 格式化时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'
  
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  } catch (error) {
    console.error('日期格式化失败:', error)
    return dateTimeStr
  }
}

onMounted(() => {
  fetchPostList()
})
</script>

<template>
  <div class="post-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="内容关键词">
          <el-input
            v-model="searchForm.content"
            placeholder="动态内容关键词"
            clearable
          />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.userId"
            placeholder="输入用户ID"
            clearable
            type="number"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="min-width: 120px;">
            <el-option label="正常" value="1" />
            <el-option label="已屏蔽" value="-1" />
          </el-select>
        </el-form-item>
        <!-- 根据API文档移除标签搜索选项 -->
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :locale="{
              rangeSeparator: '至',
              placeholder: '请选择日期',
              firstDayOfWeek: 1,
              weekdays: ['日', '一', '二', '三', '四', '五', '六'],
              months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
            }"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshRight /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 批量操作区域 -->
    <div class="batch-actions-container">
      <div class="selected-info" v-if="selectedPosts.length > 0">
        <span class="selected-count">已选择 {{ selectedPosts.length }} 项</span>
      </div>
      <div class="batch-buttons">
        <el-button 
          type="danger" 
          size="small" 
          :loading="loading" 
          :disabled="selectedPosts.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
        <el-button 
          type="warning" 
          size="small" 
          :loading="loading" 
          :disabled="selectedPosts.length === 0"
          @click="handleBatchBlock"
        >
          <el-icon><CircleClose /></el-icon> 批量屏蔽
        </el-button>
        <el-button 
          type="success" 
          size="small" 
          :loading="loading" 
          :disabled="selectedPosts.length === 0"
          @click="handleBatchRestore"
        >
          <el-icon><CircleCheck /></el-icon> 批量恢复
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table
        ref="postTable"
        :data="tableData"
        style="width: 100%"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
        height="calc(100vh - 335px)"
        @sort-change="handleSortChange"
      >  
        <!-- 新增多选列 -->
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="postId" label="ID" width="80" sortable />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.title || '无标题' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100" sortable />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.visibility)">
              {{ getStatusText(row.visibility) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="查看数" width="90" prop="viewNum" sortable>
          <template #default="{ row }">
            <span>{{ row.viewNum !== undefined ? row.viewNum : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="点赞数" width="90" prop="likeNum" sortable>
          <template #default="{ row }">
            <span>{{ row.likeNum !== undefined ? row.likeNum : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评论数" width="90" prop="commentNum" sortable>
          <template #default="{ row }">
            <span>{{ row.commentNum !== undefined ? row.commentNum : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="180" sortable prop="createdAt">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="热度" width="100" prop="hotScore" sortable>
          <template #default="{ row }">
            <span>{{ row.hotScore !== undefined ? row.hotScore : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="$router.push(`/posts/detail?postId=${row.postId}`)"
            >
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button
              :type="row.visibility === 3 ? 'success' : 'warning'"
              link
              @click="handleStatusChange(row)"
            >
              <el-icon v-if="row.visibility !== 3"><CircleClose /></el-icon>
              <el-icon v-else><CircleCheck /></el-icon> 
              {{ row.visibility === 3 ? '恢复' : '屏蔽' }}
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-if="!loading"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.post-list {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.search-card {
  margin-bottom: 15px;
}

/* 批量操作区域样式 */
.batch-actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 0;
}

.selected-info {
  font-size: 14px;
  color: #606266;
}

.selected-count {
  margin-right: 15px;
  font-weight: bold;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 调整表格内容垂直居中 */
:deep(.el-table .cell) {
  display: flex;
  align-items: center;
}

:deep(.el-table__row) {
  height: 55px;
}
</style> 