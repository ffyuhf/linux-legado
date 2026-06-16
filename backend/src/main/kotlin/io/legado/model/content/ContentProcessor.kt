package io.legado.model.content

import io.legado.data.repository.ReplaceRuleRepository
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ResultRow
import org.slf4j.LoggerFactory

object ContentProcessor {
    private val log = LoggerFactory.getLogger("ContentProcessor")

    fun process(bookName: String, bookOrigin: String, content: String, includeTitle: Boolean = false): String {
        if (content.isBlank()) return content
        var p = content
        ReplaceRuleRepository.getAll().forEach { row ->
            val m = rowToMap(row)
            if ((m["isEnabled"] as? Number)?.toInt() == 0) return@forEach
            val pat = m["pattern"] as? String ?: ""
            if (pat.isEmpty()) return@forEach
            val rep = m["replacement"] as? String ?: ""
            val regex = (m["isRegex"] as? Number)?.toInt() == 1
            try {
                p = if (regex) p.replace(pat.toRegex(), rep) else p.replace(pat, rep)
            } catch (_: Exception) {}
        }
        return p.replace("\r\n", "\n").replace("\r", "\n").replace(Regex("\\n{3,}"), "\n\n").trim()
    }

    @Suppress("UNCHECKED_CAST")
    private fun rowToMap(row: ResultRow): Map<String, Any?> {
        val m = mutableMapOf<String, Any?>()
        (row as Map<Column<*>, Any?>).forEach { (k, v) -> m[k.name] = v }
        return m
    }
}