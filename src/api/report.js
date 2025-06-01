import request from './request'

/**
 * 获取待处理的举报列表
 * @param {Object} params - 请求参数
 * @param {Integer} [params.page=0] - 页码，从0开始
 * @param {Integer} [params.size=10] - 每页数量
 * @returns {Promise} 返回待处理举报列表的Promise
 */
export function getPendingReports(params) {
  return request({
    url: '/report/admin/pending',
    method: 'get',
    params
  })
}

/**
 * 获取举报详情
 * @param {Object} params - 请求参数
 * @param {Integer} params.reportId - 举报ID
 * @returns {Promise} 返回举报详情的Promise
 */
export function getReportDetail(params) {
  return request({
    url: '/report/admin/detail',
    method: 'get',
    params
  })
}

/**
 * 获取评论详情（被举报的评论）
 * @param {Object} params - 请求参数
 * @param {BigInteger} params.commentId - 评论ID
 * @returns {Promise} 返回评论详情的Promise
 */
export function getCommentDetail(params) {
  return request({
    url: '/comment/detail',
    method: 'get',
    params
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
  return request({
    url: '/report/admin/handle',
    method: 'post',
    params
  })
}
