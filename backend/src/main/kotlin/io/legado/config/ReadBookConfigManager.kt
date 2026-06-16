/**
 * 排版配置管理器 - 对齐 Android ReadBookConfig
 *
 * 管理多个排版方案（日间/夜间/EInk），支持方案列表 CRUD 和共享配置。
 * 通过 ReadConfigTable 持久化，与 appSettings 中的 readStyleSelect 配合。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:29 nmb - 阶段八新增
 */

package io.legado.config

import io.legado.data.database.tables.ReadConfigTable
import io.legado.model.GSON
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

object ReadBookConfigManager {

    private val logger = LoggerFactory.getLogger("ReadBookConfigManager")

    /** 初始化默认排版方案（首次启动时调用） */
    fun initDefaults() = transaction {
        val count = ReadConfigTable.selectAll().count()
        if (count > 0) return@transaction

        // 插入6个默认方案（索引0-4为普通，5为共享）
        val defaults = listOf(
            configMap("羊皮纸", "#EEEEEE", "#000000", "#FFFFFF", "#3E3D3B", "#ADADAD", "#000000"),
            configMap("护眼绿", "#C7EDCC", "#000000", "#FFFFFF", "#3E3D3B", "#ADADAD", "#000000"),
            configMap("白纸黑字", "#FFFFFF", "#000000", "#FFFFFF", "#000000", "#ADADAD", "#000000"),
            configMap("暗夜", "#1A1A1A", "#000000", "#FFFFFF", "#AAAAAA", "#ADADAD", "#000000"),
            configMap("经典", "#F5F5DC", "#000000", "#FFFFFF", "#2F2F2F", "#ADADAD", "#000000"),
            configMap("共享", "#EEEEEE", "#000000", "#FFFFFF", "#3E3D3B", "#ADADAD", "#000000", styleType = 1)
        )
        defaults.forEach { cfg -> ReadConfigTable.insert { row -> mapToRow(row, cfg) } }
        logger.info("排版配置初始化完成: ${defaults.size} 个默认方案")
    }

    /** 获取全部排版方案 */
    fun getAll(): List<Map<String, Any?>> = transaction {
        ReadConfigTable.selectAll().orderBy(ReadConfigTable.id to SortOrder.ASC).map { rowToMap(it) }
    }

    /** 获取普通方案列表（styleType=0） */
    fun getStyleList(): List<Map<String, Any?>> = transaction {
        ReadConfigTable.select { ReadConfigTable.styleType eq 0 }
            .orderBy(ReadConfigTable.id to SortOrder.ASC).map { rowToMap(it) }
    }

    /** 获取共享方案（styleType=1） */
    fun getShareConfig(): Map<String, Any?> = transaction {
        ReadConfigTable.select { ReadConfigTable.styleType eq 1 }
            .orderBy(ReadConfigTable.id to SortOrder.ASC).firstOrNull()?.let { rowToMap(it) }
            ?: emptyMap()
    }

    /** 保存排版方案（存在则更新） */
    fun save(config: Map<String, Any?>): Int = transaction {
        val id = (config["id"] as? Number)?.toInt()
        if (id != null) {
            ReadConfigTable.update({ ReadConfigTable.id eq id }) { row -> mapToRow(row, config) }
            id
        } else {
            ReadConfigTable.insert { row -> mapToRow(row, config) } get ReadConfigTable.id
        }
    }

    /** 删除排版方案 */
    fun delete(index: Int) = transaction {
        val row = ReadConfigTable.select { ReadConfigTable.styleType eq 0 }
            .orderBy(ReadConfigTable.id to SortOrder.ASC).elementAtOrNull(index)
        row?.let {
            if (getStyleCount() > 1) {
                // deleteWhere 的 lambda receiver 是 SqlExpressionBuilder，会遮蔽外层 it
                val rowId = it[ReadConfigTable.id]
                ReadConfigTable.deleteWhere { ReadConfigTable.id eq rowId }
                true
            } else false
        } ?: false
    }

