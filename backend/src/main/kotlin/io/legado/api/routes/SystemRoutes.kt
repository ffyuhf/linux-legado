/**
 * 系统路由 - 健康检查、配置、缓存、设置等系统级 API
 *
 * 对齐 Android 版 GlobalController 的部分功能。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 * 2026-06-14 12:30 nmb - 阶段七：新增设置管理 API（getAppSettings/saveAppSettings等）
 */

package io.legado.api.routes

import io.legado.config.AppSettings
import io.legado.config.SettingKeys
import io.legado.data.repository.CacheRepository
import io.legado.model.GSON
import io.legado.api.model.ReturnData
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * 注册系统级路由
 *
 * 包含两类路由：
 * 1. 扁平式设置管理路由（对齐 Android HttpServer 风格）：
 *    - GET  /getAppSettings      获取全部应用设置
 *    - POST /saveAppSettings     批量保存应用设置
 *    - GET  /getReadSettings     获取全部阅读设置
 *    - POST /saveReadSettings    批量保存阅读设置
 *    - GET  /getThemeSettings    获取全部主题设置
 *    - POST /saveThemeSettings   批量保存主题设置
 *    - GET  /getAllSettings      获取全部设置（应用+阅读+主题）
 *    - POST /saveAllSettings     批量保存全部设置
 *    - POST /resetAppSettings    重置应用设置
 *    - POST /resetReadSettings   重置阅读设置
 *    - POST /resetThemeSettings  重置主题设置
 *    - POST /resetAllSettings    重置全部设置
 * 2. /system 路由（健康检查、缓存等）
 */
