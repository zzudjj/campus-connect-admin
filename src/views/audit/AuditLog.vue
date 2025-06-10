<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><DocumentChecked /></el-icon>
            <span class="title">审计日志</span>
          </div>
          <div class="header-right">
            <el-button
              type="primary"
              :icon="RefreshRight"
              @click="fetchLogList"
              :loading="loading"
              circle
            />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="logList"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        stripe
        highlight-current-row
      >
        <el-table-column prop="logId" label="日志ID" width="100" sortable align="center" />
        <el-table-column prop="createdAt" label="操作时间" width="200" sortable>
           <template #default="{ row }">
            {{ formatDateTime(row.createdAt, 'YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop="adminId" label="管理员ID" width="120" sortable align="center" />
        <el-table-column prop="action" label="操作类型" width="180">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.action)" effect="light">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetEntity" label="目标实体" width="120">
           <template #default="{ row }">
            <el-tag :type="getTagType(row.targetEntity)" effect="dark">{{ row.targetEntity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="目标ID" width="100" align="center" />
        <el-table-column prop="details" label="详细信息" min-width="200" show-overflow-tooltip>
           <template #default="scope">
            <pre>{{ formatJson(scope.row.details) }}</pre>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-if="total > 0"
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[5, 10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchLogList"
          @current-change="fetchLogList"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAuditLogs } from '@/api/audit'
import { formatDateTime } from '@/utils/date'
import { ElMessage } from 'element-plus'
import { DocumentChecked, RefreshRight } from '@element-plus/icons-vue'

const loading = ref(true)
const logList = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  size: 10
})

const fetchLogList = async () => {
  loading.value = true
  try {
    const res = await getAuditLogs(queryParams)
    if (res.code === 200 && res.data) {
      logList.value = res.data.logs || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取日志失败')
    }
  } catch (error) {
    ElMessage.error('请求日志接口时发生错误')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatJson = (details) => {
  try {
    const obj = JSON.parse(details)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return details
  }
}

const handleSizeChange = (newSize) => {
  queryParams.size = newSize
  fetchLogList()
}

const handleCurrentChange = (newPage) => {
  queryParams.page = newPage
  fetchLogList()
}

onMounted(() => {
  fetchLogList()
})

const getTagType = (text) => {
  if (!text) return 'info'
  const hash = text.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const types = ['primary', 'success', 'info', 'warning', 'danger']
  const index = Math.abs(hash % types.length)
  return types[index]
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
