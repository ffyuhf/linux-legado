/**
 * 书源数据实体 - 对齐 Android 版 io.legado.app.data.entities.BookSource
 *
 * 包含搜索/发现/详情/目录/正文规则，用于 WebBook 解析。
 * rule* 字段以 JSON 字符串存储（与 Android TypeConverter 对齐）。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 17:44 nmb - 新增，从 Android 版移植
 */

package io.legado.data.entities

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import io.legado.data.entities.rule.BookInfoRule
import io.legado.data.entities.rule.ContentRule
import io.legado.data.entities.rule.ExploreRule
import io.legado.data.entities.rule.SearchRule
import io.legado.data.entities.rule.TocRule

/**
 * 书源实体
 *
 * @property bookSourceUrl 书源URL（主键）
 * @property bookSourceName 书源名称
 * @property bookSourceGroup 书源分组
 * @property bookSourceType 类型: 0文本 1音频 2图片 3文件 4视频
 * @property bookUrlPattern 详情页URL正则
 * @property customOrder 手动排序编号
 * @property enabled 是否启用
 * @property enabledExplore 启用发现
 * @property jsLib JS库
 * @property enabledCookieJar 启用CookieJar
 * @property concurrentRate 并发率
 * @property header 请求头
 * @property loginUrl 登录地址
 * @property loginUi 登录UI（JSON）
 * @property loginCheckJs 登录检测JS
 * @property coverDecodeJs 封面解密JS
 * @property bookSourceComment 注释
 * @property variableComment 自定义变量说明
 * @property lastUpdateTime 最后更新时间
 * @property respondTime 响应时间
 * @property weight 智能排序权重
 * @property exploreUrl 发现URL
 * @property ruleExplore 发现规则（JSON）
 * @property searchUrl 搜索URL
 * @property ruleSearch 搜索规则（JSON）
 * @property ruleBookInfo 书籍信息规则（JSON）
 * @property ruleToc 目录规则（JSON）
 * @property ruleContent 正文规则（JSON）
 * @property ruleReview 段评规则（JSON）
 */
data class BookSource(
    @SerializedName("bookSourceUrl")
    var bookSourceUrl: String = "",

    @SerializedName("bookSourceName")
    var bookSourceName: String = "",

    @SerializedName("bookSourceGroup")
    var bookSourceGroup: String? = null,

    @SerializedName("bookSourceType")
    var bookSourceType: Int = 0,

    @SerializedName("bookUrlPattern")
    var bookUrlPattern: String? = null,

    @SerializedName("customOrder")
    var customOrder: Int = 0,

    @SerializedName("enabled")
    var enabled: Boolean = true,

    @SerializedName("enabledExplore")
    var enabledExplore: Boolean = true,

    @SerializedName("jsLib")
    var jsLib: String? = null,

    @SerializedName("enabledCookieJar")
    var enabledCookieJar: Boolean = false,

    @SerializedName("concurrentRate")
    var concurrentRate: String? = null,

    @SerializedName("header")
    var header: String? = null,

    @SerializedName("loginUrl")
    var loginUrl: String? = null,

    @SerializedName("loginUi")
    var loginUi: String? = null,

    @SerializedName("loginCheckJs")
    var loginCheckJs: String? = null,

    @SerializedName("coverDecodeJs")
    var coverDecodeJs: String? = null,

    @SerializedName("bookSourceComment")
    var bookSourceComment: String? = null,

    @SerializedName("variableComment")
    var variableComment: String? = null,

    @SerializedName("lastUpdateTime")
    var lastUpdateTime: Long = 0,

    @SerializedName("respondTime")
    var respondTime: Long = 0,

    @SerializedName("weight")
    var weight: Int = 0,

    @SerializedName("exploreUrl")
    var exploreUrl: String? = null,

    @SerializedName("ruleExplore")
    var ruleExplore: String? = null,

    @SerializedName("searchUrl")
    var searchUrl: String? = null,

    @SerializedName("ruleSearch")
    var ruleSearch: String? = null,

    @SerializedName("ruleBookInfo")
    var ruleBookInfo: String? = null,

    @SerializedName("ruleToc")
    var ruleToc: String? = null,

    @SerializedName("ruleContent")
    var ruleContent: String? = null,

    @SerializedName("ruleReview")
    var ruleReview: String? = null
) {
    /** GSON 实例（复用，与全局 GSON 保持一致） */
    private val ruleGson: Gson get() = io.legado.model.GSON

    /**
     * 获取搜索规则（从 ruleSearch JSON 字符串反序列化）
     * @return 搜索规则对象，解析失败返回空规则
     */
    fun getSearchRule(): SearchRule {
        ruleSearch?.let { json ->
            return runCatching {
                ruleGson.fromJson(json, SearchRule::class.java)
            }.getOrNull() ?: SearchRule()
        }
        return SearchRule()
    }

    /**
     * 获取发现规则（从 ruleExplore JSON 字符串反序列化）
     * @return 发现规则对象，解析失败返回空规则
     */
    fun getExploreRule(): ExploreRule {
        ruleExplore?.let { json ->
            return runCatching {
                ruleGson.fromJson(json, ExploreRule::class.java)
            }.getOrNull() ?: ExploreRule()
        }
        return ExploreRule()
    }

    /**
     * 获取书籍详情规则（从 ruleBookInfo JSON 字符串反序列化）
     * @return 详情规则对象，解析失败返回空规则
     */
    fun getBookInfoRule(): BookInfoRule {
        ruleBookInfo?.let { json ->
            return runCatching {
                ruleGson.fromJson(json, BookInfoRule::class.java)
            }.getOrNull() ?: BookInfoRule()
        }
        return BookInfoRule()
    }

    /**
     * 获取目录规则（从 ruleToc JSON 字符串反序列化）
     * @return 目录规则对象，解析失败返回空规则
     */
    fun getTocRule(): TocRule {
        ruleToc?.let { json ->
            return runCatching {
                ruleGson.fromJson(json, TocRule::class.java)
            }.getOrNull() ?: TocRule()
        }
        return TocRule()
    }

    /**
     * 获取正文规则（从 ruleContent JSON 字符串反序列化）
     * @return 正文规则对象，解析失败返回空规则
     */
    fun getContentRule(): ContentRule {
        ruleContent?.let { json ->
            return runCatching {
                ruleGson.fromJson(json, ContentRule::class.java)
            }.getOrNull() ?: ContentRule()
        }
        return ContentRule()
    }
}
