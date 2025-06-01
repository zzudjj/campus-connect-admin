<template>
  <div class="auth-detail-container" style="overflow-y: auto;">
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div>
            <span class="title">用户认证详情</span>
            <el-tag 
              class="ml-10" 
              :type="getAuthStatusType(userDetail.authStatus)"
            >
              {{ getAuthStatusText(userDetail.authStatus) }}
            </el-tag>
          </div>
          <div>
            <el-button @click="goBack" text>
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <el-button @click="refreshData" text>
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 基础信息 -->
        <el-descriptions title="用户基础信息" :column="2" border>
          <el-descriptions-item label="用户ID">{{ userDetail.userId }}</el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ userDetail.nickname }}</el-descriptions-item>
          <el-descriptions-item label="用户邮箱">{{ userDetail.email }}</el-descriptions-item>
          <el-descriptions-item label="账号状态">
            <el-tag :type="userDetail.accountStatus === 0 ? 'success' : 'danger'">
              {{ userDetail.accountStatus === 0 ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="认证状态">
            <el-tag :type="getAuthStatusType(userDetail.authStatus)">
              {{ getAuthStatusText(userDetail.authStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(userDetail.createdAt) }}</el-descriptions-item>
        </el-descriptions>

        <!-- 认证信息 -->
        <div class="mt-20">
          <h3 class="auth-title">认证申请信息</h3>
          
          <div class="card-images-container">
            <div class="card-image-item">
              <h4>校园卡正面照</h4>
              <el-image 
                v-if="userDetail.beforeCardUrl" 
                :src="userDetail.beforeCardUrl" 
                :preview-src-list="[userDetail.beforeCardUrl]"
                fit="cover"
                class="auth-image"
              />
              <span v-else>未上传</span>
            </div>
            
            <div class="card-image-item">
              <h4>校园卡反面照</h4>
              <el-image 
                v-if="userDetail.afterCardUrl" 
                :src="userDetail.afterCardUrl"
                :preview-src-list="[userDetail.afterCardUrl]"
                fit="cover"
                class="auth-image"
              />
              <span v-else>未上传</span>
            </div>
          </div>
          
          <div v-if="userDetail.rejectReason" class="reject-reason">
            <h4>拒绝原因：</h4>
            <p>{{ userDetail.rejectReason }}</p>
          </div>
        </div>

        <!-- 审核操作 -->
        <div class="action-panel mt-20" v-if="userDetail.authStatus === 2">
          <el-divider content-position="center">认证审核</el-divider>
          <div class="action-buttons">
            <div class="form-actions">
                <el-button 
                  type="success" 
                  @click="handleVerify(1)" 
                  :loading="verifying"
                >
                  通过认证
                </el-button>
                <el-button 
                  type="danger" 
                  @click="handleVerify(0)" 
                  :loading="verifying"
                >
                  拒绝认证
                </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserAuthDetail, verifyUserAuth } from '@/api/user';
import { Refresh } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userId = ref(route.params.userId);
const loading = ref(false);
const verifying = ref(false);

// 用户基本信息
const userDetail = ref({
  userId: '',
  nickname: '',
  email: '',
  accountStatus: 0,
  authStatus: 0,
  createdAt: ''
});

// 用户信息中已包含认证信息
// 不需要单独的authDetail对象

// 不再需要审核备注

// 获取认证状态对应的标签类型
const getAuthStatusType = (status) => {
  const types = {
    0: 'info',
    1: 'success',
    2: 'warning'
  };
  return types[status] || 'info';
};

// 获取认证状态对应的文本
const getAuthStatusText = (status) => {
  const texts = {
    0: '未认证',
    1: '已认证',
    2: '认证中'
  };
  return texts[status] || '未知状态';
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

// 返回列表页
const goBack = () => {
  router.back();
};

// 刷新数据
const refreshData = () => {
  fetchAuthDetail();
};

// 获取认证详情
const fetchAuthDetail = async () => {
  loading.value = true;
  
  try {
    // 检查token是否存在
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('未检测到有效token，可能无法获取数据！');
      ElMessage.warning('未检测到登录信息，将显示模拟数据');
      
      // 使用模拟数据
      setTimeout(() => {
        const mockData = {
          userId: userId.value,
          nickname: '张三',
          email: 'zhangsan@example.com',
          authStatus: 2,
          accountStatus: 0,
          beforeCardUrl: 'https://example.com/cards/front123.jpg',
          afterCardUrl: 'https://example.com/cards/back123.jpg',
          school: '北京大学',
          department: '计算机科学与技术系',
          rejectReason: null,
          createdAt: '2023-09-15T14:30:00',
          updatedAt: '2023-09-20T10:15:00'
        };
        
        userDetail.value = mockData;
        
        ElMessage.success('已加载模拟数据');
        loading.value = false;
      }, 500);
      return;
    }
    
    const res = await getUserAuthDetail({ userId: userId.value });
    
    if (res.code === 200 && res.data) {
      // 设置用户基本信息
        userDetail.value = res.data;
      
      ElMessage.success('获取认证详情成功');
    } else {
      ElMessage.error('获取认证详情失败: ' + (res.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取认证详情失败', error);
    ElMessage.error('获取认证详情失败: ' + (error.message || String(error)));
  } finally {
    loading.value = false;
  }
};

// 处理认证审核
const handleVerify = (status) => {
  const actionText = status === 1 ? '通过' : '拒绝';
  
  ElMessageBox.confirm(
    `确定要${actionText}用户"${userDetail.value.nickname}"的认证申请吗？`,
    `认证${actionText}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: status === 1 ? 'success' : 'warning'
    }
  ).then(async () => {
    verifying.value = true;
    
    try {
      const res = await verifyUserAuth({
        userId: parseInt(userId.value, 10), // 确保userId是整数类型
        authStatus: parseInt(status, 10)   // 确保authStatus是整数类型
      });
      
      if (res.code === 200) {
        ElMessage.success(`已${actionText}用户认证申请`);
        userDetail.value.authStatus = status;
      } else {
        ElMessage.error(`操作失败: ${res.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('认证审核失败', error);
      ElMessage.error('认证审核失败: ' + (error.message || String(error)));
    } finally {
      verifying.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

// 页面加载时获取数据
onMounted(() => {
  fetchAuthDetail();
});
</script>

<style scoped>
.auth-detail-container {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  position: relative;
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

.mt-20 {
  margin-top: 20px;
}

.auth-image {
  width: 280px;
  height: 180px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.card-images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
}

.card-image-item {
  flex: 1;
  min-width: 300px;
}

.card-image-item h4 {
  margin-bottom: 12px;
  font-weight: normal;
  color: #606266;
}

.auth-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.reject-reason {
  margin-top: 20px;
  padding: 15px;
  background-color: #fef0f0;
  border-radius: 4px;
}

.reject-reason h4 {
  color: #f56c6c;
  margin-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.action-panel {
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
