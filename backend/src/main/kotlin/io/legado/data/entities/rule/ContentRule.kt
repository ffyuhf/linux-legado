/**
 * 正文处理规则 - 定义书源正文页的解析规则
 *
 * 从 Android 版 io.legado.app.data.entities.rule.ContentRule 移植。
 * 移除 Android Parcelable/JsonDeserializer 依赖，保留纯 Kotlin data class。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:06 nmb - 从 Android 版移植，移除 Parcelable
 */

package io.legado.data.entities.rule

/**
 * 正文处理规则
 *
 * @property content 正文内容规则
 * @property subContent 副文规则（拼接在正文后面或获取歌词等）
 * @property title 标题规则（有些网站只能在正文中获取标题）
 * @property nextContentUrl 正文下一页链接规则
 * @property webJs WebView执行的JS（阶段后续集成后可用）
 * @property sourceRegex 资源正则
 * @property replaceRegex 替换规则
 * @property imageStyle 图片样式（默认大小居中，FULL最大宽度）
 * @property imageDecode 图片bytes二次解密js
 * @property payAction 购买操作（js或包含{{js}}的url）
 * @property callBackJs 监听事件后执行的回调js代码
 */
data class ContentRule(
    var content: String? = null,
    var subContent: String? = null,
    var title: String? = null,
    var nextContentUrl: String? = null,
    var webJs: String? = null,
    var sourceRegex: String? = null,
    var replaceRegex: String? = null,
    var imageStyle: String? = null,
    var imageDecode: String? = null,
    var payAction: String? = null,
    var callBackJs: String? = null
)