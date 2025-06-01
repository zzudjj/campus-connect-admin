<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  searchUsers,
  pageUsers,
  updateUserStatus, 
  batchUpdateUserStatus,
  verifyUserAuth,
  getUserAuthDetail,
  getPendingAuthUsers
} from '@/api/user'

// 用户列表管理数据状态

// 搜索表单
const searchForm = ref({
  nickname: '',
  email: '',
  school: '',
  department: '',
  authStatus: '',
  accountStatus: '',
  dateRange: []
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)

// 分页
const currentPage = ref(1)  // 从1开始
const pageSize = ref(10)

// 批量操作相关
const multipleSelection = ref([])
const hasSelected = computed(() => multipleSelection.value.length > 0)

// 认证详情相关状态
const authDetailVisible = ref(false)
const authDetailLoading = ref(false)
const authDetailData = ref(null)

// 用户详情相关状态
const userDetailVisible = ref(false)
const userDetailLoading = ref(false)
const userDetailData = ref(null)

// 图片预览相关状态已移除

// 组件卸载时清理状态
onBeforeUnmount(() => {
  // 只需要确保关闭对话框
  userDetailVisible.value = false;
  authDetailVisible.value = false;
})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    let res
    
    // 判断是否有搜索条件
    const hasSearchCondition = Object.values(searchForm.value).some(val => 
      val !== '' && val !== null && (Array.isArray(val) ? val.length > 0 : true)
    )
    
    if (hasSearchCondition) {
      // 有搜索条件时使用searchUsers接口
      const params = { ...searchForm.value, page: currentPage.value, size: pageSize.value }
      
      // 处理日期范围
      if (params.dateRange && params.dateRange.length === 2) {
        params.startDate = params.dateRange[0]
        params.endDate = params.dateRange[1]
        delete params.dateRange
      }
      
      res = await searchUsers(params)
    } else {
      // 无搜索条件时使用pageUsers接口
      res = await pageUsers({
        page: currentPage.value,
        size: pageSize.value
      })
    }

    if (res.code === 200) {
      tableData.value = res.data.users || []
      total.value = res.data.totalCount || 0
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1  // 重置为第一页（后端从1开始）
  fetchUserList()
}

// 重置搜索条件
const handleReset = () => {
  searchForm.value = {
    nickname: '',
    email: '',
    school: '',
    department: '',
    authStatus: '',
    accountStatus: '',
    dateRange: []
  }
  currentPage.value = 1
  fetchUserList()
}

// 更新用户状态
const handleStatusChange = async (row) => {
  try {
    const data = {
      userId: row.userId,
      accountStatus: row.accountStatus
    }
    const res = await updateUserStatus(data)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(res.message || '状态更新失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 审核用户认证
const handleVerifyAuth = async (row, authStatus) => {
  try {
    await ElMessageBox.confirm(`确定要${authStatus === 1 ? '通过' : '拒绝'}该用户的认证申请吗？`, '认证审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const data = {
      userId: row.id,
      authStatus: authStatus
    }
    
    const res = await verifyUserAuth(data)
    if (res.code === 200) {
      ElMessage.success('审核操作成功')
      fetchUserList()
    } else {
      ElMessage.error(res.message || '审核操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核操作失败:', error)
      ElMessage.error('审核操作失败')
    }
  }
}

// 查看用户认证详情
const handleViewAuthDetail = async (userId) => {
  try {
    authDetailLoading.value = true
    authDetailVisible.value = true
    
    const res = await getUserAuthDetail({ userId })
    if (res.code === 200) {
      authDetailData.value = res.data
    } else {
      ElMessage.error(res.message || '获取认证详情失败')
      authDetailVisible.value = false
    }
  } catch (error) {
    console.error('获取认证详情失败:', error)
    ElMessage.error('获取认证详情失败')
    authDetailVisible.value = false
  } finally {
    authDetailLoading.value = false
  }
}

// 关闭认证详情对话框
const closeAuthDetail = () => {
  authDetailVisible.value = false
  authDetailData.value = null
}

// 查看用户详情
const handleViewUserDetail = async (userId) => {
  try {
    userDetailLoading.value = true
    userDetailVisible.value = true
    
    // 使用现有的用户数据
    const user = tableData.value.find(item => item.userId === userId)
    if (user) {
      userDetailData.value = { ...user }
    } else {
      // 如果表格中没有找到用户数据，可以发起API请求获取
      ElMessage.error('获取用户详情失败')
      userDetailVisible.value = false
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
    userDetailVisible.value = false
  } finally {
    userDetailLoading.value = false
  }
}

// 关闭用户详情对话框
const closeUserDetail = () => {
  userDetailVisible.value = false
  userDetailData.value = null
}

// 批量选择
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 批量更新状态
const handleBatchUpdateStatus = async (status) => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  try {
    const statusText = status === 0 ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要批量${statusText}选中的${multipleSelection.value.length}个用户吗？`, '批量操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const data = {
      userIds: multipleSelection.value.map(item => item.userId),
      accountStatus: status
    }
    
    const res = await batchUpdateUserStatus(data)
    if (res.code === 200) {
      ElMessage.success(`批量${statusText}成功`)
      fetchUserList()
    } else {
      ElMessage.error(res.message || `批量${statusText}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量操作失败:', error)
      ElMessage.error('批量操作失败')
    }
  }
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page  // 页码直接使用（ElementPlus和API都从1开始）
  fetchUserList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1  // 重置为第一页
  fetchUserList()
}

// 图片预览功能已移除

// 时间格式化函数
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    console.error('日期格式化失败:', e)
    return dateTimeStr
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <div class="user-list">

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="昵称">
          <el-input
            v-model="searchForm.nickname"
            placeholder="用户昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="用户邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="学校">
          <el-input
            v-model="searchForm.school"
            placeholder="所属学校"
            clearable
          />
        </el-form-item>
        <el-form-item label="院系">
          <el-input
            v-model="searchForm.department"
            placeholder="所属院系"
            clearable
          />
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.accountStatus" placeholder="请选择" clearable>
            <el-option label="正常" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.authStatus" placeholder="请选择" clearable>
            <el-option label="未认证" :value="0" />
            <el-option label="已认证" :value="1" />
            <el-option label="认证中" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量操作区域 -->
    <el-card class="batch-card">
      <div class="batch-operations">
        <el-button
          type="success"
          :disabled="!hasSelected"
          @click="handleBatchUpdateStatus(0)"
        >
          <el-icon><check /></el-icon> 批量启用
        </el-button>
        <el-button
          type="danger"
          :disabled="!hasSelected"
          @click="handleBatchUpdateStatus(1)"
        >
          <el-icon><close /></el-icon> 批量禁用
        </el-button>
        <div class="selection-info" v-if="hasSelected">
          已选择 <span class="selected-count">{{ multipleSelection.length }}</span> 项
        </div>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :default-sort="{prop: 'userId', order: 'ascending'}"
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="userId" label="ID" width="80" sortable />
        <el-table-column prop="email" label="邮箱" sortable show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" sortable />
        <el-table-column prop="school" label="学校" sortable show-overflow-tooltip />
        <el-table-column prop="department" label="院系" sortable show-overflow-tooltip />
        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.authStatus === 0" type="info">未认证</el-tag>
            <el-tag v-else-if="row.authStatus === 1" type="success">已认证</el-tag>
            <el-tag v-else-if="row.authStatus === 2" type="warning">认证中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.accountStatus"
              :active-value="0"
              :inactive-value="1"
              active-text="正常"
              inactive-text="禁用"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180" sortable prop="createdAt">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-tooltip content="查看详情" placement="top">
                <el-button
                  type="primary"
                  link
                  @click="handleViewUserDetail(row.userId)"
                >
                  <el-icon><view /></el-icon> 详情
                </el-button>
              </el-tooltip>
              
              <!-- 认证中的用户显示认证操作按钮 -->
              <template v-if="row.authStatus === 2">
                <el-tooltip content="查看认证申请" placement="top">
                  <el-button 
                    type="info" 
                    link 
                    @click="handleViewAuthDetail(row.userId)"
                  >
                    <el-icon><document /></el-icon> 认证详情
                  </el-button>
                </el-tooltip>
                <el-tooltip content="通过认证" placement="top">
                  <el-button 
                    type="success" 
                    link 
                    @click="handleVerifyAuth(row, 1)"
                  >
                    <el-icon><check /></el-icon> 通过
                  </el-button>
                </el-tooltip>
                <el-tooltip content="拒绝认证" placement="top">
                  <el-button 
                    type="danger" 
                    link 
                    @click="handleVerifyAuth(row, 0)"
                  >
                    <el-icon><close /></el-icon> 拒绝
                  </el-button>
                </el-tooltip>
              </template>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <!-- 页码转换（API从0开始，ElementPlus从1开始） -->
        <el-pagination
          v-if="!loading"
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

  </div>
  
  <!-- 认证详情对话框 -->
  <el-dialog
    v-model="authDetailVisible"
    title="认证详情"
    width="800px"
    destroy-on-close
    :append-to-body="false"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    top="5vh"
  >
    <div v-loading="authDetailLoading" class="auth-detail-container">
      <template v-if="authDetailData">
        <div class="user-profile-section">
          <div class="avatar-container">
            <img 
              v-if="authDetailData.avatarUrl" 
              :src="authDetailData.avatarUrl" 
              alt="用户头像"
              class="user-avatar"
            >
            <el-icon v-else class="no-avatar"><user /></el-icon>
          </div>
          
          <div class="user-info">
            <h3>{{ authDetailData.nickname || '未设置昵称' }}</h3>
            <p><strong>邮箱：</strong>{{ authDetailData.email }}</p>
            <p><strong>学校：</strong>{{ authDetailData.school || '未填写' }}</p>
            <p><strong>院系：</strong>{{ authDetailData.department || '未填写' }}</p>
            <p><strong>认证状态：</strong>
              <el-tag v-if="authDetailData.authStatus === 0" type="info">未认证</el-tag>
              <el-tag v-else-if="authDetailData.authStatus === 1" type="success">已认证</el-tag>
              <el-tag v-else-if="authDetailData.authStatus === 2" type="warning">认证中</el-tag>
            </p>
            <p><strong>账户状态：</strong>
              <el-tag v-if="authDetailData.accountStatus === 0" type="success">正常</el-tag>
              <el-tag v-else type="danger">禁用</el-tag>
            </p>
          </div>
        </div>
        
        <div class="student-card-section">
          <h3>学生证件照片</h3>
          <div class="card-images">
            <div class="card-image-container">
              <h4>学生证正面</h4>
              <div class="image-wrapper" v-if="authDetailData.beforeCardUrl">
                <img 
                  :src="authDetailData.beforeCardUrl" 
                  alt="学生证正面" 
                  class="card-image"
                >
              </div>
              <el-empty v-else description="未提供学生证正面照片"></el-empty>
            </div>
            
            <div class="card-image-container">
              <h4>学生证背面</h4>
              <div class="image-wrapper" v-if="authDetailData.afterCardUrl">
                <img 
                  :src="authDetailData.afterCardUrl" 
                  alt="学生证背面" 
                  class="card-image"
                >
              </div>
              <el-empty v-else description="未提供学生证背面照片"></el-empty>
            </div>
          </div>
        </div>
        
        <div class="auth-notes" v-if="authDetailData.authNotes">
          <h3>认证备注</h3>
          <div class="notes-content">
            <p>{{ authDetailData.authNotes }}</p>
          </div>
        </div>
      </template>
      
      <el-empty v-else description="无法获取认证详情"></el-empty>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeAuthDetail">关闭</el-button>
        <template v-if="authDetailData && authDetailData.authStatus === 2">
          <el-button type="success" @click="handleVerifyAuth({userId: authDetailData.userId}, 1)">通过认证</el-button>
          <el-button type="danger" @click="handleVerifyAuth({userId: authDetailData.userId}, 0)">拒绝认证</el-button>
        </template>
      </span>
    </template>
  </el-dialog>
  
  <!-- 图片预览组件已移除 -->

  <!-- 用户详情对话框 -->
  <el-dialog
    v-model="userDetailVisible"
    title="用户详细信息"
    width="700px"
    destroy-on-close
    :append-to-body="false"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    top="5vh"
  >
    <div v-loading="userDetailLoading" class="user-detail-container">
      <template v-if="userDetailData">
        <div class="user-profile-section">
          <div class="avatar-container">
            <img 
              v-if="userDetailData.avatarUrl" 
              :src="userDetailData.avatarUrl" 
              alt="用户头像"
              class="user-avatar"
            >
            <el-icon v-else class="no-avatar"><user /></el-icon>
          </div>
          
          <div class="user-info">
            <h3>{{ userDetailData.nickname || '未设置昵称' }}</h3>
            <p><strong>用户ID：</strong>{{ userDetailData.userId }}</p>
            <p><strong>邮箱：</strong>{{ userDetailData.email }}</p>
            <p><strong>学校：</strong>{{ userDetailData.school || '未填写' }}</p>
            <p><strong>院系：</strong>{{ userDetailData.department || '未填写' }}</p>
            <p><strong>认证状态：</strong>
              <el-tag v-if="userDetailData.authStatus === 0" type="info">未认证</el-tag>
              <el-tag v-else-if="userDetailData.authStatus === 1" type="success">已认证</el-tag>
              <el-tag v-else-if="userDetailData.authStatus === 2" type="warning">认证中</el-tag>
            </p>
            <p><strong>账户状态：</strong>
              <el-tag v-if="userDetailData.accountStatus === 0" type="success">正常</el-tag>
              <el-tag v-else type="danger">禁用</el-tag>
            </p>
          </div>
        </div>
        
        <div class="user-stats-section">
          <h3>用户统计信息</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-value">{{ userDetailData.postCount || 0 }}</div>
                <div class="stat-label">发帖数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-value">{{ userDetailData.commentCount || 0 }}</div>
                <div class="stat-label">评论数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-value">{{ userDetailData.likeCount || 0 }}</div>
                <div class="stat-label">获赞数</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="time-info-section">
          <h3>时间信息</h3>
          <p><strong>注册时间：</strong>{{ formatDateTime(userDetailData.createdAt) }}</p>
          <p><strong>最近更新：</strong>{{ formatDateTime(userDetailData.updatedAt) }}</p>
          <p v-if="userDetailData.lastLoginAt"><strong>最近登录：</strong>{{ formatDateTime(userDetailData.lastLoginAt) }}</p>
        </div>
      </template>
      
      <el-empty v-else description="无法获取用户详情"></el-empty>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeUserDetail">关闭</el-button>
        <el-button 
          v-if="userDetailData && userDetailData.authStatus === 2" 
          type="info" 
          @click="handleViewAuthDetail(userDetailData.userId)"
        >查看认证详情</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.user-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

:deep(.el-form) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  flex: 1;
  min-width: 200px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 4px;
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
  font-size: 14px;
}

:deep(.el-table__header) {
  font-weight: bold;
}

/* 图片预览容器样式 - 已移除特殊样式 */

/* 用户详情对话框样式 */
.user-detail-container {
  padding: 0 10px;
}

.user-stats-section {
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

.stat-card {
  background-color: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 4px;
  text-align: center;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stat-label {
  color: var(--el-text-color-secondary);
}

.time-info-section {
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: var(--el-fill-color-lighter);
}

:deep(.el-table .hover-row) {
  background-color: var(--el-table-row-hover-bg-color);
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: var(--el-table-row-hover-bg-color);
}

/* 认证详情样式 */
.auth-detail-container {
  padding: 10px;
}

.user-profile-section {
  display: flex;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 24px;
  border: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-avatar {
  font-size: 60px;
  color: var(--el-text-color-secondary);
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 20px;
}

.user-info p {
  margin: 8px 0;
  line-height: 1.5;
}

.student-card-section {
  margin-bottom: 24px;
}

.card-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
}

.card-image-container {
  flex: 1;
  min-width: 200px;
  margin-bottom: 16px;
}

.card-image-container h4 {
  margin-bottom: 10px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.image-wrapper {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color-light);
}

.card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.auth-notes {
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

.notes-content {
  background-color: var(--el-fill-color-lighter);
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 8px;
}

.auth-note-section h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .user-list {
    padding: 15px;
  }

  :deep(.el-form) {
    flex-direction: column;
  }

  :deep(.el-form-item) {
    width: 100%;
  }

  :deep(.el-form-item__content) {
    width: 100%;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor) {
    width: 100%;
  }
}

@media screen and (max-width: 480px) {
  .user-list {
    padding: 10px;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-button) {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>