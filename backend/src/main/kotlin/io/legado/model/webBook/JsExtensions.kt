/**
 * JS 扩展接口（精简版） - 提供书源规则 JS 可调用的核心方法
 *
 * 从 Android 版 io.legado.app.help.JsExtensions 移植。
 * 仅提取书源规则中实际常用的核心方法，排除 WebView/文件操作/Android 特有功能。
 *
 * 实现类：AnalyzeRule、AnalyzeUrl（通过 java=this bindings 暴露给 JS）
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 20:18 nmb - 初始精简版，移植 ajax/base64/md5/encodeURI/log 等核心方法
 */
package io.legado.model.webBook

import io.legado.data.entities.BookSource
import io.legado.model.analyzeRule.AnalyzeUrl
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import java.net.URLEncoder
import java.security.MessageDigest
import java.util.Base64

/**
 * JS 扩展接口
 * 在 Rhino bindings 中通过 `java` 变量暴露给 JS 脚本调用
 */
@Suppress("unused", "RedundantSuspendModifier")
open class JsExtensions {
    companion object {
        private val logger = LoggerFactory.getLogger(JsExtensions::class.java)
    }

    /** 供子类覆写，返回当前书源（属性形式，避免 JVM 签名冲突） */
    open val source: BookSource? = null

    /** 供子类覆写，返回书源标识 */
    open fun getTag(): String? = source?.bookSourceUrl

    // ==================== 网络请求 ====================

    /**
     * 访问网络，返回响应文本
     * JS 用法: java.ajax(url) 或 java.ajax([url])
     */
    open fun ajax(url: Any): String? {
        val urlStr = when (url) {
            is List<*> -> url.firstOrNull()?.toString() ?: ""
            else -> url.toString()
        }
        if (urlStr.isBlank()) return ""
        val analyzeUrl = AnalyzeUrl(mUrl = urlStr, source = source)
        return runCatching {
            runBlocking { analyzeUrl.getStrResponseAwait().body }
        }.onFailure {
            logger.warn("ajax({}) error: {}", urlStr, it.localizedMessage)
        }.getOrElse { null }
    }

    // ==================== Base64 编解码 ====================

    /**
     * Base64 解码
     * JS 用法: java.base64Decode(encodedStr)
     */
    fun base64Decode(str: String?): String {
        if (str.isNullOrBlank()) return ""
        return try {
            String(Base64.getDecoder().decode(str))
        } catch (e: Exception) {
            logger.warn("base64Decode error: {}", e.localizedMessage)
            ""
        }
    }

    /**
     * Base64 编码（URL安全，不填充）
     * JS 用法: java.base64Encode(plainStr)
     */
    fun base64Encode(str: String?): String {
        if (str.isNullOrBlank()) return ""
        return try {
            Base64.getUrlEncoder().withoutPadding().encodeToString(str.toByteArray())
        } catch (e: Exception) {
            logger.warn("base64Encode error: {}", e.localizedMessage)
            ""
        }
    }

    // ==================== MD5 ====================

    /**
     * MD5 32位小写
     * JS 用法: java.md5Encode(str)
     */
    fun md5Encode(str: String): String {
        return try {
            val md = MessageDigest.getInstance("MD5")
            val digest = md.digest(str.toByteArray())
            digest.joinToString("") { "%02x".format(it) }
        } catch (e: Exception) {
            logger.warn("md5Encode error: {}", e.localizedMessage)
            ""
        }
    }

    /**
     * MD5 16位小写
     * JS 用法: java.md5Encode16(str)
     */
    fun md5Encode16(str: String): String {
        val full = md5Encode(str)
        return if (full.length >= 24) full.substring(8, 24) else full
    }

    // ==================== URI 编码 ====================

    /**
     * URI 编码
     * JS 用法: java.encodeURI(str) 或 java.encodeURI(str, charset)
     */
    fun encodeURI(str: String): String {
        return try {
            URLEncoder.encode(str, "UTF-8")
        } catch (e: Exception) {
            logger.warn("encodeURI error: {}", e.localizedMessage)
            ""
        }
    }

    fun encodeURI(str: String, charset: String): String {
        return try {
            URLEncoder.encode(str, charset)
        } catch (e: Exception) {
            logger.warn("encodeURI({}, {}) error: {}", str, charset, e.localizedMessage)
            ""
        }
    }

    // ==================== 日志 ====================

    /**
     * 输出调试日志
     * JS 用法: java.log(message)
     */
    fun log(msg: Any?) {
        logger.info("JS_LOG: {}", msg?.toString() ?: "null")
    }
}