    /** 获取普通方案数量 */
    private fun getStyleCount(): Long = transaction {
        ReadConfigTable.select { ReadConfigTable.styleType eq 0 }.count()
    }

    /** 将数据库行转为 Map */
    private fun rowToMap(row: ResultRow): Map<String, Any?> = mapOf(
        "id" to row[ReadConfigTable.id],
        "name" to row[ReadConfigTable.name],
        "styleType" to row[ReadConfigTable.styleType],
        "bgStr" to row[ReadConfigTable.bgStr],
        "bgStrNight" to row[ReadConfigTable.bgStrNight],
        "bgStrEInk" to row[ReadConfigTable.bgStrEInk],
        "bgAlpha" to row[ReadConfigTable.bgAlpha],
        "bgType" to row[ReadConfigTable.bgType],
        "bgTypeNight" to row[ReadConfigTable.bgTypeNight],
        "bgTypeEInk" to row[ReadConfigTable.bgTypeEInk],
        "textColor" to row[ReadConfigTable.textColor],
        "textColorNight" to row[ReadConfigTable.textColorNight],
        "textColorEInk" to row[ReadConfigTable.textColorEInk],
        "textAccentColor" to row[ReadConfigTable.textAccentColor],
        "textAccentColorNight" to row[ReadConfigTable.textAccentColorNight],
        "textAccentColorEInk" to row[ReadConfigTable.textAccentColorEInk],
        "darkStatusIcon" to row[ReadConfigTable.darkStatusIcon],
        "darkStatusIconNight" to row[ReadConfigTable.darkStatusIconNight],
        "darkStatusIconEInk" to row[ReadConfigTable.darkStatusIconEInk],
        "pageAnim" to row[ReadConfigTable.pageAnim],
        "pageAnimEInk" to row[ReadConfigTable.pageAnimEInk],
        "textFont" to row[ReadConfigTable.textFont],
        "textBold" to row[ReadConfigTable.textBold],
        "textSize" to row[ReadConfigTable.textSize],
        "letterSpacing" to row[ReadConfigTable.letterSpacing],
        "lineSpacingExtra" to row[ReadConfigTable.lineSpacingExtra],
        "paragraphSpacing" to row[ReadConfigTable.paragraphSpacing],
        "titleMode" to row[ReadConfigTable.titleMode],
        "titleSize" to row[ReadConfigTable.titleSize],
        "titleTopSpacing" to row[ReadConfigTable.titleTopSpacing],
        "titleBottomSpacing" to row[ReadConfigTable.titleBottomSpacing],
        "paragraphIndent" to row[ReadConfigTable.paragraphIndent],
        "underlineMode" to row[ReadConfigTable.underlineMode],
        "paddingBottom" to row[ReadConfigTable.paddingBottom],
        "paddingLeft" to row[ReadConfigTable.paddingLeft],
        "paddingRight" to row[ReadConfigTable.paddingRight],
        "paddingTop" to row[ReadConfigTable.paddingTop],
        "headerPaddingBottom" to row[ReadConfigTable.headerPaddingBottom],
        "headerPaddingLeft" to row[ReadConfigTable.headerPaddingLeft],
        "headerPaddingRight" to row[ReadConfigTable.headerPaddingRight],
        "headerPaddingTop" to row[ReadConfigTable.headerPaddingTop],
        "footerPaddingBottom" to row[ReadConfigTable.footerPaddingBottom],
        "footerPaddingLeft" to row[ReadConfigTable.footerPaddingLeft],
        "footerPaddingRight" to row[ReadConfigTable.footerPaddingRight],
        "footerPaddingTop" to row[ReadConfigTable.footerPaddingTop],
        "showHeaderLine" to row[ReadConfigTable.showHeaderLine],
        "showFooterLine" to row[ReadConfigTable.showFooterLine],
        "tipHeaderLeft" to row[ReadConfigTable.tipHeaderLeft],
        "tipHeaderMiddle" to row[ReadConfigTable.tipHeaderMiddle],
        "tipHeaderRight" to row[ReadConfigTable.tipHeaderRight],
        "tipFooterLeft" to row[ReadConfigTable.tipFooterLeft],
        "tipFooterMiddle" to row[ReadConfigTable.tipFooterMiddle],
        "tipFooterRight" to row[ReadConfigTable.tipFooterRight],
        "tipColor" to row[ReadConfigTable.tipColor],
        "tipDividerColor" to row[ReadConfigTable.tipDividerColor],
        "headerMode" to row[ReadConfigTable.headerMode],
        "footerMode" to row[ReadConfigTable.footerMode]
    )

