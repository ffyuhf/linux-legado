/**
 * WebBook 网络书籍加载主入口 - 搜索/详情/目录/正文调度中心
 *
 * 从 Android 版 io.legado.app.model.webBook.WebBook 移植。
 * 主要变更：
 * - 移除 Android Coroutine 封装（Coroutine.async）→ 直接使用 suspend 函数
 * - 移除 Debug.log（后续可替换为 Logback）
 * - 移除 checkRedirect 调试日志
 * - 移除 CoroutineScope/Dispatchers.Main 等 Android 专用概念
 * - 保留核心搜索/详情/目录/正文逻辑
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:25 nmb - 从 Android 版移植
 */

package io.legado.model.webBook

import io.legado.data.entities.Book
import io.legado.data.entities.BookChapter
import io.legado.data.entities.BookSource
import io.legado.data.entities.SearchBook
import io.legado.model.StrResponse
import io.legado.model.analyzeRule.AnalyzeRule
import io.legado.model.analyzeRule.AnalyzeUrl
import io.legado.model.analyzeRule.RuleData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory

/**
 * WebBook 网络书籍加载
 *
 * 提供搜索、发现、详情、目录、正文五个核心接口。
 * 所有方法均为 suspend 函数，在调用方协程上下文中执行。
 */
object WebBook {
    private val logger = LoggerFactory.getLogger(WebBook::class.java)

    /**
     * 搜索书籍（阻塞方式）
     *
     * @param bookSource 书源
     * @param key 搜索关键词
     * @param page 页码（默认1）
     * @return 搜索结果列表
     */
    suspend fun searchBookAwait(
        bookSource: BookSource,
        key: String,
        page: Int? = 1
    ): ArrayList<SearchBook> {
        val searchUrl = bookSource.searchUrl
        if (searchUrl.isNullOrBlank()) {
            throw RuntimeException("搜索url不能为空")
        }
        val ruleData = RuleData()
        val analyzeUrl = AnalyzeUrl(
            mUrl = searchUrl,
            jsKey = key,
            jsPage = page,
            baseUrl = bookSource.bookSourceUrl,
            source = bookSource,
            ruleData = ruleData
        )
        val checkJs = bookSource.loginCheckJs

        val res = withContext(Dispatchers.IO) {
            kotlin.runCatching {
                analyzeUrl.getStrResponseAwait().let { response ->
                    if (!checkJs.isNullOrBlank()) {
                        analyzeUrl.evalJS(checkJs, response) as? StrResponse ?: response
                    } else {
                        response
                    }
                }
            }.getOrElse { throwable ->
                if (!checkJs.isNullOrBlank()) {
                    val errResponse = analyzeUrl.getErrStrResponse(throwable)
                    try {
                        (analyzeUrl.evalJS(checkJs, errResponse) as? StrResponse)?.also {
                            if (it.code() == 500) throw throwable
                        } ?: throw throwable
                    } catch (_: Throwable) {
                        throw throwable
                    }
                } else {
                    throw throwable
                }
            }
        }

        return BookList.analyzeBookList(
            bookSource = bookSource,
            ruleData = ruleData,
            analyzeUrl = analyzeUrl,
            baseUrl = res.url,
            body = res.body,
            isSearch = true
        )
    }

    /**
     * 获取书籍详情
     *
     * @param bookSource 书源
     * @param book 书籍实体（结果直接写入此对象）
     */
    suspend fun getBookInfoAwait(
        bookSource: BookSource,
        book: Book
    ): Book {
        val analyzeUrl = AnalyzeUrl(
            mUrl = book.bookUrl,
            baseUrl = bookSource.bookSourceUrl,
            source = bookSource,
            ruleData = book
        )
        val checkJs = bookSource.loginCheckJs

        val res = withContext(Dispatchers.IO) {
            kotlin.runCatching {
                analyzeUrl.getStrResponseAwait().let { response ->
                    if (!checkJs.isNullOrBlank()) {
                        analyzeUrl.evalJS(checkJs, response) as? StrResponse ?: response
                    } else {
                        response
                    }
                }
            }.getOrElse { throwable ->
                if (!checkJs.isNullOrBlank()) {
                    val errResponse = analyzeUrl.getErrStrResponse(throwable)
                    try {
                        (analyzeUrl.evalJS(checkJs, errResponse) as? StrResponse)?.also {
                            if (it.code() == 500) throw throwable
                        } ?: throw throwable
                    } catch (_: Throwable) {
                        throw throwable
                    }
                } else {
                    throw throwable
                }
            }
        }

        BookInfo.analyzeBookInfo(
            bookSource = bookSource,
            book = book,
            baseUrl = book.bookUrl,
            redirectUrl = res.url,
            body = res.body,
            canReName = true
        )
        return book
    }

