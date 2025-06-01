<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { pageUsers, searchUsers, updateUserStatus } from '@/api/user';
import { useRouter } from 'vue-router';
import { Refresh, View, Search } from '@element-plus/icons-vue';

// 模拟数据（当API请求失败时使用）
const mockUserData = {
  users: [
    {
      userId: 1001,
      email: 'zhangsan@campus.edu',
      nickname: '张三',
      avatarUrl: 'https://example.com/avatar/1.jpg',
      authStatus: 1,
      accountStatus: 0,
      department: '计算机科学系',
      school: '清华大学',
      createdAt: '2025-05-15T08:30:00'
    },
    {
      userId: 1002,
      email: 'lisi@campus.edu',
      nickname: '李四',
      avatarUrl: 'https://example.com/avatar/2.jpg',
      authStatus: 0,
      accountStatus: 0,
      department: '电子工程系',
      school: '北京大学',
      createdAt: '2025-05-16T09:15:00'
    },
    {
      userId: 1003,
      email: 'wangwu@campus.edu',
      nickname: '王五',
      avatarUrl: 'https://example.com/avatar/3.jpg',
      authStatus: 2,
      accountStatus: 0,
      department: '自动化系',
      school: '浙江大学',
      createdAt: '2025-05-17T10:45:00'
    }
  ],
  totalCount: 3,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10
};

// 页面标题
const title = ref('用户管理');

// 用户数据
const users = ref([]); // 用户列表
const loading = ref(false); // 加载状态
const total = ref(0); // 总数据量
const selectedUsers = ref([]); // 选中的用户
const tableRef = ref(null); // 表格引用
const pageSize = ref(10);
const currentPage = ref(1);

// 搜索条件
const searchForm = reactive({
  nickname: '',
  email: '',
  school: '',
  department: '',
  authStatus: '',
  accountStatus: ''
});

// 是否处于搜索模式
const isSearchMode = ref(false);

// 路由对象
const router = useRouter();

// 格式化时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-');
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateTimeStr;
  }
};

// 获取用户数据
const fetchUsers = async () => {
  loading.value = true;
  
  try {
    // 检查token是否存在
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('未检测到有效token，可能无法获取数据！');
      ElMessage.warning('未检测到登录信息，将显示模拟数据');
      
      // 使用模拟数据
      setTimeout(() => {
        users.value = mockUserData.users;
        total.value = mockUserData.totalCount;
        ElMessage.success('已加载模拟数据');
        loading.value = false;
      }, 500);
      return;
    }
    
    let res;
    
    if (isSearchMode.value) {
      // 搜索模式，使用searchUsers API
      // 处理表单数据，将状态字段转为整数
      const formData = { ...searchForm };
      
      // 将认证状态和账号状态转为整数
      if (formData.authStatus !== '') {
        formData.authStatus = parseInt(formData.authStatus);
      }
      
      if (formData.accountStatus !== '') {
        formData.accountStatus = parseInt(formData.accountStatus);
      }
      
      const searchParams = {
        page: currentPage.value,
        size: pageSize.value,
        ...Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => value !== '')
        )
      };
      
      console.log('发送搜索请求参数:', searchParams);
      console.log('请求头包含token:', !!token);
      
      res = await searchUsers(searchParams);
    } else {
      // 普通列表模式，使用pageUsers API
      const params = {
        page: currentPage.value,
        size: pageSize.value
      };
      
      console.log('发送请求参数:', params);
      console.log('请求头包含token:', !!token);
      
      res = await pageUsers(params);
    }
    console.log('原始响应对象:', res);
    
    if (res.code === 200 && res.data) {
      console.log('响应数据结构:', res.data);
      
      // 根据API文档修正数据获取方式
      users.value = res.data.users || [];
      total.value = res.data.totalCount || 0;
      
      console.log('解析后的用户数据:', users.value);
      console.log('总数:', total.value);
      
      ElMessage.success('用户数据获取成功');
      
      if (users.value.length === 0) {
        ElMessage.warning('没有获取到用户数据');
      }
    } else {
      console.warn('响应数据异常', res);
      ElMessage.warning(`响应状态异常: ${res.message || '未知错误'}`);
      
      // 当API请求失败时使用模拟数据
      users.value = mockUserData.users;
      total.value = mockUserData.totalCount;
      ElMessage.info('已加载模拟数据');
    }
  } catch (error) {
    console.error('获取用户数据失败', error);
    ElMessage.error('获取用户数据失败: ' + (error.message || String(error)));
    
    // 当发生异常时使用模拟数据
    users.value = mockUserData.users;
    total.value = mockUserData.totalCount;
    ElMessage.info('已加载模拟数据');
  } finally {
    loading.value = false;
  }
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUsers();
};

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  fetchUsers();
};

