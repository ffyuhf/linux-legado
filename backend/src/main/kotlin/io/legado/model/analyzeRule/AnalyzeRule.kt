/**
 * 规则解析引擎 - 统一调度 XPath/JsonPath/JSoup/Regex/JS 解析器
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.AnalyzeRule 移植。
 * 主要变更：
 * - 移除 Android 依赖（@Keep、TextUtils → Kotlin .isEmpty()）
 * - 移除 RhinoScriptEngine/JsExtensions（JS 引擎待后续移植）
 * - 移除 WebView/WebBook/BackstageWebView（WebJS 待后续移植）
 * - 保留核心规则分解逻辑和解析器调度
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:50 nmb - 从 Android 版移植，剥离 Android 特有依赖
 */

package io.legado.model.analyzeRule

import io.legado.model.webBook.JsExtensions
import org.jsoup.nodes.Node
import org.mozilla.javascript.Context
import org.mozilla.javascript.ConsString
import org.mozilla.javascript.Scriptable
import org.mozilla.javascript.ScriptableObject
import org.mozilla.javascript.Undefined
import org.slf4j.LoggerFactory
import java.net.URL
import java.util.Locale
import java.util.regex.Pattern

/**
 * 书源规则解析引擎
 *
 * @param ruleData 规则数据接口（提供变量存取）
 */
