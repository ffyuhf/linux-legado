/**
 * 章节数据实体 - 对齐 Android 版 io.legado.app.data.entities.BookChapter
 *
 * 代表书籍目录中的一章，用于目录展示和正文获取。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 17:46 nmb - 新增，从 Android 版移植
 */

package io.legado.data.entities

import com.google.gson.annotations.SerializedName

/**
 * 章节实体
 *
 * @property url 章节URL
 * @property title 章节标题
 * @property isVolume 是否为卷
 * @property baseUrl 基础URL
 * @property bookUrl 所属书籍URL（外键关联 books.bookUrl）
 * @property index 章节序号
 * @property isVip 是否VIP章节
 * @property isPay 是否已购买
 * @property resourceUrl 资源URL
 * @property tag 标签
 * @property wordCount 字数
 * @property start 起始位置
 * @property end 结束位置
 * @property startFragmentId 起始片段ID
 * @property endFragmentId 结束片段ID
 * @property variable 自定义变量（JSON字符串）
 * @property imgUrl 图片URL
 */
data class BookChapter(
    @SerializedName("url")
    var url: String = "",

    @SerializedName("title")
    var title: String = "",

    @SerializedName("isVolume")
    var isVolume: Boolean = false,

    @SerializedName("baseUrl")
    var baseUrl: String = "",

    @SerializedName("bookUrl")
    var bookUrl: String = "",

    @SerializedName("index")
    var index: Int = 0,

    @SerializedName("isVip")
    var isVip: Boolean = false,

    @SerializedName("isPay")
    var isPay: Boolean = false,

    @SerializedName("resourceUrl")
    var resourceUrl: String? = null,

    @SerializedName("tag")
    var tag: String? = null,

    @SerializedName("wordCount")
    var wordCount: String? = null,

    @SerializedName("start")
    var start: Long? = null,

    @SerializedName("end")
    var end: Long? = null,

    @SerializedName("startFragmentId")
    var startFragmentId: String? = null,

    @SerializedName("endFragmentId")
    var endFragmentId: String? = null,

    @SerializedName("variable")
    var variable: String? = null,

    @SerializedName("imgUrl")
    var imgUrl: String? = null
) {
    /** 标题MD5（用于标题去重和变更检测），非持久化 */
    @Transient
    var titleMD5: String? = null

    /**
     * 获取章节绝对URL
     * 如果 url 已是绝对路径则直接返回，否则基于 baseUrl 拼接
     * @return 绝对URL
     */
    fun getAbsoluteURL(): String {
        if (url.isEmpty()) return ""
        if (url.startsWith("http://") || url.startsWith("https://")) return url
        if (url.startsWith("//")) return "https:$url"
        return try {
            java.net.URL(java.net.URL(baseUrl), url).toString()
        } catch (_: Exception) {
            url
        }
    }

    /**
     * 更新章节标题（供正文解析时用）
     * 当前为占位实现，后续可接入数据库更新
     */
    fun update() {
        // TODO: 后续接入数据库更新章节标题
    }

    /**
     * 存储歌词（音频书籍用，当前占位）
     */
    fun putLyric(lyric: String) {
        // TODO: 阶段后续实现
    }

    /**
     * 存储弹幕（视频书籍用，当前占位）
     */
    fun putDanmaku(danmaku: String) {
        // TODO: 阶段后续实现
    }
}