// 处理搜索
const handleSearch = () => {
  // 检查是否有搜索条件
  const hasSearchConditions = Object.values(searchForm).some(value => value !== '');
  
  if (hasSearchConditions) {
    isSearchMode.value = true;
    currentPage.value = 1; // 重置到第一页
    fetchUsers();
  } else {
    ElMessage.warning('请至少输入一个搜索条件');
  }
};

// 重置搜索
const resetSearch = () => {
  // 清空所有搜索条件
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = '';
  });
  
  // 切换回普通列表模式
  isSearchMode.value = false;
  
  // 重置到第一页
  currentPage.value = 1;
  
  // 清空表格选择
  clearSelection();
  
  // 重新获取用户列表
  fetchUsers();
  
  ElMessage.success('已重置搜索条件，显示全部用户');
};

// 查看用户详情
const handleViewUser = (row) => {
  // 跳转到用户详情页面
  router.push({
    path: `/users/detail/${row.userId}`,
    // 可选地将用户数据传入路由
    query: { nickname: row.nickname }
  });
};

// 切换用户状态
const handleToggleUserStatus = (row) => {
  const userId = row.userId;
  const currentStatus = row.accountStatus;
  const newStatus = currentStatus === 0 ? 1 : 0;
  const actionText = newStatus === 1 ? '禁用' : '恢复';
  
  ElMessageBox.confirm(
    `确定要${actionText}用户"${row.nickname}"(账号ID: ${userId})吗？`,
    `${actionText}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: newStatus === 1 ? 'warning' : 'info'
    }
  ).then(async () => {
    try {
      const res = await updateUserStatus({
        userId,
        accountStatus: newStatus
      });
      
      if (res.code === 200) {
        ElMessage.success(`已${actionText}用户"${row.nickname}"`);
        // 更新本地状态，避免重新请求
        row.accountStatus = newStatus;
      } else {
        ElMessage.error(`操作失败: ${res.message || '未知错误'}`);
      }
    } catch (error) {
      ElMessage.error(`操作异常: ${error.message || '未知异常'}`);
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

// 批量切换用户状态
const handleBatchToggleStatus = (newStatus) => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要操作的用户');
    return;
  }
  
  const actionText = newStatus === 1 ? '禁用' : '恢复';
  const userCount = selectedUsers.value.length;
  
  ElMessageBox.confirm(
    `确定要批量${actionText}选中的 ${userCount} 个用户吗？`,
    `批量${actionText}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: newStatus === 1 ? 'warning' : 'info'
    }
  ).then(async () => {
    loading.value = true;
    let successCount = 0;
    let failCount = 0;
    
    // 使用Promise.all并发处理所有请求
    try {
      const updatePromises = selectedUsers.value.map(async (user) => {
        try {
          const res = await updateUserStatus({
            userId: user.userId,
            accountStatus: newStatus
          });
          
          if (res.code === 200) {
            // 更新本地状态
            const userInList = users.value.find(u => u.userId === user.userId);
            if (userInList) {
              userInList.accountStatus = newStatus;
            }
            successCount++;
            return true;
          } else {
            failCount++;
            return false;
          }
        } catch (error) {
          failCount++;
          return false;
        }
      });
      
      await Promise.all(updatePromises);
      
      if (successCount > 0) {
        ElMessage.success(`批量${actionText}成功: ${successCount} 个用户`);
      }
      
      if (failCount > 0) {
        ElMessage.warning(`批量${actionText}失败: ${failCount} 个用户`);
      }
      
      // 清空选择
      clearSelection();
    } catch (error) {
      ElMessage.error(`批量操作异常: ${error.message || '未知异常'}`);
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

// 清空表格选择
const clearSelection = () => {
  if (tableRef.value) {
    tableRef.value.clearSelection();
  }
  selectedUsers.value = [];
};

// 查看用户认证详情
const handleViewAuth = (row) => {
  // 跳转到用户认证详情页面
  router.push({
    path: `/users/auth/${row.userId}`,
    query: { nickname: row.nickname }
  });
};

// 页面加载时获取数据
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-list-container">
    <el-card class="box-card">
      <div class="card-header-actions">
        <div></div> <!-- 留空作为spacer -->
        <el-button type="primary" @click="handleRefresh" :loading="loading" size="small">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>

      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="昵称">
          <el-input v-model="searchForm.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="学校">
          <el-input v-model="searchForm.school" placeholder="请输入学校" clearable />
        </el-form-item>
        <el-form-item label="院系">
          <el-input v-model="searchForm.department" placeholder="请输入院系" clearable />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.authStatus" placeholder="请选择" clearable>
            <el-option label="未认证" value="0" />
            <el-option label="已认证" value="1" />
            <el-option label="认证中" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.accountStatus" placeholder="请选择" clearable>
            <el-option label="正常" value="0" />
            <el-option label="禁用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 批量操作区域 -->
      <div class="batch-actions-container">
        <div class="selected-info" v-if="selectedUsers.length > 0">
          <span class="selected-count">已选择 {{ selectedUsers.length }} 项</span>
        </div>
        <div class="batch-buttons">
          <el-button 
            type="danger" 
            size="small" 
            :loading="loading" 
            :disabled="selectedUsers.length === 0"
            @click="handleBatchToggleStatus(1)"
          >
            批量禁用
          </el-button>
          <el-button 
            type="success" 
            size="small" 
            :loading="loading" 
            :disabled="selectedUsers.length === 0"
            @click="handleBatchToggleStatus(0)"
          >
            批量恢复
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="tableRef"
        :data="users" 
        style="width: 100%" 
        border 
        stripe 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userId" label="ID" width="80" sortable />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
        <el-table-column prop="school" label="学校" show-overflow-tooltip />
        <el-table-column prop="department" label="院系" show-overflow-tooltip />
        <el-table-column label="创建时间" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.authStatus === 0" type="info">未认证</el-tag>
            <el-tag v-else-if="row.authStatus === 1" type="success">已认证</el-tag>
            <el-tag v-else-if="row.authStatus === 2" type="warning">认证中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.accountStatus === 0 ? 'success' : 'danger'">
              {{ row.accountStatus === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewUser(row)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button 
              :type="row.accountStatus === 0 ? 'danger' : 'success'" 
              link 
              @click="handleToggleUserStatus(row)"
            >
              {{ row.accountStatus === 0 ? '禁用' : '恢复' }}
            </el-button>
            <el-button 
              v-if="row.authStatus === 2" 
              type="warning" 
              link 
              @click="handleViewAuth(row)"
            >
              查看认证
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-if="total > 0"
          background
          layout="total, sizes, prev, pager, next"
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>

</template>

<style scoped>
.user-list-container {
  padding: 20px;
}

.card-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.batch-actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.selected-info {
  display: flex;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 操作按钮样式 */
.el-button-group .el-button {
  margin-right: 5px;
}

/* 搜索表单样式 */
.search-form {
  margin-bottom: 20px;
}

.search-form .el-form-item {
  margin-bottom: 18px;
  margin-right: 12px;
}

.search-form .el-input,
.search-form .el-select {
  width: 200px;
}

.card-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>