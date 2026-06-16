/**
 * 备份恢复路由 - 对齐 Android 版 HttpServer 扁平式路径
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:32 nmb - 阶段八新增
 */

package io.legado.api.routes

import io.legado.data.repository.BookSourceRepository
import io.legado.model.GSON
import io.legado.api.model.ReturnData
import io.legado.utils.BackupManager
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * 注册备份恢复路由（扁平式路径，无前缀）
 *
 * - POST /backup             创建备份（返回 zip）
 * - POST /restore            恢复备份（上传 zip）
 * - GET  /exportBookSources  导出书源
 * - POST /importBookSources  导入书源
 */
fun Route.backupRoutes() {

    /** 创建备份 POST /backup */
    post("/backup") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = if (body.isNotBlank()) {
                GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            } else emptyMap()
            val includeBooks = data["includeBooks"] as? Boolean ?: true
            val includeSources = data["includeSources"] as? Boolean ?: true
            val includeConfigs = data["includeConfigs"] as? Boolean ?: true

            val zipData = withContext(Dispatchers.IO) {
                BackupManager.createBackup(includeBooks, includeSources, includeConfigs)
            }
            call.response.header(
                HttpHeaders.ContentDisposition,
                "attachment; filename=\"legado_backup.zip\""
            )
            call.respondBytes(
                zipData,
                contentType = ContentType.parse("application/zip")
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("创建备份失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 恢复备份 POST /restore */
    post("/restore") {
        try {
            val zipData = call.receiveStream().readBytes()
            val result = withContext(Dispatchers.IO) {
                BackupManager.restoreBackup(zipData)
            }
            call.respondText(GSON.toJson(ReturnData().setData(result)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("恢复备份失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 导出书源 GET /exportBookSources */
    get("/exportBookSources") {
        try {
            val sources = BookSourceRepository.getAll().map { rowToMap(it) }
            call.respondText(GSON.toJson(sources), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("导出书源失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 导入书源 POST /importBookSources */
    post("/importBookSources") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val sources = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
            var count = 0
            sources.forEach { source ->
                val name = source["bookSourceName"] as? String ?: ""
                val sourceUrl = source["bookSourceUrl"] as? String ?: ""
                if (name.isNotBlank() && sourceUrl.isNotBlank()) {
                    BookSourceRepository.save(source)
                    count++
                }
            }
            call.respondText(GSON.toJson(ReturnData().setData(count)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("导入书源失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }
}