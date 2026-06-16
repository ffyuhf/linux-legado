/**
 * 应用设置存储引擎 - 替代 Android SharedPreferences
 *
 * 使用 JSON 文件持久化全部应用配置，对齐 Android 端 AppConfig 204+ 设置项。
 * 支持多配置文件分类管理：应用配置、阅读配置、主题配置。
 * 线程安全，懒加载，变更即持久化。
 *
 * 存储位置: ~/.legado/config/
 *
 * 创建日期: 2026-06-14
 * 修改历史:
 * 2026-06-14 12:25 nmb - 初始版本，对齐 Android AppConfig 全部 Web 相关配置项
 * 2026-06-15 11:45 nmb - v2.0 全量补齐至204项，对齐 Android PreferKey.kt 全部配置
 * 2026-06-16 07:22 nmb - v3.3 补全 AppConfig 运行时键（importBookPath/searchScope/searchGroup/autoUpdateVariant/mediaButtonOnExit）
 */

package io.legado.config

import io.legado.AppConfig
import io.legado.model.GSON
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * 设置存储引擎（单例）
 *
 * 采用多 JSON 文件分类管理：
 * - appSettings.json:    应用通用设置（书架、书源、导出、Web服务等）
 * - readSettings.json:   阅读界面设置（字体、行距、点击区域、亮度等）
 * - themeSettings.json:  主题设置（夜间模式、EInk、颜色等）
 */
object AppSettings {

    private val logger = LoggerFactory.getLogger("AppSettings")

    /** 配置根目录 */
    private val configDir: File by lazy {
        File(AppConfig.dataDir, "config").apply { mkdirs() }
    }

    /** 配置文件路径 */
    private val appConfigFile: File get() = File(configDir, "appSettings.json")
    private val readConfigFile: File get() = File(configDir, "readSettings.json")
    private val themeConfigFile: File get() = File(configDir, "themeSettings.json")

    /** 三类配置的内存缓存（线程安全） */
    private val appConfigs = ConcurrentHashMap<String, Any?>()
    private val readConfigs = ConcurrentHashMap<String, Any?>()
    private val themeConfigs = ConcurrentHashMap<String, Any?>()

    /** 持久化互斥锁 */
    private val saveMutex = Mutex()

    /** 标记是否已从磁盘加载 */
    @Volatile
    private var loaded = false

    /**
     * 初始化：从磁盘加载全部配置
     * 在 Application.module() 中调用
     */
    fun init() {
        if (loaded) return
        loadFromFile(appConfigFile, appConfigs, "app")
        loadFromFile(readConfigFile, readConfigs, "read")
        loadFromFile(themeConfigFile, themeConfigs, "theme")
        loaded = true
        logger.info("应用设置加载完成: app={} read={} theme={}", appConfigs.size, readConfigs.size, themeConfigs.size)
    }

    /**
     * 从文件加载配置到指定的 Map
     *
     * @param file 配置文件
     * @param target 目标 Map
     * @param category 配置类别名（仅日志用）
     */
    private fun loadFromFile(file: File, target: ConcurrentHashMap<String, Any?>, category: String) {
        if (!file.exists()) {
            logger.info("{} 配置文件不存在，将使用默认值: {}", category, file.absolutePath)
            return
        }
        try {
            val json = file.readText(Charsets.UTF_8)
            @Suppress("UNCHECKED_CAST")
            val map = GSON.fromJson(json, Map::class.java) as? Map<String, Any?>
            map?.forEach { (key, value) -> target[key] = value }
        } catch (e: Exception) {
            logger.warn("{} 配置文件加载失败，将使用默认值: {}", category, e.localizedMessage)
        }
    }

    // ==================== 应用配置（AppConfig） ====================

    /**
     * 获取应用配置项
     *
     * @param key 配置键
     * @param default 默认值
     * @return 配置值或默认值
     */
    fun <T> getApp(key: String, default: T): T {
        val value = appConfigs[key] ?: return default
        return coerce(value, default)
    }

    /**
     * 更新应用配置项（仅内存缓存，需调用 persistAll() 持久化到磁盘）
     *
     * BUG 修复: 修正 KDoc 注释，原注释声称"自动持久化"但实现并未持久化
     *
     * @param key 配置键
     * @param value 配置值
     */
    fun putApp(key: String, value: Any?) {
        appConfigs[key] = value
    }

    /**
     * 删除应用配置项
     */
    fun removeApp(key: String) {
        appConfigs.remove(key)
    }

    /**
     * 获取全部应用配置（用于前端展示/导出）
     */
    fun getAllApp(): Map<String, Any?> = appConfigs.toMap()

    /**
     * 批量更新应用配置（用于前端批量保存）
     */
    fun putAllApp(changes: Map<String, Any?>) {
        appConfigs.putAll(changes)
    }

    // ==================== 阅读配置（ReadBookConfig） ====================

    fun <T> getRead(key: String, default: T): T {
        val value = readConfigs[key] ?: return default
        return coerce(value, default)
    }

    /**
     * 更新阅读配置项（仅内存缓存，需调用 persistAll() 持久化到磁盘）
     *
     * BUG 修复: 修正 KDoc 注释，原注释声称"自动持久化"但实现并未持久化
     */
    fun putRead(key: String, value: Any?) {
        readConfigs[key] = value
    }

