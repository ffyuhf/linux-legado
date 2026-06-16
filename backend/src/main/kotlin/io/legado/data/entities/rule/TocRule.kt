/**
 * 目录页规则 - 定义书源目录页的解析规则
 *
 * 从 Android 版 io.legado.app.data.entities.rule.TocRule 移植。
 * 移除 Android Parcelable/JsonDeserializer 依赖，保留纯 Kotlin data class。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:06 nmb - 从 Android 版移植，移除 Parcelable
 */

package io.legado.data.entities.rule

/**
 * 目录页规则
 *
 * @property preUpdateJs 更新前执行的JS（阶段3 Rhino集成后可用）
 * @property chapterList 章节列表选择器
 * @property chapterName 章节名称规则
 * @property chapterUrl 章节链接规则
 * @property formatJs 标题格式化JS（阶段3 Rhino集成后可用）
 * @property isVolume 是否为卷标规则
 * @property isVip 是否VIP规则
 * @property isPay 是否付费规则
 * @property updateTime 更新时间规则
 * @property nextTocUrl 下一页目录链接规则
 */
data class TocRule(
    var preUpdateJs: String? = null,
    var chapterList: String? = null,
    var chapterName: String? = null,
    var chapterUrl: String? = null,
    var formatJs: String? = null,
    var isVolume: String? = null,
    var isVip: String? = null,
    var isPay: String? = null,
    var updateTime: String? = null,
    var nextTocUrl: String? = null
)