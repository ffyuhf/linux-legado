/**
 * 正则规则解析器 - 通过正则表达式提取内容
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.AnalyzeByRegex 移植。
 * 纯 JRE 正则，零 Android 依赖。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:42 nmb - 从 Android 版移植，去除 @Keep 注解
 */

package io.legado.model.analyzeRule

import java.util.regex.Pattern

/**
 * 正则规则解析器
 * 支持多级正则嵌套匹配，逐层缩小匹配范围
 */
object AnalyzeByRegex {

    /**
     * 获取单个元素（取首次匹配的全部分组）
     *
     * @param res 待匹配字符串
     * @param regs 正则规则数组，按顺序逐级匹配
     * @param index 当前匹配到的规则索引
     * @return 匹配结果列表（包含所有捕获组），未匹配返回 null
     */
    fun getElement(res: String, regs: Array<String>, index: Int = 0): List<String>? {
        var vIndex = index
        val resM = Pattern.compile(regs[vIndex]).matcher(res)
        if (!resM.find()) {
            return null
        }
        // 最后一级规则：提取所有捕获组
        return if (vIndex + 1 == regs.size) {
            val info = arrayListOf<String>()
            for (groupIndex in 0..resM.groupCount()) {
                info.add(resM.group(groupIndex)!!)
            }
            info
        } else {
            // 非最后一级：拼接所有匹配结果，递归下一级
            val result = StringBuilder()
            do {
                result.append(resM.group())
            } while (resM.find())
            getElement(result.toString(), regs, ++vIndex)
        }
    }

    /**
     * 获取元素列表（取所有匹配项的分组）
     *
     * @param res 待匹配字符串
     * @param regs 正则规则数组，按顺序逐级匹配
     * @param index 当前匹配到的规则索引
     * @return 匹配结果列表的列表（每项为一次匹配的所有捕获组）
     */
    fun getElements(res: String, regs: Array<String>, index: Int = 0): List<List<String>> {
        var vIndex = index
        val resM = Pattern.compile(regs[vIndex]).matcher(res)
        if (!resM.find()) {
            return arrayListOf()
        }
        // 最后一级规则：提取所有匹配项的捕获组
        if (vIndex + 1 == regs.size) {
            val books = ArrayList<List<String>>()
            do {
                val info = arrayListOf<String>()
                for (groupIndex in 0..resM.groupCount()) {
                    info.add(resM.group(groupIndex) ?: "")
                }
                books.add(info)
            } while (resM.find())
            return books
        } else {
            // 非最后一级：拼接所有匹配结果，递归下一级
            val result = StringBuilder()
            do {
                result.append(resM.group())
            } while (resM.find())
            return getElements(result.toString(), regs, ++vIndex)
        }
    }
}