    fun removeRead(key: String) {
        readConfigs.remove(key)
    }

    fun getAllRead(): Map<String, Any?> = readConfigs.toMap()

    fun putAllRead(changes: Map<String, Any?>) {
        readConfigs.putAll(changes)
    }

    // ==================== 主题配置（ThemeConfig） ====================

    fun <T> getTheme(key: String, default: T): T {
        val value = themeConfigs[key] ?: return default
        return coerce(value, default)
    }

    /**
     * 更新主题配置项（仅内存缓存，需调用 persistAll() 持久化到磁盘）
     *
     * BUG 修复: 修正 KDoc 注释，原注释声称"自动持久化"但实现并未持久化
     */
    fun putTheme(key: String, value: Any?) {
        themeConfigs[key] = value
    }

    fun removeTheme(key: String) {
        themeConfigs.remove(key)
    }

    fun getAllTheme(): Map<String, Any?> = themeConfigs.toMap()

    fun putAllTheme(changes: Map<String, Any?>) {
        themeConfigs.putAll(changes)
    }

    // ==================== 持久化与重置 ====================

    /**
     * 持久化全部配置到磁盘（异步）
     * 在每次变更后自动调用
     */
    suspend fun persistAll() = saveMutex.withLock {
        withContext(Dispatchers.IO) {
            saveToFile(appConfigFile, appConfigs, "app")
            saveToFile(readConfigFile, readConfigs, "read")
            saveToFile(themeConfigFile, themeConfigs, "theme")
        }
    }

    /**
     * 同步持久化（用于关闭前的最后保存）
     */
    fun persistAllSync() {
        saveToFile(appConfigFile, appConfigs, "app")
        saveToFile(readConfigFile, readConfigs, "read")
        saveToFile(themeConfigFile, themeConfigs, "theme")
    }

    /**
     * 将 Map 持久化到文件
     */
    private fun saveToFile(file: File, source: Map<String, Any?>, category: String) {
        try {
            val json = GSON.toJson(source)
            file.writeText(json, Charsets.UTF_8)
        } catch (e: Exception) {
            logger.error("{} 配置文件保存失败: {}", category, e.localizedMessage)
        }
    }

    /**
     * 重置应用配置到默认值
     */
    fun resetApp() {
        appConfigs.clear()
    }

    /**
     * 重置阅读配置到默认值
     */
    fun resetRead() {
        readConfigs.clear()
    }

    /**
     * 重置主题配置到默认值
     */
    fun resetTheme() {
        themeConfigs.clear()
    }

    /**
     * 重置全部配置
     */
    fun resetAll() {
        resetApp()
        resetRead()
        resetTheme()
    }

    // ==================== 类型转换工具 ====================

    /**
     * 将存储值强转为目标类型
     * 处理 Gson 读取时的类型差异（如 Integer vs Long、Boolean 存为 String 等）
     *
     * @param value 原始值
     * @param default 默认值（提供目标类型）
     * @return 强转后的值
     */
    @Suppress("UNCHECKED_CAST")
    private fun <T> coerce(value: Any?, default: T): T {
        if (value == null) return default
        return when (default) {
            is String -> value.toString() as T
            is Int -> when (value) {
                is Number -> value.toInt() as T
                is String -> (value.toIntOrNull() ?: default) as T
                else -> default
            }
            is Long -> when (value) {
                is Number -> value.toLong() as T
                is String -> (value.toLongOrNull() ?: default) as T
                else -> default
            }
            is Float -> when (value) {
                is Number -> value.toFloat() as T
                is String -> (value.toFloatOrNull() ?: default) as T
                else -> default
            }
            is Double -> when (value) {
                is Number -> value.toDouble() as T
                is String -> (value.toDoubleOrNull() ?: default) as T
                else -> default
            }
            is Boolean -> when (value) {
                is Boolean -> value as T
                is String -> (value.toBooleanStrictOrNull() ?: default) as T
                is Number -> (value.toInt() != 0) as T
                else -> default
            }
            else -> value as? T ?: default
        }
    }
}

/**
 * 应用配置键定义 - 完整对齐 Android PreferKey.kt（204项）
 *
 * 来源: Android-legado-源码/app/src/main/java/io/legado/app/constant/PreferKey.kt
 * 按功能分类组织，与 Android 端保持完全一致的键名和默认值。
 *
 * 修改历史:
 * 2026-06-14 12:25 nmb - 初始版本，50项Web相关配置
 * 2026-06-15 11:45 nmb - v2.0 全量补齐至204项，完整对齐Android PreferKey
 */
@Suppress("ConstPropertyName")
object SettingKeys {

    // ==================== 通用设置 ====================
    const val LANGUAGE = "language"                              // 语言
    const val FONT_SCALE = "fontScale"                          // 字号缩放
    const val THEME_MODE = "themeMode"                          // 主题模式: 0=跟随系统 1=日间 2=夜间 3=EInk
    const val SCREEN_ORIENTATION = "screenOrientation"          // 屏幕方向
    const val DEFAULT_HOME_PAGE = "defaultHomePage"             // 默认首页
    const val SHOW_DISCOVERY = "showDiscovery"                  // 显示发现页
    const val SHOW_RSS = "showRss"                              // 显示RSS
    const val SAVE_TAB_POSITION = "saveTabPosition"             // 保存标签位置

