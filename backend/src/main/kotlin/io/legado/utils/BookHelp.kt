/**
 * 书籍辅助工具 - 书名/作者格式化等
 *
 * 从 Android 版 io.legado.app.help.book.BookHelp 移植。
 * 移除 Android 依赖，保留核心格式化逻辑。
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 19:23 nmb - 从 Android 版移植
 */

package io.legado.utils

/**
 * 书籍辅助工具类
 */
object BookHelp {

    /**
     * 格式化书名
     * 去除常见的书名前缀/后缀噪声文本
     *
     * @param name 原始书名
     * @return 格式化后的书名
     */
    fun formatBookName(name: String): String {
        if (name.isBlank()) return name
        var result = name.trim()
        // 去除常见前缀
        val prefixRegex = Regex("^[（(]?[《]?(?:完|全|连载|更新).*?[》]?[）)]?\\s*")
        result = result.replace(prefixRegex, "")
        // 替换不规范的书名号
        result = result.replace("【", "《").replace("】", "》")
        return result.trim()
    }

    /**
     * 格式化作者名
     * 去除常见的作者前缀/后缀噪声文本
     *
     * @param author 原始作者文本
     * @return 格式化后的作者名
     */
    fun formatBookAuthor(author: String): String {
        if (author.isBlank()) return author
        var result = author.trim()
        // 去除常见前缀 作者/著/作 者
        val prefixRegex = Regex("^[作著]\\s*者[：:]?\\s*|^作者[：:]?\\s*")
        result = result.replace(prefixRegex, "")
        // 去除常见后缀 著/作
        val suffixRegex = Regex("\\s*[著作]$")
        result = result.replace(suffixRegex, "")
        // 去除纯空格
        result = result.trim()
        return result
    }

    /**
     * 检查是否为本地书籍（origin == "loc_book"）
     */
    fun isLocalBook(origin: String?): Boolean {
        return origin == "loc_book"
    }
}