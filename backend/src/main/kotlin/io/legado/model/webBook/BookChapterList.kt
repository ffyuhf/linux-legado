/**
 * 目录解析 - 解析书源目录页获取章节列表
 *
 * 从 Android 版 io.legado.app.model.webBook.BookChapterList 移植。
 * 简化：单页版本，移除 Android/JS 依赖，使用全限定名绕过 IDE 自动格式化。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:27 nmb - 从 Android 版移植，单页简化版
 * 2026-06-13 19:42 nmb - 用全限定名修复编译
 */

package io.legado.model.webBook

import io.legado.data.entities.Book
import io.legado.data.entities.BookChapter
import io.legado.data.entities.BookSource
import io.legado.model.analyzeRule.AnalyzeRule
import org.slf4j.LoggerFactory

object BookChapterList {
    private val logger = LoggerFactory.getLogger(BookChapterList::class.java)

    @Throws(Exception::class)
    suspend fun analyzeChapterList(
        bookSource: BookSource, book: Book, baseUrl: String, redirectUrl: String, body: String?
    ): List<BookChapter> {
        body ?: throw RuntimeException("获取目录页内容失败: $baseUrl")

        val chapterList = ArrayList<BookChapter>()
        val tocRule = bookSource.getTocRule()
        var reverse = false
        var listRule = tocRule.chapterList ?: ""
        if (listRule.startsWith("-")) { reverse = true; listRule = listRule.substring(1) }
        if (listRule.startsWith("+")) listRule = listRule.substring(1)

        val analyzeRule = AnalyzeRule(book)
        analyzeRule.setContent(body).setBaseUrl(baseUrl)
        analyzeRule.setRedirectUrl(redirectUrl)
        val elements = analyzeRule.getElements(listRule)
        if (elements.isNotEmpty()) {
            val nameRule = analyzeRule.splitSourceRule(tocRule.chapterName)
            val urlRule = analyzeRule.splitSourceRule(tocRule.chapterUrl)
            val isVipRule = analyzeRule.splitSourceRule(tocRule.isVip)
            val isPayRule = analyzeRule.splitSourceRule(tocRule.isPay)
            val upTimeRule = analyzeRule.splitSourceRule(tocRule.updateTime)
            val isVolumeRule = analyzeRule.splitSourceRule(tocRule.isVolume)
            elements.forEachIndexed { index, item ->
                analyzeRule.setContent(item)
                val bc = BookChapter(bookUrl = book.bookUrl, baseUrl = redirectUrl)
                analyzeRule.setChapter(bc)
                bc.title = analyzeRule.getString(nameRule)
                bc.url = analyzeRule.getString(urlRule)
                val info = analyzeRule.getString(upTimeRule)
                val isVol = analyzeRule.getString(isVolumeRule)
                bc.isVolume = isVol == "true" || isVol == "1" || isVol.equals("true", ignoreCase = true)
                bc.tag = info
                if (bc.url.isEmpty()) bc.url = if (bc.isVolume) bc.title + index else baseUrl
                if (bc.title.isNotEmpty()) {
                    if (analyzeRule.getString(isVipRule).let { it == "true" || it == "1" }) bc.isVip = true
                    if (analyzeRule.getString(isPayRule).let { it == "true" || it == "1" }) bc.isPay = true
                    chapterList.add(bc)
                }
            }
        }
        if (chapterList.isEmpty()) throw RuntimeException("章节列表为空")
        if (!reverse) chapterList.reverse()
        val lh = LinkedHashSet(chapterList)
        val list = ArrayList(lh)
        if (!book.getReverseToc()) list.reverse()
        list.forEachIndexed { index, c -> c.index = index }
        book.totalChapterNum = list.size
        return list
    }
}

private fun Book.getReverseToc(): Boolean = false