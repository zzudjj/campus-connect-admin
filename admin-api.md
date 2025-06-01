# Campus Connect 管理端 API 文档

## 目录

- [1. 概述](#1-概述)
- [2. 通用响应格式](#2-通用响应格式)
- [3. 管理员登录模块](#3-管理员登录模块)
  - [3.1 管理员登录](#31-管理员登录)
- [4. 忘记密码模块](#4-忘记密码模块)
  - [4.1 请求密码重置验证码](#41-请求密码重置验证码)
  - [4.2 验证邮箱验证码](#42-验证邮箱验证码)
  - [4.3 重置密码](#43-重置密码)
- [5. 图片验证码模块](#5-图片验证码模块)
  - [5.1 生成图片验证码](#51-生成图片验证码)
  - [5.2 验证图片验证码](#52-验证图片验证码)
- [6. 用户管理模块](#6-用户管理模块)
  - [6.1 更新用户账号状态](#61-更新用户账号状态)
  - [6.2 审核用户认证申请](#62-审核用户认证申请)
  - [6.3 管理员修改用户信息](#63-管理员修改用户信息)
  - [6.4 多条件搜索用户](#64-多条件搜索用户)
  - [6.5 获取用户统计信息](#65-获取用户统计信息)
  - [6.6 批量更新用户状态](#66-批量更新用户状态)
  - [6.7 获取当前在线用户数量](#67-获取当前在线用户数量)
  - [6.8 分页获取用户详细信息](#68-分页获取用户详细信息)
  - [6.9 获取用户认证详情](#69-获取用户认证详情)
  - [6.10 分页获取认证中的用户](#610-分页获取认证中的用户)
- [7. 动态管理模块](#7-动态管理模块)
  - [7.1 分页获取所有动态](#71-分页获取所有动态)
  - [7.2 获取动态详情](#72-获取动态详情)
  - [7.3 删除动态](#73-删除动态)
  - [7.4 切换动态屏蔽状态](#74-切换动态屏蔽状态)
  - [7.5 获取动态统计信息](#75-获取动态统计信息)
  - [7.6 批量删除动态](#76-批量删除动态)
  - [7.7 多条件搜索动态](#77-多条件搜索动态)
  - [7.8 获取某用户的所有动态](#78-获取某用户的所有动态)
  - [7.9 刷新所有动态的热度分数](#79-刷新所有动态的热度分数)
  - [7.10 获取动态媒体](#710-获取动态媒体)
- [8. 标签管理模块](#8-标签管理模块)
  - [8.1 获取所有标签](#81-获取所有标签)
  - [8.2 创建系统标签](#82-创建系统标签)
  - [8.3 搜索标签](#83-搜索标签)
  - [8.4 删除标签](#84-删除标签)
  - [8.5 标签使用统计](#85-标签使用统计)
- [9. 举报管理模块](#9-举报管理模块)
  - [9.1 获取待处理的举报列表](#91-获取待处理的举报列表)
  - [9.2 获取举报详情](#92-获取举报详情)
  - [9.3 获取评论详情](#93-获取评论详情)
  - [9.4 处理举报](#94-处理举报)

## 1. 概述

Campus Connect 管理员 API 提供了管理员端所需的各种功能接口，包括管理员登录、密码重置、图片验证码以及用户管理等功能。

- 基础URL: `http://localhost:8080`
- 认证方式: JWT令牌，在请求头中以`token`字段传递

## 2. 通用响应格式

所有API返回统一的JSON格式:

```json
{
  "code": 200,          // 状态码，200表示成功，其他表示失败
  "message": "success", // 响应消息
  "data": {}            // 响应数据，可能是对象、数组或null
}
```

### 常见状态码

| 状态码 | 描述 |
| ------ | ---- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或token过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 3. 管理员登录模块

### 3.1 管理员登录

管理员通过邮箱和密码登录系统。

**请求URL**: `/admin/login`

**请求方式**: `POST`

**请求参数** (@RequestBody):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| email | String | 是 | 管理员邮箱 |
| passwordHash | String | 是 | 密码 |

**请求示例**:

```json
{
  "email": "admin@example.com",
  "passwordHash": "admin123"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // JWT令牌
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "管理员不存在",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "密码错误",
  "data": null
}
```

## 4. 忘记密码模块

### 4.1 请求密码重置验证码

用户或管理员忘记密码时，可请求发送密码重置验证码到邮箱。

**请求URL**: `/password/forgot`

**请求方式**: `POST`

**请求参数** (@RequestBody PasswordResetRequest):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| email | String | 是 | 用户或管理员邮箱 |

**请求示例**:

```json
{
  "email": "admin@example.com"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "验证码已发送到您的邮箱",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "邮箱不存在或发送失败",
  "data": null
}
```

### 4.2 验证邮箱验证码

验证用户或管理员收到的邮箱验证码是否正确。

**请求URL**: `/password/verify`

**请求方式**: `POST`

**请求参数** (@RequestBody VerifyCodeRequest):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| email | String | 是 | 用户或管理员邮箱 |
| code | String | 是 | 邮箱验证码 |

**请求示例**:

```json
{
  "email": "admin@example.com",
  "code": "123456"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "验证码正确",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "验证码错误或已过期",
  "data": null
}
```

### 4.3 重置密码

通过验证码重置用户或管理员密码。

**请求URL**: `/password/reset`

**请求方式**: `POST`

**请求参数** (@RequestBody ResetPasswordRequest):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| email | String | 是 | 用户或管理员邮箱 |
| code | String | 是 | 邮箱验证码 |
| newPassword | String | 是 | 新密码 |
| isAdmin | Boolean | 是 | 是否为管理员请求 |

**请求示例**:

```json
{
  "email": "admin@example.com",
  "code": "123456",
  "newPassword": "newpassword123",
  "isAdmin": true
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "密码重置失败，请确认邮箱和验证码正确",
  "data": null
}
```

## 5. 图片验证码模块

### 5.1 生成图片验证码

生成图片验证码，返回验证码ID和图片Base64编码。

**请求URL**: `/captcha/generate`

**请求方式**: `GET`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "captchaId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "captchaImage": "data:image/png;base64,iVBORw0KGgoAAA..."
  }
}
```

### 5.2 验证图片验证码

验证用户输入的图片验证码是否正确。

**请求URL**: `/captcha/verify`

**请求方式**: `POST`

**请求参数** (@RequestBody):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| captchaId | String | 是 | 验证码ID |
| code | String | 是 | 用户输入的验证码 |

**请求示例**:

```json
{
  "captchaId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "A7B3"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "验证成功",
  "data": true
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "验证码错误或已过期",
  "data": false
}
```

## 6. 用户管理模块

### 6.1 更新用户账号状态

管理员更新用户账号状态（启用/禁用）。

**请求URL**: `/admin/user/updateStatus`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody Map<String, Object>):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| userId | Integer | 是 | 用户ID |
| accountStatus | Integer | 是 | 账号状态(0:正常,1:禁用) |

**请求示例**:

```json
{
  "userId": 123,
  "accountStatus": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户状态更新成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "用户状态更新失败",
  "data": null
}
```

### 6.2 审核用户认证申请

管理员审核用户的认证申请，可以通过或拒绝申请。

**请求URL**: `/admin/user/verifyAuth`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody Map<String, Object>):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| userId | Integer | 是 | 用户ID |
| authStatus | Integer | 是 | 认证状态(0:未认证,1:已认证,2:认证中) |

**请求示例**:

```json
{
  "userId": 123,
  "authStatus": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户认证状态更新成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "用户认证状态更新失败",
  "data": null
}
```

### 6.3 管理员修改用户信息

管理员修改用户基本信息。

**请求URL**: `/admin/user/updateUserInfo`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody User):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| userId | Integer | 是 | 用户ID |
| nickname | String | 否 | 用户昵称 |
| school | String | 否 | 学校 |
| department | String | 否 | 院系 |
| authStatus | Integer | 否 | 认证状态 |
| accountStatus | Integer | 否 | 账号状态 |

**请求示例**:

```json
{
  "userId": 123,
  "nickname": "新昵称",
  "school": "某大学",
  "department": "计算机学院",
  "authStatus": 1,
  "accountStatus": 0
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "用户信息更新失败",
  "data": null
}
```

### 6.4 多条件搜索用户

根据多种条件搜索符合条件的用户，支持分页。

**请求URL**: `/admin/user/searchUsers`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody Map<String, Object>):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| nickname | String | 否 | 用户昵称（模糊查询） |
| email | String | 否 | 用户邮箱（模糊查询） |
| school | String | 否 | 学校（模糊查询） |
| department | String | 否 | 院系（模糊查询） |
| authStatus | Integer | 否 | 认证状态 |
| accountStatus | Integer | 否 | 账号状态 |
| page | Integer | 否 | 页码（从1开始），默认为1 |
| size | Integer | 否 | 每页数量，默认为10 |

**请求示例**:

```json
{
  "nickname": "张",
  "school": "北京",
  "authStatus": 1,
  "page": 1,
  "size": 10
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "users": [
      {
        "userId": 123,
        "email": "user123@example.com",
        "nickname": "张三",
        "avatarUrl": "https://example.com/avatar/123.jpg",
        "authStatus": 1,
        "accountStatus": 0,
        "department": "计算机学院",
        "school": "北京大学",
        "createdAt": "2025-01-15T14:30:00",
        "updatedAt": "2025-05-20T10:15:00"
      },
      {
        "userId": 124,
        "email": "user124@example.com",
        "nickname": "张四",
        "avatarUrl": "https://example.com/avatar/124.jpg",
        "authStatus": 1,
        "accountStatus": 0,
        "department": "信息科学学院",
        "school": "北京师范大学",
        "createdAt": "2025-01-16T11:20:00",
        "updatedAt": "2025-05-22T09:45:00"
      }
    ],
    "totalCount": 25,
    "currentPage": 1,
    "totalPages": 3,
    "pageSize": 10
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "搜索用户失败: ...",
  "data": null
}
```

### 6.5 获取用户统计信息

获取系统用户相关的统计信息。

**请求URL**: `/admin/user/statistics`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_users": 1000,
    "authenticated_users": 750,
    "unauthenticated_users": 200,
    "authenticating_users": 50,
    "disabled_users": 15,
    "new_users_today": 12
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "获取用户统计信息失败: ...",
  "data": null
}
```

### 6.6 批量更新用户状态

批量更新多个用户的账号状态。

**请求URL**: `/admin/user/batchUpdateStatus`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody Map<String, Object>):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| userIds | Array[Integer] | 是 | 用户ID列表 |
| accountStatus | Integer | 是 | 账号状态(0:正常,1:禁用) |

**请求示例**:

```json
{
  "userIds": [123, 124, 125],
  "accountStatus": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "批量更新用户状态成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "批量更新用户状态失败",
  "data": null
}
```

### 6.7 获取当前在线用户数量

获取系统当前在线的用户数量。

**请求URL**: `/admin/user/onlineCount`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "onlineCount": 126,
    "timestamp": 1622548800000
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "获取在线用户数失败: ...",
  "data": null
}
```

### 6.8 分页获取用户详细信息

分页获取系统用户的详细信息列表，使用数据库级分页实现。

**请求URL**: `/admin/user/pageUsers`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| page | Integer | 否 | 页码（从1开始），默认为1 |
| size | Integer | 否 | 每页数量，默认为10 |

**请求示例**:

```
/admin/user/pageUsers?page=1&size=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "users": [
      {
        "userId": 123,
        "email": "user123@example.com",
        "nickname": "张三",
        "avatarUrl": "https://example.com/avatar/123.jpg",
        "authStatus": 1,
        "accountStatus": 0,
        "department": "计算机学院",
        "school": "北京大学",
        "createdAt": "2025-01-15T14:30:00",
        "updatedAt": "2025-05-20T10:15:00"
      },
      // ... 更多用户
    ],
    "totalCount": 1000,
    "currentPage": 1,
    "totalPages": 100,
    "pageSize": 10
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "分页获取用户信息失败: ...",
  "data": null
}
```

### 6.9 获取用户认证详情

获取用户详细认证信息，包括校园卡正反面照片等。

**请求URL**: `/admin/user/authDetail`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| userId | Integer | 是 | 用户ID |

**请求示例**:

```
/admin/user/authDetail?userId=123
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 123,
    "nickname": "张三",
    "email": "zhangsan@example.com",
    "authStatus": 2,
    "accountStatus": 0,
    "beforeCardUrl": "https://example.com/cards/front123.jpg",
    "afterCardUrl": "https://example.com/cards/back123.jpg",
    "school": "北京大学",
    "department": "计算机科学与技术系",
    "rejectReason": null,
    "createdAt": "2023-09-15T14:30:00",
    "updatedAt": "2023-09-20T10:15:00"
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "获取用户认证详情失败: ...",
  "data": null
}
```

### 6.10 分页获取认证中的用户

分页获取当前处于认证中状态(authStatus=2)的所有用户信息，使用数据库级分页实现。

**请求URL**: `/admin/user/authenticatingUsers`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| page | Integer | 否 | 页码（从1开始），默认为1 |
| size | Integer | 否 | 每页数量，默认为10 |

**请求示例**:

```
/admin/user/authenticatingUsers?page=1&size=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "users": [
      {
        "userId": 123,
        "nickname": "张三",
        "email": "zhangsan@example.com",
        "authStatus": 2,
        "accountStatus": 0,
        "beforeCardUrl": "https://example.com/cards/front123.jpg",
        "afterCardUrl": "https://example.com/cards/back123.jpg",
        "school": "北京大学",
        "department": "计算机科学与技术系",
        "createdAt": "2023-09-15T14:30:00",
        "updatedAt": "2023-09-20T10:15:00"
      },
      // ... 更多用户
    ],
    "totalCount": 35,
    "currentPage": 1,
    "totalPages": 4,
    "pageSize": 10
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "分页获取认证中的用户信息失败: ...",
  "data": null
}
```

## 7. 动态管理模块

### 7.1 分页获取所有动态

分页获取系统中的所有动态信息，使用数据库级分页。

**请求URL**: `/admin/post/page`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| page | Integer | 否 | 页码（从1开始），默认为1 |
| size | Integer | 否 | 每页数量，默认为10 |

**请求示例**:

```
/admin/post/page?page=1&size=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "posts": [
      {
        "postId": 123,
        "userId": 456,
        "content": "这是一条动态内容",
        "title": "动态标题",
        "visibility": 0,
        "viewNum": 150,
        "likeNum": 25,
        "commentNum": 10,
        "hotScore": 68.5,
        "createdAt": "2025-05-20T10:15:00",
        "updatedAt": "2025-05-30T08:45:30"
      },
      // ... 更多动态
    ],
    "totalCount": 500,
    "currentPage": 1,
    "totalPages": 50,
    "pageSize": 10
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "分页获取动态信息失败: ...",
  "data": null
}
```

### 7.2 获取动态详情

获取特定动态的详细信息。

**请求URL**: `/admin/post/detail`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| postId | Integer | 是 | 动态ID |

**请求示例**:

```
/admin/post/detail?postId=123
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "postId": 123,
    "userId": 456,
    "content": "这是一条动态内容",
    "title": "动态标题",
    "visibility": 0,
    "viewNum": 150,
    "likeNum": 25,
    "commentNum": 10,
    "hotScore": 68.5,
    "createdAt": "2025-05-20T10:15:00",
    "updatedAt": "2025-05-30T08:45:30",
    "media": [
      {
        "mediaId": 789,
        "postId": 123,
        "mediaUrl": "https://example.com/media/image1.jpg",
        "mediaType": 0,
        "sortOrder": 1
      }
    ],
    "tags": ["校园", "生活"]
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 404,
  "message": "动态不存在",
  "data": null
}
```

### 7.3 删除动态

删除指定的动态及其相关数据（评论、点赞、标签等）。

**请求URL**: `/admin/post/delete`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| postId | Integer | 是 | 动态ID |

**请求示例**:

```
/admin/post/delete?postId=123
```

**响应示例**:

```json
{
  "code": 200,
  "message": "动态删除成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "动态删除失败",
  "data": null
}
```

### 7.4 切换动态屏蔽状态

切换动态的屏蔽状态（屏蔽/恢复），不修改用户设置的可见性类型。

**请求URL**: `/admin/post/toggleBlock`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| postId | Integer | 是 | 动态ID |

**请求示例**:

```json
{
  "postId": 123
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "postId": 123,
    "visibility": -1,  // 负数表示被屏蔽状态
    "status": "blocked" // 或 "unblocked"
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "切换动态屏蔽状态失败",
  "data": null
}
```

### 7.5 获取动态统计信息

获取系统中动态的统计信息。

**请求URL**: `/admin/post/statistics`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPosts": 1200,
    "publicPosts": 800,
    "friendOnlyPosts": 300,
    "privateOnlyPosts": 100,
    "blockedPosts": 50,
    "postsToday": 25,
    "topHotPosts": [
      {
        "postId": 123,
        "title": "热门动态1",
        "hotScore": 98.5
      },
      // ... 更多热门动态
    ]
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "获取动态统计信息失败: ...",
  "data": null
}
```

### 7.6 批量删除动态

批量删除多个动态及其相关数据。

**请求URL**: `/admin/post/batchDelete`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| postIds | Array[Integer] | 是 | 动态ID列表 |

**请求示例**:

```json
{
  "postIds": [123, 124, 125]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deleted": 3,
    "failed": 0,
    "total": 3
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "批量删除动态失败",
  "data": null
}
```

### 7.7 多条件搜索动态

根据多种条件搜索符合条件的动态，支持数据库级分页。

**请求URL**: `/admin/post/search`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody):

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| content | String | 否 | 动态内容关键词 |
| userId | Integer | 否 | 用户ID |
| visibility | Integer | 否 | 可见性类型 |
| startDate | String | 否 | 开始日期（格式：yyyy-MM-dd） |
| endDate | String | 否 | 结束日期（格式：yyyy-MM-dd） |
| page | Integer | 否 | 页码（从1开始），默认为1 |
| size | Integer | 否 | 每页数量，默认为10 |

**请求示例**:

```json
{
  "content": "校园",
  "visibility": 0,
  "startDate": "2025-05-01",
  "endDate": "2025-05-31",
  "page": 1,
  "size": 10
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "posts": [
      {
        "postId": 123,
        "userId": 456,
        "content": "这是一条关于校园的动态",
        "visibility": 0,
        "viewNum": 150,
        "likeNum": 25,
        "commentNum": 10,
        "hotScore": 68.5,
        "createdAt": "2025-05-20T10:15:00",
        "updatedAt": "2025-05-30T08:45:30"
      },
      // ... 更多动态
    ],
    "totalCount": 15,
    "currentPage": 1,
    "totalPages": 2,
    "pageSize": 10
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "搜索动态失败: ...",
  "data": null
}
```

### 7.8 获取某用户的所有动态

分页获取指定用户的所有动态。

**请求URL**: `/admin/post/user`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| userId | Integer | 是 | 用户ID |
| page | Integer | 否 | 页码，默认为1 |
| size | Integer | 否 | 每页数量，默认为10 |

**请求示例**:

```
/admin/post/user?userId=456&page=1&size=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "posts": [
      {
        "postId": 123,
        "userId": 456,
        "content": "这是用户的一条动态",
        "visibility": 0,
        "viewNum": 150,
        "likeNum": 25,
        "commentNum": 10,
        "hotScore": 68.5,
        "createdAt": "2025-05-20T10:15:00",
        "updatedAt": "2025-05-30T08:45:30"
      },
      // ... 更多动态
    ],
    "totalCount": 35,
    "currentPage": 1,
    "totalPages": 4,
    "pageSize": 10,
    "userId": 456
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "用户ID不能为空",
  "data": null
}
```

### 7.9 刷新所有动态的热度分数

手动触发刷新所有动态的热度分数计算。

**请求URL**: `/admin/post/refreshHotScores`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**响应示例**:

```json
{
  "code": 200,
  "message": "热度分数刷新成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "刷新热度分数失败: ...",
  "data": null
}
```

### 7.10 获取动态媒体

获取指定动态的所有媒体文件。

**请求URL**: `/post/media/getPostMedia`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（可选，某些动态可能需要登录权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| postId | Integer | 是 | 动态ID |

**请求示例**:

```
/post/media/getPostMedia?postId=123
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "mediaId": 789,
      "postId": 123,
      "mediaUrl": "https://example.com/media/image1.jpg",
      "mediaType": 0,  // 0:图片，1:视频
      "sortOrder": 1
    },
    {
      "mediaId": 790,
      "postId": 123,
      "mediaUrl": "https://example.com/media/image2.jpg",
      "mediaType": 0,
      "sortOrder": 2
    }
  ]
}
```

**错误响应**:

```json
{
  "code": 404,
  "message": "动态不存在",
  "data": null
}
```
## 8. 标签管理模块

### 8.1 获取所有标签

**接口描述**：管理员获取系统中的所有标签，包括系统和用户创建的标签

**请求URL**: `/tag/all`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "tagId": 1,
      "name": "校园生活",
      "type": 0,
      "createdAt": "2023-05-15 14:30:00"
    },
    {
      "tagId": 2,
      "name": "学习",
      "type": 0,
      "createdAt": "2023-05-15 14:31:00"
    },
    {
      "tagId": 8,
      "name": "活动分享",
      "type": 1,
      "createdAt": "2023-05-22 16:45:00"
    }
  ]
}
```

### 8.2 创建系统标签

**接口描述**：管理员创建系统级标签（type=0）

**请求URL**: `/tag/create`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数** (@RequestBody):

| 参数名 | 类型    | 必填 | 描述                           |
| ------ | ------- | ---- | ------------------------------ |
| name   | String  | 是   | 标签名称                       |
| type   | Integer | 否   | 标签类型，必须为0（表示系统标签） |

**请求示例**:

```json
{
  "name": "校园活动",
  "type": 0
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "tagId": 10,
    "name": "校园活动",
    "type": 0,
    "createdAt": "2023-06-01 10:15:00"
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "非管理员用户无法创建系统标签",
  "data": null
}
```

### 8.3 搜索标签

**接口描述**：管理员根据名称搜索标签（模糊查询）

**请求URL**: `/tag/search`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型   | 必填 | 描述     |
| ------ | ------ | ---- | -------- |
| name   | String | 是   | 标签名称关键词 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "tagId": 5,
      "name": "学习方法",
      "type": 0,
      "createdAt": "2023-05-20 10:30:00"
    },
    {
      "tagId": 8,
      "name": "学习心得",
      "type": 1,
      "createdAt": "2023-05-22 16:45:00"
    }
  ]
}
```

### 8.4 删除标签

**接口描述**：管理员删除指定标签（包括系统标签和用户标签）

**请求URL**: `/tag/delete/{tagId}`

**请求方式**: `DELETE`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型    | 必填 | 描述   |
| ------ | ------- | ---- | ------ |
| tagId  | Integer | 是   | 标签ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "非管理员用户无法删除标签",
  "data": null
}
```

### 8.5 标签使用统计

**接口描述**：获取系统中标签的使用情况统计

**请求URL**: `/admin/tag/statistics`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalTags": 25,
    "systemTags": 10,
    "userTags": 15,
    "topUsedTags": [
      {
        "tagId": 1,
        "name": "校园生活",
        "useCount": 156,
        "type": 0
      },
      {
        "tagId": 3,
        "name": "考研",
        "useCount": 89,
        "type": 0
      },
      {
        "tagId": 8,
        "name": "活动分享",
        "useCount": 45,
        "type": 1
      }
    ]
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```



## 9. 举报管理模块

### 9.1 获取待处理的举报列表

**接口说明**: 管理员获取待处理（状态为0）的举报列表，支持分页查询

**请求URL**: `/report/admin/pending`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| page | Integer | 否 | 页码，从0开始，默认为0 |
| size | Integer | 否 | 每页数量，默认为10 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "reportId": 1,
      "reporterId": 101,
      "targetId": 201,
      "targetType": 1,
      "reason": "含有不适当内容",
      "status": 0,
      "handledByAdminId": null,
      "createdAt": "2025-05-20T10:30:15",
      "handledAt": null,
      "reporterNickname": "张三",
      "targetContent": "这是被举报的动态内容摘要",
      "targetTypeName": "动态"
    },
    {
      "reportId": 2,
      "reporterId": 102,
      "targetId": 202,
      "targetType": 2,
      "reason": "骚扰言论",
      "status": 0,
      "handledByAdminId": null,
      "createdAt": "2025-05-20T11:45:22",
      "handledAt": null,
      "reporterNickname": "李四",
      "targetContent": "这是被举报的评论内容",
      "targetTypeName": "评论"
    }
  ]
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

### 9.2 获取举报详情

**接口说明**: 根据举报ID获取举报的详细信息，包括举报人信息、被举报内容详情等

**请求URL**: `/report/admin/detail`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| reportId | Integer | 是 | 举报ID |

**请求示例**:

```
/report/admin/detail?reportId=1
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reportId": 1,
    "reporterId": 101,
    "targetId": 201,
    "targetType": 1,
    "reason": "含有不适当内容",
    "status": 0,
    "handledByAdminId": null,
    "createdAt": "2025-05-20T10:30:15",
    "handledAt": null,
    "reporterInfo": {
      "userId": 101,
      "nickname": "张三",
      "email": "zhangsan@example.com",
      "avatarUrl": "https://example.com/avatar/101.jpg"
    },
    "targetContent": "这是被举报的动态完整内容，可能包含更多文字、图片或视频链接等",
    "targetTypeName": "动态",
    "targetDetail": {
      "postId": 201,
      "userId": 202,
      "content": "这是被举报的动态完整内容，可能包含更多文字、图片或视频链接等",
      "createdAt": "2025-05-18T08:15:30",
      "mediaUrls": ["https://example.com/media/1.jpg", "https://example.com/media/2.jpg"]
    }
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无管理员权限",
  "data": null
}
```

或

```json
{
  "code": 404,
  "message": "举报不存在",
  "data": null
}
```

### 9.3 获取评论详情

**接口说明**: 获取被举报评论的详细内容，用于举报处理

**请求URL**: `/comment/detail`

**请求方式**: `GET`

**请求头**:
- `token`: JWT令牌（可选，用户验证）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| commentId | BigInteger | 是 | 评论ID |

**请求示例**:

```
/comment/detail?commentId=123456789
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123456789,
    "userId": 1001,
    "postId": 5001,
    "content": "这是评论的详细内容",
    "parentCommentId": -1,
    "rootCommentId": -1,
    "likeCount": 15,
    "replyCount": 3,
    "status": 1,
    "createTime": "2025-05-30T14:20:35",
    "userNickname": "用户昵称",
    "userAvatar": "https://example.com/avatars/user1001.jpg",
    "repliedUserNickname": null
  }
}
```

**错误响应**:

```json
{
  "code": 404,
  "message": "评论不存在",
  "data": null
}
```

### 9.4 处理举报

**接口说明**: 管理员处理举报请求，将举报状态更新为已处理有效(1)或无效(2)。当举报被标记为有效时，系统会自动对举报目标执行相应处理：对于动态，将其设置为不可见状态；对于评论，将直接删除。

**请求URL**: `/report/admin/handle`

**请求方式**: `POST`

**请求头**:
- `token`: JWT令牌（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| reportId | Integer | 是 | 举报ID |
| status | Integer | 是 | 处理结果：1-有效举报，2-无效举报 |
| adminId | Integer | 是 | 处理管理员ID |

**请求示例**:

```
/report/admin/handle?reportId=1&status=1&adminId=999
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": "处理成功"
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "处理失败",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "处理举报失败: 举报不存在",
  "data": null
}
```
