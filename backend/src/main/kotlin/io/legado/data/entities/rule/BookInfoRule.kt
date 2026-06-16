/**
 * 书籍详情页规则 - 定义书源详情页的解析规则
 *
 * 从 Android 版 io.legado.app.data.entities.rule.BookInfoRule 移植。
 * 移除 Android Parcelable/JsonDeserializer 依赖，保留纯 Kotlin data class。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:06 nmb - 从 Android 版移植，移除 Parcelable
 */

package io.legado.data.entities.rule

/**
 * 书籍详情页规则
 *
 * @property init 初始化规则（预处理选择器）
 * @property name 书名规则
 * @property author 作者规则
 * @property intro 简介规则
 * @property kind 分类规则
 * @property lastChapter 最新章节规则
 * @property updateTime 更新时间规则
 * @property coverUrl 封面链接规则
 * @property tocUrl 目录页链接规则
 * @property wordCount 字数规则
 * @property canReName 是否允许重命名规则
 * @property downloadUrls 下载链接规则
 */
data class BookInfoRule(
    var init: String? = null,
    var name: String? = null,
    var author: String? = null,
    var intro: String? = null,
    var kind: String? = null,
    var lastChapter: String? = null,
    var updateTime: String? = null,
    var coverUrl: String? = null,
    var tocUrl: String? = null,
    var wordCount: String? = null,
    var canReName: String? = null,
    var downloadUrls: String? = null
)