/**
 * Exposed 数据库表定义 - 对齐 Android Room Schema v89
 *
 * 所有表定义严格对齐 Android 版 Room Schema v89 的字段名、类型、默认值，
 * 确保 Android 版 legado.db 数据库文件可直接被 Linux 版读取使用。
 *
 * 说明：
 * - Room 的 @Entity 注解转换为 Exposed 的 object : Table()
 * - Room 的 TypeConverter（JSON 字段）在 Exposed 中使用 textColumn 存储 JSON 字符串
 * - 布尔字段在 SQLite 中存储为 INTEGER（0/1），Exposed 使用 integer()
 *
 * 创建日期: 2026-06-13
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本（核心9张表）
 */

package io.legado.data.database.tables

import org.jetbrains.exposed.sql.Table

// ==================== 书籍表 ====================

/**
 * 书籍表 - 对齐 Room Schema: books
 * 主键: bookUrl
 * 来源: Android 版 io.legado.app.data.entities.Book
 */
object BookTable : Table("books") {
    /** 书籍URL，唯一标识 */
    val bookUrl = text("bookUrl").default("")
    /** 目录页URL */
    val tocUrl = text("tocUrl").default("")
    /** 书源URL（关联 book_sources.bookSourceUrl） */
    val origin = text("origin").default("loc_book")
    /** 书源名称 */
    val originName = text("originName").default("")
    /** 书名 */
    val name = text("name").default("")
    /** 作者 */
    val author = text("author").default("")
    /** 分类标签 */
    val kind = text("kind").nullable()
    /** 自定义标签 */
    val customTag = text("customTag").nullable()
    /** 封面URL */
    val coverUrl = text("coverUrl").nullable()
    /** 自定义封面URL */
    val customCoverUrl = text("customCoverUrl").nullable()
    /** 简介 */
    val intro = text("intro").nullable()
    /** 自定义简介 */
    val customIntro = text("customIntro").nullable()
    /** 编码格式 */
    val charset = text("charset").nullable()
    /** 类型: 0文本 1音频 2图片 3文件 4视频 */
    val type = integer("type").default(0)
    /** 分组（位掩码） */
    val group = integer("group").default(0)
    /** 最新章节标题 */
    val latestChapterTitle = text("latestChapterTitle").nullable()
    /** 最新章节时间 */
    val latestChapterTime = long("latestChapterTime").default(0)
    /** 最后检查时间 */
    val lastCheckTime = long("lastCheckTime").default(0)
    /** 最后检查到的更新数 */
    val lastCheckCount = integer("lastCheckCount").default(0)
    /** 总章节数 */
    val totalChapterNum = integer("totalChapterNum").default(0)
    /** 当前阅读章节标题 */
    val durChapterTitle = text("durChapterTitle").nullable()
    /** 当前阅读章节索引 */
    val durChapterIndex = integer("durChapterIndex").default(0)
    /** 当前阅读卷索引 */
    val durVolumeIndex = integer("durVolumeIndex").default(0)
    /** 卷内章节索引 */
    val chapterInVolumeIndex = integer("chapterInVolumeIndex").default(0)
    /** 当前阅读位置 */
    val durChapterPos = integer("durChapterPos").default(0)
    /** 当前阅读时间 */
    val durChapterTime = long("durChapterTime").default(0)
    /** 字数 */
    val wordCount = text("wordCount").nullable()
    /** 是否可更新 */
    val canUpdate = integer("canUpdate").default(1)
    /** 排序 */
    val order = integer("order").default(0)
    /** 书源排序 */
    val originOrder = integer("originOrder").default(0)
    /** 自定义变量（JSON） */
    val variable = text("variable").nullable()
    /** 阅读配置（JSON） */
    val readConfig = text("readConfig").nullable()
    /** 同步时间 */
    val syncTime = long("syncTime").default(0)

    override val primaryKey = PrimaryKey(bookUrl)

    /** 书名+作者唯一索引 */
    init {
        uniqueIndex("index_books_name_author", name, author)
    }
}

// ==================== 书籍分组表 ====================

/**
 * 书籍分组表 - 对齐 Room Schema: book_groups
 * 主键: groupId
 * 来源: Android 版 io.legado.app.data.entities.BookGroup
 */
