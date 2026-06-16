/**
 * 书籍列表规则接口 - 搜索规则和发现规则的公共字段契约
 *
 * 从 Android 版 io.legado.app.data.entities.rule.BookListRule 移植。
 * 移除 Android Parcelable 依赖，保留纯 Kotlin interface。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:03 nmb - 从 Android 版移植，移除 Parcelable
 */

package io.legado.data.entities.rule

/**
 * 书籍列表规则接口
 *
 * 定义搜索结果列表和发现结果列表共有的字段规则。
 * 实现类: [SearchRule], [ExploreRule]
 */
interface BookListRule {
    /** 书籍列表规则（选择器，定位每本书的容器元素） */
    var bookList: String?

    /** 书名规则 */
    var name: String?

    /** 作者规则 */
    var author: String?

    /** 简介规则 */
    var intro: String?

    /** 分类规则 */
    var kind: String?

    /** 最新章节规则 */
    var lastChapter: String?

    /** 更新时间规则 */
    var updateTime: String?

    /** 详情页链接规则 */
    var bookUrl: String?

    /** 封面链接规则 */
    var coverUrl: String?

    /** 字数规则 */
    var wordCount: String?
}