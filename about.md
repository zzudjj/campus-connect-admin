# Vue Project 1 - 前端项目总结

## 项目概述
这是一个基于 Vue 3 的前端项目，使用 Vite 作为构建工具，实现了一个包含用户管理、文章管理、评论管理和标签管理的内容管理系统。

## 技术栈
- **框架**：Vue 3
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **UI 组件库**：Element Plus (中文本地化)
- **HTTP 客户端**：Axios
- **其他依赖**：
  - nprogress（进度条）
  - zxcvbn（密码强度检测）

## 项目结构
- **src/api/**：API 接口模块（用户、文章、评论、标签）
- **src/assets/**：静态资源
- **src/components/**：可复用组件
- **src/layouts/**：布局组件
- **src/router/**：路由配置
- **src/styles/**：样式文件
- **src/views/**：页面视图组件
- **src/main.js**：应用入口文件

## 功能模块
- **认证系统**：登录功能，基于 JWT 令牌的认证
- **用户管理**：用户列表与用户操作
- **文章管理**：文章的增删改查
- **评论管理**：评论的管理功能
- **标签管理**：标签的管理功能

## 安全特性
- 路由守卫保护需要认证的路由
- 请求拦截器自动添加 Authorization 头
- 响应拦截器处理未授权等常见错误

## 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 后端接口
后端 API 服务器默认配置为 `http://127.0.0.1:8080`
