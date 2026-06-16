/**
 * 搜索历史 Repository - 搜索关键词历史记录管理
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:28 nmb - 阶段八新增
 */

package io.legado.data.repository

import io.legado.data.database.tables.SearchHistoryTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

object SearchHistoryRepository {

    /** 获取搜索历史（按时间倒序，最多100条） */
    fun getAll(): List<ResultRow> = transaction {
        SearchHistoryTable.selectAll()
            .orderBy(SearchHistoryTable.time to SortOrder.DESC)
            .limit(100)
            .toList()
    }

    /** 保存搜索关键词（重复则更新时间） */
    fun save(word: String) = transaction {
        val now = System.currentTimeMillis()
        val exists = SearchHistoryTable.select { SearchHistoryTable.word eq word }.singleOrNull()
        if (exists != null) {
            SearchHistoryTable.update({ SearchHistoryTable.word eq word }) {
                it[SearchHistoryTable.time] = now
            }
        } else {
            SearchHistoryTable.insert {
                it[SearchHistoryTable.word] = word
                it[SearchHistoryTable.time] = now
            }
        }
    }

    /** 清除全部搜索历史 */
    fun clearAll() = transaction {
        SearchHistoryTable.deleteAll()
    }

    /** 删除单条搜索历史 */
    fun delete(word: String) = transaction {
        SearchHistoryTable.deleteWhere { SearchHistoryTable.word eq word }
    }
}