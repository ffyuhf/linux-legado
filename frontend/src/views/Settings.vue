/**
 * 设置页面 - 完整对齐 Android AppConfig 全部配置项
 *
 * 采用标签页分类展示，覆盖 Android 端全部可配置功能。
 * 数据通过 settingsStore 管理三类配置（app/read/theme）。
 *
 * 修改历史:
 * 2026-06-14 12:30 nmb - 初始版本，5个标签页基础设置
 * 2026-06-15 12:56 nmb - v2.0 全面重写，11个标签页覆盖全部配置项
 * 2026-06-16 07:02 nmb - v3.2 新增数据操作区块与缓存管理区块
 * 2026-06-16 07:29 nmb - v3.3 补全遗漏字段、主题颜色区块、WebDav 操作区块
 * 2026-06-16 08:25 nmb - v3.4 修正5处配置键命名错位(web_dav_*/system_typefaces/auto_refresh),补全restoreIgnore与按键翻页码控件
 */
<template>
  <div class="settings-wrapper" v-loading="settings.loading">
    <el-page-header @back="goBack" class="page-header">
      <template #content><span class="header-title">应用设置</span></template>
      <template #extra>
        <div class="header-actions">
          <el-button @click="readStyleVisible = true">排版方案</el-button>
          <el-button type="primary" @click="saveAll" :loading="settings.saving">保存全部</el-button>
          <el-button type="danger" plain @click="confirmResetAll">重置全部</el-button>
        </div>
      </template>
    </el-page-header>

    <el-tabs v-model="activeTab" class="settings-tabs" tab-position="left">

      <!-- ==================== 通用设置 ==================== -->
      <el-tab-pane label="通用" name="general">
        <el-form label-width="180px">
          <el-divider content-position="left">界面</el-divider>
          <el-form-item label="语言">
            <el-select v-model="app.language" placeholder="跟随系统">
              <el-option value="" label="跟随系统"/>
              <el-option value="zh" label="简体中文"/>
              <el-option value="zh-rTW" label="繁體中文"/>
              <el-option value="en" label="English"/>
            </el-select>
          </el-form-item>
          <el-form-item label="默认首页">
            <el-select v-model="app.defaultHomePage">
              <el-option value="bookshelf" label="书架"/>
              <el-option value="rss" label="订阅"/>
              <el-option value="discovery" label="发现"/>
            </el-select>
          </el-form-item>
          <el-form-item label="显示发现页"><el-switch v-model="app.showDiscovery"/></el-form-item>
          <el-form-item label="显示RSS"><el-switch v-model="app.showRss"/></el-form-item>
          <el-form-item label="保存标签位置">
            <el-input-number v-model="app.saveTabPosition" :min="0"/>
          </el-form-item>
          <el-form-item label="字号缩放">
            <el-input-number v-model="app.fontScale" :min="0" :max="200"/>
          </el-form-item>

          <el-divider content-position="left">系统</el-divider>
          <el-form-item label="中文字体">
            <el-select v-model="app.system_typefaces">
              <el-option :value="0" label="默认字体"/>
              <el-option :value="1" label="思源宋体"/>
              <el-option :value="2" label="思源黑体"/>
            </el-select>
          </el-form-item>
          <el-form-item label="中文简繁转换">
            <el-select v-model="app.chineseConverterType">
              <el-option :value="0" label="不转换"/>
              <el-option :value="1" label="简转繁"/>
              <el-option :value="2" label="繁转简"/>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 书架设置 ==================== -->
      <el-tab-pane label="书架" name="bookshelf">
        <el-form label-width="180px">
          <el-divider content-position="left">显示设置</el-divider>
          <el-form-item label="书架排序">
            <el-select v-model="app.bookshelfSort">
              <el-option :value="0" label="按阅读时间"/>
              <el-option :value="1" label="按更新时间"/>
              <el-option :value="2" label="按书名"/>
              <el-option :value="3" label="手动排序"/>
            </el-select>
          </el-form-item>
          <el-form-item label="书架布局">
            <el-radio-group v-model="app.bookshelfLayout">
              <el-radio :value="0">网格</el-radio>
              <el-radio :value="1">列表</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="书架边距">
            <el-slider v-model="app.bookshelfMargin" :min="0" :max="32" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="书名显示">
            <el-select v-model="app.showBooknameLayout">
              <el-option :value="0" label="显示书名"/>
              <el-option :value="1" label="隐藏书名"/>
            </el-select>
          </el-form-item>
          <el-form-item label="分组样式">
            <el-select v-model="app.bookGroupStyle">
              <el-option :value="0" label="不显示"/>
              <el-option :value="1" label="小标题"/>
              <el-option :value="2" label="大标题"/>
            </el-select>
          </el-form-item>

          <el-divider content-position="left">显示选项</el-divider>
          <el-form-item label="显示未读"><el-switch v-model="app.showUnread"/></el-form-item>
          <el-form-item label="显示更新时间"><el-switch v-model="app.showLastUpdateTime"/></el-form-item>
          <el-form-item label="显示等待更新数"><el-switch v-model="app.showWaitUpCount"/></el-form-item>
          <el-form-item label="显示快速滚动条"><el-switch v-model="app.showBookshelfFastScroller"/></el-form-item>
          <el-form-item label="自动刷新"><el-switch v-model="app.auto_refresh"/></el-form-item>
          <el-form-item label="只更新已读"><el-switch v-model="app.onlyUpdateRead"/></el-form-item>
          <el-form-item label="默认进入阅读"><el-switch v-model="app.defaultToRead"/></el-form-item>

          <el-divider content-position="left">封面设置</el-divider>
          <el-form-item label="使用默认封面"><el-switch v-model="app.useDefaultCover"/></el-form-item>
          <el-form-item label="封面显示书名"><el-switch v-model="app.coverShowName"/></el-form-item>
          <el-form-item label="封面显示作者"><el-switch v-model="app.coverShowAuthor"/></el-form-item>
          <el-form-item label="夜间封面显示书名"><el-switch v-model="app.coverShowNameN"/></el-form-item>
          <el-form-item label="夜间封面显示作者"><el-switch v-model="app.coverShowAuthorN"/></el-form-item>
          <el-form-item label="仅WiFi下载封面"><el-switch v-model="app.loadCoverOnlyWifi"/></el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 书源设置 ==================== -->
      <el-tab-pane label="书源" name="source">
        <el-form label-width="180px">
          <el-divider content-position="left">网络</el-divider>
          <el-form-item label="并发线程数">
            <el-input-number v-model="app.threadCount" :min="1" :max="64"/>
            <span class="form-tip">搜索/加载并发数</span>
          </el-form-item>
          <el-form-item label="User-Agent">
            <el-input v-model="app.userAgent" type="textarea" :rows="3"/>
          </el-form-item>
          <el-form-item label="自定义Hosts">
            <el-input v-model="app.customHosts" type="textarea" :rows="3" placeholder='{"域名":"IP"}'/>
          </el-form-item>
          <el-form-item label="使用Cronet"><el-switch v-model="app.Cronet"/></el-form-item>

          <el-divider content-position="left">换源</el-divider>
          <el-form-item label="换源校验作者"><el-switch v-model="app.changeSourceCheckAuthor"/></el-form-item>
          <el-form-item label="自动换源"><el-switch v-model="app.autoChangeSource"/></el-form-item>
          <el-form-item label="换源加载信息"><el-switch v-model="app.changeSourceLoadInfo"/></el-form-item>
          <el-form-item label="换源加载目录"><el-switch v-model="app.changeSourceLoadToc"/></el-form-item>
          <el-form-item label="换源加载字数"><el-switch v-model="app.changeSourceLoadWordCount"/></el-form-item>
          <el-form-item label="批量换源延迟(ms)">
            <el-input-number v-model="app.batchChangeSourceDelay" :min="0" :max="10000" :step="100"/>
          </el-form-item>

          <el-divider content-position="left">搜索</el-divider>
          <el-form-item label="精确搜索"><el-switch v-model="app.precisionSearch"/></el-form-item>
          <el-form-item label="点击标题打开信息"><el-switch v-model="app.openBookInfoByClickTitle"/></el-form-item>

          <el-divider content-position="left">缓存</el-divider>
          <el-form-item label="位图缓存大小(MB)">
            <el-input-number v-model="app.bitmapCacheSize" :min="10" :max="500"/>
          </el-form-item>
          <el-form-item label="图片保留数量">
            <el-input-number v-model="app.imageRetainNum" :min="0" :max="100"/>
          </el-form-item>
          <el-form-item label="预下载数量">
            <el-input-number v-model="app.preDownloadNum" :min="0" :max="100"/>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 阅读设置 ==================== -->
      <el-tab-pane label="阅读" name="read">
        <el-form label-width="180px">
          <el-divider content-position="left">正文布局</el-divider>
          <el-form-item label="正文居左"><el-switch v-model="read.readBodyToLh"/></el-form-item>
          <el-form-item label="两端对齐"><el-switch v-model="read.textFullJustify"/></el-form-item>
          <el-form-item label="底部对齐"><el-switch v-model="read.textBottomJustify"/></el-form-item>
          <el-form-item label="中文排版"><el-switch v-model="read.useZhLayout"/></el-form-item>
          <el-form-item label="适配特殊样式"><el-switch v-model="read.adaptSpecialStyle"/></el-form-item>
          <el-form-item label="文本可选"><el-switch v-model="read.selectText"/></el-form-item>
          <el-form-item label="共享布局"><el-switch v-model="read.shareLayout"/></el-form-item>

          <el-divider content-position="left">九宫格点击区域</el-divider>
          <el-form-item label="左上角">
            <el-select v-model="read.clickActionTopLeft" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="上中">
            <el-select v-model="read.clickActionTopCenter" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="右上角">
            <el-select v-model="read.clickActionTopRight" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="左中">
            <el-select v-model="read.clickActionMiddleLeft" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="正中">
            <el-select v-model="read.clickActionMiddleCenter" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="右中">
            <el-select v-model="read.clickActionMiddleRight" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="左下角">
            <el-select v-model="read.clickActionBottomLeft" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="下中">
            <el-select v-model="read.clickActionBottomCenter" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>
          <el-form-item label="右下角">
            <el-select v-model="read.clickActionBottomRight" style="width:100px">
              <el-option :value="0" label="下一页"/><el-option :value="1" label="上一页"/><el-option :value="2" label="菜单"/>
            </el-select>
          </el-form-item>

          <el-divider content-position="left">阅读体验</el-divider>
          <el-form-item label="自动阅读速度">
            <el-slider v-model="read.autoReadSpeed" :min="1" :max="30" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="无动画滚动翻页"><el-switch v-model="read.noAnimScrollPage"/></el-form-item>
          <el-form-item label="展开文本菜单"><el-switch v-model="read.expandTextMenu"/></el-form-item>

          <el-divider content-position="left">亮度</el-divider>
          <el-form-item label="日间亮度">
            <el-slider v-model="read.brightness" :min="0" :max="100" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="夜间亮度">
            <el-slider v-model="read.nightBrightness" :min="0" :max="100" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="显示亮度调节"><el-switch v-model="read.showBrightnessView"/></el-form-item>
          <el-form-item label="亮度调节位置在底部"><el-switch v-model="read.brightnessVwPos"/></el-form-item>

          <el-divider content-position="left">翻页与按键</el-divider>
          <el-form-item label="双页水平翻页模式">
            <el-select v-model="read.doubleHorizontalPage">
              <el-option value="" label="关闭"/><el-option value="auto" label="自动"/><el-option value="always" label="始终"/>
            </el-select>
          </el-form-item>
          <el-form-item label="进度条行为">
            <el-select v-model="read.progressBarBehavior">
              <el-option value="page" label="按页"/><el-option value="chapter" label="按章"/>
            </el-select>
          </el-form-item>
          <el-form-item label="音量键翻页"><el-switch v-model="read.volumeKeyPage"/></el-form-item>
          <el-form-item label="播放时音量键翻页"><el-switch v-model="read.volumeKeyPageOnPlay"/></el-form-item>
          <el-form-item label="鼠标滚轮翻页"><el-switch v-model="read.mouseWheelPage"/></el-form-item>
          <el-form-item label="长按按键翻页"><el-switch v-model="read.keyPageOnLongPress"/></el-form-item>
          <el-form-item label="上一页按键码">
            <el-input v-model="read.prevKeyCodes" placeholder="逗号分隔的键名,如 ArrowLeft,a"/>
          </el-form-item>
          <el-form-item label="下一页按键码">
            <el-input v-model="read.nextKeyCodes" placeholder="逗号分隔的键名,如 ArrowRight,d"/>
          </el-form-item>
          <el-form-item label="翻页触控灵敏度">
            <el-input-number v-model="read.pageTouchSlop" :min="0" :max="100"/>
          </el-form-item>
          <el-form-item label="点击触控灵敏度">
            <el-input-number v-model="read.pageTouchClick" :min="0" :max="100"/>
          </el-form-item>

          <el-divider content-position="left">阅读UI</el-divider>
          <el-form-item label="隐藏状态栏"><el-switch v-model="read.hideStatusBar"/></el-form-item>
          <el-form-item label="隐藏导航栏"><el-switch v-model="read.hideNavigationBar"/></el-form-item>
          <el-form-item label="透明状态栏"><el-switch v-model="read.transparentStatusBar"/></el-form-item>
          <el-form-item label="沉浸导航栏"><el-switch v-model="read.immNavigationBar"/></el-form-item>
          <el-form-item label="刘海屏填充"><el-switch v-model="read.paddingDisplayCutouts"/></el-form-item>
          <el-form-item label="点击图片方式">
            <el-select v-model="read.clickImgWay">
              <el-option value="" label="无"/><el-option value="full" label="全屏"/><el-option value="separate" label="独立"/>
            </el-select>
          </el-form-item>

          <el-divider content-position="left">排版方案</el-divider>
          <el-form-item label="当前排版方案">
            <el-input-number v-model="read.readStyleSelect" :min="0" :max="10" />
            <el-button class="ml-12" @click="readStyleVisible = true">管理排版方案</el-button>
          </el-form-item>
          <el-form-item label="漫画排版方案">
            <el-input-number v-model="read.comicStyleSelect" :min="0" :max="10" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== TTS语音设置 ==================== -->
      <el-tab-pane label="TTS语音" name="tts">
        <el-form label-width="180px">
          <el-divider content-position="left">语音引擎</el-divider>
          <el-form-item label="TTS引擎">
            <el-input v-model="app.appTtsEngine" placeholder="系统默认"/>
          </el-form-item>
          <el-form-item label="跟随系统TTS"><el-switch v-model="app.ttsFollowSys"/></el-form-item>
          <el-form-item label="语速">
            <el-slider v-model="app.ttsSpeechRate" :min="1" :max="15" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="定时停止(分钟)">
            <el-input-number v-model="app.ttsTimer" :min="0" :max="120"/>
            <span class="form-tip">0=不停止</span>
          </el-form-item>
          <el-form-item label="按页朗读"><el-switch v-model="app.readAloudByPage"/></el-form-item>

          <el-divider content-position="left">音频行为</el-divider>
          <el-form-item label="媒体按钮控制朗读"><el-switch v-model="app.readAloudByMediaButton"/></el-form-item>
          <el-form-item label="流式朗读音频"><el-switch v-model="app.streamReadAloudAudio"/></el-form-item>
          <el-form-item label="来电暂停朗读"><el-switch v-model="app.pauseReadAloudWhilePhoneCalls"/></el-form-item>
          <el-form-item label="忽略音频焦点"><el-switch v-model="app.ignoreAudioFocus"/></el-form-item>
          <el-form-item label="内容选择朗读模式">
            <el-select v-model="app.contentReadAloudMod">
              <el-option :value="0" label="全文"/><el-option :value="1" label="仅选中"/>
            </el-select>
          </el-form-item>
          <el-form-item label="音频播放唤醒锁"><el-switch v-model="app.audioPlayWakeLock"/></el-form-item>
          <el-form-item label="朗读唤醒锁"><el-switch v-model="app.readAloudWakeLock"/></el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 主题设置 ==================== -->
      <el-tab-pane label="主题" name="theme">
        <el-form label-width="180px">
          <el-divider content-position="left">主题模式</el-divider>
          <el-form-item label="模式">
            <el-radio-group v-model="theme.themeMode">
              <el-radio value="0">跟随系统</el-radio>
              <el-radio value="1">日间</el-radio>
              <el-radio value="2">夜间</el-radio>
              <el-radio value="3">墨水屏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="日间主题序号">
            <el-input-number v-model="theme.editTheme" :min="0" :max="20"/>
          </el-form-item>
          <el-form-item label="夜间主题序号">
            <el-input-number v-model="theme.editThemeDark" :min="0" :max="20"/>
          </el-form-item>
          <el-form-item label="自动切换主题"><el-switch v-model="theme.editTemeAuto"/></el-form-item>

          <el-divider content-position="left">渲染</el-divider>
          <el-form-item label="抗锯齿"><el-switch v-model="theme.antiAlias"/></el-form-item>
          <el-form-item label="优化渲染"><el-switch v-model="theme.optimizeRender"/></el-form-item>
          <el-form-item label="记录日志"><el-switch v-model="theme.recordLog"/></el-form-item>
          <el-form-item label="工具栏阴影">
            <el-slider v-model="theme.barElevation" :min="0" :max="30" show-input style="max-width:400px"/>
          </el-form-item>

          <el-divider content-position="left">阅读栏</el-divider>
          <el-form-item label="显示标题附加信息"><el-switch v-model="theme.showReadTitleAddition"/></el-form-item>
          <el-form-item label="阅读栏跟随页面样式"><el-switch v-model="theme.readBarStyleFollowPage"/></el-form-item>

          <el-divider content-position="left">日间主题颜色</el-divider>
          <el-form-item label="当前主题名"><el-input v-model="theme.durThemeName" placeholder="默认"/></el-form-item>
          <el-form-item label="主色">
            <el-color-picker v-model="theme.colorPrimary" show-alpha/>
          </el-form-item>
          <el-form-item label="强调色">
            <el-color-picker v-model="theme.colorAccent" show-alpha/>
          </el-form-item>
          <el-form-item label="背景色">
            <el-color-picker v-model="theme.colorBackground" show-alpha/>
          </el-form-item>
          <el-form-item label="底部背景色">
            <el-color-picker v-model="theme.colorBottomBackground" show-alpha/>
          </el-form-item>
          <el-form-item label="背景图片"><el-input v-model="theme.backgroundImage" placeholder="图片路径"/></el-form-item>
          <el-form-item label="背景图片模糊">
            <el-slider v-model="theme.backgroundImageBlurring" :min="0" :max="30" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="透明导航栏"><el-switch v-model="theme.transparentNavBar"/></el-form-item>
          <el-form-item label="默认封面"><el-input v-model="theme.defaultCover" placeholder="封面图片路径"/></el-form-item>

          <el-divider content-position="left">夜间主题颜色</el-divider>
          <el-form-item label="当前夜间主题名"><el-input v-model="theme.durThemeNameNight" placeholder="默认"/></el-form-item>
          <el-form-item label="夜间主色">
            <el-color-picker v-model="theme.colorPrimaryNight" show-alpha/>
          </el-form-item>
          <el-form-item label="夜间强调色">
            <el-color-picker v-model="theme.colorAccentNight" show-alpha/>
          </el-form-item>
          <el-form-item label="夜间背景色">
            <el-color-picker v-model="theme.colorBackgroundNight" show-alpha/>
          </el-form-item>
          <el-form-item label="夜间底部背景色">
            <el-color-picker v-model="theme.colorBottomBackgroundNight" show-alpha/>
          </el-form-item>
          <el-form-item label="夜间背景图片"><el-input v-model="theme.backgroundImageNight" placeholder="图片路径"/></el-form-item>
          <el-form-item label="夜间背景图片模糊">
            <el-slider v-model="theme.backgroundImageNightBlurring" :min="0" :max="30" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="夜间透明导航栏"><el-switch v-model="theme.transparentNavBarNight"/></el-form-item>
          <el-form-item label="默认夜间封面"><el-input v-model="theme.defaultCoverDark" placeholder="封面图片路径"/></el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 漫画设置 ==================== -->
      <el-tab-pane label="漫画" name="manga">
        <el-form label-width="180px">
          <el-divider content-position="left">漫画模式</el-divider>
          <el-form-item label="显示漫画UI"><el-switch v-model="app.showMangaUi"/></el-form-item>
          <el-form-item label="禁用缩放"><el-switch v-model="app.disableMangaScale"/></el-form-item>
          <el-form-item label="禁用翻页动画"><el-switch v-model="app.disableMangaPageAnim"/></el-form-item>
          <el-form-item label="隐藏标题"><el-switch v-model="app.hideMangaTitle"/></el-form-item>

          <el-divider content-position="left">浏览</el-divider>
          <el-form-item label="预下载数量">
            <el-input-number v-model="app.mangaPreDownloadNum" :min="0" :max="100"/>
          </el-form-item>
          <el-form-item label="自动翻页速度">
            <el-slider v-model="app.mangaAutoPageSpeed" :min="1" :max="10" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="横向滚动"><el-switch v-model="app.enableMangaHorizontalScroll"/></el-form-item>
          <el-form-item label="禁用点击滚动"><el-switch v-model="app.disableClickScroll"/></el-form-item>
          <el-form-item label="禁用水平页面吸附"><el-switch v-model="app.disableHorizontalPageSnap"/></el-form-item>

          <el-divider content-position="left">滤镜</el-divider>
          <el-form-item label="颜色滤镜">
            <el-input v-model="app.mangaColorFilter" placeholder="如: #FF0000"/>
          </el-form-item>
          <el-form-item label="启用灰度"><el-switch v-model="app.enableMangaGray"/></el-form-item>
          <el-form-item label="墨水屏模式"><el-switch v-model="app.enableMangaEInk"/></el-form-item>
          <el-form-item label="墨水屏阈值">
            <el-slider v-model="app.mangaEInkThreshold" :min="0" :max="255" show-input style="max-width:400px"/>
          </el-form-item>
          <el-form-item label="页脚配置">
            <el-input v-model="app.mangaFooterConfig" type="textarea" :rows="2"/>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 导出与备份设置 ==================== -->
      <el-tab-pane label="导出/备份" name="export">
        <!-- 数据操作区块（v3.2 新增：挂载 backupStore） -->
        <el-divider content-position="left">数据操作</el-divider>
        <div class="data-actions">
          <div class="action-row">
            <span class="action-label">数据备份</span>
            <el-checkbox v-model="backupIncludeBooks">包含书籍数据</el-checkbox>
            <el-checkbox v-model="backupIncludeSources">包含书源</el-checkbox>
            <el-checkbox v-model="backupIncludeConfigs">包含配置</el-checkbox>
            <el-button
              type="primary"
              :loading="backupStore.backingUp"
              @click="handleCreateBackup"
            >创建备份</el-button>
          </div>
          <div class="action-row">
            <span class="action-label">数据恢复</span>
            <el-upload
              :show-file-list="false"
              :before-upload="handleRestoreBackup"
              accept=".zip"
            >
              <el-button type="warning" :loading="backupStore.restoring">
                选择备份文件恢复
              </el-button>
            </el-upload>
          </div>
          <div class="action-row">
            <span class="action-label">书源导出</span>
            <el-button @click="backupStore.exportSources">导出全部书源</el-button>
          </div>
          <div class="action-row">
            <span class="action-label">书源导入</span>
            <el-upload
              :show-file-list="false"
              :before-upload="handleImportSources"
              accept=".json"
            >
              <el-button>选择书源JSON导入</el-button>
            </el-upload>
          </div>
        </div>

        <el-form label-width="180px">
          <el-divider content-position="left">导出设置</el-divider>
          <el-form-item label="导出编码">
            <el-select v-model="app.exportCharset">
              <el-option value="UTF-8" label="UTF-8"/>
              <el-option value="GBK" label="GBK"/>
            </el-select>
          </el-form-item>
          <el-form-item label="导出类型">
            <el-select v-model="app.exportType">
              <el-option :value="0" label="TXT"/>
              <el-option :value="1" label="EPUB"/>
            </el-select>
          </el-form-item>
          <el-form-item label="使用替换规则"><el-switch v-model="app.exportUseReplace"/></el-form-item>
          <el-form-item label="无章节名"><el-switch v-model="app.exportNoChapterName"/></el-form-item>
          <el-form-item label="导出图片文件"><el-switch v-model="app.exportPictureFile"/></el-form-item>
          <el-form-item label="并行导出"><el-switch v-model="app.parallelExportBook"/></el-form-item>
          <el-form-item label="启用自定义导出"><el-switch v-model="app.enableCustomExport"/></el-form-item>

          <el-divider content-position="left">WebDav同步</el-divider>
          <el-form-item label="WebDav地址">
            <el-input v-model="app.web_dav_url" placeholder="https://dav.example.com"/>
          </el-form-item>
          <el-form-item label="WebDav账号"><el-input v-model="app.web_dav_account"/></el-form-item>
          <el-form-item label="WebDav密码"><el-input v-model="app.web_dav_password" type="password" show-password/></el-form-item>
          <el-form-item label="WebDav目录"><el-input v-model="app.webDavDir"/></el-form-item>
          <el-form-item label="WebDav设备名"><el-input v-model="app.webDavDeviceName"/></el-form-item>
          <el-form-item label="导出到WebDav"><el-switch v-model="app.webDavCacheBackup"/></el-form-item>

          <!-- WebDav 操作按钮区块（v3.3 新增） -->
          <div class="webdav-actions">
            <el-button @click="handleWebDavCheck" :loading="webDavChecking">检查连接</el-button>
            <el-button type="primary" @click="handleWebDavBackup" :loading="webDavBacking">上传备份到WebDav</el-button>
            <el-button type="warning" @click="handleWebDavRestore" :loading="webDavRestoring">从WebDav恢复</el-button>
          </div>

          <el-divider content-position="left">备份</el-divider>
          <el-form-item label="备份路径"><el-input v-model="app.backupUri"/></el-form-item>
          <el-form-item label="恢复时忽略"><el-switch v-model="app.restoreIgnore"/></el-form-item>
          <el-form-item label="仅保留最新备份"><el-switch v-model="app.onlyLatestBackup"/></el-form-item>
          <el-form-item label="自动检查新备份"><el-switch v-model="app.autoCheckNewBackup"/></el-form-item>

          <el-divider content-position="left">文件名模板</el-divider>
          <el-form-item label="书籍导出文件名"><el-input v-model="app.bookExportFileName" placeholder="{name}_{author}"/></el-form-item>
          <el-form-item label="书籍导入文件名"><el-input v-model="app.bookImportFileName"/></el-form-item>
          <el-form-item label="章节导出文件名"><el-input v-model="app.episodeExportFileName"/></el-form-item>

          <el-divider content-position="left">导入</el-divider>
          <el-form-item label="导入保持文件名"><el-switch v-model="app.importKeepName"/></el-form-item>
          <el-form-item label="导入保持分组"><el-switch v-model="app.importKeepGroup"/></el-form-item>
          <el-form-item label="启用导入保持"><el-switch v-model="app.importKeepEnable"/></el-form-item>
          <el-form-item label="导入显示注释"><el-switch v-model="app.importShowComment"/></el-form-item>
          <el-form-item label="本地导入排序">
            <el-input-number v-model="app.localBookImportSort" :min="0" :max="3"/>
          </el-form-item>

          <el-divider content-position="left">阅读记录</el-divider>
          <el-form-item label="启用阅读记录"><el-switch v-model="app.enableReadRecord"/></el-form-item>
          <el-form-item label="同步阅读进度"><el-switch v-model="app.syncBookProgress"/></el-form-item>
          <el-form-item label="增强同步进度"><el-switch v-model="app.syncBookProgressPlus"/></el-form-item>
          <el-form-item label="目录使用替换规则"><el-switch v-model="app.tocUiUseReplace"/></el-form-item>
          <el-form-item label="目录统计字数"><el-switch v-model="app.tocCountWords"/></el-form-item>
          <el-form-item label="默认启用替换规则"><el-switch v-model="app.replaceEnableDefault"/></el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== Web服务设置 ==================== -->
      <el-tab-pane label="Web服务" name="web">
        <el-form label-width="180px">
          <el-divider content-position="left">服务配置</el-divider>
          <el-form-item label="Web服务端口">
            <el-input-number v-model="app.webPort" :min="1" :max="65535"/>
          </el-form-item>
          <el-form-item label="Web服务状态"><el-switch v-model="app.webService"/></el-form-item>
          <el-form-item label="Web服务唤醒锁"><el-switch v-model="app.webServiceWakeLock"/></el-form-item>
          <el-form-item label="保持亮屏"><el-switch v-model="app.keep_light"/></el-form-item>

          <el-divider content-position="left">行为</el-divider>
          <el-form-item label="远程服务器ID">
            <el-input-number v-model="app.remoteServerId" :min="0"/>
          </el-form-item>
          <el-form-item label="URL在浏览器打开"><el-switch v-model="app.readUrlInBrowser"/></el-form-item>
          <el-form-item label="清除WebView数据"><el-switch v-model="app.clearWebViewData"/></el-form-item>
          <el-form-item label="上传规则"><el-switch v-model="app.uploadRule"/></el-form-item>
          <el-form-item label="校验源"><el-switch v-model="app.checkSource"/></el-form-item>
          <el-form-item label="显示加入书架提示"><el-switch v-model="app.showAddToShelfAlert"/></el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 编辑器设置 ==================== -->
      <el-tab-pane label="编辑器" name="editor">
        <el-form label-width="180px">
          <el-divider content-position="left">代码编辑器</el-divider>
          <el-form-item label="编辑器字号">
            <el-input-number v-model="app.editFontScale" :min="8" :max="32"/>
          </el-form-item>
          <el-form-item label="非打印字符显示">
            <el-input-number v-model="app.editNonPrintable" :min="0" :max="3"/>
          </el-form-item>
          <el-form-item label="自动换行"><el-switch v-model="app.editAutoWrap"/></el-form-item>
          <el-form-item label="自动补全"><el-switch v-model="app.editAutoComplete"/></el-form-item>
          <el-form-item label="显示行号">
            <el-select v-model="app.showBoardLine">
              <el-option :value="0" label="不显示"/><el-option :value="1" label="显示"/>
            </el-select>
          </el-form-item>
          <el-form-item label="最大行数">
            <el-input-number v-model="app.sourceEditMaxLine" :min="10" :max="9999"/>
          </el-form-item>
          <el-form-item label="字体文件夹"><el-input v-model="app.fontFolder"/></el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 系统设置 ==================== -->
      <el-tab-pane label="系统" name="system">
        <!-- 缓存管理区块（v3.2 新增：挂载 cacheStore） -->
        <el-divider content-position="left">缓存管理</el-divider>
        <div class="cache-info" v-loading="cacheStore.loading">
          <el-descriptions :column="4" border size="small">
            <el-descriptions-item label="缓存总大小">
              <span class="cache-size">{{ cacheStore.formatSize(cacheStore.cacheSize.totalSize) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="缓存章节数">
              {{ cacheStore.cacheSize.chapterCount }}
            </el-descriptions-item>
            <el-descriptions-item label="书籍总数">
              {{ cacheStore.cacheSize.bookCount }}
            </el-descriptions-item>
            <el-descriptions-item label="书源总数">
              {{ cacheStore.cacheSize.sourceCount }}
            </el-descriptions-item>
          </el-descriptions>
          <div class="cache-actions">
            <el-button @click="cacheStore.loadCacheSize">刷新缓存信息</el-button>
            <el-button
              type="warning"
              :loading="cacheStore.clearing"
              @click="handleClearContentCache"
            >清除内容缓存</el-button>
            <el-button
              type="danger"
              :loading="cacheStore.clearing"
              @click="handleClearAllCache"
            >清除全部缓存</el-button>
          </div>
        </div>

        <el-form label-width="180px">
          <el-divider content-position="left">缓存与数据库</el-divider>
          <el-form-item label="自动清除过期缓存"><el-switch v-model="app.autoClearExpired"/></el-form-item>
          <el-form-item label="清除缓存"><el-switch v-model="app.cleanCache"/></el-form-item>
          <el-form-item label="压缩数据库"><el-switch v-model="app.shrinkDatabase"/></el-form-item>
          <el-form-item label="记录堆转储"><el-switch v-model="app.recordHeapDump"/></el-form-item>

          <el-divider content-position="left">更新</el-divider>
          <el-form-item label="更新变体">
            <el-select v-model="app.updateToVariant">
              <el-option value="default_version" label="默认版本"/>
              <el-option value="beta" label="测试版"/>
            </el-select>
          </el-form-item>
          <el-form-item label="启用审查"><el-switch v-model="app.enableReview"/></el-form-item>

          <el-divider content-position="left">欢迎页</el-divider>
          <el-form-item label="自定义欢迎页"><el-switch v-model="app.customWelcome"/></el-form-item>
          <el-form-item label="欢迎页显示时间(秒)">
            <el-input-number v-model="app.welcomeShowTime" :min="0" :max="30"/>
          </el-form-item>
          <el-form-item label="欢迎页图片"><el-input v-model="app.welcomeImagePath"/></el-form-item>
          <el-form-item label="夜间欢迎页图片"><el-input v-model="app.welcomeImagePathDark"/></el-form-item>
          <el-form-item label="显示欢迎文字"><el-switch v-model="app.welcomeShowText"/></el-form-item>
          <el-form-item label="夜间显示文字"><el-switch v-model="app.welcomeShowTextDark"/></el-form-item>
          <el-form-item label="显示图标"><el-switch v-model="app.welcomeShowIcon"/></el-form-item>
          <el-form-item label="夜间显示图标"><el-switch v-model="app.welcomeShowIconDark"/></el-form-item>
          <el-form-item label="启动器图标"><el-input v-model="app.launcherIcon"/></el-form-item>

          <el-divider content-position="left">其他</el-divider>
          <el-form-item label="屏幕方向">
            <el-select v-model="app.screenOrientation">
              <el-option value="" label="跟随系统"/>
              <el-option value="portrait" label="竖屏"/>
              <el-option value="landscape" label="横屏"/>
            </el-select>
          </el-form-item>
          <el-form-item label="视频设置"><el-input v-model="app.videoSetting"/></el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ==================== 系统操作（阶段八补全） ==================== -->
      <el-tab-pane label="系统操作" name="systemActions">
        <system-actions />
      </el-tab-pane>

    </el-tabs>

    <!-- 排版方案编辑器（对话框，阶段八补全） -->
    <read-style-editor v-model="readStyleVisible" />
  </div>
</template>

<script setup lang="ts">
/**
 * 设置页面脚本 - 管理配置状态、数据操作、缓存管理
 *
 * 修改历史:
 * 2026-06-14 12:30 nmb - 初始版本
 * 2026-06-16 07:02 nmb - v3.2 新增备份/恢复/导入导出/缓存管理操作入口
 */
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettingsStore } from '@/store'
import API from '@api'

/** 阶段八补全：系统操作组件与排版方案编辑器 */
import SystemActions from '@/components/SystemActions.vue'
import ReadStyleEditor from '@/components/ReadStyleEditor.vue'

/** v3.2 新增：备份与缓存 Store */
import { useBackupStore } from '@/store/backupStore'
import { useCacheStore } from '@/store/cacheStore'
import type { UploadRawFile } from 'element-plus'

const router = useRouter()
const settings = useSettingsStore()
const activeTab = ref('general')

/** 排版方案编辑器可见性（阶段八补全） */
const readStyleVisible = ref(false)

/** 备份与缓存 Store 实例（v3.2 新增） */
const backupStore = useBackupStore()
const cacheStore = useCacheStore()

/** 备份选项响应式状态（v3.2 新增） */
const backupIncludeBooks = ref(true)
const backupIncludeSources = ref(true)
const backupIncludeConfigs = ref(true)

/** 应用配置响应式对象（含全部 app 类配置项默认值） */
const app = reactive<Record<string, any>>({
  language: '', fontScale: 0, saveTabPosition: 0,
  defaultHomePage: 'bookshelf', showDiscovery: true, showRss: true,
  system_typefaces: 0, chineseConverterType: 0,
  bookshelfSort: 0, bookshelfLayout: 0, bookshelfMargin: 12, showBooknameLayout: 0,
  showUnread: true, showLastUpdateTime: false, showWaitUpCount: false,
  showBookshelfFastScroller: false, bookGroupStyle: 0, useDefaultCover: false,
  loadCoverOnlyWifi: false, coverShowName: true, coverShowAuthor: true,
  coverShowNameN: true, coverShowAuthorN: true, auto_refresh: false,
  onlyUpdateRead: false, defaultToRead: false,
  threadCount: 16, userAgent: '', customHosts: '{}', Cronet: false,
  changeSourceCheckAuthor: false, autoChangeSource: true, changeSourceLoadInfo: false,
  changeSourceLoadToc: false, changeSourceLoadWordCount: false, precisionSearch: false,
  batchChangeSourceDelay: 0, openBookInfoByClickTitle: true, sourceEditMaxLine: 9999,
  bitmapCacheSize: 50, imageRetainNum: 0, preDownloadNum: 10,
  appTtsEngine: '', ttsFollowSys: true, ttsSpeechRate: 5, ttsTimer: 0,
  readAloudByPage: false, readAloudByMediaButton: false, streamReadAloudAudio: false,
  pauseReadAloudWhilePhoneCalls: false, ignoreAudioFocus: false, contentReadAloudMod: 0,
  audioPlayWakeLock: false, readAloudWakeLock: false,
  showMangaUi: true, disableMangaScale: true, disableMangaPageAnim: false,
  mangaPreDownloadNum: 10, disableClickScroll: false, mangaAutoPageSpeed: 3,
  mangaFooterConfig: '', enableMangaHorizontalScroll: false, mangaColorFilter: '',
  hideMangaTitle: false, enableMangaEInk: false, mangaEInkThreshold: 150,
  disableHorizontalPageSnap: false, enableMangaGray: false,
  exportCharset: 'UTF-8', exportType: 0, exportUseReplace: true, exportNoChapterName: false,
  exportPictureFile: false, parallelExportBook: false, enableCustomExport: false,
  web_dav_url: '', web_dav_account: '', web_dav_password: '', webDavDir: 'legado',
  webDavDeviceName: 'Linux-Desktop', webDavCacheBackup: false,
  bookExportFileName: '', bookImportFileName: '', episodeExportFileName: '',
  backupUri: '', restoreIgnore: false, onlyLatestBackup: true, autoCheckNewBackup: true,
  importKeepName: false, importKeepGroup: false, importKeepEnable: false,
  importShowComment: false, localBookImportSort: 0,
  enableReadRecord: true, syncBookProgress: true, syncBookProgressPlus: false,
  tocUiUseReplace: false, tocCountWords: true, replaceEnableDefault: true,
  webPort: 1122, webService: false, webServiceWakeLock: false, keep_light: false,
  remoteServerId: 0, readUrlInBrowser: false, clearWebViewData: false,
  uploadRule: false, checkSource: false, showAddToShelfAlert: true,
  editFontScale: 16, editNonPrintable: 0, editAutoWrap: true, editAutoComplete: true,
  showBoardLine: 1, fontFolder: '', process_text: '',
  autoClearExpired: false, cleanCache: false, shrinkDatabase: false, recordHeapDump: false,
  updateToVariant: 'default_version', enableReview: false,
  customWelcome: false, welcomeShowTime: 0, welcomeImagePath: '', welcomeImagePathDark: '',
  welcomeShowText: true, welcomeShowTextDark: true, welcomeShowIcon: true,
  welcomeShowIconDark: true, launcherIcon: '', screenOrientation: '', videoSetting: '',
})

/** 阅读配置响应式对象（含全部 read 类配置项默认值） */
const read = reactive<Record<string, any>>({
  readBodyToLh: true, textFullJustify: true, textBottomJustify: true, selectText: true,
  useZhLayout: false, adaptSpecialStyle: true, shareLayout: false, autoReadSpeed: 10,
  noAnimScrollPage: false, expandTextMenu: false,
  clickActionTopLeft: 2, clickActionTopCenter: 2, clickActionTopRight: 1,
  clickActionMiddleLeft: 2, clickActionMiddleCenter: 0, clickActionMiddleRight: 1,
  clickActionBottomLeft: 2, clickActionBottomCenter: 1, clickActionBottomRight: 1,
  brightness: 100, nightBrightness: 100, showBrightnessView: true, brightnessVwPos: false,
  doubleHorizontalPage: '', progressBarBehavior: 'page', volumeKeyPage: true,
  volumeKeyPageOnPlay: true, mouseWheelPage: true, keyPageOnLongPress: false,
  prevKeyCodes: '', nextKeyCodes: '',
  pageTouchSlop: 0, pageTouchClick: 0,
  hideStatusBar: false, hideNavigationBar: false, transparentStatusBar: true,
  immNavigationBar: true, paddingDisplayCutouts: false, clickImgWay: '',
  readStyleSelect: 0, comicStyleSelect: 0,
})

/** 主题配置响应式对象（含全部 theme 类配置项默认值） */
const theme = reactive<Record<string, any>>({
  themeMode: '0', editTheme: 0, editThemeDark: 0, editTemeAuto: false,
  antiAlias: true, optimizeRender: false, recordLog: false, barElevation: 0,
  showReadTitleAddition: true, readBarStyleFollowPage: false,
  durThemeName: '', colorPrimary: 0, colorAccent: 0, colorBackground: 0,
  colorBottomBackground: 0, backgroundImage: '', backgroundImageBlurring: 0,
  transparentNavBar: false, defaultCover: '',
  durThemeNameNight: '', colorPrimaryNight: 0, colorAccentNight: 0,
  colorBackgroundNight: 0, colorBottomBackgroundNight: 0,
  backgroundImageNight: '', backgroundImageNightBlurring: 0,
  transparentNavBarNight: false, defaultCoverDark: '',
})

/** 从 store 同步配置到本地响应式对象 */
const syncFromStore = () => {
  Object.keys(app).forEach(k => {
    if (k in settings.mergedAppSettings) app[k] = settings.mergedAppSettings[k]
  })
  Object.keys(read).forEach(k => {
    if (k in settings.mergedReadSettings) read[k] = settings.mergedReadSettings[k]
  })
  Object.keys(theme).forEach(k => {
    if (k in settings.mergedThemeSettings) theme[k] = settings.mergedThemeSettings[k]
  })
}

/** 保存全部设置 */
const saveAll = async () => {
  const a: Record<string, unknown> = {}
  const r: Record<string, unknown> = {}
  const t: Record<string, unknown> = {}
  Object.keys(app).forEach(k => { a[k] = app[k] })
  Object.keys(read).forEach(k => { r[k] = read[k] })
  Object.keys(theme).forEach(k => { t[k] = theme[k] })
  await settings.saveAllSettings({ app: a, read: r, theme: t })
}

/** 确认重置全部设置 */
const confirmResetAll = () => {
  ElMessageBox.confirm(
    '确定要重置全部设置到默认值吗？',
    '警告',
    { type: 'warning', confirmButtonText: '确定重置', cancelButtonText: '取消' }
  ).then(async () => {
    await settings.resetAllSettings()
    syncFromStore()
  }).catch(() => {})
}

/**
 * 创建数据备份（v3.2 新增）
 * 将 checkbox 状态转换为 backupStore 所需的 options 格式
 */
const handleCreateBackup = () => {
  backupStore.createBackup({
    includeBooks: backupIncludeBooks.value,
    includeSources: backupIncludeSources.value,
    includeConfigs: backupIncludeConfigs.value,
  })
}

/**
 * 恢复备份（v3.2 新增）
 * @param file 用户选择的 zip 文件
 * @returns false 阻止 el-upload 自动上传
 */
const handleRestoreBackup = (file: UploadRawFile): boolean => {
  backupStore.restoreBackup(file as unknown as File)
  return false
}

/**
 * 导入书源 JSON（v3.2 新增）
 * @param file 用户选择的 json 文件
 * @returns false 阻止 el-upload 自动上传
 */
const handleImportSources = (file: UploadRawFile): boolean => {
  backupStore.importSourcesFromFile(file as unknown as File)
  return false
}

/**
 * 清除全部缓存（v3.2 新增）
 * 弹出确认框后执行清理
 */
const handleClearAllCache = () => {
  ElMessageBox.confirm(
    '确定要清除全部缓存吗？此操作不可撤销。',
    '警告',
    { type: 'warning', confirmButtonText: '确定清除', cancelButtonText: '取消' },
  ).then(async () => {
    await cacheStore.clearAllCache()
  }).catch(() => {})
}

/**
 * 清除内容缓存（v3.2 新增）
 * 弹出确认框后执行清理
 */
const handleClearContentCache = () => {
  ElMessageBox.confirm(
    '确定要清除内容缓存吗？仅清理章节正文文件缓存。',
    '提示',
    { type: 'warning', confirmButtonText: '确定清除', cancelButtonText: '取消' },
  ).then(async () => {
    await cacheStore.clearContentOnly()
  }).catch(() => {})
}

/** WebDav 操作状态（v3.3 新增） */
const webDavChecking = ref(false)
const webDavBacking = ref(false)
const webDavRestoring = ref(false)

/** 检查 WebDav 连接（v3.3 新增） */
const handleWebDavCheck = async () => {
  webDavChecking.value = true
  try {
    const { data } = await API.webDavCheck()
    if (data.isSuccess && data.data) {
      ElMessageBox.alert(data.data.message, 'WebDav 连接检查', { type: data.data.success ? 'success' : 'error' })
    }
  } catch (e) {
    ElMessage.error('WebDav 连接检查失败')
  } finally {
    webDavChecking.value = false
  }
}

/** 上传备份到 WebDav（v3.3 新增） */
const handleWebDavBackup = async () => {
  webDavBacking.value = true
  try {
    const { data } = await API.webDavBackup()
    if (data.isSuccess && data.data) {
      ElMessageBox.alert(data.data.message, 'WebDav 备份', { type: data.data.success ? 'success' : 'error' })
    }
  } catch (e) {
    ElMessage.error('WebDav 备份上传失败')
  } finally {
    webDavBacking.value = false
  }
}

/** 从 WebDav 恢复（v3.3 新增） */
const handleWebDavRestore = async () => {
  ElMessageBox.confirm('确定要从 WebDav 恢复备份吗？将覆盖当前数据。', '警告', {
    type: 'warning',
    confirmButtonText: '确定恢复',
    cancelButtonText: '取消',
  }).then(async () => {
    webDavRestoring.value = true
    try {
      const { data } = await API.webDavRestore()
      if (data.isSuccess && data.data) {
        ElMessage.success(`恢复完成: 书籍${data.data.books} 源${data.data.sources} 配置${data.data.configs}`)
      }
    } catch (e) {
      ElMessage.error('WebDav 备份恢复失败')
    } finally {
      webDavRestoring.value = false
    }
  }).catch(() => {})
}

const goBack = () => router.back()

onMounted(async () => {
  await settings.loadAllSettings()
  syncFromStore()
  /** v3.2 新增：页面加载时预取缓存大小信息 */
  cacheStore.loadCacheSize()
})
</script>

<style lang="scss" scoped>
.settings-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
.page-header { margin-bottom: 24px; }
.header-title { font-size: 18px; font-weight: 500; }
.header-actions { display: flex; gap: 12px; }
.form-tip { margin-left: 12px; color: #909399; font-size: 12px; }
:deep(.el-divider__text) { font-weight: 500; color: #409eff; }
.settings-tabs { min-height: 600px; }

/* v3.2 新增：数据操作区块样式 */
.data-actions {
  margin-bottom: 24px;
}
.action-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.action-label {
  min-width: 80px;
  font-weight: 500;
  color: #606266;
}

/* v3.2 新增：缓存管理区块样式 */
.cache-info {
  margin-bottom: 24px;
}
.cache-size {
  font-weight: 700;
  color: #409eff;
}
.cache-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

/* v3.3 新增：WebDav 操作区块样式 */
.webdav-actions {
  display: flex;
  gap: 12px;
  margin: 12px 0 0 0;
  flex-wrap: wrap;
}
</style>