    /**
     * 获取目录
     *
     * @param bookSource 书源
     * @param book 书籍实体（tocUrl 必须已设置）
     * @return 章节列表
     */
    suspend fun getChapterListAwait(
        bookSource: BookSource,
        book: Book
    ): List<BookChapter> {
        val analyzeUrl = AnalyzeUrl(
            mUrl = book.tocUrl,
            baseUrl = book.bookUrl,
            source = bookSource,
            ruleData = book
        )
        val checkJs = bookSource.loginCheckJs

        val res = withContext(Dispatchers.IO) {
            kotlin.runCatching {
                analyzeUrl.getStrResponseAwait().let { response ->
                    if (!checkJs.isNullOrBlank()) {
                        analyzeUrl.evalJS(checkJs, response) as? StrResponse ?: response
                    } else {
                        response
                    }
                }
            }.getOrElse { throwable ->
                if (!checkJs.isNullOrBlank()) {
                    val errResponse = analyzeUrl.getErrStrResponse(throwable)
                    try {
                        (analyzeUrl.evalJS(checkJs, errResponse) as? StrResponse)?.also {
                            if (it.code() == 500) throw throwable
                        } ?: throw throwable
                    } catch (_: Throwable) {
                        throw throwable
                    }
                } else {
                    throw throwable
                }
            }
        }

        return BookChapterList.analyzeChapterList(
            bookSource = bookSource,
            book = book,
            baseUrl = book.tocUrl,
            redirectUrl = res.url,
            body = res.body
        )
    }

    /**
     * 获取正文内容
     *
     * @param bookSource 书源
     * @param book 书籍实体
     * @param bookChapter 章节实体
     * @param nextChapterUrl 下一章URL（可选，用于分页控制）
     * @return 处理后的正文文本
     */
    suspend fun getContentAwait(
        bookSource: BookSource,
        book: Book,
        bookChapter: BookChapter,
        nextChapterUrl: String? = null
    ): String {
        val contentRule = bookSource.getContentRule()
        if (contentRule.content.isNullOrEmpty()) {
            logger.debug("{} =>正文规则为空,使用章节链接:{}", bookSource.bookSourceUrl, bookChapter.url)
            return bookChapter.url
        }
        if (bookChapter.isVolume && bookChapter.url.startsWith(bookChapter.title)) {
            logger.debug("{} =>一级目录正文不解析规则", bookSource.bookSourceUrl)
            return bookChapter.tag ?: ""
        }

        val analyzeUrl = AnalyzeUrl(
            mUrl = bookChapter.getAbsoluteURL(),
            baseUrl = book.tocUrl,
            source = bookSource,
            ruleData = book,
            chapter = bookChapter
        )
        val checkJs = bookSource.loginCheckJs

        val res = withContext(Dispatchers.IO) {
            kotlin.runCatching {
                analyzeUrl.getStrResponseAwait(
                    jsStr = contentRule.webJs,
                    sourceRegex = contentRule.sourceRegex
                ).let { response ->
                    if (!checkJs.isNullOrBlank()) {
                        analyzeUrl.evalJS(checkJs, response) as? StrResponse ?: response
                    } else {
                        response
                    }
                }
            }.getOrElse { throwable ->
                if (!checkJs.isNullOrBlank()) {
                    val errResponse = analyzeUrl.getErrStrResponse(throwable)
                    try {
                        (analyzeUrl.evalJS(checkJs, errResponse) as? StrResponse)?.also {
                            if (it.code() == 500) throw throwable
                        } ?: throw throwable
                    } catch (_: Throwable) {
                        throw throwable
                    }
                } else {
                    throw throwable
                }
            }
        }

        return BookContent.analyzeContent(
            bookSource = bookSource,
            book = book,
            bookChapter = bookChapter,
            baseUrl = bookChapter.getAbsoluteURL(),
            redirectUrl = res.url,
            body = res.body,
            nextChapterUrl = nextChapterUrl
        )
    }
}