package io.legado.utils

import org.apache.commons.text.StringEscapeUtils
import java.net.URL
import java.util.regex.Pattern

object HtmlFormatter {
    private val htmlTagPattern = Pattern.compile("<[^>]+>")
    private val imgTagPattern = Pattern.compile("<img[^>]*src=[\"']([^\"']+)[\"'][^>]*>", Pattern.CASE_INSENSITIVE)
    private val brTagPattern = Pattern.compile("<br\\s*/?>", Pattern.CASE_INSENSITIVE)
    private val multiNewlinePattern = Pattern.compile("\n{3,}")

    fun format(html: String): String {
        if (html.isEmpty()) return html
        var result = html
        result = brTagPattern.matcher(result).replaceAll("\n")
        result = htmlTagPattern.matcher(result).replaceAll("")
        result = StringEscapeUtils.unescapeHtml4(result)
        result = multiNewlinePattern.matcher(result).replaceAll("\n\n")
        return result.trim()
    }

    fun formatKeepImg(html: String, baseUrl: String? = null): String {
        if (html.isEmpty()) return html
        var result = html
        result = brTagPattern.matcher(result).replaceAll("\n")
        result = imgTagPattern.matcher(result).replaceAll { matchResult ->
            val src = matchResult.group(1) ?: ""
            val absoluteSrc = if (baseUrl != null) getAbsoluteURL(baseUrl, src) else src
            "\n{{IMG:$absoluteSrc}}\n"
        }
        result = htmlTagPattern.matcher(result).replaceAll("")
        result = StringEscapeUtils.unescapeHtml4(result)
        result = multiNewlinePattern.matcher(result).replaceAll("\n\n")
        return result.trim()
    }

    private fun getAbsoluteURL(baseUrl: String?, relativeUrl: String): String {
        if (relativeUrl.isEmpty()) return ""
        if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) return relativeUrl
        if (relativeUrl.startsWith("//")) return "https:$relativeUrl"
        return try { URL(URL(baseUrl ?: ""), relativeUrl).toString() } catch (_: Exception) { relativeUrl }
    }
}