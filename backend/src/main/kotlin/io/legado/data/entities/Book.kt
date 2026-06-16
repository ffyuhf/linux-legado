/**
 * 书籍数据实体 - 对齐 Android 版 io.legado.app.data.entities.Book
 *
 * 与数据库表 books 字段一一对应，用于 WebBook 解析和业务逻辑操作。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 17:44 nmb - 新增，从 Android 版移植
 * 2026-06-13 19:19 nmb - 实现 RuleDataInterface，支持变量存取
 */

package io.legado.data.entities

import com.google.gson.annotations.SerializedName
import io.legado.model.analyzeRule.RuleDataInterface

/**
 * 书籍实体
 *
 * @property bookUrl 书籍URL，唯一标识
 * @property tocUrl 目录页URL
 * @property origin 书源URL（关联 book_sources.bookSourceUrl）
 * @property originName 书源名称
 * @property name 书名
 * @property author 作者
 * @property kind 分类标签
 * @property customTag 自定义标签
 * @property coverUrl 封面URL
 * @property customCoverUrl 自定义封面URL
 * @property intro 简介
 * @property customIntro 自定义简介
 * @property charset 编码格式
 * @property type 类型: 0文本 1音频 2图片 3文件 4视频
 * @property group 分组（位掩码）
 * @property latestChapterTitle 最新章节标题
 * @property latestChapterTime 最新章节时间
 * @property lastCheckTime 最后检查时间
 * @property lastCheckCount 最后检查到的更新数
 * @property totalChapterNum 总章节数
 * @property durChapterTitle 当前阅读章节标题
 * @property durChapterIndex 当前阅读章节索引
 * @property durVolumeIndex 当前阅读卷索引
 * @property chapterInVolumeIndex 卷内章节索引
 * @property durChapterPos 当前阅读位置
 * @property durChapterTime 当前阅读时间
 * @property wordCount 字数
 * @property canUpdate 是否可更新
 * @property order 排序
 * @property originOrder 书源排序
 * @property variable 自定义变量（JSON字符串）
 * @property readConfig 阅读配置（JSON字符串）
 * @property syncTime 同步时间
 */
data class Book(
    @SerializedName("bookUrl")
    var bookUrl: String = "",

    @SerializedName("tocUrl")
    var tocUrl: String = "",

    @SerializedName("origin")
    var origin: String = "loc_book",

    @SerializedName("originName")
    var originName: String = "",

    @SerializedName("name")
    var name: String = "",

    @SerializedName("author")
    var author: String = "",

    @SerializedName("kind")
    var kind: String? = null,

    @SerializedName("customTag")
    var customTag: String? = null,

    @SerializedName("coverUrl")
    var coverUrl: String? = null,

    @SerializedName("customCoverUrl")
    var customCoverUrl: String? = null,

    @SerializedName("intro")
    var intro: String? = null,

    @SerializedName("customIntro")
    var customIntro: String? = null,

    @SerializedName("charset")
    var charset: String? = null,

    @SerializedName("type")
    var type: Int = 0,

    @SerializedName("group")
    var group: Int = 0,

    @SerializedName("latestChapterTitle")
    var latestChapterTitle: String? = null,

    @SerializedName("latestChapterTime")
    var latestChapterTime: Long = 0,

    @SerializedName("lastCheckTime")
    var lastCheckTime: Long = 0,

    @SerializedName("lastCheckCount")
    var lastCheckCount: Int = 0,

    @SerializedName("totalChapterNum")
    var totalChapterNum: Int = 0,

    @SerializedName("durChapterTitle")
    var durChapterTitle: String? = null,

    @SerializedName("durChapterIndex")
    var durChapterIndex: Int = 0,

    @SerializedName("durVolumeIndex")
    var durVolumeIndex: Int = 0,

    @SerializedName("chapterInVolumeIndex")
    var chapterInVolumeIndex: Int = 0,

    @SerializedName("durChapterPos")
    var durChapterPos: Int = 0,

    @SerializedName("durChapterTime")
    var durChapterTime: Long = 0,

    @SerializedName("wordCount")
    var wordCount: String? = null,

    @SerializedName("canUpdate")
    var canUpdate: Boolean = true,

    @SerializedName("order")
    var order: Int = 0,

    @SerializedName("originOrder")
    var originOrder: Int = 0,

    @SerializedName("variable")
    var variable: String? = null,

    @SerializedName("readConfig")
    var readConfig: String? = null,

    @SerializedName("syncTime")
    var syncTime: Long = 0
) : RuleDataInterface {
    /** 变量映射表（运行时存储，不持久化） */
    @Transient
    override val variableMap: HashMap<String, String> = HashMap()

    /** 大变量存储（当前实现为内存 Map，后续可扩展为文件存储） */
    @Transient
    private val bigVariableMap: HashMap<String, String> = HashMap()

    /** 存储大变量（>=10000字符） */
    override fun putBigVariable(key: String, value: String?) {
        if (value == null) {
            bigVariableMap.remove(key)
        } else {
            bigVariableMap[key] = value
        }
    }

    /** 获取大变量 */
    override fun getBigVariable(key: String): String? {
        return bigVariableMap[key]
    }

    /** 判断是否为本地书籍 */
    val isLocal: Boolean get() = origin == "loc_book"

    /** 详情页HTML缓存，仅运行时使用，不持久化到数据库 */
    @Transient
    var infoHtml: String? = null

    /** 目录页HTML缓存，仅运行时使用，不持久化到数据库 */
    @Transient
    var tocHtml: String? = null

    /** 转换为搜索结果对象 */
    fun toSearchBook(): SearchBook = SearchBook(
        bookUrl = bookUrl,
        origin = origin,
        originName = originName,
        type = type,
        name = name,
        author = author,
        kind = kind,
        coverUrl = coverUrl,
        intro = intro,
        wordCount = wordCount,
        latestChapterTitle = latestChapterTitle,
        tocUrl = tocUrl,
        originOrder = originOrder
    )
}