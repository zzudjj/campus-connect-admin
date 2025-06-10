<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllTags, createSystemTag, searchTags, deleteTag } from '@/api/tag'
import { Plus, Search, Delete, RefreshRight } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

// 搜索关键词
const searchKeyword = ref('')

// 表格数据
const tableData = ref([])
const filteredData = ref([])
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 多选相关
const multipleSelection = ref([])
const hasSelected = ref(false)

// 表格设置
const tableHeight = ref('450px')
const tableStripe = ref(true)

// 创建标签对话框
const createDialogVisible = ref(false)
const newTagName = ref('')
const newTagType = ref(0) // 默认系统标签

// 获取所有标签
const fetchAllTags = async () => {
  loading.value = true
  try {
    const res = await getAllTags()
    if (res.code === 200 && res.data) {
      tableData.value = res.data
      total.value = res.data.length
      handleCurrentChange(currentPage.value) // 处理当前页数据
    } else {
      ElMessage.error(res.message || '获取标签列表失败')
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

// 处理分页数据
const handleCurrentChange = (val) => {
  currentPage.value = val
  const startIndex = (val - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  filteredData.value = tableData.value.slice(startIndex, endIndex)
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  handleCurrentChange(1) // 重置为第1页
}

// 表格多选事件
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
  hasSelected.value = selection.length > 0
}

// 搜索标签
const searchByKeyword = async () => {
  if (!searchKeyword.value.trim()) {
    // 如果搜索关键词为空，则获取所有标签
    return fetchAllTags()
  }
  
  loading.value = true
  try {
    const res = await searchTags({ name: searchKeyword.value.trim() })
    if (res.code === 200 && res.data) {
      tableData.value = res.data
      total.value = res.data.length
      currentPage.value = 1 // 重置到第一页
      handleCurrentChange(1) // 处理当前页数据
    } else {
      ElMessage.error(res.message || '搜索标签失败')
    }
  } catch (error) {
    console.error('搜索标签失败:', error)
    ElMessage.error('搜索标签失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  fetchAllTags()
}

// 打开创建标签对话框
const openCreateDialog = () => {
  newTagName.value = ''
  newTagType.value = 0 // 默认系统标签
  createDialogVisible.value = true
}

// 创建系统标签
const createTag = async () => {
  if (!newTagName.value.trim()) {
    ElMessage.warning('标签名称不能为空')
    return
  }
  
  try {
    const res = await createSystemTag({
      name: newTagName.value.trim(),
      type: newTagType.value
    })
    
    if (res.code === 200) {
      ElMessage.success('创建标签成功')
      createDialogVisible.value = false
      fetchAllTags() // 刷新标签列表
    } else {
      ElMessage.error(res.message || '创建标签失败')
    }
  } catch (error) {
    console.error('创建标签失败:', error)
    ElMessage.error('创建标签失败')
  }
}

// 删除单个标签
const handleDeleteTag = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除标签「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteTag(row.tagId)
    if (res.code === 200) {
      ElMessage.success('删除标签成功')
      fetchAllTags() // 刷新标签列表
    } else {
      ElMessage.error(res.message || '删除标签失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
      ElMessage.error('删除标签失败')
    }
  }
}

// 批量删除标签
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的标签')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个标签吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    
    // 批量删除实现：使用 Promise.all 并行处理多个删除请求
    const promises = multipleSelection.value.map(tag => deleteTag(tag.tagId))
    const results = await Promise.allSettled(promises)
    
    // 统计成功和失败数量
    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.code === 200).length
    const failed = results.length - succeeded
    
    if (succeeded > 0) {
      ElMessage.success(`成功删除 ${succeeded} 个标签`)
    }
    if (failed > 0) {
      ElMessage.warning(`有 ${failed} 个标签删除失败`)
    }
    
    // 刷新标签列表
    fetchAllTags()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 格式化标签类型
const formatTagType = (type) => {
  return type === 0 ? '系统标签' : '用户标签'
}

onMounted(() => {
  fetchAllTags()
})
</script>

<template>
  <div class="tag-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入标签名称搜索"
          clearable
          @keyup.enter="searchByKeyword"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="search-buttons">
          <el-button type="primary" @click="searchByKeyword">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>新建系统标签
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <span class="card-title">标签管理</span>
            <el-tag type="info" class="data-count" v-if="tableData.length > 0">
              总计 {{ tableData.length }} 项
            </el-tag>
          </div>
          <div class="card-header-right">
            <el-button 
              type="danger" 
              size="small" 
              :disabled="!hasSelected"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>批量删除
            </el-button>
            <el-button @click="fetchAllTags" :icon="RefreshRight" circle plain title="刷新数据"></el-button>
          </div>
        </div>
      </template>
      
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="filteredData"
          border
          :stripe="tableStripe"
          style="width: 100%"
          fit
          @selection-change="handleSelectionChange"
          :empty-text="'无标签数据'"
        >
          <el-table-column type="selection" width="60" />
          <el-table-column prop="tagId" label="ID" width="120" sortable />
          <el-table-column prop="name" label="标签名称" min-width="250" show-overflow-tooltip />
          <el-table-column label="类型" width="180" sortable>
            <template #default="{ row }">
              <el-tag :type="row.type === 0 ? 'success' : 'info'">
                {{ formatTagType(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt, 'YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button
                  type="danger"
                  link
                  @click="handleDeleteTag(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 50, 100]"
            :layout="'total, sizes, prev, pager, next, jumper'"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </div>
    </el-card>

    <!-- 创建标签对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建系统标签"
      width="400px"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="标签名称" required>
          <el-input v-model="newTagName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签类型">
          <el-radio-group v-model="newTagType">
            <el-radio :label="0">系统标签</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createTag">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.tag-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.data-count {
  margin-left: 8px;
}

.table-card {
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.table-container {
  position: relative;
  width: 100%;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
}

.dialog-footer {
  padding-top: 16px;
  text-align: right;
  display: block;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-buttons {
    margin-top: 10px;
    justify-content: flex-end;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header-right {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style>