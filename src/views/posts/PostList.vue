<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPostList, updatePostStatus, deletePost } from '@/api/post'

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: '',
  category: '',
  dateRange: []
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 获取动态列表
const fetchPostList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
      status: searchForm.value.status,
      category: searchForm.value.category,
      startDate: searchForm.value.dateRange?.[0],
      endDate: searchForm.value.dateRange?.[1]
    }
    const res = await getPostList(params)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('获取动态列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchPostList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    category: '',
    dateRange: []
  }
  handleSearch()
}

// 更新动态状态
const handleStatusChange = async (row) => {
  try {
    await updatePostStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

// 删除动态
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该动态吗？', '提示', {
      type: 'warning'
    })
    await deletePost(row.id)
    ElMessage.success('删除成功')
    fetchPostList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除动态失败:', error)
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

onMounted(() => {
  fetchPostList()
})

// 组件卸载时重置状态
onBeforeUnmount(() => {
  // 简化处理，让Vue自然处理组件卸载
})
</script>

<template>
  <div class="post-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="标题/内容"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="已发布" value="published" />
            <el-option label="待审核" value="pending" />
            <el-option label="已删除" value="deleted" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable>
            <el-option label="学习" value="study" />
            <el-option label="二手" value="second-hand" />
            <el-option label="活动" value="activity" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
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
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :empty-text="'无数据'"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="row.category === 'study' ? 'success' : row.category === 'second-hand' ? 'warning' : row.category === 'activity' ? 'info' : ''">
              {{ row.category === 'study' ? '学习' : row.category === 'second-hand' ? '二手' : row.category === 'activity' ? '活动' : '其他' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'">
              {{ row.status === 'published' ? '已发布' : row.status === 'pending' ? '待审核' : '已删除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="$router.push(`/posts/${row.id}`)"
            >
              查看
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleStatusChange(row)"
            >
              通过
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
  </div>
</template>

<style scoped>
.post-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 