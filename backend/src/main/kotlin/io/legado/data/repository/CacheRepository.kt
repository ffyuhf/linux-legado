/**
 * 缓存 Repository - 键值缓存操作
 *
 * 替代 Android 版 CacheManager，使用 SQLite caches 表存储键值对。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.data.repository

import io.legado.data.database.tables.CacheTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

object CacheRepository {

    /** 获取缓存值 */
    fun get(key: String): String? = transaction {
        CacheTable.select { CacheTable.key eq key }
            .singleOrNull()
            ?.get(CacheTable.value)
    }

    /** 设置缓存（存在则更新） */
    fun put(key: String, value: String, deadline: Long = 0L) = transaction {
        val exists = CacheTable.select { CacheTable.key eq key }.count() > 0
        if (exists) {
            CacheTable.update({ CacheTable.key eq key }) {
                it[CacheTable.value] = value
                it[CacheTable.deadline] = deadline
            }
        } else {
            CacheTable.insert {
                it[CacheTable.key] = key
                it[CacheTable.value] = value
                it[CacheTable.deadline] = deadline
            }
        }
    }

    /** 删除缓存 */
    fun delete(key: String) = transaction {
        CacheTable.deleteWhere { Op.build { CacheTable.key eq key } }
    }
}