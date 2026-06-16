/**
 * RSS 源路由 - 对齐 Android 版 HttpServer 扁平式路径
 *
 * 路由路径与 Android 版 RssSourceController 完全一致，
 * 前端 api.ts 中 isBookSource=false 分支直接调用这些路径。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本（带 /rss 前缀，与前端不兼容）
 * 2026-06-13 21:26 nmb - 重构：移除 /rss 前缀，改为扁平式路径对齐Android版
 *                       新增 getRssSource 单个源查询端点
 */

package io.legado.api.routes

import io.legado.data.repository.RssSourceRepository
import io.legado.model.GSON
import io.legado.api.model.ReturnData
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * 注册 RSS 源相关路由（扁平式路径，无前缀）
 *
 * 对齐 Android 版 HttpServer.kt 的路由表：
 * - GET  /getRssSources      获取全部RSS源
 * - GET  /getRssSource       获取单个RSS源
 * - POST /saveRssSource      保存单个RSS源
 * - POST /saveRssSources     批量保存RSS源
 * - POST /deleteRssSources   批量删除RSS源
 */
fun Route.rssRoutes() {

    /** 获取全部 RSS 源 GET /getRssSources */
    get("/getRssSources") {
        try {
            val rows = RssSourceRepository.getAll()
            val sources = rows.map { rowToMap(it) }
            call.respondText(GSON.toJson(ReturnData().setData(sources)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取RSS源失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取单个 RSS 源 GET /getRssSource?url=xxx */
    get("/getRssSource") {
        val url = call.parameters["url"] ?: ""
        if (url.isEmpty()) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")),
                ContentType.Application.Json
            )
            return@get
        }
        try {
            val source = RssSourceRepository.getByUrl(url)?.let { rowToMap(it) }
            if (source == null) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("未找到源，请检查源地址")),
                    ContentType.Application.Json
                )
            } else {
                call.respondText(GSON.toJson(ReturnData().setData(source)), ContentType.Application.Json)
            }
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取RSS源失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 保存单个 RSS 源 POST /saveRssSource */
    post("/saveRssSource") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val sourceName = data["sourceName"] as? String ?: ""
            val sourceUrl = data["sourceUrl"] as? String ?: ""
            if (sourceName.isBlank() || sourceUrl.isBlank()) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("源名称和URL不能为空")),
                    ContentType.Application.Json
                )
                return@post
            }
            RssSourceRepository.save(data)
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存RSS源失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量保存 RSS 源 POST /saveRssSources */
    post("/saveRssSources") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val sources = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
            val okSources = mutableListOf<Map<String, Any?>>()
            sources.forEach { source ->
                val sourceName = source["sourceName"] as? String ?: ""
                val sourceUrl = source["sourceUrl"] as? String ?: ""
                if (sourceName.isNotBlank() && sourceUrl.isNotBlank()) {
                    RssSourceRepository.save(source)
                    okSources.add(source)
                }
            }
            call.respondText(GSON.toJson(ReturnData().setData(okSources)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("批量保存RSS源失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量删除 RSS 源 POST /deleteRssSources */
    post("/deleteRssSources") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val sources = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
            val urls = sources.mapNotNull { it["sourceUrl"] as? String }
            RssSourceRepository.deleteByUrls(urls)
            call.respondText(GSON.toJson(ReturnData().setData("已执行")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("删除RSS源失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // ==================== RSS 文章获取（阶段八新增）====================

    /** 获取 RSS 源文章列表 GET /getRssArticles?url=xxx&page=1 */
    get("/getRssArticles") {
        val url = call.parameters["url"] ?: ""
        val page = call.parameters["page"]?.toIntOrNull() ?: 1
        if (url.isEmpty()) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")),
                ContentType.Application.Json
            )
            return@get
        }
        try {
            val articles = io.legado.utils.RssArticlesFetcher.fetchArticles(url, page)
            call.respondText(GSON.toJson(ReturnData().setData(articles)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取RSS文章失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取 RSS 文章内容 GET /getRssArticle?url=xxx&sourceUrl=xxx */
    get("/getRssArticle") {
        val articleUrl = call.parameters["url"] ?: ""
        val sourceUrl = call.parameters["sourceUrl"]
        if (articleUrl.isEmpty()) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")),
                ContentType.Application.Json
            )
            return@get
        }
        try {
            val content = io.legado.utils.RssArticlesFetcher.fetchArticleContent(articleUrl, sourceUrl)
            call.respondText(GSON.toJson(ReturnData().setData(content)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取RSS文章内容失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }
}