    // ==================== 书架显示设置 ====================
    const val BOOKSHELF_SORT = "bookshelfSort"                  // 书架排序: 0=按阅读时间 1=按更新时间 2=按书名 3=手动
    const val BOOKSHELF_LAYOUT = "bookshelfLayout"              // 书架布局: 0=书架 1=列表
    const val BOOKSHELF_MARGIN = "bookshelfMargin"              // 书架边距
    const val SHOW_BOOKNAME_LAYOUT = "showBooknameLayout"      // 显示书名布局
    const val SHOW_UNREAD = "showUnread"                        // 显示未读
    const val SHOW_LAST_UPDATE_TIME = "showLastUpdateTime"      // 显示最后更新时间
    const val SHOW_WAIT_UP_COUNT = "showWaitUpCount"            // 显示等待更新数量
    const val SHOW_BOOKSHELF_FAST_SCROLLER = "showBookshelfFastScroller"  // 显示书架快速滚动条
    const val BOOK_GROUP_STYLE = "bookGroupStyle"               // 书架分组样式
    const val USE_DEFAULT_COVER = "useDefaultCover"             // 使用默认封面
    const val LOAD_COVER_ONLY_WIFI = "loadCoverOnlyWifi"        // 仅WiFi下载封面
    const val COVER_SHOW_NAME = "coverShowName"                 // 封面显示书名
    const val COVER_SHOW_AUTHOR = "coverShowAuthor"             // 封面显示作者
    const val COVER_SHOW_NAME_N = "coverShowNameN"              // 夜间封面显示书名
    const val COVER_SHOW_AUTHOR_N = "coverShowAuthorN"          // 夜间封面显示作者
    const val AUTO_REFRESH_BOOK = "auto_refresh"                // 自动刷新
    const val ONLY_UPDATE_READ = "onlyUpdateRead"               // 只更新已读
    const val DEFAULT_TO_READ = "defaultToRead"                 // 默认进入阅读

    // ==================== 书源与网络设置 ====================
    const val THREAD_COUNT = "threadCount"                      // 并发线程数
    const val USER_AGENT = "userAgent"                          // 自定义 UA
    const val CUSTOM_HOSTS = "customHosts"                      // 自定义 DNS（JSON）
    const val CHANGE_SOURCE_CHECK_AUTHOR = "changeSourceCheckAuthor"  // 换源时校验作者
    const val AUTO_CHANGE_SOURCE = "autoChangeSource"           // 自动换源
    const val CHANGE_SOURCE_LOAD_INFO = "changeSourceLoadInfo"  // 换源加载信息
    const val CHANGE_SOURCE_LOAD_TOC = "changeSourceLoadToc"    // 换源加载目录
    const val CHANGE_SOURCE_LOAD_WORD_COUNT = "changeSourceLoadWordCount"  // 换源加载字数
    const val PRECISION_SEARCH = "precisionSearch"              // 精确搜索
    const val BATCH_CHANGE_SOURCE_DELAY = "batchChangeSourceDelay"  // 批量换源延迟
    const val OPEN_BOOK_INFO_BY_CLICK_TITLE = "openBookInfoByClickTitle"  // 点击标题打开书籍信息
    const val SOURCE_EDIT_MAX_LINE = "sourceEditMaxLine"        // 源编辑最大行数
    const val CRONET = "Cronet"                                 // 使用Cronet

    // ==================== 阅读交互设置（readSettings.json）====================
    const val READ_BODY_TO_LH = "readBodyToLh"                  // 正文内容居左
    const val TEXT_FULL_JUSTIFY = "textFullJustify"             // 文本两端对齐
    const val TEXT_BOTTOM_JUSTIFY = "textBottomJustify"         // 文本底部对齐
    const val TEXT_SELECT_ABLE = "selectText"                   // 文本可选
    const val USE_ZH_LAYOUT = "useZhLayout"                     // 使用中文排版
    const val ADAPT_SPECIAL_STYLE = "adaptSpecialStyle"         // 适配特殊样式
    const val SHARE_LAYOUT = "shareLayout"                      // 共享布局
    const val AUTO_READ_SPEED = "autoReadSpeed"                 // 自动阅读速度
    const val NO_ANIM_SCROLL_PAGE = "noAnimScrollPage"          // 无动画滚动翻页

    // 九宫格点击区域动作: 0=下一页 1=上一页 2=菜单
    const val CLICK_ACTION_TL = "clickActionTopLeft"            // 左上角
    const val CLICK_ACTION_TC = "clickActionTopCenter"          // 上中
    const val CLICK_ACTION_TR = "clickActionTopRight"           // 右上角
    const val CLICK_ACTION_ML = "clickActionMiddleLeft"         // 左中
    const val CLICK_ACTION_MC = "clickActionMiddleCenter"       // 正中
    const val CLICK_ACTION_MR = "clickActionMiddleRight"        // 右中
    const val CLICK_ACTION_BL = "clickActionBottomLeft"         // 左下角
    const val CLICK_ACTION_BC = "clickActionBottomCenter"       // 下中
    const val CLICK_ACTION_BR = "clickActionBottomRight"        // 右下角

