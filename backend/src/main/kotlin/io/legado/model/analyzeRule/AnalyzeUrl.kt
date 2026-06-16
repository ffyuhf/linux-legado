/**
 * URL 解析与 HTTP 请求工具 - 书源搜索URL规则解析
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.AnalyzeUrl 移植。
 * 主要变更：
 * - OkHttp → Ktor HttpClient
 * - 移除 WebView/Glide/ExoPlayer/Rhino 依赖
 * - 保留 URL 解析、参数替换、JS 占位逻辑
 * - HTTP 方法（GET/POST）通过 Ktor 实现
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:52 nmb - 从 Android 版移植，OkHttp → Ktor
 * 2026-06-13 20:21 nmb - evalJS 空壳→Rhino实际执行
 */

package io.legado.model.analyzeRule

import io.ktor.client.*
import io.ktor.client.engine.okhttp.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.legado.data.entities.BookChapter
import io.legado.data.entities.BookSource
import io.legado.model.StrResponse
import io.legado.model.webBook.JsExtensions
import org.mozilla.javascript.Context
import org.mozilla.javascript.ConsString
import org.mozilla.javascript.ScriptableObject
import org.mozilla.javascript.Undefined
import org.slf4j.LoggerFactory
import java.net.URLEncoder
import java.util.regex.Pattern

/**
 * URL 规则解析与 HTTP 请求
 *
 * @param mUrl 规则 URL（可含 {@page}、{{js}} 等占位符）
 * @param baseUrl 基础 URL（用于相对路径拼接）
 * @param ruleData 规则数据接口
 */
