/**
 * 应用正则常量 - 书源规则解析所需的正则表达式集合
 *
 * 从 Android 版 io.legado.app.constant.AppPattern 移植，仅保留规则解析相关的正则。
 * 去除 Android 依赖（@Keep 注解）。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:46 nmb - 从 Android 版移植，裁剪为规则解析必需的正则
 */

package io.legado.model.analyzeRule

import java.util.regex.Pattern

@Suppress("RegExpRedundantEscape", "unused")
object AppPattern {
    /** 匹配 <js>...</js> 或 @js:... 格式的 JS 规则 */
    val JS_PATTERN: Pattern =
        Pattern.compile("<js>([\\w\\W]*?)</js>|@js:([\\w\\W]*)", Pattern.CASE_INSENSITIVE)

    /** 匹配 @webjs:... 格式的 WebJS 规则 */
    val WebJS_PATTERN: Pattern =
        Pattern.compile("@webjs:([\\w\\W]{5,})", Pattern.CASE_INSENSITIVE)

    /** 匹配 {{...}} 格式的表达式 */
    val EXP_PATTERN: Pattern = Pattern.compile("\\{\\{([\\w\\W]*?)\\}\\}")

    /** 匹配 HTML img 标签中的 src 属性 */
    val imgPattern: Pattern =
        Pattern.compile("<img[^>]*src=\"([^\"]*(?:\"[^>]+\\})?)\"[^>]*>")

    /** data URI 格式匹配 */
    val dataUriRegex = Regex("^data:.*?;base64,(.*)")

    /** 提取链接中的域名 */
    val domainRegex = Regex("^https?://([^:/]+)", RegexOption.IGNORE_CASE)

    /** 换行正则 */
    val rnRegex = Regex("[\\r\\n]")
}