object BookGroupTable : Table("book_groups") {
    val groupId = integer("groupId")
    val groupName = text("groupName")
    val cover = text("cover").nullable()
    val order = integer("order")
    val enableRefresh = integer("enableRefresh").default(1)
    val show = integer("show").default(1)
    val bookSort = integer("bookSort").default(-1)
    val onlyUpdateRead = integer("onlyUpdateRead").default(0)

    override val primaryKey = PrimaryKey(groupId)
}

// ==================== 书源表 ====================

/**
 * 书源表 - 对齐 Room Schema: book_sources
 * 主键: bookSourceUrl
 * 来源: Android 版 io.legado.app.data.entities.BookSource
 *
 * 注意: rule* 字段在 Room 中通过 TypeConverter 以 JSON TEXT 存储，
 * Exposed 中同样使用 text() 存储 JSON 字符串。
 */
object BookSourceTable : Table("book_sources") {
    /** 书源URL（地址），主键 */
    val bookSourceUrl = text("bookSourceUrl")
    /** 书源名称 */
    val bookSourceName = text("bookSourceName")
    /** 书源分组 */
    val bookSourceGroup = text("bookSourceGroup").nullable()
    /** 类型: 0文本 1音频 2图片 3文件 4视频 */
    val bookSourceType = integer("bookSourceType")
    /** 详情页URL正则 */
    val bookUrlPattern = text("bookUrlPattern").nullable()
    /** 手动排序编号 */
    val customOrder = integer("customOrder").default(0)
    /** 是否启用 */
    val enabled = integer("enabled").default(1)
    /** 启用发现 */
    val enabledExplore = integer("enabledExplore").default(1)
    /** JS库 */
    val jsLib = text("jsLib").nullable()
    /** 启用CookieJar */
    val enabledCookieJar = integer("enabledCookieJar").default(0)
    /** 并发率 */
    val concurrentRate = text("concurrentRate").nullable()
    /** 请求头 */
    val header = text("header").nullable()
    /** 登录地址 */
    val loginUrl = text("loginUrl").nullable()
    /** 登录UI（JSON） */
    val loginUi = text("loginUi").nullable()
    /** 登录检测JS */
    val loginCheckJs = text("loginCheckJs").nullable()
    /** 封面解密JS */
    val coverDecodeJs = text("coverDecodeJs").nullable()
    /** 注释 */
    val bookSourceComment = text("bookSourceComment").nullable()
    /** 自定义变量说明 */
    val variableComment = text("variableComment").nullable()
    /** 最后更新时间 */
    val lastUpdateTime = long("lastUpdateTime")
    /** 响应时间 */
    val respondTime = long("respondTime")
    /** 智能排序权重 */
    val weight = integer("weight")
    /** 发现URL */
    val exploreUrl = text("exploreUrl").nullable()
    /** 发现筛选规则 */
    val exploreScreen = text("exploreScreen").nullable()
    /** 发现规则（JSON） */
    val ruleExplore = text("ruleExplore").nullable()
    /** 搜索URL */
    val searchUrl = text("searchUrl").nullable()
    /** 搜索规则（JSON） */
    val ruleSearch = text("ruleSearch").nullable()
    /** 书籍信息规则（JSON） */
    val ruleBookInfo = text("ruleBookInfo").nullable()
    /** 目录规则（JSON） */
    val ruleToc = text("ruleToc").nullable()
    /** 正文规则（JSON） */
    val ruleContent = text("ruleContent").nullable()
    /** 段评规则（JSON） */
    val ruleReview = text("ruleReview").nullable()
    /** 是否监听事件 */
    val eventListener = integer("eventListener").default(0)
    /** 自定义按钮 */
    val customButton = integer("customButton").default(0)

    override val primaryKey = PrimaryKey(bookSourceUrl)

    /** bookSourceUrl 索引 */
    init {
        index("index_book_sources_bookSourceUrl", false, bookSourceUrl)
    }
}

// ==================== 章节表 ====================

/**
 * 章节表 - 对齐 Room Schema: chapters
 * 复合主键: (url, bookUrl)
 * 外键: bookUrl -> books(bookUrl) ON DELETE CASCADE
 * 来源: Android 版 io.legado.app.data.entities.BookChapter
 */
