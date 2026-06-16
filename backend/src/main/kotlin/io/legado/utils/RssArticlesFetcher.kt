/**
 * RSS 文章获取器 - 解析 RSS/Atom Feed
 *
 * 对齐 Android 版 RssAPI 的文章获取逻辑。
 * 使用 Jsoup 解析 RSS XML，提取文章列表和内容。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:31 nmb - 阶段八新增
 */

package io.legado.utils

import io.legado.data.repository.RssSourceRepository
import okhttp3.OkHttpClient
import okhttp3.Request
import org.jsoup.Jsoup
import org.jsoup.parser.Parser
import org.slf4j.LoggerFactory
import java.util.concurrent.TimeUnit

object RssArticlesFetcher {

    private val logger = LoggerFactory.getLogger("RssArticlesFetcher")

    /** HTTP 客户端（复用连接池） */
    private val client by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    /**
     * 获取 RSS 源的文章列表
     *
     * @param sourceUrl RSS 源地址
     * @param page 页码（从1开始，部分源支持分页）
     * @return 文章列表
     */
    fun fetchArticles(sourceUrl: String, page: Int = 1): List<Map<String, Any?>> {
        try {
            // 从数据库获取 RSS 源配置
            val sourceRow = RssSourceRepository.getByUrl(sourceUrl)
            val header = sourceRow?.let {
                @Suppress("UNCHECKED_CAST")
                (it[io.legado.data.database.tables.RssSourceTable.header] as? String)?.let { h ->
                    runCatching { io.legado.model.GSON.fromJson(h, Map::class.java) as Map<String, String> }.getOrNull()
                }
            }

            // 构建请求
            val requestBuilder = Request.Builder().url(sourceUrl)
            header?.forEach { (k, v) -> requestBuilder.header(k, v) }
            if (header?.containsKey("User-Agent") != true) {
                requestBuilder.header("User-Agent", "Mozilla/5.0 (compatible; LegadoRSS/1.0)")
            }

            client.newCall(requestBuilder.build()).execute().use { response ->
                if (!response.isSuccessful) {
                    logger.warn("RSS 获取失败: HTTP {}", response.code)
                    return emptyList()
                }
                val body = response.body?.string() ?: return emptyList()
                return parseRssXml(body, sourceUrl)
            }
        } catch (e: Exception) {
            logger.error("RSS 文章获取异常: {}", e.localizedMessage)
            return emptyList()
        }
    }

    /**
     * 获取单篇 RSS 文章内容
     *
     * @param articleUrl 文章链接
     * @param sourceUrl 所属 RSS 源地址（用于获取配置）
     * @return 文章 HTML 内容
     */
    fun fetchArticleContent(articleUrl: String, sourceUrl: String? = null): String {
        try {
            val requestBuilder = Request.Builder().url(articleUrl)
            requestBuilder.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

            client.newCall(requestBuilder.build()).execute().use { response ->
                if (!response.isSuccessful) return "获取失败: HTTP ${response.code}"
                val html = response.body?.string() ?: return "获取失败: 空响应"
                // 使用 Jsoup 提取正文
                val doc = Jsoup.parse(html)
                // 优先尝试 article 标签，其次 main，最后 body
                val content = doc.selectFirst("article")?.html()
                    ?: doc.selectFirst("main")?.html()
                    ?: doc.selectFirst(".content, .article-content, .post-content")?.html()
                    ?: doc.body()?.html()
                return content ?: "无法解析正文"
            }
        } catch (e: Exception) {
            logger.error("RSS 文章内容获取异常: {}", e.localizedMessage)
            return "获取异常: ${e.localizedMessage}"
        }
    }

    /**
     * 解析 RSS/Atom XML
     * 支持 RSS 2.0 的 <item> 和 Atom 的 <entry>
     */
    private fun parseRssXml(xml: String, sourceUrl: String): List<Map<String, Any?>> {
        val articles = mutableListOf<Map<String, Any?>>()
        try {
            val doc = Jsoup.parse(xml, "", Parser.xmlParser())

            // RSS 2.0: <item>
            doc.select("item").forEach { item ->
                articles.add(mapOf(
                    "title" to (item.selectFirst("title")?.text() ?: ""),
                    "link" to (item.selectFirst("link")?.text() ?: ""),
                    "description" to (item.selectFirst("description")?.text() ?: ""),
                    "pubDate" to (item.selectFirst("pubDate")?.text() ?: ""),
                    "image" to (item.selectFirst("enclosure")?.attr("url") ?: ""),
                    "origin" to sourceUrl
                ))
            }

            // Atom: <entry>
            if (articles.isEmpty()) {
                doc.select("entry").forEach { entry ->
                    articles.add(mapOf(
                        "title" to (entry.selectFirst("title")?.text() ?: ""),
                        "link" to (entry.selectFirst("link")?.attr("href") ?: ""),
                        "description" to (entry.selectFirst("summary")?.text()
                            ?: entry.selectFirst("content")?.text() ?: ""),
                        "pubDate" to (entry.selectFirst("published")?.text()
                            ?: entry.selectFirst("updated")?.text() ?: ""),
                        "image" to "",
                        "origin" to sourceUrl
                    ))
                }
            }
        } catch (e: Exception) {
            logger.error("RSS XML 解析失败: {}", e.localizedMessage)
        }
        logger.info("RSS 解析完成: {} 篇文章", articles.size)
        return articles
    }
}