@Suppress("unused", "RegExpRedundantEscape", "MemberVisibilityCanBePrivate")
class AnalyzeRule(
    var ruleData: RuleDataInterface? = null,
    /** 书源实体（供 JS 引擎 bindings 使用） */
    var bookSource: io.legado.data.entities.BookSource? = null
) : JsExtensions() {
    companion object {
        private val logger = LoggerFactory.getLogger(AnalyzeRule::class.java)

        /** @put:{...} 变量存储规则 */
        private val putPattern = Pattern.compile("@put:(\\{[^}]+?\\})", Pattern.CASE_INSENSITIVE)

        /** @get:{...} / {{...}} 表达式规则 */
        private val evalPattern =
            Pattern.compile("@get:\\{[^}]+?\\}|\\{\\{[\\w\\W]*?\\}\\}", Pattern.CASE_INSENSITIVE)

        /** $N 反向引用 */
        private val regexPattern = Pattern.compile("\\$\\d{1,2}")
    }

    private var content: Any? = null
    private var baseUrl: String? = null
    private var redirectUrl: URL? = null
    private var isJSON: Boolean = false
    private var isRegex: Boolean = false

    private var analyzeByXPath: AnalyzeByXPath? = null
    private var analyzeByJSoup: AnalyzeByJSoup? = null
    private var analyzeByJSonPath: AnalyzeByJSonPath? = null

    private val stringRuleCache = hashMapOf<String, List<SourceRule>>()
    private val regexCache = hashMapOf<String, Regex?>()
    /** JS 编译缓存，避免重复编译同一脚本 */
    private val scriptCache = hashMapOf<String, org.mozilla.javascript.Script>()

    private var loggedNonStandardJSON = false

    /** 设置待解析内容 */
    fun setContent(content: Any?, baseUrl: String? = null): AnalyzeRule {
        if (content == null) throw AssertionError("内容不可空（Content cannot be null）")
        this.content = content
        isJSON = when (content) {
            is Node -> false
            else -> content.toString().isJson()
        }
        setBaseUrl(baseUrl)
        analyzeByXPath = null
        analyzeByJSoup = null
        analyzeByJSonPath = null
        return this
    }

    /** 设置基础 URL */
    fun setBaseUrl(baseUrl: String?): AnalyzeRule {
        baseUrl?.let { this.baseUrl = baseUrl }
        return this
    }

    /** 设置重定向 URL */
    fun setRedirectUrl(url: String): URL? {
        if (url.isDataUrl()) return redirectUrl
        try {
            redirectUrl = URL(url)
        } catch (e: Exception) {
            logger.debug("URL({}) error: {}", url, e.localizedMessage)
        }
        return redirectUrl
    }

    /** 获取 XPath 解析器（缓存） */
    private fun getAnalyzeByXPath(o: Any): AnalyzeByXPath {
        return if (o != content) AnalyzeByXPath
        else analyzeByXPath ?: AnalyzeByXPath.also { analyzeByXPath = it }
    }

    /** 获取 JSoup 解析器（缓存） */
    private fun getAnalyzeByJSoup(o: Any): AnalyzeByJSoup {
        return if (o != content) AnalyzeByJSoup(o)
        else analyzeByJSoup ?: AnalyzeByJSoup(content!!).also { analyzeByJSoup = it }
    }

    /** 获取 JsonPath 解析器（缓存） */
    private fun getAnalyzeByJSonPath(o: Any): AnalyzeByJSonPath {
        return if (o != content) AnalyzeByJSonPath(o)
        else analyzeByJSonPath ?: AnalyzeByJSonPath(content!!).also { analyzeByJSonPath = it }
    }

    /**
     * 获取文本列表
     */
    fun getStringList(rule: String?, mContent: Any? = null, isUrl: Boolean = false): List<String>? {
        if (rule.isNullOrEmpty()) return null
        val ruleList = splitSourceRuleCacheString(rule)
        return getStringList(ruleList, mContent, isUrl)
    }

    fun getStringList(
        ruleList: List<SourceRule>,
        mContent: Any? = null,
        isUrl: Boolean = false
    ): List<String>? {
        var result: Any? = null
        val content = mContent ?: this.content
        if (content != null && ruleList.isNotEmpty()) {
            result = content
            for (sourceRule in ruleList) {
                putRule(sourceRule.putMap)
                sourceRule.makeUpRule(result)
                result ?: continue
                val rule = sourceRule.rule
                if (rule.isNotEmpty()) {
                    result = when (sourceRule.mode) {
                        Mode.Json -> getAnalyzeByJSonPath(result).getStringList(rule)
                        Mode.XPath -> AnalyzeByXPath.getStringList(result, rule)
                        Mode.Default -> getAnalyzeByJSoup(result).getStringList(rule)
                        Mode.Js -> evalJS(rule, result)
                        Mode.WebJs -> {
                            logger.warn("WebJS 暂未实现: {}", rule)
                            rule
                        }
                        Mode.Regex -> result
                    }
                }
                if (sourceRule.replaceRegex.isNotEmpty() && result is List<*>) {
                    val newList = ArrayList<String>()
                    for (item in result) {
                        newList.add(replaceRegex(item.toString(), sourceRule))
                    }
                    result = newList
                } else if (sourceRule.replaceRegex.isNotEmpty()) {
                    result = replaceRegex(result.toString(), sourceRule)
                }
            }
        }
        if (result == null) return null
        if (result is String) {
            result = result.split("\n")
        }
        if (isUrl) {
            val urlList = ArrayList<String>()
            if (result is List<*>) {
                for (url in result) {
                    val absoluteURL = NetworkUtils.getAbsoluteURL(redirectUrl, url.toString())
                    if (absoluteURL.isNotEmpty() && !urlList.contains(absoluteURL)) {
                        urlList.add(absoluteURL)
                    }
                }
            }
            return urlList
        }
        @Suppress("UNCHECKED_CAST")
        return result as? List<String>
    }

    /**
     * 获取文本
     */
    fun getString(ruleStr: String?, mContent: Any? = null, isUrl: Boolean = false): String {
        if (ruleStr.isNullOrEmpty()) return ""
        val ruleList = splitSourceRuleCacheString(ruleStr)
        return getString(ruleList, mContent, isUrl)
    }

    fun getString(
        ruleList: List<SourceRule>,
        mContent: Any? = null,
        isUrl: Boolean = false,
        unescape: Boolean = true
    ): String {
        var result: Any? = null
        val content = mContent ?: this.content
        if (content != null && ruleList.isNotEmpty()) {
            result = content
            for (sourceRule in ruleList) {
                putRule(sourceRule.putMap)
                sourceRule.makeUpRule(result)
                result ?: continue
                val rule = sourceRule.rule
                if (rule.isNotBlank() || sourceRule.replaceRegex.isEmpty()) {
                    result = when (sourceRule.mode) {
                        Mode.Json -> getAnalyzeByJSonPath(result).getString(rule)
                        Mode.XPath -> AnalyzeByXPath.getString(result, rule)
                        Mode.Default -> if (isUrl) {
                            getAnalyzeByJSoup(result).getString0(rule)
                        } else {
                            getAnalyzeByJSoup(result).getString(rule)
                        }
                        Mode.Js -> evalJS(rule, result)
                        Mode.WebJs -> {
                            logger.warn("WebJS 暂未实现: {}", rule)
                            rule
                        }
                        Mode.Regex -> result
                    }
                }
                if (result != null && sourceRule.replaceRegex.isNotEmpty()) {
                    result = replaceRegex(result.toString(), sourceRule)
                }
            }
        }
        if (result == null) result = ""
        val resultStr = result.toString()
        if (isUrl) {
            return if (resultStr.isBlank()) {
                baseUrl ?: ""
            } else {
                NetworkUtils.getAbsoluteURL(redirectUrl, resultStr)
            }
        }
        return resultStr
    }

    /**
     * 获取 Element
     */
    fun getElement(ruleStr: String): Any? {
        if (ruleStr.isEmpty()) return null
        val content = this.content ?: return null
        val ruleList = splitSourceRule(ruleStr, true)
        var result: Any? = content
        for (sourceRule in ruleList) {
            putRule(sourceRule.putMap)
            sourceRule.makeUpRule(result)
            result ?: continue
            val rule = sourceRule.rule
            result = when (sourceRule.mode) {
                Mode.Regex -> AnalyzeByRegex.getElement(
                    result.toString(),
                    rule.split("&&").filter { it.isNotBlank() }.toTypedArray()
                )
                Mode.Json -> getAnalyzeByJSonPath(result).getObject(rule)
                Mode.XPath -> AnalyzeByXPath.getElements(result, rule)
                else -> getAnalyzeByJSoup(result).getElements(rule)
            }
            if (sourceRule.replaceRegex.isNotEmpty()) {
                result = replaceRegex(result.toString(), sourceRule)
            }
        }
        return result
    }

    /**
     * 获取列表
     */
    @Suppress("UNCHECKED_CAST")
    fun getElements(ruleStr: String): List<Any> {
        val content = this.content ?: return emptyList()
        val ruleList = splitSourceRule(ruleStr, true)
        var result: Any? = content
        for (sourceRule in ruleList) {
            putRule(sourceRule.putMap)
            result ?: continue
            val rule = sourceRule.rule
            result = when (sourceRule.mode) {
                Mode.Regex -> AnalyzeByRegex.getElements(
                    result.toString(),
                    rule.split("&&").filter { it.isNotBlank() }.toTypedArray()
                )
                Mode.Json -> getAnalyzeByJSonPath(result).getList(rule)
                Mode.XPath -> AnalyzeByXPath.getElements(result, rule)
                else -> getAnalyzeByJSoup(result).getElements(rule)
            }
        }
        result?.let { return it as List<Any> }
        return emptyList()
    }

    /** 保存变量 */
    private fun putRule(map: Map<String, String>) {
        for ((key, value) in map) {
            put(key, getString(value))
        }
    }

    /** 分离 @put 规则 */
    private fun splitPutRule(ruleStr: String, putMap: HashMap<String, String>): String {
        var vRuleStr = ruleStr
        val putMatcher = putPattern.matcher(vRuleStr)
        while (putMatcher.find()) {
            vRuleStr = vRuleStr.replace(putMatcher.group(), "")
            val putJsonStr = putMatcher.group(1)
            // 简单 JSON 解析（避免依赖 GSON）
            parseSimpleJsonMap(putJsonStr)?.let { putMap.putAll(it) }
        }
        return vRuleStr
    }

    /** 简单 JSON Map 解析 */
    private fun parseSimpleJsonMap(json: String): Map<String, String>? {
        return try {
            val content = json.trim().removeSurrounding("{", "}")
            val result = hashMapOf<String, String>()
            val parts = content.split(",")
            for (part in parts) {
                val kv = part.split(":", limit = 2)
                if (kv.size == 2) {
                    result[kv[0].trim().removeSurrounding("\"")] =
                        kv[1].trim().removeSurrounding("\"")
                }
            }
            result
        } catch (e: Exception) {
            null
        }
    }

    /** 正则替换 */
    private fun replaceRegex(result: String, rule: SourceRule): String {
        if (rule.replaceRegex.isEmpty()) return result
        val replaceRegex = rule.replaceRegex
        val replacement = rule.replacement
        val regex = compileRegexCache(replaceRegex)
        if (rule.replaceFirst) {
            if (regex != null) kotlin.runCatching {
                val matcher = regex.toPattern().matcher(result)
                return if (matcher.find()) {
                    matcher.group(0)!!.replaceFirst(regex, replacement)
                } else ""
            }
            return replacement
        } else {
            if (regex != null) kotlin.runCatching {
                return result.replace(regex, replacement)
            }
            return result.replace(replaceRegex, replacement)
        }
    }

    private fun compileRegexCache(regex: String): Regex? {
        return regexCache.getOrPut(regex) {
            try { regex.toRegex() } catch (_: Exception) { null }
        }
    }

    /** 规则缓存 */
    private fun splitSourceRuleCacheString(ruleStr: String?): List<SourceRule> {
        if (ruleStr.isNullOrEmpty()) return emptyList()
        return stringRuleCache.getOrPut(ruleStr) { splitSourceRule(ruleStr) }
    }

    /**
     * 分解规则生成规则列表
     */
    fun splitSourceRule(ruleStr: String?, allInOne: Boolean = false): List<SourceRule> {
        if (ruleStr.isNullOrEmpty()) return emptyList()
        val ruleList = ArrayList<SourceRule>()
        var mMode: Mode = Mode.Default
        var start = 0

        if (allInOne && ruleStr.startsWith(":")) {
            mMode = Mode.Regex
            isRegex = true
            start = 1
        } else if (isRegex) {
            mMode = Mode.Regex
        }

        var tmp: String
        val jsMatcher = AppPattern.JS_PATTERN.matcher(ruleStr)
        while (jsMatcher.find()) {
            if (jsMatcher.start() > start) {
                tmp = ruleStr.substring(start, jsMatcher.start()).trim { it <= ' ' }
                if (tmp.isNotEmpty()) ruleList.add(SourceRule(tmp, mMode))
            }
            ruleList.add(SourceRule(jsMatcher.group(2) ?: jsMatcher.group(1), Mode.Js))
            start = jsMatcher.end()
        }
        val webJsMatcher = AppPattern.WebJS_PATTERN.matcher(ruleStr)
        while (webJsMatcher.find()) {
            if (webJsMatcher.start() > start) {
                tmp = ruleStr.substring(start, webJsMatcher.start()).trim { it <= ' ' }
                if (tmp.isNotEmpty()) ruleList.add(SourceRule(tmp, mMode))
            }
            ruleList.add(SourceRule(webJsMatcher.group(1) ?: "", Mode.WebJs))
            start = webJsMatcher.end()
        }
        if (ruleStr.length > start) {
            tmp = ruleStr.substring(start).trim { it <= ' ' }
            if (tmp.isNotEmpty()) ruleList.add(SourceRule(tmp, mMode))
        }
        return ruleList
    }

    /**
     * 规则类
     */
    inner class SourceRule internal constructor(
        ruleStr: String,
        internal var mode: Mode = Mode.Default
    ) {
        internal var rule: String
        internal var replaceRegex = ""
        internal var replacement = ""
        internal var replaceFirst = false
        internal val putMap = HashMap<String, String>()
        private val ruleParam = ArrayList<String>()
        private val ruleType = ArrayList<Int>()
        private val getRuleType = -2
        private val jsRuleType = -1
        private val defaultRuleType = 0

        init {
            rule = when {
                mode == Mode.Js || mode == Mode.Regex -> ruleStr
                ruleStr.startsWith("@CSS:", true) -> {
                    mode = Mode.Default; ruleStr
                }
                ruleStr.startsWith("@@") -> {
                    mode = Mode.Default; ruleStr.substring(2)
                }
                ruleStr.startsWith("@XPath:", true) -> {
                    mode = Mode.XPath; ruleStr.substring(7)
                }
                ruleStr.startsWith("@Json:", true) -> {
                    mode = Mode.Json; ruleStr.substring(6)
                }
                isJSON || ruleStr.startsWith("$.") || ruleStr.startsWith("$[") -> {
                    mode = Mode.Json; ruleStr
                }
                ruleStr.startsWith("/") -> {
                    mode = Mode.XPath; ruleStr
                }
                else -> ruleStr
            }
            rule = splitPutRule(rule, putMap)

            var start = 0
            var tmp: String
            val evalMatcher = evalPattern.matcher(rule)

            if (evalMatcher.find()) {
                tmp = rule.substring(start, evalMatcher.start())
                if (mode != Mode.Js && mode != Mode.Regex &&
                    (evalMatcher.start() == 0 || !tmp.contains("##"))
                ) {
                    mode = Mode.Regex
                }
                do {
                    if (evalMatcher.start() > start) {
                        tmp = rule.substring(start, evalMatcher.start())
                        splitRegex(tmp)
                    }
                    tmp = evalMatcher.group()
                    when {
                        tmp.startsWith("@get:", true) -> {
                            ruleType.add(getRuleType)
                            ruleParam.add(tmp.substring(6, tmp.lastIndex))
                        }
                        tmp.startsWith("{{") -> {
                            ruleType.add(jsRuleType)
                            ruleParam.add(tmp.substring(2, tmp.length - 2))
                        }
                        else -> splitRegex(tmp)
                    }
                    start = evalMatcher.end()
                } while (evalMatcher.find())
            }
            if (rule.length > start) {
                tmp = rule.substring(start)
                splitRegex(tmp)
            }
        }

        /** 拆分 $N 反向引用 */
        private fun splitRegex(ruleStr: String) {
            var start = 0
            var tmp: String
            val ruleStrArray = ruleStr.split("##")
            val regexMatcher = regexPattern.matcher(ruleStrArray[0])

            if (regexMatcher.find()) {
                if (mode != Mode.Js && mode != Mode.Regex) mode = Mode.Regex
                do {
                    if (regexMatcher.start() > start) {
                        tmp = ruleStr.substring(start, regexMatcher.start())
                        ruleType.add(defaultRuleType)
                        ruleParam.add(tmp)
                    }
                    tmp = regexMatcher.group()
                    ruleType.add(tmp.substring(1).toInt())
                    ruleParam.add(tmp)
                    start = regexMatcher.end()
                } while (regexMatcher.find())
            }
            if (ruleStr.length > start) {
                tmp = ruleStr.substring(start)
                ruleType.add(defaultRuleType)
                ruleParam.add(tmp)
            }
        }

        /** 替换 @get、{{ }} */
        fun makeUpRule(result: Any?) {
            val infoVal = StringBuilder()
            if (ruleParam.isNotEmpty()) {
                var index = ruleParam.size
                while (index-- > 0) {
                    val regType = ruleType[index]
                    when {
                        regType > defaultRuleType -> {
                            @Suppress("UNCHECKED_CAST")
                            (result as? List<String?>)?.run {
                                if (this.size > regType) {
                                    this[regType]?.let { infoVal.insert(0, it) }
                                }
                            } ?: infoVal.insert(0, ruleParam[index])
                        }
                        regType == jsRuleType -> {
                            when (val jsEval: Any? = evalJS(ruleParam[index], result)) {
                                null -> Unit
                                is String -> infoVal.insert(0, jsEval)
                                is Double if jsEval % 1.0 == 0.0 -> infoVal.insert(
                                    0, String.format(Locale.ROOT, "%.0f", jsEval)
                                )
                                else -> infoVal.insert(0, jsEval.toString())
                            }
                        }
                        regType == getRuleType -> infoVal.insert(0, get(ruleParam[index]))
                        else -> infoVal.insert(0, ruleParam[index])
                    }
                }
                rule = infoVal.toString()
            }
            val ruleStrS = rule.split("##")
            rule = ruleStrS[0].trim()
            if (ruleStrS.size > 1) replaceRegex = ruleStrS[1]
            if (ruleStrS.size > 2) replacement = ruleStrS[2]
            if (ruleStrS.size > 3) replaceFirst = true
        }
    }

    enum class Mode {
        XPath, Json, Default, Js, Regex, WebJs
    }

    /** 章节实体（供正文解析时使用 chapter 变量） */
    @Transient
    private var chapter: io.legado.data.entities.BookChapter? = null

    /** 下一章节 URL（供正文分页解析使用） */
    @Transient
    private var nextChapterUrl: String? = null

    /**
     * 设置当前章节（供正文解析时使用）
     * @param chapter 章节实体
     */
    fun setChapter(chapter: io.legado.data.entities.BookChapter): AnalyzeRule {
        this.chapter = chapter
        return this
    }

    /**
     * 设置下一章节 URL（供正文分页解析使用）
     * @param nextChapterUrl 下一章节的URL
     */
    fun setNextChapterUrl(nextChapterUrl: String?): AnalyzeRule {
        this.nextChapterUrl = nextChapterUrl
        return this
    }

    /** 获取当前章节 */
    fun getChapter(): io.legado.data.entities.BookChapter? = chapter

    /** 获取下一章节 URL */
    fun getNextChapterUrl(): String? = nextChapterUrl

    /** 保存变量 */
    fun put(key: String, value: String): String {
        ruleData?.putVariable(key, value)
        return value
    }

    /** 获取变量 */
    fun get(key: String): String {
        return ruleData?.getVariable(key)?.takeIf { it.isNotEmpty() } ?: ""
    }

    // ==================== JsExtensions 覆写 ====================

    override val source: io.legado.data.entities.BookSource? get() = bookSource

    override fun getTag(): String? = bookSource?.bookSourceUrl

    // ==================== Rhino JS 执行 ====================

    /**
     * 执行 JS 脚本
     * 使用 Rhino 原生 API，注入 bindings（java/source/book/result/baseUrl/chapter/nextChapterUrl）
     *
     * 修改历史:
     * 2026-06-13 20:20 nmb - 空壳占位 → Rhino Context.evaluateString 实际执行
     */
    fun evalJS(jsStr: String, result: Any? = null): Any? {
        val cx: Context = try {
            Context.enter()
        } catch (e: Exception) {
            logger.warn("Rhino Context.enter() 失败: {}", e.localizedMessage)
            return null
        }
        try {
            val scope = getRuntimeScope(result)
            val compiled = compileScriptCache(jsStr, cx)
            val jsResult = compiled.exec(cx, scope)
            return unwrapReturnValue(jsResult)
        } catch (e: Exception) {
            logger.warn("JS执行失败: js={}, error={}", jsStr.take(80), e.localizedMessage)
            return null
        } finally {
            Context.exit()
        }
    }

    /** 构建 Rhino 运行时作用域，注入 bindings */
    private fun getRuntimeScope(result: Any?): Scriptable {
        val cx = Context.getCurrentContext()
        val scope = cx.initStandardObjects()

        // java = this（JsExtensions 实例）
        ScriptableObject.putProperty(scope, "java", Context.javaToJS(this as JsExtensions, scope))

        // source = 书源实体
        bookSource?.let {
            ScriptableObject.putProperty(scope, "source", Context.javaToJS(it, scope))
        }

        // book = 书籍实体（ruleData 可能是 Book 或 SearchBook）
        if (ruleData is io.legado.data.entities.Book) {
            ScriptableObject.putProperty(scope, "book", Context.javaToJS(ruleData, scope))
        }

        // result = 当前解析结果
        result?.let {
            ScriptableObject.putProperty(scope, "result", Context.javaToJS(it, scope))
        }

        // baseUrl = 当前基础 URL
        baseUrl?.let {
            ScriptableObject.putProperty(scope, "baseUrl", it)
        }

        // chapter = 当前章节
        chapter?.let {
            ScriptableObject.putProperty(scope, "chapter", Context.javaToJS(it, scope))
        }

        // nextChapterUrl = 下一章 URL
        nextChapterUrl?.let {
            ScriptableObject.putProperty(scope, "nextChapterUrl", it)
        }

        // 无共享作用域时使用独立 scope（阶段3简化实现）
        return scope
    }

    /** 编译并缓存 JS 脚本 */
    private fun compileScriptCache(jsStr: String, cx: Context): org.mozilla.javascript.Script {
        return scriptCache.getOrPut(jsStr) {
            cx.compileString(jsStr, "evalJS", 1, null)
        }
    }

    /** 解包 Rhino 返回值（ConsString → String, Undefined → null） */
    private fun unwrapReturnValue(result: Any?): Any? {
        return when (result) {
            is ConsString -> result.toString()
            is Undefined -> null
            else -> result
        }
    }
}