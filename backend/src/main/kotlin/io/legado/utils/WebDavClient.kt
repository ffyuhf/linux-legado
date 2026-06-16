/**
 * WebDAV 客户端 - 对齐 Android 端 WebDav 同步功能
 *
 * 基于 java.net.HttpURLConnection 实现 WebDAV 协议操作（PUT/GET/PROPFIND/MKCOL）。
 * 支持 Basic Auth 认证，用于备份文件上传至 WebDAV 服务器。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 07:23 nmb - v3.3 初始版本
 */

package io.legado.utils

import io.legado.config.AppSettings
import io.legado.config.SettingKeys
import org.slf4j.LoggerFactory
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets
import java.util.Base64

/**
 * WebDAV 客户端单例
 *
 * 从 AppSettings 读取 WebDAV 连接配置：
 * - WEB_DAV_URL: WebDAV 服务器地址
 * - WEB_DAV_ACCOUNT: 账号
 * - WEB_DAV_PASSWORD: 密码
 * - WEB_DAV_DIR: 远程目录名
 * - WEB_DAV_DEVICE_NAME: 设备名（用于备份文件名标识）
 */
object WebDavClient {

    private val logger = LoggerFactory.getLogger("WebDavClient")

    /** 连接超时（毫秒） */
    private const val CONNECT_TIMEOUT = 15000

    /** 读取超时（毫秒） */
    private const val READ_TIMEOUT = 30000

    /** 备份文件名前缀 */
    private const val BACKUP_FILE_PREFIX = "legadoBackup"

    /** 获取 WebDAV 根地址 */
    private fun getBaseUrl(): String =
        AppSettings.getApp(SettingKeys.WEB_DAV_URL, "").removeSuffix("/")

    /** 获取账号 */
    private fun getAccount(): String =
        AppSettings.getApp(SettingKeys.WEB_DAV_ACCOUNT, "")

    /** 获取密码 */
    private fun getPassword(): String =
        AppSettings.getApp(SettingKeys.WEB_DAV_PASSWORD, "")

    /** 获取远程目录名 */
    private fun getDir(): String =
        AppSettings.getApp(SettingKeys.WEB_DAV_DIR, "legado")

    /** 获取设备名 */
    private fun getDeviceName(): String =
        AppSettings.getApp(SettingKeys.WEB_DAV_DEVICE_NAME, "Linux-Desktop")

    /** 构建 Basic Auth 头 */
    private fun buildAuthHeader(): String {
        val credentials = "${getAccount()}:${getPassword()}"
        val encoded = Base64.getEncoder().encodeToString(credentials.toByteArray(StandardCharsets.UTF_8))
        return "Basic $encoded"
    }

    /**
     * 构建远程完整 URL（含目录路径）
     *
     * @param fileName 远程文件名（可选）
     * @return 完整 URL 字符串
     */
    private fun buildRemoteUrl(fileName: String? = null): String {
        val base = getBaseUrl()
        if (base.isBlank()) return ""
        val dir = getDir()
        val sb = StringBuilder(base)
        if (dir.isNotEmpty()) {
            sb.append("/").append(dir.trim('/'))
        }
        if (!fileName.isNullOrBlank()) {
            sb.append("/").append(fileName.trim('/'))
        }
        return sb.toString()
    }

    /**
     * 检查 WebDAV 连接是否正常
     *
     * @return 连接结果消息
     */
    fun checkConnection(): String {
        val url = getBaseUrl()
        if (url.isBlank()) return "WebDAV 地址未配置"

        return try {
            val conn = URL(url).openConnection() as HttpURLConnection
            conn.requestMethod = "PROPFIND"
            conn.setRequestProperty("Authorization", buildAuthHeader())
            conn.setRequestProperty("Depth", "0")
            conn.connectTimeout = CONNECT_TIMEOUT
            conn.readTimeout = READ_TIMEOUT
            conn.useCaches = false

            val code = conn.responseCode
            if (code in 200..299 || code == 207) {
                "连接成功 (HTTP $code)"
            } else {
                "连接失败 (HTTP $code): ${conn.responseMessage}"
            }
        } catch (e: Exception) {
            logger.warn("WebDAV 连接检查失败: {}", e.localizedMessage)
            "连接失败: ${e.localizedMessage}"
        }
    }

    /**
     * 确保远程目录存在（不存在则创建）
     *
     * @param dirUrl 目录完整 URL
     */
    private fun ensureDirectory(dirUrl: String) {
        if (dirUrl.isBlank()) return
        try {
            val conn = URL(dirUrl).openConnection() as HttpURLConnection
            conn.requestMethod = "MKCOL"
            conn.setRequestProperty("Authorization", buildAuthHeader())
            conn.connectTimeout = CONNECT_TIMEOUT
            conn.readTimeout = READ_TIMEOUT
            conn.useCaches = false
            val code = conn.responseCode
            // 201=创建成功, 405=已存在, 301=已存在重定向
            if (code !in listOf(200, 201, 405, 301)) {
                logger.warn("WebDAV 创建目录返回: {} {}", code, conn.responseMessage)
            }
            conn.disconnect()
        } catch (e: Exception) {
            logger.warn("WebDAV 创建目录异常: {}", e.localizedMessage)
        }
    }

