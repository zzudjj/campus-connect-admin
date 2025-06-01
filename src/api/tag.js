import request from './request'

/**
 * 获取标签列表
 * @param {Object} params - 查询参数
 * @param {Number} [params.page=1] - 页码
 * @param {Number} [params.size=10] - 每页数量
 * @returns {Promise} 返回标签列表的Promise
 */
export function getTagList(params) {
  return request({
    url: '/admin/tag/list',
    method: 'get',
    params
  })
}

/**
 * 获取所有标签
 * @returns {Promise} 返回标签列表的Promise
 */
export function getAllTags() {
  return request({
    url: '/tag/all',
    method: 'get'
  })
}

/**
 * 创建标签
 * @param {Object} data - 标签信息
 * @param {String} data.name - 标签名称
 * @param {String} data.description - 标签描述
 * @param {String} data.color - 标签颜色
 * @returns {Promise} 返回创建结果的Promise
 */
export function createTag(data) {
  return request({
    url: '/admin/tag/create',
    method: 'post',
    data
  })
}

/**
 * 更新标签
 * @param {Object} data - 标签信息
 * @param {Number} data.id - 标签ID
 * @param {String} data.name - 标签名称
 * @param {String} data.description - 标签描述
 * @param {String} data.color - 标签颜色
 * @returns {Promise} 返回更新结果的Promise
 */
export function updateTag(data) {
  return request({
    url: '/admin/tag/update',
    method: 'post',
    data
  })
}

/**
 * 创建系统标签
 * @param {Object} data - 标签信息
 * @param {String} data.name - 标签名称
 * @param {Integer} [data.type=0] - 标签类型，0表示系统标签
 * @returns {Promise} 返回创建结果的Promise
 */
export function createSystemTag(data) {
  return request({
    url: '/tag/create',
    method: 'post',
    data: {
      ...data,
      type: data.type !== undefined ? data.type : 0
    }
  })
}

/**
 * 搜索标签
 * @param {Object} params - 搜索参数
 * @param {String} params.name - 标签名称关键词
 * @returns {Promise} 返回搜索结果的Promise
 */
export function searchTags(params) {
  return request({
    url: '/tag/search',
    method: 'get',
    params
  })
}

/**
 * 删除标签
 * @param {Integer} tagId - 标签ID
 * @returns {Promise} 返回删除结果的Promise
 */
export function deleteTag(tagId) {
  return request({
    url: `/tag/delete/${tagId}`,
    method: 'delete'
  })
}

/**
 * 获取标签使用统计
 * @returns {Promise} 返回标签使用统计的Promise
 */
export function getTagStatistics() {
  return request({
    url: '/admin/tag/statistics',
    method: 'get'
  })
}