/**
 * 书籍详情解析 - 解析书源详情页获取书名/作者/封面等信息
 *
 * 从 Android 版 io.legado.app.model.webBook.BookInfo 移植。
 * 主要变更：移除 Android 依赖，使用全限定名绕过 IDE 自动格式化移除导入的问题。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:27 nmb - 从 Android 版移植
 * 2026-06-13 19:42 nmb - 改用全限定名修复编译
 */

package io.legado.model.webBook

import io.legado.data.entities.Book
import io.legado.data.entities.BookSource
import io.legado.model.analyzeRule.AnalyzeRule
import io.legado.model.analyzeRule.NetworkUtils
import org.slf4j.LoggerFactory

object BookInfo {
    private val logger = LoggerFactory.getLogger(BookInfo::class.java)

    @Throws(Exception::class)
    suspend fun analyzeBookInfo(
        bookSource: BookSource, book: Book, baseUrl: String, redirectUrl: String,
        body: String?, canReName: Boolean
    ) {
        body ?: throw RuntimeException("获取网页内容失败: $baseUrl")
        val analyzeRule = AnalyzeRule(book)
        analyzeRule.setContent(body).setBaseUrl(baseUrl)
        analyzeRule.setRedirectUrl(redirectUrl)
        analyzeBookInfo(book, body, analyzeRule, bookSource, baseUrl, redirectUrl, canReName)
    }

    suspend fun analyzeBookInfo(
        book: Book, body: String, analyzeRule: AnalyzeRule, bookSource: BookSource,
        baseUrl: String, redirectUrl: String, canReName: Boolean
    ) {
        val infoRule = bookSource.getBookInfoRule()
        infoRule.init?.let { initRule ->
            if (initRule.isNotBlank()) {
                analyzeRule.setContent(analyzeRule.getElement(initRule))
            }
        }
        val mCanReName = canReName && !infoRule.canReName.isNullOrBlank()
        io.legado.utils.BookHelp.formatBookName(analyzeRule.getString(infoRule.name)).let {
            if (it.isNotEmpty() && (mCanReName || book.name.isEmpty())) book.name = it
        }
        io.legado.utils.BookHelp.formatBookAuthor(analyzeRule.getString(infoRule.author)).let {
            if (it.isNotEmpty() && (mCanReName || book.author.isEmpty())) book.author = it
        }
        try {
            analyzeRule.getStringList(infoRule.kind)?.joinToString(",")?.let {
                if (it.isNotEmpty()) book.kind = it
            }
        } catch (_: Exception) {}
        try { analyzeRule.getString(infoRule.wordCount).let { if (it.isNotEmpty()) book.wordCount = it } } catch (_: Exception) {}
        try { analyzeRule.getString(infoRule.lastChapter).let { if (it.isNotEmpty()) book.latestChapterTitle = it } } catch (_: Exception) {}
        try {
            val intro = analyzeRule.getString(infoRule.intro).trimStart()
            if (intro.startsWith("<usehtml>") || intro.startsWith("<md>") || intro.startsWith("<useweb>")) {
                book.intro = intro
            } else {
                io.legado.utils.HtmlFormatter.format(intro).let { if (it.isNotEmpty()) book.intro = it }
            }
        } catch (_: Exception) {}
        try {
            analyzeRule.getString(infoRule.coverUrl).let {
                if (it.isNotEmpty()) book.coverUrl = NetworkUtils.getAbsoluteURL(redirectUrl, it)
            }
        } catch (_: Exception) {}
        if (book.isLocal) return
        book.tocUrl = analyzeRule.getString(infoRule.tocUrl, isUrl = true)
        if (book.tocUrl.isEmpty()) book.tocUrl = baseUrl
        if (book.tocUrl == baseUrl) book.tocHtml = body
    }
}