/**
 * 网络 URL 工具类 - URL 拼接与解析
 *
 * 从 Android 版 io.legado.app.utils.NetworkUtils 移植，仅保留规则解析所需的 URL 方法。
 * 去除 Android 依赖（AppLog → SLF4J）。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:48 nmb - 从 Android 版移植，仅保留 URL 拼接/解析相关方法
 */

package io.legado.model.analyzeRule

import org.slf4j.LoggerFactory
import java.net.URL

object NetworkUtils {
    private val logger = LoggerFactory.getLogger(NetworkUtils::class.java)

    /**
     * 获取绝对 URL（String 版本）
     * @param baseURL 基础 URL（可为 null 或逗号分隔的多 URL）
     * @param relativePath 相对路径
     */
    fun getAbsoluteURL(baseURL: String?, relativePath: String): String {
        if (baseURL.isNullOrEmpty()) return relativePath.trim()
        var absoluteUrl: URL? = null
        try {
            absoluteUrl = URL(baseURL.substringBefore(","))
        } catch (e: Exception) {
            logger.debug("URL 解析失败: baseURL={}", baseURL, e)
        }
        return getAbsoluteURL(absoluteUrl, relativePath)
    }

    /**
     * 获取绝对 URL（URL 版本）
     * @param baseURL 基础 URL
     * @param relativePath 相对路径
     */
    fun getAbsoluteURL(baseURL: URL?, relativePath: String): String {
        val relativePathTrim = relativePath.trim()
        if (baseURL == null) return relativePathTrim
        if (relativePathTrim.isAbsUrl()) return relativePathTrim
        if (relativePathTrim.isDataUrl()) return relativePathTrim
        if (relativePathTrim.startsWith("javascript")) return ""
        try {
            val parseUrl = URL(baseURL, relativePathTrim)
            return parseUrl.toString()
        } catch (e: Exception) {
            logger.debug("URL 拼接出错: base={}, rel={}", baseURL, relativePathTrim, e)
        }
        return relativePathTrim
    }

    /**
     * 从完整 URL 中提取 baseUrl（scheme + host）
     */
    fun getBaseUrl(url: String?): String? {
        url ?: return null
        if (url.startsWith("http://", true) || url.startsWith("https://", true)) {
            val index = url.indexOf("/", 9)
            return if (index == -1) url else url.substring(0, index)
        }
        return null
    }

    /**
     * 提取子域名（scheme + host）
     */
    fun getSubDomain(url: String): String {
        return kotlin.runCatching {
            val u = URL(url)
            "${u.protocol}://${u.host}"
        }.getOrDefault(url)
    }
}

/** 扩展：判断是否为绝对 URL */
fun String.isAbsUrl(): Boolean =
    startsWith("http://", true) || startsWith("https://", true)

/** 扩展：判断是否为 data: URI */
fun String.isDataUrl(): Boolean =
    startsWith("data:", true)

/** 扩展：判断是否为 JSON */
fun String.isJson(): Boolean {
    val trimmed = trim()
    return (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
            (trimmed.startsWith("[") && trimmed.endsWith("]"))
}