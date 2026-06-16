/**
 * 书籍列表解析 - 搜索/发现结果列表解析
 *
 * 从 Android 版 io.legado.app.model.webBook.BookList 移植。
 * 使用全限定名绕过 IDE 自动格式化移除导入的问题。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:25 nmb - 从 Android 版移植
 * 2026-06-13 19:47 nmb - 修复路径错误，用绝对路径创建
 */

package io.legado.model.webBook

import io.legado.data.entities.Book
import io.legado.data.entities.BookSource
import io.legado.data.entities.SearchBook
import io.legado.data.entities.rule.BookListRule
import io.legado.model.analyzeRule.AnalyzeRule
import io.legado.model.analyzeRule.AnalyzeUrl
import io.legado.model.analyzeRule.RuleData
import org.slf4j.LoggerFactory

object BookList {
    private val logger = LoggerFactory.getLogger(BookList::class.java)

    @Throws(Exception::class)
    suspend fun analyzeBookList(
        bookSource: BookSource, ruleData: RuleData, analyzeUrl: AnalyzeUrl,
        baseUrl: String, body: String?, isSearch: Boolean = true
    ): ArrayList<SearchBook> {
        body ?: throw RuntimeException("获取网页内容失败: ${analyzeUrl.ruleUrl}")

        val bookList = ArrayList<SearchBook>()
        val analyzeRule = AnalyzeRule(ruleData)
        analyzeRule.setContent(body).setBaseUrl(baseUrl).setRedirectUrl(baseUrl)

        if (isSearch) {
            bookSource.bookUrlPattern?.let { pattern ->
                if (baseUrl.matches(pattern.toRegex())) {
                    getInfoItem(bookSource, analyzeRule, analyzeUrl, body, baseUrl, ruleData.getVariable())?.let { sb ->
                        sb.infoHtml = body
                        bookList.add(sb)
                    }
                    return bookList
                }
            }
        }

        var reverse = false
        val bookListRule: BookListRule = if (isSearch) bookSource.getSearchRule()
        else if (bookSource.getExploreRule().bookList.isNullOrBlank()) bookSource.getSearchRule()
        else bookSource.getExploreRule()

        var ruleList: String = bookListRule.bookList ?: ""
        if (ruleList.startsWith("-")) { reverse = true; ruleList = ruleList.substring(1) }
        if (ruleList.startsWith("+")) ruleList = ruleList.substring(1)

        val collections = analyzeRule.getElements(ruleList)
        if (collections.isEmpty() && bookSource.bookUrlPattern.isNullOrEmpty()) {
            getInfoItem(bookSource, analyzeRule, analyzeUrl, body, baseUrl, ruleData.getVariable())?.let { sb ->
                sb.infoHtml = body
                bookList.add(sb)
            }
        } else {
            val ruleName = analyzeRule.splitSourceRule(bookListRule.name)
            val ruleBookUrl = analyzeRule.splitSourceRule(bookListRule.bookUrl)
            val ruleAuthor = analyzeRule.splitSourceRule(bookListRule.author)
            val ruleCoverUrl = analyzeRule.splitSourceRule(bookListRule.coverUrl)
            val ruleIntro = analyzeRule.splitSourceRule(bookListRule.intro)
            val ruleKind = analyzeRule.splitSourceRule(bookListRule.kind)
            val ruleLastChapter = analyzeRule.splitSourceRule(bookListRule.lastChapter)
            val ruleWordCount = analyzeRule.splitSourceRule(bookListRule.wordCount)
            for (item in collections) {
                getSearchItem(
                    bookSource, analyzeRule, item, baseUrl, ruleData.getVariable(),
                    ruleName, ruleBookUrl, ruleAuthor, ruleCoverUrl, ruleIntro, ruleKind, ruleLastChapter, ruleWordCount
                )?.let { sb ->
                    if (baseUrl == sb.bookUrl) sb.infoHtml = body
                    bookList.add(sb)
                }
            }
            val lh = LinkedHashSet(bookList); bookList.clear(); bookList.addAll(lh)
            if (reverse) bookList.reverse()
        }
        return bookList
    }

    @Throws(Exception::class)
    private suspend fun getInfoItem(
        bookSource: BookSource, analyzeRule: AnalyzeRule, analyzeUrl: AnalyzeUrl,
        body: String, baseUrl: String, variable: String?
    ): SearchBook? {
        val book = Book(variable = variable)
        book.bookUrl = io.legado.model.analyzeRule.NetworkUtils.getAbsoluteURL(analyzeUrl.url, analyzeUrl.ruleUrl)
        book.origin = bookSource.bookSourceUrl
        book.originName = bookSource.bookSourceName
        book.originOrder = bookSource.customOrder
        book.type = bookSource.bookSourceType
        analyzeRule.ruleData = book
        BookInfo.analyzeBookInfo(book, body, analyzeRule, bookSource, baseUrl, baseUrl, false)
        return if (book.name.isNotBlank()) book.toSearchBook() else null
    }

    @Throws(Exception::class)
    private suspend fun getSearchItem(
        bookSource: BookSource, analyzeRule: AnalyzeRule, item: Any, baseUrl: String, variable: String?,
        ruleName: List<AnalyzeRule.SourceRule>, ruleBookUrl: List<AnalyzeRule.SourceRule>,
        ruleAuthor: List<AnalyzeRule.SourceRule>, ruleCoverUrl: List<AnalyzeRule.SourceRule>,
        ruleIntro: List<AnalyzeRule.SourceRule>, ruleKind: List<AnalyzeRule.SourceRule>,
        ruleLastChapter: List<AnalyzeRule.SourceRule>, ruleWordCount: List<AnalyzeRule.SourceRule>
    ): SearchBook? {
        val sb = SearchBook(variable = variable)
        sb.type = bookSource.bookSourceType
        sb.origin = bookSource.bookSourceUrl
        sb.originName = bookSource.bookSourceName
        sb.originOrder = bookSource.customOrder
        analyzeRule.ruleData = sb
        analyzeRule.setContent(item)
        sb.name = io.legado.utils.BookHelp.formatBookName(analyzeRule.getString(ruleName))
        if (sb.name.isEmpty()) return null
        sb.author = io.legado.utils.BookHelp.formatBookAuthor(analyzeRule.getString(ruleAuthor))
        try { sb.kind = analyzeRule.getStringList(ruleKind)?.joinToString(",") } catch (_: Exception) {}
        try { sb.wordCount = analyzeRule.getString(ruleWordCount) } catch (_: Exception) {}
        try { sb.latestChapterTitle = analyzeRule.getString(ruleLastChapter) } catch (_: Exception) {}
        try { sb.intro = io.legado.utils.HtmlFormatter.format(analyzeRule.getString(ruleIntro)) } catch (_: Exception) {}
        try {
            analyzeRule.getString(ruleCoverUrl).let { if (it.isNotEmpty()) sb.coverUrl = io.legado.model.analyzeRule.NetworkUtils.getAbsoluteURL(baseUrl, it) }
        } catch (_: Exception) {}
        sb.bookUrl = analyzeRule.getString(ruleBookUrl, isUrl = true)
        if (sb.bookUrl.isEmpty()) sb.bookUrl = baseUrl
        return sb
    }
}