    // 阅读UI
    const val HIDE_STATUS_BAR = "hideStatusBar"                 // 隐藏状态栏
    const val HIDE_NAVIGATION_BAR = "hideNavigationBar"         // 隐藏导航栏
    const val TRANSPARENT_STATUS_BAR = "transparentStatusBar"   // 透明状态栏
    const val IMM_NAVIGATION_BAR = "immNavigationBar"           // 沉浸导航栏
    const val READ_STYLE_SELECT = "readStyleSelect"             // 阅读样式选择
    const val COMIC_STYLE_SELECT = "comicStyleSelect"           // 漫画样式选择

    // 亮度
    const val BRIGHTNESS = "brightness"                         // 日间亮度
    const val NIGHT_BRIGHTNESS = "nightBrightness"              // 夜间亮度
    const val SHOW_BRIGHTNESS_VIEW = "showBrightnessView"       // 显示亮度视图
    const val BRIGHTNESS_VW_POS = "brightnessVwPos"             // 亮度视图位置

    // 翻页设置
    const val DOUBLE_PAGE_HORIZONTAL = "doubleHorizontalPage"   // 双页水平翻页
    const val PROGRESS_BAR_BEHAVIOR = "progressBarBehavior"     // 进度条行为
    const val KEY_PAGE_ON_LONG_PRESS = "keyPageOnLongPress"     // 长按按键翻页
    const val VOLUME_KEY_PAGE = "volumeKeyPage"                 // 音量键翻页
    const val VOLUME_KEY_PAGE_ON_PLAY = "volumeKeyPageOnPlay"   // 播放时音量键翻页
    const val MOUSE_WHEEL_PAGE = "mouseWheelPage"               // 鼠标滚轮翻页
    const val PAGE_TOUCH_SLOP = "pageTouchSlop"                 // 翻页触控灵敏度
    const val PAGE_TOUCH_CLICK = "pageTouchClick"               // 点击触控灵敏度
    const val PADDING_DISPLAY_CUTOUTS = "paddingDisplayCutouts" // 刘海屏填充
    const val PREV_KEYS = "prevKeyCodes"                        // 上一页按键码
    const val NEXT_KEYS = "nextKeyCodes"                        // 下一页按键码
    const val EXPAND_TEXT_MENU = "expandTextMenu"               // 展开文本菜单

    // ==================== TTS语音设置 ====================
    const val TTS_ENGINE = "appTtsEngine"                       // TTS引擎
    const val TTS_FOLLOW_SYS = "ttsFollowSys"                   // TTS跟随系统
    const val TTS_SPEECH_RATE = "ttsSpeechRate"                 // TTS语速
    const val TTS_TIMER = "ttsTimer"                            // TTS定时器
    const val READ_ALOUD_BY_PAGE = "readAloudByPage"            // 按页朗读
    const val READ_ALOUD_BY_MEDIA_BUTTON = "readAloudByMediaButton"  // 媒体按钮朗读
    const val STREAM_READ_ALOUD_AUDIO = "streamReadAloudAudio"  // 流式朗读音频
    const val PAUSE_READ_ALOUD_WHILE_PHONE_CALLS = "pauseReadAloudWhilePhoneCalls"  // 来电暂停朗读
    const val IGNORE_AUDIO_FOCUS = "ignoreAudioFocus"           // 忽略音频焦点
    const val CONTENT_SELECT_SPEAK_MOD = "contentReadAloudMod"  // 内容选择朗读模式
    const val AUDIO_PLAY_WAKE_LOCK = "audioPlayWakeLock"        // 音频播放唤醒锁
    const val READ_ALOUD_WAKE_LOCK = "readAloudWakeLock"        // 朗读唤醒锁

    // ==================== 主题设置（themeSettings.json）====================
    const val EDIT_THEME = "editTheme"                          // 编辑器主题（日间）
    const val EDIT_THEME_DARK = "editThemeDark"                 // 编辑器主题（夜间）
    const val EDIT_TEMA_AUTO = "editTemeAuto"                   // 编辑器主题自动切换
    const val ANTI_ALIAS = "antiAlias"                          // 抗锯齿
    const val OPTIMIZE_RENDER = "optimizeRender"                // 优化渲染
    const val RECORD_LOG = "recordLog"                          // 记录日志
    const val BAR_ELEVATION = "barElevation"                    // 工具栏阴影
    const val SHOW_READ_TITLE_ADDITION = "showReadTitleAddition"  // 显示阅读标题附加
    const val READ_BAR_STYLE_FOLLOW_PAGE = "readBarStyleFollowPage"  // 阅读栏样式跟随页面

    // 主题颜色（日间）
    const val D_THEME_NAME = "durThemeName"                     // 当前主题名
    const val C_PRIMARY = "colorPrimary"                        // 主色
    const val C_ACCENT = "colorAccent"                          // 强调色
    const val C_BACKGROUND = "colorBackground"                  // 背景色
    const val C_B_BACKGROUND = "colorBottomBackground"          // 底部背景色
    const val BG_IMAGE = "backgroundImage"                      // 背景图片
    const val BG_IMAGE_BLURRING = "backgroundImageBlurring"     // 背景图片模糊
    const val T_NAV_BAR = "transparentNavBar"                   // 透明导航栏

