/**
 * HTTP 字符串响应包装类 - 封装 AnalyzeUrl 网络请求的结果
 *
 * 从 Android 版 io.legado.app.help.http.StrResponse 移植。
 * 主要变更：OkHttp Response → Ktor HttpResponse 适配。
 * 提供 url、body、code 等属性，供 WebBook 模块统一使用。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:15 nmb - 新增，从 Android 版移植
 */

package io.legado.model

import io.ktor.client.statement.HttpResponse
import io.ktor.http.HttpStatusCode

/**
 * HTTP 字符串响应
 *
 * @property url 最终响应 URL（重定向后的 URL）
 * @property body 响应体文本
 * @property raw 原始 Ktor HttpResponse（用于获取 headers、priorResponse 等）
 */
class StrResponse(
    var url: String,
    var body: String?,
    val raw: HttpResponse? = null
) {
    /**
     * 获取 HTTP 响应状态码
     * @return 状态码数值，raw 为空时返回 200
     */
    fun code(): Int {
        return raw?.status?.value ?: HttpStatusCode.OK.value
    }

    /**
     * 获取错误响应文本（用于异常时的调试信息）
     * @return "url\nbody" 格式的字符串
     */
    override fun toString(): String {
        return "$url\n${body ?: ""}"
    }
}