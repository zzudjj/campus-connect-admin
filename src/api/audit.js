import request from './request'

/**
 * 分页获取审计日志
 * @param {object} params 查询参数，例如 { page: 1, size: 10 }
 * @returns Promise
 */
export function getAuditLogs(params) {
  return request({
    url: '/admin/audit-logs',
    method: 'get',
    params
  })
}