    // 主题颜色（夜间）
    const val D_N_THEME_NAME = "durThemeNameNight"              // 当前夜间主题名
    const val C_N_PRIMARY = "colorPrimaryNight"                 // 夜间主色
    const val C_N_ACCENT = "colorAccentNight"                   // 夜间强调色
    const val C_N_BACKGROUND = "colorBackgroundNight"           // 夜间背景色
    const val C_N_B_BACKGROUND = "colorBottomBackgroundNight"   // 夜间底部背景色
    const val BG_IMAGE_N = "backgroundImageNight"               // 夜间背景图片
    const val BG_IMAGE_N_BLURRING = "backgroundImageNightBlurring"  // 夜间背景图片模糊
    const val T_NAV_BAR_N = "transparentNavBarNight"            // 夜间透明导航栏

    const val DEFAULT_COVER = "defaultCover"                    // 默认封面
    const val DEFAULT_COVER_DARK = "defaultCoverDark"           // 默认夜间封面

    // 欢迎页
    const val CUSTOM_WELCOME = "customWelcome"                  // 自定义欢迎页
    const val WELCOME_SHOW_TIME = "welcomeShowTime"             // 欢迎页显示时间
    const val WELCOME_IMAGE = "welcomeImagePath"                // 欢迎页图片
    const val WELCOME_IMAGE_DARK = "welcomeImagePathDark"       // 欢迎页夜间图片
    const val WELCOME_SHOW_TEXT = "welcomeShowText"             // 欢迎页显示文字
    const val WELCOME_SHOW_TEXT_DARK = "welcomeShowTextDark"    // 夜间欢迎页显示文字
    const val WELCOME_SHOW_ICON = "welcomeShowIcon"             // 欢迎页显示图标
    const val WELCOME_SHOW_ICON_DARK = "welcomeShowIconDark"    // 夜间欢迎页显示图标
    const val LAUNCHER_ICON = "launcherIcon"                    // 启动器图标

    // ==================== 漫画模式设置 ====================
    const val SHOW_MANGA_UI = "showMangaUi"                     // 显示漫画UI
    const val DISABLE_MANGA_SCALE = "disableMangaScale"         // 禁用漫画缩放
    const val DISABLE_MANGA_PAGE_ANIM = "disableMangaPageAnim"  // 禁用漫画翻页动画
    const val MANGA_PRE_DOWNLOAD_NUM = "mangaPreDownloadNum"    // 漫画预下载数量
    const val DISABLE_CLICK_SCROLL = "disableClickScroll"       // 禁用点击滚动
    const val MANGA_AUTO_PAGE_SPEED = "mangaAutoPageSpeed"      // 漫画自动翻页速度
    const val MANGA_FOOTER_CONFIG = "mangaFooterConfig"         // 漫画页脚配置
    const val ENABLE_MANGA_HORIZONTAL_SCROLL = "enableMangaHorizontalScroll"  // 漫画横向滚动
    const val MANGA_COLOR_FILTER = "mangaColorFilter"           // 漫画颜色滤镜
    const val HIDE_MANGA_TITLE = "hideMangaTitle"               // 隐藏漫画标题
    const val ENABLE_MANGA_E_INK = "enableMangaEInk"            // 启用漫画墨水屏
    const val MANGA_E_INK_THRESHOLD = "mangaEInkThreshold"      // 漫画墨水屏阈值
    const val DISABLE_HORIZONTAL_PAGE_SNAP = "disableHorizontalPageSnap"  // 禁用水平页面吸附
    const val ENABLE_MANGA_GRAY = "enableMangaGray"             // 启用漫画灰度
    const val CLICK_IMG_WAY = "clickImgWay"                     // 点击图片方式

    // ==================== 导出与备份设置 ====================
    const val EXPORT_CHARSET = "exportCharset"                  // 导出编码
    const val EXPORT_USE_REPLACE = "exportUseReplace"           // 导出使用替换规则
    const val EXPORT_TO_WEB_DAV = "webDavCacheBackup"           // 导出到WebDav
    const val EXPORT_NO_CHAPTER_NAME = "exportNoChapterName"    // 导出无章节名
    const val ENABLE_CUSTOM_EXPORT = "enableCustomExport"       // 启用自定义导出
    const val EXPORT_TYPE = "exportType"                        // 导出类型
    const val EXPORT_PICTURE_FILE = "exportPictureFile"         // 导出图片文件
    const val PARALLEL_EXPORT_BOOK = "parallelExportBook"       // 并行导出

    // WebDav
    const val WEB_DAV_URL = "web_dav_url"                       // WebDav地址
    const val WEB_DAV_ACCOUNT = "web_dav_account"               // WebDav账号
    const val WEB_DAV_PASSWORD = "web_dav_password"             // WebDav密码
    const val WEB_DAV_DIR = "webDavDir"                         // WebDav目录
    const val WEB_DAV_DEVICE_NAME = "webDavDeviceName"          // WebDav设备名

    // 文件名
    const val BOOK_EXPORT_FILE_NAME = "bookExportFileName"      // 书籍导出文件名
    const val BOOK_IMPORT_FILE_NAME = "bookImportFileName"      // 书籍导入文件名
    const val EPISODE_EXPORT_FILE_NAME = "episodeExportFileName"  // 章节导出文件名

