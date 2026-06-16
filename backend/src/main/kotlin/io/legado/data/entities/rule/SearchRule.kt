/**
 * 搜索结果处理规则 - 定义书源搜索结果页的解析规则
 *
 * 从 Android 版 io.legado.app.data.entities.rule.SearchRule 移植。
 * 移除 Android Parcelable/JsonDeserializer 依赖，保留纯 Kotlin data class。
 * JSON 反序列化由 BookSource.getSearchRule() 通过 GSON 完成。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:03 nmb - 从 Android 版移植，移除 Parcelable
 */

package io.legado.data.entities.rule

/**
 * 搜索结果处理规则
 *
 * @property checkKeyWord 校验关键字
 * @property bookList 书籍列表选择器
 * @property name 书名规则
 * @property author 作者规则
 * @property intro 简介规则
 * @property kind 分类规则
 * @property lastChapter 最新章节规则
 * @property updateTime 更新时间规则
 * @property bookUrl 详情页链接规则
 * @property coverUrl 封面链接规则
 * @property wordCount 字数规则
 */
data class SearchRule(
    var checkKeyWord: String? = null,
    override var bookList: String? = null,
    override var name: String? = null,
    override var author: String? = null,
    override var intro: String? = null,
    override var kind: String? = null,
    override var lastChapter: String? = null,
    override var updateTime: String? = null,
    override var bookUrl: String? = null,
    override var coverUrl: String? = null,
    override var wordCount: String? = null
) : BookListRule