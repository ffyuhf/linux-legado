/**
 * Legado Linux 后端 - 应用配置
 *
 * 集中管理应用级配置参数：端口、数据目录、数据库名等。
 * 替代 Android 版的 SharedPreferences 配置存储。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado

import java.io.File

object AppConfig {

    // ==================== 服务器配置 ====================

    /** HTTP 服务监听端口，与 Android 版 WebService 默认端口一致 */
    val port: Int
        get() = System.getProperty("legado.port")?.toIntOrNull() ?: 1122

    /** 监听地址，默认所有网卡 */
    val host: String
        get() = System.getProperty("legado.host") ?: "0.0.0.0"

    // ==================== 数据目录 ====================

    /** 应用数据根目录，默认 ~/.legado/ */
    val dataDir: File
        get() = File(System.getProperty("legado.dataDir")
            ?: "${System.getProperty("user.home")}/.legado")

    /** 数据库文件目录 */
    val databaseDir: File
        get() = File(dataDir, "database")

    /** 缓存目录 */
    val cacheDir: File
        get() = File(dataDir, "cache")

    /** 书籍存储目录 */
    val bookDir: File
        get() = File(dataDir, "bookStorage")

    /** 数据库文件名，与 Android 版一致 */
    const val DATABASE_NAME = "legado.db"

    // ==================== 初始化 ====================

    /**
     * 确保所有必要目录存在
     */
    fun ensureDirectories() {
        dataDir.mkdirs()
        databaseDir.mkdirs()
        cacheDir.mkdirs()
        bookDir.mkdirs()
    }
}