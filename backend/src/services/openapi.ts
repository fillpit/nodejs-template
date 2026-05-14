/**
 * Nowen Note OpenAPI 规范自动生成
 *
 * 从路由定义自动生成 OpenAPI 3.0 JSON，
 * 提供 /api/openapi.json 端点供 Swagger UI 等工具消费。
 */

export function generateOpenAPISpec(): Record<string, unknown> {
  return {
    openapi: "3.0.3",
    info: {
      title: "Nowen Note API",
      version: "1.0.0",
      description: "Nowen Note 笔记系统完整 REST API 文档",
      contact: { name: "Nowen Note" },
    },
    servers: [
      { url: "http://localhost:3001", description: "本地开发" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Plugin: {
          type: "object",
          properties: {
            name: { type: "string" },
            version: { type: "string" },
            description: { type: "string" },
            author: { type: "string" },
            status: { type: "string", enum: ["active", "error", "disabled"] },
            capabilities: { type: "array", items: { type: "object" } },
          },
        },
        AuditLog: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            category: { type: "string" },
            action: { type: "string" },
            level: { type: "string", enum: ["info", "warn", "error"] },
            targetType: { type: "string" },
            targetId: { type: "string" },
            details: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        BackupInfo: {
          type: "object",
          properties: {
            id: { type: "string" },
            filename: { type: "string" },
            size: { type: "integer" },
            type: { type: "string", enum: ["full", "db-only"] },
            noteCount: { type: "integer" },
            notebookCount: { type: "integer" },
            checksum: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths: {
      // ===== 认证 =====
      "/api/auth/login": {
        post: {
          tags: ["认证"],
          summary: "用户登录",
          security: [],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { username: { type: "string" }, password: { type: "string" } }, required: ["username", "password"] } } } },
          responses: { "200": { description: "登录成功，返回 JWT Token" } },
        },
      },
      "/api/auth/verify": {
        get: { tags: ["认证"], summary: "验证 Token", responses: { "200": { description: "Token 有效" } } },
      },
      "/api/auth/change-password": {
        post: { tags: ["认证"], summary: "修改密码", requestBody: { content: { "application/json": { schema: { type: "object", properties: { oldPassword: { type: "string" }, newPassword: { type: "string" } } } } } }, responses: { "200": { description: "密码修改成功" } } },
      },

      // ===== AI =====
      "/api/ai/settings": {
        get: { tags: ["AI"], summary: "获取 AI 设置", responses: { "200": { description: "AI 配置" } } },
        put: { tags: ["AI"], summary: "更新 AI 设置", responses: { "200": { description: "更新成功" } } },
      },
      "/api/ai/models": {
        get: { tags: ["AI"], summary: "获取可用模型列表", responses: { "200": { description: "模型列表" } } },
      },

      // ===== 插件 =====
      "/api/plugins": {
        get: { tags: ["插件"], summary: "获取已加载插件列表", responses: { "200": { description: "插件列表", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Plugin" } } } } } } },
      },
      "/api/plugins/reload": {
        post: { tags: ["插件"], summary: "重新扫描加载插件", responses: { "200": { description: "加载结果" } } },
      },
      "/api/plugins/{name}/execute": {
        post: { tags: ["插件"], summary: "执行指定插件", parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "执行结果" } } },
      },

      // ===== 审计 =====
      "/api/audit": {
        get: { tags: ["审计日志"], summary: "查询审计日志", parameters: [{ name: "category", in: "query", schema: { type: "string" } }, { name: "level", in: "query", schema: { type: "string" } }, { name: "dateFrom", in: "query", schema: { type: "string" } }, { name: "dateTo", in: "query", schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "审计日志", content: { "application/json": { schema: { type: "object", properties: { logs: { type: "array", items: { $ref: "#/components/schemas/AuditLog" } }, total: { type: "integer" } } } } } } } },
      },
      "/api/audit/stats": {
        get: { tags: ["审计日志"], summary: "审计统计", responses: { "200": { description: "统计数据" } } },
      },

      // ===== 备份 =====
      "/api/backups": {
        get: { tags: ["备份恢复"], summary: "列出备份", responses: { "200": { description: "备份列表", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/BackupInfo" } } } } } } },
        post: { tags: ["备份恢复"], summary: "创建备份", requestBody: { content: { "application/json": { schema: { type: "object", properties: { type: { type: "string", enum: ["full", "db-only"] }, description: { type: "string" } } } } } }, responses: { "201": { description: "备份信息" } } },
      },
      "/api/backups/{filename}/download": {
        get: { tags: ["备份恢复"], summary: "下载备份文件", parameters: [{ name: "filename", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "备份文件" } } },
      },
      "/api/backups/{filename}/restore": {
        post: { tags: ["备份恢复"], summary: "从备份恢复", parameters: [{ name: "filename", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "恢复结果" } } },
      },

      // ===== 系统 =====
      "/api/health": {
        get: { tags: ["系统"], summary: "健康检查", security: [], responses: { "200": { description: "服务状态" } } },
      },
      "/api/settings": {
        get: { tags: ["系统"], summary: "获取系统设置", security: [], responses: { "200": { description: "设置信息" } } },
        put: { tags: ["系统"], summary: "更新系统设置", responses: { "200": { description: "更新成功" } } },
      },
      "/api/me": {
        get: { tags: ["系统"], summary: "获取当前登录用户信息", responses: { "200": { description: "用户信息" } } },
      },
      "/api/openapi.json": {
        get: { tags: ["系统"], summary: "获取 OpenAPI 规范", security: [], responses: { "200": { description: "OpenAPI JSON" } } },
      },
    },
    tags: [
      { name: "认证", description: "用户认证管理" },
      { name: "AI", description: "AI 智能配置" },
      { name: "插件", description: "插件管理与执行" },
      { name: "审计日志", description: "操作审计日志" },
      { name: "备份恢复", description: "数据备份与恢复" },
      { name: "系统", description: "系统设置与健康检查" },
    ],
  };
}
