<template>
  <div class="login-container">
    <div class="particles-bg" ref="particlesContainer"></div>
    
    <div class="login-box">
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
          <h2 class="title">管理员登录</h2>
          <p class="subtitle">欢迎回来，请登录您的账号</p>
        </div>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleSubmit(formRef)"
        >
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="管理员邮箱"
              :prefix-icon="Message"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="passwordHash">
            <el-input
              v-model="form.passwordHash"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item prop="captchaCode">
            <div class="captcha-container">
              <el-input v-model.trim="form.captchaCode" placeholder="图片验证码" size="large" maxlength="6" />
              <div class="captcha-image" @click="refreshCaptcha">
                <img v-if="captchaData.captchaImage" :src="captchaData.captchaImage" alt="验证码" title="点击刷新验证码" />
                <el-button v-else @click="refreshCaptcha" type="primary" plain>获取验证码</el-button>
              </div>
            </div>
            <div class="captcha-tip">验证码区分大小写，有效期5分钟，点击图片可刷新</div>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="form.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false" @click="navigateToForgotPassword">忘记密码？</el-link>
          </div>

          <el-button
            type="primary"
            class="submit-btn"
            size="large"
            :loading="loading"
            @click="handleSubmit(formRef)"
          >
            <span class="btn-text">登录</span>
            <div class="btn-progress" v-if="loading"></div>
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminLogin, generateCaptcha, verifyCaptcha as verifyImageCaptcha } from '@/api/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const particlesContainer = ref(null)

// 图片验证码数据
const captchaData = ref({
  captchaId: '',
  captchaImage: ''
})

const form = ref({
  email: '',
  passwordHash: '',
  captchaCode: '',
  remember: false
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  passwordHash: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入图片验证码', trigger: 'blur' }]
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
    
    if (!form.value.captchaCode) {
      return { valid: false, message: '请输入验证码' }
    }
    
    const response = await verifyImageCaptcha({
      captchaId: captchaData.value.captchaId,
      captchaCode: form.value.captchaCode
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

// 跳转到忘记密码页面
const navigateToForgotPassword = () => {
  router.push('/forgot-password')
}

// 登录提交
const handleSubmit = async (formEl) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 先验证图片验证码
        const captchaResult = await verifyCaptcha()
        if (!captchaResult.valid) {
          ElMessage.error(captchaResult.message)
          refreshCaptcha()
          loading.value = false
          return
        }

        // 调用登录API
        const response = await adminLogin({
          email: form.value.email,
          passwordHash: form.value.passwordHash
        })

        if (response.code === 200) {
          // 根据API文档，登录成功时response.data直接是token字符串
          const token = response.data;
          
          // 确保token不为空
          if (!token) {
            console.error('登录成功但token为空');
            ElMessage.error('登录失败: 服务器返回的认证信息无效');
            loading.value = false;
            return;
          }
          
          // 保存token
          localStorage.setItem('token', token);
          console.log('已保存token:', token);
          
          // 如果记住我，则保存邮箱到本地存储
          if (form.value.remember) {
            localStorage.setItem('adminEmail', form.value.email)
          } else {
            localStorage.removeItem('adminEmail')
          }
          
          ElMessage.success('登录成功')
          router.push('/') // 导航到管理员首页
        } else {
          ElMessage.error(response.message || '登录失败')
          refreshCaptcha() // 刷新验证码
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请重试')
        refreshCaptcha() // 刷新验证码
      } finally {
        loading.value = false
      }
    }
  })
}

// 初始化粒子背景
onMounted(() => {
  // 自动获取验证码
  refreshCaptcha()
  
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
  const particleCount = 80 // 增加粒子数量以匹配主界面
  const maxSpeed = 0.8 // 增加最大速度
  const particleSize = 2.5 // 增加粒子大小
  const connectionDistance = 150 // 增加连接距离
  const connectionOpacity = 0.15 // 增加连接线透明度
  const particleOpacity = 0.6 // 增加粒子透明度

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
.login-container {
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

.login-box {
  width: 100%;
  max-width: 1000px;
  height: 600px;
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

.login-form {
  max-width: 360px;
  margin: 0 auto;
  width: 100%;
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

:deep(.el-input__inner) {
  color: #333;
}

:deep(.el-input__inner::placeholder) {
  color: #999;
}

:deep(.el-input__prefix .el-icon) {
  color: #64B5F6;
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
  color: #909399;
  margin-top: 4px;
  line-height: 1.2;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

:deep(.el-checkbox__label) {
  color: #666;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #64B5F6;
  border-color: #64B5F6;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  border-radius: 8px;
  background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: loading 1.5s infinite;
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

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .login-box {
    height: auto;
    max-width: 100%;
  }

  .brand-section {
    display: none;
  }

  .form-section {
    width: 100%;
    padding: 40px 30px;
    background: rgba(255, 255, 255, 0.95);
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 13px;
  }
}

@media screen and (max-width: 480px) {
  .login-container {
    padding: 15px;
  }

  .form-section {
    padding: 30px 20px;
  }

  .title {
    font-size: 22px;
  }

  .submit-btn {
    height: 40px;
    font-size: 14px;
  }
}
</style>