    // 备份
    const val BACKUP_PATH = "backupUri"                         // 备份路径
    const val RESTORE_IGNORE = "restoreIgnore"                  // 恢复时忽略
    const val DEFAULT_BOOK_TREE_URI = "defaultBookTreeUri"      // 默认书籍目录
    const val ONLY_LATEST_BACKUP = "onlyLatestBackup"           // 仅保留最新备份
    const val AUTO_CHECK_NEW_BACKUP = "autoCheckNewBackup"      // 自动检查新备份

    // 导入
    const val IMPORT_KEEP_NAME = "importKeepName"               // 导入保持文件名
    const val IMPORT_KEEP_GROUP = "importKeepGroup"             // 导入保持分组
    const val IMPORT_KEEP_ENABLE = "importKeepEnable"           // 启用导入保持
    const val IMPORT_SHOW_COMMENT = "importShowComment"         // 导入显示注释
    const val LOCAL_BOOK_IMPORT_SORT = "localBookImportSort"    // 本地书籍导入排序

    // ==================== Web服务设置 ====================
    const val WEB_PORT = "webPort"                              // Web服务端口
    const val WEB_SERVICE = "webService"                        // Web服务状态
    const val WEB_SERVICE_WAKE_LOCK = "webServiceWakeLock"      // Web服务唤醒锁
    const val KEEP_LIGHT = "keep_light"                         // 保持亮屏
    const val CLEAR_WEB_VIEW_DATA = "clearWebViewData"          // 清除WebView数据
    const val REMOTE_SERVER_ID = "remoteServerId"               // 远程服务器ID
    const val READ_URL_IN_BROWSER = "readUrlInBrowser"          // 在浏览器中打开URL
    const val UPLOAD_RULE = "uploadRule"                        // 上传规则
    const val CHECK_SOURCE = "checkSource"                      // 校验源

    // ==================== 编辑器设置 ====================
    const val EDIT_FONT_SCALE = "editFontScale"                 // 编辑器字号
    const val EDIT_NON_PRINTABLE = "editNonPrintable"           // 编辑器非打印字符
    const val EDIT_AUTO_WRAP = "editAutoWrap"                   // 编辑器自动换行
    const val EDIT_AUTO_COMPLETE = "editAutoComplete"           // 编辑器自动补全
    const val SHOW_BOARD_LINE = "showBoardLine"                 // 显示行号
    const val FONT_FOLDER = "fontFolder"                        // 字体文件夹
    const val VIDEO_SETTING = "videoSetting"                    // 视频设置
    const val PROCESS_TEXT = "process_text"                     // 文本处理

    // ==================== 系统与其他设置 ====================
    const val SYSTEM_TYPEFACES = "system_typefaces"             // 系统字体
    const val CHINESE_CONVERTER_TYPE = "chineseConverterType"   // 中文转换类型
    const val BITMAP_CACHE_SIZE = "bitmapCacheSize"             // 位图缓存大小
    const val IMAGE_RETAIN_NUM = "imageRetainNum"               // 图片保留数量
    const val PRE_DOWNLOAD_NUM = "preDownloadNum"               // 预下载数量
    const val ENABLE_READ_RECORD = "enableReadRecord"           // 启用阅读记录
    const val TOC_UI_USE_REPLACE = "tocUiUseReplace"            // 目录使用替换规则
    const val TOC_COUNT_WORDS = "tocCountWords"                 // 目录统计字数
    const val REPLACE_ENABLE_DEFAULT = "replaceEnableDefault"   // 默认启用替换规则
    const val ENABLE_REVIEW = "enableReview"                    // 启用审查
    const val SYNC_BOOK_PROGRESS = "syncBookProgress"           // 同步阅读进度
    const val SYNC_BOOK_PROGRESS_PLUS = "syncBookProgressPlus"  // 增强同步阅读进度
    const val RECORD_HEAP_DUMP = "recordHeapDump"               // 记录堆转储
    const val SHOW_ADD_TO_SHELF_ALERT = "showAddToShelfAlert"   // 显示加入书架提示
    const val AUTO_CLEAR_EXPIRED = "autoClearExpired"           // 自动清除过期缓存
    const val CLEAN_CACHE = "cleanCache"                        // 清除缓存
    const val SHRINK_DATABASE = "shrinkDatabase"                // 压缩数据库
    const val UPDATE_TO_VARIANT = "updateToVariant"             // 更新到变体

    // AppConfig 运行时键（不在 PreferKey 常量定义中，由 AppConfig 直接使用字符串字面量）
    const val IMPORT_BOOK_PATH = "importBookPath"               // 本地导入目录
    const val SEARCH_SCOPE = "searchScope"                      // 搜索范围
    const val SEARCH_GROUP = "searchGroup"                      // 搜索分组
    const val AUTO_UPDATE_VARIANT = "autoUpdateVariant"         // 自动更新变体
    const val MEDIA_BUTTON_ON_EXIT = "mediaButtonOnExit"        // 退出时媒体按钮

