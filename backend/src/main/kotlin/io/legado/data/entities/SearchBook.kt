/**
 * 搜索结果数据实体 - 对齐 Android 版 io.legado.app.data.entities.SearchBook
 *
 * 代表书源搜索返回的单本书籍结果，用于 WebSocket 搜索推送和搜索结果缓存。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 17:45 nmb - 新增，从 Android 版移植
 * 2026-06-13 19:19 nmb - 实现 RuleDataInterface，支持变量存取
 */

package io.legado.data.entities

import com.google.gson.annotations.SerializedName
import io.legado.model.analyzeRule.RuleDataInterface

/**
 * 搜索结果实体
 *
 * @property bookUrl 书籍URL（唯一标识）
 * @property origin 书源URL
 * @property originName 书源名称
 * @property type 类型: 0文本 1音频 2图片 3文件 4视频
 * @property name 书名
 * @property author 作者
 * @property kind 分类标签
 * @property coverUrl 封面URL
 * @property intro 简介
 * @property wordCount 字数
 * @property latestChapterTitle 最新章节标题
 * @property tocUrl 目录页URL
 * @property time 搜索时间戳
 * @property variable 自定义变量（JSON字符串）
 * @property originOrder 书源排序
 * @property chapterWordCountText 章节字数文本
 * @property chapterWordCount 章节字数
 * @property respondTime 响应时间
 * @property infoHtml 详情页HTML缓存（非持久化，仅运行时使用）
 */
data class SearchBook(
    @SerializedName("bookUrl")
    var bookUrl: String = "",

    @SerializedName("origin")
    var origin: String = "",

    @SerializedName("originName")
    var originName: String = "",

    @SerializedName("type")
    var type: Int = 0,

    @SerializedName("name")
    var name: String = "",

    @SerializedName("author")
    var author: String = "",

    @SerializedName("kind")
    var kind: String? = null,

    @SerializedName("coverUrl")
    var coverUrl: String? = null,

    @SerializedName("intro")
    var intro: String? = null,

    @SerializedName("wordCount")
    var wordCount: String? = null,

    @SerializedName("latestChapterTitle")
    var latestChapterTitle: String? = null,

    @SerializedName("tocUrl")
    var tocUrl: String = "",

    @SerializedName("time")
    var time: Long = System.currentTimeMillis(),

    @SerializedName("variable")
    var variable: String? = null,

    @SerializedName("originOrder")
    var originOrder: Int = 0,

    @SerializedName("chapterWordCountText")
    var chapterWordCountText: String? = null,

    @SerializedName("chapterWordCount")
    var chapterWordCount: Int = -1,

    @SerializedName("respondTime")
    var respondTime: Long = -1
) : RuleDataInterface {
    /** 变量映射表（运行时存储，不持久化） */
    @Transient
    override val variableMap: HashMap<String, String> = HashMap()

    /** 大变量存储（当前实现为内存 Map） */
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

    /** 详情页HTML缓存，仅运行时使用，不持久化到数据库 */
    @Transient
    var infoHtml: String? = null

    /** 转换为书籍对象（搜索结果添加书架时使用） */
    fun toBook(): Book = Book(
        bookUrl = bookUrl,
        tocUrl = tocUrl,
        origin = origin,
        originName = originName,
        name = name,
        author = author,
        kind = kind,
        coverUrl = coverUrl,
        intro = intro,
        wordCount = wordCount,
        latestChapterTitle = latestChapterTitle,
        type = type,
        originOrder = originOrder
    )
}