/**
 * WebDAV 路由 - 备份上传/下载/连接检查
 *
 * 对齐 Android 端 WebDav 同步功能，提供 WebUI 操作入口。
 *
 * 端点列表:
 * - GET  /webDavCheck:    检查 WebDAV 连接
 * - POST /webDavBackup:   上传备份到 WebDAV
 * - POST /webDavRestore:  从 WebDAV 恢复备份
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 07:23 nmb - v3.3 初始版本
 */

package io.legado.api.routes

import io.legado.api.model.ReturnData
import io.legado.config.AppSettings
import io.legado.model.GSON
import io.legado.utils.BackupManager
import io.legado.utils.WebDavClient
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * 注册 WebDAV 路由
 */
fun Route.webDavRoutes() {

    /**
     * 检查 WebDAV 连接 GET /webDavCheck
     *
     * 从 AppSettings 读取 WebDav 配置，发起 PROPFIND 请求验证连接。
     * 返回连接状态消息。
     */
    get("/webDavCheck") {
        try {
            // 保存待检查的配置（前端可能刚提交了配置变更）
            AppSettings.persistAll()
            val result = WebDavClient.checkConnection()
            val isSuccess = result.startsWith("连接成功")
            call.respondText(
                GSON.toJson(ReturnData().setData(mapOf("success" to isSuccess, "message" to result))),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("WebDAV 连接检查失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /**
     * 上传备份到 WebDAV POST /webDavBackup
     *
     * 先在本地创建备份（含书籍/书源/配置），再上传到 WebDAV 服务器。
     * 返回上传结果消息。
     */
    post("/webDavBackup") {
        try {
            // 确保配置已持久化
            AppSettings.persistAll()

            // 创建本地备份
            val backupData = BackupManager.createBackup(
                includeBooks = true,
                includeSources = true,
                includeConfigs = true
            )

            // 上传到 WebDAV
            val result = WebDavClient.uploadBackup(backupData)
            val isSuccess = result.startsWith("备份已上传")
            call.respondText(
                GSON.toJson(ReturnData().setData(mapOf("success" to isSuccess, "message" to result, "size" to backupData.size))),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("WebDAV 备份上传失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /**
     * 从 WebDAV 恢复备份 POST /webDavRestore
     *
     * 从 WebDAV 服务器下载最新备份文件，恢复本地数据。
     * 返回恢复统计信息。
     */
    post("/webDavRestore") {
        try {
            // 确保配置已持久化
            AppSettings.persistAll()

            // 从 WebDAV 下载
            val backupData = WebDavClient.downloadLatestBackup()
            if (backupData == null) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("未找到 WebDAV 备份文件")),
                    ContentType.Application.Json
                )
                return@post
            }

            // 恢复备份
            val stats = BackupManager.restoreBackup(backupData)
            call.respondText(
                GSON.toJson(ReturnData().setData(stats)),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("WebDAV 备份恢复失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }
}