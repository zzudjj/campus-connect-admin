import request from './request'

/**
 * 获取用户公开资料
 * @param {Object} params - 请求参数
 * @param {Integer} params.userId - 用户ID
 * @returns {Promise} 返回用户公开资料的Promise
 */
export function getUserPublicProfile(params) {
  return request({
    url: '/user/publicProfile',
    method: 'get',
    params
  })
}

/**
 * 更新用户账号状态
 * @param {Object} data - 请求参数
 * @param {Integer} data.userId - 用户ID
 * @param {Integer} data.accountStatus - 账号状态(0:正常,1:禁用)
 * @returns {Promise} 返回请求结果的Promise
 */
export function updateUserStatus(data) {
  return request({
    url: '/admin/user/updateStatus',
    method: 'post',
    data
  })
}

/**
 * 审核用户认证申请
 * @param {Object} data - 请求参数
 * @param {Integer} data.userId - 用户ID
 * @param {Integer} data.authStatus - 认证状态(0:未认证,1:已认证,2:认证中)
 * @returns {Promise} 返回请求结果的Promise
 */
export function verifyUserAuth(data) {
  return request({
    url: '/admin/user/verifyAuth',
    method: 'post',
    data
  })
}

/**
 * 多条件搜索用户
 * @param {Object} params - 搜索条件
 * @param {String} [params.nickname] - 用户昵称（模糊查询）
 * @param {String} [params.email] - 用户邮箱（模糊查询）
 * @param {String} [params.school] - 学校（模糊查询）
 * @param {String} [params.department] - 院系（模糊查询）
 * @param {Integer} [params.authStatus] - 认证状态
 * @param {Integer} [params.accountStatus] - 账号状态
 * @param {Integer} [params.page=1] - 页码，从1开始
 * @param {Integer} [params.size=10] - 每页数量
 * @returns {Promise} 返回搜索结果的Promise
 */
export function searchUsers(params) {
  return request({
    url: '/admin/user/searchUsers',
    method: 'post',
    data: params
  })
}

/**
 * 获取用户统计信息
 * @returns {Promise} 返回统计信息的Promise
 */
export function getUserStatistics() {
  return request({
    url: '/admin/user/statistics',
    method: 'get'
  })
}

/**
 * 批量更新用户状态
 * @param {Object} data - 请求参数
 * @param {Array<Integer>} data.userIds - 用户ID列表
 * @param {Integer} data.accountStatus - 账号状态(0:正常,1:禁用)
 * @returns {Promise} 返回请求结果的Promise
 */
export function batchUpdateUserStatus(data) {
  return request({
    url: '/admin/user/batchUpdateStatus',
    method: 'post',
    data
  })
}

/**
 * 获取当前在线用户数量
 * @returns {Promise} 返回在线用户数的Promise
 */
export function getOnlineUserCount() {
  return request({
    url: '/admin/user/onlineCount',
    method: 'get'
  })
}

/**
 * 获取近30天的新增用户统计
 * @returns {Promise} 返回新增用户统计数据的Promise
 */
export function getNewUserStats() {
  return request({
    url: '/admin/user/stats/new-users',
    method: 'get'
  })
}

/**
 * 分页获取用户详细信息
 * @param {Object} params - 请求参数
 * @param {Integer} [params.page=1] - 页码，从1开始
 * @param {Integer} [params.size=10] - 每页数量
 * @returns {Promise} 返回分页用户信息的Promise
 */
export function pageUsers(params) {
  return request({
    url: '/admin/user/pageUsers',
    method: 'get',
    params
  })
}

/**
 * 获取用户认证详情
 * @param {Object} params - 请求参数
 * @param {Integer} params.userId - 用户ID
 * @returns {Promise} 返回用户认证详情的Promise
 */
export function getUserAuthDetail(params) {
  return request({
    url: '/admin/user/authDetail',
    method: 'get',
    params
  })
}

/**
 * 分页获取认证中的用户
 * @param {Object} params - 请求参数
 * @param {Integer} [params.page=1] - 页码，从1开始
 * @param {Integer} [params.size=10] - 每页数量
 * @returns {Promise} 返回认证中的用户列表的Promise
 */
export function getPendingAuthUsers(params) {
  return request({
    url: '/admin/user/pendingAuth',
    method: 'get',
    params
  })
}