import request from './request'

/**
 * 管理员登录
 * @param {Object} data - 登录信息
 * @param {string} data.email - 管理员邮箱
 * @param {string} data.passwordHash - 密码
 * @returns {Promise} 返回包含token的Promise
 */
export function adminLogin(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

/**
 * 生成图片验证码
 * @returns {Promise} 返回包含验证码ID和图片的Promise
 */
export function generateCaptcha() {
  return request({
    url: '/captcha/generate',
    method: 'get'
  })
}

/**
 * 验证图片验证码
 * @param {Object} data - 验证码信息
 * @param {string} data.captchaId - 验证码ID
 * @param {string} data.captchaCode - 用户输入的验证码
 * @returns {Promise} 返回验证结果的Promise
 */
export function verifyCaptcha(data) {
  if (!data || !data.captchaId || !data.captchaCode) {
    return Promise.reject({ message: '验证码参数不完整' });
  }
  
  return request({
    url: '/captcha/verify',
    method: 'post',
    data: {
      captchaId: data.captchaId,
      code: data.captchaCode // 根据API文档，参数名为code
    }
  })
}

/**
 * 请求密码重置验证码
 * @param {Object} data - 请求信息
 * @param {string} data.email - 用户或管理员邮箱
 * @returns {Promise} 返回请求结果的Promise
 */
export function requestPasswordReset(data) {
  return request({
    url: '/password/forgot',
    method: 'post',
    data
  })
}

/**
 * 验证邮箱验证码
 * @param {Object} data - 验证信息
 * @param {string} data.email - 用户或管理员邮箱
 * @param {string} data.code - 邮箱验证码
 * @returns {Promise} 返回验证结果的Promise
 */
export function verifyEmailCode(data) {
  return request({
    url: '/password/verify',
    method: 'post',
    data
  })
}

/**
 * 重置密码
 * @param {Object} data - 重置信息
 * @param {string} data.email - 用户或管理员邮箱
 * @param {string} data.code - 邮箱验证码
 * @param {string} data.newPassword - 新密码
 * @param {boolean} data.isAdmin - 是否为管理员请求
 * @returns {Promise} 返回重置结果的Promise
 */
export function resetPassword(data) {
  // 确保包含isAdmin字段，如果未提供则默认为true（管理端应用）
  const requestData = {
    ...data,
    isAdmin: data.isAdmin !== undefined ? data.isAdmin : true
  };

  return request({
    url: '/password/reset',
    method: 'post',
    data: requestData
  })
}