    /** 将 Map 写入数据库行 */
    @Suppress("UNCHECKED_CAST")
    private fun mapToRow(row: org.jetbrains.exposed.sql.statements.UpdateBuilder<*>, config: Map<String, Any?>) {
        (config["name"] as? String)?.let { row[ReadConfigTable.name] = it }
        (config["styleType"] as? Number)?.let { row[ReadConfigTable.styleType] = it.toInt() }
        (config["bgStr"] as? String)?.let { row[ReadConfigTable.bgStr] = it }
        (config["bgStrNight"] as? String)?.let { row[ReadConfigTable.bgStrNight] = it }
        (config["bgStrEInk"] as? String)?.let { row[ReadConfigTable.bgStrEInk] = it }
        (config["bgAlpha"] as? Number)?.let { row[ReadConfigTable.bgAlpha] = it.toInt() }
        (config["bgType"] as? Number)?.let { row[ReadConfigTable.bgType] = it.toInt() }
        (config["bgTypeNight"] as? Number)?.let { row[ReadConfigTable.bgTypeNight] = it.toInt() }
        (config["bgTypeEInk"] as? Number)?.let { row[ReadConfigTable.bgTypeEInk] = it.toInt() }
        (config["textColor"] as? String)?.let { row[ReadConfigTable.textColor] = it }
        (config["textColorNight"] as? String)?.let { row[ReadConfigTable.textColorNight] = it }
        (config["textColorEInk"] as? String)?.let { row[ReadConfigTable.textColorEInk] = it }
        (config["textAccentColor"] as? String)?.let { row[ReadConfigTable.textAccentColor] = it }
        (config["textAccentColorNight"] as? String)?.let { row[ReadConfigTable.textAccentColorNight] = it }
        (config["textAccentColorEInk"] as? String)?.let { row[ReadConfigTable.textAccentColorEInk] = it }
        (config["darkStatusIcon"] as? Number)?.let { row[ReadConfigTable.darkStatusIcon] = it.toInt() }
        (config["darkStatusIconNight"] as? Number)?.let { row[ReadConfigTable.darkStatusIconNight] = it.toInt() }
        (config["darkStatusIconEInk"] as? Number)?.let { row[ReadConfigTable.darkStatusIconEInk] = it.toInt() }
        (config["pageAnim"] as? Number)?.let { row[ReadConfigTable.pageAnim] = it.toInt() }
        (config["pageAnimEInk"] as? Number)?.let { row[ReadConfigTable.pageAnimEInk] = it.toInt() }
        (config["textFont"] as? String)?.let { row[ReadConfigTable.textFont] = it }
        (config["textBold"] as? Number)?.let { row[ReadConfigTable.textBold] = it.toInt() }
        (config["textSize"] as? Number)?.let { row[ReadConfigTable.textSize] = it.toInt() }
        (config["letterSpacing"] as? Number)?.let { row[ReadConfigTable.letterSpacing] = it.toFloat() }
        (config["lineSpacingExtra"] as? Number)?.let { row[ReadConfigTable.lineSpacingExtra] = it.toInt() }
        (config["paragraphSpacing"] as? Number)?.let { row[ReadConfigTable.paragraphSpacing] = it.toInt() }
        (config["titleMode"] as? Number)?.let { row[ReadConfigTable.titleMode] = it.toInt() }
        (config["titleSize"] as? Number)?.let { row[ReadConfigTable.titleSize] = it.toInt() }
        (config["titleTopSpacing"] as? Number)?.let { row[ReadConfigTable.titleTopSpacing] = it.toInt() }
        (config["titleBottomSpacing"] as? Number)?.let { row[ReadConfigTable.titleBottomSpacing] = it.toInt() }
        (config["paragraphIndent"] as? String)?.let { row[ReadConfigTable.paragraphIndent] = it }
        (config["underlineMode"] as? Number)?.let { row[ReadConfigTable.underlineMode] = it.toInt() }
        (config["paddingBottom"] as? Number)?.let { row[ReadConfigTable.paddingBottom] = it.toInt() }
        (config["paddingLeft"] as? Number)?.let { row[ReadConfigTable.paddingLeft] = it.toInt() }
        (config["paddingRight"] as? Number)?.let { row[ReadConfigTable.paddingRight] = it.toInt() }
        (config["paddingTop"] as? Number)?.let { row[ReadConfigTable.paddingTop] = it.toInt() }
        (config["headerPaddingBottom"] as? Number)?.let { row[ReadConfigTable.headerPaddingBottom] = it.toInt() }
        (config["headerPaddingLeft"] as? Number)?.let { row[ReadConfigTable.headerPaddingLeft] = it.toInt() }
        (config["headerPaddingRight"] as? Number)?.let { row[ReadConfigTable.headerPaddingRight] = it.toInt() }
        (config["headerPaddingTop"] as? Number)?.let { row[ReadConfigTable.headerPaddingTop] = it.toInt() }
        (config["footerPaddingBottom"] as? Number)?.let { row[ReadConfigTable.footerPaddingBottom] = it.toInt() }
        (config["footerPaddingLeft"] as? Number)?.let { row[ReadConfigTable.footerPaddingLeft] = it.toInt() }
        (config["footerPaddingRight"] as? Number)?.let { row[ReadConfigTable.footerPaddingRight] = it.toInt() }
        (config["footerPaddingTop"] as? Number)?.let { row[ReadConfigTable.footerPaddingTop] = it.toInt() }
        (config["showHeaderLine"] as? Number)?.let { row[ReadConfigTable.showHeaderLine] = it.toInt() }
        (config["showFooterLine"] as? Number)?.let { row[ReadConfigTable.showFooterLine] = it.toInt() }
        (config["tipHeaderLeft"] as? Number)?.let { row[ReadConfigTable.tipHeaderLeft] = it.toInt() }
        (config["tipHeaderMiddle"] as? Number)?.let { row[ReadConfigTable.tipHeaderMiddle] = it.toInt() }
        (config["tipHeaderRight"] as? Number)?.let { row[ReadConfigTable.tipHeaderRight] = it.toInt() }
        (config["tipFooterLeft"] as? Number)?.let { row[ReadConfigTable.tipFooterLeft] = it.toInt() }
        (config["tipFooterMiddle"] as? Number)?.let { row[ReadConfigTable.tipFooterMiddle] = it.toInt() }
        (config["tipFooterRight"] as? Number)?.let { row[ReadConfigTable.tipFooterRight] = it.toInt() }
        (config["tipColor"] as? Number)?.let { row[ReadConfigTable.tipColor] = it.toInt() }
        (config["tipDividerColor"] as? Number)?.let { row[ReadConfigTable.tipDividerColor] = it.toInt() }
        (config["headerMode"] as? Number)?.let { row[ReadConfigTable.headerMode] = it.toInt() }
        (config["footerMode"] as? Number)?.let { row[ReadConfigTable.footerMode] = it.toInt() }
    }

    /** 构造默认方案 Map */
    private fun configMap(
        name: String, bg: String, bgNight: String, bgEInk: String,
        tc: String, tcN: String, tcE: String, styleType: Int = 0
    ): Map<String, Any?> = mapOf(
        "name" to name, "styleType" to styleType,
        "bgStr" to bg, "bgStrNight" to bgNight, "bgStrEInk" to bgEInk,
        "textColor" to tc, "textColorNight" to tcN, "textColorEInk" to tcE
    )
}