/**
 * API 统一响应模型 - 与 Android 版 ReturnData 完全兼容
 *
 * 前端期望的 JSON 结构：
 * { "isSuccess": boolean, "errorMsg": string, "data": any }
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本（对齐 Android 版 io.legado.app.api.ReturnData）
 */

package io.legado.api.model

/**
 * API 统一响应数据包装类
 *
 * 与 Android 版 io.legado.app.api.ReturnData 字段名和结构完全一致，
 * 确保前端 api.ts 中 LegagdoApiResponse<T> 类型可直接使用。
 *
 * @param T 响应数据类型
 * @property isSuccess 是否成功
 * @property errorMsg 错误信息（成功时为空）
 * @property data 响应数据
 */
data class ReturnData(
    var isSuccess: Boolean = true,
    var errorMsg: String = "",
    var data: Any? = null
) {
    /**
     * 设置错误信息并标记失败
     * 与 Android 版 setErrorMsg 方法签名一致，支持链式调用
     */
    fun setErrorMsg(msg: String): ReturnData {
        isSuccess = false
        errorMsg = msg
        return this
    }

    /**
     * 设置响应数据并标记成功
     * 与 Android 版 setData 方法签名一致
     */
    fun setData(data: Any?): ReturnData {
        isSuccess = true
        this.data = data
        return this
    }
}