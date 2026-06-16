/**
 * 规则数据接口 - 定义变量存取的统一契约
 *
 * 从 Android 版 io.legado.app.model.analyzeRule.RuleDataInterface 移植。
 * 提供变量（variable）的存储与获取能力，支持大变量分离存储。
 * 在书源规则执行过程中，@put/@get 操作通过此接口存取临时变量。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 14:40 nmb - 从 Android 版移植，去除 Android 依赖
 */

package io.legado.model.analyzeRule

interface RuleDataInterface {

    /** 变量映射表，存储小变量（长度 < 10000） */
    val variableMap: HashMap<String, String>

    /**
     * 存储变量
     *
     * 小变量（<10000字符）存入 variableMap，大变量委托给 putBigVariable。
     *
     * @param key 变量名
     * @param value 变量值，null 表示删除
     * @return 是否为新增 key（true=新增，false=更新或删除）
     */
    fun putVariable(key: String, value: String?): Boolean {
        val keyExist = variableMap.contains(key)
        return when {
            value == null -> {
                variableMap.remove(key)
                putBigVariable(key, null)
                keyExist
            }
            value.length < 10000 -> {
                putBigVariable(key, null)
                variableMap[key] = value
                true
            }
            else -> {
                variableMap.remove(key)
                putBigVariable(key, value)
                keyExist
            }
        }
    }

    /**
     * 存储大变量（>=10000字符）
     * 由实现类决定存储方式（如文件、数据库等）
     */
    fun putBigVariable(key: String, value: String?)

    /**
     * 获取变量值
     * 优先从 variableMap 获取，未命中再查询大变量存储
     */
    fun getVariable(key: String): String {
        return variableMap[key] ?: getBigVariable(key) ?: ""
    }

    /**
     * 获取大变量
     * 由实现类决定获取方式
     */
    fun getBigVariable(key: String): String?
}