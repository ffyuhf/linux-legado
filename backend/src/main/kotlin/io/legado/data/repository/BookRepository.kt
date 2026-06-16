/**
 * 书籍 Repository - 书架 CRUD 操作
 *
 * 对齐 Android 版 BookDao 的数据库操作，
 * 提供书籍的增删改查和阅读进度保存功能。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.data.repository

import io.legado.data.database.tables.BookTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.statements.UpdateBuilder
import org.jetbrains.exposed.sql.transactions.transaction

object BookRepository {

    /**
     * 获取书架所有书籍
     */
    fun getAll(): List<ResultRow> = transaction {
        BookTable.selectAll().orderBy(BookTable.durChapterTime to SortOrder.DESC).toList()
    }

    /**
     * 按 bookUrl 获取单本书籍
     */
    fun getByUrl(bookUrl: String): ResultRow? = transaction {
        BookTable.select { BookTable.bookUrl eq bookUrl }.singleOrNull()
    }

    /**
     * 按书名+作者查找书籍
     */
    fun getByNameAndAuthor(name: String, author: String): ResultRow? = transaction {
        BookTable.select {
            (BookTable.name eq name) and (BookTable.author eq author)
        }.singleOrNull()
    }

    /**
     * 保存书籍（存在则更新）
     * @param data 书籍字段映射（从 JSON 反序列化而来）
     */
    fun save(data: Map<String, Any?>) = transaction {
        val url = data["bookUrl"] as? String ?: return@transaction
        val exists = BookTable.select { BookTable.bookUrl eq url }.count() > 0
        if (exists) {
            BookTable.update({ BookTable.bookUrl eq url }) { stmt ->
                data.forEach { (k, v) -> updateField(stmt, k, v) }
            }
        } else {
            BookTable.insert { stmt ->
                stmt[BookTable.bookUrl] = url
                data.forEach { (k, v) -> updateField(stmt, k, v) }
            }
        }
    }

    /**
     * 删除书籍
     */
    fun delete(bookUrl: String) = transaction {
        BookTable.deleteWhere { Op.build { BookTable.bookUrl eq bookUrl } }
    }

    /**
     * 更新阅读进度
     */
    fun updateProgress(
        bookUrl: String,
        durChapterIndex: Int,
        durChapterPos: Int,
        durChapterTitle: String,
        durChapterTime: Long
    ) = transaction {
        BookTable.update({ BookTable.bookUrl eq bookUrl }) {
            it[BookTable.durChapterIndex] = durChapterIndex
            it[BookTable.durChapterPos] = durChapterPos
            it[BookTable.durChapterTitle] = durChapterTitle
            it[BookTable.durChapterTime] = durChapterTime
        }
    }

    /** 动态设置字段值 */
    private fun updateField(stmt: UpdateBuilder<*>, key: String, value: Any?) {
        when (key) {
            "tocUrl" -> stmt[BookTable.tocUrl] = value as? String ?: ""
            "origin" -> stmt[BookTable.origin] = value as? String ?: "loc_book"
            "originName" -> stmt[BookTable.originName] = value as? String ?: ""
            "name" -> stmt[BookTable.name] = value as? String ?: ""
            "author" -> stmt[BookTable.author] = value as? String ?: ""
            "kind" -> stmt[BookTable.kind] = value as? String
            "customTag" -> stmt[BookTable.customTag] = value as? String
            "coverUrl" -> stmt[BookTable.coverUrl] = value as? String
            "customCoverUrl" -> stmt[BookTable.customCoverUrl] = value as? String
            "intro" -> stmt[BookTable.intro] = value as? String
            "customIntro" -> stmt[BookTable.customIntro] = value as? String
            "charset" -> stmt[BookTable.charset] = value as? String
            "type" -> stmt[BookTable.type] = (value as? Number)?.toInt() ?: 0
            "group" -> stmt[BookTable.group] = (value as? Number)?.toInt() ?: 0
            "latestChapterTitle" -> stmt[BookTable.latestChapterTitle] = value as? String
            "latestChapterTime" -> stmt[BookTable.latestChapterTime] = (value as? Number)?.toLong() ?: 0L
            "lastCheckTime" -> stmt[BookTable.lastCheckTime] = (value as? Number)?.toLong() ?: 0L
            "lastCheckCount" -> stmt[BookTable.lastCheckCount] = (value as? Number)?.toInt() ?: 0
            "totalChapterNum" -> stmt[BookTable.totalChapterNum] = (value as? Number)?.toInt() ?: 0
            "durChapterTitle" -> stmt[BookTable.durChapterTitle] = value as? String
            "durChapterIndex" -> stmt[BookTable.durChapterIndex] = (value as? Number)?.toInt() ?: 0
            "durVolumeIndex" -> stmt[BookTable.durVolumeIndex] = (value as? Number)?.toInt() ?: 0
            "chapterInVolumeIndex" -> stmt[BookTable.chapterInVolumeIndex] = (value as? Number)?.toInt() ?: 0
            "durChapterPos" -> stmt[BookTable.durChapterPos] = (value as? Number)?.toInt() ?: 0
            "durChapterTime" -> stmt[BookTable.durChapterTime] = (value as? Number)?.toLong() ?: 0L
            "wordCount" -> stmt[BookTable.wordCount] = value as? String
            "canUpdate" -> stmt[BookTable.canUpdate] = (value as? Number)?.toInt() ?: 1
            "order" -> stmt[BookTable.order] = (value as? Number)?.toInt() ?: 0
            "originOrder" -> stmt[BookTable.originOrder] = (value as? Number)?.toInt() ?: 0
            "variable" -> stmt[BookTable.variable] = value as? String
            "readConfig" -> stmt[BookTable.readConfig] = value as? String
            "syncTime" -> stmt[BookTable.syncTime] = (value as? Number)?.toLong() ?: 0L
        }
    }
}