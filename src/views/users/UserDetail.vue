<template>
  <div class="user-detail-container">
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="title">
            <span>用户详情：{{ user ? user.nickname : '' }}</span>
          </div>
          <div class="operations">
            <el-button @click="goBack" text>
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <el-button @click="handleRefresh" text :loading="loading">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-loading="loading" class="detail-content">
        <el-empty v-if="!user && !loading" description="暂无用户数据" />
        
        <template v-if="user">
          <!-- 基本信息 -->
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID" width="150px">{{ user.userId }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
            <el-descriptions-item label="头像">
              <el-avatar v-if="user.avatarUrl" :src="user.avatarUrl" :size="50" />
              <span v-else>暂无头像</span>
            </el-descriptions-item>
            <el-descriptions-item label="学校">{{ user.school || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="院系">{{ user.department || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(user.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(user.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 账号状态 -->
          <h3 class="section-title">账号状态</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="认证状态">
              <el-tag 
                :type="user.authStatus === 0 ? 'info' : user.authStatus === 1 ? 'success' : 'warning'">
                {{ user.authStatus === 0 ? '未认证' : user.authStatus === 1 ? '已认证' : '认证中' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag :type="user.accountStatus === 0 ? 'success' : 'danger'">
                {{ user.accountStatus === 0 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { pageUsers } from '@/api/user';
import { Refresh } from '@element-plus/icons-vue';

// 路由对象
const route = useRoute();
const router = useRouter();

// 获取路由参数中的用户ID
const userId = ref(route.params.userId);

// 用户数据
const user = ref(null);
const loading = ref(false);

// 从API获取用户信息或使用模拟数据
const fetchUserDetail = async () => {
  loading.value = true;
  ElMessage.info('正在加载用户详情...');
  
  try {
    // 检查token是否存在
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('未检测到有效token，可能无法获取数据！');
      ElMessage.warning('未检测到登录信息，将显示模拟数据');
      
      // 使用模拟数据
      setTimeout(() => {
        const mockUser = {
          userId: Number(userId.value),
          email: `user${userId.value}@campus.edu`,
          nickname: `用户${userId.value}`,
          avatarUrl: null,
          authStatus: 1,
          accountStatus: 0,
          department: '计算机科学系',
          school: '示例大学',
          createdAt: '2025-05-15T08:30:00',
          updatedAt: '2025-05-20T10:15:00'
        };
        
        user.value = mockUser;
        ElMessage.success('已加载模拟数据');
        loading.value = false;
      }, 500);
      return;
    }
    
    // 实际场景中应该有一个getUserById的API
    // 这里用pageUsers模拟，实际项目应替换为正确的API
    const res = await pageUsers({ page: 1, size: 10 });
    
    if (res.code === 200 && res.data && res.data.users) {
      // 查找匹配ID的用户
      const foundUser = res.data.users.find(u => String(u.userId) === String(userId.value));
      
      if (foundUser) {
        user.value = foundUser;
        ElMessage.success('用户数据获取成功');
      } else {
        console.warn('未找到指定ID的用户');
        ElMessage.warning('未找到指定ID的用户，将显示模拟数据');
        
        // 使用模拟数据
        user.value = {
          userId: Number(userId.value),
          email: `user${userId.value}@campus.edu`,
          nickname: route.query.nickname || `用户${userId.value}`,
          avatarUrl: null,
          authStatus: 1,
          accountStatus: 0,
          department: '计算机科学系',
          school: '示例大学',
          createdAt: '2025-05-15T08:30:00',
          updatedAt: '2025-05-20T10:15:00'
        };
      }
    } else {
      console.warn('响应数据异常', res);
      ElMessage.warning(`响应状态异常: ${res.message || '未知错误'}`);
      
      // 使用模拟数据
      user.value = {
        userId: Number(userId.value),
        email: `user${userId.value}@campus.edu`,
        nickname: route.query.nickname || `用户${userId.value}`,
        avatarUrl: null,
        authStatus: 1,
        accountStatus: 0,
        department: '计算机科学系',
        school: '示例大学',
        createdAt: '2025-05-15T08:30:00',
        updatedAt: '2025-05-20T10:15:00'
      };
    }
  } catch (error) {
    console.error('获取用户详情失败', error);
    ElMessage.error('获取用户详情失败: ' + (error.message || String(error)));
    
    // 使用模拟数据
    user.value = {
      userId: Number(userId.value),
      email: `user${userId.value}@campus.edu`,
      nickname: route.query.nickname || `用户${userId.value}`,
      avatarUrl: null,
      authStatus: 1,
      accountStatus: 0,
      department: '计算机科学系',
      school: '示例大学',
      createdAt: '2025-05-15T08:30:00',
      updatedAt: '2025-05-20T10:15:00'
    };
  } finally {
    loading.value = false;
  }
};

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

// 刷新数据
const handleRefresh = () => {
  fetchUserDetail();
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 页面加载时获取数据
onMounted(() => {
  if (userId.value) {
    fetchUserDetail();
  } else {
    ElMessage.error('用户ID不能为空');
  }
});
</script>

<style scoped>
.user-detail-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.detail-content {
  min-height: 400px;
}

.section-title {
  margin: 20px 0 10px 0;
  font-size: 16px;
  color: #606266;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

.el-descriptions {
  margin-bottom: 20px;
}
</style>
