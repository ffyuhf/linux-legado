/**
 * JsonPath 解析器 - JSON 内容解析
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.AnalyzeByJSonPath 移植。
 * 去除 Android 依赖（@Keep 注解、printOnDebug → SLF4J 日志）。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:44 nmb - 从 Android 版移植，printOnDebug → logger
 */

package io.legado.model.analyzeRule

import com.jayway.jsonpath.JsonPath
import com.jayway.jsonpath.ReadContext
import org.slf4j.LoggerFactory

/**
 * 书源规则解析 - JsonPath 模式
 *
 * @param json 待解析内容（支持 ReadContext、String、Object）
 */
@Suppress("RegExpRedundantEscape")
class AnalyzeByJSonPath(json: Any) {

    companion object {
        private val logger = LoggerFactory.getLogger(AnalyzeByJSonPath::class.java)

        /** 将各种输入类型统一解析为 JsonPath ReadContext */
        fun parse(json: Any): ReadContext {
            return when (json) {
                is ReadContext -> json
                is String -> JsonPath.parse(json)
                else -> JsonPath.parse(json)
            }
        }
    }

    private var ctx: ReadContext = parse(json)

    /**
     * 获取字符串结果
     *
     * 解决阅读"&&"、"||"与jsonPath支持的"&&"、"||"之间的冲突。
     * 解决{$.rule}形式规则可能匹配错误的问题，改用平衡嵌套方法。
     */
    fun getString(rule: String): String? {
        if (rule.isEmpty()) return null

        val ruleAnalyzes = RuleAnalyzer(rule, true)
        val rules = ruleAnalyzes.splitRule("&&", "||")

        if (rules.size == 1) {
            ruleAnalyzes.reSetPos()
            var result = ruleAnalyzes.innerRule("{$.") { getString(it) }

            if (result.isEmpty()) {
                try {
                    val ob = ctx.read<Any>(rule)
                    result = if (ob is List<*>) {
                        ob.joinToString("\n")
                    } else {
                        ob.toString()
                    }
                } catch (e: Exception) {
                    logger.debug("JsonPath 解析失败: rule={}", rule, e)
                }
            }
            return result
        } else {
            val textList = arrayListOf<String>()
            for (rl in rules) {
                val temp = getString(rl)
                if (!temp.isNullOrEmpty()) {
                    textList.add(temp)
                    if (ruleAnalyzes.elementsType == "||") break
                }
            }
            return textList.joinToString("\n")
        }
    }

    /** 获取字符串列表 */
    internal fun getStringList(rule: String): List<String> {
        val result = ArrayList<String>()
        if (rule.isEmpty()) return result

        val ruleAnalyzes = RuleAnalyzer(rule, true)
        val rules = ruleAnalyzes.splitRule("&&", "||", "%%")

        if (rules.size == 1) {
            ruleAnalyzes.reSetPos()
            val st = ruleAnalyzes.innerRule("{$.") { getString(it) }
            if (st.isEmpty()) {
                try {
                    val obj = ctx.read<Any>(rule)
                    if (obj is List<*>) {
                        for (o in obj) result.add(o.toString())
                    } else {
                        result.add(obj.toString())
                    }
                } catch (e: Exception) {
                    logger.debug("JsonPath 解析失败: rule={}", rule, e)
                }
            } else {
                result.add(st)
            }
            return result
        } else {
            val results = ArrayList<List<String>>()
            for (rl in rules) {
                val temp = getStringList(rl)
                if (temp.isNotEmpty()) {
                    results.add(temp)
                    if (ruleAnalyzes.elementsType == "||") break
                }
            }
            if (results.isNotEmpty()) {
                if ("%%" == ruleAnalyzes.elementsType) {
                    for (i in results[0].indices) {
                        for (temp in results) {
                            if (i < temp.size) result.add(temp[i])
                        }
                    }
                } else {
                    for (temp in results) result.addAll(temp)
                }
            }
            return result
        }
    }

    /** 获取原始对象 */
    internal fun getObject(rule: String): Any {
        return ctx.read(rule)
    }

    /** 获取对象列表 */
    internal fun getList(rule: String): ArrayList<Any>? {
        val result = ArrayList<Any>()
        if (rule.isEmpty()) return result

        val ruleAnalyzes = RuleAnalyzer(rule, true)
        val rules = ruleAnalyzes.splitRule("&&", "||", "%%")

        if (rules.size == 1) {
            try {
                return ctx.read<ArrayList<Any>>(rules[0])
            } catch (e: Exception) {
                logger.debug("JsonPath 解析失败: rule={}", rule, e)
            }
        } else {
            val results = ArrayList<ArrayList<*>>()
            for (rl in rules) {
                val temp = getList(rl)
                if (!temp.isNullOrEmpty()) {
                    results.add(temp)
                    if (ruleAnalyzes.elementsType == "||") break
                }
            }
            if (results.isNotEmpty()) {
                if ("%%" == ruleAnalyzes.elementsType) {
                    for (i in 0 until results[0].size) {
                        for (temp in results) {
                            if (i < temp.size) {
                                temp[i]?.let { result.add(it) }
                            }
                        }
                    }
                } else {
                    for (temp in results) result.addAll(temp)
                }
            }
        }
        return result
    }
}