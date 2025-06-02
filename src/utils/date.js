/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间字符串或Date对象
 * @param {string} format - 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateTime) return '--';
  
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  if (isNaN(date.getTime())) {
    return dateTime; // 如果无法解析为有效日期，则返回原始值
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}