    /**
     * 上传备份文件到 WebDAV
     *
     * @param data 备份文件字节数组
     * @return 上传结果消息
     */
    fun uploadBackup(data: ByteArray): String {
        val base = getBaseUrl()
        if (base.isBlank()) return "WebDAV 地址未配置"

        val dirUrl = buildRemoteUrl(null)
        val fileName = "${BACKUP_FILE_PREFIX}_${getDeviceName()}_${System.currentTimeMillis()}.zip"
        val fileUrl = buildRemoteUrl(fileName)

        return try {
            // 确保目录存在
            ensureDirectory(dirUrl)

            // 上传文件
            val conn = URL(fileUrl).openConnection() as HttpURLConnection
            conn.requestMethod = "PUT"
            conn.setRequestProperty("Authorization", buildAuthHeader())
            conn.setRequestProperty("Content-Type", "application/zip")
            conn.setDoOutput(true)
            conn.connectTimeout = CONNECT_TIMEOUT
            conn.readTimeout = READ_TIMEOUT
            conn.useCaches = false

            conn.outputStream.use { it.write(data) }

            val code = conn.responseCode
            conn.disconnect()

            if (code in 200..299) {
                logger.info("WebDAV 备份上传成功: {} bytes -> {}", data.size, fileUrl)
                "备份已上传: $fileName (${data.size} bytes)"
            } else {
                "上传失败 (HTTP $code)"
            }
        } catch (e: Exception) {
            logger.error("WebDAV 备份上传异常: {}", e.localizedMessage)
            "上传失败: ${e.localizedMessage}"
        }
    }

    /**
     * 从 WebDAV 下载最新备份文件
     *
     * @return 备份文件字节数组，失败返回 null
     */
    fun downloadLatestBackup(): ByteArray? {
        val base = getBaseUrl()
        if (base.isBlank()) return null

        val dirUrl = buildRemoteUrl(null)

        return try {
            // 列出目录内容（PROPFIND）
            val conn = URL(dirUrl).openConnection() as HttpURLConnection
            conn.requestMethod = "PROPFIND"
            conn.setRequestProperty("Authorization", buildAuthHeader())
            conn.setRequestProperty("Depth", "1")
            conn.setRequestProperty("Content-Type", "application/xml")
            conn.connectTimeout = CONNECT_TIMEOUT
            conn.readTimeout = READ_TIMEOUT
            conn.useCaches = false

            if (conn.responseCode !in listOf(207, 200)) {
                logger.warn("WebDAV PROPFIND 失败: {}", conn.responseCode)
                conn.disconnect()
                return null
            }

            // 读取响应体
            val body = conn.inputStream.bufferedReader(StandardCharsets.UTF_8).use { it.readText() }
            conn.disconnect()

            // 从 XML 中提取 href 列表（简易解析，匹配 <d:href> 或 <D:href> 标签）
            val hrefRegex = Regex("(?i)<[a-z]*:?href>([^<]+)</[a-z]*:?href>")
            val hrefs = hrefRegex.findAll(body).map { it.groupValues[1] }.toList()

            // 筛选当前设备的备份文件并按名称排序取最后一个
            val deviceName = getDeviceName()
            val backupHrefs = hrefs.filter {
                it.contains(BACKUP_FILE_PREFIX, ignoreCase = true) &&
                    (deviceName.isBlank() || it.contains(deviceName, ignoreCase = true))
            }.sorted()

            if (backupHrefs.isEmpty()) {
                logger.info("WebDAV 未找到备份文件")
                return null
            }

            val latestPath = backupHrefs.last()
            val downloadUrl = if (latestPath.startsWith("http")) {
                latestPath
            } else {
                getBaseUrl().let { b -> if (latestPath.startsWith("/")) b.substringBefore("/", "") + latestPath else "$b/$latestPath" }
            }

            logger.info("WebDAV 下载最新备份: {}", downloadUrl)

            // 下载文件
            val dlConn = URL(downloadUrl).openConnection() as HttpURLConnection
            dlConn.requestMethod = "GET"
            dlConn.setRequestProperty("Authorization", buildAuthHeader())
            dlConn.connectTimeout = CONNECT_TIMEOUT
            dlConn.readTimeout = READ_TIMEOUT
            dlConn.useCaches = false

            if (dlConn.responseCode !in 200..299) {
                logger.warn("WebDAV 下载失败: {}", dlConn.responseCode)
                dlConn.disconnect()
                return null
            }

            val baos = ByteArrayOutputStream()
            dlConn.inputStream.use { input ->
                val buffer = ByteArray(8192)
                var read: Int
                while (input.read(buffer).also { read = it } != -1) {
                    baos.write(buffer, 0, read)
                }
            }
            dlConn.disconnect()

            logger.info("WebDAV 备份下载成功: {} bytes", baos.size())
            baos.toByteArray()
        } catch (e: Exception) {
            logger.error("WebDAV 备份下载异常: {}", e.localizedMessage)
            null
        }
    }
}