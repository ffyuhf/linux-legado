/**
 * RSS源 Repository - CRUD 操作
 *
 * 对齐 Android 版 RssSourceDao 的数据库操作。
 * 结构与 BookSourceRepository 类似。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.data.repository

import io.legado.data.database.tables.RssSourceTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.statements.UpdateBuilder
import org.jetbrains.exposed.sql.transactions.transaction

object RssSourceRepository {

    /** 获取全部 RSS 源 */
    fun getAll(): List<ResultRow> = transaction {
        RssSourceTable.selectAll().orderBy(RssSourceTable.customOrder to SortOrder.ASC).toList()
    }

    /** 按 URL 获取单个 RSS 源 */
    fun getByUrl(sourceUrl: String): ResultRow? = transaction {
        RssSourceTable.select { RssSourceTable.sourceUrl eq sourceUrl }.singleOrNull()
    }

    /** 获取已启用的 RSS 源 */
    fun getEnabled(): List<ResultRow> = transaction {
        RssSourceTable.select { RssSourceTable.enabled eq 1 }.toList()
    }

    /** 保存 RSS 源（存在则更新） */
    fun save(data: Map<String, Any?>) = transaction {
        val url = data["sourceUrl"] as? String ?: return@transaction
        val exists = RssSourceTable.select { RssSourceTable.sourceUrl eq url }.count() > 0
        if (exists) {
            RssSourceTable.update({ RssSourceTable.sourceUrl eq url }) { stmt ->
                data.forEach { (k, v) -> updateField(stmt, k, v) }
            }
        } else {
            RssSourceTable.insert { stmt ->
                stmt[RssSourceTable.sourceUrl] = url
                data.forEach { (k, v) -> updateField(stmt, k, v) }
            }
        }
    }

    /** 批量保存 */
    fun saveBatch(sources: List<Map<String, Any?>>) = transaction {
        sources.forEach { save(it) }
    }

    /** 按 URL 列表删除 */
    fun deleteByUrls(urls: List<String>) = transaction {
        RssSourceTable.deleteWhere { Op.build { sourceUrl inList urls } }
    }

    @Suppress("UNCHECKED_CAST")
    private fun updateField(stmt: UpdateBuilder<*>, key: String, value: Any?) {
        when (key) {
            "sourceName" -> stmt[RssSourceTable.sourceName] = value as? String ?: ""
            "sourceIcon" -> stmt[RssSourceTable.sourceIcon] = value as? String ?: ""
            "sourceGroup" -> stmt[RssSourceTable.sourceGroup] = value as? String
            "sourceComment" -> stmt[RssSourceTable.sourceComment] = value as? String
            "enabled" -> stmt[RssSourceTable.enabled] = (value as? Number)?.toInt() ?: 1
            "variableComment" -> stmt[RssSourceTable.variableComment] = value as? String
            "jsLib" -> stmt[RssSourceTable.jsLib] = value as? String
            "enabledCookieJar" -> stmt[RssSourceTable.enabledCookieJar] = (value as? Number)?.toInt() ?: 0
            "concurrentRate" -> stmt[RssSourceTable.concurrentRate] = value as? String
            "header" -> stmt[RssSourceTable.header] = value as? String
            "loginUrl" -> stmt[RssSourceTable.loginUrl] = value as? String
            "loginUi" -> stmt[RssSourceTable.loginUi] = value as? String
            "loginCheckJs" -> stmt[RssSourceTable.loginCheckJs] = value as? String
            "coverDecodeJs" -> stmt[RssSourceTable.coverDecodeJs] = value as? String
            "sortUrl" -> stmt[RssSourceTable.sortUrl] = value as? String
            "singleUrl" -> stmt[RssSourceTable.singleUrl] = (value as? Number)?.toInt() ?: 0
            "articleStyle" -> stmt[RssSourceTable.articleStyle] = (value as? Number)?.toInt() ?: 0
            "ruleArticles" -> stmt[RssSourceTable.ruleArticles] = value as? String
            "ruleNextPage" -> stmt[RssSourceTable.ruleNextPage] = value as? String
            "ruleTitle" -> stmt[RssSourceTable.ruleTitle] = value as? String
            "rulePubDate" -> stmt[RssSourceTable.rulePubDate] = value as? String
            "ruleDescription" -> stmt[RssSourceTable.ruleDescription] = value as? String
            "ruleImage" -> stmt[RssSourceTable.ruleImage] = value as? String
            "ruleLink" -> stmt[RssSourceTable.ruleLink] = value as? String
            "ruleContent" -> stmt[RssSourceTable.ruleContent] = value as? String
            "contentWhitelist" -> stmt[RssSourceTable.contentWhitelist] = value as? String
            "contentBlacklist" -> stmt[RssSourceTable.contentBlacklist] = value as? String
            "shouldOverrideUrlLoading" -> stmt[RssSourceTable.shouldOverrideUrlLoading] = value as? String
            "style" -> stmt[RssSourceTable.style] = value as? String
            "enableJs" -> stmt[RssSourceTable.enableJs] = (value as? Number)?.toInt() ?: 1
            "loadWithBaseUrl" -> stmt[RssSourceTable.loadWithBaseUrl] = (value as? Number)?.toInt() ?: 1
            "injectJs" -> stmt[RssSourceTable.injectJs] = value as? String
            "preloadJs" -> stmt[RssSourceTable.preloadJs] = value as? String
            "startHtml" -> stmt[RssSourceTable.startHtml] = value as? String
            "startStyle" -> stmt[RssSourceTable.startStyle] = value as? String
            "startJs" -> stmt[RssSourceTable.startJs] = value as? String
            "showWebLog" -> stmt[RssSourceTable.showWebLog] = (value as? Number)?.toInt() ?: 0
            "lastUpdateTime" -> stmt[RssSourceTable.lastUpdateTime] = (value as? Number)?.toLong() ?: 0L
            "customOrder" -> stmt[RssSourceTable.customOrder] = (value as? Number)?.toInt() ?: 0
            "type" -> stmt[RssSourceTable.type] = (value as? Number)?.toInt() ?: 0
            "preload" -> stmt[RssSourceTable.preload] = (value as? Number)?.toInt() ?: 0
            "cacheFirst" -> stmt[RssSourceTable.cacheFirst] = (value as? Number)?.toInt() ?: 0
            "searchUrl" -> stmt[RssSourceTable.searchUrl] = value as? String
        }
    }
}