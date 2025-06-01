<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTagList, createTag, updateTag, deleteTag } from '@/api/tag'

// 搜索表单
const searchForm = ref({
  keyword: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 标签表单对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const tagForm = ref({
  id: null,
  name: '',
  description: '',
  color: '#409EFF'
})

// 获取标签列表
const fetchTagList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword
    }
    const res = await getTagList(params)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('获取标签列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTagList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: ''
  }
  handleSearch()
}

// 打开创建标签对话框
const handleCreate = () => {
  dialogTitle.value = '创建标签'
  tagForm.value = {
    id: null,
    name: '',
    description: '',
    color: '#409EFF'
  }
  dialogVisible.value = true
}

// 打开编辑标签对话框
const handleEdit = (row) => {
  dialogTitle.value = '编辑标签'
  tagForm.value = { ...row }
  dialogVisible.value = true
}

// 提交标签表单
const handleSubmit = async () => {
  try {
    if (tagForm.value.id) {
      await updateTag(tagForm.value.id, tagForm.value)
      ElMessage.success('更新成功')
    } else {
      await createTag(tagForm.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchTagList()
  } catch (error) {
    console.error('保存标签失败:', error)
  }
}

// 删除标签
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该标签吗？', '提示', {
      type: 'warning'
    })
    await deleteTag(row.id)
    ElMessage.success('删除成功')
    fetchTagList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
    }
  }
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchTagList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchTagList()
}

onMounted(() => {
  fetchTagList()
})
</script>

<template>
  <div class="tag-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="标签名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>标签列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建标签
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :empty-text="'无数据'"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="标签名称" width="150">
          <template #default="{ row }">
            <el-tag :color="row.color">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="postCount" label="使用次数" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
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
          :prev-text="'上一页'"
          :next-text="'下一页'"
          :total-text="'共'"
          :page-size-text="'条/页'"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 标签表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        :model="tagForm"
        label-width="80px"
      >
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            placeholder="请输入标签描述"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="tagForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
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
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 