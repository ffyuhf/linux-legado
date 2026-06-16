/**
 * WebSocket 路由 - 书籍搜索、书源调试、RSS源调试
 *
 * 对齐 Android 版 WebSocket 协议:
 *   WS /searchBook       接收 {"key":"xxx"}，逐步推送搜索结果 List<SearchBook>
 *   WS /bookSourceDebug  接收 {"tag":"源URL","key":"搜索关键词"}，逐步推送调试日志
 *   WS /rssSourceDebug   接收 {"tag":"源URL"}，逐步推送调试日志
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 18:10 nmb - 新增，WebSocket 搜索骨架
 * 2026-06-13 21:32 nmb - 实现 bookSourceDebug 书源调试功能
 *                       新增 rssSourceDebug RSS源调试端点
 */

package io.legado.api.routes

import io.legado.data.entities.SearchBook
import io.legado.data.repository.BookSourceRepository
import io.legado.data.repository.RssSourceRepository
import io.legado.model.GSON
import io.legado.model.webBook.WebBook
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory

private val wsLogger = LoggerFactory.getLogger("WebSocketRoutes")

/**
 * 注册 WebSocket 路由
 */
fun Route.webSocketRoutes() {

    /**
     * 书籍搜索 WebSocket
     * 协议: 接收 {"key":"xxx"}，逐步推送搜索结果
     */
    webSocket("/searchBook") {
        wsLogger.info("搜索 WebSocket 已连接")

        launch {
            try {
                while (true) {
                    send(Frame.Ping(byteArrayOf()))
                    kotlinx.coroutines.delay(30_000)
                }
            } catch (_: CancellationException) {
                // BUG 修复: WebSocket 关闭时正常退出，不吞掉取消信号
                throw CancellationException()
            } catch (_: Throwable) {
            }
        }

        val frame = incoming.receiveCatching().getOrNull() as? Frame.Text
        if (frame == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "数据必须为Json格式"))
            return@webSocket
        }

        val searchText = frame.readText()
        @Suppress("UNCHECKED_CAST")
        val searchMap = try {
            GSON.fromJson(searchText, Map::class.java) as? Map<String, String>
        } catch (e: Exception) {
            null
        }

        val key = searchMap?.get("key")
        if (key.isNullOrBlank()) {
            send(Frame.Text("关键词不能为空"))
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "关键词不能为空"))
            return@webSocket
        }

        wsLogger.info("开始搜索: {}", key)
        val sources = BookSourceRepository.getEnabled()
        wsLogger.info("启用书源数: {}", sources.size)

        val searchResultFlow = MutableSharedFlow<List<SearchBook>>(extraBufferCapacity = 64)

        coroutineScope {
            launch {
                searchResultFlow.collect { books ->
                    if (books.isNotEmpty()) {
                        send(Frame.Text(GSON.toJson(books)))
                    }
                }
            }

            sources.forEach { sourceRow ->
                launch(Dispatchers.IO) {
                    val source = rowToBookSource(sourceRow)
                    runCatching {
                        val result = WebBook.searchBookAwait(source, key)
                        if (result.isNotEmpty()) {
                            searchResultFlow.emit(result)
                        }
                    }.onFailure { e ->
                        wsLogger.warn("书源搜索失败: {}: {}", source.bookSourceName, e.localizedMessage)
                    }
                }
            }
        }

        wsLogger.info("搜索完成: {}", key)
        close(CloseReason(CloseReason.Codes.NORMAL, "Search finish"))
    }

    /**
     * 书源调试 WebSocket
     *
     * 协议: 接收 {"tag":"源URL","key":"搜索关键词"}，逐步推送调试日志
     * 对齐 Android 版 BookSourceDebugWebSocket 的流程
     */
    webSocket("/bookSourceDebug") {
        wsLogger.info("书源调试 WebSocket 已连接")

        launch {
            try {
                while (true) {
                    send(Frame.Ping(byteArrayOf()))
                    kotlinx.coroutines.delay(30_000)
                }
            } catch (_: CancellationException) {
                // BUG 修复: WebSocket 关闭时正常退出，不吞掉取消信号
                throw CancellationException()
            } catch (_: Throwable) {
            }
        }

        val frame = incoming.receiveCatching().getOrNull() as? Frame.Text
        if (frame == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "数据必须为Json格式"))
            return@webSocket
        }

        val debugText = frame.readText()
        @Suppress("UNCHECKED_CAST")
        val debugMap = try {
            GSON.fromJson(debugText, Map::class.java) as? Map<String, String>
        } catch (e: Exception) {
            null
        }

        val tag = debugMap?.get("tag")
        val key = debugMap?.get("key")
        if (tag.isNullOrBlank()) {
            send(Frame.Text("tag不能为空"))
            close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
            return@webSocket
        }

        wsLogger.info("开始书源调试: tag={}, key={}", tag, key)

        val sourceRow = BookSourceRepository.getByUrl(tag)
        if (sourceRow == null) {
            send(Frame.Text("未找到书源: $tag"))
            close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
            return@webSocket
        }

        val source = rowToBookSource(sourceRow)

        try {
            if (key.isNullOrBlank()) {
                send(Frame.Text("key不能为空"))
                close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
                return@webSocket
            }
            send(Frame.Text("开始搜索: $key"))
            val searchResults = WebBook.searchBookAwait(source, key)
            if (searchResults.isEmpty()) {
                send(Frame.Text("搜索结果为空"))
                close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
                return@webSocket
            }
            send(Frame.Text("搜索成功，共${searchResults.size}条结果"))

            // SearchBook 转为 Book（getBookInfoAwait 需要 Book 类型）
            val book = searchResults.first().toBook()
            send(Frame.Text("获取书籍详情: ${book.name}"))
            WebBook.getBookInfoAwait(source, book)
            send(Frame.Text("书籍详情获取成功: ${book.name} - ${book.author}"))

            send(Frame.Text("获取目录列表"))
            val chapters = WebBook.getChapterListAwait(source, book)
            send(Frame.Text("目录获取成功，共${chapters.size}章"))

            if (chapters.isNotEmpty()) {
                send(Frame.Text("获取第一章正文: ${chapters.first().title}"))
                val content = WebBook.getContentAwait(source, book, chapters.first())
                val preview = if (content.length > 200) content.take(200) + "..." else content
                send(Frame.Text("正文获取成功(预览):\n$preview"))
            }

            send(Frame.Text("调试完成"))
        } catch (e: Exception) {
            wsLogger.warn("书源调试失败: {}", e.localizedMessage)
            send(Frame.Text("调试出错: ${e.localizedMessage}"))
        }

        close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
    }

    /**
     * RSS源调试 WebSocket
     *
     * 协议: 接收 {"tag":"源URL"}，逐步推送调试日志
     * 注：Linux端暂无RSS文章解析引擎，返回源信息
     */
    webSocket("/rssSourceDebug") {
        wsLogger.info("RSS源调试 WebSocket 已连接")

        launch {
            try {
                while (true) {
                    send(Frame.Ping(byteArrayOf()))
                    kotlinx.coroutines.delay(30_000)
                }
            } catch (_: CancellationException) {
                // BUG 修复: WebSocket 关闭时正常退出，不吞掉取消信号
                throw CancellationException()
            } catch (_: Throwable) {
            }
        }

        val frame = incoming.receiveCatching().getOrNull() as? Frame.Text
        if (frame == null) {
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "数据必须为Json格式"))
            return@webSocket
        }

        val debugText = frame.readText()
        @Suppress("UNCHECKED_CAST")
        val debugMap = try {
            GSON.fromJson(debugText, Map::class.java) as? Map<String, String>
        } catch (e: Exception) {
            null
        }

        val tag = debugMap?.get("tag")
        if (tag.isNullOrBlank()) {
            send(Frame.Text("tag不能为空"))
            close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
            return@webSocket
        }

        wsLogger.info("开始RSS源调试: tag={}", tag)

        val sourceRow = RssSourceRepository.getByUrl(tag)
        if (sourceRow == null) {
            send(Frame.Text("未找到RSS源: $tag"))
            close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
            return@webSocket
        }

        try {
            val sourceMap = rowToMap(sourceRow)
            send(Frame.Text("RSS源: ${sourceMap["sourceName"]}"))
            send(Frame.Text("源URL: ${sourceMap["sourceUrl"]}"))
            send(Frame.Text("规则文章: ${sourceMap["ruleArticles"] ?: "无"}"))
            send(Frame.Text("规则标题: ${sourceMap["ruleTitle"] ?: "无"}"))
            send(Frame.Text("规则内容: ${sourceMap["ruleContent"] ?: "无"}"))
            send(Frame.Text("RSS文章解析引擎待实现，当前仅展示源信息"))
            send(Frame.Text("调试完成"))
        } catch (e: Exception) {
            wsLogger.warn("RSS源调试失败: {}", e.localizedMessage)
            send(Frame.Text("调试出错: ${e.localizedMessage}"))
        }

        close(CloseReason(CloseReason.Codes.NORMAL, "调试结束"))
    }
}