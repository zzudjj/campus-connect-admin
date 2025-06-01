import request from './request'

/**
 * 分页获取所有动态
 * @param {Object} params - 请求参数
 * @param {Integer} [params.page=1] - 页码
 * @param {Integer} [params.size=10] - 每页数量
 * @returns {Promise} 返回分页动态信息的Promise
 */
export function getPostList(params) {
  return request({
    url: '/admin/post/page',
    method: 'get',
    params
  })
}

/**
 * 获取动态详情
 * @param {Object} params - 请求参数
 * @param {Integer} params.postId - 动态ID
 * @returns {Promise} 返回动态详情的Promise
 */
export function getPostDetail(params) {
  return request({
    url: '/admin/post/detail',
    method: 'get',
    params
  })
}

/**
 * 更新动态状态
 * @param {Object} data - 请求数据
 * @param {Integer} data.postId - 动态ID
 * @param {Integer} data.status - 状态值（0-正常，1-已屏蔽）
 * @returns {Promise} 返回更新结果的Promise
 */
export function updatePostStatus(data) {
  return request({
    url: '/admin/post/updateStatus',
    method: 'post',
    data
  })
}

/**
 * 删除动态
 * @param {Object} data - 请求数据
 * @param {Integer} data.postId - 动态ID
 * @returns {Promise} 返回删除结果的Promise
 */
export function deletePost(data) {
  return request({
    url: '/admin/post/delete',
    method: 'post',
    data
  })
}

/**
 * 切换动态屏蔽状态
 * @param {Object} data - 请求参数
 * @param {Integer} data.postId - 动态ID
 * @returns {Promise} 返回切换结果的Promise
 */
export function togglePostBlock(data) {
  return request({
    url: '/admin/post/toggleBlock',
    method: 'post',
    data
  })
}

/**
 * 获取动态统计信息
 * @returns {Promise} 返回统计信息的Promise
 */
export function getPostStatistics() {
  return request({
    url: '/admin/post/statistics',
    method: 'get'
  })
}

/**
 * 批量删除动态
 * @param {Object} data - 请求参数
 * @param {Array<Integer>} data.postIds - 动态ID列表
 * @returns {Promise} 返回批量删除结果的Promise
 */
export function batchDeletePosts(data) {
  return request({
    url: '/admin/post/batchDelete',
    method: 'post',
    data
  })
}