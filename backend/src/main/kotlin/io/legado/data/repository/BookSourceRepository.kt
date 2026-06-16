/**
 * 书源 Repository - 书源 CRUD 操作
 *
 * 对齐 Android 版 BookSourceDao 的数据库操作，
 * 提供书源的增删改查功能。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.data.repository

import io.legado.data.database.tables.BookSourceTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.statements.UpdateBuilder
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

object BookSourceRepository {

    private val logger = LoggerFactory.getLogger(BookSourceRepository::class.java)

    /**
     * 获取所有书源
     * @return 书源列表（ResultRow）
     */
    fun getAll(): List<ResultRow> = transaction {
        BookSourceTable.selectAll().orderBy(BookSourceTable.customOrder to SortOrder.ASC).toList()
    }

    /**
     * 按 URL 获取单个书源
     * @param bookSourceUrl 书源URL
     */
    fun getByUrl(bookSourceUrl: String): ResultRow? = transaction {
        BookSourceTable.select { BookSourceTable.bookSourceUrl eq bookSourceUrl }.singleOrNull()
    }

    /**
     * 按 URL 列表获取书源
     */
    fun getByUrls(urls: List<String>): List<ResultRow> = transaction {
        BookSourceTable.select { BookSourceTable.bookSourceUrl inList urls }.toList()
    }

    /**
     * 获取已启用的书源
     */
    fun getEnabled(): List<ResultRow> = transaction {
        BookSourceTable.select { BookSourceTable.enabled eq 1 }.toList()
    }

    /**
     * 保存单个书源（存在则更新，不存在则插入）
     * @param data 书源字段映射
     */
    fun save(data: Map<String, Any?>) = transaction {
        val url = data["bookSourceUrl"] as? String ?: return@transaction
        val exists = BookSourceTable.select { BookSourceTable.bookSourceUrl eq url }.count() > 0
        if (exists) {
            BookSourceTable.update({ BookSourceTable.bookSourceUrl eq url }) { statement ->
                data.forEach { (key, value) -> updateField(statement, key, value) }
            }
        } else {
            BookSourceTable.insert { statement ->
                statement[BookSourceTable.bookSourceUrl] = url
                data.forEach { (key, value) -> updateField(statement, key, value) }
            }
        }
    }

    /**
     * 批量保存书源
     */
    fun saveBatch(sources: List<Map<String, Any?>>) = transaction {
        sources.forEach { save(it) }
    }

    /**
     * 按 URL 列表删除书源
     */
    fun deleteByUrls(urls: List<String>) = transaction {
        BookSourceTable.deleteWhere { Op.build { bookSourceUrl inList urls } }
    }

    /**
     * 根据 InsertStatement/UpdateBuilder 动态设置字段值
     */
    private fun updateField(statement: UpdateBuilder<*>, key: String, value: Any?) {
        @Suppress("UNCHECKED_CAST")
        when (key) {
            "bookSourceName" -> statement[BookSourceTable.bookSourceName] = value as String
            "bookSourceGroup" -> statement[BookSourceTable.bookSourceGroup] = value as? String
            "bookSourceType" -> statement[BookSourceTable.bookSourceType] = (value as Number).toInt()
            "bookUrlPattern" -> statement[BookSourceTable.bookUrlPattern] = value as? String
            "customOrder" -> statement[BookSourceTable.customOrder] = (value as? Number)?.toInt() ?: 0
            "enabled" -> statement[BookSourceTable.enabled] = (value as? Number)?.toInt() ?: 1
            "enabledExplore" -> statement[BookSourceTable.enabledExplore] = (value as? Number)?.toInt() ?: 1
            "jsLib" -> statement[BookSourceTable.jsLib] = value as? String
            "enabledCookieJar" -> statement[BookSourceTable.enabledCookieJar] = (value as? Number)?.toInt() ?: 0
            "concurrentRate" -> statement[BookSourceTable.concurrentRate] = value as? String
            "header" -> statement[BookSourceTable.header] = value as? String
            "loginUrl" -> statement[BookSourceTable.loginUrl] = value as? String
            "loginUi" -> statement[BookSourceTable.loginUi] = value as? String
            "loginCheckJs" -> statement[BookSourceTable.loginCheckJs] = value as? String
            "coverDecodeJs" -> statement[BookSourceTable.coverDecodeJs] = value as? String
            "bookSourceComment" -> statement[BookSourceTable.bookSourceComment] = value as? String
            "variableComment" -> statement[BookSourceTable.variableComment] = value as? String
            "lastUpdateTime" -> statement[BookSourceTable.lastUpdateTime] = (value as? Number)?.toLong() ?: 0L
            "respondTime" -> statement[BookSourceTable.respondTime] = (value as? Number)?.toLong() ?: 0L
            "weight" -> statement[BookSourceTable.weight] = (value as? Number)?.toInt() ?: 0
            "exploreUrl" -> statement[BookSourceTable.exploreUrl] = value as? String
            "exploreScreen" -> statement[BookSourceTable.exploreScreen] = value as? String
            "ruleExplore" -> statement[BookSourceTable.ruleExplore] = value as? String
            "searchUrl" -> statement[BookSourceTable.searchUrl] = value as? String
            "ruleSearch" -> statement[BookSourceTable.ruleSearch] = value as? String
            "ruleBookInfo" -> statement[BookSourceTable.ruleBookInfo] = value as? String
            "ruleToc" -> statement[BookSourceTable.ruleToc] = value as? String
            "ruleContent" -> statement[BookSourceTable.ruleContent] = value as? String
            "ruleReview" -> statement[BookSourceTable.ruleReview] = value as? String
            "eventListener" -> statement[BookSourceTable.eventListener] = (value as? Number)?.toInt() ?: 0
            "customButton" -> statement[BookSourceTable.customButton] = (value as? Number)?.toInt() ?: 0
        }
    }
}