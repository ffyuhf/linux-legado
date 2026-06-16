/**
 * 替换规则 Repository - CRUD 操作
 *
 * 对齐 Android 版 ReplaceRuleDao 的数据库操作。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.data.repository

import io.legado.data.database.tables.ReplaceRuleTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.statements.UpdateBuilder
import org.jetbrains.exposed.sql.transactions.transaction

object ReplaceRuleRepository {

    /** 获取全部替换规则 */
    fun getAll(): List<ResultRow> = transaction {
        ReplaceRuleTable.selectAll().orderBy(ReplaceRuleTable.sortOrder to SortOrder.ASC).toList()
    }

    /** 按 ID 获取单个规则 */
    fun getById(id: Int): ResultRow? = transaction {
        ReplaceRuleTable.select { ReplaceRuleTable.id eq id }.singleOrNull()
    }

    /** 保存规则（存在则更新） */
    fun save(data: Map<String, Any?>): Int = transaction {
        val ruleId = (data["id"] as? Number)?.toInt()
        if (ruleId != null && ruleId > 0) {
            val exists = ReplaceRuleTable.select { ReplaceRuleTable.id eq ruleId }.count() > 0
            if (exists) {
                ReplaceRuleTable.update({ ReplaceRuleTable.id eq ruleId }) { stmt ->
                    data.forEach { (k, v) -> updateField(stmt, k, v) }
                }
                ruleId
            } else {
                (ReplaceRuleTable.insert { stmt ->
                    data.forEach { (k, v) -> updateField(stmt, k, v) }
                } get ReplaceRuleTable.id)
            }
        } else {
            (ReplaceRuleTable.insert { stmt ->
                data.forEach { (k, v) -> updateField(stmt, k, v) }
            } get ReplaceRuleTable.id)
        }
    }

    /** 按 ID 删除规则 */
    fun deleteById(id: Int) = transaction {
        ReplaceRuleTable.deleteWhere { Op.build { ReplaceRuleTable.id eq id } }
    }

    private fun updateField(stmt: UpdateBuilder<*>, key: String, value: Any?) {
        when (key) {
            "name" -> stmt[ReplaceRuleTable.name] = value as? String ?: ""
            "group" -> stmt[ReplaceRuleTable.group] = value as? String
            "pattern" -> stmt[ReplaceRuleTable.pattern] = value as? String ?: ""
            "replacement" -> stmt[ReplaceRuleTable.replacement] = value as? String ?: ""
            "scope" -> stmt[ReplaceRuleTable.scope] = value as? String
            "scopeTitle" -> stmt[ReplaceRuleTable.scopeTitle] = (value as? Number)?.toInt() ?: 0
            "scopeContent" -> stmt[ReplaceRuleTable.scopeContent] = (value as? Number)?.toInt() ?: 1
            "excludeScope" -> stmt[ReplaceRuleTable.excludeScope] = value as? String
            "isEnabled" -> stmt[ReplaceRuleTable.isEnabled] = (value as? Number)?.toInt() ?: 1
            "isRegex" -> stmt[ReplaceRuleTable.isRegex] = (value as? Number)?.toInt() ?: 1
            "timeoutMillisecond" -> stmt[ReplaceRuleTable.timeoutMillisecond] = (value as? Number)?.toInt() ?: 3000
            "sortOrder" -> stmt[ReplaceRuleTable.sortOrder] = (value as? Number)?.toInt() ?: 0
        }
    }
}