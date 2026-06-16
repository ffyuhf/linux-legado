/**
 * 内容缓存管理器 - 章节正文文件缓存
 *
 * 对齐 Android 版 ContentCache 的文件缓存逻辑。
 * 将已下载的章节正文缓存到文件系统，减少重复网络请求。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:30 nmb - 阶段八新增
 */

package io.legado.utils

import io.legado.AppConfig
import org.slf4j.LoggerFactory
import java.io.File
import java.security.MessageDigest

object ContentCache {

    private val logger = LoggerFactory.getLogger("ContentCache")

    /** 缓存根目录 */
    private val cacheDir: File by lazy {
        File(AppConfig.cacheDir, "content").apply { mkdirs() }
    }

    /**
     * 生成缓存文件路径
     * 格式: ~/.legado/cache/content/{hash(bookUrl)}/{hash(chapterUrl)}.txt
     */
    private fun getCacheFile(bookUrl: String, chapterUrl: String): File {
        val bookHash = md5(bookUrl)
        val chapterHash = md5(chapterUrl)
        val dir = File(cacheDir, bookHash).apply { mkdirs() }
        return File(dir, "$chapterHash.txt")
    }

    /** 获取缓存的章节内容 */
    fun get(bookUrl: String, chapterUrl: String): String? {
        val file = getCacheFile(bookUrl, chapterUrl)
        return if (file.exists()) {
            try {
                file.readText(Charsets.UTF_8)
            } catch (e: Exception) {
                logger.warn("读取缓存失败: {}", e.localizedMessage)
                null
            }
        } else null
    }

    /** 保存章节内容到缓存 */
    fun put(bookUrl: String, chapterUrl: String, content: String) {
        try {
            val file = getCacheFile(bookUrl, chapterUrl)
            file.writeText(content, Charsets.UTF_8)
        } catch (e: Exception) {
            logger.warn("写入缓存失败: {}", e.localizedMessage)
        }
    }

    /** 删除单本书的全部缓存 */
    fun clearBook(bookUrl: String) {
        val bookHash = md5(bookUrl)
        val dir = File(cacheDir, bookHash)
        if (dir.exists()) {
            dir.deleteRecursively()
            logger.info("已清除书籍缓存: {}", bookUrl)
        }
    }

    /** 清除全部内容缓存 */
    fun clearAll(): Long {
        var totalSize = 0L
        if (cacheDir.exists()) {
            cacheDir.walkTopDown().forEach { file ->
                if (file.isFile) totalSize += file.length()
            }
            cacheDir.deleteRecursively()
            cacheDir.mkdirs()
            logger.info("已清除全部内容缓存: {} bytes", totalSize)
        }
        return totalSize
    }

    /** 获取缓存总大小（bytes） */
    fun getTotalSize(): Long {
        if (!cacheDir.exists()) return 0
        return cacheDir.walkTopDown().filter { it.isFile }.sumOf { it.length() }
    }

    /** 获取缓存章节数 */
    fun getChapterCount(): Int {
        if (!cacheDir.exists()) return 0
        return cacheDir.walkTopDown().filter { it.isFile }.count()
    }

    /** MD5 哈希（用于路径混淆，非安全用途） */
    private fun md5(input: String): String {
        val md = MessageDigest.getInstance("MD5")
        val digest = md.digest(input.toByteArray(Charsets.UTF_8))
        return digest.joinToString("") { "%02x".format(it) }
    }
}