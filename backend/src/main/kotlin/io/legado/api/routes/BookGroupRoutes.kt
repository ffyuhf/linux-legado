/**
 * 书籍分组路由 - 对齐 Android 版 HttpServer 扁平式路径
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:31 nmb - 阶段八新增
 */

package io.legado.api.routes

import io.legado.data.repository.BookGroupRepository
import io.legado.model.GSON
import io.legado.api.model.ReturnData
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * 注册书籍分组路由（扁平式路径，无前缀）
 *
 * - GET  /getBookGroups        获取全部分组
 * - POST /saveBookGroup        保存分组
 * - POST /saveBookGroups       批量保存分组
 * - POST /deleteBookGroup      删除分组
 * - POST /updateBookGroupOrder 更新分组顺序
 * - POST /updateBookGroup      更新书籍所属分组
 */
fun Route.bookGroupRoutes() {

    /** 获取全部分组 GET /getBookGroups */
    get("/getBookGroups") {
        try {
            val groups = BookGroupRepository.getAll().map { rowToMap(it) }
            call.respondText(GSON.toJson(ReturnData().setData(groups)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取分组失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 保存分组 POST /saveBookGroup */
    post("/saveBookGroup") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val id = BookGroupRepository.save(data)
            call.respondText(GSON.toJson(ReturnData().setData(id)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存分组失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量保存分组 POST /saveBookGroups */
    post("/saveBookGroups") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val groups = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
            val ids = BookGroupRepository.saveAll(groups)
            call.respondText(GSON.toJson(ReturnData().setData(ids)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("批量保存分组失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 删除分组 POST /deleteBookGroup */
    post("/deleteBookGroup") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val id = (data["id"] as? Number)?.toInt() ?: (data["groupId"] as? Number)?.toInt() ?: -1
            BookGroupRepository.delete(id)
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("删除分组失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 更新分组顺序 POST /updateBookGroupOrder */
    post("/updateBookGroupOrder") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            @Suppress("UNCHECKED_CAST")
            val orders = (data["orders"] as? List<*>)?.mapNotNull { (it as? Number)?.toInt() } ?: emptyList()
            BookGroupRepository.updateOrder(orders)
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("更新分组顺序失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 更新书籍所属分组 POST /updateBookGroup */
    post("/updateBookGroup") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            @Suppress("UNCHECKED_CAST")
            val bookUrls = data["bookUrls"] as? List<String> ?: emptyList()
            val groupId = (data["groupId"] as? Number)?.toInt() ?: 0
            // 更新书籍的分组字段
            bookUrls.forEach { url ->
                io.legado.data.repository.BookRepository.save(mapOf(
                    "bookUrl" to url,
                    "group" to groupId
                ))
            }
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("更新书籍分组失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }
}