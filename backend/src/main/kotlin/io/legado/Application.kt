/**
 * Legado Linux 后端 - Ktor Application 主入口
 *
 * 职责：
 * 1. 初始化数据库（DatabaseFactory）
 * 2. 初始化应用设置（AppSettings，阶段7新增）
 * 3. 初始化排版配置默认方案（阶段8新增）
 * 4. 配置 CORS（允许前端跨域访问）
 * 5. 注册所有 HTTP 路由模块
 * 6. 托管前端静态资源（Vue SPA）
 * 7. 配置 CallLogging（请求日志）
 * 8. 配置 ContentNegotiation（JSON 序列化）
 *
 * 启动方式: gradle run 或 java -jar legado.jar
 * 默认端口: 1122（与 Android 版 WebService 一致）
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本，完整后端骨架
 * 2026-06-14 12:24 nmb - 阶段七：新增 AppSettings 初始化
 * 2026-06-16 02:07 nmb - 阶段八：新增路由注册和排版配置初始化
 */

package io.legado

import io.legado.api.routes.backupRoutes
import io.legado.api.routes.bookGroupRoutes
import io.legado.api.routes.bookRoutes
import io.legado.api.routes.readConfigRoutes
import io.legado.api.routes.replaceRuleRoutes
import io.legado.api.routes.rssRoutes
import io.legado.api.routes.systemRoutes
import io.legado.api.routes.webDavRoutes
import io.legado.api.routes.webSocketRoutes
import io.legado.config.AppSettings
import io.legado.config.ReadBookConfigManager
import io.legado.config.RhinoInit
import io.legado.data.database.DatabaseFactory
import io.ktor.http.*
import io.ktor.serialization.gson.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import org.slf4j.event.Level

fun main(args: Array<String>): Unit = EngineMain.main(args)

/**
 * Ktor Application 模块
 * 在 application.conf 中通过 ktor.application.modules 引用
 */
fun Application.module() {
    // 1. 初始化数据库
    DatabaseFactory.init()

    // 1.5. 初始化应用设置（阶段7：对齐 Android AppConfig）
    AppSettings.init()

    // 1.6. 初始化 Rhino JS 引擎（阶段3：使JS规则书源可用）
    RhinoInit.initialize()

    // 1.7. 初始化排版配置默认方案（阶段8：对齐 Android ReadBookConfig）
    ReadBookConfigManager.initDefaults()

    // 2. 配置内容协商（JSON 序列化）
    install(ContentNegotiation) {
        gson {
            disableHtmlEscaping()
            serializeNulls()
        }
    }

    // 3. 配置 CORS（允许前端开发服务器跨域访问）
    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowCredentials = true
    }

    // 4. 配置请求日志（记录所有 API 请求）
    install(CallLogging) {
        level = Level.INFO
    }

    // 5. 配置 WebSocket 支持
    install(WebSockets)

    // 6. 配置错误处理
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respondText(
                """{"isSuccess":false,"errorMsg":"${cause.message}","data":null}""",
                ContentType.Application.Json,
                HttpStatusCode.InternalServerError
            )
        }
    }

    // 7. 注册路由
    routing {
        // API 路由模块
        bookRoutes()
        rssRoutes()
        replaceRuleRoutes()
        systemRoutes()
        webSocketRoutes()
        // 阶段八新增路由
        bookGroupRoutes()
        readConfigRoutes()
        backupRoutes()
        webDavRoutes()

        // 前端静态资源托管（Vue SPA）
        // 注意：API 路由在上面已注册，Ktor 按顺序匹配，不会冲突
        staticResources("/", "static") {
            // SPA 回退：未匹配的路径返回 index.html（排除 /api、/system 等路径）
            default("index.html")
            preCompressed(CompressedFileType.GZIP)
        }
    }
}