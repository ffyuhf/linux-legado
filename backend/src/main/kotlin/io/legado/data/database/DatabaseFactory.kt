/**
 * 数据库工厂 - 初始化 SQLite 连接和表结构
 *
 * 使用 Exposed ORM 连接 SQLite 数据库，自动创建所有表。
 * 数据库文件存储在 ~/.legado/database/legado.db，
 * 与 Android 版数据库名一致，可直接复制 Android 版数据库文件使用。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 */

package io.legado.data.database

import io.legado.AppConfig
import io.legado.data.database.tables.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

object DatabaseFactory {

    private val logger = LoggerFactory.getLogger(DatabaseFactory::class.java)

    /**
     * 初始化数据库连接和表结构
     *
     * 流程：
     * 1. 确保数据目录存在
     * 2. 建立 SQLite 连接
     * 3. 启用 WAL 模式（提高并发读性能）
     * 4. 启用外键约束
     * 5. 创建不存在的表（CREATE TABLE IF NOT EXISTS）
     */
    fun init() {
        // 确保数据目录存在
        AppConfig.ensureDirectories()

        // 数据库文件路径
        val dbPath = "${AppConfig.databaseDir.absolutePath}/${AppConfig.DATABASE_NAME}"
        logger.info("数据库路径: $dbPath")

        // 建立 SQLite 连接（通过 JDBC URL 参数设置 WAL 模式和外键约束）
        // 注意：PRAGMA journal_mode 不能在事务内执行，必须通过 URL 参数或连接属性设置
        Database.connect(
            "jdbc:sqlite:$dbPath?journal_mode=WAL&foreign_keys=ON",
            driver = "org.sqlite.JDBC"
        )

        // 初始化表结构
        transaction {
            // 创建所有表（已存在的表不会被修改）
            SchemaUtils.create(
                BookTable,
                BookGroupTable,
                BookSourceTable,
                BookChapterTable,
                ReplaceRuleTable,
                RssSourceTable,
                CookieTable,
                SearchBookTable,
                CacheTable,
                SearchKeywordTable,
                // 阶段八新增表
                ReadConfigTable,
                SearchHistoryTable
            )
        }

        logger.info("数据库初始化完成")
    }
}