@Suppress("unused", "MemberVisibilityCanBePrivate")
class AnalyzeUrl(
    private val mUrl: String,
    private var baseUrl: String = "",
    private val ruleData: RuleDataInterface? = null,
    headerMapF: Map<String, String>? = null,
    /** 搜索关键字（供 JS bindings 使用） */
    private val jsKey: String? = null,
    /** 页码（供 JS bindings 使用） */
    private val jsPage: Int? = null,
    /** 书源实体（供 WebBook 传递，用于解析 header/JsExtensions） */
    override val source: BookSource? = null,
    /** 章节实体（供正文解析传递，用于获取 chapter 变量） */
    @Suppress("unused")
    val chapter: BookChapter? = null
) : JsExtensions() {
    companion object {
        private val logger = LoggerFactory.getLogger(AnalyzeUrl::class.java)

        /** URL 参数分隔正则：匹配 ,{ */
        val paramPattern: Pattern = Pattern.compile("\\s*,\\s*(?=\\{)")

        /** 页码替换正则：<page1, page2, ...> */
        private val pagePattern = Pattern.compile("<(.*?)>")

        /** 自定义响应头名，用于传递 OkHttp 重定向后的最终 URL */
        private const val HEADER_FINAL_URL = "X-Final-Url"

        /** Ktor HTTP 客户端（复用） */
        val httpClient: HttpClient by lazy {
            HttpClient(OkHttp) {
                install(HttpTimeout) {
                    requestTimeoutMillis = 30_000
                    connectTimeoutMillis = 10_000
                }
                followRedirects = true
                engine {
                    // BUG 修复: 添加拦截器记录重定向后的最终 URL
                    // OkHttp 的 response.request.url 是重定向后的最终地址，存入自定义响应头供上层读取
                    addInterceptor { chain ->
                        val response = chain.proceed(chain.request())
                        response.newBuilder()
                            .header(HEADER_FINAL_URL, response.request.url.toString())
                            .build()
                    }
                }
            }
        }
    }

    /** 解析后的规则 URL */
    var ruleUrl = ""
        private set

    /** 最终请求 URL */
    var url: String = ""
        private set

    /** 响应类型 */
    var type: String? = null
        private set

    /** 请求头 */
    val headerMap = LinkedHashMap<String, String>()

    /** 请求体 */
    var body: String? = null
        private set

    /** 无查询参数的 URL */
    var urlNoQuery: String = ""
        private set

    /** 编码后的表单数据 */
    private var encodedForm: String? = null

    /** 编码后的查询参数 */
    private var encodedQuery: String? = null

    /** 字符集 */
    private var charset: String? = null

    /** HTTP 方法 */
    var method: HttpMethod = HttpMethod.Get
        private set

    /** 重试次数 */
    private var retry: Int = 0

    /** 域名 */
    val domain: String

    init {
        headerMapF?.let { headerMap.putAll(it) }
        initUrl()
        domain = NetworkUtils.getSubDomain(url)
    }

    /** 处理 URL */
    fun initUrl() {
        ruleUrl = mUrl
        analyzeJs()
        replaceKeyPageJs()
        analyzeUrl()
    }

    /** 执行 @js 和 <js></js> */
    private fun analyzeJs() {
        var start = 0
        val jsMatcher = AppPattern.JS_PATTERN.matcher(ruleUrl)
        var result = ruleUrl
        while (jsMatcher.find()) {
            if (jsMatcher.start() > start) {
                ruleUrl.substring(start, jsMatcher.start()).trim().let {
                    if (it.isNotEmpty()) result = it.replace("@result", result)
                }
            }
            val jsResult = evalJS(jsMatcher.group(2) ?: jsMatcher.group(1), result)
            result = jsResult?.toString() ?: result
            start = jsMatcher.end()
        }
        if (ruleUrl.length > start) {
            ruleUrl.substring(start).trim().let {
                if (it.isNotEmpty()) result = it.replace("@result", result)
            }
        }
        ruleUrl = result
    }

    /** 替换关键字、页数、JS 表达式 */
    private fun replaceKeyPageJs() {
        // 替换 {{js}} 内嵌表达式
        if (ruleUrl.contains("{{") && ruleUrl.contains("}}")) {
            val analyze = RuleAnalyzer(ruleUrl)
            val replacedUrl = analyze.innerRule("{{", "}}") {
                val jsEval = evalJS(it) ?: ""
                when (jsEval) {
                    is String -> jsEval
                    is Double if jsEval % 1.0 == 0.0 -> String.format("%.0f", jsEval)
                    else -> jsEval.toString()
                }
            }
            if (replacedUrl.isNotEmpty()) ruleUrl = replacedUrl
        }
        // 替换页码 <page1, page2, ...>
        jsPage?.let {
            val matcher = pagePattern.matcher(ruleUrl)
            while (matcher.find()) {
                val pages = matcher.group(1)!!.split(",")
                ruleUrl = if (jsPage < pages.size) {
                    ruleUrl.replace(matcher.group(), pages[jsPage - 1].trim { it <= ' ' })
                } else {
                    ruleUrl.replace(matcher.group(), pages.last().trim { it <= ' ' })
                }
            }
        }
    }

    /** 解析 URL 参数（JSON 格式的 URL Option） */
    private fun analyzeUrl() {
        val urlMatcher = paramPattern.matcher(ruleUrl)
        val urlNoOption =
            if (urlMatcher.find()) ruleUrl.substring(0, urlMatcher.start()) else ruleUrl

        url = NetworkUtils.getAbsoluteURL(baseUrl, urlNoOption)
        NetworkUtils.getBaseUrl(url)?.let { baseUrl = it }

        if (urlNoOption.length != ruleUrl.length) {
            val urlOptionStr = ruleUrl.substring(urlMatcher.end())
            parseUrlOption(urlOptionStr)
        }

        urlNoQuery = url

        if (method == HttpMethod.Post) {
            body?.let {
                if (!it.isJson() && headerMap["Content-Type"].isNullOrEmpty()) {
                    encodedForm = encodeParams(it, charset, false)
                }
            }
        } else {
            val pos = url.indexOf('?')
            if (pos != -1) {
                encodedQuery = encodeParams(url.substring(pos + 1), charset, true)
                urlNoQuery = url.substring(0, pos)
            }
        }
    }

    /** 解析 URL Option JSON */
    private fun parseUrlOption(optionStr: String) {
        try {
            // 简单 JSON 解析（避免 GSON 依赖）
            val json = optionStr.trim().removeSurrounding("{", "}")
            val entries = mutableMapOf<String, String>()
            // 使用状态机解析简单 JSON
            var inString = false
            var currentKey = StringBuilder()
            var currentValue = StringBuilder()
            var isKey = true
            var depth = 0

            for (ch in json) {
                when {
                    ch == '"' -> inString = !inString
                    ch == ':' && !inString && depth == 0 -> isKey = false
                    ch == ',' && !inString && depth == 0 -> {
                        if (currentKey.isNotEmpty()) {
                            entries[currentKey.toString().trim()] = currentValue.toString().trim()
                        }
                        currentKey.clear()
                        currentValue.clear()
                        isKey = true
                    }
                    ch == '{' && !inString -> depth++
                    ch == '}' && !inString -> depth--
                    else -> {
                        if (isKey) currentKey.append(ch)
                        else currentValue.append(ch)
                    }
                }
            }
            if (currentKey.isNotEmpty()) {
                entries[currentKey.toString().trim()] = currentValue.toString().trim()
            }

            // 应用选项
            entries["method"]?.let {
                method = when (it.uppercase().removeSurrounding("\"")) {
                    "POST" -> HttpMethod.Post
                    "HEAD" -> HttpMethod.Head
                    else -> HttpMethod.Get
                }
            }
            entries["charset"]?.let { charset = it.removeSurrounding("\"") }
            entries["body"]?.let { body = it.removeSurrounding("\"") }
            entries["type"]?.let { type = it.removeSurrounding("\"") }
            entries["retry"]?.let { retry = it.removeSurrounding("\"").toIntOrNull() ?: 0 }
            entries["webView"]?.let {
                // WebView 暂未实现
            }
            entries["webJs"]?.let {
                // WebJS 暂未实现
            }
            entries["headers"]?.let { headerStr ->
                parseSimpleHeaders(headerStr)
            }
            entries["js"]?.let { jsStr ->
                evalJS(jsStr.removeSurrounding("\""), url)?.toString()?.let { url = it }
            }
        } catch (e: Exception) {
            logger.debug("URL Option 解析失败: {}", optionStr, e)
        }
    }

    /** 简单解析 header 字符串 */
    private fun parseSimpleHeaders(headerStr: String) {
        try {
            val clean = headerStr.trim().removeSurrounding("\"")
            if (clean.startsWith("{")) {
                val inner = clean.removeSurrounding("{", "}")
                inner.split(",").forEach { pair ->
                    val kv = pair.split(":", limit = 2)
                    if (kv.size == 2) {
                        headerMap[kv[0].trim().removeSurrounding("\"")] =
                            kv[1].trim().removeSurrounding("\"")
                    }
                }
            }
        } catch (e: Exception) {
            logger.debug("Header 解析失败: {}", headerStr, e)
        }
    }

    /** 编码请求参数 */
    private fun encodeParams(params: String, charset: String?, isQuery: Boolean): String {
        val charsetObj = when {
            charset.isNullOrEmpty() -> Charsets.UTF_8
            else -> {
                try { java.nio.charset.Charset.forName(charset) } catch (_: Exception) { Charsets.UTF_8 }
            }
        }

        val len = params.length
        val sb = StringBuilder()
        var pos = 0
        while (pos <= len) {
            if (sb.isNotEmpty()) sb.append("&")
            var ampOffset = params.indexOf("&", pos)
            if (ampOffset == -1) ampOffset = len
            val eqOffset = params.indexOf("=", pos)
            val key: String
            val value: String?
            if (eqOffset == -1 || eqOffset > ampOffset) {
                key = params.substring(pos, ampOffset)
                value = null
            } else {
                key = params.substring(pos, eqOffset)
                value = params.substring(eqOffset + 1, ampOffset)
            }
            sb.append(URLEncoder.encode(key, charsetObj.name()))
            if (value != null) {
                sb.append("=")
                sb.append(URLEncoder.encode(value, charsetObj.name()))
            }
            pos = ampOffset + 1
        }
        return sb.toString()
    }

    /** 变量存取 */
    fun put(key: String, value: String): String {
        ruleData?.putVariable(key, value)
        return value
    }

    fun get(key: String): String {
        return ruleData?.getVariable(key)?.takeIf { it.isNotEmpty() } ?: ""
    }

    // ==================== JsExtensions 覆写 ====================

    override fun getTag(): String? = source?.bookSourceUrl

    // ==================== Rhino JS 执行 ====================

    /**
     * 执行 JS 脚本
     * 使用 Rhino 原生 API，注入 bindings（java/source/result/baseUrl/page/key）
     *
     * 修改历史:
     * 2026-06-13 20:21 nmb - 空壳占位 → Rhino Context.evaluateString 实际执行
     */
    fun evalJS(jsStr: String, result: Any? = null): Any? {
        val cx: Context = try {
            Context.enter()
        } catch (e: Exception) {
            logger.warn("AnalyzeUrl Rhino Context.enter() 失败: {}", e.localizedMessage)
            return null
        }
        try {
            val scope = cx.initStandardObjects()

            // java = this（JsExtensions 实例）
            ScriptableObject.putProperty(scope, "java", Context.javaToJS(this as JsExtensions, scope))

            // source = 书源实体
            source?.let {
                ScriptableObject.putProperty(scope, "source", Context.javaToJS(it, scope))
            }

            // baseUrl = 当前基础 URL
            ScriptableObject.putProperty(scope, "baseUrl", baseUrl)

            // key = 搜索关键字
            jsKey?.let {
                ScriptableObject.putProperty(scope, "key", it)
            }

            // page = 页码
            jsPage?.let {
                ScriptableObject.putProperty(scope, "page", it)
            }

            // result = 当前解析结果
            result?.let {
                ScriptableObject.putProperty(scope, "result", Context.javaToJS(it, scope))
            }

            val jsResult = cx.evaluateString(scope, jsStr, "evalJS", 1, null)
            return when (jsResult) {
                is ConsString -> jsResult.toString()
                is Undefined -> null
                else -> jsResult
            }
        } catch (e: Exception) {
            logger.warn("AnalyzeUrl JS执行失败: js={}, error={}", jsStr.take(80), e.localizedMessage)
            return null
        } finally {
            Context.exit()
        }
    }

    /**
     * 执行 HTTP 请求，返回 StrResponse（含响应体文本和最终URL）
     *
     * @param jsStr WebView JS（阶段后续实现，当前忽略）
     * @param sourceRegex 资源正则（阶段后续实现，当前忽略）
     * @return StrResponse 封装响应数据
     */
    suspend fun getStrResponseAwait(
        @Suppress("UNUSED_PARAMETER") jsStr: String? = null,
        @Suppress("UNUSED_PARAMETER") sourceRegex: String? = null
    ): StrResponse {
        val requestUrl = if (encodedQuery != null) "$urlNoQuery?$encodedQuery" else urlNoQuery

        return try {
            val response: HttpResponse = httpClient.request(requestUrl) {
                this.method = this@AnalyzeUrl.method
                headerMap.forEach { (k, v) -> header(k, v) }
                if (this@AnalyzeUrl.method == HttpMethod.Post) {
                    val postBody = encodedForm ?: body ?: ""
                    if (postBody != "") {
                        setBody(postBody)
                    }
                }
            }
            // BUG 修复: 从自定义响应头读取 OkHttp 重定向后的最终 URL
            // response.call.request.url 是原始请求 URL，非重定向后地址
            val finalUrl = response.headers[HEADER_FINAL_URL] ?: requestUrl
            val bodyText = runCatching { response.bodyAsText() }.getOrNull()
            StrResponse(finalUrl, bodyText, response)
        } catch (e: Exception) {
            logger.error("HTTP 请求失败: url={}, error={}", requestUrl, e.message)
            throw e
        }
    }

    /**
     * 构造异常错误响应（用于 WebBook 错误处理）
     * @param throwable 异常对象
     * @return 包含错误信息的 StrResponse
     */
    fun getErrStrResponse(throwable: Throwable): StrResponse {
        return StrResponse(url ?: "", throwable.localizedMessage ?: "请求失败", null)
    }

    /** 是否为 POST 请求 */
    fun isPost(): Boolean = method == HttpMethod.Post
}