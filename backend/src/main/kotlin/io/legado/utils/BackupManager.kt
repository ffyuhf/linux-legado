/**
 * 备份恢复管理器 - 导出/导入应用数据
 *
 * 对齐 Android 版 BackupManager 的备份逻辑。
 * 将数据库（书籍/章节/书源/分组/替换规则/RSS源）和配置文件打包为 zip。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:30 nmb - 阶段八新增
 */

package io.legado.utils

import io.legado.AppConfig
import io.legado.data.repository.BookGroupRepository
import io.legado.data.repository.BookRepository
import io.legado.data.repository.BookSourceRepository
import io.legado.data.repository.ReplaceRuleRepository
import io.legado.data.repository.RssSourceRepository
import io.legado.model.GSON
import org.slf4j.LoggerFactory
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

object BackupManager {

    private val logger = LoggerFactory.getLogger("BackupManager")

    /** 备份文件中的 JSON 数据文件名 */
    private const val FILE_BOOKS = "books.json"
    private const val FILE_SOURCES = "bookSources.json"
    private const val FILE_RSS = "rssSources.json"
    private const val FILE_GROUPS = "bookGroups.json"
    private const val FILE_REPLACE_RULES = "replaceRules.json"
    private const val FILE_CONFIGS = "configs.json"

    /**
     * 创建备份（返回 zip 字节数组）
     *
     * @param includeBooks 是否包含书籍数据
     * @param includeSources 是否包含书源
     * @param includeConfigs 是否包含配置
     * @return zip 文件字节数组
     */
    fun createBackup(
        includeBooks: Boolean = true,
        includeSources: Boolean = true,
        includeConfigs: Boolean = true
    ): ByteArray {
        val baos = ByteArrayOutputStream()
        ZipOutputStream(baos).use { zip ->
            if (includeBooks) {
                val books = BookRepository.getAll().map { rowToMap(it) }
                writeToZip(zip, FILE_BOOKS, GSON.toJson(books))

                val groups = BookGroupRepository.getAll().map { rowToMap(it) }
                writeToZip(zip, FILE_GROUPS, GSON.toJson(groups))

                val replaceRules = ReplaceRuleRepository.getAll().map { rowToMap(it) }
                writeToZip(zip, FILE_REPLACE_RULES, GSON.toJson(replaceRules))
            }
            if (includeSources) {
                val sources = BookSourceRepository.getAll().map { rowToMap(it) }
                writeToZip(zip, FILE_SOURCES, GSON.toJson(sources))

                val rssSources = RssSourceRepository.getAll().map { rowToMap(it) }
                writeToZip(zip, FILE_RSS, GSON.toJson(rssSources))
            }
            if (includeConfigs) {
                val configDir = File(AppConfig.dataDir, "config")
                val configs = mutableMapOf<String, String>()
                configDir.listFiles()?.forEach { file ->
                    if (file.isFile && file.extension == "json") {
                        configs[file.name] = file.readText()
                    }
                }
                writeToZip(zip, FILE_CONFIGS, GSON.toJson(configs))
            }
        }
        logger.info("备份创建完成: {} bytes", baos.size())
        return baos.toByteArray()
    }

    /**
     * 从备份恢复
     *
     * @param zipData zip 文件字节数组
     * @return 恢复统计 { books: Int, sources: Int, configs: Int }
     */
    fun restoreBackup(zipData: ByteArray): Map<String, Int> {
        var bookCount = 0
        var sourceCount = 0
        var configCount = 0

        ZipInputStream(ByteArrayInputStream(zipData)).use { zip ->
            var entry = zip.nextEntry
            while (entry != null) {
                val content = zip.readBytes().toString(Charsets.UTF_8)
                when (entry.name) {
                    FILE_BOOKS -> {
                        @Suppress("UNCHECKED_CAST")
                        val books = GSON.fromJson(content, List::class.java) as List<Map<String, Any?>>
                        books.forEach { BookRepository.save(it) }
                        bookCount = books.size
                    }
                    FILE_SOURCES -> {
                        @Suppress("UNCHECKED_CAST")
                        val sources = GSON.fromJson(content, List::class.java) as List<Map<String, Any?>>
                        sources.forEach { BookSourceRepository.save(it) }
                        sourceCount += sources.size
                    }
                    FILE_RSS -> {
                        @Suppress("UNCHECKED_CAST")
                        val rssList = GSON.fromJson(content, List::class.java) as List<Map<String, Any?>>
                        rssList.forEach { RssSourceRepository.save(it) }
                        sourceCount += rssList.size
                    }
                    FILE_GROUPS -> {
                        @Suppress("UNCHECKED_CAST")
                        val groups = GSON.fromJson(content, List::class.java) as List<Map<String, Any?>>
                        groups.forEach { BookGroupRepository.save(it) }
                    }
                    FILE_REPLACE_RULES -> {
                        @Suppress("UNCHECKED_CAST")
                        val rules = GSON.fromJson(content, List::class.java) as List<Map<String, Any?>>
                        rules.forEach { ReplaceRuleRepository.save(it) }
                    }
                    FILE_CONFIGS -> {
                        @Suppress("UNCHECKED_CAST")
                        val configs = GSON.fromJson(content, Map::class.java) as Map<String, String>
                        val configDir = File(AppConfig.dataDir, "config").apply { mkdirs() }
                        configs.forEach { (fileName, fileContent) ->
                            File(configDir, fileName).writeText(fileContent)
                            configCount++
                        }
                    }
                }
                zip.closeEntry()
                entry = zip.nextEntry
            }
        }
        logger.info("备份恢复完成: books={} sources={} configs={}", bookCount, sourceCount, configCount)
        return mapOf("books" to bookCount, "sources" to sourceCount, "configs" to configCount)
    }

    /** 将字符串写入 zip 条目 */
    private fun writeToZip(zip: ZipOutputStream, name: String, content: String) {
        zip.putNextEntry(ZipEntry(name))
        zip.write(content.toByteArray(Charsets.UTF_8))
        zip.closeEntry()
    }

    /** ResultRow 转 Map（通用，用于序列化备份） */
    private fun rowToMap(row: org.jetbrains.exposed.sql.ResultRow): Map<String, Any?> {
        // Exposed 的 ResultRow 无 toValues()，按列名提取（与 RouteUtils.rowToMap 同逻辑）
        val map = mutableMapOf<String, Any?>()
        @Suppress("UNCHECKED_CAST")
        val rowMap = row as Map<org.jetbrains.exposed.sql.Column<*>, Any?>
        rowMap.forEach { (column, value) ->
            map[column.name] = value
        }
        return map
    }
}