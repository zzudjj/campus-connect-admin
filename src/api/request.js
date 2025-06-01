import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://127.0.0.1:8080', // 修改为本地后端服务器地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    
    // 检查当前存储中的token，便于调试
    console.log('localStorage中token状态:', token ? '存在token' : 'token为空')
    
    if (token) {
      // 按照后端要求，使用token作为请求头名称，直接传递token值不加前缀
      config.headers.token = token
      
      // 打印完整请求头，便于调试
      console.log(`已将token添加到请求头 [${config.url}]：`, config.headers)
    } else {
      console.error(`未发现token，请求 [${config.url}] 不包含认证信息！请检查登录状态`)
    }
    
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('响应错误：', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          const message = error.response.data?.message || 
                         error.response.statusText || 
                         '请求失败'
          ElMessage.error(message)
      }
    } else if (error.request) {
      ElMessage.error('服务器无响应，请检查网络连接')
    } else {
      ElMessage.error(`请求错误: ${error.message}`)
    }
    
    return Promise.reject(error)
  }
)

export default request