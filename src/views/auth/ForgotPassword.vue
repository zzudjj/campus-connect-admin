<template>
  <div class="forgot-password-container">
    <div class="particles-bg" ref="particlesContainer"></div>
    
    <div class="forgot-password-box">
      <div class="brand-section">
        <div class="logo-container">
          <svg class="logo-svg" viewBox="0 0 100 100">
            <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="1.5"
                  class="logo-path"/>
          </svg>
        </div>
        <h1 class="brand-title">Campus Connect</h1>
      </div>
      
      <div class="form-section">
        <div class="form-header">
          <h2 class="title">找回密码</h2>
          <p class="subtitle">按照步骤找回您的管理员账号密码</p>
        </div>
        
        <!-- 简洁步骤指示器 -->
        <div class="simple-steps">
          <span class="step" :class="{ active: currentStep === 0, done: currentStep > 0 }">验证邮箱</span>
          <span class="step-divider">&gt;</span>
          <span class="step" :class="{ active: currentStep === 1, done: currentStep > 1 }">重置密码</span>
        </div>
        
        <!-- 第一步：输入邮箱 -->
        <el-form
          v-if="currentStep === 0"
          ref="emailFormRef"
          :model="emailForm"
          :rules="emailRules"
          class="forgot-password-form"
        >
          <el-form-item prop="email">
            <el-input
              v-model="emailForm.email"
              placeholder="请输入管理员邮箱"
              :prefix-icon="Message"
              size="large"
            />
          </el-form-item>

          <!-- 图片验证码 -->
          <el-form-item prop="captchaCode">
            <div class="captcha-container">
              <el-input
                v-model.trim="emailForm.captchaCode"
                placeholder="图片验证码"
                size="large"
                maxlength="6"
              />
              <div class="captcha-image" @click="refreshCaptcha">
                <img v-if="captchaData.captchaImage" :src="captchaData.captchaImage" alt="验证码" title="点击刷新验证码" />
                <el-button v-else @click="refreshCaptcha" type="primary" plain>获取验证码</el-button>
              </div>
            </div>
            <div class="captcha-tip">验证码区分大小写，有效期5分钟，点击图片可刷新</div>
          </el-form-item>

          <el-button
            type="primary"
            class="submit-btn"
            size="large"
            :loading="loading"
            @click="requestEmailCode"
          >
            获取邮箱验证码
          </el-button>

          <div class="back-link">
            <el-link type="primary" @click="goBack">返回登录</el-link>
          </div>
        </el-form>

        <!-- 第二步：重置密码（包含验证码验证） -->
        <el-form
          v-if="currentStep === 1"
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          class="forgot-password-form"
        >
          <el-form-item prop="code">
            <el-input
              v-model="resetForm.code"
              placeholder="请输入邮箱验证码"
              :prefix-icon="Key"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="newPassword">
            <el-input
              v-model="resetForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              :prefix-icon="Lock"
              show-password
              size="large"
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="resetForm.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              :prefix-icon="Lock"
              show-password
              size="large"
            />
          </el-form-item>

          <div class="button-group">
            <el-button @click="currentStep--">上一步</el-button>
            <el-button
              type="primary"
              :loading="loading"
              @click="resetPassword"
            >
              重置密码
            </el-button>
          </div>
        </el-form>
        
        <!-- 成功提示 -->
        <div v-if="currentStep === 2" class="success-message">
          <el-icon class="success-icon"><CircleCheck /></el-icon>
          <h3>密码重置成功</h3>
          <p>您的密码已成功重置，请使用新密码登录</p>
          <el-button type="primary" class="submit-btn" @click="goToLogin">
            返回登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message, Lock, Key, CircleCheck } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { generateCaptcha, verifyCaptcha as verifyImageCaptcha, requestPasswordReset, verifyEmailCode as verifyResetCode, resetPassword as resetUserPassword } from '@/api/auth'
import zxcvbn from 'zxcvbn' // 密码强度评估

const router = useRouter()
const loading = ref(false)
const particlesContainer = ref(null)
const currentStep = ref(0)

// 表单引用
const emailFormRef = ref(null)
const codeFormRef = ref(null)
const resetFormRef = ref(null)

// 图片验证码数据
const captchaData = ref({
  captchaId: '',
  captchaImage: ''
})

// 邮箱表单
const emailForm = ref({
  email: '',
  captchaCode: ''
})

// 验证码表单
// 重置密码表单（包含验证码）
const resetForm = ref({
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 用户邮箱
const userEmail = ref('')

// 验证规则
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  captchaCode: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' }
  ]
}

const resetRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value) {
          const result = zxcvbn(value)
          if (result.score < 2) {
            callback(new Error('密码强度太弱，请包含字母、数字和特殊字符'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取图片验证码
const refreshCaptcha = async () => {
  try {
    const response = await generateCaptcha()
    if (response.code === 200) {
      captchaData.value = response.data
    } else {
      ElMessage.error('获取验证码失败')
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请刷新页面重试')
  }
}

// 验证图片验证码
const verifyCaptcha = async () => {
  try {
    if (!captchaData.value.captchaId) {
      refreshCaptcha()
      return { valid: false, message: '验证码已过期，请刷新验证码' }
    }
    
    if (!emailForm.value.captchaCode) {
      return { valid: false, message: '请输入验证码' }
    }
    
    const response = await verifyImageCaptcha({
      captchaId: captchaData.value.captchaId,
      captchaCode: emailForm.value.captchaCode
    })
    
    if (response.code === 200) {
      return { valid: true }
    } else {
      return { valid: false, message: response.message || '验证码错误' }
    }
  } catch (error) {
    return { valid: false, message: error.message || '验证码验证失败' }
  }
}

// 请求邮箱验证码
const requestEmailCode = async () => {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 验证图片验证码
        const captchaResult = await verifyCaptcha()
        if (!captchaResult.valid) {
          ElMessage.error(captchaResult.message)
          refreshCaptcha()
          loading.value = false
          return
        }
        
        // 请求邮箱验证码
        const response = await requestPasswordReset({
          email: emailForm.value.email
        })
        
        if (response.code === 200) {
          ElMessage.success('验证码已发送到您的邮箱')
          userEmail.value = emailForm.value.email
          currentStep.value = 1 // 进入下一步
        } else {
          ElMessage.error(response.message || '发送验证码失败')
          refreshCaptcha()
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        ElMessage.error(error.message || '发送验证码失败，请重试')
        refreshCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置密码
const resetPassword = async () => {
  if (loading.value) return
  
  resetFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await resetUserPassword({
          email: userEmail.value,
          code: resetForm.value.code,
          newPassword: resetForm.value.newPassword
        })
        
        if (response.code === 200) {
          ElMessage.success('密码重置成功')
          currentStep.value = 2 // 显示成功提示
        } else {
          ElMessage.error(response.message || '密码重置失败')
        }
      } catch (error) {
        console.error('密码重置出错:', error)
        ElMessage.error(error.message || '密码重置出错')
      } finally {
        loading.value = false
      }
    }
  })
}

// 返回登录页
const goToLogin = () => {
  router.push('/login')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 组件加载时获取验证码
onMounted(() => {
  refreshCaptcha()
  
  // 粒子背景初始化
  const container = particlesContainer.value
  if (!container) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  container.appendChild(canvas)

  const resizeCanvas = () => {
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 粒子系统实现
  const particles = []
  const particleCount = 80
  const maxSpeed = 0.8
  const particleSize = 2.5
  const connectionDistance = 150
  const connectionOpacity = 0.15
  const particleOpacity = 0.6

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: particleSize,
      speedX: (Math.random() - 0.5) * maxSpeed,
      speedY: (Math.random() - 0.5) * maxSpeed,
      opacity: particleOpacity
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制连接线
    particles.forEach((particle, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particle.x - particles[j].x
        const dy = particle.y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * connectionOpacity
          ctx.beginPath()
          ctx.strokeStyle = `rgba(100, 181, 246, ${opacity})`
          ctx.lineWidth = 1
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    })

    // 更新和绘制粒子
    particles.forEach(particle => {
      particle.x += particle.speedX
      particle.y += particle.speedY

      // 边界检查
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(100, 181, 246, ${particle.opacity})`
      ctx.fill()
    })

    requestAnimationFrame(animate)
  }

  animate()
})
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F5F9FF 0%, #E8F0FE 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.forgot-password-box {
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(100, 181, 246, 0.15);
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 2;
  animation: fadeIn 0.5s ease-out;
  border: 1px solid rgba(100, 181, 246, 0.2);
}

.brand-section {
  width: 40%;
  background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.logo-container {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}

.logo-svg {
  width: 100%;
  height: 100%;
  color: #fff;
}

.logo-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLogo 2s ease forwards;
}

.brand-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: 1px;
}

.form-section {
  width: 60%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.form-header {
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1976D2;
  margin-bottom: 8px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.subtitle {
  font-size: 14px;
  color: #666;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.forgot-password-form {
  max-width: 360px;
  margin: 0 auto;
  width: 100%;
}

.simple-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px auto 25px;
  font-size: 14px;
  color: #909399;
}

.step {
  padding: 5px 10px;
  transition: all 0.3s ease;
}

.step-divider {
  margin: 0 8px;
  color: #dcdfe6;
  font-weight: 300;
}

.step.active {
  color: #1976D2;
  font-weight: 500;
}

.step.done {
  color: #67c23a;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

:deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(25, 118, 210, 0.2);
}

:deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #64B5F6;
  box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  width: 120px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.captcha-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.captcha-tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  border-radius: 8px;
  background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
  border: none;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.3);
}

.back-link {
  text-align: center;
  margin-top: 10px;
}

.success-message {
  text-align: center;
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
}

.success-icon {
  font-size: 48px;
  color: #52c41a;
  margin-bottom: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drawLogo {
  to {
    stroke-dashoffset: 0;
  }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .forgot-password-box {
    height: auto;
    max-width: 100%;
    flex-direction: column;
  }

  .brand-section {
    width: 100%;
    height: auto;
    padding: 20px;
  }

  .form-section {
    width: 100%;
    padding: 30px;
  }
}

@media screen and (max-width: 480px) {
  .forgot-password-container {
    padding: 15px;
  }

  .form-section {
    padding: 20px;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .button-group .el-button {
    width: 100%;
  }
}
</style>
