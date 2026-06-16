/**
 * 路由工具函数 - Exposed ResultRow 转 Map
 *
 * 将数据库查询结果（ResultRow）转为前端可 JSON 序列化的 Map。
 * 所有路由共用此工具，统一转换逻辑。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 * 2026-06-13 19:30 nmb - 新增 rowToBook/rowToBookSource 辅助方法
 */

package io.legado.api.routes

import io.legado.data.entities.Book
import io.legado.data.entities.BookSource
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ResultRow

/**
 * 将 Exposed ResultRow 转为 Map<String, Any?>
 *
 * 遍历 row 的所有字段，提取列名和值。
 * 前端 JSON 序列化时列名与 Android 版数据库字段名一致。
 *
 * @param row 数据库查询结果行
 * @return 字段名到值的映射
 */
fun rowToMap(row: ResultRow): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>()
    @Suppress("UNCHECKED_CAST")
    val rowMap = row as Map<Column<*>, Any?>
    rowMap.forEach { (column, value) ->
        map[column.name] = value
    }
    return map
}

/**
 * 将 Exposed ResultRow 转为 Book 实体（用于从 DB 读出后传给 WebBook 模块）
 */
fun rowToBook(row: ResultRow): Book {
    val map = rowToMap(row)
    return Book(
        bookUrl = map["bookUrl"] as? String ?: "",
        tocUrl = map["tocUrl"] as? String ?: "",
        origin = map["origin"] as? String ?: "",
        originName = map["originName"] as? String ?: "",
        name = map["name"] as? String ?: "",
        author = map["author"] as? String ?: "",
        kind = map["kind"] as? String,
        coverUrl = map["coverUrl"] as? String,
        intro = map["intro"] as? String,
        type = (map["type"] as? Number)?.toInt() ?: 0,
        latestChapterTitle = map["latestChapterTitle"] as? String,
        totalChapterNum = (map["totalChapterNum"] as? Number)?.toInt() ?: 0,
        durChapterIndex = (map["durChapterIndex"] as? Number)?.toInt() ?: 0,
        durChapterPos = (map["durChapterPos"] as? Number)?.toInt() ?: 0,
        durChapterTitle = map["durChapterTitle"] as? String,
        durChapterTime = (map["durChapterTime"] as? Number)?.toLong() ?: 0L,
        wordCount = map["wordCount"] as? String,
        order = (map["order"] as? Number)?.toInt() ?: 0,
        originOrder = (map["originOrder"] as? Number)?.toInt() ?: 0,
        variable = map["variable"] as? String,
        readConfig = map["readConfig"] as? String
    )
}

/**
 * 将 Exposed ResultRow 转为 BookSource 实体（用于从 DB 读出后传给 WebBook 模块）
 */
fun rowToBookSource(row: ResultRow): BookSource {
    val map = rowToMap(row)
    return BookSource(
        bookSourceUrl = map["bookSourceUrl"] as? String ?: "",
        bookSourceName = map["bookSourceName"] as? String ?: "",
        bookSourceType = (map["bookSourceType"] as? Number)?.toInt() ?: 0,
        bookUrlPattern = map["bookUrlPattern"] as? String,
        customOrder = (map["customOrder"] as? Number)?.toInt() ?: 0,
        enabled = (map["enabled"] as? Number)?.toInt() == 1,
        enabledExplore = (map["enabledExplore"] as? Number)?.toInt() == 1,
        header = map["header"] as? String,
        searchUrl = map["searchUrl"] as? String,
        ruleSearch = map["ruleSearch"] as? String,
        ruleBookInfo = map["ruleBookInfo"] as? String,
        ruleToc = map["ruleToc"] as? String,
        ruleContent = map["ruleContent"] as? String,
        ruleExplore = map["ruleExplore"] as? String,
        loginCheckJs = map["loginCheckJs"] as? String,
        enabledCookieJar = (map["enabledCookieJar"] as? Number)?.toInt() == 1,
        concurrentRate = map["concurrentRate"] as? String,
        lastUpdateTime = (map["lastUpdateTime"] as? Number)?.toLong() ?: 0L,
        respondTime = (map["respondTime"] as? Number)?.toLong() ?: 0L
    )
}