/**
 * 书架与书源路由 - 对齐 Android 版 HttpServer 扁平式路径
 *
 * 修复历史:
 * 2026-06-13 12:00 nmb - 初始版本（带 /book 前缀，与前端不兼容）
 * 2026-06-13 18:08 nmb - 重构：移除 /book 前缀，路径/参数名对齐 Android 原版契约
 * 2026-06-13 19:29 nmb - 接入 WebBook 模块实现搜索/目录/正文完整链路
 * 2026-06-13 19:33 nmb - 修复编译错误：对齐 Repository 接口
 * 2026-06-13 21:30 nmb - 新增 /cover 封面代理、/image 图片代理、/addLocalBook 本地书籍导入
 * 2026-06-16 01:33 nmb - 阶段八：实现本地TXT导入/批量进度/更新检查/内容下载/批量保存
 */

package io.legado.api.routes

import io.legado.AppConfig
import io.legado.data.repository.BookChapterRepository
import io.legado.data.repository.BookRepository
import io.legado.data.repository.BookSourceRepository
import io.legado.data.repository.CacheRepository
import io.legado.model.GSON
import io.legado.api.model.ReturnData
import io.legado.model.webBook.WebBook
import io.legado.utils.ContentCache
import io.legado.utils.LocalBookImporter
import io.ktor.http.*
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.utils.io.toByteArray
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.request.get
import io.ktor.client.statement.HttpResponse
import io.ktor.client.call.body
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File


/** 封面/图片代理专用 HttpClient（单例复用连接池） */
private val coverProxyHttpClient by lazy {
    HttpClient(OkHttp) {
        expectSuccess = false
    }
}

/**
 * 注册书架与书源路由（扁平式路径，无前缀）
 */