object BookChapterTable : Table("chapters") {
    /** 章节URL */
    val url = text("url")
    /** 章节标题 */
    val title = text("title")
    /** 是否为卷 */
    val isVolume = integer("isVolume")
    /** 基础URL */
    val baseUrl = text("baseUrl")
    /** 所属书籍URL（外键关联 books.bookUrl） */
    val bookUrl = text("bookUrl")
    /** 章节序号 */
    val index = integer("index")
    /** 是否VIP章节 */
    val isVip = integer("isVip")
    /** 是否已购买 */
    val isPay = integer("isPay")
    /** 资源URL */
    val resourceUrl = text("resourceUrl").nullable()
    /** 标签 */
    val tag = text("tag").nullable()
    /** 字数 */
    val wordCount = text("wordCount").nullable()
    /** 起始位置 */
    val start = long("start").nullable()
    /** 结束位置 */
    val end = long("end").nullable()
    /** 起始片段ID */
    val startFragmentId = text("startFragmentId").nullable()
    /** 结束片段ID */
    val endFragmentId = text("endFragmentId").nullable()
    /** 自定义变量（JSON） */
    val variable = text("variable").nullable()
    /** 图片URL */
    val imgUrl = text("imgUrl").nullable()

    override val primaryKey = PrimaryKey(url, bookUrl)

    init {
        index("index_chapters_bookUrl", false, bookUrl)
        uniqueIndex("index_chapters_bookUrl_index", bookUrl, index)
    }
}

// ==================== 替换规则表 ====================

/**
 * 替换规则表 - 对齐 Room Schema: replace_rules
 * 主键: id (自增)
 * 来源: Android 版 io.legado.app.data.entities.ReplaceRule
 */
object ReplaceRuleTable : Table("replace_rules") {
    val id = integer("id").autoIncrement()
    val name = text("name").default("")
    val group = text("group").nullable()
    val pattern = text("pattern").default("")
    val replacement = text("replacement").default("")
    val scope = text("scope").nullable()
    val scopeTitle = integer("scopeTitle").default(0)
    val scopeContent = integer("scopeContent").default(1)
    val excludeScope = text("excludeScope").nullable()
    val isEnabled = integer("isEnabled").default(1)
    val isRegex = integer("isRegex").default(1)
    val timeoutMillisecond = integer("timeoutMillisecond").default(3000)
    val sortOrder = integer("sortOrder").default(0)

    override val primaryKey = PrimaryKey(id)

    init {
        index("index_replace_rules_id", false, id)
    }
}

// ==================== RSS源表 ====================

/**
 * RSS源表 - 对齐 Room Schema: rssSources
 * 主键: sourceUrl
 * 来源: Android 版 io.legado.app.data.entities.RssSource
 *
 * 注意: 与 BookSource 类似的 rule 字段以 JSON TEXT 存储
 */
object RssSourceTable : Table("rssSources") {
    val sourceUrl = text("sourceUrl")
    val sourceName = text("sourceName")
    val sourceIcon = text("sourceIcon")
    val sourceGroup = text("sourceGroup").nullable()
    val sourceComment = text("sourceComment").nullable()
    val enabled = integer("enabled")
    val variableComment = text("variableComment").nullable()
    val jsLib = text("jsLib").nullable()
    val enabledCookieJar = integer("enabledCookieJar").default(0)
    val concurrentRate = text("concurrentRate").nullable()
    val header = text("header").nullable()
    val loginUrl = text("loginUrl").nullable()
    val loginUi = text("loginUi").nullable()
    val loginCheckJs = text("loginCheckJs").nullable()
    val coverDecodeJs = text("coverDecodeJs").nullable()
    val sortUrl = text("sortUrl").nullable()
    val singleUrl = integer("singleUrl")
    val articleStyle = integer("articleStyle").default(0)
    val ruleArticles = text("ruleArticles").nullable()
    val ruleNextPage = text("ruleNextPage").nullable()
    val ruleTitle = text("ruleTitle").nullable()
    val rulePubDate = text("rulePubDate").nullable()
    val ruleDescription = text("ruleDescription").nullable()
    val ruleImage = text("ruleImage").nullable()
    val ruleLink = text("ruleLink").nullable()
    val ruleContent = text("ruleContent").nullable()
    val contentWhitelist = text("contentWhitelist").nullable()
    val contentBlacklist = text("contentBlacklist").nullable()
    val shouldOverrideUrlLoading = text("shouldOverrideUrlLoading").nullable()
    val style = text("style").nullable()
    val enableJs = integer("enableJs").default(1)
    val loadWithBaseUrl = integer("loadWithBaseUrl").default(1)
    val injectJs = text("injectJs").nullable()
    val preloadJs = text("preloadJs").nullable()
    val startHtml = text("startHtml").nullable()
    val startStyle = text("startStyle").nullable()
    val startJs = text("startJs").nullable()
    val showWebLog = integer("showWebLog").default(0)
    val lastUpdateTime = long("lastUpdateTime").default(0)
    val customOrder = integer("customOrder").default(0)
    val type = integer("type").default(0)
    val preload = integer("preload").default(0)
    val cacheFirst = integer("cacheFirst").default(0)
    val searchUrl = text("searchUrl").nullable()

