/**
 * 正文解析 - 解析书源正文页获取章节内容
 *
 * 从 Android 版 io.legado.app.model.webBook.BookContent 移植。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:28 nmb - 从 Android 版移植，单页简化版
 * 2026-06-13 19:52 nmb - 用全限定名修复编译，移除 ensureActive 调用
 */

package io.legado.model.webBook

import io.legado.data.entities.Book
import io.legado.data.entities.BookChapter
import io.legado.data.entities.BookSource
import io.legado.data.entities.rule.ContentRule
import io.legado.model.analyzeRule.AnalyzeRule
import org.slf4j.LoggerFactory

object BookContent {
    private val logger = LoggerFactory.getLogger(BookContent::class.java)

    @Throws(Exception::class)
    suspend fun analyzeContent(
        bookSource: BookSource, book: Book, bookChapter: BookChapter,
        baseUrl: String, redirectUrl: String, body: String?, nextChapterUrl: String? = null
    ): String {
        body ?: throw RuntimeException("获取正文内容失败: $baseUrl")
        val contentRule = bookSource.getContentRule()
        if (bookChapter.isVolume && bookChapter.url.startsWith(bookChapter.title)) {
            return bookChapter.tag ?: ""
        }
        val analyzeRule = AnalyzeRule(book, bookSource)
        analyzeRule.setContent(body).setBaseUrl(baseUrl)
        analyzeRule.setRedirectUrl(redirectUrl)
        analyzeRule.setChapter(bookChapter)
        analyzeRule.setNextChapterUrl(nextChapterUrl)

        val (content, _) = analyzeContentInner(book, baseUrl, redirectUrl, body, contentRule, bookChapter, bookSource, nextChapterUrl)
        var contentStr = content
        val replaceRegex = contentRule.replaceRegex
        if (!replaceRegex.isNullOrEmpty()) {
            contentStr = analyzeRule.getString(replaceRegex, contentStr)
        }
        val titleRule = contentRule.title
        if (!titleRule.isNullOrBlank()) {
            analyzeRule.getString(titleRule).let { title ->
                if (title.isNotBlank()) {
                    bookChapter.title = title
                    bookChapter.titleMD5 = null
                    bookChapter.update()
                }
            }
        }
        return contentStr
    }

    @Throws(Exception::class)
    private suspend fun analyzeContentInner(
        book: Book, baseUrl: String, redirectUrl: String, body: String,
        contentRule: ContentRule, chapter: BookChapter, bookSource: BookSource,
        nextChapterUrl: String?
    ): Pair<String, List<String>> {
        val analyzeRule = AnalyzeRule(book)
        analyzeRule.setContent(body, baseUrl)
        analyzeRule.setRedirectUrl(redirectUrl)
        analyzeRule.setNextChapterUrl(nextChapterUrl)
        analyzeRule.setChapter(chapter)

        var content = analyzeRule.getString(analyzeRule.splitSourceRule(contentRule.content), unescape = false)
        content = io.legado.utils.HtmlFormatter.formatKeepImg(content, redirectUrl)
        if (content.indexOf('&') > -1) {
            content = org.apache.commons.text.StringEscapeUtils.unescapeHtml4(content)
        }
        return Pair(content, emptyList())
    }
}