/**
 * XPath 解析器 - XML/HTML 内容解析
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.AnalyzeByXPath 移植。
 * 去除 Android 依赖（@Keep 注解、TextUtils），JsoupXpath 为 JVM 跨平台库。
 *
 * 注意：JsoupXpath 2.5.3 的 JXDocument.create 接受 Document/Elements/String，
 * 单个 Element 需转换为 HTML 字符串或包装为 Elements。
 * 选择方法为 sel()（非 selN）。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:44 nmb - 从 Android 版移植，TextUtils → Kotlin .isEmpty()
 * 2026-06-13 14:55 nmb - 修复 JXDocument API 兼容（Element→String, selN→sel）
 */

package io.legado.model.analyzeRule

import org.jsoup.nodes.Element
import org.jsoup.select.Elements
import org.seimicrawler.xpath.JXDocument
import org.seimicrawler.xpath.JXNode
import org.slf4j.LoggerFactory

/**
 * 书源规则解析 - XPath 模式
 */
object AnalyzeByXPath {
    private val logger = LoggerFactory.getLogger(AnalyzeByXPath::class.java)

    /** JXDocument.sel() 返回类型转换辅助 */
    @Suppress("UNCHECKED_CAST")
    private fun JXDocument.selNodes(xpath: String): List<JXNode> =
        this.sel(xpath) as List<JXNode>

    /** 从任意内容创建 JXDocument */
    fun getJXDocument(element: Any): JXDocument {
        return when (element) {
            is JXDocument -> element
            is Element -> JXDocument.create(element.html())
            is JXNode -> if (element.isElement) JXDocument.create(element.asElement().html())
                else JXDocument.create(element.toString())
            else -> JXDocument.create(element.toString())
        }
    }

    /** 获取元素列表 */
    fun getElements(jxDoc: JXDocument, rule: String): List<JXNode> {
        val ruleStr = if (rule.startsWith("//", true)) rule else "//${rule.substring(2)}"
        return jxDoc.selNodes(ruleStr)
    }

    /** 获取元素列表（任意来源） */
    fun getElements(element: Any, rule: String): List<JXNode> {
        return getElements(getJXDocument(element), rule)
    }

    /** 获取字符串 */
    fun getString(element: Any, ruleStr: String): String? {
        val list = getStringList(element, ruleStr)
        if (list.isEmpty()) return null
        if (list.size == 1) return list.first()
        return list.joinToString("\n")
    }

    /** 获取第一个字符串 */
    fun getString0(element: Any, ruleStr: String): String =
        getStringList(element, ruleStr).let { if (it.isEmpty()) "" else it[0] }

    /** 获取字符串列表 */
    fun getStringList(element: Any, ruleStr: String): List<String> {
        if (ruleStr.isEmpty()) return emptyList()

        val jxDoc = getJXDocument(element)

        val ruleAnalyzes = RuleAnalyzer(ruleStr)
        val ruleStrS = ruleAnalyzes.splitRule("&&", "||", "%%")

        val results = ArrayList<List<String>>()
        for (ruleStrX in ruleStrS) {
            val temp = getResultList(jxDoc, ruleStrX)
            if (temp.isNotEmpty()) {
                results.add(temp)
                if (ruleAnalyzes.elementsType == "||") break
            }
        }

        val textS = ArrayList<String>()
        if (results.isNotEmpty()) {
            if ("%%" == ruleAnalyzes.elementsType) {
                for (i in results[0].indices) {
                    for (temp in results) {
                        if (i < temp.size) textS.add(temp[i])
                    }
                }
            } else {
                for (temp in results) textS.addAll(temp)
            }
        }
        return textS
    }

    /** 执行单条 XPath 规则获取结果列表 */
    private fun getResultList(jxDoc: JXDocument, ruleStr: String): List<String> {
        val textS = ArrayList<String>()

        val rule = RuleAnalyzer(ruleStr)
        rule.trim()
        val rules = rule.splitRule("@")

        var jxNodes: List<JXNode>? = null

        for (i in 0 until rules.lastIndex) {
            jxNodes = sel(jxDoc, jxNodes, rules[i])
        }

        val lastRule = rules.last()

        if (jxNodes.isNullOrEmpty()) {
            selValue(jxDoc.selNodes(lastRule), textS)
        } else {
            val elements = ArrayList<Element>()
            for (jxNode in jxNodes) {
                if (jxNode.isElement) {
                    elements.add(jxNode.asElement())
                } else {
                    val str = jxNode.toString()
                    if (str.isNotEmpty()) {
                        textS.add(str)
                    }
                }
            }
            if (elements.isNotEmpty()) {
                if (lastRule == "text") {
                    for (element in elements) textS.add(element.text())
                } else if (lastRule == "all") {
                    for (element in elements) textS.add(element.outerHtml())
                } else if (lastRule == "html" || lastRule == "innerHTML") {
                    for (element in elements) textS.add(element.html())
                } else if (lastRule == "outerHtml") {
                    for (element in elements) textS.add(element.outerHtml())
                } else {
                    val subDoc = JXDocument.create(Elements(elements))
                    val subNodes = subDoc.selNodes(lastRule)
                    selValue(subNodes, textS)
                }
            }
        }
        return textS
    }

    /** XPath 节点选择 */
    private fun sel(jxDoc: JXDocument, jxNodes: List<JXNode>?, ruleStr: String): List<JXNode>? {
        if (ruleStr.isEmpty()) return jxNodes

        val rule = if (ruleStr.startsWith("//", true)) ruleStr else "//${ruleStr.substring(2)}"

        return if (jxNodes.isNullOrEmpty()) {
            jxDoc.selNodes(rule)
        } else {
            val result = ArrayList<JXNode>()
            for (jxNode in jxNodes) {
                if (jxNode.isElement) {
                    val subDoc = JXDocument.create(jxNode.asElement().html())
                    val subNodes = subDoc.selNodes(rule)
                    result.addAll(subNodes)
                } else {
                    val str = jxNode.toString()
                    if (str.isNotEmpty()) {
                        result.add(jxNode)
                    }
                }
            }
            result
        }
    }

    /** 从 JXNode 列表中提取文本值 */
    private fun selValue(jxNodes: List<JXNode>?, textS: ArrayList<String>) {
        if (jxNodes == null) return
        for (jxNode in jxNodes) {
            if (jxNode.isElement) {
                textS.add(jxNode.asElement().text())
            } else {
                textS.add(jxNode.toString())
            }
        }
    }
}