    override val primaryKey = PrimaryKey(sourceUrl)
}

// ==================== Cookie表 ====================

/**
 * Cookie表 - 对齐 Room Schema: cookies
 * 主键: url
 * 来源: Android 版 io.legado.app.data.entities.Cookie
 */
object CookieTable : Table("cookies") {
    val url = text("url")
    val cookie = text("cookie")

    override val primaryKey = PrimaryKey(url)

    init {
        uniqueIndex("index_cookies_url", url)
    }
}

// ==================== 搜索结果缓存表 ====================

/**
 * 搜索结果缓存表 - 对齐 Room Schema: searchBooks
 * 主键: bookUrl
 * 来源: Android 版 io.legado.app.data.entities.SearchBook
 */
object SearchBookTable : Table("searchBooks") {
    val bookUrl = text("bookUrl")
    val origin = text("origin")
    val originName = text("originName")
    val type = integer("type")
    val name = text("name")
    val author = text("author")
    val kind = text("kind").nullable()
    val coverUrl = text("coverUrl").nullable()
    val intro = text("intro").nullable()
    val wordCount = text("wordCount").nullable()
    val latestChapterTitle = text("latestChapterTitle").nullable()
    val tocUrl = text("tocUrl")
    val time = long("time")
    val variable = text("variable").nullable()
    val originOrder = integer("originOrder")
    val chapterWordCountText = text("chapterWordCountText").nullable()
    val chapterWordCount = integer("chapterWordCount").default(-1)
    val respondTime = long("respondTime").default(-1)

    override val primaryKey = PrimaryKey(bookUrl)

    init {
        uniqueIndex("index_searchBooks_bookUrl", bookUrl)
        index("index_searchBooks_origin", false, origin)
    }
}

// ==================== 搜索关键词表 ====================

/**
 * 搜索关键词表 - 对齐 Room Schema: search_keywords
 * 主键: word
 * 来源: Android 版 io.legado.app.data.entities.SearchKeyword
 */
object SearchKeywordTable : Table("search_keywords") {
    val word = text("word")
    val usage = integer("usage")
    val lastUseTime = long("lastUseTime")

    override val primaryKey = PrimaryKey(word)

    init {
        uniqueIndex("index_search_keywords_word", word)
    }
}

// ==================== 缓存表 ====================

/**
 * 缓存表 - 对齐 Room Schema: caches
 * 主键: key
 * 来源: Android 版 io.legado.app.data.entities.Cache
 * 用途: 替代 Android 版 CacheManager 的键值缓存
 */
object CacheTable : Table("caches") {
    val key = text("key")
    val value = text("value").nullable()
    val deadline = long("deadline").default(0)

    override val primaryKey = PrimaryKey(key)
}

// ==================== 排版配置方案表（阶段八新增） ====================

/**
 * 排版配置方案表 - 对齐 Android ReadBookConfig.Config
 *
 * 存储多个排版方案（日间/夜间/EInk 各一套），由 appSettings 中的
 * readStyleSelect / comicStyleSelect 索引选择当前方案。
 * styleType=1 的记录为共享排版方案（全局字体/间距等）。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:27 nmb - 阶段八新增，对齐 Android ReadBookConfig.Config
 */
