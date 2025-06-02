<template>
  <div class="report-container">
    <el-card class="report-card">
      <div class="card-header">
        <div class="header-left">
          <h2 class="title">
            <el-icon><warning /></el-icon>
            举报管理
            <el-tag v-if="total > 0" type="danger" size="small">{{ total }}</el-tag>
          </h2>
        </div>
        <div class="header-right">
          <el-button 
            type="primary" 
            :icon="RefreshRight" 
            @click="loadReportList" 
            :loading="loading"
          >
            刷新
          </el-button>
        </div>
      </div>

      <!-- 搜索表单 -->
      <div class="filter-container">
        <el-form :inline="true">
          <el-form-item>
            <el-select v-model="filters.status" placeholder="举报状态" clearable style="width: 150px;">
              <el-option label="待处理" :value="0" />
              <el-option label="已处理(有效)" :value="1" />
              <el-option label="已处理(无效)" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.targetType" placeholder="举报类型" clearable style="width: 150px;">
              <el-option label="动态" :value="1" />
              <el-option label="评论" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 举报列表表格 -->
      <el-table
        v-loading="loading"
        :data="reportList"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        stripe
        highlight-current-row
        :empty-text="'暂无举报数据'"
      >
        <el-table-column prop="reportId" label="ID" width="80" sortable />
        <el-table-column label="举报人" width="100">
          <template #default="{ row }">
            <span>{{ row.reporterNickname || '未知用户' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="举报类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.targetType === 1 ? 'warning' : 'info'">
              {{ row.targetTypeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="举报原因" min-width="200" show-overflow-tooltip />

        <el-table-column label="举报时间" width="150" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt, 'YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ formatReportStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button 
                type="primary" 
                size="small" 
                @click="showReportDetail(row.reportId)"
                :disabled="loading"
              >
                详情
              </el-button>
              
              <el-button 
                v-if="row.status === 0" 
                type="success" 
                size="small" 
                @click="handleReportAction(row.reportId, 1)"
                :disabled="loading"
              >
                有效
              </el-button>
              
              <el-button 
                v-if="row.status === 0" 
                type="warning" 
                size="small" 
                @click="handleReportAction(row.reportId, 2)"
                :disabled="loading"
              >
                无效
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :disabled="loading"
          background
        />
      </div>
    </el-card>

    <!-- 不再使用对话框，而是跳转到独立详情页面 -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Warning } from '@element-plus/icons-vue'
import { getPendingReports, handleReport, filterReports } from '@/api/report'
import { formatDateTime } from '@/utils/date'

// 获取管理员ID
// 注意：实际中应从用户信息中获取真实的管理员ID
// 这里我们使用一个默认值作为示例
const adminId = 1

// 举报列表数据
const reportList = ref([])
const loading = ref(false)
const total = ref(0)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 筛选条件
const filters = reactive({
  status: null,
  targetType: null
})

// 详情相关
const reportDetailVisible = ref(false)
const currentReportId = ref(null)

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

// 加载举报列表
const loadReportList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value - 1, // API需要的页码从0开始
      size: pageSize.value
    }

    // 添加过滤条件
    if (filters.status !== null) {
      params.status = filters.status
    }
    if (filters.targetType !== null) {
      params.targetType = filters.targetType
    }

    console.log('请求参数:', params)
    
    // 使用新的filterReports API而不是getPendingReports
    const response = filters.status !== null || filters.targetType !== null
      ? await filterReports(params)
      : await getPendingReports(params)
      
    console.log('举报列表响应:', response)
    
    if (response.code === 200) {
      // 处理分页响应数据
      if (response.data && response.data.content) {
        // 新API返回格式
        reportList.value = response.data.content
        total.value = response.data.totalElements || 0
      } else if (Array.isArray(response.data)) {
        // 兼容原来API返回格式
        reportList.value = response.data
        total.value = reportList.value.length
      } else {
        reportList.value = []
        total.value = 0
      }
      console.log('加载到的数据:', reportList.value, '总记录数:', total.value)
    } else {
      console.error('加载失败:', response.message)
      ElMessage.error(response.message || '加载举报列表失败')
    }
  } catch (error) {
    console.error('加载举报列表错误:', error)
    ElMessage.error('加载举报列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1 // 重置到第一页
  loadReportList()
}

// 重置筛选条件
const resetFilter = () => {
  // 重置所有筛选条件
  filters.status = null
  filters.targetType = null
  
  // 重置分页并重新加载
  currentPage.value = 1
  loadReportList()
  
  ElMessage.success('筛选条件已重置')
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  loadReportList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadReportList()
}

const router = useRouter()

// 查看详情
const showReportDetail = (reportId) => {
  router.push(`/reports/${reportId}`)
}

// 处理举报
const handleReportAction = async (reportId, status) => {
  const actionText = status === 1 ? '标记为有效' : '标记为无效'
  const confirmMessage = status === 1 
    ? '将该举报标记为有效会对举报内容进行处理，是否继续？' 
    : '将该举报标记为无效将不会对举报内容进行处理，是否继续？'

  try {
    await ElMessageBox.confirm(confirmMessage, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: status === 1 ? 'warning' : 'info'
    })

    loading.value = true
    const params = {
      reportId,
      status,
      adminId: adminId
    }
    console.log('处理举报请求参数:', params)
    
    const response = await handleReport(params)
    console.log('处理举报响应:', response)

    if (response.code === 200) {
      ElMessage.success(`举报${actionText}成功`)
      loadReportList()
    } else {
      console.error('处理举报失败:', response.message)
      ElMessage.error(response.message || `举报${actionText}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理举报错误:', error)
      ElMessage.error(`处理举报失败，请稍后重试`)
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadReportList()
})
</script>

<style scoped>
.report-container {
  padding: 20px;
  min-height: calc(100vh - 150px);
}

.report-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.operation-buttons {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.report-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-content-preview {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
