/**
 * 章节 Repository - 章节查询操作
 *
 * 对齐 Android 版 BookChapterDao 的数据库操作。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.data.repository

import io.legado.data.database.tables.BookChapterTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

object BookChapterRepository {

    /**
     * 获取指定书籍的全部章节列表
     * @param bookUrl 书籍URL
     */
    fun getByBookUrl(bookUrl: String): List<ResultRow> = transaction {
        BookChapterTable.select { BookChapterTable.bookUrl eq bookUrl }
            .orderBy(BookChapterTable.index to SortOrder.ASC)
            .toList()
    }

    /**
     * 获取指定书籍的单个章节
     * @param bookUrl 书籍URL
     * @param index 章节序号
     */
    fun getChapter(bookUrl: String, index: Int): ResultRow? = transaction {
        BookChapterTable.select {
            (BookChapterTable.bookUrl eq bookUrl) and (BookChapterTable.index eq index)
        }.singleOrNull()
    }

    /**
     * 删除指定书籍的全部章节
     */
    fun deleteByBookUrl(bookUrl: String) = transaction {
        BookChapterTable.deleteWhere { Op.build { BookChapterTable.bookUrl eq bookUrl } }
    }

    /**
     * 批量插入章节
     * @param chapters 章节字段映射列表
     */
    fun insertBatch(chapters: List<Map<String, Any?>>) = transaction {
        BookChapterTable.batchInsert(chapters) { data ->
            // BUG 修复: 全部改为安全类型转换，避免 Gson 反序列化值类型不确定导致的 NPE/CCE
            data.forEach { (k, v) ->
                when (k) {
                    "url" -> this[BookChapterTable.url] = v as? String ?: ""
                    "title" -> this[BookChapterTable.title] = v as? String ?: ""
                    "isVolume" -> this[BookChapterTable.isVolume] = (v as? Number)?.toInt() ?: 0
                    "baseUrl" -> this[BookChapterTable.baseUrl] = v as? String ?: ""
                    "bookUrl" -> this[BookChapterTable.bookUrl] = v as? String ?: ""
                    "index" -> this[BookChapterTable.index] = (v as? Number)?.toInt() ?: 0
                    "isVip" -> this[BookChapterTable.isVip] = (v as? Number)?.toInt() ?: 0
                    "isPay" -> this[BookChapterTable.isPay] = (v as? Number)?.toInt() ?: 0
                    "resourceUrl" -> this[BookChapterTable.resourceUrl] = v as? String
                    "tag" -> this[BookChapterTable.tag] = v as? String
                    "wordCount" -> this[BookChapterTable.wordCount] = v as? String
                    "start" -> this[BookChapterTable.start] = (v as? Number)?.toLong()
                    "end" -> this[BookChapterTable.end] = (v as? Number)?.toLong()
                    "startFragmentId" -> this[BookChapterTable.startFragmentId] = v as? String
                    "endFragmentId" -> this[BookChapterTable.endFragmentId] = v as? String
                    "variable" -> this[BookChapterTable.variable] = v as? String
                    "imgUrl" -> this[BookChapterTable.imgUrl] = v as? String
                }
            }
        }
    }
}