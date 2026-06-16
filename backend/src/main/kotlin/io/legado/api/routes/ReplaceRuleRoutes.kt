/**
 * 替换规则路由 - 对齐 Android 版 HttpServer 扁平式路径
 *
 * 路由路径与 Android 版 ReplaceRuleController 完全一致，
 * 前端 api.ts 中替换规则相关调用直接使用这些路径。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本（带 /replace 前缀，与前端不兼容）
 * 2026-06-13 21:27 nmb - 重构：移除 /replace 前缀，改为扁平式路径对齐Android版
 *                       新增 testReplaceRule 替换规则测试端点
 *                       deleteReplaceRule 改为接收JSON Body（对齐Android版）
 */

package io.legado.api.routes

import io.legado.data.repository.ReplaceRuleRepository
import io.legado.model.GSON
import io.legado.api.model.ReturnData
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * 注册替换规则相关路由（扁平式路径，无前缀）
 *
 * 对齐 Android 版 HttpServer.kt 的路由表：
 * - GET  /getReplaceRules    获取全部替换规则
 * - POST /saveReplaceRule    保存替换规则
 * - POST /deleteReplaceRule  删除替换规则
 * - POST /testReplaceRule    测试替换规则
 */
fun Route.replaceRuleRoutes() {

    /** 获取全部替换规则 GET /getReplaceRules */
    get("/getReplaceRules") {
        try {
            val rows = ReplaceRuleRepository.getAll()
            val rules = rows.map { rowToMap(it) }
            call.respondText(GSON.toJson(ReturnData().setData(rules)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取替换规则失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 保存替换规则 POST /saveReplaceRule */
    post("/saveReplaceRule") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val id = ReplaceRuleRepository.save(data)
            call.respondText(GSON.toJson(ReturnData().setData(id)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存替换规则失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 删除替换规则 POST /deleteReplaceRule
     *  接收JSON Body: ReplaceRule对象，提取id执行删除
     */
    post("/deleteReplaceRule") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val id = (data["id"] as? Number)?.toInt()
            if (id != null) {
                ReplaceRuleRepository.deleteById(id)
                call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
            } else {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("无效的规则ID")),
                    ContentType.Application.Json
                )
            }
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("删除替换规则失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 测试替换规则 POST /testReplaceRule
     *  接收JSON Body: { rule: ReplaceRule对象, text: "待替换文本" }
     *  返回替换后的文本
     *
     *  对齐 Android 版 ReplaceRuleController.testRule 的逻辑：
     *  - 如果 isRegex==true，使用正则替换
     *  - 否则使用普通字符串替换
     */
    post("/testReplaceRule") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val map = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val ruleMap = map["rule"] as? Map<String, Any?>
            val text = map["text"] as? String ?: ""
            if (ruleMap == null) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("格式不对")),
                    ContentType.Application.Json
                )
                return@post
            }
            val pattern = ruleMap["pattern"] as? String ?: ""
            val replacement = ruleMap["replacement"] as? String ?: ""
            val isRegex = (ruleMap["isRegex"] as? Number)?.toInt() == 1
            if (pattern.isEmpty()) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("替换规则不能为空")),
                    ContentType.Application.Json
                )
                return@post
            }
            val content = try {
                if (isRegex) {
                    text.replace(pattern.toRegex(), replacement)
                } else {
                    text.replace(pattern, replacement)
                }
            } catch (e: Exception) {
                "替换执行出错: ${e.localizedMessage}"
            }
            call.respondText(GSON.toJson(ReturnData().setData(content)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("测试替换规则失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }
}