/**
 * 规则数据默认实现 - 简单的内存变量存储
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.RuleData 移植。
 * 所有变量存储在内存 HashMap 中，大变量不进行特殊处理。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:40 nmb - 从 Android 版移植，去除 Android 依赖
 */

package io.legado.model.analyzeRule

import io.legado.model.GSON

class RuleData : RuleDataInterface {

    override val variableMap by lazy {
        hashMapOf<String, String>()
    }

    override fun putBigVariable(key: String, value: String?) {
        if (value == null) {
            variableMap.remove(key)
        } else {
            variableMap[key] = value
        }
    }

    override fun getBigVariable(key: String): String? {
        return null
    }

    /**
     * 导出所有变量为 JSON 字符串
     * @return JSON 格式的变量映射，空映射时返回 null
     */
    fun getVariable(): String? {
        if (variableMap.isEmpty()) {
            return null
        }
        return GSON.toJson(variableMap)
    }
}