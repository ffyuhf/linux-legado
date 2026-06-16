/**
 * 规则切分器 - 通用规则字符串解析与切分
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.RuleAnalyzer 移植。
 * 纯字符串处理，零 Android 依赖，核心逻辑完全保留。
 *
 * 解决 jsonPath 自带的 "&&"/"||" 与阅读规则的冲突，
 * 以及规则正则或字符串中包含 "&&"、"||"、"%%"、"@" 导致的冲突。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:41 nmb - 从 Android 版移植，无修改（纯字符串处理）
 */

package io.legado.model.analyzeRule

/**
 * 通用的规则切分处理
 *
 * @param data 待处理字符串
 * @param code 是否为代码模式（true 时平衡组使用 chompCodeBalanced，处理转义字符）
 */
class RuleAnalyzer(data: String, code: Boolean = false) {

    private var queue: String = data
    private var pos = 0
    private var start = 0
    private var startX = 0

    private var rule = ArrayList<String>()
    private var step: Int = 0
    /** 当前分割字符串类型："&&"、"||"、"%%" */
    var elementsType = ""

    /** 修剪当前规则之前的"@"或者空白符 */
    fun trim() {
        if (queue[pos] == '@' || queue[pos] < '!') {
            pos++
            while (queue[pos] == '@' || queue[pos] < '!') pos++
            start = pos
            startX = pos
        }
    }

    /** 将 pos 重置为 0，方便复用 */
    fun reSetPos() {
        pos = 0
        startX = 0
    }

    /**
     * 从剩余字串中拉出一个字符串，直到但不包括匹配序列
     * @param seq 查找的字符串（区分大小写）
     * @return 是否找到相应字段
     */
    private fun consumeTo(seq: String): Boolean {
        start = pos
        val offset = queue.indexOf(seq, pos)
        return if (offset != -1) {
            pos = offset
            true
        } else false
    }

    /**
     * 从剩余字串中拉出一个字符串，直到匹配序列中的一项
     * @param seq 匹配字符串序列
     * @return 成功返回 true 并设置 step，失败返回 false
     */
    private fun consumeToAny(vararg seq: String): Boolean {
        var pos = pos
        while (pos != queue.length) {
            for (s in seq) {
                if (queue.regionMatches(pos, s, 0, s.length)) {
                    step = s.length
                    this.pos = pos
                    return true
                }
            }
            pos++
        }
        return false
    }

    /**
     * 查找下一个匹配字符的位置
     * @param seq 匹配字符序列
     * @return 匹配位置，未找到返回 -1
     */
    private fun findToAny(vararg seq: Char): Int {
        var pos = pos
        while (pos != queue.length) {
            for (s in seq) if (queue[pos] == s) return pos
            pos++
        }
        return -1
    }

