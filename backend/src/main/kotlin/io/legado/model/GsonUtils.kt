/**
 * Gson 工具类 - 提供 JSON 序列化/反序列化能力
 *
 * 与 Android 版 io.legado.app.utils.GSON 行为兼容。
 * 所有 JSON 操作统一通过此工具类，确保命名策略与 Android 版一致。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.model

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import java.lang.reflect.Type

/**
 * 全局 Gson 实例，配置与 Android 版兼容：
 * - 不转义 HTML 字符
 * - 序列化 null 值
 */
val GSON: Gson = GsonBuilder()
    .disableHtmlEscaping()
    .serializeNulls()
    .create()

/**
 * 从 JSON 字符串反序列化为指定类型的对象
 *
 * @param T 目标类型
 * @return Result<T> 成功或失败（与 Android 版 fromJsonObject 用法一致）
 */
inline fun <reified T> fromJsonObject(json: String?): Result<T> {
    return runCatching {
        GSON.fromJson(json, object : TypeToken<T>() {}.type)
    }
}

/**
 * 从 JSON 数组字符串反序列化为 List
 *
 * @param T 列表元素类型
 * @return Result<List<T>> 成功或失败
 */
inline fun <reified T> fromJsonArray(json: String?): Result<List<T>> {
    return runCatching {
        GSON.fromJson(json, object : TypeToken<List<T>>() {}.type) ?: emptyList()
    }
}