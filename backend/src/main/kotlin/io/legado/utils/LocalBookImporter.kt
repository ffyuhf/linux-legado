/**
 * 本地书籍导入器 - 支持 TXT 导入
 *
 * 对齐 Android 版 LocalBook 的导入逻辑。
 * 将本地文本文件导入为书籍，自动切分章节，生成书籍记录。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:29 nmb - 阶段八新增
 */

package io.legado.utils

import io.legado.data.repository.BookChapterRepository
import io.legado.data.repository.BookRepository
import org.slf4j.LoggerFactory
import java.io.File
import java.nio.charset.Charset

object LocalBookImporter {

    private val logger = LoggerFactory.getLogger("LocalBookImporter")

    /** 章节标题正则（匹配 "第X章" 格式） */
    private val CHAPTER_PATTERN = Regex(
        """^(第[一二三四五六七八九十百千零〇0-9]+[章节回卷集部篇].*|^[一二三四五六七八九十]{1,3}[、.\s].*|^Chapter\s+\d+.*|^序章.*|^楔子.*|^尾声.*)""",
        RegexOption.IGNORE_CASE
    )

    /**
     * 导入本地 TXT 文件
     *
     * @param file TXT 文件
     * @param bookName 书名（可选，默认使用文件名）
     * @param author 作者（可选）
     * @param groupId 分组ID（可选）
     * @return 导入的书籍 bookUrl，失败返回 null
     */
    fun importTxt(
        file: File,
        bookName: String? = null,
        author: String? = null,
        groupId: Int = 0
    ): Map<String, Any?>? {
        try {
            val name = bookName?.takeIf { it.isNotBlank() }
                ?: file.nameWithoutExtension
            val bookUrl = "loc_book://${name}_${author ?: "未知"}"

            // 检测文件编码并读取内容
            val content = readFileContent(file)
            val chapters = splitChapters(content, bookUrl)

            // 保存书籍记录
            val bookData = mapOf(
                "bookUrl" to bookUrl,
                "origin" to "loc_book",
                "originName" to "本地导入",
                "name" to name,
                "author" to (author ?: "未知"),
                "type" to 0,
                "group" to groupId,
                "coverUrl" to "",
                "intro" to "本地导入书籍",
                "totalChapterNum" to chapters.size,
                "durChapterTime" to System.currentTimeMillis(),
                "lastCheckTime" to System.currentTimeMillis()
            )
            BookRepository.save(bookData)

            // 保存章节
            BookChapterRepository.deleteByBookUrl(bookUrl)
            BookChapterRepository.insertBatch(chapters)

            logger.info("本地书籍导入成功: {} ({}章)", name, chapters.size)
            return bookData
        } catch (e: Exception) {
            logger.error("本地书籍导入失败: {}", e.localizedMessage)
            return null
        }
    }

    /**
     * 从 Base64 字符串导入
     *
     * @param fileName 文件名（含扩展名，用于判断类型）
     * @param base64 文件内容的 Base64 编码
     * @param bookName 书名（可选）
     * @param author 作者（可选）
     * @param groupId 分组ID（可选）
     */
    fun importFromBase64(
        fileName: String,
        base64: String,
        bookName: String? = null,
        author: String? = null,
        groupId: Int = 0
    ): Map<String, Any?>? {
        return try {
            val bytes = java.util.Base64.getDecoder().decode(base64)
            val tempFile = File.createTempFile("legado_import_", "_${fileName}")
            tempFile.writeBytes(bytes)
            val result = importTxt(tempFile, bookName, author, groupId)
            tempFile.delete()
            result
        } catch (e: Exception) {
            logger.error("Base64导入失败: {}", e.localizedMessage)
            null
        }
    }

    /**
     * 读取文件内容（自动检测编码）
     * 优先尝试 UTF-8，失败则尝试 GBK
     */
    private fun readFileContent(file: File): String {
        val bytes = file.readBytes()
        // 尝试 UTF-8
        val utf8 = try { String(bytes, Charsets.UTF_8) } catch (_: Exception) { null }
        if (utf8 != null && !hasMojibake(utf8)) return utf8
        // 回退到 GBK
        return try {
            String(bytes, Charset.forName("GBK"))
        } catch (_: Exception) {
            utf8 ?: String(bytes, Charsets.ISO_8859_1)
        }
    }

    /** 检测是否有乱码特征（大量替换字符） */
    private fun hasMojibake(text: String): Boolean {
        if (text.isEmpty()) return false
        val replacementCount = text.count { it == '\uFFFD' }
        return replacementCount.toDouble() / text.length > 0.01
    }

    /**
     * 将正文按章节标题切分
     *
     * @param content 全文内容
     * @param bookUrl 书籍URL（用于章节关联）
     * @return 章节列表（Map 格式，可直接入库）
     */
    private fun splitChapters(content: String, bookUrl: String): List<Map<String, Any?>> {
        val lines = content.split("\n", "\r\n")
        val chapters = mutableListOf<Map<String, Any?>>()
        val currentText = StringBuilder()
        var currentTitle = "开始"
        var index = 0

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed.isNotEmpty() && CHAPTER_PATTERN.matches(trimmed) && currentText.isNotEmpty()) {
                // 保存上一章
                chapters.add(buildChapter(currentTitle, currentText.toString(), bookUrl, index++))
                currentTitle = trimmed
                currentText.clear()
            } else {
                if (currentText.isNotEmpty() || trimmed.isNotEmpty()) {
                    currentText.append(line).append("\n")
                }
            }
        }
        // 保存最后一章
        if (currentText.isNotEmpty()) {
            chapters.add(buildChapter(currentTitle, currentText.toString(), bookUrl, index))
        }

        // 如果没有识别到章节标题，按字数切分（每5000字一章）
        if (chapters.isEmpty() && content.isNotEmpty()) {
            val chunkSize = 5000
            val chunks = content.chunked(chunkSize)
            chunks.forEachIndexed { i, chunk ->
                chapters.add(buildChapter("第${i + 1}节", chunk, bookUrl, i))
            }
        }

        return chapters
    }

    /** 构造章节 Map */
    private fun buildChapter(title: String, content: String, bookUrl: String, index: Int): Map<String, Any?> {
        val wordCount = content.filter { !it.isWhitespace() }.length
        return mapOf(
            "url" to "$bookUrl#$index",
            "title" to title.ifBlank { "第${index + 1}章" },
            "isVolume" to 0,
            "baseUrl" to "",
            "bookUrl" to bookUrl,
            "index" to index,
            "isVip" to 0,
            "isPay" to 0,
            "resourceUrl" to null,
            "tag" to null,
            "wordCount" to wordCount.toString(),
            "imgUrl" to null
        )
    }
}