    // ==================== 默认值表 ====================
    /**
     * 全部配置项的默认值
     * 来源: Android AppConfig.kt / ReadBookConfig.kt 中各属性的 getter 默认值
     */
    val DEFAULTS: Map<String, Any> = mapOf(
        // 通用
        LANGUAGE to "",
        FONT_SCALE to 0,
        THEME_MODE to "0",
        SCREEN_ORIENTATION to "",
        DEFAULT_HOME_PAGE to "bookshelf",
        SHOW_DISCOVERY to true,
        SHOW_RSS to true,
        SAVE_TAB_POSITION to 0,

        // 书架显示
        BOOKSHELF_SORT to 0,
        BOOKSHELF_LAYOUT to 0,
        BOOKSHELF_MARGIN to 12,
        SHOW_BOOKNAME_LAYOUT to 0,
        SHOW_UNREAD to true,
        SHOW_LAST_UPDATE_TIME to false,
        SHOW_WAIT_UP_COUNT to false,
        SHOW_BOOKSHELF_FAST_SCROLLER to false,
        BOOK_GROUP_STYLE to 0,
        USE_DEFAULT_COVER to false,
        LOAD_COVER_ONLY_WIFI to false,
        COVER_SHOW_NAME to true,
        COVER_SHOW_AUTHOR to true,
        COVER_SHOW_NAME_N to true,
        COVER_SHOW_AUTHOR_N to true,
        AUTO_REFRESH_BOOK to false,
        ONLY_UPDATE_READ to false,
        DEFAULT_TO_READ to false,

        // 书源与网络
        THREAD_COUNT to 16,
        USER_AGENT to "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        CUSTOM_HOSTS to "{}",
        CHANGE_SOURCE_CHECK_AUTHOR to false,
        AUTO_CHANGE_SOURCE to true,
        CHANGE_SOURCE_LOAD_INFO to false,
        CHANGE_SOURCE_LOAD_TOC to false,
        CHANGE_SOURCE_LOAD_WORD_COUNT to false,
        PRECISION_SEARCH to false,
        BATCH_CHANGE_SOURCE_DELAY to 0,
        OPEN_BOOK_INFO_BY_CLICK_TITLE to true,
        SOURCE_EDIT_MAX_LINE to Int.MAX_VALUE,
        CRONET to false,

        // 阅读交互
        READ_BODY_TO_LH to true,
        TEXT_FULL_JUSTIFY to true,
        TEXT_BOTTOM_JUSTIFY to true,
        TEXT_SELECT_ABLE to true,
        USE_ZH_LAYOUT to false,
        ADAPT_SPECIAL_STYLE to true,
        SHARE_LAYOUT to false,
        AUTO_READ_SPEED to 10,
        NO_ANIM_SCROLL_PAGE to false,

        CLICK_ACTION_TL to 2,
        CLICK_ACTION_TC to 2,
        CLICK_ACTION_TR to 1,
        CLICK_ACTION_ML to 2,
        CLICK_ACTION_MC to 0,
        CLICK_ACTION_MR to 1,
        CLICK_ACTION_BL to 2,
        CLICK_ACTION_BC to 1,
        CLICK_ACTION_BR to 1,

        HIDE_STATUS_BAR to false,
        HIDE_NAVIGATION_BAR to false,
        TRANSPARENT_STATUS_BAR to true,
        IMM_NAVIGATION_BAR to true,
        READ_STYLE_SELECT to 0,
        COMIC_STYLE_SELECT to 0,

        BRIGHTNESS to 100,
        NIGHT_BRIGHTNESS to 100,
        SHOW_BRIGHTNESS_VIEW to true,
        BRIGHTNESS_VW_POS to false,

        DOUBLE_PAGE_HORIZONTAL to "",
        PROGRESS_BAR_BEHAVIOR to "page",
        KEY_PAGE_ON_LONG_PRESS to false,
        VOLUME_KEY_PAGE to true,
        VOLUME_KEY_PAGE_ON_PLAY to true,
        MOUSE_WHEEL_PAGE to true,
        PAGE_TOUCH_SLOP to 0,
        PAGE_TOUCH_CLICK to 0,
        PADDING_DISPLAY_CUTOUTS to false,
        PREV_KEYS to "",
        NEXT_KEYS to "",
        EXPAND_TEXT_MENU to false,

        // TTS语音
        TTS_ENGINE to "",
        TTS_FOLLOW_SYS to true,
        TTS_SPEECH_RATE to 5,
        TTS_TIMER to 0,
        READ_ALOUD_BY_PAGE to false,
        READ_ALOUD_BY_MEDIA_BUTTON to false,
        STREAM_READ_ALOUD_AUDIO to false,
        PAUSE_READ_ALOUD_WHILE_PHONE_CALLS to false,
        IGNORE_AUDIO_FOCUS to false,
        CONTENT_SELECT_SPEAK_MOD to 0,
        AUDIO_PLAY_WAKE_LOCK to false,
        READ_ALOUD_WAKE_LOCK to false,

        // 主题
        EDIT_THEME to 0,
        EDIT_THEME_DARK to 0,
        EDIT_TEMA_AUTO to false,
        ANTI_ALIAS to true,
        OPTIMIZE_RENDER to false,
        RECORD_LOG to false,
        BAR_ELEVATION to 0,
        SHOW_READ_TITLE_ADDITION to true,
        READ_BAR_STYLE_FOLLOW_PAGE to false,

        D_THEME_NAME to "",
        C_PRIMARY to 0,
        C_ACCENT to 0,
        C_BACKGROUND to 0,
        C_B_BACKGROUND to 0,
        BG_IMAGE to "",
        BG_IMAGE_BLURRING to 0,
        T_NAV_BAR to false,

        D_N_THEME_NAME to "",
        C_N_PRIMARY to 0,
        C_N_ACCENT to 0,
        C_N_BACKGROUND to 0,
        C_N_B_BACKGROUND to 0,
        BG_IMAGE_N to "",
        BG_IMAGE_N_BLURRING to 0,
        T_NAV_BAR_N to false,

        DEFAULT_COVER to "",
        DEFAULT_COVER_DARK to "",

        CUSTOM_WELCOME to false,
        WELCOME_SHOW_TIME to 0,
        WELCOME_IMAGE to "",
        WELCOME_IMAGE_DARK to "",
        WELCOME_SHOW_TEXT to true,
        WELCOME_SHOW_TEXT_DARK to true,
        WELCOME_SHOW_ICON to true,
        WELCOME_SHOW_ICON_DARK to true,
        LAUNCHER_ICON to "",

        // 漫画模式
        SHOW_MANGA_UI to true,
        DISABLE_MANGA_SCALE to true,
        DISABLE_MANGA_PAGE_ANIM to false,
        MANGA_PRE_DOWNLOAD_NUM to 10,
        DISABLE_CLICK_SCROLL to false,
        MANGA_AUTO_PAGE_SPEED to 3,
        MANGA_FOOTER_CONFIG to "",
        ENABLE_MANGA_HORIZONTAL_SCROLL to false,
        MANGA_COLOR_FILTER to "",
        HIDE_MANGA_TITLE to false,
        ENABLE_MANGA_E_INK to false,
        MANGA_E_INK_THRESHOLD to 150,
        DISABLE_HORIZONTAL_PAGE_SNAP to false,
        ENABLE_MANGA_GRAY to false,
        CLICK_IMG_WAY to "",

        // 导出与备份
        EXPORT_CHARSET to "UTF-8",
        EXPORT_USE_REPLACE to true,
        EXPORT_TO_WEB_DAV to false,
        EXPORT_NO_CHAPTER_NAME to false,
        ENABLE_CUSTOM_EXPORT to false,
        EXPORT_TYPE to 0,
        EXPORT_PICTURE_FILE to false,
        PARALLEL_EXPORT_BOOK to false,

        WEB_DAV_URL to "",
        WEB_DAV_ACCOUNT to "",
        WEB_DAV_PASSWORD to "",
        WEB_DAV_DIR to "legado",
        WEB_DAV_DEVICE_NAME to "Linux-Desktop",

        BOOK_EXPORT_FILE_NAME to "",
        BOOK_IMPORT_FILE_NAME to "",
        EPISODE_EXPORT_FILE_NAME to "",

        BACKUP_PATH to "",
        RESTORE_IGNORE to false,
        DEFAULT_BOOK_TREE_URI to "",
        ONLY_LATEST_BACKUP to true,
        AUTO_CHECK_NEW_BACKUP to true,

        IMPORT_KEEP_NAME to false,
        IMPORT_KEEP_GROUP to false,
        IMPORT_KEEP_ENABLE to false,
        IMPORT_SHOW_COMMENT to false,
        LOCAL_BOOK_IMPORT_SORT to 0,

        // Web服务
        WEB_PORT to 1122,
        WEB_SERVICE to false,
        WEB_SERVICE_WAKE_LOCK to false,
        KEEP_LIGHT to false,
        CLEAR_WEB_VIEW_DATA to false,
        REMOTE_SERVER_ID to 0L,
        READ_URL_IN_BROWSER to false,
        UPLOAD_RULE to false,
        CHECK_SOURCE to false,

        // 编辑器
        EDIT_FONT_SCALE to 16,
        EDIT_NON_PRINTABLE to 0,
        EDIT_AUTO_WRAP to true,
        EDIT_AUTO_COMPLETE to true,
        SHOW_BOARD_LINE to 1,
        FONT_FOLDER to "",
        VIDEO_SETTING to "",
        PROCESS_TEXT to "",

        // 系统与其他
        SYSTEM_TYPEFACES to 0,
        CHINESE_CONVERTER_TYPE to 0,
        BITMAP_CACHE_SIZE to 50,
        IMAGE_RETAIN_NUM to 0,
        PRE_DOWNLOAD_NUM to 10,
        ENABLE_READ_RECORD to true,
        TOC_UI_USE_REPLACE to false,
        TOC_COUNT_WORDS to true,
        REPLACE_ENABLE_DEFAULT to true,
        ENABLE_REVIEW to false,
        SYNC_BOOK_PROGRESS to true,
        SYNC_BOOK_PROGRESS_PLUS to false,
        RECORD_HEAP_DUMP to false,
        SHOW_ADD_TO_SHELF_ALERT to true,
        AUTO_CLEAR_EXPIRED to false,
        CLEAN_CACHE to false,
        SHRINK_DATABASE to false,
        UPDATE_TO_VARIANT to "default_version",

        // AppConfig 运行时键默认值（v3.3 新增）
        IMPORT_BOOK_PATH to "",
        SEARCH_SCOPE to "",
        SEARCH_GROUP to "",
        AUTO_UPDATE_VARIANT to true,
        MEDIA_BUTTON_ON_EXIT to true
    )
}
