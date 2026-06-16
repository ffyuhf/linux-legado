/**
 * 书籍分组 Repository - 分组 CRUD 操作
 *
 * 对齐 Android 版 BookGroupDao 的数据库操作。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:28 nmb - 阶段八新增
 */

package io.legado.data.repository

import io.legado.data.database.tables.BookGroupTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

object BookGroupRepository {

    /** 获取全部分组（按 order 排序） */
    fun getAll(): List<ResultRow> = transaction {
        BookGroupTable.selectAll().orderBy(BookGroupTable.order to SortOrder.ASC).toList()
    }

    /** 按 groupId 获取单个分组 */
    fun getById(groupId: Int): ResultRow? = transaction {
        BookGroupTable.select { BookGroupTable.groupId eq groupId }.singleOrNull()
    }

    /** 保存分组（存在则更新） */
    fun save(data: Map<String, Any?>): Int = transaction {
        val groupId = (data["groupId"] as? Number)?.toInt()
            ?: (BookGroupTable.selectAll().map { it[BookGroupTable.groupId] }.maxOrNull() ?: -1) + 1
        val exists = BookGroupTable.select { BookGroupTable.groupId eq groupId }.count() > 0
        if (exists) {
            BookGroupTable.update({ BookGroupTable.groupId eq groupId }) { stmt ->
                (data["groupName"] as? String)?.let { stmt[BookGroupTable.groupName] = it }
                (data["cover"] as? String)?.let { stmt[BookGroupTable.cover] = it }
                (data["order"] as? Number)?.let { stmt[BookGroupTable.order] = it.toInt() }
                (data["enableRefresh"] as? Number)?.let { stmt[BookGroupTable.enableRefresh] = it.toInt() }
                (data["show"] as? Number)?.let { stmt[BookGroupTable.show] = it.toInt() }
                (data["bookSort"] as? Number)?.let { stmt[BookGroupTable.bookSort] = it.toInt() }
                (data["onlyUpdateRead"] as? Number)?.let { stmt[BookGroupTable.onlyUpdateRead] = it.toInt() }
            }
        } else {
            BookGroupTable.insert { stmt ->
                stmt[BookGroupTable.groupId] = groupId
                stmt[BookGroupTable.groupName] = data["groupName"] as? String ?: ""
                stmt[BookGroupTable.cover] = data["cover"] as? String
                stmt[BookGroupTable.order] = (data["order"] as? Number)?.toInt() ?: 0
                stmt[BookGroupTable.enableRefresh] = (data["enableRefresh"] as? Number)?.toInt() ?: 1
                stmt[BookGroupTable.show] = (data["show"] as? Number)?.toInt() ?: 1
                stmt[BookGroupTable.bookSort] = (data["bookSort"] as? Number)?.toInt() ?: -1
                stmt[BookGroupTable.onlyUpdateRead] = (data["onlyUpdateRead"] as? Number)?.toInt() ?: 0
            }
        }
        groupId
    }

    /** 批量保存分组 */
    fun saveAll(groups: List<Map<String, Any?>>): List<Int> = transaction {
        groups.map { save(it) }
    }

    /** 删除分组 */
    fun delete(groupId: Int) = transaction {
        BookGroupTable.deleteWhere { BookGroupTable.groupId eq groupId }
    }

    /** 更新分组顺序 */
    fun updateOrder(orders: List<Int>) = transaction {
        orders.forEachIndexed { index, groupId ->
            BookGroupTable.update({ BookGroupTable.groupId eq groupId }) {
                it[BookGroupTable.order] = index
            }
        }
    }
}