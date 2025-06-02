import request from './request'

/**
 * 获取待处理的举报列表
 * @param {Object} params - 请求参数
 * @param {Integer} [params.page=0] - 页码，从0开始
 * @param {Integer} [params.size=10] - 每页数量
 * @returns {Promise} 返回待处理举报列表的Promise
 */
export function getPendingReports(params) {
  console.log('调用待处理举报列表API，参数:', params)
  return request({
    url: '/report/admin/pending',
    method: 'get',
    params
  }).then(response => {
    console.log('待处理举报列表API响应:', response)
    return response
  }).catch(error => {
    console.error('待处理举报列表API错误:', error)
    return Promise.reject(error)
  })
}

/**
 * 筛选举报列表
 * @param {Object} params - 请求参数
 * @param {Integer} [params.page=0] - 页码，从0开始
 * @param {Integer} [params.size=10] - 每页数量
 * @param {Integer} [params.targetType] - 举报目标类型：1-动态，2-评论
 * @param {Integer} [params.status] - 处理状态：0-待处理，1-已处理有效举报，2-已处理无效举报
 * @param {String} [params.startTime] - 起始时间，格式：yyyy-MM-dd HH:mm:ss
 * @param {String} [params.endTime] - 结束时间，格式：yyyy-MM-dd HH:mm:ss
 * @returns {Promise} 返回筛选后的举报列表的Promise
 */
export function filterReports(params) {
  console.log('调用筛选举报列表API，参数:', params)
  return request({
    url: '/report/admin/filter',
    method: 'get',
    params
  }).then(response => {
    console.log('筛选举报列表API响应:', response)
    return response
  }).catch(error => {
    console.error('筛选举报列表API错误:', error)
    return Promise.reject(error)
  })
}

/**
 * 获取举报详情
 * @param {Object} params - 请求参数
 * @param {Integer} params.reportId - 举报ID
 * @returns {Promise} 返回举报详情的Promise
 */
export function getReportDetail(params) {
  console.log('调用举报详情API，参数:', params)
  return request({
    url: '/report/detail',
    method: 'get',
    params
  }).then(response => {
    console.log('举报详情API响应:', response)
    return response
  }).catch(error => {
    console.error('举报详情API错误:', error)
    console.error('详细错误信息:', error.message)
    if (error.response) {
      console.error('服务器状态码:', error.response.status)
      console.error('服务器响应数据:', error.response.data)
    }
    return Promise.reject(error)
  })
}

/**
 * 获取评论详情（被举报的评论）
 * @param {Object} params - 请求参数
 * @param {BigInteger} params.commentId - 评论ID
 * @returns {Promise} 返回评论详情的Promise
 */
export function getCommentDetail(params) {
  console.log('调用评论详情API，参数:', params)
  return request({
    url: '/comment/detail',
    method: 'get',
    params
  }).then(response => {
    console.log('评论详情API响应:', response)
    return response
  }).catch(error => {
    console.error('评论详情API错误:', error)
    return Promise.reject(error)
  })
}

/**
 * 处理举报
 * @param {Object} params - 请求参数
 * @param {Integer} params.reportId - 举报ID
 * @param {Integer} params.status - 处理结果：1-有效举报，2-无效举报
 * @param {Integer} params.adminId - 处理管理员ID
 * @returns {Promise} 返回处理结果的Promise
 * @description 当举报被标记为有效时，系统会自动对举报目标执行相应处理：
 * 对于动态，将其设置为不可见状态；对于评论，将直接删除。
 */
export function handleReport(params) {
  console.log('调用处理举报API，参数:', params)
  return request({
    url: '/report/admin/handle',
    method: 'post',
    params
  }).then(response => {
    console.log('处理举报API响应:', response)
    return response
  }).catch(error => {
    console.error('处理举报API错误:', error)
    return Promise.reject(error)
  })
}
