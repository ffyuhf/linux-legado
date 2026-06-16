/**
 * 排版配置路由 - 对齐 Android 版 HttpServer 扁平式路径
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:32 nmb - 阶段八新增
 */

package io.legado.api.routes

import io.legado.config.AppSettings
import io.legado.config.ReadBookConfigManager
import io.legado.config.SettingKeys
import io.legado.model.GSON
import io.legado.api.model.ReturnData
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * 注册排版配置路由（扁平式路径，无前缀）
 *
 * - GET  /getReadConfigs      获取排版方案列表
 * - POST /saveReadConfig      保存排版方案
 * - POST /deleteReadConfig    删除排版方案
 * - GET  /getShareReadConfig  获取共享排版配置
 * - POST /saveShareReadConfig 保存共享排版配置
 * - POST /setReadStyleSelect  设置当前排版方案
 */
fun Route.readConfigRoutes() {

    /** 获取排版方案列表 GET /getReadConfigs */
    get("/getReadConfigs") {
        try {
            val configs = ReadBookConfigManager.getAll()
            call.respondText(GSON.toJson(ReturnData().setData(configs)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取排版方案失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 保存排版方案 POST /saveReadConfig */
    post("/saveReadConfig") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val config = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val id = ReadBookConfigManager.save(config)
            call.respondText(GSON.toJson(ReturnData().setData(id)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存排版方案失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 删除排版方案 POST /deleteReadConfig */
    post("/deleteReadConfig") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val index = (data["index"] as? Number)?.toInt() ?: -1
            val success = ReadBookConfigManager.delete(index)
            call.respondText(GSON.toJson(ReturnData().setData(success)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("删除排版方案失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取共享排版配置 GET /getShareReadConfig */
    get("/getShareReadConfig") {
        try {
            val config = ReadBookConfigManager.getShareConfig()
            call.respondText(GSON.toJson(ReturnData().setData(config)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取共享配置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 保存共享排版配置 POST /saveShareReadConfig */
    post("/saveShareReadConfig") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val config = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            // 强制设置为共享类型
            val shareConfig = config.toMutableMap()
            shareConfig["styleType"] = 1
            val id = ReadBookConfigManager.save(shareConfig)
            call.respondText(GSON.toJson(ReturnData().setData(id)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存共享配置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 设置当前排版方案 POST /setReadStyleSelect */
    post("/setReadStyleSelect") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val index = (data["index"] as? Number)?.toInt() ?: 0
            val isComic = data["isComic"] as? Boolean ?: false
            if (isComic) {
                AppSettings.putApp(SettingKeys.COMIC_STYLE_SELECT, index)
            } else {
                AppSettings.putApp(SettingKeys.READ_STYLE_SELECT, index)
            }
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("设置排版方案失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }
}