object ReadConfigTable : Table("read_configs") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 128).default("")
    /** 0=普通方案 1=共享方案 */
    val styleType = integer("styleType").default(0)

    // 背景
    val bgStr = varchar("bgStr", 128).default("#EEEEEE")
    val bgStrNight = varchar("bgStrNight", 128).default("#000000")
    val bgStrEInk = varchar("bgStrEInk", 128).default("#FFFFFF")
    val bgAlpha = integer("bgAlpha").default(100)
    val bgType = integer("bgType").default(0)
    val bgTypeNight = integer("bgTypeNight").default(0)
    val bgTypeEInk = integer("bgTypeEInk").default(0)

    // 文字颜色
    val textColor = varchar("textColor", 32).default("#3E3D3B")
    val textColorNight = varchar("textColorNight", 32).default("#ADADAD")
    val textColorEInk = varchar("textColorEInk", 32).default("#000000")
    val textAccentColor = varchar("textAccentColor", 32).default("#E53935")
    val textAccentColorNight = varchar("textAccentColorNight", 32).default("#FE4D55")
    val textAccentColorEInk = varchar("textAccentColorEInk", 32).default("#000000")

    // 状态栏图标色
    val darkStatusIcon = integer("darkStatusIcon").default(1)
    val darkStatusIconNight = integer("darkStatusIconNight").default(0)
    val darkStatusIconEInk = integer("darkStatusIconEInk").default(1)

    // 翻页动画
    val pageAnim = integer("pageAnim").default(0)
    val pageAnimEInk = integer("pageAnimEInk").default(4)

    // 字体
    val textFont = varchar("textFont", 256).default("")
    val textBold = integer("textBold").default(0)
    val textSize = integer("textSize").default(20)
    val letterSpacing = float("letterSpacing").default(0.1f)
    val lineSpacingExtra = integer("lineSpacingExtra").default(12)
    val paragraphSpacing = integer("paragraphSpacing").default(2)

    // 标题
    val titleMode = integer("titleMode").default(0)
    val titleSize = integer("titleSize").default(0)
    val titleTopSpacing = integer("titleTopSpacing").default(0)
    val titleBottomSpacing = integer("titleBottomSpacing").default(0)

    // 段落
    val paragraphIndent = varchar("paragraphIndent", 16).default("　　")
    val underlineMode = integer("underlineMode").default(0)

    // 内边距
    val paddingBottom = integer("paddingBottom").default(6)
    val paddingLeft = integer("paddingLeft").default(16)
    val paddingRight = integer("paddingRight").default(16)
    val paddingTop = integer("paddingTop").default(6)
    val headerPaddingBottom = integer("headerPaddingBottom").default(0)
    val headerPaddingLeft = integer("headerPaddingLeft").default(16)
    val headerPaddingRight = integer("headerPaddingRight").default(16)
    val headerPaddingTop = integer("headerPaddingTop").default(0)
    val footerPaddingBottom = integer("footerPaddingBottom").default(6)
    val footerPaddingLeft = integer("footerPaddingLeft").default(16)
    val footerPaddingRight = integer("footerPaddingRight").default(16)
    val footerPaddingTop = integer("footerPaddingTop").default(6)

    // 分隔线
    val showHeaderLine = integer("showHeaderLine").default(0)
    val showFooterLine = integer("showFooterLine").default(1)

    // 提示信息
    val tipHeaderLeft = integer("tipHeaderLeft").default(0)
    val tipHeaderMiddle = integer("tipHeaderMiddle").default(0)
    val tipHeaderRight = integer("tipHeaderRight").default(0)
    val tipFooterLeft = integer("tipFooterLeft").default(0)
    val tipFooterMiddle = integer("tipFooterMiddle").default(0)
    val tipFooterRight = integer("tipFooterRight").default(0)
    val tipColor = integer("tipColor").default(0)
    val tipDividerColor = integer("tipDividerColor").default(-1)

    // 头尾模式
    val headerMode = integer("headerMode").default(0)
    val footerMode = integer("footerMode").default(0)

    override val primaryKey = PrimaryKey(id)
}

// ==================== 搜索历史表（阶段八新增） ====================

/**
 * 搜索历史表 - 记录用户搜索关键词
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 01:27 nmb - 阶段八新增
 */
object SearchHistoryTable : Table("search_history") {
    val id = integer("id").autoIncrement()
    val word = varchar("word", 256)
    val time = long("time")

    override val primaryKey = PrimaryKey(id)

    init {
        index("index_search_history_word", false, word)
    }
}