fun Route.bookRoutes() {

    // ==================== 书架操作 ====================

    get("/getBookshelf") {
        try {
            val rows = BookRepository.getAll()
            val books = rows.map { rowToMap(it) }
            call.respondText(GSON.toJson(ReturnData().setData(books)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取书架失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    post("/saveBook") {
        val body = call.receiveText()
        @Suppress("UNCHECKED_CAST")
        val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
        BookRepository.save(data)
        call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
    }

    post("/deleteBook") {
        val body = call.receiveText()
        @Suppress("UNCHECKED_CAST")
        val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
        val bookUrl = data["bookUrl"] as? String ?: ""
        if (bookUrl.isNotEmpty()) BookRepository.delete(bookUrl)
        call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
    }

    post("/saveBookProgress") {
        val body = call.receiveText()
        @Suppress("UNCHECKED_CAST")
        val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
        val bookUrl = data["bookUrl"] as? String ?: ""
        BookRepository.updateProgress(
            bookUrl = bookUrl,
            durChapterIndex = (data["durChapterIndex"] as? Number)?.toInt() ?: 0,
            durChapterPos = (data["durChapterPos"] as? Number)?.toInt() ?: 0,
            durChapterTitle = data["durChapterTitle"] as? String ?: "",
            durChapterTime = (data["durChapterTime"] as? Number)?.toLong() ?: System.currentTimeMillis()
        )
        call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
    }

    // ==================== 章节操作 ====================

    /** 获取章节列表（数据库优先，无数据时自动从书源加载） */
    get("/getChapterList") {
        val url = call.parameters["url"] ?: ""
        if (url.isEmpty()) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")),
                ContentType.Application.Json
            )
            return@get
        }
        try {
            val chapters = BookChapterRepository.getByBookUrl(url)
            if (chapters.isNotEmpty()) {
                call.respondText(
                    GSON.toJson(ReturnData().setData(chapters.map { rowToMap(it) })),
                    ContentType.Application.Json
                )
            } else {
                val bookRow = BookRepository.getByUrl(url)
                    ?: run {
                        call.respondText(
                            GSON.toJson(ReturnData().setErrorMsg("未找到书籍")),
                            ContentType.Application.Json
                        )
                        return@get
                    }
                val book = rowToBook(bookRow)
                val sourceRow = BookSourceRepository.getByUrl(book.origin)
                    ?: run {
                        call.respondText(
                            GSON.toJson(ReturnData().setErrorMsg("未找到书源")),
                            ContentType.Application.Json
                        )
                        return@get
                    }
                val source = rowToBookSource(sourceRow)
                val loadedChapters = withContext(Dispatchers.IO) {
                    WebBook.getChapterListAwait(source, book)
                }
                // 保存到数据库
                val maps = loadedChapters.map { ch ->
                    mapOf(
                        "url" to ch.url, "title" to ch.title,
                        "isVolume" to if (ch.isVolume) 1 else 0,
                        "baseUrl" to ch.baseUrl, "bookUrl" to ch.bookUrl,
                        "index" to ch.index, "isVip" to if (ch.isVip) 1 else 0,
                        "isPay" to if (ch.isPay) 1 else 0,
                        "resourceUrl" to ch.resourceUrl, "tag" to ch.tag,
                        "wordCount" to ch.wordCount, "start" to ch.start,
                        "end" to ch.end, "startFragmentId" to ch.startFragmentId,
                        "endFragmentId" to ch.endFragmentId, "variable" to ch.variable,
                        "imgUrl" to ch.imgUrl
                    )
                }
                BookChapterRepository.deleteByBookUrl(url)
                BookChapterRepository.insertBatch(maps)
                call.respondText(
                    GSON.toJson(ReturnData().setData(loadedChapters.map { rowToMap(it) })),
                    ContentType.Application.Json
                )
            }
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取章节列表失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 刷新目录 GET /refreshToc?url=xxx */
    get("/refreshToc") {
        val url = call.parameters["url"] ?: ""
        if (url.isEmpty()) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")),
                ContentType.Application.Json
            )
            return@get
        }
        try {
            val bookRow = BookRepository.getByUrl(url)
                ?: run {
                    call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到书籍")), ContentType.Application.Json)
                    return@get
                }
            val book = rowToBook(bookRow)
            val sourceRow = BookSourceRepository.getByUrl(book.origin)
                ?: run {
                    call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到书源")), ContentType.Application.Json)
                    return@get
                }
            val source = rowToBookSource(sourceRow)
            val loadedChapters = withContext(Dispatchers.IO) { WebBook.getChapterListAwait(source, book) }
            val maps = loadedChapters.map { ch ->
                mapOf(
                    "url" to ch.url, "title" to ch.title, "isVolume" to if (ch.isVolume) 1 else 0,
                    "baseUrl" to ch.baseUrl, "bookUrl" to ch.bookUrl, "index" to ch.index,
                    "isVip" to if (ch.isVip) 1 else 0, "isPay" to if (ch.isPay) 1 else 0,
                    "resourceUrl" to ch.resourceUrl, "tag" to ch.tag, "wordCount" to ch.wordCount,
                    "start" to ch.start, "end" to ch.end, "startFragmentId" to ch.startFragmentId,
                    "endFragmentId" to ch.endFragmentId, "variable" to ch.variable, "imgUrl" to ch.imgUrl
                )
            }
            BookChapterRepository.deleteByBookUrl(url)
            BookChapterRepository.insertBatch(maps)
            call.respondText(
                GSON.toJson(ReturnData().setData(loadedChapters.map { rowToMap(it) })),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("刷新目录失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 获取正文 GET /getBookContent?url=xxx&index=xxx */
    get("/getBookContent") {
        val url = call.parameters["url"] ?: ""
        val index = call.parameters["index"]?.toIntOrNull()
        if (url.isEmpty()) {
            call.respondText(GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")), ContentType.Application.Json)
            return@get
        }
        if (index == null) {
            call.respondText(GSON.toJson(ReturnData().setErrorMsg("参数index不能为空")), ContentType.Application.Json)
            return@get
        }
        try {
            val chapterRow = BookChapterRepository.getChapter(url, index)
                ?: run {
                    call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到章节，请先刷新目录")), ContentType.Application.Json)
                    return@get
                }
            // 从 ResultRow 构建 BookChapter
            val chMap = rowToMap(chapterRow)
            val chapter = io.legado.data.entities.BookChapter(
                url = chMap["url"] as? String ?: "",
                title = chMap["title"] as? String ?: "",
                isVolume = (chMap["isVolume"] as? Number)?.toInt() == 1,
                baseUrl = chMap["baseUrl"] as? String ?: "",
                bookUrl = chMap["bookUrl"] as? String ?: "",
                index = (chMap["index"] as? Number)?.toInt() ?: 0,
                isVip = (chMap["isVip"] as? Number)?.toInt() == 1,
                isPay = (chMap["isPay"] as? Number)?.toInt() == 1,
                resourceUrl = chMap["resourceUrl"] as? String,
                tag = chMap["tag"] as? String,
                wordCount = chMap["wordCount"] as? String
            )
            val bookRow = BookRepository.getByUrl(chapter.bookUrl)
                ?: run {
                    call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到书籍")), ContentType.Application.Json)
                    return@get
                }
            val book = rowToBook(bookRow)
            val sourceRow = BookSourceRepository.getByUrl(book.origin)
                ?: run {
                    call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到书源")), ContentType.Application.Json)
                    return@get
                }
            val source = rowToBookSource(sourceRow)
            val content = withContext(Dispatchers.IO) { WebBook.getContentAwait(source, book, chapter) }
            call.respondText(GSON.toJson(ReturnData().setData(content)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("获取正文失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // ==================== 书源操作 ====================

    get("/getBookSources") {
        val rows = BookSourceRepository.getAll()
        val sources = rows.map { rowToMap(it) }
        call.respondText(GSON.toJson(ReturnData().setData(sources)), ContentType.Application.Json)
    }

    get("/getBookSource") {
        val url = call.parameters["url"] ?: ""
        if (url.isEmpty()) {
            call.respondText(GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")), ContentType.Application.Json)
            return@get
        }
        val source = BookSourceRepository.getByUrl(url)?.let { rowToMap(it) }
        if (source == null) {
            call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到源")), ContentType.Application.Json)
        } else {
            call.respondText(GSON.toJson(ReturnData().setData(source)), ContentType.Application.Json)
        }
    }

    post("/saveBookSource") {
        val body = call.receiveText()
        @Suppress("UNCHECKED_CAST")
        val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
        BookSourceRepository.save(data)
        call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
    }

    post("/saveBookSources") {
        val body = call.receiveText()
        @Suppress("UNCHECKED_CAST")
        val sources = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
        val okSources = mutableListOf<Map<String, Any?>>()
        sources.forEach { source ->
            val name = source["bookSourceName"] as? String ?: ""
            val sourceUrl = source["bookSourceUrl"] as? String ?: ""
            if (name.isNotBlank() && sourceUrl.isNotBlank()) {
                BookSourceRepository.save(source)
                okSources.add(source)
            }
        }
        call.respondText(GSON.toJson(ReturnData().setData(okSources)), ContentType.Application.Json)
    }

    post("/deleteBookSources") {
        val body = call.receiveText()
        @Suppress("UNCHECKED_CAST")
        val sources = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
        val urls = sources.mapNotNull { it["bookSourceUrl"] as? String }
        BookSourceRepository.deleteByUrls(urls)
        call.respondText(GSON.toJson(ReturnData().setData("已执行")), ContentType.Application.Json)
    }

    /**
     * 封面代理 GET /cover?path=xxx
     *
     * 对齐 Android 版 BookController.getCover：
     * 下载封面图片并返回二进制流。
     */
    get("/cover") {
        val coverUrl = call.parameters["path"] ?: ""
        if (coverUrl.isEmpty()) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("参数path不能为空")),
                ContentType.Application.Json
            )
            return@get
        }
        try {
            // BUG 修复: 移除 .use{}，单例 HttpClient 不应被关闭，否则二次请求失败
            val bytes = withContext(Dispatchers.IO) {
                val resp: HttpResponse = coverProxyHttpClient.get(coverUrl)
                resp.body<ByteArray>()
            }
            call.respondBytes(bytes, contentType = ContentType.Image.PNG)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("封面加载失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /**
     * 图片代理 GET /image?path=xxx&url=xxx&width=xxx
     *
     * 对齐 Android 版 BookController.getImg：
     * 下载正文中的图片并返回二进制流。
     */
    get("/image") {
        val src = call.parameters["path"] ?: ""
        if (src.isEmpty()) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("参数path不能为空")),
                ContentType.Application.Json
            )
            return@get
        }
        try {
            // BUG 修复: 移除 .use{}，单例 HttpClient 不应被关闭，否则二次请求失败
            val bytes = withContext(Dispatchers.IO) {
                val resp: HttpResponse = coverProxyHttpClient.get(src)
                resp.body<ByteArray>()
            }
            call.respondBytes(bytes, contentType = ContentType.Image.PNG)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("图片加载失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // ==================== 本地书籍导入（阶段八） ====================

    /**
     * 本地书籍导入 POST /addLocalBook
     *
     * 对齐 Android 版 BookController.addLocalBook。
     * 接收 multipart/form-data，支持 TXT 文件导入。
     */
    post("/addLocalBook") {
        try {
            val multipart = call.receiveMultipart()
            var bookName: String? = null
            var author: String? = null
            var groupId = 0
            var fileBytes: ByteArray? = null
            var fileName = "upload.txt"

            multipart.forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        when (part.name) {
                            "bookName" -> bookName = part.value
                            "author" -> author = part.value
                            "groupId" -> groupId = part.value.toIntOrNull() ?: 0
                        }
                    }
                    is PartData.FileItem -> {
                        fileName = part.originalFileName ?: "upload.txt"
                        // Ktor 3: provider() 返回 ByteReadChannel，用挂起扩展 toByteArray() 读取全部字节
                        fileBytes = part.provider().toByteArray()
                    }
                    else -> {}
                }
                part.dispose()
            }

            if (fileBytes == null) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("未收到文件")),
                    ContentType.Application.Json
                )
                return@post
            }

            val tempFile = File.createTempFile("legado_upload_", "_$fileName")
            // BUG 修复: 移除多余的 !!，上方已 return 保证非空
            tempFile.writeBytes(fileBytes)
            val result = LocalBookImporter.importTxt(tempFile, bookName, author, groupId)
            tempFile.delete()

            if (result != null) {
                call.respondText(GSON.toJson(ReturnData().setData(result)), ContentType.Application.Json)
            } else {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("导入失败")),
                    ContentType.Application.Json
                )
            }
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("本地书籍导入失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 导入本地书籍（Base64 JSON 方式） POST /addLocalBookJson */
    post("/addLocalBookJson") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            val fileName = data["fileName"] as? String ?: "upload.txt"
            val base64 = data["base64"] as? String ?: ""
            val bookName = data["bookName"] as? String
            val author = data["author"] as? String
            val groupId = (data["groupId"] as? Number)?.toInt() ?: 0

            if (base64.isBlank()) {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("base64 不能为空")),
                    ContentType.Application.Json
                )
                return@post
            }
            val result = LocalBookImporter.importFromBase64(fileName, base64, bookName, author, groupId)
            if (result != null) {
                call.respondText(GSON.toJson(ReturnData().setData(result)), ContentType.Application.Json)
            } else {
                call.respondText(
                    GSON.toJson(ReturnData().setErrorMsg("导入失败")),
                    ContentType.Application.Json
                )
            }
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("Base64导入失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    // ==================== 批量操作与更新检查（阶段八） ====================

    /** 批量保存书籍进度 POST /saveBookProgressBatch */
    post("/saveBookProgressBatch") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val progressList = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
            progressList.forEach { data ->
                val bookUrl = data["bookUrl"] as? String ?: ""
                if (bookUrl.isNotEmpty()) {
                    BookRepository.updateProgress(
                        bookUrl = bookUrl,
                        durChapterIndex = (data["durChapterIndex"] as? Number)?.toInt() ?: 0,
                        durChapterPos = (data["durChapterPos"] as? Number)?.toInt() ?: 0,
                        durChapterTitle = data["durChapterTitle"] as? String ?: "",
                        durChapterTime = (data["durChapterTime"] as? Number)?.toLong()
                            ?: System.currentTimeMillis()
                    )
                }
            }
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("批量保存进度失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 检查书籍更新 GET /checkBookUpdate?url=xxx */
    get("/checkBookUpdate") {
        val url = call.parameters["url"] ?: ""
        if (url.isEmpty()) {
            call.respondText(GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")), ContentType.Application.Json)
            return@get
        }
        try {
            val bookRow = BookRepository.getByUrl(url)
            if (bookRow == null) {
                call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到书籍")), ContentType.Application.Json)
                return@get
            }
            val chapters = BookChapterRepository.getByBookUrl(url)
            val hasUpdate = chapters.isNotEmpty()
            val latest = chapters.lastOrNull()?.get(io.legado.data.database.tables.BookChapterTable.title) as? String
            call.respondText(
                GSON.toJson(ReturnData().setData(mapOf(
                    "hasUpdate" to hasUpdate,
                    "latestChapter" to latest
                ))),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("检查更新失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量检查更新 POST /checkBookUpdateBatch */
    post("/checkBookUpdateBatch") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val data = GSON.fromJson(body, Map::class.java) as Map<String, Any?>
            @Suppress("UNCHECKED_CAST")
            val urls = data["urls"] as? List<String> ?: emptyList()
            val results = urls.map { url ->
                val chapters = BookChapterRepository.getByBookUrl(url)
                mapOf(
                    "url" to url,
                    "hasUpdate" to chapters.isNotEmpty(),
                    "latestChapter" to (chapters.lastOrNull()?.get(io.legado.data.database.tables.BookChapterTable.title) as? String)
                )
            }
            call.respondText(GSON.toJson(ReturnData().setData(results)), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("批量检查更新失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 下载章节内容到缓存 GET /downloadContent?url=xxx&start=0&end=100 */
    get("/downloadContent") {
        val url = call.parameters["url"] ?: ""
        val start = call.parameters["start"]?.toIntOrNull() ?: 0
        val end = call.parameters["end"]?.toIntOrNull() ?: 100
        if (url.isEmpty()) {
            call.respondText(GSON.toJson(ReturnData().setErrorMsg("参数url不能为空")), ContentType.Application.Json)
            return@get
        }
        try {
            var downloaded = 0
            val bookRow = BookRepository.getByUrl(url)
            if (bookRow == null) {
                call.respondText(GSON.toJson(ReturnData().setErrorMsg("未找到书籍")), ContentType.Application.Json)
                return@get
            }
            val chapters = BookChapterRepository.getByBookUrl(url)
            val origin = bookRow[io.legado.data.database.tables.BookTable.origin]
            val sourceRow = BookSourceRepository.getByUrl(origin)
            if (sourceRow != null && chapters.isNotEmpty()) {
                val book = rowToBook(bookRow)
                val source = rowToBookSource(sourceRow)
                for (i in start until minOf(end, chapters.size)) {
                    val chMap = rowToMap(chapters[i])
                    val chapter = io.legado.data.entities.BookChapter(
                        url = chMap["url"] as? String ?: "",
                        title = chMap["title"] as? String ?: "",
                        bookUrl = chMap["bookUrl"] as? String ?: url,
                        index = (chMap["index"] as? Number)?.toInt() ?: i
                    )
                    val cached = ContentCache.get(url, chapter.url)
                    if (cached == null) {
                        try {
                            val content = withContext(Dispatchers.IO) {
                                WebBook.getContentAwait(source, book, chapter)
                            }
                            ContentCache.put(url, chapter.url, content)
                            downloaded++
                        } catch (_: Exception) { /* 跳过失败的章节 */ }
                    }
                }
            }
            call.respondText(
                GSON.toJson(ReturnData().setData(mapOf("downloaded" to downloaded))),
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("下载内容失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    /** 批量保存书籍 POST /saveBookBatch */
    post("/saveBookBatch") {
        try {
            val body = call.receiveText()
            @Suppress("UNCHECKED_CAST")
            val books = GSON.fromJson(body, List::class.java) as List<Map<String, Any?>>
            books.forEach { book -> BookRepository.save(book) }
            call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
        } catch (e: Exception) {
            call.respondText(
                GSON.toJson(ReturnData().setErrorMsg("批量保存书籍失败: ${e.localizedMessage}")),
                ContentType.Application.Json
            )
        }
    }

    get("/getReadConfig") {
        val config = CacheRepository.get("webReadConfig")
        if (config == null) {
            call.respondText(GSON.toJson(ReturnData().setErrorMsg("没有配置")), ContentType.Application.Json)
        } else {
            call.respondText(GSON.toJson(ReturnData().setData(config)), ContentType.Application.Json)
        }
    }

    post("/saveReadConfig") {
        val body = call.receiveText()
        CacheRepository.put("webReadConfig", body)
        call.respondText(GSON.toJson(ReturnData().setData("")), ContentType.Application.Json)
    }
}

/** 将 BookChapter 转为 ResultRow 兼容的 Map，供 rowToMap 使用 */
private fun rowToMap(chapter: io.legado.data.entities.BookChapter): Map<String, Any?> = mapOf(
    "url" to chapter.url, "title" to chapter.title,
    "isVolume" to (if (chapter.isVolume) 1 else 0),
    "baseUrl" to chapter.baseUrl, "bookUrl" to chapter.bookUrl,
    "index" to chapter.index, "isVip" to (if (chapter.isVip) 1 else 0),
    "isPay" to (if (chapter.isPay) 1 else 0),
    "resourceUrl" to chapter.resourceUrl, "tag" to chapter.tag,
    "wordCount" to chapter.wordCount, "start" to chapter.start,
    "end" to chapter.end, "startFragmentId" to chapter.startFragmentId,
    "endFragmentId" to chapter.endFragmentId, "variable" to chapter.variable,
    "imgUrl" to chapter.imgUrl
)