fun Route.systemRoutes() {

    // ==================== 设置管理路由（扁平式，对齐前端 api.ts）====================

    /** 获取全部应用设置 GET /getAppSettings */
    get("/getAppSettings") {
        try {
            val settings = AppSettings.getAllApp()
            call.respondText(
                GSON.toJson(ReturnData().setData(settings)),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取应用设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量保存应用设置 POST /saveAppSettings (Body: {key: value, ...}) */
    post("/saveAppSettings") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val changes = GSON.fromJson(body, Map::class.java) as? Map<String, Any?>
                ?: emptyMap()
            AppSettings.putAllApp(changes)
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存应用设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取全部阅读设置 GET /getReadSettings */
    get("/getReadSettings") {
        try {
            val settings = AppSettings.getAllRead()
            call.respondText(
                GSON.toJson(ReturnData().setData(settings)),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取阅读设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量保存阅读设置 POST /saveReadSettings (Body: {key: value, ...}) */
    post("/saveReadSettings") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val changes = GSON.fromJson(body, Map::class.java) as? Map<String, Any?>
                ?: emptyMap()
            AppSettings.putAllRead(changes)
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存阅读设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取全部主题设置 GET /getThemeSettings */
    get("/getThemeSettings") {
        try {
            val settings = AppSettings.getAllTheme()
            call.respondText(
                GSON.toJson(ReturnData().setData(settings)),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取主题设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量保存主题设置 POST /saveThemeSettings (Body: {key: value, ...}) */
    post("/saveThemeSettings") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val changes = GSON.fromJson(body, Map::class.java) as? Map<String, Any?>
                ?: emptyMap()
            AppSettings.putAllTheme(changes)
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存主题设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取全部设置（应用+阅读+主题+默认值） GET /getAllSettings */
    get("/getAllSettings") {
        try {
            val allSettings = mapOf(
                "app" to AppSettings.getAllApp(),
                "read" to AppSettings.getAllRead(),
                "theme" to AppSettings.getAllTheme(),
                "defaults" to SettingKeys.DEFAULTS
            )
            call.respondText(
                GSON.toJson(ReturnData().setData(allSettings)),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取全部设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // 批量保存全部设置 POST /saveAllSettings
    // Body: { "app": {key: value}, "read": {...}, "theme": {...} }
    post("/saveAllSettings") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val root = GSON.fromJson(body, Map::class.java) as? Map<String, Any?>
                ?: emptyMap()

            (root["app"] as? Map<String, Any?>)?.let { AppSettings.putAllApp(it) }
            (root["read"] as? Map<String, Any?>)?.let { AppSettings.putAllRead(it) }
            (root["theme"] as? Map<String, Any?>)?.let { AppSettings.putAllTheme(it) }
            AppSettings.persistAll()

            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存全部设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 重置应用设置 POST /resetAppSettings */
    post("/resetAppSettings") {
        try {
            AppSettings.resetApp()
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("重置应用设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 重置阅读设置 POST /resetReadSettings */
    post("/resetReadSettings") {
        try {
            AppSettings.resetRead()
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("重置阅读设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 重置主题设置 POST /resetThemeSettings */
    post("/resetThemeSettings") {
        try {
            AppSettings.resetTheme()
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("重置主题设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 重置全部设置 POST /resetAllSettings */
    post("/resetAllSettings") {
        try {
            AppSettings.resetAll()
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("重置全部设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // ==================== 单项设置操作路由（v2.0新增）====================

    /**
     * 获取单个设置项 GET /getSetting?key=xxx&category=app&default=yyy
     *
     * @param key 配置键名
     * @param category 配置类别: app(默认)/read/theme
     * @param default 默认值（当配置不存在时返回，可选）
     */
    get("/getSetting") {
        try {
            val key = call.parameters["key"] ?: ""
            val category = call.parameters["category"] ?: "app"
            if (key.isBlank()) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("参数 key 不能为空")),
                    ContentType.Application.Json
                )
                return@get
            }
            // 优先返回已存储的值，无则返回默认值表中的默认值，再无则返回参数 default
            val defaultRaw = call.parameters["default"]
            val defaultValue = SettingKeys.DEFAULTS[key] ?: defaultRaw
            val value = when (category.lowercase()) {
                "read" -> AppSettings.getAllRead()[key] ?: defaultValue
                "theme" -> AppSettings.getAllTheme()[key] ?: defaultValue
                else -> AppSettings.getAllApp()[key] ?: defaultValue
            }
            call.respondText(
                GSON.toJson(ReturnData().setData(value)),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /**
     * 保存单个设置项 POST /saveSetting?key=xxx&category=app
     * Body 为设置值的原始内容（纯文本或 JSON）
     *
     * @param key 配置键名
     * @param category 配置类别: app(默认)/read/theme
     */
    post("/saveSetting") {
        try {
            val key = call.parameters["key"] ?: ""
            val category = call.parameters["category"] ?: "app"
            if (key.isBlank()) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("参数 key 不能为空")),
                    ContentType.Application.Json
                )
                return@post
            }
            val body = call.receiveText()
            // 尝试解析为 JSON 类型，失败则作为字符串存储
            val parsedValue: Any? = try {
                GSON.fromJson(body, Any::class.java)
            } catch (e: Exception) {
                body
            }
            when (category.lowercase()) {
                "read" -> AppSettings.putRead(key, parsedValue)
                "theme" -> AppSettings.putTheme(key, parsedValue)
                else -> AppSettings.putApp(key, parsedValue)
            }
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /**
     * 删除单个设置项 POST /deleteSetting?key=xxx&category=app
     *
     * @param key 配置键名
     * @param category 配置类别: app(默认)/read/theme
     */
    post("/deleteSetting") {
        try {
            val key = call.parameters["key"] ?: ""
            val category = call.parameters["category"] ?: "app"
            if (key.isBlank()) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("参数 key 不能为空")),
                    ContentType.Application.Json
                )
                return@post
            }
            when (category.lowercase()) {
                "read" -> AppSettings.removeRead(key)
                "theme" -> AppSettings.removeTheme(key)
                else -> AppSettings.removeApp(key)
            }
            AppSettings.persistAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("删除设置失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // ==================== /system/* 路由（健康检查、缓存等）====================

    route("/system") {

        /** 健康检查 GET /system/health */
        get("/health") {
            call.respondText(
                """{"status":"ok","version":"1.0.0"}""",
                ContentType.Application.Json
            )
        }

        /** 获取缓存 GET /system/getCache?key=xxx */
        get("/getCache") {
            val key = call.parameters["key"] ?: ""
            val value = CacheRepository.get(key)
            call.respondText(
                GSON.toJson(ReturnData().setData(value)),
                ContentType.Application.Json
            )
        }

        /** 保存缓存 POST /system/saveCache?key=xxx */
        post("/saveCache") {
            val key = call.parameters["key"] ?: ""
            val value = call.receiveText()
            CacheRepository.put(key, value)
            call.respondText(GSON.toJson(ReturnData()), ContentType.Application.Json)
        }

        /** 删除缓存 POST /system/deleteCache?key=xxx */
        post("/deleteCache") {
            val key = call.parameters["key"] ?: ""
            CacheRepository.delete(key)
            call.respondText(GSON.toJson(ReturnData()), ContentType.Application.Json)
        }
    }

    // ==================== 缓存管理路由（阶段八新增）====================

    /** 清除全部缓存 POST /clearCache */
    post("/clearCache") {
        try {
            val size = io.legado.utils.ContentCache.clearAll()
            call.respondText(
                GSON.toJson(ReturnData().setData(mapOf("cleared" to true, "size" to size))),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("清除缓存失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 清除书籍缓存 POST /clearBookCache */
    post("/clearBookCache") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val bookUrl = data["bookUrl"] as? String ?: ""
            if (bookUrl.isNotEmpty()) {
                io.legado.utils.ContentCache.clearBook(bookUrl)
            }
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("清除书籍缓存失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 清除内容缓存 POST /clearContentCache */
    post("/clearContentCache") {
        try {
            val size = io.legado.utils.ContentCache.clearAll()
            call.respondText(
                GSON.toJson(ReturnData().setData(mapOf("size" to size))),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("清除内容缓存失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取缓存大小 GET /getCacheSize */
    get("/getCacheSize") {
        try {
            val totalSize = io.legado.utils.ContentCache.getTotalSize()
            val chapterCount = io.legado.utils.ContentCache.getChapterCount()
            val bookCount = io.legado.data.repository.BookRepository.getAll().size
            val sourceCount = io.legado.data.repository.BookSourceRepository.getAll().size
            call.respondText(
                GSON.toJson(ReturnData().setData(mapOf(
                    "totalSize" to totalSize,
                    "chapterCount" to chapterCount,
                    "bookCount" to bookCount,
                    "sourceCount" to sourceCount
                ))),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取缓存大小失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // ==================== 搜索历史路由（阶段八新增）====================

    /** 获取搜索历史 GET /getSearchHistory */
    get("/getSearchHistory") {
        try {
            val history = io.legado.data.repository.SearchHistoryRepository.getAll().map {
                mapOf("word" to it[io.legado.data.database.tables.SearchHistoryTable.word],
                      "time" to it[io.legado.data.database.tables.SearchHistoryTable.time])
            }
            call.respondText(GSON.toJson(ReturnData().setData(history)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取搜索历史失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 保存搜索历史 POST /saveSearchHistory */
    post("/saveSearchHistory") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val word = data["word"] as? String ?: ""
            if (word.isNotEmpty()) {
                io.legado.data.repository.SearchHistoryRepository.save(word)
            }
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("保存搜索历史失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 清除搜索历史 POST /clearSearchHistory */
    post("/clearSearchHistory") {
        try {
            io.legado.data.repository.SearchHistoryRepository.clearAll()
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("清除搜索历史失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }
}