    /**
     * 拉出一个非内嵌代码平衡组，存在转义文本
     */
    private fun chompCodeBalanced(open: Char, close: Char): Boolean {
        var pos = pos
        var depth = 0
        var otherDepth = 0
        var inSingleQuote = false
        var inDoubleQuote = false

        do {
            if (pos == queue.length) break
            val c = queue[pos++]
            if (c != ESC) {
                if (c == '\'' && !inDoubleQuote) inSingleQuote = !inSingleQuote
                else if (c == '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote
                if (inSingleQuote || inDoubleQuote) continue
                if (c == '[') depth++
                else if (c == ']') depth--
                else if (depth == 0) {
                    if (c == open) otherDepth++
                    else if (c == close) otherDepth--
                }
            } else pos++
        } while (depth > 0 || otherDepth > 0)

        return if (depth > 0 || otherDepth > 0) false else {
            this.pos = pos
            true
        }
    }

    /**
     * 拉出一个规则平衡组，引号内转义字符无效
     */
    private fun chompRuleBalanced(open: Char, close: Char): Boolean {
        var pos = pos
        var depth = 0
        var inSingleQuote = false
        var inDoubleQuote = false

        do {
            if (pos == queue.length) break
            val c = queue[pos++]
            if (c == '\'' && !inDoubleQuote) inSingleQuote = !inSingleQuote
            else if (c == '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote
            if (inSingleQuote || inDoubleQuote) continue
            else if (c == '\\') {
                pos++
                continue
            }
            if (c == open) depth++
            else if (c == close) depth--
        } while (depth > 0)

        return if (depth > 0) false else {
            this.pos = pos
            true
        }
    }

    /**
     * 高效切分规则，避免正则和中间变量
     * 解决 jsonPath 自带的 "&&"/"||" 与阅读规则冲突
     */
    tailrec fun splitRule(vararg split: String): ArrayList<String> {
        if (split.size == 1) {
            elementsType = split[0]
            return if (!consumeTo(elementsType)) {
                rule += queue.substring(startX)
                rule
            } else {
                step = elementsType.length
                splitRule()
            }
        } else if (!consumeToAny(*split)) {
            rule += queue.substring(startX)
            return rule
        }

        val end = pos
        pos = start

        do {
            val st = findToAny('[', '(')
            if (st == -1) {
                rule = arrayListOf(queue.substring(startX, end))
                elementsType = queue.substring(end, end + step)
                pos = end + step
                while (consumeTo(elementsType)) {
                    rule += queue.substring(start, pos)
                    pos += step
                }
                rule += queue.substring(pos)
                return rule
            }
            if (st > end) {
                rule = arrayListOf(queue.substring(startX, end))
                elementsType = queue.substring(end, end + step)
                pos = end + step
                while (consumeTo(elementsType) && pos < st) {
                    rule += queue.substring(start, pos)
                    pos += step
                }
                return if (pos > st) {
                    startX = start
                    splitRule()
                } else {
                    rule += queue.substring(pos)
                    rule
                }
            }
            pos = st
            val next = if (queue[pos] == '[') ']' else ')'
            if (!chompBalanced(queue[pos], next)) throw Error(
                queue.substring(0, start) + "后未平衡"
            )
        } while (end > pos)

        start = pos
        return splitRule(*split)
    }

    /**
     * 二段匹配（elementsType 已确定）
     */
    @JvmName("splitRuleNext")
    private tailrec fun splitRule(): ArrayList<String> {
        val end = pos
        pos = start

        do {
            val st = findToAny('[', '(')
            if (st == -1) {
                rule += arrayOf(queue.substring(startX, end))
                pos = end + step
                while (consumeTo(elementsType)) {
                    rule += queue.substring(start, pos)
                    pos += step
                }
                rule += queue.substring(pos)
                return rule
            }
            if (st > end) {
                rule += arrayListOf(queue.substring(startX, end))
                pos = end + step
                while (consumeTo(elementsType) && pos < st) {
                    rule += queue.substring(start, pos)
                    pos += step
                }
                return if (pos > st) {
                    startX = start
                    splitRule()
                } else {
                    rule += queue.substring(pos)
                    rule
                }
            }
            pos = st
            val next = if (queue[pos] == '[') ']' else ')'
            if (!chompBalanced(queue[pos], next)) throw Error(
                queue.substring(0, start) + "后未平衡"
            )
        } while (end > pos)

        start = pos
        return if (!consumeTo(elementsType)) {
            rule += queue.substring(startX)
            rule
        } else splitRule()
    }

    /**
     * 替换内嵌规则（起始标志 + 平衡组结束）
     * @param inner 起始标志，如 "{$."
     * @param startStep 不属于规则部分的前置字符长度
     * @param endStep 不属于规则部分的后置字符长度
     * @param fr 查找到内嵌规则时的解析函数
     */
    fun innerRule(
        inner: String,
        startStep: Int = 1,
        endStep: Int = 1,
        fr: (String) -> String?
    ): String {
        val st = StringBuilder()
        while (consumeTo(inner)) {
            val posPre = pos
            if (chompCodeBalanced('{', '}')) {
                val frv = fr(queue.substring(posPre + startStep, pos - endStep))
                if (!frv.isNullOrEmpty()) {
                    st.append(queue.substring(startX, posPre) + frv)
                    startX = pos
                    continue
                }
            }
            pos += inner.length
        }
        return if (startX == 0) "" else st.apply {
            append(queue.substring(startX))
        }.toString()
    }

    /**
     * 替换内嵌规则（起始字符串 + 结束字符串）
     */
    fun innerRule(
        startStr: String,
        endStr: String,
        fr: (String) -> String?
    ): String {
        val st = StringBuilder()
        while (consumeTo(startStr)) {
            pos += startStr.length
            val posPre = pos
            if (consumeTo(endStr)) {
                val frv = fr(queue.substring(posPre, pos))
                st.append(queue.substring(startX, posPre - startStr.length) + frv)
                pos += endStr.length
                startX = pos
            }
        }
        return if (startX == 0) queue else st.apply {
            append(queue.substring(startX))
        }.toString()
    }

    /** 平衡组函数选择：json/JavaScript 时使用代码平衡，否则使用规则平衡 */
    val chompBalanced = if (code) ::chompCodeBalanced else ::chompRuleBalanced

    companion object {
        /** 转义字符 */
        private const val ESC = '\\'
    }
}