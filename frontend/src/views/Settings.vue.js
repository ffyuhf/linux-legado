/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
/**
 * 设置页面脚本 - 管理配置状态、数据操作、缓存管理
 *
 * 修改历史:
 * 2026-06-14 12:30 nmb - 初始版本
 * 2026-06-16 07:02 nmb - v3.2 新增备份/恢复/导入导出/缓存管理操作入口
 */
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingsStore } from '@/store';
import API from '@api';
/** 阶段八补全：系统操作组件与排版方案编辑器 */
import SystemActions from '@/components/SystemActions.vue';
import ReadStyleEditor from '@/components/ReadStyleEditor.vue';
/** v3.2 新增：备份与缓存 Store */
import { useBackupStore } from '@/store/backupStore';
import { useCacheStore } from '@/store/cacheStore';
const router = useRouter();
const settings = useSettingsStore();
const activeTab = ref('general');
/** 排版方案编辑器可见性（阶段八补全） */
const readStyleVisible = ref(false);
/** 备份与缓存 Store 实例（v3.2 新增） */
const backupStore = useBackupStore();
const cacheStore = useCacheStore();
/** 备份选项响应式状态（v3.2 新增） */
const backupIncludeBooks = ref(true);
const backupIncludeSources = ref(true);
const backupIncludeConfigs = ref(true);
/** 应用配置响应式对象（含全部 app 类配置项默认值） */
const app = reactive({
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
});
/** 阅读配置响应式对象（含全部 read 类配置项默认值） */
const read = reactive({
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
});
/** 主题配置响应式对象（含全部 theme 类配置项默认值） */
const theme = reactive({
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
});
/** 从 store 同步配置到本地响应式对象 */
const syncFromStore = () => {
    Object.keys(app).forEach(k => {
        if (k in settings.mergedAppSettings)
            app[k] = settings.mergedAppSettings[k];
    });
    Object.keys(read).forEach(k => {
        if (k in settings.mergedReadSettings)
            read[k] = settings.mergedReadSettings[k];
    });
    Object.keys(theme).forEach(k => {
        if (k in settings.mergedThemeSettings)
            theme[k] = settings.mergedThemeSettings[k];
    });
};
/** 保存全部设置 */
const saveAll = async () => {
    const a = {};
    const r = {};
    const t = {};
    Object.keys(app).forEach(k => { a[k] = app[k]; });
    Object.keys(read).forEach(k => { r[k] = read[k]; });
    Object.keys(theme).forEach(k => { t[k] = theme[k]; });
    await settings.saveAllSettings({ app: a, read: r, theme: t });
};
/** 确认重置全部设置 */
const confirmResetAll = () => {
    ElMessageBox.confirm('确定要重置全部设置到默认值吗？', '警告', { type: 'warning', confirmButtonText: '确定重置', cancelButtonText: '取消' }).then(async () => {
        await settings.resetAllSettings();
        syncFromStore();
    }).catch(() => { });
};
/**
 * 创建数据备份（v3.2 新增）
 * 将 checkbox 状态转换为 backupStore 所需的 options 格式
 */
const handleCreateBackup = () => {
    backupStore.createBackup({
        includeBooks: backupIncludeBooks.value,
        includeSources: backupIncludeSources.value,
        includeConfigs: backupIncludeConfigs.value,
    });
};
/**
 * 恢复备份（v3.2 新增）
 * @param file 用户选择的 zip 文件
 * @returns false 阻止 el-upload 自动上传
 */
const handleRestoreBackup = (file) => {
    backupStore.restoreBackup(file);
    return false;
};
/**
 * 导入书源 JSON（v3.2 新增）
 * @param file 用户选择的 json 文件
 * @returns false 阻止 el-upload 自动上传
 */
const handleImportSources = (file) => {
    backupStore.importSourcesFromFile(file);
    return false;
};
/**
 * 清除全部缓存（v3.2 新增）
 * 弹出确认框后执行清理
 */
const handleClearAllCache = () => {
    ElMessageBox.confirm('确定要清除全部缓存吗？此操作不可撤销。', '警告', { type: 'warning', confirmButtonText: '确定清除', cancelButtonText: '取消' }).then(async () => {
        await cacheStore.clearAllCache();
    }).catch(() => { });
};
/**
 * 清除内容缓存（v3.2 新增）
 * 弹出确认框后执行清理
 */
const handleClearContentCache = () => {
    ElMessageBox.confirm('确定要清除内容缓存吗？仅清理章节正文文件缓存。', '提示', { type: 'warning', confirmButtonText: '确定清除', cancelButtonText: '取消' }).then(async () => {
        await cacheStore.clearContentOnly();
    }).catch(() => { });
};
/** WebDav 操作状态（v3.3 新增） */
const webDavChecking = ref(false);
const webDavBacking = ref(false);
const webDavRestoring = ref(false);
/** 检查 WebDav 连接（v3.3 新增） */
const handleWebDavCheck = async () => {
    webDavChecking.value = true;
    try {
        const { data } = await API.webDavCheck();
        if (data.isSuccess && data.data) {
            ElMessageBox.alert(data.data.message, 'WebDav 连接检查', { type: data.data.success ? 'success' : 'error' });
        }
    }
    catch (e) {
        ElMessage.error('WebDav 连接检查失败');
    }
    finally {
        webDavChecking.value = false;
    }
};
/** 上传备份到 WebDav（v3.3 新增） */
const handleWebDavBackup = async () => {
    webDavBacking.value = true;
    try {
        const { data } = await API.webDavBackup();
        if (data.isSuccess && data.data) {
            ElMessageBox.alert(data.data.message, 'WebDav 备份', { type: data.data.success ? 'success' : 'error' });
        }
    }
    catch (e) {
        ElMessage.error('WebDav 备份上传失败');
    }
    finally {
        webDavBacking.value = false;
    }
};
/** 从 WebDav 恢复（v3.3 新增） */
const handleWebDavRestore = async () => {
    ElMessageBox.confirm('确定要从 WebDav 恢复备份吗？将覆盖当前数据。', '警告', {
        type: 'warning',
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
    }).then(async () => {
        webDavRestoring.value = true;
        try {
            const { data } = await API.webDavRestore();
            if (data.isSuccess && data.data) {
                ElMessage.success(`恢复完成: 书籍${data.data.books} 源${data.data.sources} 配置${data.data.configs}`);
            }
        }
        catch (e) {
            ElMessage.error('WebDav 备份恢复失败');
        }
        finally {
            webDavRestoring.value = false;
        }
    }).catch(() => { });
};
const goBack = () => router.back();
onMounted(async () => {
    await settings.loadAllSettings();
    syncFromStore();
    /** v3.2 新增：页面加载时预取缓存大小信息 */
    cacheStore.loadCacheSize();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "settings-wrapper" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.settings.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['settings-wrapper']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elPageHeader | typeof __VLS_components.ElPageHeader | typeof __VLS_components['el-page-header'] | typeof __VLS_components.elPageHeader | typeof __VLS_components.ElPageHeader | typeof __VLS_components['el-page-header']} */
elPageHeader;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    ...{ class: "page-header" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    ...{ class: "page-header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = {
    /** @type {typeof __VLS_5.back} */
    onBack: (__VLS_ctx.goBack),
};
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { content: __VLS_8 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "header-title" },
    });
    /** @type {__VLS_StyleScopedClasses['header-title']} */ ;
    // @ts-ignore
    [vLoading, settings, goBack,];
}
{
    const { extra: __VLS_9 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        ...{ 'onClick': {} },
    }));
    const __VLS_12 = __VLS_11({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    let __VLS_15;
    const __VLS_16 = {
        /** @type {typeof __VLS_15.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.readStyleVisible = true;
            // @ts-ignore
            [readStyleVisible,];
        },
    };
    const { default: __VLS_17 } = __VLS_13.slots;
    // @ts-ignore
    [];
    var __VLS_13;
    var __VLS_14;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.settings.saving),
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.settings.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = {
        /** @type {typeof __VLS_23.click} */
        onClick: (__VLS_ctx.saveAll),
    };
    const { default: __VLS_25 } = __VLS_21.slots;
    // @ts-ignore
    [settings, saveAll,];
    var __VLS_21;
    var __VLS_22;
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        ...{ 'onClick': {} },
        type: "danger",
        plain: true,
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onClick': {} },
        type: "danger",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_31;
    const __VLS_32 = {
        /** @type {typeof __VLS_31.click} */
        onClick: (__VLS_ctx.confirmResetAll),
    };
    const { default: __VLS_33 } = __VLS_29.slots;
    // @ts-ignore
    [confirmResetAll,];
    var __VLS_29;
    var __VLS_30;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_34;
/** @ts-ignore @type { | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components['el-tabs'] | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components['el-tabs']} */
elTabs;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "settings-tabs" },
    tabPosition: "left",
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "settings-tabs" },
    tabPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
/** @type {__VLS_StyleScopedClasses['settings-tabs']} */ ;
const { default: __VLS_39 } = __VLS_37.slots;
let __VLS_40;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    label: "通用",
    name: "general",
}));
const __VLS_42 = __VLS_41({
    label: "通用",
    name: "general",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
let __VLS_46;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    labelWidth: "180px",
}));
const __VLS_48 = __VLS_47({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
const { default: __VLS_51 } = __VLS_49.slots;
let __VLS_52;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    contentPosition: "left",
}));
const __VLS_54 = __VLS_53({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const { default: __VLS_57 } = __VLS_55.slots;
// @ts-ignore
[activeTab,];
var __VLS_55;
let __VLS_58;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    label: "语言",
}));
const __VLS_60 = __VLS_59({
    label: "语言",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
const { default: __VLS_63 } = __VLS_61.slots;
let __VLS_64;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.app.language),
    placeholder: "跟随系统",
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.app.language),
    placeholder: "跟随系统",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
let __VLS_70;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    value: "",
    label: "跟随系统",
}));
const __VLS_72 = __VLS_71({
    value: "",
    label: "跟随系统",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
let __VLS_75;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    value: "zh",
    label: "简体中文",
}));
const __VLS_77 = __VLS_76({
    value: "zh",
    label: "简体中文",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
let __VLS_80;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    value: "zh-rTW",
    label: "繁體中文",
}));
const __VLS_82 = __VLS_81({
    value: "zh-rTW",
    label: "繁體中文",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_85;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    value: "en",
    label: "English",
}));
const __VLS_87 = __VLS_86({
    value: "en",
    label: "English",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
// @ts-ignore
[app,];
var __VLS_67;
// @ts-ignore
[];
var __VLS_61;
let __VLS_90;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    label: "默认首页",
}));
const __VLS_92 = __VLS_91({
    label: "默认首页",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
const { default: __VLS_95 } = __VLS_93.slots;
let __VLS_96;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    modelValue: (__VLS_ctx.app.defaultHomePage),
}));
const __VLS_98 = __VLS_97({
    modelValue: (__VLS_ctx.app.defaultHomePage),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const { default: __VLS_101 } = __VLS_99.slots;
let __VLS_102;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    value: "bookshelf",
    label: "书架",
}));
const __VLS_104 = __VLS_103({
    value: "bookshelf",
    label: "书架",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
let __VLS_107;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
    value: "rss",
    label: "订阅",
}));
const __VLS_109 = __VLS_108({
    value: "rss",
    label: "订阅",
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
let __VLS_112;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
    value: "discovery",
    label: "发现",
}));
const __VLS_114 = __VLS_113({
    value: "discovery",
    label: "发现",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
// @ts-ignore
[app,];
var __VLS_99;
// @ts-ignore
[];
var __VLS_93;
let __VLS_117;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    label: "显示发现页",
}));
const __VLS_119 = __VLS_118({
    label: "显示发现页",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
const { default: __VLS_122 } = __VLS_120.slots;
let __VLS_123;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    modelValue: (__VLS_ctx.app.showDiscovery),
}));
const __VLS_125 = __VLS_124({
    modelValue: (__VLS_ctx.app.showDiscovery),
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
// @ts-ignore
[app,];
var __VLS_120;
let __VLS_128;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
    label: "显示RSS",
}));
const __VLS_130 = __VLS_129({
    label: "显示RSS",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
const { default: __VLS_133 } = __VLS_131.slots;
let __VLS_134;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
    modelValue: (__VLS_ctx.app.showRss),
}));
const __VLS_136 = __VLS_135({
    modelValue: (__VLS_ctx.app.showRss),
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
// @ts-ignore
[app,];
var __VLS_131;
let __VLS_139;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
    label: "保存标签位置",
}));
const __VLS_141 = __VLS_140({
    label: "保存标签位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
const { default: __VLS_144 } = __VLS_142.slots;
let __VLS_145;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
    modelValue: (__VLS_ctx.app.saveTabPosition),
    min: (0),
}));
const __VLS_147 = __VLS_146({
    modelValue: (__VLS_ctx.app.saveTabPosition),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
// @ts-ignore
[app,];
var __VLS_142;
let __VLS_150;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
    label: "字号缩放",
}));
const __VLS_152 = __VLS_151({
    label: "字号缩放",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
const { default: __VLS_155 } = __VLS_153.slots;
let __VLS_156;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.app.fontScale),
    min: (0),
    max: (200),
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.app.fontScale),
    min: (0),
    max: (200),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
// @ts-ignore
[app,];
var __VLS_153;
let __VLS_161;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    contentPosition: "left",
}));
const __VLS_163 = __VLS_162({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
const { default: __VLS_166 } = __VLS_164.slots;
// @ts-ignore
[];
var __VLS_164;
let __VLS_167;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
    label: "中文字体",
}));
const __VLS_169 = __VLS_168({
    label: "中文字体",
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
const { default: __VLS_172 } = __VLS_170.slots;
let __VLS_173;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
    modelValue: (__VLS_ctx.app.system_typefaces),
}));
const __VLS_175 = __VLS_174({
    modelValue: (__VLS_ctx.app.system_typefaces),
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
const { default: __VLS_178 } = __VLS_176.slots;
let __VLS_179;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
    value: (0),
    label: "默认字体",
}));
const __VLS_181 = __VLS_180({
    value: (0),
    label: "默认字体",
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
let __VLS_184;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({
    value: (1),
    label: "思源宋体",
}));
const __VLS_186 = __VLS_185({
    value: (1),
    label: "思源宋体",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
let __VLS_189;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189({
    value: (2),
    label: "思源黑体",
}));
const __VLS_191 = __VLS_190({
    value: (2),
    label: "思源黑体",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
// @ts-ignore
[app,];
var __VLS_176;
// @ts-ignore
[];
var __VLS_170;
let __VLS_194;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194({
    label: "中文简繁转换",
}));
const __VLS_196 = __VLS_195({
    label: "中文简繁转换",
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
const { default: __VLS_199 } = __VLS_197.slots;
let __VLS_200;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.app.chineseConverterType),
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.app.chineseConverterType),
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
const { default: __VLS_205 } = __VLS_203.slots;
let __VLS_206;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
    value: (0),
    label: "不转换",
}));
const __VLS_208 = __VLS_207({
    value: (0),
    label: "不转换",
}, ...__VLS_functionalComponentArgsRest(__VLS_207));
let __VLS_211;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_212 = __VLS_asFunctionalComponent1(__VLS_211, new __VLS_211({
    value: (1),
    label: "简转繁",
}));
const __VLS_213 = __VLS_212({
    value: (1),
    label: "简转繁",
}, ...__VLS_functionalComponentArgsRest(__VLS_212));
let __VLS_216;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
    value: (2),
    label: "繁转简",
}));
const __VLS_218 = __VLS_217({
    value: (2),
    label: "繁转简",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
// @ts-ignore
[app,];
var __VLS_203;
// @ts-ignore
[];
var __VLS_197;
// @ts-ignore
[];
var __VLS_49;
// @ts-ignore
[];
var __VLS_43;
let __VLS_221;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({
    label: "书架",
    name: "bookshelf",
}));
const __VLS_223 = __VLS_222({
    label: "书架",
    name: "bookshelf",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
const { default: __VLS_226 } = __VLS_224.slots;
let __VLS_227;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
    labelWidth: "180px",
}));
const __VLS_229 = __VLS_228({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
const { default: __VLS_232 } = __VLS_230.slots;
let __VLS_233;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({
    contentPosition: "left",
}));
const __VLS_235 = __VLS_234({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
const { default: __VLS_238 } = __VLS_236.slots;
// @ts-ignore
[];
var __VLS_236;
let __VLS_239;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_240 = __VLS_asFunctionalComponent1(__VLS_239, new __VLS_239({
    label: "书架排序",
}));
const __VLS_241 = __VLS_240({
    label: "书架排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_240));
const { default: __VLS_244 } = __VLS_242.slots;
let __VLS_245;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245({
    modelValue: (__VLS_ctx.app.bookshelfSort),
}));
const __VLS_247 = __VLS_246({
    modelValue: (__VLS_ctx.app.bookshelfSort),
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
const { default: __VLS_250 } = __VLS_248.slots;
let __VLS_251;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251({
    value: (0),
    label: "按阅读时间",
}));
const __VLS_253 = __VLS_252({
    value: (0),
    label: "按阅读时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_252));
let __VLS_256;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent1(__VLS_256, new __VLS_256({
    value: (1),
    label: "按更新时间",
}));
const __VLS_258 = __VLS_257({
    value: (1),
    label: "按更新时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
let __VLS_261;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({
    value: (2),
    label: "按书名",
}));
const __VLS_263 = __VLS_262({
    value: (2),
    label: "按书名",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
let __VLS_266;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
    value: (3),
    label: "手动排序",
}));
const __VLS_268 = __VLS_267({
    value: (3),
    label: "手动排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
// @ts-ignore
[app,];
var __VLS_248;
// @ts-ignore
[];
var __VLS_242;
let __VLS_271;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({
    label: "书架布局",
}));
const __VLS_273 = __VLS_272({
    label: "书架布局",
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
const { default: __VLS_276 } = __VLS_274.slots;
let __VLS_277;
/** @ts-ignore @type { | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components['el-radio-group'] | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components['el-radio-group']} */
elRadioGroup;
// @ts-ignore
const __VLS_278 = __VLS_asFunctionalComponent1(__VLS_277, new __VLS_277({
    modelValue: (__VLS_ctx.app.bookshelfLayout),
}));
const __VLS_279 = __VLS_278({
    modelValue: (__VLS_ctx.app.bookshelfLayout),
}, ...__VLS_functionalComponentArgsRest(__VLS_278));
const { default: __VLS_282 } = __VLS_280.slots;
let __VLS_283;
/** @ts-ignore @type { | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio'] | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio']} */
elRadio;
// @ts-ignore
const __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283({
    value: (0),
}));
const __VLS_285 = __VLS_284({
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_284));
const { default: __VLS_288 } = __VLS_286.slots;
// @ts-ignore
[app,];
var __VLS_286;
let __VLS_289;
/** @ts-ignore @type { | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio'] | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio']} */
elRadio;
// @ts-ignore
const __VLS_290 = __VLS_asFunctionalComponent1(__VLS_289, new __VLS_289({
    value: (1),
}));
const __VLS_291 = __VLS_290({
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_290));
const { default: __VLS_294 } = __VLS_292.slots;
// @ts-ignore
[];
var __VLS_292;
// @ts-ignore
[];
var __VLS_280;
// @ts-ignore
[];
var __VLS_274;
let __VLS_295;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_296 = __VLS_asFunctionalComponent1(__VLS_295, new __VLS_295({
    label: "书架边距",
}));
const __VLS_297 = __VLS_296({
    label: "书架边距",
}, ...__VLS_functionalComponentArgsRest(__VLS_296));
const { default: __VLS_300 } = __VLS_298.slots;
let __VLS_301;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_302 = __VLS_asFunctionalComponent1(__VLS_301, new __VLS_301({
    modelValue: (__VLS_ctx.app.bookshelfMargin),
    min: (0),
    max: (32),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_303 = __VLS_302({
    modelValue: (__VLS_ctx.app.bookshelfMargin),
    min: (0),
    max: (32),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_302));
// @ts-ignore
[app,];
var __VLS_298;
let __VLS_306;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_307 = __VLS_asFunctionalComponent1(__VLS_306, new __VLS_306({
    label: "书名显示",
}));
const __VLS_308 = __VLS_307({
    label: "书名显示",
}, ...__VLS_functionalComponentArgsRest(__VLS_307));
const { default: __VLS_311 } = __VLS_309.slots;
let __VLS_312;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent1(__VLS_312, new __VLS_312({
    modelValue: (__VLS_ctx.app.showBooknameLayout),
}));
const __VLS_314 = __VLS_313({
    modelValue: (__VLS_ctx.app.showBooknameLayout),
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
const { default: __VLS_317 } = __VLS_315.slots;
let __VLS_318;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_319 = __VLS_asFunctionalComponent1(__VLS_318, new __VLS_318({
    value: (0),
    label: "显示书名",
}));
const __VLS_320 = __VLS_319({
    value: (0),
    label: "显示书名",
}, ...__VLS_functionalComponentArgsRest(__VLS_319));
let __VLS_323;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_324 = __VLS_asFunctionalComponent1(__VLS_323, new __VLS_323({
    value: (1),
    label: "隐藏书名",
}));
const __VLS_325 = __VLS_324({
    value: (1),
    label: "隐藏书名",
}, ...__VLS_functionalComponentArgsRest(__VLS_324));
// @ts-ignore
[app,];
var __VLS_315;
// @ts-ignore
[];
var __VLS_309;
let __VLS_328;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent1(__VLS_328, new __VLS_328({
    label: "分组样式",
}));
const __VLS_330 = __VLS_329({
    label: "分组样式",
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
const { default: __VLS_333 } = __VLS_331.slots;
let __VLS_334;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_335 = __VLS_asFunctionalComponent1(__VLS_334, new __VLS_334({
    modelValue: (__VLS_ctx.app.bookGroupStyle),
}));
const __VLS_336 = __VLS_335({
    modelValue: (__VLS_ctx.app.bookGroupStyle),
}, ...__VLS_functionalComponentArgsRest(__VLS_335));
const { default: __VLS_339 } = __VLS_337.slots;
let __VLS_340;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent1(__VLS_340, new __VLS_340({
    value: (0),
    label: "不显示",
}));
const __VLS_342 = __VLS_341({
    value: (0),
    label: "不显示",
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
let __VLS_345;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_346 = __VLS_asFunctionalComponent1(__VLS_345, new __VLS_345({
    value: (1),
    label: "小标题",
}));
const __VLS_347 = __VLS_346({
    value: (1),
    label: "小标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_346));
let __VLS_350;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_351 = __VLS_asFunctionalComponent1(__VLS_350, new __VLS_350({
    value: (2),
    label: "大标题",
}));
const __VLS_352 = __VLS_351({
    value: (2),
    label: "大标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_351));
// @ts-ignore
[app,];
var __VLS_337;
// @ts-ignore
[];
var __VLS_331;
let __VLS_355;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_356 = __VLS_asFunctionalComponent1(__VLS_355, new __VLS_355({
    contentPosition: "left",
}));
const __VLS_357 = __VLS_356({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_356));
const { default: __VLS_360 } = __VLS_358.slots;
// @ts-ignore
[];
var __VLS_358;
let __VLS_361;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_362 = __VLS_asFunctionalComponent1(__VLS_361, new __VLS_361({
    label: "显示未读",
}));
const __VLS_363 = __VLS_362({
    label: "显示未读",
}, ...__VLS_functionalComponentArgsRest(__VLS_362));
const { default: __VLS_366 } = __VLS_364.slots;
let __VLS_367;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_368 = __VLS_asFunctionalComponent1(__VLS_367, new __VLS_367({
    modelValue: (__VLS_ctx.app.showUnread),
}));
const __VLS_369 = __VLS_368({
    modelValue: (__VLS_ctx.app.showUnread),
}, ...__VLS_functionalComponentArgsRest(__VLS_368));
// @ts-ignore
[app,];
var __VLS_364;
let __VLS_372;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_373 = __VLS_asFunctionalComponent1(__VLS_372, new __VLS_372({
    label: "显示更新时间",
}));
const __VLS_374 = __VLS_373({
    label: "显示更新时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_373));
const { default: __VLS_377 } = __VLS_375.slots;
let __VLS_378;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_379 = __VLS_asFunctionalComponent1(__VLS_378, new __VLS_378({
    modelValue: (__VLS_ctx.app.showLastUpdateTime),
}));
const __VLS_380 = __VLS_379({
    modelValue: (__VLS_ctx.app.showLastUpdateTime),
}, ...__VLS_functionalComponentArgsRest(__VLS_379));
// @ts-ignore
[app,];
var __VLS_375;
let __VLS_383;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_384 = __VLS_asFunctionalComponent1(__VLS_383, new __VLS_383({
    label: "显示等待更新数",
}));
const __VLS_385 = __VLS_384({
    label: "显示等待更新数",
}, ...__VLS_functionalComponentArgsRest(__VLS_384));
const { default: __VLS_388 } = __VLS_386.slots;
let __VLS_389;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_390 = __VLS_asFunctionalComponent1(__VLS_389, new __VLS_389({
    modelValue: (__VLS_ctx.app.showWaitUpCount),
}));
const __VLS_391 = __VLS_390({
    modelValue: (__VLS_ctx.app.showWaitUpCount),
}, ...__VLS_functionalComponentArgsRest(__VLS_390));
// @ts-ignore
[app,];
var __VLS_386;
let __VLS_394;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_395 = __VLS_asFunctionalComponent1(__VLS_394, new __VLS_394({
    label: "显示快速滚动条",
}));
const __VLS_396 = __VLS_395({
    label: "显示快速滚动条",
}, ...__VLS_functionalComponentArgsRest(__VLS_395));
const { default: __VLS_399 } = __VLS_397.slots;
let __VLS_400;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_401 = __VLS_asFunctionalComponent1(__VLS_400, new __VLS_400({
    modelValue: (__VLS_ctx.app.showBookshelfFastScroller),
}));
const __VLS_402 = __VLS_401({
    modelValue: (__VLS_ctx.app.showBookshelfFastScroller),
}, ...__VLS_functionalComponentArgsRest(__VLS_401));
// @ts-ignore
[app,];
var __VLS_397;
let __VLS_405;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent1(__VLS_405, new __VLS_405({
    label: "自动刷新",
}));
const __VLS_407 = __VLS_406({
    label: "自动刷新",
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
const { default: __VLS_410 } = __VLS_408.slots;
let __VLS_411;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_412 = __VLS_asFunctionalComponent1(__VLS_411, new __VLS_411({
    modelValue: (__VLS_ctx.app.auto_refresh),
}));
const __VLS_413 = __VLS_412({
    modelValue: (__VLS_ctx.app.auto_refresh),
}, ...__VLS_functionalComponentArgsRest(__VLS_412));
// @ts-ignore
[app,];
var __VLS_408;
let __VLS_416;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_417 = __VLS_asFunctionalComponent1(__VLS_416, new __VLS_416({
    label: "只更新已读",
}));
const __VLS_418 = __VLS_417({
    label: "只更新已读",
}, ...__VLS_functionalComponentArgsRest(__VLS_417));
const { default: __VLS_421 } = __VLS_419.slots;
let __VLS_422;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_423 = __VLS_asFunctionalComponent1(__VLS_422, new __VLS_422({
    modelValue: (__VLS_ctx.app.onlyUpdateRead),
}));
const __VLS_424 = __VLS_423({
    modelValue: (__VLS_ctx.app.onlyUpdateRead),
}, ...__VLS_functionalComponentArgsRest(__VLS_423));
// @ts-ignore
[app,];
var __VLS_419;
let __VLS_427;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_428 = __VLS_asFunctionalComponent1(__VLS_427, new __VLS_427({
    label: "默认进入阅读",
}));
const __VLS_429 = __VLS_428({
    label: "默认进入阅读",
}, ...__VLS_functionalComponentArgsRest(__VLS_428));
const { default: __VLS_432 } = __VLS_430.slots;
let __VLS_433;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_434 = __VLS_asFunctionalComponent1(__VLS_433, new __VLS_433({
    modelValue: (__VLS_ctx.app.defaultToRead),
}));
const __VLS_435 = __VLS_434({
    modelValue: (__VLS_ctx.app.defaultToRead),
}, ...__VLS_functionalComponentArgsRest(__VLS_434));
// @ts-ignore
[app,];
var __VLS_430;
let __VLS_438;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_439 = __VLS_asFunctionalComponent1(__VLS_438, new __VLS_438({
    contentPosition: "left",
}));
const __VLS_440 = __VLS_439({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_439));
const { default: __VLS_443 } = __VLS_441.slots;
// @ts-ignore
[];
var __VLS_441;
let __VLS_444;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_445 = __VLS_asFunctionalComponent1(__VLS_444, new __VLS_444({
    label: "使用默认封面",
}));
const __VLS_446 = __VLS_445({
    label: "使用默认封面",
}, ...__VLS_functionalComponentArgsRest(__VLS_445));
const { default: __VLS_449 } = __VLS_447.slots;
let __VLS_450;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_451 = __VLS_asFunctionalComponent1(__VLS_450, new __VLS_450({
    modelValue: (__VLS_ctx.app.useDefaultCover),
}));
const __VLS_452 = __VLS_451({
    modelValue: (__VLS_ctx.app.useDefaultCover),
}, ...__VLS_functionalComponentArgsRest(__VLS_451));
// @ts-ignore
[app,];
var __VLS_447;
let __VLS_455;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_456 = __VLS_asFunctionalComponent1(__VLS_455, new __VLS_455({
    label: "封面显示书名",
}));
const __VLS_457 = __VLS_456({
    label: "封面显示书名",
}, ...__VLS_functionalComponentArgsRest(__VLS_456));
const { default: __VLS_460 } = __VLS_458.slots;
let __VLS_461;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_462 = __VLS_asFunctionalComponent1(__VLS_461, new __VLS_461({
    modelValue: (__VLS_ctx.app.coverShowName),
}));
const __VLS_463 = __VLS_462({
    modelValue: (__VLS_ctx.app.coverShowName),
}, ...__VLS_functionalComponentArgsRest(__VLS_462));
// @ts-ignore
[app,];
var __VLS_458;
let __VLS_466;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_467 = __VLS_asFunctionalComponent1(__VLS_466, new __VLS_466({
    label: "封面显示作者",
}));
const __VLS_468 = __VLS_467({
    label: "封面显示作者",
}, ...__VLS_functionalComponentArgsRest(__VLS_467));
const { default: __VLS_471 } = __VLS_469.slots;
let __VLS_472;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_473 = __VLS_asFunctionalComponent1(__VLS_472, new __VLS_472({
    modelValue: (__VLS_ctx.app.coverShowAuthor),
}));
const __VLS_474 = __VLS_473({
    modelValue: (__VLS_ctx.app.coverShowAuthor),
}, ...__VLS_functionalComponentArgsRest(__VLS_473));
// @ts-ignore
[app,];
var __VLS_469;
let __VLS_477;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_478 = __VLS_asFunctionalComponent1(__VLS_477, new __VLS_477({
    label: "夜间封面显示书名",
}));
const __VLS_479 = __VLS_478({
    label: "夜间封面显示书名",
}, ...__VLS_functionalComponentArgsRest(__VLS_478));
const { default: __VLS_482 } = __VLS_480.slots;
let __VLS_483;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_484 = __VLS_asFunctionalComponent1(__VLS_483, new __VLS_483({
    modelValue: (__VLS_ctx.app.coverShowNameN),
}));
const __VLS_485 = __VLS_484({
    modelValue: (__VLS_ctx.app.coverShowNameN),
}, ...__VLS_functionalComponentArgsRest(__VLS_484));
// @ts-ignore
[app,];
var __VLS_480;
let __VLS_488;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_489 = __VLS_asFunctionalComponent1(__VLS_488, new __VLS_488({
    label: "夜间封面显示作者",
}));
const __VLS_490 = __VLS_489({
    label: "夜间封面显示作者",
}, ...__VLS_functionalComponentArgsRest(__VLS_489));
const { default: __VLS_493 } = __VLS_491.slots;
let __VLS_494;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_495 = __VLS_asFunctionalComponent1(__VLS_494, new __VLS_494({
    modelValue: (__VLS_ctx.app.coverShowAuthorN),
}));
const __VLS_496 = __VLS_495({
    modelValue: (__VLS_ctx.app.coverShowAuthorN),
}, ...__VLS_functionalComponentArgsRest(__VLS_495));
// @ts-ignore
[app,];
var __VLS_491;
let __VLS_499;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_500 = __VLS_asFunctionalComponent1(__VLS_499, new __VLS_499({
    label: "仅WiFi下载封面",
}));
const __VLS_501 = __VLS_500({
    label: "仅WiFi下载封面",
}, ...__VLS_functionalComponentArgsRest(__VLS_500));
const { default: __VLS_504 } = __VLS_502.slots;
let __VLS_505;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_506 = __VLS_asFunctionalComponent1(__VLS_505, new __VLS_505({
    modelValue: (__VLS_ctx.app.loadCoverOnlyWifi),
}));
const __VLS_507 = __VLS_506({
    modelValue: (__VLS_ctx.app.loadCoverOnlyWifi),
}, ...__VLS_functionalComponentArgsRest(__VLS_506));
// @ts-ignore
[app,];
var __VLS_502;
// @ts-ignore
[];
var __VLS_230;
// @ts-ignore
[];
var __VLS_224;
let __VLS_510;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_511 = __VLS_asFunctionalComponent1(__VLS_510, new __VLS_510({
    label: "书源",
    name: "source",
}));
const __VLS_512 = __VLS_511({
    label: "书源",
    name: "source",
}, ...__VLS_functionalComponentArgsRest(__VLS_511));
const { default: __VLS_515 } = __VLS_513.slots;
let __VLS_516;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_517 = __VLS_asFunctionalComponent1(__VLS_516, new __VLS_516({
    labelWidth: "180px",
}));
const __VLS_518 = __VLS_517({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_517));
const { default: __VLS_521 } = __VLS_519.slots;
let __VLS_522;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_523 = __VLS_asFunctionalComponent1(__VLS_522, new __VLS_522({
    contentPosition: "left",
}));
const __VLS_524 = __VLS_523({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_523));
const { default: __VLS_527 } = __VLS_525.slots;
// @ts-ignore
[];
var __VLS_525;
let __VLS_528;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_529 = __VLS_asFunctionalComponent1(__VLS_528, new __VLS_528({
    label: "并发线程数",
}));
const __VLS_530 = __VLS_529({
    label: "并发线程数",
}, ...__VLS_functionalComponentArgsRest(__VLS_529));
const { default: __VLS_533 } = __VLS_531.slots;
let __VLS_534;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_535 = __VLS_asFunctionalComponent1(__VLS_534, new __VLS_534({
    modelValue: (__VLS_ctx.app.threadCount),
    min: (1),
    max: (64),
}));
const __VLS_536 = __VLS_535({
    modelValue: (__VLS_ctx.app.threadCount),
    min: (1),
    max: (64),
}, ...__VLS_functionalComponentArgsRest(__VLS_535));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "form-tip" },
});
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
// @ts-ignore
[app,];
var __VLS_531;
let __VLS_539;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_540 = __VLS_asFunctionalComponent1(__VLS_539, new __VLS_539({
    label: "User-Agent",
}));
const __VLS_541 = __VLS_540({
    label: "User-Agent",
}, ...__VLS_functionalComponentArgsRest(__VLS_540));
const { default: __VLS_544 } = __VLS_542.slots;
let __VLS_545;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_546 = __VLS_asFunctionalComponent1(__VLS_545, new __VLS_545({
    modelValue: (__VLS_ctx.app.userAgent),
    type: "textarea",
    rows: (3),
}));
const __VLS_547 = __VLS_546({
    modelValue: (__VLS_ctx.app.userAgent),
    type: "textarea",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_546));
// @ts-ignore
[app,];
var __VLS_542;
let __VLS_550;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_551 = __VLS_asFunctionalComponent1(__VLS_550, new __VLS_550({
    label: "自定义Hosts",
}));
const __VLS_552 = __VLS_551({
    label: "自定义Hosts",
}, ...__VLS_functionalComponentArgsRest(__VLS_551));
const { default: __VLS_555 } = __VLS_553.slots;
let __VLS_556;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_557 = __VLS_asFunctionalComponent1(__VLS_556, new __VLS_556({
    modelValue: (__VLS_ctx.app.customHosts),
    type: "textarea",
    rows: (3),
    placeholder: '{"域名":"IP"}',
}));
const __VLS_558 = __VLS_557({
    modelValue: (__VLS_ctx.app.customHosts),
    type: "textarea",
    rows: (3),
    placeholder: '{"域名":"IP"}',
}, ...__VLS_functionalComponentArgsRest(__VLS_557));
// @ts-ignore
[app,];
var __VLS_553;
let __VLS_561;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_562 = __VLS_asFunctionalComponent1(__VLS_561, new __VLS_561({
    label: "使用Cronet",
}));
const __VLS_563 = __VLS_562({
    label: "使用Cronet",
}, ...__VLS_functionalComponentArgsRest(__VLS_562));
const { default: __VLS_566 } = __VLS_564.slots;
let __VLS_567;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_568 = __VLS_asFunctionalComponent1(__VLS_567, new __VLS_567({
    modelValue: (__VLS_ctx.app.Cronet),
}));
const __VLS_569 = __VLS_568({
    modelValue: (__VLS_ctx.app.Cronet),
}, ...__VLS_functionalComponentArgsRest(__VLS_568));
// @ts-ignore
[app,];
var __VLS_564;
let __VLS_572;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_573 = __VLS_asFunctionalComponent1(__VLS_572, new __VLS_572({
    contentPosition: "left",
}));
const __VLS_574 = __VLS_573({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_573));
const { default: __VLS_577 } = __VLS_575.slots;
// @ts-ignore
[];
var __VLS_575;
let __VLS_578;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_579 = __VLS_asFunctionalComponent1(__VLS_578, new __VLS_578({
    label: "换源校验作者",
}));
const __VLS_580 = __VLS_579({
    label: "换源校验作者",
}, ...__VLS_functionalComponentArgsRest(__VLS_579));
const { default: __VLS_583 } = __VLS_581.slots;
let __VLS_584;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_585 = __VLS_asFunctionalComponent1(__VLS_584, new __VLS_584({
    modelValue: (__VLS_ctx.app.changeSourceCheckAuthor),
}));
const __VLS_586 = __VLS_585({
    modelValue: (__VLS_ctx.app.changeSourceCheckAuthor),
}, ...__VLS_functionalComponentArgsRest(__VLS_585));
// @ts-ignore
[app,];
var __VLS_581;
let __VLS_589;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_590 = __VLS_asFunctionalComponent1(__VLS_589, new __VLS_589({
    label: "自动换源",
}));
const __VLS_591 = __VLS_590({
    label: "自动换源",
}, ...__VLS_functionalComponentArgsRest(__VLS_590));
const { default: __VLS_594 } = __VLS_592.slots;
let __VLS_595;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_596 = __VLS_asFunctionalComponent1(__VLS_595, new __VLS_595({
    modelValue: (__VLS_ctx.app.autoChangeSource),
}));
const __VLS_597 = __VLS_596({
    modelValue: (__VLS_ctx.app.autoChangeSource),
}, ...__VLS_functionalComponentArgsRest(__VLS_596));
// @ts-ignore
[app,];
var __VLS_592;
let __VLS_600;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_601 = __VLS_asFunctionalComponent1(__VLS_600, new __VLS_600({
    label: "换源加载信息",
}));
const __VLS_602 = __VLS_601({
    label: "换源加载信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_601));
const { default: __VLS_605 } = __VLS_603.slots;
let __VLS_606;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_607 = __VLS_asFunctionalComponent1(__VLS_606, new __VLS_606({
    modelValue: (__VLS_ctx.app.changeSourceLoadInfo),
}));
const __VLS_608 = __VLS_607({
    modelValue: (__VLS_ctx.app.changeSourceLoadInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_607));
// @ts-ignore
[app,];
var __VLS_603;
let __VLS_611;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_612 = __VLS_asFunctionalComponent1(__VLS_611, new __VLS_611({
    label: "换源加载目录",
}));
const __VLS_613 = __VLS_612({
    label: "换源加载目录",
}, ...__VLS_functionalComponentArgsRest(__VLS_612));
const { default: __VLS_616 } = __VLS_614.slots;
let __VLS_617;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_618 = __VLS_asFunctionalComponent1(__VLS_617, new __VLS_617({
    modelValue: (__VLS_ctx.app.changeSourceLoadToc),
}));
const __VLS_619 = __VLS_618({
    modelValue: (__VLS_ctx.app.changeSourceLoadToc),
}, ...__VLS_functionalComponentArgsRest(__VLS_618));
// @ts-ignore
[app,];
var __VLS_614;
let __VLS_622;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_623 = __VLS_asFunctionalComponent1(__VLS_622, new __VLS_622({
    label: "换源加载字数",
}));
const __VLS_624 = __VLS_623({
    label: "换源加载字数",
}, ...__VLS_functionalComponentArgsRest(__VLS_623));
const { default: __VLS_627 } = __VLS_625.slots;
let __VLS_628;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_629 = __VLS_asFunctionalComponent1(__VLS_628, new __VLS_628({
    modelValue: (__VLS_ctx.app.changeSourceLoadWordCount),
}));
const __VLS_630 = __VLS_629({
    modelValue: (__VLS_ctx.app.changeSourceLoadWordCount),
}, ...__VLS_functionalComponentArgsRest(__VLS_629));
// @ts-ignore
[app,];
var __VLS_625;
let __VLS_633;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_634 = __VLS_asFunctionalComponent1(__VLS_633, new __VLS_633({
    label: "批量换源延迟(ms)",
}));
const __VLS_635 = __VLS_634({
    label: "批量换源延迟(ms)",
}, ...__VLS_functionalComponentArgsRest(__VLS_634));
const { default: __VLS_638 } = __VLS_636.slots;
let __VLS_639;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_640 = __VLS_asFunctionalComponent1(__VLS_639, new __VLS_639({
    modelValue: (__VLS_ctx.app.batchChangeSourceDelay),
    min: (0),
    max: (10000),
    step: (100),
}));
const __VLS_641 = __VLS_640({
    modelValue: (__VLS_ctx.app.batchChangeSourceDelay),
    min: (0),
    max: (10000),
    step: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_640));
// @ts-ignore
[app,];
var __VLS_636;
let __VLS_644;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_645 = __VLS_asFunctionalComponent1(__VLS_644, new __VLS_644({
    contentPosition: "left",
}));
const __VLS_646 = __VLS_645({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_645));
const { default: __VLS_649 } = __VLS_647.slots;
// @ts-ignore
[];
var __VLS_647;
let __VLS_650;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_651 = __VLS_asFunctionalComponent1(__VLS_650, new __VLS_650({
    label: "精确搜索",
}));
const __VLS_652 = __VLS_651({
    label: "精确搜索",
}, ...__VLS_functionalComponentArgsRest(__VLS_651));
const { default: __VLS_655 } = __VLS_653.slots;
let __VLS_656;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_657 = __VLS_asFunctionalComponent1(__VLS_656, new __VLS_656({
    modelValue: (__VLS_ctx.app.precisionSearch),
}));
const __VLS_658 = __VLS_657({
    modelValue: (__VLS_ctx.app.precisionSearch),
}, ...__VLS_functionalComponentArgsRest(__VLS_657));
// @ts-ignore
[app,];
var __VLS_653;
let __VLS_661;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_662 = __VLS_asFunctionalComponent1(__VLS_661, new __VLS_661({
    label: "点击标题打开信息",
}));
const __VLS_663 = __VLS_662({
    label: "点击标题打开信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_662));
const { default: __VLS_666 } = __VLS_664.slots;
let __VLS_667;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_668 = __VLS_asFunctionalComponent1(__VLS_667, new __VLS_667({
    modelValue: (__VLS_ctx.app.openBookInfoByClickTitle),
}));
const __VLS_669 = __VLS_668({
    modelValue: (__VLS_ctx.app.openBookInfoByClickTitle),
}, ...__VLS_functionalComponentArgsRest(__VLS_668));
// @ts-ignore
[app,];
var __VLS_664;
let __VLS_672;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_673 = __VLS_asFunctionalComponent1(__VLS_672, new __VLS_672({
    contentPosition: "left",
}));
const __VLS_674 = __VLS_673({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_673));
const { default: __VLS_677 } = __VLS_675.slots;
// @ts-ignore
[];
var __VLS_675;
let __VLS_678;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_679 = __VLS_asFunctionalComponent1(__VLS_678, new __VLS_678({
    label: "位图缓存大小(MB)",
}));
const __VLS_680 = __VLS_679({
    label: "位图缓存大小(MB)",
}, ...__VLS_functionalComponentArgsRest(__VLS_679));
const { default: __VLS_683 } = __VLS_681.slots;
let __VLS_684;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_685 = __VLS_asFunctionalComponent1(__VLS_684, new __VLS_684({
    modelValue: (__VLS_ctx.app.bitmapCacheSize),
    min: (10),
    max: (500),
}));
const __VLS_686 = __VLS_685({
    modelValue: (__VLS_ctx.app.bitmapCacheSize),
    min: (10),
    max: (500),
}, ...__VLS_functionalComponentArgsRest(__VLS_685));
// @ts-ignore
[app,];
var __VLS_681;
let __VLS_689;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_690 = __VLS_asFunctionalComponent1(__VLS_689, new __VLS_689({
    label: "图片保留数量",
}));
const __VLS_691 = __VLS_690({
    label: "图片保留数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_690));
const { default: __VLS_694 } = __VLS_692.slots;
let __VLS_695;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_696 = __VLS_asFunctionalComponent1(__VLS_695, new __VLS_695({
    modelValue: (__VLS_ctx.app.imageRetainNum),
    min: (0),
    max: (100),
}));
const __VLS_697 = __VLS_696({
    modelValue: (__VLS_ctx.app.imageRetainNum),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_696));
// @ts-ignore
[app,];
var __VLS_692;
let __VLS_700;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_701 = __VLS_asFunctionalComponent1(__VLS_700, new __VLS_700({
    label: "预下载数量",
}));
const __VLS_702 = __VLS_701({
    label: "预下载数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_701));
const { default: __VLS_705 } = __VLS_703.slots;
let __VLS_706;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_707 = __VLS_asFunctionalComponent1(__VLS_706, new __VLS_706({
    modelValue: (__VLS_ctx.app.preDownloadNum),
    min: (0),
    max: (100),
}));
const __VLS_708 = __VLS_707({
    modelValue: (__VLS_ctx.app.preDownloadNum),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_707));
// @ts-ignore
[app,];
var __VLS_703;
// @ts-ignore
[];
var __VLS_519;
// @ts-ignore
[];
var __VLS_513;
let __VLS_711;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_712 = __VLS_asFunctionalComponent1(__VLS_711, new __VLS_711({
    label: "阅读",
    name: "read",
}));
const __VLS_713 = __VLS_712({
    label: "阅读",
    name: "read",
}, ...__VLS_functionalComponentArgsRest(__VLS_712));
const { default: __VLS_716 } = __VLS_714.slots;
let __VLS_717;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_718 = __VLS_asFunctionalComponent1(__VLS_717, new __VLS_717({
    labelWidth: "180px",
}));
const __VLS_719 = __VLS_718({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_718));
const { default: __VLS_722 } = __VLS_720.slots;
let __VLS_723;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_724 = __VLS_asFunctionalComponent1(__VLS_723, new __VLS_723({
    contentPosition: "left",
}));
const __VLS_725 = __VLS_724({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_724));
const { default: __VLS_728 } = __VLS_726.slots;
// @ts-ignore
[];
var __VLS_726;
let __VLS_729;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_730 = __VLS_asFunctionalComponent1(__VLS_729, new __VLS_729({
    label: "正文居左",
}));
const __VLS_731 = __VLS_730({
    label: "正文居左",
}, ...__VLS_functionalComponentArgsRest(__VLS_730));
const { default: __VLS_734 } = __VLS_732.slots;
let __VLS_735;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_736 = __VLS_asFunctionalComponent1(__VLS_735, new __VLS_735({
    modelValue: (__VLS_ctx.read.readBodyToLh),
}));
const __VLS_737 = __VLS_736({
    modelValue: (__VLS_ctx.read.readBodyToLh),
}, ...__VLS_functionalComponentArgsRest(__VLS_736));
// @ts-ignore
[read,];
var __VLS_732;
let __VLS_740;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_741 = __VLS_asFunctionalComponent1(__VLS_740, new __VLS_740({
    label: "两端对齐",
}));
const __VLS_742 = __VLS_741({
    label: "两端对齐",
}, ...__VLS_functionalComponentArgsRest(__VLS_741));
const { default: __VLS_745 } = __VLS_743.slots;
let __VLS_746;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_747 = __VLS_asFunctionalComponent1(__VLS_746, new __VLS_746({
    modelValue: (__VLS_ctx.read.textFullJustify),
}));
const __VLS_748 = __VLS_747({
    modelValue: (__VLS_ctx.read.textFullJustify),
}, ...__VLS_functionalComponentArgsRest(__VLS_747));
// @ts-ignore
[read,];
var __VLS_743;
let __VLS_751;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_752 = __VLS_asFunctionalComponent1(__VLS_751, new __VLS_751({
    label: "底部对齐",
}));
const __VLS_753 = __VLS_752({
    label: "底部对齐",
}, ...__VLS_functionalComponentArgsRest(__VLS_752));
const { default: __VLS_756 } = __VLS_754.slots;
let __VLS_757;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_758 = __VLS_asFunctionalComponent1(__VLS_757, new __VLS_757({
    modelValue: (__VLS_ctx.read.textBottomJustify),
}));
const __VLS_759 = __VLS_758({
    modelValue: (__VLS_ctx.read.textBottomJustify),
}, ...__VLS_functionalComponentArgsRest(__VLS_758));
// @ts-ignore
[read,];
var __VLS_754;
let __VLS_762;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_763 = __VLS_asFunctionalComponent1(__VLS_762, new __VLS_762({
    label: "中文排版",
}));
const __VLS_764 = __VLS_763({
    label: "中文排版",
}, ...__VLS_functionalComponentArgsRest(__VLS_763));
const { default: __VLS_767 } = __VLS_765.slots;
let __VLS_768;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_769 = __VLS_asFunctionalComponent1(__VLS_768, new __VLS_768({
    modelValue: (__VLS_ctx.read.useZhLayout),
}));
const __VLS_770 = __VLS_769({
    modelValue: (__VLS_ctx.read.useZhLayout),
}, ...__VLS_functionalComponentArgsRest(__VLS_769));
// @ts-ignore
[read,];
var __VLS_765;
let __VLS_773;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_774 = __VLS_asFunctionalComponent1(__VLS_773, new __VLS_773({
    label: "适配特殊样式",
}));
const __VLS_775 = __VLS_774({
    label: "适配特殊样式",
}, ...__VLS_functionalComponentArgsRest(__VLS_774));
const { default: __VLS_778 } = __VLS_776.slots;
let __VLS_779;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_780 = __VLS_asFunctionalComponent1(__VLS_779, new __VLS_779({
    modelValue: (__VLS_ctx.read.adaptSpecialStyle),
}));
const __VLS_781 = __VLS_780({
    modelValue: (__VLS_ctx.read.adaptSpecialStyle),
}, ...__VLS_functionalComponentArgsRest(__VLS_780));
// @ts-ignore
[read,];
var __VLS_776;
let __VLS_784;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_785 = __VLS_asFunctionalComponent1(__VLS_784, new __VLS_784({
    label: "文本可选",
}));
const __VLS_786 = __VLS_785({
    label: "文本可选",
}, ...__VLS_functionalComponentArgsRest(__VLS_785));
const { default: __VLS_789 } = __VLS_787.slots;
let __VLS_790;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_791 = __VLS_asFunctionalComponent1(__VLS_790, new __VLS_790({
    modelValue: (__VLS_ctx.read.selectText),
}));
const __VLS_792 = __VLS_791({
    modelValue: (__VLS_ctx.read.selectText),
}, ...__VLS_functionalComponentArgsRest(__VLS_791));
// @ts-ignore
[read,];
var __VLS_787;
let __VLS_795;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_796 = __VLS_asFunctionalComponent1(__VLS_795, new __VLS_795({
    label: "共享布局",
}));
const __VLS_797 = __VLS_796({
    label: "共享布局",
}, ...__VLS_functionalComponentArgsRest(__VLS_796));
const { default: __VLS_800 } = __VLS_798.slots;
let __VLS_801;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_802 = __VLS_asFunctionalComponent1(__VLS_801, new __VLS_801({
    modelValue: (__VLS_ctx.read.shareLayout),
}));
const __VLS_803 = __VLS_802({
    modelValue: (__VLS_ctx.read.shareLayout),
}, ...__VLS_functionalComponentArgsRest(__VLS_802));
// @ts-ignore
[read,];
var __VLS_798;
let __VLS_806;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_807 = __VLS_asFunctionalComponent1(__VLS_806, new __VLS_806({
    contentPosition: "left",
}));
const __VLS_808 = __VLS_807({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_807));
const { default: __VLS_811 } = __VLS_809.slots;
// @ts-ignore
[];
var __VLS_809;
let __VLS_812;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_813 = __VLS_asFunctionalComponent1(__VLS_812, new __VLS_812({
    label: "左上角",
}));
const __VLS_814 = __VLS_813({
    label: "左上角",
}, ...__VLS_functionalComponentArgsRest(__VLS_813));
const { default: __VLS_817 } = __VLS_815.slots;
let __VLS_818;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_819 = __VLS_asFunctionalComponent1(__VLS_818, new __VLS_818({
    modelValue: (__VLS_ctx.read.clickActionTopLeft),
    ...{ style: {} },
}));
const __VLS_820 = __VLS_819({
    modelValue: (__VLS_ctx.read.clickActionTopLeft),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_819));
const { default: __VLS_823 } = __VLS_821.slots;
let __VLS_824;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_825 = __VLS_asFunctionalComponent1(__VLS_824, new __VLS_824({
    value: (0),
    label: "下一页",
}));
const __VLS_826 = __VLS_825({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_825));
let __VLS_829;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_830 = __VLS_asFunctionalComponent1(__VLS_829, new __VLS_829({
    value: (1),
    label: "上一页",
}));
const __VLS_831 = __VLS_830({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_830));
let __VLS_834;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_835 = __VLS_asFunctionalComponent1(__VLS_834, new __VLS_834({
    value: (2),
    label: "菜单",
}));
const __VLS_836 = __VLS_835({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_835));
// @ts-ignore
[read,];
var __VLS_821;
// @ts-ignore
[];
var __VLS_815;
let __VLS_839;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_840 = __VLS_asFunctionalComponent1(__VLS_839, new __VLS_839({
    label: "上中",
}));
const __VLS_841 = __VLS_840({
    label: "上中",
}, ...__VLS_functionalComponentArgsRest(__VLS_840));
const { default: __VLS_844 } = __VLS_842.slots;
let __VLS_845;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_846 = __VLS_asFunctionalComponent1(__VLS_845, new __VLS_845({
    modelValue: (__VLS_ctx.read.clickActionTopCenter),
    ...{ style: {} },
}));
const __VLS_847 = __VLS_846({
    modelValue: (__VLS_ctx.read.clickActionTopCenter),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_846));
const { default: __VLS_850 } = __VLS_848.slots;
let __VLS_851;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_852 = __VLS_asFunctionalComponent1(__VLS_851, new __VLS_851({
    value: (0),
    label: "下一页",
}));
const __VLS_853 = __VLS_852({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_852));
let __VLS_856;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_857 = __VLS_asFunctionalComponent1(__VLS_856, new __VLS_856({
    value: (1),
    label: "上一页",
}));
const __VLS_858 = __VLS_857({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_857));
let __VLS_861;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_862 = __VLS_asFunctionalComponent1(__VLS_861, new __VLS_861({
    value: (2),
    label: "菜单",
}));
const __VLS_863 = __VLS_862({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_862));
// @ts-ignore
[read,];
var __VLS_848;
// @ts-ignore
[];
var __VLS_842;
let __VLS_866;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_867 = __VLS_asFunctionalComponent1(__VLS_866, new __VLS_866({
    label: "右上角",
}));
const __VLS_868 = __VLS_867({
    label: "右上角",
}, ...__VLS_functionalComponentArgsRest(__VLS_867));
const { default: __VLS_871 } = __VLS_869.slots;
let __VLS_872;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_873 = __VLS_asFunctionalComponent1(__VLS_872, new __VLS_872({
    modelValue: (__VLS_ctx.read.clickActionTopRight),
    ...{ style: {} },
}));
const __VLS_874 = __VLS_873({
    modelValue: (__VLS_ctx.read.clickActionTopRight),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_873));
const { default: __VLS_877 } = __VLS_875.slots;
let __VLS_878;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_879 = __VLS_asFunctionalComponent1(__VLS_878, new __VLS_878({
    value: (0),
    label: "下一页",
}));
const __VLS_880 = __VLS_879({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_879));
let __VLS_883;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_884 = __VLS_asFunctionalComponent1(__VLS_883, new __VLS_883({
    value: (1),
    label: "上一页",
}));
const __VLS_885 = __VLS_884({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_884));
let __VLS_888;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_889 = __VLS_asFunctionalComponent1(__VLS_888, new __VLS_888({
    value: (2),
    label: "菜单",
}));
const __VLS_890 = __VLS_889({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_889));
// @ts-ignore
[read,];
var __VLS_875;
// @ts-ignore
[];
var __VLS_869;
let __VLS_893;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_894 = __VLS_asFunctionalComponent1(__VLS_893, new __VLS_893({
    label: "左中",
}));
const __VLS_895 = __VLS_894({
    label: "左中",
}, ...__VLS_functionalComponentArgsRest(__VLS_894));
const { default: __VLS_898 } = __VLS_896.slots;
let __VLS_899;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_900 = __VLS_asFunctionalComponent1(__VLS_899, new __VLS_899({
    modelValue: (__VLS_ctx.read.clickActionMiddleLeft),
    ...{ style: {} },
}));
const __VLS_901 = __VLS_900({
    modelValue: (__VLS_ctx.read.clickActionMiddleLeft),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_900));
const { default: __VLS_904 } = __VLS_902.slots;
let __VLS_905;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_906 = __VLS_asFunctionalComponent1(__VLS_905, new __VLS_905({
    value: (0),
    label: "下一页",
}));
const __VLS_907 = __VLS_906({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_906));
let __VLS_910;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_911 = __VLS_asFunctionalComponent1(__VLS_910, new __VLS_910({
    value: (1),
    label: "上一页",
}));
const __VLS_912 = __VLS_911({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_911));
let __VLS_915;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_916 = __VLS_asFunctionalComponent1(__VLS_915, new __VLS_915({
    value: (2),
    label: "菜单",
}));
const __VLS_917 = __VLS_916({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_916));
// @ts-ignore
[read,];
var __VLS_902;
// @ts-ignore
[];
var __VLS_896;
let __VLS_920;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_921 = __VLS_asFunctionalComponent1(__VLS_920, new __VLS_920({
    label: "正中",
}));
const __VLS_922 = __VLS_921({
    label: "正中",
}, ...__VLS_functionalComponentArgsRest(__VLS_921));
const { default: __VLS_925 } = __VLS_923.slots;
let __VLS_926;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_927 = __VLS_asFunctionalComponent1(__VLS_926, new __VLS_926({
    modelValue: (__VLS_ctx.read.clickActionMiddleCenter),
    ...{ style: {} },
}));
const __VLS_928 = __VLS_927({
    modelValue: (__VLS_ctx.read.clickActionMiddleCenter),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_927));
const { default: __VLS_931 } = __VLS_929.slots;
let __VLS_932;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_933 = __VLS_asFunctionalComponent1(__VLS_932, new __VLS_932({
    value: (0),
    label: "下一页",
}));
const __VLS_934 = __VLS_933({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_933));
let __VLS_937;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_938 = __VLS_asFunctionalComponent1(__VLS_937, new __VLS_937({
    value: (1),
    label: "上一页",
}));
const __VLS_939 = __VLS_938({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_938));
let __VLS_942;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_943 = __VLS_asFunctionalComponent1(__VLS_942, new __VLS_942({
    value: (2),
    label: "菜单",
}));
const __VLS_944 = __VLS_943({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_943));
// @ts-ignore
[read,];
var __VLS_929;
// @ts-ignore
[];
var __VLS_923;
let __VLS_947;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_948 = __VLS_asFunctionalComponent1(__VLS_947, new __VLS_947({
    label: "右中",
}));
const __VLS_949 = __VLS_948({
    label: "右中",
}, ...__VLS_functionalComponentArgsRest(__VLS_948));
const { default: __VLS_952 } = __VLS_950.slots;
let __VLS_953;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_954 = __VLS_asFunctionalComponent1(__VLS_953, new __VLS_953({
    modelValue: (__VLS_ctx.read.clickActionMiddleRight),
    ...{ style: {} },
}));
const __VLS_955 = __VLS_954({
    modelValue: (__VLS_ctx.read.clickActionMiddleRight),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_954));
const { default: __VLS_958 } = __VLS_956.slots;
let __VLS_959;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_960 = __VLS_asFunctionalComponent1(__VLS_959, new __VLS_959({
    value: (0),
    label: "下一页",
}));
const __VLS_961 = __VLS_960({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_960));
let __VLS_964;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_965 = __VLS_asFunctionalComponent1(__VLS_964, new __VLS_964({
    value: (1),
    label: "上一页",
}));
const __VLS_966 = __VLS_965({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_965));
let __VLS_969;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_970 = __VLS_asFunctionalComponent1(__VLS_969, new __VLS_969({
    value: (2),
    label: "菜单",
}));
const __VLS_971 = __VLS_970({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_970));
// @ts-ignore
[read,];
var __VLS_956;
// @ts-ignore
[];
var __VLS_950;
let __VLS_974;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_975 = __VLS_asFunctionalComponent1(__VLS_974, new __VLS_974({
    label: "左下角",
}));
const __VLS_976 = __VLS_975({
    label: "左下角",
}, ...__VLS_functionalComponentArgsRest(__VLS_975));
const { default: __VLS_979 } = __VLS_977.slots;
let __VLS_980;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_981 = __VLS_asFunctionalComponent1(__VLS_980, new __VLS_980({
    modelValue: (__VLS_ctx.read.clickActionBottomLeft),
    ...{ style: {} },
}));
const __VLS_982 = __VLS_981({
    modelValue: (__VLS_ctx.read.clickActionBottomLeft),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_981));
const { default: __VLS_985 } = __VLS_983.slots;
let __VLS_986;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_987 = __VLS_asFunctionalComponent1(__VLS_986, new __VLS_986({
    value: (0),
    label: "下一页",
}));
const __VLS_988 = __VLS_987({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_987));
let __VLS_991;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_992 = __VLS_asFunctionalComponent1(__VLS_991, new __VLS_991({
    value: (1),
    label: "上一页",
}));
const __VLS_993 = __VLS_992({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_992));
let __VLS_996;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_997 = __VLS_asFunctionalComponent1(__VLS_996, new __VLS_996({
    value: (2),
    label: "菜单",
}));
const __VLS_998 = __VLS_997({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_997));
// @ts-ignore
[read,];
var __VLS_983;
// @ts-ignore
[];
var __VLS_977;
let __VLS_1001;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1002 = __VLS_asFunctionalComponent1(__VLS_1001, new __VLS_1001({
    label: "下中",
}));
const __VLS_1003 = __VLS_1002({
    label: "下中",
}, ...__VLS_functionalComponentArgsRest(__VLS_1002));
const { default: __VLS_1006 } = __VLS_1004.slots;
let __VLS_1007;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_1008 = __VLS_asFunctionalComponent1(__VLS_1007, new __VLS_1007({
    modelValue: (__VLS_ctx.read.clickActionBottomCenter),
    ...{ style: {} },
}));
const __VLS_1009 = __VLS_1008({
    modelValue: (__VLS_ctx.read.clickActionBottomCenter),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1008));
const { default: __VLS_1012 } = __VLS_1010.slots;
let __VLS_1013;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1014 = __VLS_asFunctionalComponent1(__VLS_1013, new __VLS_1013({
    value: (0),
    label: "下一页",
}));
const __VLS_1015 = __VLS_1014({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1014));
let __VLS_1018;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1019 = __VLS_asFunctionalComponent1(__VLS_1018, new __VLS_1018({
    value: (1),
    label: "上一页",
}));
const __VLS_1020 = __VLS_1019({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1019));
let __VLS_1023;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1024 = __VLS_asFunctionalComponent1(__VLS_1023, new __VLS_1023({
    value: (2),
    label: "菜单",
}));
const __VLS_1025 = __VLS_1024({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_1024));
// @ts-ignore
[read,];
var __VLS_1010;
// @ts-ignore
[];
var __VLS_1004;
let __VLS_1028;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1029 = __VLS_asFunctionalComponent1(__VLS_1028, new __VLS_1028({
    label: "右下角",
}));
const __VLS_1030 = __VLS_1029({
    label: "右下角",
}, ...__VLS_functionalComponentArgsRest(__VLS_1029));
const { default: __VLS_1033 } = __VLS_1031.slots;
let __VLS_1034;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_1035 = __VLS_asFunctionalComponent1(__VLS_1034, new __VLS_1034({
    modelValue: (__VLS_ctx.read.clickActionBottomRight),
    ...{ style: {} },
}));
const __VLS_1036 = __VLS_1035({
    modelValue: (__VLS_ctx.read.clickActionBottomRight),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1035));
const { default: __VLS_1039 } = __VLS_1037.slots;
let __VLS_1040;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1041 = __VLS_asFunctionalComponent1(__VLS_1040, new __VLS_1040({
    value: (0),
    label: "下一页",
}));
const __VLS_1042 = __VLS_1041({
    value: (0),
    label: "下一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1041));
let __VLS_1045;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1046 = __VLS_asFunctionalComponent1(__VLS_1045, new __VLS_1045({
    value: (1),
    label: "上一页",
}));
const __VLS_1047 = __VLS_1046({
    value: (1),
    label: "上一页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1046));
let __VLS_1050;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1051 = __VLS_asFunctionalComponent1(__VLS_1050, new __VLS_1050({
    value: (2),
    label: "菜单",
}));
const __VLS_1052 = __VLS_1051({
    value: (2),
    label: "菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_1051));
// @ts-ignore
[read,];
var __VLS_1037;
// @ts-ignore
[];
var __VLS_1031;
let __VLS_1055;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1056 = __VLS_asFunctionalComponent1(__VLS_1055, new __VLS_1055({
    contentPosition: "left",
}));
const __VLS_1057 = __VLS_1056({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1056));
const { default: __VLS_1060 } = __VLS_1058.slots;
// @ts-ignore
[];
var __VLS_1058;
let __VLS_1061;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1062 = __VLS_asFunctionalComponent1(__VLS_1061, new __VLS_1061({
    label: "自动阅读速度",
}));
const __VLS_1063 = __VLS_1062({
    label: "自动阅读速度",
}, ...__VLS_functionalComponentArgsRest(__VLS_1062));
const { default: __VLS_1066 } = __VLS_1064.slots;
let __VLS_1067;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_1068 = __VLS_asFunctionalComponent1(__VLS_1067, new __VLS_1067({
    modelValue: (__VLS_ctx.read.autoReadSpeed),
    min: (1),
    max: (30),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_1069 = __VLS_1068({
    modelValue: (__VLS_ctx.read.autoReadSpeed),
    min: (1),
    max: (30),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1068));
// @ts-ignore
[read,];
var __VLS_1064;
let __VLS_1072;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1073 = __VLS_asFunctionalComponent1(__VLS_1072, new __VLS_1072({
    label: "无动画滚动翻页",
}));
const __VLS_1074 = __VLS_1073({
    label: "无动画滚动翻页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1073));
const { default: __VLS_1077 } = __VLS_1075.slots;
let __VLS_1078;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1079 = __VLS_asFunctionalComponent1(__VLS_1078, new __VLS_1078({
    modelValue: (__VLS_ctx.read.noAnimScrollPage),
}));
const __VLS_1080 = __VLS_1079({
    modelValue: (__VLS_ctx.read.noAnimScrollPage),
}, ...__VLS_functionalComponentArgsRest(__VLS_1079));
// @ts-ignore
[read,];
var __VLS_1075;
let __VLS_1083;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1084 = __VLS_asFunctionalComponent1(__VLS_1083, new __VLS_1083({
    label: "展开文本菜单",
}));
const __VLS_1085 = __VLS_1084({
    label: "展开文本菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_1084));
const { default: __VLS_1088 } = __VLS_1086.slots;
let __VLS_1089;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1090 = __VLS_asFunctionalComponent1(__VLS_1089, new __VLS_1089({
    modelValue: (__VLS_ctx.read.expandTextMenu),
}));
const __VLS_1091 = __VLS_1090({
    modelValue: (__VLS_ctx.read.expandTextMenu),
}, ...__VLS_functionalComponentArgsRest(__VLS_1090));
// @ts-ignore
[read,];
var __VLS_1086;
let __VLS_1094;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1095 = __VLS_asFunctionalComponent1(__VLS_1094, new __VLS_1094({
    contentPosition: "left",
}));
const __VLS_1096 = __VLS_1095({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1095));
const { default: __VLS_1099 } = __VLS_1097.slots;
// @ts-ignore
[];
var __VLS_1097;
let __VLS_1100;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1101 = __VLS_asFunctionalComponent1(__VLS_1100, new __VLS_1100({
    label: "日间亮度",
}));
const __VLS_1102 = __VLS_1101({
    label: "日间亮度",
}, ...__VLS_functionalComponentArgsRest(__VLS_1101));
const { default: __VLS_1105 } = __VLS_1103.slots;
let __VLS_1106;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_1107 = __VLS_asFunctionalComponent1(__VLS_1106, new __VLS_1106({
    modelValue: (__VLS_ctx.read.brightness),
    min: (0),
    max: (100),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_1108 = __VLS_1107({
    modelValue: (__VLS_ctx.read.brightness),
    min: (0),
    max: (100),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1107));
// @ts-ignore
[read,];
var __VLS_1103;
let __VLS_1111;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1112 = __VLS_asFunctionalComponent1(__VLS_1111, new __VLS_1111({
    label: "夜间亮度",
}));
const __VLS_1113 = __VLS_1112({
    label: "夜间亮度",
}, ...__VLS_functionalComponentArgsRest(__VLS_1112));
const { default: __VLS_1116 } = __VLS_1114.slots;
let __VLS_1117;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_1118 = __VLS_asFunctionalComponent1(__VLS_1117, new __VLS_1117({
    modelValue: (__VLS_ctx.read.nightBrightness),
    min: (0),
    max: (100),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_1119 = __VLS_1118({
    modelValue: (__VLS_ctx.read.nightBrightness),
    min: (0),
    max: (100),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1118));
// @ts-ignore
[read,];
var __VLS_1114;
let __VLS_1122;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1123 = __VLS_asFunctionalComponent1(__VLS_1122, new __VLS_1122({
    label: "显示亮度调节",
}));
const __VLS_1124 = __VLS_1123({
    label: "显示亮度调节",
}, ...__VLS_functionalComponentArgsRest(__VLS_1123));
const { default: __VLS_1127 } = __VLS_1125.slots;
let __VLS_1128;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1129 = __VLS_asFunctionalComponent1(__VLS_1128, new __VLS_1128({
    modelValue: (__VLS_ctx.read.showBrightnessView),
}));
const __VLS_1130 = __VLS_1129({
    modelValue: (__VLS_ctx.read.showBrightnessView),
}, ...__VLS_functionalComponentArgsRest(__VLS_1129));
// @ts-ignore
[read,];
var __VLS_1125;
let __VLS_1133;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1134 = __VLS_asFunctionalComponent1(__VLS_1133, new __VLS_1133({
    label: "亮度调节位置在底部",
}));
const __VLS_1135 = __VLS_1134({
    label: "亮度调节位置在底部",
}, ...__VLS_functionalComponentArgsRest(__VLS_1134));
const { default: __VLS_1138 } = __VLS_1136.slots;
let __VLS_1139;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1140 = __VLS_asFunctionalComponent1(__VLS_1139, new __VLS_1139({
    modelValue: (__VLS_ctx.read.brightnessVwPos),
}));
const __VLS_1141 = __VLS_1140({
    modelValue: (__VLS_ctx.read.brightnessVwPos),
}, ...__VLS_functionalComponentArgsRest(__VLS_1140));
// @ts-ignore
[read,];
var __VLS_1136;
let __VLS_1144;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1145 = __VLS_asFunctionalComponent1(__VLS_1144, new __VLS_1144({
    contentPosition: "left",
}));
const __VLS_1146 = __VLS_1145({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1145));
const { default: __VLS_1149 } = __VLS_1147.slots;
// @ts-ignore
[];
var __VLS_1147;
let __VLS_1150;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1151 = __VLS_asFunctionalComponent1(__VLS_1150, new __VLS_1150({
    label: "双页水平翻页模式",
}));
const __VLS_1152 = __VLS_1151({
    label: "双页水平翻页模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_1151));
const { default: __VLS_1155 } = __VLS_1153.slots;
let __VLS_1156;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_1157 = __VLS_asFunctionalComponent1(__VLS_1156, new __VLS_1156({
    modelValue: (__VLS_ctx.read.doubleHorizontalPage),
}));
const __VLS_1158 = __VLS_1157({
    modelValue: (__VLS_ctx.read.doubleHorizontalPage),
}, ...__VLS_functionalComponentArgsRest(__VLS_1157));
const { default: __VLS_1161 } = __VLS_1159.slots;
let __VLS_1162;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1163 = __VLS_asFunctionalComponent1(__VLS_1162, new __VLS_1162({
    value: "",
    label: "关闭",
}));
const __VLS_1164 = __VLS_1163({
    value: "",
    label: "关闭",
}, ...__VLS_functionalComponentArgsRest(__VLS_1163));
let __VLS_1167;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1168 = __VLS_asFunctionalComponent1(__VLS_1167, new __VLS_1167({
    value: "auto",
    label: "自动",
}));
const __VLS_1169 = __VLS_1168({
    value: "auto",
    label: "自动",
}, ...__VLS_functionalComponentArgsRest(__VLS_1168));
let __VLS_1172;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1173 = __VLS_asFunctionalComponent1(__VLS_1172, new __VLS_1172({
    value: "always",
    label: "始终",
}));
const __VLS_1174 = __VLS_1173({
    value: "always",
    label: "始终",
}, ...__VLS_functionalComponentArgsRest(__VLS_1173));
// @ts-ignore
[read,];
var __VLS_1159;
// @ts-ignore
[];
var __VLS_1153;
let __VLS_1177;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1178 = __VLS_asFunctionalComponent1(__VLS_1177, new __VLS_1177({
    label: "进度条行为",
}));
const __VLS_1179 = __VLS_1178({
    label: "进度条行为",
}, ...__VLS_functionalComponentArgsRest(__VLS_1178));
const { default: __VLS_1182 } = __VLS_1180.slots;
let __VLS_1183;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_1184 = __VLS_asFunctionalComponent1(__VLS_1183, new __VLS_1183({
    modelValue: (__VLS_ctx.read.progressBarBehavior),
}));
const __VLS_1185 = __VLS_1184({
    modelValue: (__VLS_ctx.read.progressBarBehavior),
}, ...__VLS_functionalComponentArgsRest(__VLS_1184));
const { default: __VLS_1188 } = __VLS_1186.slots;
let __VLS_1189;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1190 = __VLS_asFunctionalComponent1(__VLS_1189, new __VLS_1189({
    value: "page",
    label: "按页",
}));
const __VLS_1191 = __VLS_1190({
    value: "page",
    label: "按页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1190));
let __VLS_1194;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1195 = __VLS_asFunctionalComponent1(__VLS_1194, new __VLS_1194({
    value: "chapter",
    label: "按章",
}));
const __VLS_1196 = __VLS_1195({
    value: "chapter",
    label: "按章",
}, ...__VLS_functionalComponentArgsRest(__VLS_1195));
// @ts-ignore
[read,];
var __VLS_1186;
// @ts-ignore
[];
var __VLS_1180;
let __VLS_1199;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1200 = __VLS_asFunctionalComponent1(__VLS_1199, new __VLS_1199({
    label: "音量键翻页",
}));
const __VLS_1201 = __VLS_1200({
    label: "音量键翻页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1200));
const { default: __VLS_1204 } = __VLS_1202.slots;
let __VLS_1205;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1206 = __VLS_asFunctionalComponent1(__VLS_1205, new __VLS_1205({
    modelValue: (__VLS_ctx.read.volumeKeyPage),
}));
const __VLS_1207 = __VLS_1206({
    modelValue: (__VLS_ctx.read.volumeKeyPage),
}, ...__VLS_functionalComponentArgsRest(__VLS_1206));
// @ts-ignore
[read,];
var __VLS_1202;
let __VLS_1210;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1211 = __VLS_asFunctionalComponent1(__VLS_1210, new __VLS_1210({
    label: "播放时音量键翻页",
}));
const __VLS_1212 = __VLS_1211({
    label: "播放时音量键翻页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1211));
const { default: __VLS_1215 } = __VLS_1213.slots;
let __VLS_1216;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1217 = __VLS_asFunctionalComponent1(__VLS_1216, new __VLS_1216({
    modelValue: (__VLS_ctx.read.volumeKeyPageOnPlay),
}));
const __VLS_1218 = __VLS_1217({
    modelValue: (__VLS_ctx.read.volumeKeyPageOnPlay),
}, ...__VLS_functionalComponentArgsRest(__VLS_1217));
// @ts-ignore
[read,];
var __VLS_1213;
let __VLS_1221;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1222 = __VLS_asFunctionalComponent1(__VLS_1221, new __VLS_1221({
    label: "鼠标滚轮翻页",
}));
const __VLS_1223 = __VLS_1222({
    label: "鼠标滚轮翻页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1222));
const { default: __VLS_1226 } = __VLS_1224.slots;
let __VLS_1227;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1228 = __VLS_asFunctionalComponent1(__VLS_1227, new __VLS_1227({
    modelValue: (__VLS_ctx.read.mouseWheelPage),
}));
const __VLS_1229 = __VLS_1228({
    modelValue: (__VLS_ctx.read.mouseWheelPage),
}, ...__VLS_functionalComponentArgsRest(__VLS_1228));
// @ts-ignore
[read,];
var __VLS_1224;
let __VLS_1232;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1233 = __VLS_asFunctionalComponent1(__VLS_1232, new __VLS_1232({
    label: "长按按键翻页",
}));
const __VLS_1234 = __VLS_1233({
    label: "长按按键翻页",
}, ...__VLS_functionalComponentArgsRest(__VLS_1233));
const { default: __VLS_1237 } = __VLS_1235.slots;
let __VLS_1238;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1239 = __VLS_asFunctionalComponent1(__VLS_1238, new __VLS_1238({
    modelValue: (__VLS_ctx.read.keyPageOnLongPress),
}));
const __VLS_1240 = __VLS_1239({
    modelValue: (__VLS_ctx.read.keyPageOnLongPress),
}, ...__VLS_functionalComponentArgsRest(__VLS_1239));
// @ts-ignore
[read,];
var __VLS_1235;
let __VLS_1243;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1244 = __VLS_asFunctionalComponent1(__VLS_1243, new __VLS_1243({
    label: "上一页按键码",
}));
const __VLS_1245 = __VLS_1244({
    label: "上一页按键码",
}, ...__VLS_functionalComponentArgsRest(__VLS_1244));
const { default: __VLS_1248 } = __VLS_1246.slots;
let __VLS_1249;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1250 = __VLS_asFunctionalComponent1(__VLS_1249, new __VLS_1249({
    modelValue: (__VLS_ctx.read.prevKeyCodes),
    placeholder: "逗号分隔的键名,如 ArrowLeft,a",
}));
const __VLS_1251 = __VLS_1250({
    modelValue: (__VLS_ctx.read.prevKeyCodes),
    placeholder: "逗号分隔的键名,如 ArrowLeft,a",
}, ...__VLS_functionalComponentArgsRest(__VLS_1250));
// @ts-ignore
[read,];
var __VLS_1246;
let __VLS_1254;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1255 = __VLS_asFunctionalComponent1(__VLS_1254, new __VLS_1254({
    label: "下一页按键码",
}));
const __VLS_1256 = __VLS_1255({
    label: "下一页按键码",
}, ...__VLS_functionalComponentArgsRest(__VLS_1255));
const { default: __VLS_1259 } = __VLS_1257.slots;
let __VLS_1260;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1261 = __VLS_asFunctionalComponent1(__VLS_1260, new __VLS_1260({
    modelValue: (__VLS_ctx.read.nextKeyCodes),
    placeholder: "逗号分隔的键名,如 ArrowRight,d",
}));
const __VLS_1262 = __VLS_1261({
    modelValue: (__VLS_ctx.read.nextKeyCodes),
    placeholder: "逗号分隔的键名,如 ArrowRight,d",
}, ...__VLS_functionalComponentArgsRest(__VLS_1261));
// @ts-ignore
[read,];
var __VLS_1257;
let __VLS_1265;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1266 = __VLS_asFunctionalComponent1(__VLS_1265, new __VLS_1265({
    label: "翻页触控灵敏度",
}));
const __VLS_1267 = __VLS_1266({
    label: "翻页触控灵敏度",
}, ...__VLS_functionalComponentArgsRest(__VLS_1266));
const { default: __VLS_1270 } = __VLS_1268.slots;
let __VLS_1271;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_1272 = __VLS_asFunctionalComponent1(__VLS_1271, new __VLS_1271({
    modelValue: (__VLS_ctx.read.pageTouchSlop),
    min: (0),
    max: (100),
}));
const __VLS_1273 = __VLS_1272({
    modelValue: (__VLS_ctx.read.pageTouchSlop),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_1272));
// @ts-ignore
[read,];
var __VLS_1268;
let __VLS_1276;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1277 = __VLS_asFunctionalComponent1(__VLS_1276, new __VLS_1276({
    label: "点击触控灵敏度",
}));
const __VLS_1278 = __VLS_1277({
    label: "点击触控灵敏度",
}, ...__VLS_functionalComponentArgsRest(__VLS_1277));
const { default: __VLS_1281 } = __VLS_1279.slots;
let __VLS_1282;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_1283 = __VLS_asFunctionalComponent1(__VLS_1282, new __VLS_1282({
    modelValue: (__VLS_ctx.read.pageTouchClick),
    min: (0),
    max: (100),
}));
const __VLS_1284 = __VLS_1283({
    modelValue: (__VLS_ctx.read.pageTouchClick),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_1283));
// @ts-ignore
[read,];
var __VLS_1279;
let __VLS_1287;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1288 = __VLS_asFunctionalComponent1(__VLS_1287, new __VLS_1287({
    contentPosition: "left",
}));
const __VLS_1289 = __VLS_1288({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1288));
const { default: __VLS_1292 } = __VLS_1290.slots;
// @ts-ignore
[];
var __VLS_1290;
let __VLS_1293;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1294 = __VLS_asFunctionalComponent1(__VLS_1293, new __VLS_1293({
    label: "隐藏状态栏",
}));
const __VLS_1295 = __VLS_1294({
    label: "隐藏状态栏",
}, ...__VLS_functionalComponentArgsRest(__VLS_1294));
const { default: __VLS_1298 } = __VLS_1296.slots;
let __VLS_1299;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1300 = __VLS_asFunctionalComponent1(__VLS_1299, new __VLS_1299({
    modelValue: (__VLS_ctx.read.hideStatusBar),
}));
const __VLS_1301 = __VLS_1300({
    modelValue: (__VLS_ctx.read.hideStatusBar),
}, ...__VLS_functionalComponentArgsRest(__VLS_1300));
// @ts-ignore
[read,];
var __VLS_1296;
let __VLS_1304;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1305 = __VLS_asFunctionalComponent1(__VLS_1304, new __VLS_1304({
    label: "隐藏导航栏",
}));
const __VLS_1306 = __VLS_1305({
    label: "隐藏导航栏",
}, ...__VLS_functionalComponentArgsRest(__VLS_1305));
const { default: __VLS_1309 } = __VLS_1307.slots;
let __VLS_1310;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1311 = __VLS_asFunctionalComponent1(__VLS_1310, new __VLS_1310({
    modelValue: (__VLS_ctx.read.hideNavigationBar),
}));
const __VLS_1312 = __VLS_1311({
    modelValue: (__VLS_ctx.read.hideNavigationBar),
}, ...__VLS_functionalComponentArgsRest(__VLS_1311));
// @ts-ignore
[read,];
var __VLS_1307;
let __VLS_1315;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1316 = __VLS_asFunctionalComponent1(__VLS_1315, new __VLS_1315({
    label: "透明状态栏",
}));
const __VLS_1317 = __VLS_1316({
    label: "透明状态栏",
}, ...__VLS_functionalComponentArgsRest(__VLS_1316));
const { default: __VLS_1320 } = __VLS_1318.slots;
let __VLS_1321;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1322 = __VLS_asFunctionalComponent1(__VLS_1321, new __VLS_1321({
    modelValue: (__VLS_ctx.read.transparentStatusBar),
}));
const __VLS_1323 = __VLS_1322({
    modelValue: (__VLS_ctx.read.transparentStatusBar),
}, ...__VLS_functionalComponentArgsRest(__VLS_1322));
// @ts-ignore
[read,];
var __VLS_1318;
let __VLS_1326;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1327 = __VLS_asFunctionalComponent1(__VLS_1326, new __VLS_1326({
    label: "沉浸导航栏",
}));
const __VLS_1328 = __VLS_1327({
    label: "沉浸导航栏",
}, ...__VLS_functionalComponentArgsRest(__VLS_1327));
const { default: __VLS_1331 } = __VLS_1329.slots;
let __VLS_1332;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1333 = __VLS_asFunctionalComponent1(__VLS_1332, new __VLS_1332({
    modelValue: (__VLS_ctx.read.immNavigationBar),
}));
const __VLS_1334 = __VLS_1333({
    modelValue: (__VLS_ctx.read.immNavigationBar),
}, ...__VLS_functionalComponentArgsRest(__VLS_1333));
// @ts-ignore
[read,];
var __VLS_1329;
let __VLS_1337;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1338 = __VLS_asFunctionalComponent1(__VLS_1337, new __VLS_1337({
    label: "刘海屏填充",
}));
const __VLS_1339 = __VLS_1338({
    label: "刘海屏填充",
}, ...__VLS_functionalComponentArgsRest(__VLS_1338));
const { default: __VLS_1342 } = __VLS_1340.slots;
let __VLS_1343;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1344 = __VLS_asFunctionalComponent1(__VLS_1343, new __VLS_1343({
    modelValue: (__VLS_ctx.read.paddingDisplayCutouts),
}));
const __VLS_1345 = __VLS_1344({
    modelValue: (__VLS_ctx.read.paddingDisplayCutouts),
}, ...__VLS_functionalComponentArgsRest(__VLS_1344));
// @ts-ignore
[read,];
var __VLS_1340;
let __VLS_1348;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1349 = __VLS_asFunctionalComponent1(__VLS_1348, new __VLS_1348({
    label: "点击图片方式",
}));
const __VLS_1350 = __VLS_1349({
    label: "点击图片方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_1349));
const { default: __VLS_1353 } = __VLS_1351.slots;
let __VLS_1354;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_1355 = __VLS_asFunctionalComponent1(__VLS_1354, new __VLS_1354({
    modelValue: (__VLS_ctx.read.clickImgWay),
}));
const __VLS_1356 = __VLS_1355({
    modelValue: (__VLS_ctx.read.clickImgWay),
}, ...__VLS_functionalComponentArgsRest(__VLS_1355));
const { default: __VLS_1359 } = __VLS_1357.slots;
let __VLS_1360;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1361 = __VLS_asFunctionalComponent1(__VLS_1360, new __VLS_1360({
    value: "",
    label: "无",
}));
const __VLS_1362 = __VLS_1361({
    value: "",
    label: "无",
}, ...__VLS_functionalComponentArgsRest(__VLS_1361));
let __VLS_1365;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1366 = __VLS_asFunctionalComponent1(__VLS_1365, new __VLS_1365({
    value: "full",
    label: "全屏",
}));
const __VLS_1367 = __VLS_1366({
    value: "full",
    label: "全屏",
}, ...__VLS_functionalComponentArgsRest(__VLS_1366));
let __VLS_1370;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1371 = __VLS_asFunctionalComponent1(__VLS_1370, new __VLS_1370({
    value: "separate",
    label: "独立",
}));
const __VLS_1372 = __VLS_1371({
    value: "separate",
    label: "独立",
}, ...__VLS_functionalComponentArgsRest(__VLS_1371));
// @ts-ignore
[read,];
var __VLS_1357;
// @ts-ignore
[];
var __VLS_1351;
let __VLS_1375;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1376 = __VLS_asFunctionalComponent1(__VLS_1375, new __VLS_1375({
    contentPosition: "left",
}));
const __VLS_1377 = __VLS_1376({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1376));
const { default: __VLS_1380 } = __VLS_1378.slots;
// @ts-ignore
[];
var __VLS_1378;
let __VLS_1381;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1382 = __VLS_asFunctionalComponent1(__VLS_1381, new __VLS_1381({
    label: "当前排版方案",
}));
const __VLS_1383 = __VLS_1382({
    label: "当前排版方案",
}, ...__VLS_functionalComponentArgsRest(__VLS_1382));
const { default: __VLS_1386 } = __VLS_1384.slots;
let __VLS_1387;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_1388 = __VLS_asFunctionalComponent1(__VLS_1387, new __VLS_1387({
    modelValue: (__VLS_ctx.read.readStyleSelect),
    min: (0),
    max: (10),
}));
const __VLS_1389 = __VLS_1388({
    modelValue: (__VLS_ctx.read.readStyleSelect),
    min: (0),
    max: (10),
}, ...__VLS_functionalComponentArgsRest(__VLS_1388));
let __VLS_1392;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_1393 = __VLS_asFunctionalComponent1(__VLS_1392, new __VLS_1392({
    ...{ 'onClick': {} },
    ...{ class: "ml-12" },
}));
const __VLS_1394 = __VLS_1393({
    ...{ 'onClick': {} },
    ...{ class: "ml-12" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1393));
let __VLS_1397;
const __VLS_1398 = {
    /** @type {typeof __VLS_1397.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.readStyleVisible = true;
        // @ts-ignore
        [readStyleVisible, read,];
    },
};
/** @type {__VLS_StyleScopedClasses['ml-12']} */ ;
const { default: __VLS_1399 } = __VLS_1395.slots;
// @ts-ignore
[];
var __VLS_1395;
var __VLS_1396;
// @ts-ignore
[];
var __VLS_1384;
let __VLS_1400;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1401 = __VLS_asFunctionalComponent1(__VLS_1400, new __VLS_1400({
    label: "漫画排版方案",
}));
const __VLS_1402 = __VLS_1401({
    label: "漫画排版方案",
}, ...__VLS_functionalComponentArgsRest(__VLS_1401));
const { default: __VLS_1405 } = __VLS_1403.slots;
let __VLS_1406;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_1407 = __VLS_asFunctionalComponent1(__VLS_1406, new __VLS_1406({
    modelValue: (__VLS_ctx.read.comicStyleSelect),
    min: (0),
    max: (10),
}));
const __VLS_1408 = __VLS_1407({
    modelValue: (__VLS_ctx.read.comicStyleSelect),
    min: (0),
    max: (10),
}, ...__VLS_functionalComponentArgsRest(__VLS_1407));
// @ts-ignore
[read,];
var __VLS_1403;
// @ts-ignore
[];
var __VLS_720;
// @ts-ignore
[];
var __VLS_714;
let __VLS_1411;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_1412 = __VLS_asFunctionalComponent1(__VLS_1411, new __VLS_1411({
    label: "TTS语音",
    name: "tts",
}));
const __VLS_1413 = __VLS_1412({
    label: "TTS语音",
    name: "tts",
}, ...__VLS_functionalComponentArgsRest(__VLS_1412));
const { default: __VLS_1416 } = __VLS_1414.slots;
let __VLS_1417;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_1418 = __VLS_asFunctionalComponent1(__VLS_1417, new __VLS_1417({
    labelWidth: "180px",
}));
const __VLS_1419 = __VLS_1418({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1418));
const { default: __VLS_1422 } = __VLS_1420.slots;
let __VLS_1423;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1424 = __VLS_asFunctionalComponent1(__VLS_1423, new __VLS_1423({
    contentPosition: "left",
}));
const __VLS_1425 = __VLS_1424({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1424));
const { default: __VLS_1428 } = __VLS_1426.slots;
// @ts-ignore
[];
var __VLS_1426;
let __VLS_1429;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1430 = __VLS_asFunctionalComponent1(__VLS_1429, new __VLS_1429({
    label: "TTS引擎",
}));
const __VLS_1431 = __VLS_1430({
    label: "TTS引擎",
}, ...__VLS_functionalComponentArgsRest(__VLS_1430));
const { default: __VLS_1434 } = __VLS_1432.slots;
let __VLS_1435;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1436 = __VLS_asFunctionalComponent1(__VLS_1435, new __VLS_1435({
    modelValue: (__VLS_ctx.app.appTtsEngine),
    placeholder: "系统默认",
}));
const __VLS_1437 = __VLS_1436({
    modelValue: (__VLS_ctx.app.appTtsEngine),
    placeholder: "系统默认",
}, ...__VLS_functionalComponentArgsRest(__VLS_1436));
// @ts-ignore
[app,];
var __VLS_1432;
let __VLS_1440;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1441 = __VLS_asFunctionalComponent1(__VLS_1440, new __VLS_1440({
    label: "跟随系统TTS",
}));
const __VLS_1442 = __VLS_1441({
    label: "跟随系统TTS",
}, ...__VLS_functionalComponentArgsRest(__VLS_1441));
const { default: __VLS_1445 } = __VLS_1443.slots;
let __VLS_1446;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1447 = __VLS_asFunctionalComponent1(__VLS_1446, new __VLS_1446({
    modelValue: (__VLS_ctx.app.ttsFollowSys),
}));
const __VLS_1448 = __VLS_1447({
    modelValue: (__VLS_ctx.app.ttsFollowSys),
}, ...__VLS_functionalComponentArgsRest(__VLS_1447));
// @ts-ignore
[app,];
var __VLS_1443;
let __VLS_1451;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1452 = __VLS_asFunctionalComponent1(__VLS_1451, new __VLS_1451({
    label: "语速",
}));
const __VLS_1453 = __VLS_1452({
    label: "语速",
}, ...__VLS_functionalComponentArgsRest(__VLS_1452));
const { default: __VLS_1456 } = __VLS_1454.slots;
let __VLS_1457;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_1458 = __VLS_asFunctionalComponent1(__VLS_1457, new __VLS_1457({
    modelValue: (__VLS_ctx.app.ttsSpeechRate),
    min: (1),
    max: (15),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_1459 = __VLS_1458({
    modelValue: (__VLS_ctx.app.ttsSpeechRate),
    min: (1),
    max: (15),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1458));
// @ts-ignore
[app,];
var __VLS_1454;
let __VLS_1462;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1463 = __VLS_asFunctionalComponent1(__VLS_1462, new __VLS_1462({
    label: "定时停止(分钟)",
}));
const __VLS_1464 = __VLS_1463({
    label: "定时停止(分钟)",
}, ...__VLS_functionalComponentArgsRest(__VLS_1463));
const { default: __VLS_1467 } = __VLS_1465.slots;
let __VLS_1468;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_1469 = __VLS_asFunctionalComponent1(__VLS_1468, new __VLS_1468({
    modelValue: (__VLS_ctx.app.ttsTimer),
    min: (0),
    max: (120),
}));
const __VLS_1470 = __VLS_1469({
    modelValue: (__VLS_ctx.app.ttsTimer),
    min: (0),
    max: (120),
}, ...__VLS_functionalComponentArgsRest(__VLS_1469));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "form-tip" },
});
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
// @ts-ignore
[app,];
var __VLS_1465;
let __VLS_1473;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1474 = __VLS_asFunctionalComponent1(__VLS_1473, new __VLS_1473({
    label: "按页朗读",
}));
const __VLS_1475 = __VLS_1474({
    label: "按页朗读",
}, ...__VLS_functionalComponentArgsRest(__VLS_1474));
const { default: __VLS_1478 } = __VLS_1476.slots;
let __VLS_1479;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1480 = __VLS_asFunctionalComponent1(__VLS_1479, new __VLS_1479({
    modelValue: (__VLS_ctx.app.readAloudByPage),
}));
const __VLS_1481 = __VLS_1480({
    modelValue: (__VLS_ctx.app.readAloudByPage),
}, ...__VLS_functionalComponentArgsRest(__VLS_1480));
// @ts-ignore
[app,];
var __VLS_1476;
let __VLS_1484;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1485 = __VLS_asFunctionalComponent1(__VLS_1484, new __VLS_1484({
    contentPosition: "left",
}));
const __VLS_1486 = __VLS_1485({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1485));
const { default: __VLS_1489 } = __VLS_1487.slots;
// @ts-ignore
[];
var __VLS_1487;
let __VLS_1490;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1491 = __VLS_asFunctionalComponent1(__VLS_1490, new __VLS_1490({
    label: "媒体按钮控制朗读",
}));
const __VLS_1492 = __VLS_1491({
    label: "媒体按钮控制朗读",
}, ...__VLS_functionalComponentArgsRest(__VLS_1491));
const { default: __VLS_1495 } = __VLS_1493.slots;
let __VLS_1496;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1497 = __VLS_asFunctionalComponent1(__VLS_1496, new __VLS_1496({
    modelValue: (__VLS_ctx.app.readAloudByMediaButton),
}));
const __VLS_1498 = __VLS_1497({
    modelValue: (__VLS_ctx.app.readAloudByMediaButton),
}, ...__VLS_functionalComponentArgsRest(__VLS_1497));
// @ts-ignore
[app,];
var __VLS_1493;
let __VLS_1501;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1502 = __VLS_asFunctionalComponent1(__VLS_1501, new __VLS_1501({
    label: "流式朗读音频",
}));
const __VLS_1503 = __VLS_1502({
    label: "流式朗读音频",
}, ...__VLS_functionalComponentArgsRest(__VLS_1502));
const { default: __VLS_1506 } = __VLS_1504.slots;
let __VLS_1507;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1508 = __VLS_asFunctionalComponent1(__VLS_1507, new __VLS_1507({
    modelValue: (__VLS_ctx.app.streamReadAloudAudio),
}));
const __VLS_1509 = __VLS_1508({
    modelValue: (__VLS_ctx.app.streamReadAloudAudio),
}, ...__VLS_functionalComponentArgsRest(__VLS_1508));
// @ts-ignore
[app,];
var __VLS_1504;
let __VLS_1512;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1513 = __VLS_asFunctionalComponent1(__VLS_1512, new __VLS_1512({
    label: "来电暂停朗读",
}));
const __VLS_1514 = __VLS_1513({
    label: "来电暂停朗读",
}, ...__VLS_functionalComponentArgsRest(__VLS_1513));
const { default: __VLS_1517 } = __VLS_1515.slots;
let __VLS_1518;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1519 = __VLS_asFunctionalComponent1(__VLS_1518, new __VLS_1518({
    modelValue: (__VLS_ctx.app.pauseReadAloudWhilePhoneCalls),
}));
const __VLS_1520 = __VLS_1519({
    modelValue: (__VLS_ctx.app.pauseReadAloudWhilePhoneCalls),
}, ...__VLS_functionalComponentArgsRest(__VLS_1519));
// @ts-ignore
[app,];
var __VLS_1515;
let __VLS_1523;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1524 = __VLS_asFunctionalComponent1(__VLS_1523, new __VLS_1523({
    label: "忽略音频焦点",
}));
const __VLS_1525 = __VLS_1524({
    label: "忽略音频焦点",
}, ...__VLS_functionalComponentArgsRest(__VLS_1524));
const { default: __VLS_1528 } = __VLS_1526.slots;
let __VLS_1529;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1530 = __VLS_asFunctionalComponent1(__VLS_1529, new __VLS_1529({
    modelValue: (__VLS_ctx.app.ignoreAudioFocus),
}));
const __VLS_1531 = __VLS_1530({
    modelValue: (__VLS_ctx.app.ignoreAudioFocus),
}, ...__VLS_functionalComponentArgsRest(__VLS_1530));
// @ts-ignore
[app,];
var __VLS_1526;
let __VLS_1534;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1535 = __VLS_asFunctionalComponent1(__VLS_1534, new __VLS_1534({
    label: "内容选择朗读模式",
}));
const __VLS_1536 = __VLS_1535({
    label: "内容选择朗读模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_1535));
const { default: __VLS_1539 } = __VLS_1537.slots;
let __VLS_1540;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_1541 = __VLS_asFunctionalComponent1(__VLS_1540, new __VLS_1540({
    modelValue: (__VLS_ctx.app.contentReadAloudMod),
}));
const __VLS_1542 = __VLS_1541({
    modelValue: (__VLS_ctx.app.contentReadAloudMod),
}, ...__VLS_functionalComponentArgsRest(__VLS_1541));
const { default: __VLS_1545 } = __VLS_1543.slots;
let __VLS_1546;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1547 = __VLS_asFunctionalComponent1(__VLS_1546, new __VLS_1546({
    value: (0),
    label: "全文",
}));
const __VLS_1548 = __VLS_1547({
    value: (0),
    label: "全文",
}, ...__VLS_functionalComponentArgsRest(__VLS_1547));
let __VLS_1551;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_1552 = __VLS_asFunctionalComponent1(__VLS_1551, new __VLS_1551({
    value: (1),
    label: "仅选中",
}));
const __VLS_1553 = __VLS_1552({
    value: (1),
    label: "仅选中",
}, ...__VLS_functionalComponentArgsRest(__VLS_1552));
// @ts-ignore
[app,];
var __VLS_1543;
// @ts-ignore
[];
var __VLS_1537;
let __VLS_1556;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1557 = __VLS_asFunctionalComponent1(__VLS_1556, new __VLS_1556({
    label: "音频播放唤醒锁",
}));
const __VLS_1558 = __VLS_1557({
    label: "音频播放唤醒锁",
}, ...__VLS_functionalComponentArgsRest(__VLS_1557));
const { default: __VLS_1561 } = __VLS_1559.slots;
let __VLS_1562;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1563 = __VLS_asFunctionalComponent1(__VLS_1562, new __VLS_1562({
    modelValue: (__VLS_ctx.app.audioPlayWakeLock),
}));
const __VLS_1564 = __VLS_1563({
    modelValue: (__VLS_ctx.app.audioPlayWakeLock),
}, ...__VLS_functionalComponentArgsRest(__VLS_1563));
// @ts-ignore
[app,];
var __VLS_1559;
let __VLS_1567;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1568 = __VLS_asFunctionalComponent1(__VLS_1567, new __VLS_1567({
    label: "朗读唤醒锁",
}));
const __VLS_1569 = __VLS_1568({
    label: "朗读唤醒锁",
}, ...__VLS_functionalComponentArgsRest(__VLS_1568));
const { default: __VLS_1572 } = __VLS_1570.slots;
let __VLS_1573;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1574 = __VLS_asFunctionalComponent1(__VLS_1573, new __VLS_1573({
    modelValue: (__VLS_ctx.app.readAloudWakeLock),
}));
const __VLS_1575 = __VLS_1574({
    modelValue: (__VLS_ctx.app.readAloudWakeLock),
}, ...__VLS_functionalComponentArgsRest(__VLS_1574));
// @ts-ignore
[app,];
var __VLS_1570;
// @ts-ignore
[];
var __VLS_1420;
// @ts-ignore
[];
var __VLS_1414;
let __VLS_1578;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_1579 = __VLS_asFunctionalComponent1(__VLS_1578, new __VLS_1578({
    label: "主题",
    name: "theme",
}));
const __VLS_1580 = __VLS_1579({
    label: "主题",
    name: "theme",
}, ...__VLS_functionalComponentArgsRest(__VLS_1579));
const { default: __VLS_1583 } = __VLS_1581.slots;
let __VLS_1584;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_1585 = __VLS_asFunctionalComponent1(__VLS_1584, new __VLS_1584({
    labelWidth: "180px",
}));
const __VLS_1586 = __VLS_1585({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1585));
const { default: __VLS_1589 } = __VLS_1587.slots;
let __VLS_1590;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1591 = __VLS_asFunctionalComponent1(__VLS_1590, new __VLS_1590({
    contentPosition: "left",
}));
const __VLS_1592 = __VLS_1591({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1591));
const { default: __VLS_1595 } = __VLS_1593.slots;
// @ts-ignore
[];
var __VLS_1593;
let __VLS_1596;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1597 = __VLS_asFunctionalComponent1(__VLS_1596, new __VLS_1596({
    label: "模式",
}));
const __VLS_1598 = __VLS_1597({
    label: "模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_1597));
const { default: __VLS_1601 } = __VLS_1599.slots;
let __VLS_1602;
/** @ts-ignore @type { | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components['el-radio-group'] | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components['el-radio-group']} */
elRadioGroup;
// @ts-ignore
const __VLS_1603 = __VLS_asFunctionalComponent1(__VLS_1602, new __VLS_1602({
    modelValue: (__VLS_ctx.theme.themeMode),
}));
const __VLS_1604 = __VLS_1603({
    modelValue: (__VLS_ctx.theme.themeMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_1603));
const { default: __VLS_1607 } = __VLS_1605.slots;
let __VLS_1608;
/** @ts-ignore @type { | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio'] | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio']} */
elRadio;
// @ts-ignore
const __VLS_1609 = __VLS_asFunctionalComponent1(__VLS_1608, new __VLS_1608({
    value: "0",
}));
const __VLS_1610 = __VLS_1609({
    value: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_1609));
const { default: __VLS_1613 } = __VLS_1611.slots;
// @ts-ignore
[theme,];
var __VLS_1611;
let __VLS_1614;
/** @ts-ignore @type { | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio'] | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio']} */
elRadio;
// @ts-ignore
const __VLS_1615 = __VLS_asFunctionalComponent1(__VLS_1614, new __VLS_1614({
    value: "1",
}));
const __VLS_1616 = __VLS_1615({
    value: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_1615));
const { default: __VLS_1619 } = __VLS_1617.slots;
// @ts-ignore
[];
var __VLS_1617;
let __VLS_1620;
/** @ts-ignore @type { | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio'] | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio']} */
elRadio;
// @ts-ignore
const __VLS_1621 = __VLS_asFunctionalComponent1(__VLS_1620, new __VLS_1620({
    value: "2",
}));
const __VLS_1622 = __VLS_1621({
    value: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_1621));
const { default: __VLS_1625 } = __VLS_1623.slots;
// @ts-ignore
[];
var __VLS_1623;
let __VLS_1626;
/** @ts-ignore @type { | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio'] | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components['el-radio']} */
elRadio;
// @ts-ignore
const __VLS_1627 = __VLS_asFunctionalComponent1(__VLS_1626, new __VLS_1626({
    value: "3",
}));
const __VLS_1628 = __VLS_1627({
    value: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_1627));
const { default: __VLS_1631 } = __VLS_1629.slots;
// @ts-ignore
[];
var __VLS_1629;
// @ts-ignore
[];
var __VLS_1605;
// @ts-ignore
[];
var __VLS_1599;
let __VLS_1632;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1633 = __VLS_asFunctionalComponent1(__VLS_1632, new __VLS_1632({
    label: "日间主题序号",
}));
const __VLS_1634 = __VLS_1633({
    label: "日间主题序号",
}, ...__VLS_functionalComponentArgsRest(__VLS_1633));
const { default: __VLS_1637 } = __VLS_1635.slots;
let __VLS_1638;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_1639 = __VLS_asFunctionalComponent1(__VLS_1638, new __VLS_1638({
    modelValue: (__VLS_ctx.theme.editTheme),
    min: (0),
    max: (20),
}));
const __VLS_1640 = __VLS_1639({
    modelValue: (__VLS_ctx.theme.editTheme),
    min: (0),
    max: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_1639));
// @ts-ignore
[theme,];
var __VLS_1635;
let __VLS_1643;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1644 = __VLS_asFunctionalComponent1(__VLS_1643, new __VLS_1643({
    label: "夜间主题序号",
}));
const __VLS_1645 = __VLS_1644({
    label: "夜间主题序号",
}, ...__VLS_functionalComponentArgsRest(__VLS_1644));
const { default: __VLS_1648 } = __VLS_1646.slots;
let __VLS_1649;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_1650 = __VLS_asFunctionalComponent1(__VLS_1649, new __VLS_1649({
    modelValue: (__VLS_ctx.theme.editThemeDark),
    min: (0),
    max: (20),
}));
const __VLS_1651 = __VLS_1650({
    modelValue: (__VLS_ctx.theme.editThemeDark),
    min: (0),
    max: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_1650));
// @ts-ignore
[theme,];
var __VLS_1646;
let __VLS_1654;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1655 = __VLS_asFunctionalComponent1(__VLS_1654, new __VLS_1654({
    label: "自动切换主题",
}));
const __VLS_1656 = __VLS_1655({
    label: "自动切换主题",
}, ...__VLS_functionalComponentArgsRest(__VLS_1655));
const { default: __VLS_1659 } = __VLS_1657.slots;
let __VLS_1660;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1661 = __VLS_asFunctionalComponent1(__VLS_1660, new __VLS_1660({
    modelValue: (__VLS_ctx.theme.editTemeAuto),
}));
const __VLS_1662 = __VLS_1661({
    modelValue: (__VLS_ctx.theme.editTemeAuto),
}, ...__VLS_functionalComponentArgsRest(__VLS_1661));
// @ts-ignore
[theme,];
var __VLS_1657;
let __VLS_1665;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1666 = __VLS_asFunctionalComponent1(__VLS_1665, new __VLS_1665({
    contentPosition: "left",
}));
const __VLS_1667 = __VLS_1666({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1666));
const { default: __VLS_1670 } = __VLS_1668.slots;
// @ts-ignore
[];
var __VLS_1668;
let __VLS_1671;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1672 = __VLS_asFunctionalComponent1(__VLS_1671, new __VLS_1671({
    label: "抗锯齿",
}));
const __VLS_1673 = __VLS_1672({
    label: "抗锯齿",
}, ...__VLS_functionalComponentArgsRest(__VLS_1672));
const { default: __VLS_1676 } = __VLS_1674.slots;
let __VLS_1677;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1678 = __VLS_asFunctionalComponent1(__VLS_1677, new __VLS_1677({
    modelValue: (__VLS_ctx.theme.antiAlias),
}));
const __VLS_1679 = __VLS_1678({
    modelValue: (__VLS_ctx.theme.antiAlias),
}, ...__VLS_functionalComponentArgsRest(__VLS_1678));
// @ts-ignore
[theme,];
var __VLS_1674;
let __VLS_1682;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1683 = __VLS_asFunctionalComponent1(__VLS_1682, new __VLS_1682({
    label: "优化渲染",
}));
const __VLS_1684 = __VLS_1683({
    label: "优化渲染",
}, ...__VLS_functionalComponentArgsRest(__VLS_1683));
const { default: __VLS_1687 } = __VLS_1685.slots;
let __VLS_1688;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1689 = __VLS_asFunctionalComponent1(__VLS_1688, new __VLS_1688({
    modelValue: (__VLS_ctx.theme.optimizeRender),
}));
const __VLS_1690 = __VLS_1689({
    modelValue: (__VLS_ctx.theme.optimizeRender),
}, ...__VLS_functionalComponentArgsRest(__VLS_1689));
// @ts-ignore
[theme,];
var __VLS_1685;
let __VLS_1693;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1694 = __VLS_asFunctionalComponent1(__VLS_1693, new __VLS_1693({
    label: "记录日志",
}));
const __VLS_1695 = __VLS_1694({
    label: "记录日志",
}, ...__VLS_functionalComponentArgsRest(__VLS_1694));
const { default: __VLS_1698 } = __VLS_1696.slots;
let __VLS_1699;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1700 = __VLS_asFunctionalComponent1(__VLS_1699, new __VLS_1699({
    modelValue: (__VLS_ctx.theme.recordLog),
}));
const __VLS_1701 = __VLS_1700({
    modelValue: (__VLS_ctx.theme.recordLog),
}, ...__VLS_functionalComponentArgsRest(__VLS_1700));
// @ts-ignore
[theme,];
var __VLS_1696;
let __VLS_1704;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1705 = __VLS_asFunctionalComponent1(__VLS_1704, new __VLS_1704({
    label: "工具栏阴影",
}));
const __VLS_1706 = __VLS_1705({
    label: "工具栏阴影",
}, ...__VLS_functionalComponentArgsRest(__VLS_1705));
const { default: __VLS_1709 } = __VLS_1707.slots;
let __VLS_1710;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_1711 = __VLS_asFunctionalComponent1(__VLS_1710, new __VLS_1710({
    modelValue: (__VLS_ctx.theme.barElevation),
    min: (0),
    max: (30),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_1712 = __VLS_1711({
    modelValue: (__VLS_ctx.theme.barElevation),
    min: (0),
    max: (30),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1711));
// @ts-ignore
[theme,];
var __VLS_1707;
let __VLS_1715;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1716 = __VLS_asFunctionalComponent1(__VLS_1715, new __VLS_1715({
    contentPosition: "left",
}));
const __VLS_1717 = __VLS_1716({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1716));
const { default: __VLS_1720 } = __VLS_1718.slots;
// @ts-ignore
[];
var __VLS_1718;
let __VLS_1721;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1722 = __VLS_asFunctionalComponent1(__VLS_1721, new __VLS_1721({
    label: "显示标题附加信息",
}));
const __VLS_1723 = __VLS_1722({
    label: "显示标题附加信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_1722));
const { default: __VLS_1726 } = __VLS_1724.slots;
let __VLS_1727;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1728 = __VLS_asFunctionalComponent1(__VLS_1727, new __VLS_1727({
    modelValue: (__VLS_ctx.theme.showReadTitleAddition),
}));
const __VLS_1729 = __VLS_1728({
    modelValue: (__VLS_ctx.theme.showReadTitleAddition),
}, ...__VLS_functionalComponentArgsRest(__VLS_1728));
// @ts-ignore
[theme,];
var __VLS_1724;
let __VLS_1732;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1733 = __VLS_asFunctionalComponent1(__VLS_1732, new __VLS_1732({
    label: "阅读栏跟随页面样式",
}));
const __VLS_1734 = __VLS_1733({
    label: "阅读栏跟随页面样式",
}, ...__VLS_functionalComponentArgsRest(__VLS_1733));
const { default: __VLS_1737 } = __VLS_1735.slots;
let __VLS_1738;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1739 = __VLS_asFunctionalComponent1(__VLS_1738, new __VLS_1738({
    modelValue: (__VLS_ctx.theme.readBarStyleFollowPage),
}));
const __VLS_1740 = __VLS_1739({
    modelValue: (__VLS_ctx.theme.readBarStyleFollowPage),
}, ...__VLS_functionalComponentArgsRest(__VLS_1739));
// @ts-ignore
[theme,];
var __VLS_1735;
let __VLS_1743;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1744 = __VLS_asFunctionalComponent1(__VLS_1743, new __VLS_1743({
    contentPosition: "left",
}));
const __VLS_1745 = __VLS_1744({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1744));
const { default: __VLS_1748 } = __VLS_1746.slots;
// @ts-ignore
[];
var __VLS_1746;
let __VLS_1749;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1750 = __VLS_asFunctionalComponent1(__VLS_1749, new __VLS_1749({
    label: "当前主题名",
}));
const __VLS_1751 = __VLS_1750({
    label: "当前主题名",
}, ...__VLS_functionalComponentArgsRest(__VLS_1750));
const { default: __VLS_1754 } = __VLS_1752.slots;
let __VLS_1755;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1756 = __VLS_asFunctionalComponent1(__VLS_1755, new __VLS_1755({
    modelValue: (__VLS_ctx.theme.durThemeName),
    placeholder: "默认",
}));
const __VLS_1757 = __VLS_1756({
    modelValue: (__VLS_ctx.theme.durThemeName),
    placeholder: "默认",
}, ...__VLS_functionalComponentArgsRest(__VLS_1756));
// @ts-ignore
[theme,];
var __VLS_1752;
let __VLS_1760;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1761 = __VLS_asFunctionalComponent1(__VLS_1760, new __VLS_1760({
    label: "主色",
}));
const __VLS_1762 = __VLS_1761({
    label: "主色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1761));
const { default: __VLS_1765 } = __VLS_1763.slots;
let __VLS_1766;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1767 = __VLS_asFunctionalComponent1(__VLS_1766, new __VLS_1766({
    modelValue: (__VLS_ctx.theme.colorPrimary),
    showAlpha: true,
}));
const __VLS_1768 = __VLS_1767({
    modelValue: (__VLS_ctx.theme.colorPrimary),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1767));
// @ts-ignore
[theme,];
var __VLS_1763;
let __VLS_1771;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1772 = __VLS_asFunctionalComponent1(__VLS_1771, new __VLS_1771({
    label: "强调色",
}));
const __VLS_1773 = __VLS_1772({
    label: "强调色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1772));
const { default: __VLS_1776 } = __VLS_1774.slots;
let __VLS_1777;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1778 = __VLS_asFunctionalComponent1(__VLS_1777, new __VLS_1777({
    modelValue: (__VLS_ctx.theme.colorAccent),
    showAlpha: true,
}));
const __VLS_1779 = __VLS_1778({
    modelValue: (__VLS_ctx.theme.colorAccent),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1778));
// @ts-ignore
[theme,];
var __VLS_1774;
let __VLS_1782;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1783 = __VLS_asFunctionalComponent1(__VLS_1782, new __VLS_1782({
    label: "背景色",
}));
const __VLS_1784 = __VLS_1783({
    label: "背景色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1783));
const { default: __VLS_1787 } = __VLS_1785.slots;
let __VLS_1788;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1789 = __VLS_asFunctionalComponent1(__VLS_1788, new __VLS_1788({
    modelValue: (__VLS_ctx.theme.colorBackground),
    showAlpha: true,
}));
const __VLS_1790 = __VLS_1789({
    modelValue: (__VLS_ctx.theme.colorBackground),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1789));
// @ts-ignore
[theme,];
var __VLS_1785;
let __VLS_1793;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1794 = __VLS_asFunctionalComponent1(__VLS_1793, new __VLS_1793({
    label: "底部背景色",
}));
const __VLS_1795 = __VLS_1794({
    label: "底部背景色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1794));
const { default: __VLS_1798 } = __VLS_1796.slots;
let __VLS_1799;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1800 = __VLS_asFunctionalComponent1(__VLS_1799, new __VLS_1799({
    modelValue: (__VLS_ctx.theme.colorBottomBackground),
    showAlpha: true,
}));
const __VLS_1801 = __VLS_1800({
    modelValue: (__VLS_ctx.theme.colorBottomBackground),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1800));
// @ts-ignore
[theme,];
var __VLS_1796;
let __VLS_1804;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1805 = __VLS_asFunctionalComponent1(__VLS_1804, new __VLS_1804({
    label: "背景图片",
}));
const __VLS_1806 = __VLS_1805({
    label: "背景图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_1805));
const { default: __VLS_1809 } = __VLS_1807.slots;
let __VLS_1810;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1811 = __VLS_asFunctionalComponent1(__VLS_1810, new __VLS_1810({
    modelValue: (__VLS_ctx.theme.backgroundImage),
    placeholder: "图片路径",
}));
const __VLS_1812 = __VLS_1811({
    modelValue: (__VLS_ctx.theme.backgroundImage),
    placeholder: "图片路径",
}, ...__VLS_functionalComponentArgsRest(__VLS_1811));
// @ts-ignore
[theme,];
var __VLS_1807;
let __VLS_1815;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1816 = __VLS_asFunctionalComponent1(__VLS_1815, new __VLS_1815({
    label: "背景图片模糊",
}));
const __VLS_1817 = __VLS_1816({
    label: "背景图片模糊",
}, ...__VLS_functionalComponentArgsRest(__VLS_1816));
const { default: __VLS_1820 } = __VLS_1818.slots;
let __VLS_1821;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_1822 = __VLS_asFunctionalComponent1(__VLS_1821, new __VLS_1821({
    modelValue: (__VLS_ctx.theme.backgroundImageBlurring),
    min: (0),
    max: (30),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_1823 = __VLS_1822({
    modelValue: (__VLS_ctx.theme.backgroundImageBlurring),
    min: (0),
    max: (30),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1822));
// @ts-ignore
[theme,];
var __VLS_1818;
let __VLS_1826;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1827 = __VLS_asFunctionalComponent1(__VLS_1826, new __VLS_1826({
    label: "透明导航栏",
}));
const __VLS_1828 = __VLS_1827({
    label: "透明导航栏",
}, ...__VLS_functionalComponentArgsRest(__VLS_1827));
const { default: __VLS_1831 } = __VLS_1829.slots;
let __VLS_1832;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1833 = __VLS_asFunctionalComponent1(__VLS_1832, new __VLS_1832({
    modelValue: (__VLS_ctx.theme.transparentNavBar),
}));
const __VLS_1834 = __VLS_1833({
    modelValue: (__VLS_ctx.theme.transparentNavBar),
}, ...__VLS_functionalComponentArgsRest(__VLS_1833));
// @ts-ignore
[theme,];
var __VLS_1829;
let __VLS_1837;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1838 = __VLS_asFunctionalComponent1(__VLS_1837, new __VLS_1837({
    label: "默认封面",
}));
const __VLS_1839 = __VLS_1838({
    label: "默认封面",
}, ...__VLS_functionalComponentArgsRest(__VLS_1838));
const { default: __VLS_1842 } = __VLS_1840.slots;
let __VLS_1843;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1844 = __VLS_asFunctionalComponent1(__VLS_1843, new __VLS_1843({
    modelValue: (__VLS_ctx.theme.defaultCover),
    placeholder: "封面图片路径",
}));
const __VLS_1845 = __VLS_1844({
    modelValue: (__VLS_ctx.theme.defaultCover),
    placeholder: "封面图片路径",
}, ...__VLS_functionalComponentArgsRest(__VLS_1844));
// @ts-ignore
[theme,];
var __VLS_1840;
let __VLS_1848;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1849 = __VLS_asFunctionalComponent1(__VLS_1848, new __VLS_1848({
    contentPosition: "left",
}));
const __VLS_1850 = __VLS_1849({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1849));
const { default: __VLS_1853 } = __VLS_1851.slots;
// @ts-ignore
[];
var __VLS_1851;
let __VLS_1854;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1855 = __VLS_asFunctionalComponent1(__VLS_1854, new __VLS_1854({
    label: "当前夜间主题名",
}));
const __VLS_1856 = __VLS_1855({
    label: "当前夜间主题名",
}, ...__VLS_functionalComponentArgsRest(__VLS_1855));
const { default: __VLS_1859 } = __VLS_1857.slots;
let __VLS_1860;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1861 = __VLS_asFunctionalComponent1(__VLS_1860, new __VLS_1860({
    modelValue: (__VLS_ctx.theme.durThemeNameNight),
    placeholder: "默认",
}));
const __VLS_1862 = __VLS_1861({
    modelValue: (__VLS_ctx.theme.durThemeNameNight),
    placeholder: "默认",
}, ...__VLS_functionalComponentArgsRest(__VLS_1861));
// @ts-ignore
[theme,];
var __VLS_1857;
let __VLS_1865;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1866 = __VLS_asFunctionalComponent1(__VLS_1865, new __VLS_1865({
    label: "夜间主色",
}));
const __VLS_1867 = __VLS_1866({
    label: "夜间主色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1866));
const { default: __VLS_1870 } = __VLS_1868.slots;
let __VLS_1871;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1872 = __VLS_asFunctionalComponent1(__VLS_1871, new __VLS_1871({
    modelValue: (__VLS_ctx.theme.colorPrimaryNight),
    showAlpha: true,
}));
const __VLS_1873 = __VLS_1872({
    modelValue: (__VLS_ctx.theme.colorPrimaryNight),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1872));
// @ts-ignore
[theme,];
var __VLS_1868;
let __VLS_1876;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1877 = __VLS_asFunctionalComponent1(__VLS_1876, new __VLS_1876({
    label: "夜间强调色",
}));
const __VLS_1878 = __VLS_1877({
    label: "夜间强调色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1877));
const { default: __VLS_1881 } = __VLS_1879.slots;
let __VLS_1882;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1883 = __VLS_asFunctionalComponent1(__VLS_1882, new __VLS_1882({
    modelValue: (__VLS_ctx.theme.colorAccentNight),
    showAlpha: true,
}));
const __VLS_1884 = __VLS_1883({
    modelValue: (__VLS_ctx.theme.colorAccentNight),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1883));
// @ts-ignore
[theme,];
var __VLS_1879;
let __VLS_1887;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1888 = __VLS_asFunctionalComponent1(__VLS_1887, new __VLS_1887({
    label: "夜间背景色",
}));
const __VLS_1889 = __VLS_1888({
    label: "夜间背景色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1888));
const { default: __VLS_1892 } = __VLS_1890.slots;
let __VLS_1893;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1894 = __VLS_asFunctionalComponent1(__VLS_1893, new __VLS_1893({
    modelValue: (__VLS_ctx.theme.colorBackgroundNight),
    showAlpha: true,
}));
const __VLS_1895 = __VLS_1894({
    modelValue: (__VLS_ctx.theme.colorBackgroundNight),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1894));
// @ts-ignore
[theme,];
var __VLS_1890;
let __VLS_1898;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1899 = __VLS_asFunctionalComponent1(__VLS_1898, new __VLS_1898({
    label: "夜间底部背景色",
}));
const __VLS_1900 = __VLS_1899({
    label: "夜间底部背景色",
}, ...__VLS_functionalComponentArgsRest(__VLS_1899));
const { default: __VLS_1903 } = __VLS_1901.slots;
let __VLS_1904;
/** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
elColorPicker;
// @ts-ignore
const __VLS_1905 = __VLS_asFunctionalComponent1(__VLS_1904, new __VLS_1904({
    modelValue: (__VLS_ctx.theme.colorBottomBackgroundNight),
    showAlpha: true,
}));
const __VLS_1906 = __VLS_1905({
    modelValue: (__VLS_ctx.theme.colorBottomBackgroundNight),
    showAlpha: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1905));
// @ts-ignore
[theme,];
var __VLS_1901;
let __VLS_1909;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1910 = __VLS_asFunctionalComponent1(__VLS_1909, new __VLS_1909({
    label: "夜间背景图片",
}));
const __VLS_1911 = __VLS_1910({
    label: "夜间背景图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_1910));
const { default: __VLS_1914 } = __VLS_1912.slots;
let __VLS_1915;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1916 = __VLS_asFunctionalComponent1(__VLS_1915, new __VLS_1915({
    modelValue: (__VLS_ctx.theme.backgroundImageNight),
    placeholder: "图片路径",
}));
const __VLS_1917 = __VLS_1916({
    modelValue: (__VLS_ctx.theme.backgroundImageNight),
    placeholder: "图片路径",
}, ...__VLS_functionalComponentArgsRest(__VLS_1916));
// @ts-ignore
[theme,];
var __VLS_1912;
let __VLS_1920;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1921 = __VLS_asFunctionalComponent1(__VLS_1920, new __VLS_1920({
    label: "夜间背景图片模糊",
}));
const __VLS_1922 = __VLS_1921({
    label: "夜间背景图片模糊",
}, ...__VLS_functionalComponentArgsRest(__VLS_1921));
const { default: __VLS_1925 } = __VLS_1923.slots;
let __VLS_1926;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_1927 = __VLS_asFunctionalComponent1(__VLS_1926, new __VLS_1926({
    modelValue: (__VLS_ctx.theme.backgroundImageNightBlurring),
    min: (0),
    max: (30),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_1928 = __VLS_1927({
    modelValue: (__VLS_ctx.theme.backgroundImageNightBlurring),
    min: (0),
    max: (30),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1927));
// @ts-ignore
[theme,];
var __VLS_1923;
let __VLS_1931;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1932 = __VLS_asFunctionalComponent1(__VLS_1931, new __VLS_1931({
    label: "夜间透明导航栏",
}));
const __VLS_1933 = __VLS_1932({
    label: "夜间透明导航栏",
}, ...__VLS_functionalComponentArgsRest(__VLS_1932));
const { default: __VLS_1936 } = __VLS_1934.slots;
let __VLS_1937;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1938 = __VLS_asFunctionalComponent1(__VLS_1937, new __VLS_1937({
    modelValue: (__VLS_ctx.theme.transparentNavBarNight),
}));
const __VLS_1939 = __VLS_1938({
    modelValue: (__VLS_ctx.theme.transparentNavBarNight),
}, ...__VLS_functionalComponentArgsRest(__VLS_1938));
// @ts-ignore
[theme,];
var __VLS_1934;
let __VLS_1942;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1943 = __VLS_asFunctionalComponent1(__VLS_1942, new __VLS_1942({
    label: "默认夜间封面",
}));
const __VLS_1944 = __VLS_1943({
    label: "默认夜间封面",
}, ...__VLS_functionalComponentArgsRest(__VLS_1943));
const { default: __VLS_1947 } = __VLS_1945.slots;
let __VLS_1948;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1949 = __VLS_asFunctionalComponent1(__VLS_1948, new __VLS_1948({
    modelValue: (__VLS_ctx.theme.defaultCoverDark),
    placeholder: "封面图片路径",
}));
const __VLS_1950 = __VLS_1949({
    modelValue: (__VLS_ctx.theme.defaultCoverDark),
    placeholder: "封面图片路径",
}, ...__VLS_functionalComponentArgsRest(__VLS_1949));
// @ts-ignore
[theme,];
var __VLS_1945;
// @ts-ignore
[];
var __VLS_1587;
// @ts-ignore
[];
var __VLS_1581;
let __VLS_1953;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_1954 = __VLS_asFunctionalComponent1(__VLS_1953, new __VLS_1953({
    label: "漫画",
    name: "manga",
}));
const __VLS_1955 = __VLS_1954({
    label: "漫画",
    name: "manga",
}, ...__VLS_functionalComponentArgsRest(__VLS_1954));
const { default: __VLS_1958 } = __VLS_1956.slots;
let __VLS_1959;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_1960 = __VLS_asFunctionalComponent1(__VLS_1959, new __VLS_1959({
    labelWidth: "180px",
}));
const __VLS_1961 = __VLS_1960({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1960));
const { default: __VLS_1964 } = __VLS_1962.slots;
let __VLS_1965;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1966 = __VLS_asFunctionalComponent1(__VLS_1965, new __VLS_1965({
    contentPosition: "left",
}));
const __VLS_1967 = __VLS_1966({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1966));
const { default: __VLS_1970 } = __VLS_1968.slots;
// @ts-ignore
[];
var __VLS_1968;
let __VLS_1971;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1972 = __VLS_asFunctionalComponent1(__VLS_1971, new __VLS_1971({
    label: "显示漫画UI",
}));
const __VLS_1973 = __VLS_1972({
    label: "显示漫画UI",
}, ...__VLS_functionalComponentArgsRest(__VLS_1972));
const { default: __VLS_1976 } = __VLS_1974.slots;
let __VLS_1977;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1978 = __VLS_asFunctionalComponent1(__VLS_1977, new __VLS_1977({
    modelValue: (__VLS_ctx.app.showMangaUi),
}));
const __VLS_1979 = __VLS_1978({
    modelValue: (__VLS_ctx.app.showMangaUi),
}, ...__VLS_functionalComponentArgsRest(__VLS_1978));
// @ts-ignore
[app,];
var __VLS_1974;
let __VLS_1982;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1983 = __VLS_asFunctionalComponent1(__VLS_1982, new __VLS_1982({
    label: "禁用缩放",
}));
const __VLS_1984 = __VLS_1983({
    label: "禁用缩放",
}, ...__VLS_functionalComponentArgsRest(__VLS_1983));
const { default: __VLS_1987 } = __VLS_1985.slots;
let __VLS_1988;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_1989 = __VLS_asFunctionalComponent1(__VLS_1988, new __VLS_1988({
    modelValue: (__VLS_ctx.app.disableMangaScale),
}));
const __VLS_1990 = __VLS_1989({
    modelValue: (__VLS_ctx.app.disableMangaScale),
}, ...__VLS_functionalComponentArgsRest(__VLS_1989));
// @ts-ignore
[app,];
var __VLS_1985;
let __VLS_1993;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_1994 = __VLS_asFunctionalComponent1(__VLS_1993, new __VLS_1993({
    label: "禁用翻页动画",
}));
const __VLS_1995 = __VLS_1994({
    label: "禁用翻页动画",
}, ...__VLS_functionalComponentArgsRest(__VLS_1994));
const { default: __VLS_1998 } = __VLS_1996.slots;
let __VLS_1999;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2000 = __VLS_asFunctionalComponent1(__VLS_1999, new __VLS_1999({
    modelValue: (__VLS_ctx.app.disableMangaPageAnim),
}));
const __VLS_2001 = __VLS_2000({
    modelValue: (__VLS_ctx.app.disableMangaPageAnim),
}, ...__VLS_functionalComponentArgsRest(__VLS_2000));
// @ts-ignore
[app,];
var __VLS_1996;
let __VLS_2004;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2005 = __VLS_asFunctionalComponent1(__VLS_2004, new __VLS_2004({
    label: "隐藏标题",
}));
const __VLS_2006 = __VLS_2005({
    label: "隐藏标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_2005));
const { default: __VLS_2009 } = __VLS_2007.slots;
let __VLS_2010;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2011 = __VLS_asFunctionalComponent1(__VLS_2010, new __VLS_2010({
    modelValue: (__VLS_ctx.app.hideMangaTitle),
}));
const __VLS_2012 = __VLS_2011({
    modelValue: (__VLS_ctx.app.hideMangaTitle),
}, ...__VLS_functionalComponentArgsRest(__VLS_2011));
// @ts-ignore
[app,];
var __VLS_2007;
let __VLS_2015;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2016 = __VLS_asFunctionalComponent1(__VLS_2015, new __VLS_2015({
    contentPosition: "left",
}));
const __VLS_2017 = __VLS_2016({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2016));
const { default: __VLS_2020 } = __VLS_2018.slots;
// @ts-ignore
[];
var __VLS_2018;
let __VLS_2021;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2022 = __VLS_asFunctionalComponent1(__VLS_2021, new __VLS_2021({
    label: "预下载数量",
}));
const __VLS_2023 = __VLS_2022({
    label: "预下载数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_2022));
const { default: __VLS_2026 } = __VLS_2024.slots;
let __VLS_2027;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_2028 = __VLS_asFunctionalComponent1(__VLS_2027, new __VLS_2027({
    modelValue: (__VLS_ctx.app.mangaPreDownloadNum),
    min: (0),
    max: (100),
}));
const __VLS_2029 = __VLS_2028({
    modelValue: (__VLS_ctx.app.mangaPreDownloadNum),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_2028));
// @ts-ignore
[app,];
var __VLS_2024;
let __VLS_2032;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2033 = __VLS_asFunctionalComponent1(__VLS_2032, new __VLS_2032({
    label: "自动翻页速度",
}));
const __VLS_2034 = __VLS_2033({
    label: "自动翻页速度",
}, ...__VLS_functionalComponentArgsRest(__VLS_2033));
const { default: __VLS_2037 } = __VLS_2035.slots;
let __VLS_2038;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_2039 = __VLS_asFunctionalComponent1(__VLS_2038, new __VLS_2038({
    modelValue: (__VLS_ctx.app.mangaAutoPageSpeed),
    min: (1),
    max: (10),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_2040 = __VLS_2039({
    modelValue: (__VLS_ctx.app.mangaAutoPageSpeed),
    min: (1),
    max: (10),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_2039));
// @ts-ignore
[app,];
var __VLS_2035;
let __VLS_2043;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2044 = __VLS_asFunctionalComponent1(__VLS_2043, new __VLS_2043({
    label: "横向滚动",
}));
const __VLS_2045 = __VLS_2044({
    label: "横向滚动",
}, ...__VLS_functionalComponentArgsRest(__VLS_2044));
const { default: __VLS_2048 } = __VLS_2046.slots;
let __VLS_2049;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2050 = __VLS_asFunctionalComponent1(__VLS_2049, new __VLS_2049({
    modelValue: (__VLS_ctx.app.enableMangaHorizontalScroll),
}));
const __VLS_2051 = __VLS_2050({
    modelValue: (__VLS_ctx.app.enableMangaHorizontalScroll),
}, ...__VLS_functionalComponentArgsRest(__VLS_2050));
// @ts-ignore
[app,];
var __VLS_2046;
let __VLS_2054;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2055 = __VLS_asFunctionalComponent1(__VLS_2054, new __VLS_2054({
    label: "禁用点击滚动",
}));
const __VLS_2056 = __VLS_2055({
    label: "禁用点击滚动",
}, ...__VLS_functionalComponentArgsRest(__VLS_2055));
const { default: __VLS_2059 } = __VLS_2057.slots;
let __VLS_2060;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2061 = __VLS_asFunctionalComponent1(__VLS_2060, new __VLS_2060({
    modelValue: (__VLS_ctx.app.disableClickScroll),
}));
const __VLS_2062 = __VLS_2061({
    modelValue: (__VLS_ctx.app.disableClickScroll),
}, ...__VLS_functionalComponentArgsRest(__VLS_2061));
// @ts-ignore
[app,];
var __VLS_2057;
let __VLS_2065;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2066 = __VLS_asFunctionalComponent1(__VLS_2065, new __VLS_2065({
    label: "禁用水平页面吸附",
}));
const __VLS_2067 = __VLS_2066({
    label: "禁用水平页面吸附",
}, ...__VLS_functionalComponentArgsRest(__VLS_2066));
const { default: __VLS_2070 } = __VLS_2068.slots;
let __VLS_2071;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2072 = __VLS_asFunctionalComponent1(__VLS_2071, new __VLS_2071({
    modelValue: (__VLS_ctx.app.disableHorizontalPageSnap),
}));
const __VLS_2073 = __VLS_2072({
    modelValue: (__VLS_ctx.app.disableHorizontalPageSnap),
}, ...__VLS_functionalComponentArgsRest(__VLS_2072));
// @ts-ignore
[app,];
var __VLS_2068;
let __VLS_2076;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2077 = __VLS_asFunctionalComponent1(__VLS_2076, new __VLS_2076({
    contentPosition: "left",
}));
const __VLS_2078 = __VLS_2077({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2077));
const { default: __VLS_2081 } = __VLS_2079.slots;
// @ts-ignore
[];
var __VLS_2079;
let __VLS_2082;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2083 = __VLS_asFunctionalComponent1(__VLS_2082, new __VLS_2082({
    label: "颜色滤镜",
}));
const __VLS_2084 = __VLS_2083({
    label: "颜色滤镜",
}, ...__VLS_functionalComponentArgsRest(__VLS_2083));
const { default: __VLS_2087 } = __VLS_2085.slots;
let __VLS_2088;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2089 = __VLS_asFunctionalComponent1(__VLS_2088, new __VLS_2088({
    modelValue: (__VLS_ctx.app.mangaColorFilter),
    placeholder: "如: #FF0000",
}));
const __VLS_2090 = __VLS_2089({
    modelValue: (__VLS_ctx.app.mangaColorFilter),
    placeholder: "如: #FF0000",
}, ...__VLS_functionalComponentArgsRest(__VLS_2089));
// @ts-ignore
[app,];
var __VLS_2085;
let __VLS_2093;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2094 = __VLS_asFunctionalComponent1(__VLS_2093, new __VLS_2093({
    label: "启用灰度",
}));
const __VLS_2095 = __VLS_2094({
    label: "启用灰度",
}, ...__VLS_functionalComponentArgsRest(__VLS_2094));
const { default: __VLS_2098 } = __VLS_2096.slots;
let __VLS_2099;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2100 = __VLS_asFunctionalComponent1(__VLS_2099, new __VLS_2099({
    modelValue: (__VLS_ctx.app.enableMangaGray),
}));
const __VLS_2101 = __VLS_2100({
    modelValue: (__VLS_ctx.app.enableMangaGray),
}, ...__VLS_functionalComponentArgsRest(__VLS_2100));
// @ts-ignore
[app,];
var __VLS_2096;
let __VLS_2104;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2105 = __VLS_asFunctionalComponent1(__VLS_2104, new __VLS_2104({
    label: "墨水屏模式",
}));
const __VLS_2106 = __VLS_2105({
    label: "墨水屏模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_2105));
const { default: __VLS_2109 } = __VLS_2107.slots;
let __VLS_2110;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2111 = __VLS_asFunctionalComponent1(__VLS_2110, new __VLS_2110({
    modelValue: (__VLS_ctx.app.enableMangaEInk),
}));
const __VLS_2112 = __VLS_2111({
    modelValue: (__VLS_ctx.app.enableMangaEInk),
}, ...__VLS_functionalComponentArgsRest(__VLS_2111));
// @ts-ignore
[app,];
var __VLS_2107;
let __VLS_2115;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2116 = __VLS_asFunctionalComponent1(__VLS_2115, new __VLS_2115({
    label: "墨水屏阈值",
}));
const __VLS_2117 = __VLS_2116({
    label: "墨水屏阈值",
}, ...__VLS_functionalComponentArgsRest(__VLS_2116));
const { default: __VLS_2120 } = __VLS_2118.slots;
let __VLS_2121;
/** @ts-ignore @type { | typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider | typeof __VLS_components['el-slider']} */
elSlider;
// @ts-ignore
const __VLS_2122 = __VLS_asFunctionalComponent1(__VLS_2121, new __VLS_2121({
    modelValue: (__VLS_ctx.app.mangaEInkThreshold),
    min: (0),
    max: (255),
    showInput: true,
    ...{ style: {} },
}));
const __VLS_2123 = __VLS_2122({
    modelValue: (__VLS_ctx.app.mangaEInkThreshold),
    min: (0),
    max: (255),
    showInput: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_2122));
// @ts-ignore
[app,];
var __VLS_2118;
let __VLS_2126;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2127 = __VLS_asFunctionalComponent1(__VLS_2126, new __VLS_2126({
    label: "页脚配置",
}));
const __VLS_2128 = __VLS_2127({
    label: "页脚配置",
}, ...__VLS_functionalComponentArgsRest(__VLS_2127));
const { default: __VLS_2131 } = __VLS_2129.slots;
let __VLS_2132;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2133 = __VLS_asFunctionalComponent1(__VLS_2132, new __VLS_2132({
    modelValue: (__VLS_ctx.app.mangaFooterConfig),
    type: "textarea",
    rows: (2),
}));
const __VLS_2134 = __VLS_2133({
    modelValue: (__VLS_ctx.app.mangaFooterConfig),
    type: "textarea",
    rows: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_2133));
// @ts-ignore
[app,];
var __VLS_2129;
// @ts-ignore
[];
var __VLS_1962;
// @ts-ignore
[];
var __VLS_1956;
let __VLS_2137;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_2138 = __VLS_asFunctionalComponent1(__VLS_2137, new __VLS_2137({
    label: "导出/备份",
    name: "export",
}));
const __VLS_2139 = __VLS_2138({
    label: "导出/备份",
    name: "export",
}, ...__VLS_functionalComponentArgsRest(__VLS_2138));
const { default: __VLS_2142 } = __VLS_2140.slots;
let __VLS_2143;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2144 = __VLS_asFunctionalComponent1(__VLS_2143, new __VLS_2143({
    contentPosition: "left",
}));
const __VLS_2145 = __VLS_2144({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2144));
const { default: __VLS_2148 } = __VLS_2146.slots;
// @ts-ignore
[];
var __VLS_2146;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "data-actions" },
});
/** @type {__VLS_StyleScopedClasses['data-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-row" },
});
/** @type {__VLS_StyleScopedClasses['action-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "action-label" },
});
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
let __VLS_2149;
/** @ts-ignore @type { | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox'] | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox']} */
elCheckbox;
// @ts-ignore
const __VLS_2150 = __VLS_asFunctionalComponent1(__VLS_2149, new __VLS_2149({
    modelValue: (__VLS_ctx.backupIncludeBooks),
}));
const __VLS_2151 = __VLS_2150({
    modelValue: (__VLS_ctx.backupIncludeBooks),
}, ...__VLS_functionalComponentArgsRest(__VLS_2150));
const { default: __VLS_2154 } = __VLS_2152.slots;
// @ts-ignore
[backupIncludeBooks,];
var __VLS_2152;
let __VLS_2155;
/** @ts-ignore @type { | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox'] | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox']} */
elCheckbox;
// @ts-ignore
const __VLS_2156 = __VLS_asFunctionalComponent1(__VLS_2155, new __VLS_2155({
    modelValue: (__VLS_ctx.backupIncludeSources),
}));
const __VLS_2157 = __VLS_2156({
    modelValue: (__VLS_ctx.backupIncludeSources),
}, ...__VLS_functionalComponentArgsRest(__VLS_2156));
const { default: __VLS_2160 } = __VLS_2158.slots;
// @ts-ignore
[backupIncludeSources,];
var __VLS_2158;
let __VLS_2161;
/** @ts-ignore @type { | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox'] | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox']} */
elCheckbox;
// @ts-ignore
const __VLS_2162 = __VLS_asFunctionalComponent1(__VLS_2161, new __VLS_2161({
    modelValue: (__VLS_ctx.backupIncludeConfigs),
}));
const __VLS_2163 = __VLS_2162({
    modelValue: (__VLS_ctx.backupIncludeConfigs),
}, ...__VLS_functionalComponentArgsRest(__VLS_2162));
const { default: __VLS_2166 } = __VLS_2164.slots;
// @ts-ignore
[backupIncludeConfigs,];
var __VLS_2164;
let __VLS_2167;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2168 = __VLS_asFunctionalComponent1(__VLS_2167, new __VLS_2167({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.backupStore.backingUp),
}));
const __VLS_2169 = __VLS_2168({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.backupStore.backingUp),
}, ...__VLS_functionalComponentArgsRest(__VLS_2168));
let __VLS_2172;
const __VLS_2173 = {
    /** @type {typeof __VLS_2172.click} */
    onClick: (__VLS_ctx.handleCreateBackup),
};
const { default: __VLS_2174 } = __VLS_2170.slots;
// @ts-ignore
[backupStore, handleCreateBackup,];
var __VLS_2170;
var __VLS_2171;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-row" },
});
/** @type {__VLS_StyleScopedClasses['action-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "action-label" },
});
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
let __VLS_2175;
/** @ts-ignore @type { | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload'] | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload']} */
elUpload;
// @ts-ignore
const __VLS_2176 = __VLS_asFunctionalComponent1(__VLS_2175, new __VLS_2175({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleRestoreBackup),
    accept: ".zip",
}));
const __VLS_2177 = __VLS_2176({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleRestoreBackup),
    accept: ".zip",
}, ...__VLS_functionalComponentArgsRest(__VLS_2176));
const { default: __VLS_2180 } = __VLS_2178.slots;
let __VLS_2181;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2182 = __VLS_asFunctionalComponent1(__VLS_2181, new __VLS_2181({
    type: "warning",
    loading: (__VLS_ctx.backupStore.restoring),
}));
const __VLS_2183 = __VLS_2182({
    type: "warning",
    loading: (__VLS_ctx.backupStore.restoring),
}, ...__VLS_functionalComponentArgsRest(__VLS_2182));
const { default: __VLS_2186 } = __VLS_2184.slots;
// @ts-ignore
[backupStore, handleRestoreBackup,];
var __VLS_2184;
// @ts-ignore
[];
var __VLS_2178;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-row" },
});
/** @type {__VLS_StyleScopedClasses['action-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "action-label" },
});
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
let __VLS_2187;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2188 = __VLS_asFunctionalComponent1(__VLS_2187, new __VLS_2187({
    ...{ 'onClick': {} },
}));
const __VLS_2189 = __VLS_2188({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_2188));
let __VLS_2192;
const __VLS_2193 = {
    /** @type {typeof __VLS_2192.click} */
    onClick: (__VLS_ctx.backupStore.exportSources),
};
const { default: __VLS_2194 } = __VLS_2190.slots;
// @ts-ignore
[backupStore,];
var __VLS_2190;
var __VLS_2191;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-row" },
});
/** @type {__VLS_StyleScopedClasses['action-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "action-label" },
});
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
let __VLS_2195;
/** @ts-ignore @type { | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload'] | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload']} */
elUpload;
// @ts-ignore
const __VLS_2196 = __VLS_asFunctionalComponent1(__VLS_2195, new __VLS_2195({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleImportSources),
    accept: ".json",
}));
const __VLS_2197 = __VLS_2196({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleImportSources),
    accept: ".json",
}, ...__VLS_functionalComponentArgsRest(__VLS_2196));
const { default: __VLS_2200 } = __VLS_2198.slots;
let __VLS_2201;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2202 = __VLS_asFunctionalComponent1(__VLS_2201, new __VLS_2201({}));
const __VLS_2203 = __VLS_2202({}, ...__VLS_functionalComponentArgsRest(__VLS_2202));
const { default: __VLS_2206 } = __VLS_2204.slots;
// @ts-ignore
[handleImportSources,];
var __VLS_2204;
// @ts-ignore
[];
var __VLS_2198;
let __VLS_2207;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_2208 = __VLS_asFunctionalComponent1(__VLS_2207, new __VLS_2207({
    labelWidth: "180px",
}));
const __VLS_2209 = __VLS_2208({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_2208));
const { default: __VLS_2212 } = __VLS_2210.slots;
let __VLS_2213;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2214 = __VLS_asFunctionalComponent1(__VLS_2213, new __VLS_2213({
    contentPosition: "left",
}));
const __VLS_2215 = __VLS_2214({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2214));
const { default: __VLS_2218 } = __VLS_2216.slots;
// @ts-ignore
[];
var __VLS_2216;
let __VLS_2219;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2220 = __VLS_asFunctionalComponent1(__VLS_2219, new __VLS_2219({
    label: "导出编码",
}));
const __VLS_2221 = __VLS_2220({
    label: "导出编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_2220));
const { default: __VLS_2224 } = __VLS_2222.slots;
let __VLS_2225;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_2226 = __VLS_asFunctionalComponent1(__VLS_2225, new __VLS_2225({
    modelValue: (__VLS_ctx.app.exportCharset),
}));
const __VLS_2227 = __VLS_2226({
    modelValue: (__VLS_ctx.app.exportCharset),
}, ...__VLS_functionalComponentArgsRest(__VLS_2226));
const { default: __VLS_2230 } = __VLS_2228.slots;
let __VLS_2231;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_2232 = __VLS_asFunctionalComponent1(__VLS_2231, new __VLS_2231({
    value: "UTF-8",
    label: "UTF-8",
}));
const __VLS_2233 = __VLS_2232({
    value: "UTF-8",
    label: "UTF-8",
}, ...__VLS_functionalComponentArgsRest(__VLS_2232));
let __VLS_2236;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_2237 = __VLS_asFunctionalComponent1(__VLS_2236, new __VLS_2236({
    value: "GBK",
    label: "GBK",
}));
const __VLS_2238 = __VLS_2237({
    value: "GBK",
    label: "GBK",
}, ...__VLS_functionalComponentArgsRest(__VLS_2237));
// @ts-ignore
[app,];
var __VLS_2228;
// @ts-ignore
[];
var __VLS_2222;
let __VLS_2241;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2242 = __VLS_asFunctionalComponent1(__VLS_2241, new __VLS_2241({
    label: "导出类型",
}));
const __VLS_2243 = __VLS_2242({
    label: "导出类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_2242));
const { default: __VLS_2246 } = __VLS_2244.slots;
let __VLS_2247;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_2248 = __VLS_asFunctionalComponent1(__VLS_2247, new __VLS_2247({
    modelValue: (__VLS_ctx.app.exportType),
}));
const __VLS_2249 = __VLS_2248({
    modelValue: (__VLS_ctx.app.exportType),
}, ...__VLS_functionalComponentArgsRest(__VLS_2248));
const { default: __VLS_2252 } = __VLS_2250.slots;
let __VLS_2253;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_2254 = __VLS_asFunctionalComponent1(__VLS_2253, new __VLS_2253({
    value: (0),
    label: "TXT",
}));
const __VLS_2255 = __VLS_2254({
    value: (0),
    label: "TXT",
}, ...__VLS_functionalComponentArgsRest(__VLS_2254));
let __VLS_2258;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_2259 = __VLS_asFunctionalComponent1(__VLS_2258, new __VLS_2258({
    value: (1),
    label: "EPUB",
}));
const __VLS_2260 = __VLS_2259({
    value: (1),
    label: "EPUB",
}, ...__VLS_functionalComponentArgsRest(__VLS_2259));
// @ts-ignore
[app,];
var __VLS_2250;
// @ts-ignore
[];
var __VLS_2244;
let __VLS_2263;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2264 = __VLS_asFunctionalComponent1(__VLS_2263, new __VLS_2263({
    label: "使用替换规则",
}));
const __VLS_2265 = __VLS_2264({
    label: "使用替换规则",
}, ...__VLS_functionalComponentArgsRest(__VLS_2264));
const { default: __VLS_2268 } = __VLS_2266.slots;
let __VLS_2269;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2270 = __VLS_asFunctionalComponent1(__VLS_2269, new __VLS_2269({
    modelValue: (__VLS_ctx.app.exportUseReplace),
}));
const __VLS_2271 = __VLS_2270({
    modelValue: (__VLS_ctx.app.exportUseReplace),
}, ...__VLS_functionalComponentArgsRest(__VLS_2270));
// @ts-ignore
[app,];
var __VLS_2266;
let __VLS_2274;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2275 = __VLS_asFunctionalComponent1(__VLS_2274, new __VLS_2274({
    label: "无章节名",
}));
const __VLS_2276 = __VLS_2275({
    label: "无章节名",
}, ...__VLS_functionalComponentArgsRest(__VLS_2275));
const { default: __VLS_2279 } = __VLS_2277.slots;
let __VLS_2280;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2281 = __VLS_asFunctionalComponent1(__VLS_2280, new __VLS_2280({
    modelValue: (__VLS_ctx.app.exportNoChapterName),
}));
const __VLS_2282 = __VLS_2281({
    modelValue: (__VLS_ctx.app.exportNoChapterName),
}, ...__VLS_functionalComponentArgsRest(__VLS_2281));
// @ts-ignore
[app,];
var __VLS_2277;
let __VLS_2285;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2286 = __VLS_asFunctionalComponent1(__VLS_2285, new __VLS_2285({
    label: "导出图片文件",
}));
const __VLS_2287 = __VLS_2286({
    label: "导出图片文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_2286));
const { default: __VLS_2290 } = __VLS_2288.slots;
let __VLS_2291;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2292 = __VLS_asFunctionalComponent1(__VLS_2291, new __VLS_2291({
    modelValue: (__VLS_ctx.app.exportPictureFile),
}));
const __VLS_2293 = __VLS_2292({
    modelValue: (__VLS_ctx.app.exportPictureFile),
}, ...__VLS_functionalComponentArgsRest(__VLS_2292));
// @ts-ignore
[app,];
var __VLS_2288;
let __VLS_2296;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2297 = __VLS_asFunctionalComponent1(__VLS_2296, new __VLS_2296({
    label: "并行导出",
}));
const __VLS_2298 = __VLS_2297({
    label: "并行导出",
}, ...__VLS_functionalComponentArgsRest(__VLS_2297));
const { default: __VLS_2301 } = __VLS_2299.slots;
let __VLS_2302;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2303 = __VLS_asFunctionalComponent1(__VLS_2302, new __VLS_2302({
    modelValue: (__VLS_ctx.app.parallelExportBook),
}));
const __VLS_2304 = __VLS_2303({
    modelValue: (__VLS_ctx.app.parallelExportBook),
}, ...__VLS_functionalComponentArgsRest(__VLS_2303));
// @ts-ignore
[app,];
var __VLS_2299;
let __VLS_2307;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2308 = __VLS_asFunctionalComponent1(__VLS_2307, new __VLS_2307({
    label: "启用自定义导出",
}));
const __VLS_2309 = __VLS_2308({
    label: "启用自定义导出",
}, ...__VLS_functionalComponentArgsRest(__VLS_2308));
const { default: __VLS_2312 } = __VLS_2310.slots;
let __VLS_2313;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2314 = __VLS_asFunctionalComponent1(__VLS_2313, new __VLS_2313({
    modelValue: (__VLS_ctx.app.enableCustomExport),
}));
const __VLS_2315 = __VLS_2314({
    modelValue: (__VLS_ctx.app.enableCustomExport),
}, ...__VLS_functionalComponentArgsRest(__VLS_2314));
// @ts-ignore
[app,];
var __VLS_2310;
let __VLS_2318;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2319 = __VLS_asFunctionalComponent1(__VLS_2318, new __VLS_2318({
    contentPosition: "left",
}));
const __VLS_2320 = __VLS_2319({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2319));
const { default: __VLS_2323 } = __VLS_2321.slots;
// @ts-ignore
[];
var __VLS_2321;
let __VLS_2324;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2325 = __VLS_asFunctionalComponent1(__VLS_2324, new __VLS_2324({
    label: "WebDav地址",
}));
const __VLS_2326 = __VLS_2325({
    label: "WebDav地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_2325));
const { default: __VLS_2329 } = __VLS_2327.slots;
let __VLS_2330;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2331 = __VLS_asFunctionalComponent1(__VLS_2330, new __VLS_2330({
    modelValue: (__VLS_ctx.app.web_dav_url),
    placeholder: "https://dav.example.com",
}));
const __VLS_2332 = __VLS_2331({
    modelValue: (__VLS_ctx.app.web_dav_url),
    placeholder: "https://dav.example.com",
}, ...__VLS_functionalComponentArgsRest(__VLS_2331));
// @ts-ignore
[app,];
var __VLS_2327;
let __VLS_2335;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2336 = __VLS_asFunctionalComponent1(__VLS_2335, new __VLS_2335({
    label: "WebDav账号",
}));
const __VLS_2337 = __VLS_2336({
    label: "WebDav账号",
}, ...__VLS_functionalComponentArgsRest(__VLS_2336));
const { default: __VLS_2340 } = __VLS_2338.slots;
let __VLS_2341;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2342 = __VLS_asFunctionalComponent1(__VLS_2341, new __VLS_2341({
    modelValue: (__VLS_ctx.app.web_dav_account),
}));
const __VLS_2343 = __VLS_2342({
    modelValue: (__VLS_ctx.app.web_dav_account),
}, ...__VLS_functionalComponentArgsRest(__VLS_2342));
// @ts-ignore
[app,];
var __VLS_2338;
let __VLS_2346;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2347 = __VLS_asFunctionalComponent1(__VLS_2346, new __VLS_2346({
    label: "WebDav密码",
}));
const __VLS_2348 = __VLS_2347({
    label: "WebDav密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_2347));
const { default: __VLS_2351 } = __VLS_2349.slots;
let __VLS_2352;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2353 = __VLS_asFunctionalComponent1(__VLS_2352, new __VLS_2352({
    modelValue: (__VLS_ctx.app.web_dav_password),
    type: "password",
    showPassword: true,
}));
const __VLS_2354 = __VLS_2353({
    modelValue: (__VLS_ctx.app.web_dav_password),
    type: "password",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_2353));
// @ts-ignore
[app,];
var __VLS_2349;
let __VLS_2357;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2358 = __VLS_asFunctionalComponent1(__VLS_2357, new __VLS_2357({
    label: "WebDav目录",
}));
const __VLS_2359 = __VLS_2358({
    label: "WebDav目录",
}, ...__VLS_functionalComponentArgsRest(__VLS_2358));
const { default: __VLS_2362 } = __VLS_2360.slots;
let __VLS_2363;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2364 = __VLS_asFunctionalComponent1(__VLS_2363, new __VLS_2363({
    modelValue: (__VLS_ctx.app.webDavDir),
}));
const __VLS_2365 = __VLS_2364({
    modelValue: (__VLS_ctx.app.webDavDir),
}, ...__VLS_functionalComponentArgsRest(__VLS_2364));
// @ts-ignore
[app,];
var __VLS_2360;
let __VLS_2368;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2369 = __VLS_asFunctionalComponent1(__VLS_2368, new __VLS_2368({
    label: "WebDav设备名",
}));
const __VLS_2370 = __VLS_2369({
    label: "WebDav设备名",
}, ...__VLS_functionalComponentArgsRest(__VLS_2369));
const { default: __VLS_2373 } = __VLS_2371.slots;
let __VLS_2374;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2375 = __VLS_asFunctionalComponent1(__VLS_2374, new __VLS_2374({
    modelValue: (__VLS_ctx.app.webDavDeviceName),
}));
const __VLS_2376 = __VLS_2375({
    modelValue: (__VLS_ctx.app.webDavDeviceName),
}, ...__VLS_functionalComponentArgsRest(__VLS_2375));
// @ts-ignore
[app,];
var __VLS_2371;
let __VLS_2379;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2380 = __VLS_asFunctionalComponent1(__VLS_2379, new __VLS_2379({
    label: "导出到WebDav",
}));
const __VLS_2381 = __VLS_2380({
    label: "导出到WebDav",
}, ...__VLS_functionalComponentArgsRest(__VLS_2380));
const { default: __VLS_2384 } = __VLS_2382.slots;
let __VLS_2385;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2386 = __VLS_asFunctionalComponent1(__VLS_2385, new __VLS_2385({
    modelValue: (__VLS_ctx.app.webDavCacheBackup),
}));
const __VLS_2387 = __VLS_2386({
    modelValue: (__VLS_ctx.app.webDavCacheBackup),
}, ...__VLS_functionalComponentArgsRest(__VLS_2386));
// @ts-ignore
[app,];
var __VLS_2382;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "webdav-actions" },
});
/** @type {__VLS_StyleScopedClasses['webdav-actions']} */ ;
let __VLS_2390;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2391 = __VLS_asFunctionalComponent1(__VLS_2390, new __VLS_2390({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.webDavChecking),
}));
const __VLS_2392 = __VLS_2391({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.webDavChecking),
}, ...__VLS_functionalComponentArgsRest(__VLS_2391));
let __VLS_2395;
const __VLS_2396 = {
    /** @type {typeof __VLS_2395.click} */
    onClick: (__VLS_ctx.handleWebDavCheck),
};
const { default: __VLS_2397 } = __VLS_2393.slots;
// @ts-ignore
[webDavChecking, handleWebDavCheck,];
var __VLS_2393;
var __VLS_2394;
let __VLS_2398;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2399 = __VLS_asFunctionalComponent1(__VLS_2398, new __VLS_2398({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.webDavBacking),
}));
const __VLS_2400 = __VLS_2399({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.webDavBacking),
}, ...__VLS_functionalComponentArgsRest(__VLS_2399));
let __VLS_2403;
const __VLS_2404 = {
    /** @type {typeof __VLS_2403.click} */
    onClick: (__VLS_ctx.handleWebDavBackup),
};
const { default: __VLS_2405 } = __VLS_2401.slots;
// @ts-ignore
[webDavBacking, handleWebDavBackup,];
var __VLS_2401;
var __VLS_2402;
let __VLS_2406;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2407 = __VLS_asFunctionalComponent1(__VLS_2406, new __VLS_2406({
    ...{ 'onClick': {} },
    type: "warning",
    loading: (__VLS_ctx.webDavRestoring),
}));
const __VLS_2408 = __VLS_2407({
    ...{ 'onClick': {} },
    type: "warning",
    loading: (__VLS_ctx.webDavRestoring),
}, ...__VLS_functionalComponentArgsRest(__VLS_2407));
let __VLS_2411;
const __VLS_2412 = {
    /** @type {typeof __VLS_2411.click} */
    onClick: (__VLS_ctx.handleWebDavRestore),
};
const { default: __VLS_2413 } = __VLS_2409.slots;
// @ts-ignore
[webDavRestoring, handleWebDavRestore,];
var __VLS_2409;
var __VLS_2410;
let __VLS_2414;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2415 = __VLS_asFunctionalComponent1(__VLS_2414, new __VLS_2414({
    contentPosition: "left",
}));
const __VLS_2416 = __VLS_2415({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2415));
const { default: __VLS_2419 } = __VLS_2417.slots;
// @ts-ignore
[];
var __VLS_2417;
let __VLS_2420;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2421 = __VLS_asFunctionalComponent1(__VLS_2420, new __VLS_2420({
    label: "备份路径",
}));
const __VLS_2422 = __VLS_2421({
    label: "备份路径",
}, ...__VLS_functionalComponentArgsRest(__VLS_2421));
const { default: __VLS_2425 } = __VLS_2423.slots;
let __VLS_2426;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2427 = __VLS_asFunctionalComponent1(__VLS_2426, new __VLS_2426({
    modelValue: (__VLS_ctx.app.backupUri),
}));
const __VLS_2428 = __VLS_2427({
    modelValue: (__VLS_ctx.app.backupUri),
}, ...__VLS_functionalComponentArgsRest(__VLS_2427));
// @ts-ignore
[app,];
var __VLS_2423;
let __VLS_2431;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2432 = __VLS_asFunctionalComponent1(__VLS_2431, new __VLS_2431({
    label: "恢复时忽略",
}));
const __VLS_2433 = __VLS_2432({
    label: "恢复时忽略",
}, ...__VLS_functionalComponentArgsRest(__VLS_2432));
const { default: __VLS_2436 } = __VLS_2434.slots;
let __VLS_2437;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2438 = __VLS_asFunctionalComponent1(__VLS_2437, new __VLS_2437({
    modelValue: (__VLS_ctx.app.restoreIgnore),
}));
const __VLS_2439 = __VLS_2438({
    modelValue: (__VLS_ctx.app.restoreIgnore),
}, ...__VLS_functionalComponentArgsRest(__VLS_2438));
// @ts-ignore
[app,];
var __VLS_2434;
let __VLS_2442;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2443 = __VLS_asFunctionalComponent1(__VLS_2442, new __VLS_2442({
    label: "仅保留最新备份",
}));
const __VLS_2444 = __VLS_2443({
    label: "仅保留最新备份",
}, ...__VLS_functionalComponentArgsRest(__VLS_2443));
const { default: __VLS_2447 } = __VLS_2445.slots;
let __VLS_2448;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2449 = __VLS_asFunctionalComponent1(__VLS_2448, new __VLS_2448({
    modelValue: (__VLS_ctx.app.onlyLatestBackup),
}));
const __VLS_2450 = __VLS_2449({
    modelValue: (__VLS_ctx.app.onlyLatestBackup),
}, ...__VLS_functionalComponentArgsRest(__VLS_2449));
// @ts-ignore
[app,];
var __VLS_2445;
let __VLS_2453;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2454 = __VLS_asFunctionalComponent1(__VLS_2453, new __VLS_2453({
    label: "自动检查新备份",
}));
const __VLS_2455 = __VLS_2454({
    label: "自动检查新备份",
}, ...__VLS_functionalComponentArgsRest(__VLS_2454));
const { default: __VLS_2458 } = __VLS_2456.slots;
let __VLS_2459;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2460 = __VLS_asFunctionalComponent1(__VLS_2459, new __VLS_2459({
    modelValue: (__VLS_ctx.app.autoCheckNewBackup),
}));
const __VLS_2461 = __VLS_2460({
    modelValue: (__VLS_ctx.app.autoCheckNewBackup),
}, ...__VLS_functionalComponentArgsRest(__VLS_2460));
// @ts-ignore
[app,];
var __VLS_2456;
let __VLS_2464;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2465 = __VLS_asFunctionalComponent1(__VLS_2464, new __VLS_2464({
    contentPosition: "left",
}));
const __VLS_2466 = __VLS_2465({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2465));
const { default: __VLS_2469 } = __VLS_2467.slots;
// @ts-ignore
[];
var __VLS_2467;
let __VLS_2470;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2471 = __VLS_asFunctionalComponent1(__VLS_2470, new __VLS_2470({
    label: "书籍导出文件名",
}));
const __VLS_2472 = __VLS_2471({
    label: "书籍导出文件名",
}, ...__VLS_functionalComponentArgsRest(__VLS_2471));
const { default: __VLS_2475 } = __VLS_2473.slots;
let __VLS_2476;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2477 = __VLS_asFunctionalComponent1(__VLS_2476, new __VLS_2476({
    modelValue: (__VLS_ctx.app.bookExportFileName),
    placeholder: "{name}_{author}",
}));
const __VLS_2478 = __VLS_2477({
    modelValue: (__VLS_ctx.app.bookExportFileName),
    placeholder: "{name}_{author}",
}, ...__VLS_functionalComponentArgsRest(__VLS_2477));
// @ts-ignore
[app,];
var __VLS_2473;
let __VLS_2481;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2482 = __VLS_asFunctionalComponent1(__VLS_2481, new __VLS_2481({
    label: "书籍导入文件名",
}));
const __VLS_2483 = __VLS_2482({
    label: "书籍导入文件名",
}, ...__VLS_functionalComponentArgsRest(__VLS_2482));
const { default: __VLS_2486 } = __VLS_2484.slots;
let __VLS_2487;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2488 = __VLS_asFunctionalComponent1(__VLS_2487, new __VLS_2487({
    modelValue: (__VLS_ctx.app.bookImportFileName),
}));
const __VLS_2489 = __VLS_2488({
    modelValue: (__VLS_ctx.app.bookImportFileName),
}, ...__VLS_functionalComponentArgsRest(__VLS_2488));
// @ts-ignore
[app,];
var __VLS_2484;
let __VLS_2492;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2493 = __VLS_asFunctionalComponent1(__VLS_2492, new __VLS_2492({
    label: "章节导出文件名",
}));
const __VLS_2494 = __VLS_2493({
    label: "章节导出文件名",
}, ...__VLS_functionalComponentArgsRest(__VLS_2493));
const { default: __VLS_2497 } = __VLS_2495.slots;
let __VLS_2498;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2499 = __VLS_asFunctionalComponent1(__VLS_2498, new __VLS_2498({
    modelValue: (__VLS_ctx.app.episodeExportFileName),
}));
const __VLS_2500 = __VLS_2499({
    modelValue: (__VLS_ctx.app.episodeExportFileName),
}, ...__VLS_functionalComponentArgsRest(__VLS_2499));
// @ts-ignore
[app,];
var __VLS_2495;
let __VLS_2503;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2504 = __VLS_asFunctionalComponent1(__VLS_2503, new __VLS_2503({
    contentPosition: "left",
}));
const __VLS_2505 = __VLS_2504({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2504));
const { default: __VLS_2508 } = __VLS_2506.slots;
// @ts-ignore
[];
var __VLS_2506;
let __VLS_2509;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2510 = __VLS_asFunctionalComponent1(__VLS_2509, new __VLS_2509({
    label: "导入保持文件名",
}));
const __VLS_2511 = __VLS_2510({
    label: "导入保持文件名",
}, ...__VLS_functionalComponentArgsRest(__VLS_2510));
const { default: __VLS_2514 } = __VLS_2512.slots;
let __VLS_2515;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2516 = __VLS_asFunctionalComponent1(__VLS_2515, new __VLS_2515({
    modelValue: (__VLS_ctx.app.importKeepName),
}));
const __VLS_2517 = __VLS_2516({
    modelValue: (__VLS_ctx.app.importKeepName),
}, ...__VLS_functionalComponentArgsRest(__VLS_2516));
// @ts-ignore
[app,];
var __VLS_2512;
let __VLS_2520;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2521 = __VLS_asFunctionalComponent1(__VLS_2520, new __VLS_2520({
    label: "导入保持分组",
}));
const __VLS_2522 = __VLS_2521({
    label: "导入保持分组",
}, ...__VLS_functionalComponentArgsRest(__VLS_2521));
const { default: __VLS_2525 } = __VLS_2523.slots;
let __VLS_2526;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2527 = __VLS_asFunctionalComponent1(__VLS_2526, new __VLS_2526({
    modelValue: (__VLS_ctx.app.importKeepGroup),
}));
const __VLS_2528 = __VLS_2527({
    modelValue: (__VLS_ctx.app.importKeepGroup),
}, ...__VLS_functionalComponentArgsRest(__VLS_2527));
// @ts-ignore
[app,];
var __VLS_2523;
let __VLS_2531;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2532 = __VLS_asFunctionalComponent1(__VLS_2531, new __VLS_2531({
    label: "启用导入保持",
}));
const __VLS_2533 = __VLS_2532({
    label: "启用导入保持",
}, ...__VLS_functionalComponentArgsRest(__VLS_2532));
const { default: __VLS_2536 } = __VLS_2534.slots;
let __VLS_2537;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2538 = __VLS_asFunctionalComponent1(__VLS_2537, new __VLS_2537({
    modelValue: (__VLS_ctx.app.importKeepEnable),
}));
const __VLS_2539 = __VLS_2538({
    modelValue: (__VLS_ctx.app.importKeepEnable),
}, ...__VLS_functionalComponentArgsRest(__VLS_2538));
// @ts-ignore
[app,];
var __VLS_2534;
let __VLS_2542;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2543 = __VLS_asFunctionalComponent1(__VLS_2542, new __VLS_2542({
    label: "导入显示注释",
}));
const __VLS_2544 = __VLS_2543({
    label: "导入显示注释",
}, ...__VLS_functionalComponentArgsRest(__VLS_2543));
const { default: __VLS_2547 } = __VLS_2545.slots;
let __VLS_2548;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2549 = __VLS_asFunctionalComponent1(__VLS_2548, new __VLS_2548({
    modelValue: (__VLS_ctx.app.importShowComment),
}));
const __VLS_2550 = __VLS_2549({
    modelValue: (__VLS_ctx.app.importShowComment),
}, ...__VLS_functionalComponentArgsRest(__VLS_2549));
// @ts-ignore
[app,];
var __VLS_2545;
let __VLS_2553;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2554 = __VLS_asFunctionalComponent1(__VLS_2553, new __VLS_2553({
    label: "本地导入排序",
}));
const __VLS_2555 = __VLS_2554({
    label: "本地导入排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_2554));
const { default: __VLS_2558 } = __VLS_2556.slots;
let __VLS_2559;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_2560 = __VLS_asFunctionalComponent1(__VLS_2559, new __VLS_2559({
    modelValue: (__VLS_ctx.app.localBookImportSort),
    min: (0),
    max: (3),
}));
const __VLS_2561 = __VLS_2560({
    modelValue: (__VLS_ctx.app.localBookImportSort),
    min: (0),
    max: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_2560));
// @ts-ignore
[app,];
var __VLS_2556;
let __VLS_2564;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2565 = __VLS_asFunctionalComponent1(__VLS_2564, new __VLS_2564({
    contentPosition: "left",
}));
const __VLS_2566 = __VLS_2565({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2565));
const { default: __VLS_2569 } = __VLS_2567.slots;
// @ts-ignore
[];
var __VLS_2567;
let __VLS_2570;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2571 = __VLS_asFunctionalComponent1(__VLS_2570, new __VLS_2570({
    label: "启用阅读记录",
}));
const __VLS_2572 = __VLS_2571({
    label: "启用阅读记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_2571));
const { default: __VLS_2575 } = __VLS_2573.slots;
let __VLS_2576;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2577 = __VLS_asFunctionalComponent1(__VLS_2576, new __VLS_2576({
    modelValue: (__VLS_ctx.app.enableReadRecord),
}));
const __VLS_2578 = __VLS_2577({
    modelValue: (__VLS_ctx.app.enableReadRecord),
}, ...__VLS_functionalComponentArgsRest(__VLS_2577));
// @ts-ignore
[app,];
var __VLS_2573;
let __VLS_2581;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2582 = __VLS_asFunctionalComponent1(__VLS_2581, new __VLS_2581({
    label: "同步阅读进度",
}));
const __VLS_2583 = __VLS_2582({
    label: "同步阅读进度",
}, ...__VLS_functionalComponentArgsRest(__VLS_2582));
const { default: __VLS_2586 } = __VLS_2584.slots;
let __VLS_2587;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2588 = __VLS_asFunctionalComponent1(__VLS_2587, new __VLS_2587({
    modelValue: (__VLS_ctx.app.syncBookProgress),
}));
const __VLS_2589 = __VLS_2588({
    modelValue: (__VLS_ctx.app.syncBookProgress),
}, ...__VLS_functionalComponentArgsRest(__VLS_2588));
// @ts-ignore
[app,];
var __VLS_2584;
let __VLS_2592;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2593 = __VLS_asFunctionalComponent1(__VLS_2592, new __VLS_2592({
    label: "增强同步进度",
}));
const __VLS_2594 = __VLS_2593({
    label: "增强同步进度",
}, ...__VLS_functionalComponentArgsRest(__VLS_2593));
const { default: __VLS_2597 } = __VLS_2595.slots;
let __VLS_2598;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2599 = __VLS_asFunctionalComponent1(__VLS_2598, new __VLS_2598({
    modelValue: (__VLS_ctx.app.syncBookProgressPlus),
}));
const __VLS_2600 = __VLS_2599({
    modelValue: (__VLS_ctx.app.syncBookProgressPlus),
}, ...__VLS_functionalComponentArgsRest(__VLS_2599));
// @ts-ignore
[app,];
var __VLS_2595;
let __VLS_2603;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2604 = __VLS_asFunctionalComponent1(__VLS_2603, new __VLS_2603({
    label: "目录使用替换规则",
}));
const __VLS_2605 = __VLS_2604({
    label: "目录使用替换规则",
}, ...__VLS_functionalComponentArgsRest(__VLS_2604));
const { default: __VLS_2608 } = __VLS_2606.slots;
let __VLS_2609;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2610 = __VLS_asFunctionalComponent1(__VLS_2609, new __VLS_2609({
    modelValue: (__VLS_ctx.app.tocUiUseReplace),
}));
const __VLS_2611 = __VLS_2610({
    modelValue: (__VLS_ctx.app.tocUiUseReplace),
}, ...__VLS_functionalComponentArgsRest(__VLS_2610));
// @ts-ignore
[app,];
var __VLS_2606;
let __VLS_2614;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2615 = __VLS_asFunctionalComponent1(__VLS_2614, new __VLS_2614({
    label: "目录统计字数",
}));
const __VLS_2616 = __VLS_2615({
    label: "目录统计字数",
}, ...__VLS_functionalComponentArgsRest(__VLS_2615));
const { default: __VLS_2619 } = __VLS_2617.slots;
let __VLS_2620;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2621 = __VLS_asFunctionalComponent1(__VLS_2620, new __VLS_2620({
    modelValue: (__VLS_ctx.app.tocCountWords),
}));
const __VLS_2622 = __VLS_2621({
    modelValue: (__VLS_ctx.app.tocCountWords),
}, ...__VLS_functionalComponentArgsRest(__VLS_2621));
// @ts-ignore
[app,];
var __VLS_2617;
let __VLS_2625;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2626 = __VLS_asFunctionalComponent1(__VLS_2625, new __VLS_2625({
    label: "默认启用替换规则",
}));
const __VLS_2627 = __VLS_2626({
    label: "默认启用替换规则",
}, ...__VLS_functionalComponentArgsRest(__VLS_2626));
const { default: __VLS_2630 } = __VLS_2628.slots;
let __VLS_2631;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2632 = __VLS_asFunctionalComponent1(__VLS_2631, new __VLS_2631({
    modelValue: (__VLS_ctx.app.replaceEnableDefault),
}));
const __VLS_2633 = __VLS_2632({
    modelValue: (__VLS_ctx.app.replaceEnableDefault),
}, ...__VLS_functionalComponentArgsRest(__VLS_2632));
// @ts-ignore
[app,];
var __VLS_2628;
// @ts-ignore
[];
var __VLS_2210;
// @ts-ignore
[];
var __VLS_2140;
let __VLS_2636;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_2637 = __VLS_asFunctionalComponent1(__VLS_2636, new __VLS_2636({
    label: "Web服务",
    name: "web",
}));
const __VLS_2638 = __VLS_2637({
    label: "Web服务",
    name: "web",
}, ...__VLS_functionalComponentArgsRest(__VLS_2637));
const { default: __VLS_2641 } = __VLS_2639.slots;
let __VLS_2642;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_2643 = __VLS_asFunctionalComponent1(__VLS_2642, new __VLS_2642({
    labelWidth: "180px",
}));
const __VLS_2644 = __VLS_2643({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_2643));
const { default: __VLS_2647 } = __VLS_2645.slots;
let __VLS_2648;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2649 = __VLS_asFunctionalComponent1(__VLS_2648, new __VLS_2648({
    contentPosition: "left",
}));
const __VLS_2650 = __VLS_2649({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2649));
const { default: __VLS_2653 } = __VLS_2651.slots;
// @ts-ignore
[];
var __VLS_2651;
let __VLS_2654;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2655 = __VLS_asFunctionalComponent1(__VLS_2654, new __VLS_2654({
    label: "Web服务端口",
}));
const __VLS_2656 = __VLS_2655({
    label: "Web服务端口",
}, ...__VLS_functionalComponentArgsRest(__VLS_2655));
const { default: __VLS_2659 } = __VLS_2657.slots;
let __VLS_2660;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_2661 = __VLS_asFunctionalComponent1(__VLS_2660, new __VLS_2660({
    modelValue: (__VLS_ctx.app.webPort),
    min: (1),
    max: (65535),
}));
const __VLS_2662 = __VLS_2661({
    modelValue: (__VLS_ctx.app.webPort),
    min: (1),
    max: (65535),
}, ...__VLS_functionalComponentArgsRest(__VLS_2661));
// @ts-ignore
[app,];
var __VLS_2657;
let __VLS_2665;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2666 = __VLS_asFunctionalComponent1(__VLS_2665, new __VLS_2665({
    label: "Web服务状态",
}));
const __VLS_2667 = __VLS_2666({
    label: "Web服务状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_2666));
const { default: __VLS_2670 } = __VLS_2668.slots;
let __VLS_2671;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2672 = __VLS_asFunctionalComponent1(__VLS_2671, new __VLS_2671({
    modelValue: (__VLS_ctx.app.webService),
}));
const __VLS_2673 = __VLS_2672({
    modelValue: (__VLS_ctx.app.webService),
}, ...__VLS_functionalComponentArgsRest(__VLS_2672));
// @ts-ignore
[app,];
var __VLS_2668;
let __VLS_2676;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2677 = __VLS_asFunctionalComponent1(__VLS_2676, new __VLS_2676({
    label: "Web服务唤醒锁",
}));
const __VLS_2678 = __VLS_2677({
    label: "Web服务唤醒锁",
}, ...__VLS_functionalComponentArgsRest(__VLS_2677));
const { default: __VLS_2681 } = __VLS_2679.slots;
let __VLS_2682;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2683 = __VLS_asFunctionalComponent1(__VLS_2682, new __VLS_2682({
    modelValue: (__VLS_ctx.app.webServiceWakeLock),
}));
const __VLS_2684 = __VLS_2683({
    modelValue: (__VLS_ctx.app.webServiceWakeLock),
}, ...__VLS_functionalComponentArgsRest(__VLS_2683));
// @ts-ignore
[app,];
var __VLS_2679;
let __VLS_2687;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2688 = __VLS_asFunctionalComponent1(__VLS_2687, new __VLS_2687({
    label: "保持亮屏",
}));
const __VLS_2689 = __VLS_2688({
    label: "保持亮屏",
}, ...__VLS_functionalComponentArgsRest(__VLS_2688));
const { default: __VLS_2692 } = __VLS_2690.slots;
let __VLS_2693;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2694 = __VLS_asFunctionalComponent1(__VLS_2693, new __VLS_2693({
    modelValue: (__VLS_ctx.app.keep_light),
}));
const __VLS_2695 = __VLS_2694({
    modelValue: (__VLS_ctx.app.keep_light),
}, ...__VLS_functionalComponentArgsRest(__VLS_2694));
// @ts-ignore
[app,];
var __VLS_2690;
let __VLS_2698;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2699 = __VLS_asFunctionalComponent1(__VLS_2698, new __VLS_2698({
    contentPosition: "left",
}));
const __VLS_2700 = __VLS_2699({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2699));
const { default: __VLS_2703 } = __VLS_2701.slots;
// @ts-ignore
[];
var __VLS_2701;
let __VLS_2704;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2705 = __VLS_asFunctionalComponent1(__VLS_2704, new __VLS_2704({
    label: "远程服务器ID",
}));
const __VLS_2706 = __VLS_2705({
    label: "远程服务器ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_2705));
const { default: __VLS_2709 } = __VLS_2707.slots;
let __VLS_2710;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_2711 = __VLS_asFunctionalComponent1(__VLS_2710, new __VLS_2710({
    modelValue: (__VLS_ctx.app.remoteServerId),
    min: (0),
}));
const __VLS_2712 = __VLS_2711({
    modelValue: (__VLS_ctx.app.remoteServerId),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_2711));
// @ts-ignore
[app,];
var __VLS_2707;
let __VLS_2715;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2716 = __VLS_asFunctionalComponent1(__VLS_2715, new __VLS_2715({
    label: "URL在浏览器打开",
}));
const __VLS_2717 = __VLS_2716({
    label: "URL在浏览器打开",
}, ...__VLS_functionalComponentArgsRest(__VLS_2716));
const { default: __VLS_2720 } = __VLS_2718.slots;
let __VLS_2721;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2722 = __VLS_asFunctionalComponent1(__VLS_2721, new __VLS_2721({
    modelValue: (__VLS_ctx.app.readUrlInBrowser),
}));
const __VLS_2723 = __VLS_2722({
    modelValue: (__VLS_ctx.app.readUrlInBrowser),
}, ...__VLS_functionalComponentArgsRest(__VLS_2722));
// @ts-ignore
[app,];
var __VLS_2718;
let __VLS_2726;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2727 = __VLS_asFunctionalComponent1(__VLS_2726, new __VLS_2726({
    label: "清除WebView数据",
}));
const __VLS_2728 = __VLS_2727({
    label: "清除WebView数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_2727));
const { default: __VLS_2731 } = __VLS_2729.slots;
let __VLS_2732;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2733 = __VLS_asFunctionalComponent1(__VLS_2732, new __VLS_2732({
    modelValue: (__VLS_ctx.app.clearWebViewData),
}));
const __VLS_2734 = __VLS_2733({
    modelValue: (__VLS_ctx.app.clearWebViewData),
}, ...__VLS_functionalComponentArgsRest(__VLS_2733));
// @ts-ignore
[app,];
var __VLS_2729;
let __VLS_2737;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2738 = __VLS_asFunctionalComponent1(__VLS_2737, new __VLS_2737({
    label: "上传规则",
}));
const __VLS_2739 = __VLS_2738({
    label: "上传规则",
}, ...__VLS_functionalComponentArgsRest(__VLS_2738));
const { default: __VLS_2742 } = __VLS_2740.slots;
let __VLS_2743;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2744 = __VLS_asFunctionalComponent1(__VLS_2743, new __VLS_2743({
    modelValue: (__VLS_ctx.app.uploadRule),
}));
const __VLS_2745 = __VLS_2744({
    modelValue: (__VLS_ctx.app.uploadRule),
}, ...__VLS_functionalComponentArgsRest(__VLS_2744));
// @ts-ignore
[app,];
var __VLS_2740;
let __VLS_2748;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2749 = __VLS_asFunctionalComponent1(__VLS_2748, new __VLS_2748({
    label: "校验源",
}));
const __VLS_2750 = __VLS_2749({
    label: "校验源",
}, ...__VLS_functionalComponentArgsRest(__VLS_2749));
const { default: __VLS_2753 } = __VLS_2751.slots;
let __VLS_2754;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2755 = __VLS_asFunctionalComponent1(__VLS_2754, new __VLS_2754({
    modelValue: (__VLS_ctx.app.checkSource),
}));
const __VLS_2756 = __VLS_2755({
    modelValue: (__VLS_ctx.app.checkSource),
}, ...__VLS_functionalComponentArgsRest(__VLS_2755));
// @ts-ignore
[app,];
var __VLS_2751;
let __VLS_2759;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2760 = __VLS_asFunctionalComponent1(__VLS_2759, new __VLS_2759({
    label: "显示加入书架提示",
}));
const __VLS_2761 = __VLS_2760({
    label: "显示加入书架提示",
}, ...__VLS_functionalComponentArgsRest(__VLS_2760));
const { default: __VLS_2764 } = __VLS_2762.slots;
let __VLS_2765;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2766 = __VLS_asFunctionalComponent1(__VLS_2765, new __VLS_2765({
    modelValue: (__VLS_ctx.app.showAddToShelfAlert),
}));
const __VLS_2767 = __VLS_2766({
    modelValue: (__VLS_ctx.app.showAddToShelfAlert),
}, ...__VLS_functionalComponentArgsRest(__VLS_2766));
// @ts-ignore
[app,];
var __VLS_2762;
// @ts-ignore
[];
var __VLS_2645;
// @ts-ignore
[];
var __VLS_2639;
let __VLS_2770;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_2771 = __VLS_asFunctionalComponent1(__VLS_2770, new __VLS_2770({
    label: "编辑器",
    name: "editor",
}));
const __VLS_2772 = __VLS_2771({
    label: "编辑器",
    name: "editor",
}, ...__VLS_functionalComponentArgsRest(__VLS_2771));
const { default: __VLS_2775 } = __VLS_2773.slots;
let __VLS_2776;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_2777 = __VLS_asFunctionalComponent1(__VLS_2776, new __VLS_2776({
    labelWidth: "180px",
}));
const __VLS_2778 = __VLS_2777({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_2777));
const { default: __VLS_2781 } = __VLS_2779.slots;
let __VLS_2782;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2783 = __VLS_asFunctionalComponent1(__VLS_2782, new __VLS_2782({
    contentPosition: "left",
}));
const __VLS_2784 = __VLS_2783({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2783));
const { default: __VLS_2787 } = __VLS_2785.slots;
// @ts-ignore
[];
var __VLS_2785;
let __VLS_2788;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2789 = __VLS_asFunctionalComponent1(__VLS_2788, new __VLS_2788({
    label: "编辑器字号",
}));
const __VLS_2790 = __VLS_2789({
    label: "编辑器字号",
}, ...__VLS_functionalComponentArgsRest(__VLS_2789));
const { default: __VLS_2793 } = __VLS_2791.slots;
let __VLS_2794;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_2795 = __VLS_asFunctionalComponent1(__VLS_2794, new __VLS_2794({
    modelValue: (__VLS_ctx.app.editFontScale),
    min: (8),
    max: (32),
}));
const __VLS_2796 = __VLS_2795({
    modelValue: (__VLS_ctx.app.editFontScale),
    min: (8),
    max: (32),
}, ...__VLS_functionalComponentArgsRest(__VLS_2795));
// @ts-ignore
[app,];
var __VLS_2791;
let __VLS_2799;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2800 = __VLS_asFunctionalComponent1(__VLS_2799, new __VLS_2799({
    label: "非打印字符显示",
}));
const __VLS_2801 = __VLS_2800({
    label: "非打印字符显示",
}, ...__VLS_functionalComponentArgsRest(__VLS_2800));
const { default: __VLS_2804 } = __VLS_2802.slots;
let __VLS_2805;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_2806 = __VLS_asFunctionalComponent1(__VLS_2805, new __VLS_2805({
    modelValue: (__VLS_ctx.app.editNonPrintable),
    min: (0),
    max: (3),
}));
const __VLS_2807 = __VLS_2806({
    modelValue: (__VLS_ctx.app.editNonPrintable),
    min: (0),
    max: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_2806));
// @ts-ignore
[app,];
var __VLS_2802;
let __VLS_2810;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2811 = __VLS_asFunctionalComponent1(__VLS_2810, new __VLS_2810({
    label: "自动换行",
}));
const __VLS_2812 = __VLS_2811({
    label: "自动换行",
}, ...__VLS_functionalComponentArgsRest(__VLS_2811));
const { default: __VLS_2815 } = __VLS_2813.slots;
let __VLS_2816;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2817 = __VLS_asFunctionalComponent1(__VLS_2816, new __VLS_2816({
    modelValue: (__VLS_ctx.app.editAutoWrap),
}));
const __VLS_2818 = __VLS_2817({
    modelValue: (__VLS_ctx.app.editAutoWrap),
}, ...__VLS_functionalComponentArgsRest(__VLS_2817));
// @ts-ignore
[app,];
var __VLS_2813;
let __VLS_2821;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2822 = __VLS_asFunctionalComponent1(__VLS_2821, new __VLS_2821({
    label: "自动补全",
}));
const __VLS_2823 = __VLS_2822({
    label: "自动补全",
}, ...__VLS_functionalComponentArgsRest(__VLS_2822));
const { default: __VLS_2826 } = __VLS_2824.slots;
let __VLS_2827;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2828 = __VLS_asFunctionalComponent1(__VLS_2827, new __VLS_2827({
    modelValue: (__VLS_ctx.app.editAutoComplete),
}));
const __VLS_2829 = __VLS_2828({
    modelValue: (__VLS_ctx.app.editAutoComplete),
}, ...__VLS_functionalComponentArgsRest(__VLS_2828));
// @ts-ignore
[app,];
var __VLS_2824;
let __VLS_2832;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2833 = __VLS_asFunctionalComponent1(__VLS_2832, new __VLS_2832({
    label: "显示行号",
}));
const __VLS_2834 = __VLS_2833({
    label: "显示行号",
}, ...__VLS_functionalComponentArgsRest(__VLS_2833));
const { default: __VLS_2837 } = __VLS_2835.slots;
let __VLS_2838;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_2839 = __VLS_asFunctionalComponent1(__VLS_2838, new __VLS_2838({
    modelValue: (__VLS_ctx.app.showBoardLine),
}));
const __VLS_2840 = __VLS_2839({
    modelValue: (__VLS_ctx.app.showBoardLine),
}, ...__VLS_functionalComponentArgsRest(__VLS_2839));
const { default: __VLS_2843 } = __VLS_2841.slots;
let __VLS_2844;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_2845 = __VLS_asFunctionalComponent1(__VLS_2844, new __VLS_2844({
    value: (0),
    label: "不显示",
}));
const __VLS_2846 = __VLS_2845({
    value: (0),
    label: "不显示",
}, ...__VLS_functionalComponentArgsRest(__VLS_2845));
let __VLS_2849;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_2850 = __VLS_asFunctionalComponent1(__VLS_2849, new __VLS_2849({
    value: (1),
    label: "显示",
}));
const __VLS_2851 = __VLS_2850({
    value: (1),
    label: "显示",
}, ...__VLS_functionalComponentArgsRest(__VLS_2850));
// @ts-ignore
[app,];
var __VLS_2841;
// @ts-ignore
[];
var __VLS_2835;
let __VLS_2854;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2855 = __VLS_asFunctionalComponent1(__VLS_2854, new __VLS_2854({
    label: "最大行数",
}));
const __VLS_2856 = __VLS_2855({
    label: "最大行数",
}, ...__VLS_functionalComponentArgsRest(__VLS_2855));
const { default: __VLS_2859 } = __VLS_2857.slots;
let __VLS_2860;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_2861 = __VLS_asFunctionalComponent1(__VLS_2860, new __VLS_2860({
    modelValue: (__VLS_ctx.app.sourceEditMaxLine),
    min: (10),
    max: (9999),
}));
const __VLS_2862 = __VLS_2861({
    modelValue: (__VLS_ctx.app.sourceEditMaxLine),
    min: (10),
    max: (9999),
}, ...__VLS_functionalComponentArgsRest(__VLS_2861));
// @ts-ignore
[app,];
var __VLS_2857;
let __VLS_2865;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2866 = __VLS_asFunctionalComponent1(__VLS_2865, new __VLS_2865({
    label: "字体文件夹",
}));
const __VLS_2867 = __VLS_2866({
    label: "字体文件夹",
}, ...__VLS_functionalComponentArgsRest(__VLS_2866));
const { default: __VLS_2870 } = __VLS_2868.slots;
let __VLS_2871;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_2872 = __VLS_asFunctionalComponent1(__VLS_2871, new __VLS_2871({
    modelValue: (__VLS_ctx.app.fontFolder),
}));
const __VLS_2873 = __VLS_2872({
    modelValue: (__VLS_ctx.app.fontFolder),
}, ...__VLS_functionalComponentArgsRest(__VLS_2872));
// @ts-ignore
[app,];
var __VLS_2868;
// @ts-ignore
[];
var __VLS_2779;
// @ts-ignore
[];
var __VLS_2773;
let __VLS_2876;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_2877 = __VLS_asFunctionalComponent1(__VLS_2876, new __VLS_2876({
    label: "系统",
    name: "system",
}));
const __VLS_2878 = __VLS_2877({
    label: "系统",
    name: "system",
}, ...__VLS_functionalComponentArgsRest(__VLS_2877));
const { default: __VLS_2881 } = __VLS_2879.slots;
let __VLS_2882;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2883 = __VLS_asFunctionalComponent1(__VLS_2882, new __VLS_2882({
    contentPosition: "left",
}));
const __VLS_2884 = __VLS_2883({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2883));
const { default: __VLS_2887 } = __VLS_2885.slots;
// @ts-ignore
[];
var __VLS_2885;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cache-info" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.cacheStore.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['cache-info']} */ ;
let __VLS_2888;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components['el-descriptions'] | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components['el-descriptions']} */
elDescriptions;
// @ts-ignore
const __VLS_2889 = __VLS_asFunctionalComponent1(__VLS_2888, new __VLS_2888({
    column: (4),
    border: true,
    size: "small",
}));
const __VLS_2890 = __VLS_2889({
    column: (4),
    border: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_2889));
const { default: __VLS_2893 } = __VLS_2891.slots;
let __VLS_2894;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_2895 = __VLS_asFunctionalComponent1(__VLS_2894, new __VLS_2894({
    label: "缓存总大小",
}));
const __VLS_2896 = __VLS_2895({
    label: "缓存总大小",
}, ...__VLS_functionalComponentArgsRest(__VLS_2895));
const { default: __VLS_2899 } = __VLS_2897.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "cache-size" },
});
/** @type {__VLS_StyleScopedClasses['cache-size']} */ ;
(__VLS_ctx.cacheStore.formatSize(__VLS_ctx.cacheStore.cacheSize.totalSize));
// @ts-ignore
[vLoading, cacheStore, cacheStore, cacheStore,];
var __VLS_2897;
let __VLS_2900;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_2901 = __VLS_asFunctionalComponent1(__VLS_2900, new __VLS_2900({
    label: "缓存章节数",
}));
const __VLS_2902 = __VLS_2901({
    label: "缓存章节数",
}, ...__VLS_functionalComponentArgsRest(__VLS_2901));
const { default: __VLS_2905 } = __VLS_2903.slots;
(__VLS_ctx.cacheStore.cacheSize.chapterCount);
// @ts-ignore
[cacheStore,];
var __VLS_2903;
let __VLS_2906;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_2907 = __VLS_asFunctionalComponent1(__VLS_2906, new __VLS_2906({
    label: "书籍总数",
}));
const __VLS_2908 = __VLS_2907({
    label: "书籍总数",
}, ...__VLS_functionalComponentArgsRest(__VLS_2907));
const { default: __VLS_2911 } = __VLS_2909.slots;
(__VLS_ctx.cacheStore.cacheSize.bookCount);
// @ts-ignore
[cacheStore,];
var __VLS_2909;
let __VLS_2912;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_2913 = __VLS_asFunctionalComponent1(__VLS_2912, new __VLS_2912({
    label: "书源总数",
}));
const __VLS_2914 = __VLS_2913({
    label: "书源总数",
}, ...__VLS_functionalComponentArgsRest(__VLS_2913));
const { default: __VLS_2917 } = __VLS_2915.slots;
(__VLS_ctx.cacheStore.cacheSize.sourceCount);
// @ts-ignore
[cacheStore,];
var __VLS_2915;
// @ts-ignore
[];
var __VLS_2891;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cache-actions" },
});
/** @type {__VLS_StyleScopedClasses['cache-actions']} */ ;
let __VLS_2918;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2919 = __VLS_asFunctionalComponent1(__VLS_2918, new __VLS_2918({
    ...{ 'onClick': {} },
}));
const __VLS_2920 = __VLS_2919({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_2919));
let __VLS_2923;
const __VLS_2924 = {
    /** @type {typeof __VLS_2923.click} */
    onClick: (__VLS_ctx.cacheStore.loadCacheSize),
};
const { default: __VLS_2925 } = __VLS_2921.slots;
// @ts-ignore
[cacheStore,];
var __VLS_2921;
var __VLS_2922;
let __VLS_2926;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2927 = __VLS_asFunctionalComponent1(__VLS_2926, new __VLS_2926({
    ...{ 'onClick': {} },
    type: "warning",
    loading: (__VLS_ctx.cacheStore.clearing),
}));
const __VLS_2928 = __VLS_2927({
    ...{ 'onClick': {} },
    type: "warning",
    loading: (__VLS_ctx.cacheStore.clearing),
}, ...__VLS_functionalComponentArgsRest(__VLS_2927));
let __VLS_2931;
const __VLS_2932 = {
    /** @type {typeof __VLS_2931.click} */
    onClick: (__VLS_ctx.handleClearContentCache),
};
const { default: __VLS_2933 } = __VLS_2929.slots;
// @ts-ignore
[cacheStore, handleClearContentCache,];
var __VLS_2929;
var __VLS_2930;
let __VLS_2934;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_2935 = __VLS_asFunctionalComponent1(__VLS_2934, new __VLS_2934({
    ...{ 'onClick': {} },
    type: "danger",
    loading: (__VLS_ctx.cacheStore.clearing),
}));
const __VLS_2936 = __VLS_2935({
    ...{ 'onClick': {} },
    type: "danger",
    loading: (__VLS_ctx.cacheStore.clearing),
}, ...__VLS_functionalComponentArgsRest(__VLS_2935));
let __VLS_2939;
const __VLS_2940 = {
    /** @type {typeof __VLS_2939.click} */
    onClick: (__VLS_ctx.handleClearAllCache),
};
const { default: __VLS_2941 } = __VLS_2937.slots;
// @ts-ignore
[cacheStore, handleClearAllCache,];
var __VLS_2937;
var __VLS_2938;
let __VLS_2942;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_2943 = __VLS_asFunctionalComponent1(__VLS_2942, new __VLS_2942({
    labelWidth: "180px",
}));
const __VLS_2944 = __VLS_2943({
    labelWidth: "180px",
}, ...__VLS_functionalComponentArgsRest(__VLS_2943));
const { default: __VLS_2947 } = __VLS_2945.slots;
let __VLS_2948;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2949 = __VLS_asFunctionalComponent1(__VLS_2948, new __VLS_2948({
    contentPosition: "left",
}));
const __VLS_2950 = __VLS_2949({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2949));
const { default: __VLS_2953 } = __VLS_2951.slots;
// @ts-ignore
[];
var __VLS_2951;
let __VLS_2954;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2955 = __VLS_asFunctionalComponent1(__VLS_2954, new __VLS_2954({
    label: "自动清除过期缓存",
}));
const __VLS_2956 = __VLS_2955({
    label: "自动清除过期缓存",
}, ...__VLS_functionalComponentArgsRest(__VLS_2955));
const { default: __VLS_2959 } = __VLS_2957.slots;
let __VLS_2960;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2961 = __VLS_asFunctionalComponent1(__VLS_2960, new __VLS_2960({
    modelValue: (__VLS_ctx.app.autoClearExpired),
}));
const __VLS_2962 = __VLS_2961({
    modelValue: (__VLS_ctx.app.autoClearExpired),
}, ...__VLS_functionalComponentArgsRest(__VLS_2961));
// @ts-ignore
[app,];
var __VLS_2957;
let __VLS_2965;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2966 = __VLS_asFunctionalComponent1(__VLS_2965, new __VLS_2965({
    label: "清除缓存",
}));
const __VLS_2967 = __VLS_2966({
    label: "清除缓存",
}, ...__VLS_functionalComponentArgsRest(__VLS_2966));
const { default: __VLS_2970 } = __VLS_2968.slots;
let __VLS_2971;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2972 = __VLS_asFunctionalComponent1(__VLS_2971, new __VLS_2971({
    modelValue: (__VLS_ctx.app.cleanCache),
}));
const __VLS_2973 = __VLS_2972({
    modelValue: (__VLS_ctx.app.cleanCache),
}, ...__VLS_functionalComponentArgsRest(__VLS_2972));
// @ts-ignore
[app,];
var __VLS_2968;
let __VLS_2976;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2977 = __VLS_asFunctionalComponent1(__VLS_2976, new __VLS_2976({
    label: "压缩数据库",
}));
const __VLS_2978 = __VLS_2977({
    label: "压缩数据库",
}, ...__VLS_functionalComponentArgsRest(__VLS_2977));
const { default: __VLS_2981 } = __VLS_2979.slots;
let __VLS_2982;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2983 = __VLS_asFunctionalComponent1(__VLS_2982, new __VLS_2982({
    modelValue: (__VLS_ctx.app.shrinkDatabase),
}));
const __VLS_2984 = __VLS_2983({
    modelValue: (__VLS_ctx.app.shrinkDatabase),
}, ...__VLS_functionalComponentArgsRest(__VLS_2983));
// @ts-ignore
[app,];
var __VLS_2979;
let __VLS_2987;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_2988 = __VLS_asFunctionalComponent1(__VLS_2987, new __VLS_2987({
    label: "记录堆转储",
}));
const __VLS_2989 = __VLS_2988({
    label: "记录堆转储",
}, ...__VLS_functionalComponentArgsRest(__VLS_2988));
const { default: __VLS_2992 } = __VLS_2990.slots;
let __VLS_2993;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_2994 = __VLS_asFunctionalComponent1(__VLS_2993, new __VLS_2993({
    modelValue: (__VLS_ctx.app.recordHeapDump),
}));
const __VLS_2995 = __VLS_2994({
    modelValue: (__VLS_ctx.app.recordHeapDump),
}, ...__VLS_functionalComponentArgsRest(__VLS_2994));
// @ts-ignore
[app,];
var __VLS_2990;
let __VLS_2998;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_2999 = __VLS_asFunctionalComponent1(__VLS_2998, new __VLS_2998({
    contentPosition: "left",
}));
const __VLS_3000 = __VLS_2999({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_2999));
const { default: __VLS_3003 } = __VLS_3001.slots;
// @ts-ignore
[];
var __VLS_3001;
let __VLS_3004;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3005 = __VLS_asFunctionalComponent1(__VLS_3004, new __VLS_3004({
    label: "更新变体",
}));
const __VLS_3006 = __VLS_3005({
    label: "更新变体",
}, ...__VLS_functionalComponentArgsRest(__VLS_3005));
const { default: __VLS_3009 } = __VLS_3007.slots;
let __VLS_3010;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_3011 = __VLS_asFunctionalComponent1(__VLS_3010, new __VLS_3010({
    modelValue: (__VLS_ctx.app.updateToVariant),
}));
const __VLS_3012 = __VLS_3011({
    modelValue: (__VLS_ctx.app.updateToVariant),
}, ...__VLS_functionalComponentArgsRest(__VLS_3011));
const { default: __VLS_3015 } = __VLS_3013.slots;
let __VLS_3016;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_3017 = __VLS_asFunctionalComponent1(__VLS_3016, new __VLS_3016({
    value: "default_version",
    label: "默认版本",
}));
const __VLS_3018 = __VLS_3017({
    value: "default_version",
    label: "默认版本",
}, ...__VLS_functionalComponentArgsRest(__VLS_3017));
let __VLS_3021;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_3022 = __VLS_asFunctionalComponent1(__VLS_3021, new __VLS_3021({
    value: "beta",
    label: "测试版",
}));
const __VLS_3023 = __VLS_3022({
    value: "beta",
    label: "测试版",
}, ...__VLS_functionalComponentArgsRest(__VLS_3022));
// @ts-ignore
[app,];
var __VLS_3013;
// @ts-ignore
[];
var __VLS_3007;
let __VLS_3026;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3027 = __VLS_asFunctionalComponent1(__VLS_3026, new __VLS_3026({
    label: "启用审查",
}));
const __VLS_3028 = __VLS_3027({
    label: "启用审查",
}, ...__VLS_functionalComponentArgsRest(__VLS_3027));
const { default: __VLS_3031 } = __VLS_3029.slots;
let __VLS_3032;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_3033 = __VLS_asFunctionalComponent1(__VLS_3032, new __VLS_3032({
    modelValue: (__VLS_ctx.app.enableReview),
}));
const __VLS_3034 = __VLS_3033({
    modelValue: (__VLS_ctx.app.enableReview),
}, ...__VLS_functionalComponentArgsRest(__VLS_3033));
// @ts-ignore
[app,];
var __VLS_3029;
let __VLS_3037;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_3038 = __VLS_asFunctionalComponent1(__VLS_3037, new __VLS_3037({
    contentPosition: "left",
}));
const __VLS_3039 = __VLS_3038({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_3038));
const { default: __VLS_3042 } = __VLS_3040.slots;
// @ts-ignore
[];
var __VLS_3040;
let __VLS_3043;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3044 = __VLS_asFunctionalComponent1(__VLS_3043, new __VLS_3043({
    label: "自定义欢迎页",
}));
const __VLS_3045 = __VLS_3044({
    label: "自定义欢迎页",
}, ...__VLS_functionalComponentArgsRest(__VLS_3044));
const { default: __VLS_3048 } = __VLS_3046.slots;
let __VLS_3049;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_3050 = __VLS_asFunctionalComponent1(__VLS_3049, new __VLS_3049({
    modelValue: (__VLS_ctx.app.customWelcome),
}));
const __VLS_3051 = __VLS_3050({
    modelValue: (__VLS_ctx.app.customWelcome),
}, ...__VLS_functionalComponentArgsRest(__VLS_3050));
// @ts-ignore
[app,];
var __VLS_3046;
let __VLS_3054;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3055 = __VLS_asFunctionalComponent1(__VLS_3054, new __VLS_3054({
    label: "欢迎页显示时间(秒)",
}));
const __VLS_3056 = __VLS_3055({
    label: "欢迎页显示时间(秒)",
}, ...__VLS_functionalComponentArgsRest(__VLS_3055));
const { default: __VLS_3059 } = __VLS_3057.slots;
let __VLS_3060;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_3061 = __VLS_asFunctionalComponent1(__VLS_3060, new __VLS_3060({
    modelValue: (__VLS_ctx.app.welcomeShowTime),
    min: (0),
    max: (30),
}));
const __VLS_3062 = __VLS_3061({
    modelValue: (__VLS_ctx.app.welcomeShowTime),
    min: (0),
    max: (30),
}, ...__VLS_functionalComponentArgsRest(__VLS_3061));
// @ts-ignore
[app,];
var __VLS_3057;
let __VLS_3065;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3066 = __VLS_asFunctionalComponent1(__VLS_3065, new __VLS_3065({
    label: "欢迎页图片",
}));
const __VLS_3067 = __VLS_3066({
    label: "欢迎页图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_3066));
const { default: __VLS_3070 } = __VLS_3068.slots;
let __VLS_3071;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_3072 = __VLS_asFunctionalComponent1(__VLS_3071, new __VLS_3071({
    modelValue: (__VLS_ctx.app.welcomeImagePath),
}));
const __VLS_3073 = __VLS_3072({
    modelValue: (__VLS_ctx.app.welcomeImagePath),
}, ...__VLS_functionalComponentArgsRest(__VLS_3072));
// @ts-ignore
[app,];
var __VLS_3068;
let __VLS_3076;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3077 = __VLS_asFunctionalComponent1(__VLS_3076, new __VLS_3076({
    label: "夜间欢迎页图片",
}));
const __VLS_3078 = __VLS_3077({
    label: "夜间欢迎页图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_3077));
const { default: __VLS_3081 } = __VLS_3079.slots;
let __VLS_3082;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_3083 = __VLS_asFunctionalComponent1(__VLS_3082, new __VLS_3082({
    modelValue: (__VLS_ctx.app.welcomeImagePathDark),
}));
const __VLS_3084 = __VLS_3083({
    modelValue: (__VLS_ctx.app.welcomeImagePathDark),
}, ...__VLS_functionalComponentArgsRest(__VLS_3083));
// @ts-ignore
[app,];
var __VLS_3079;
let __VLS_3087;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3088 = __VLS_asFunctionalComponent1(__VLS_3087, new __VLS_3087({
    label: "显示欢迎文字",
}));
const __VLS_3089 = __VLS_3088({
    label: "显示欢迎文字",
}, ...__VLS_functionalComponentArgsRest(__VLS_3088));
const { default: __VLS_3092 } = __VLS_3090.slots;
let __VLS_3093;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_3094 = __VLS_asFunctionalComponent1(__VLS_3093, new __VLS_3093({
    modelValue: (__VLS_ctx.app.welcomeShowText),
}));
const __VLS_3095 = __VLS_3094({
    modelValue: (__VLS_ctx.app.welcomeShowText),
}, ...__VLS_functionalComponentArgsRest(__VLS_3094));
// @ts-ignore
[app,];
var __VLS_3090;
let __VLS_3098;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3099 = __VLS_asFunctionalComponent1(__VLS_3098, new __VLS_3098({
    label: "夜间显示文字",
}));
const __VLS_3100 = __VLS_3099({
    label: "夜间显示文字",
}, ...__VLS_functionalComponentArgsRest(__VLS_3099));
const { default: __VLS_3103 } = __VLS_3101.slots;
let __VLS_3104;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_3105 = __VLS_asFunctionalComponent1(__VLS_3104, new __VLS_3104({
    modelValue: (__VLS_ctx.app.welcomeShowTextDark),
}));
const __VLS_3106 = __VLS_3105({
    modelValue: (__VLS_ctx.app.welcomeShowTextDark),
}, ...__VLS_functionalComponentArgsRest(__VLS_3105));
// @ts-ignore
[app,];
var __VLS_3101;
let __VLS_3109;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3110 = __VLS_asFunctionalComponent1(__VLS_3109, new __VLS_3109({
    label: "显示图标",
}));
const __VLS_3111 = __VLS_3110({
    label: "显示图标",
}, ...__VLS_functionalComponentArgsRest(__VLS_3110));
const { default: __VLS_3114 } = __VLS_3112.slots;
let __VLS_3115;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_3116 = __VLS_asFunctionalComponent1(__VLS_3115, new __VLS_3115({
    modelValue: (__VLS_ctx.app.welcomeShowIcon),
}));
const __VLS_3117 = __VLS_3116({
    modelValue: (__VLS_ctx.app.welcomeShowIcon),
}, ...__VLS_functionalComponentArgsRest(__VLS_3116));
// @ts-ignore
[app,];
var __VLS_3112;
let __VLS_3120;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3121 = __VLS_asFunctionalComponent1(__VLS_3120, new __VLS_3120({
    label: "夜间显示图标",
}));
const __VLS_3122 = __VLS_3121({
    label: "夜间显示图标",
}, ...__VLS_functionalComponentArgsRest(__VLS_3121));
const { default: __VLS_3125 } = __VLS_3123.slots;
let __VLS_3126;
/** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
elSwitch;
// @ts-ignore
const __VLS_3127 = __VLS_asFunctionalComponent1(__VLS_3126, new __VLS_3126({
    modelValue: (__VLS_ctx.app.welcomeShowIconDark),
}));
const __VLS_3128 = __VLS_3127({
    modelValue: (__VLS_ctx.app.welcomeShowIconDark),
}, ...__VLS_functionalComponentArgsRest(__VLS_3127));
// @ts-ignore
[app,];
var __VLS_3123;
let __VLS_3131;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3132 = __VLS_asFunctionalComponent1(__VLS_3131, new __VLS_3131({
    label: "启动器图标",
}));
const __VLS_3133 = __VLS_3132({
    label: "启动器图标",
}, ...__VLS_functionalComponentArgsRest(__VLS_3132));
const { default: __VLS_3136 } = __VLS_3134.slots;
let __VLS_3137;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_3138 = __VLS_asFunctionalComponent1(__VLS_3137, new __VLS_3137({
    modelValue: (__VLS_ctx.app.launcherIcon),
}));
const __VLS_3139 = __VLS_3138({
    modelValue: (__VLS_ctx.app.launcherIcon),
}, ...__VLS_functionalComponentArgsRest(__VLS_3138));
// @ts-ignore
[app,];
var __VLS_3134;
let __VLS_3142;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_3143 = __VLS_asFunctionalComponent1(__VLS_3142, new __VLS_3142({
    contentPosition: "left",
}));
const __VLS_3144 = __VLS_3143({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_3143));
const { default: __VLS_3147 } = __VLS_3145.slots;
// @ts-ignore
[];
var __VLS_3145;
let __VLS_3148;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3149 = __VLS_asFunctionalComponent1(__VLS_3148, new __VLS_3148({
    label: "屏幕方向",
}));
const __VLS_3150 = __VLS_3149({
    label: "屏幕方向",
}, ...__VLS_functionalComponentArgsRest(__VLS_3149));
const { default: __VLS_3153 } = __VLS_3151.slots;
let __VLS_3154;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_3155 = __VLS_asFunctionalComponent1(__VLS_3154, new __VLS_3154({
    modelValue: (__VLS_ctx.app.screenOrientation),
}));
const __VLS_3156 = __VLS_3155({
    modelValue: (__VLS_ctx.app.screenOrientation),
}, ...__VLS_functionalComponentArgsRest(__VLS_3155));
const { default: __VLS_3159 } = __VLS_3157.slots;
let __VLS_3160;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_3161 = __VLS_asFunctionalComponent1(__VLS_3160, new __VLS_3160({
    value: "",
    label: "跟随系统",
}));
const __VLS_3162 = __VLS_3161({
    value: "",
    label: "跟随系统",
}, ...__VLS_functionalComponentArgsRest(__VLS_3161));
let __VLS_3165;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_3166 = __VLS_asFunctionalComponent1(__VLS_3165, new __VLS_3165({
    value: "portrait",
    label: "竖屏",
}));
const __VLS_3167 = __VLS_3166({
    value: "portrait",
    label: "竖屏",
}, ...__VLS_functionalComponentArgsRest(__VLS_3166));
let __VLS_3170;
/** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
elOption;
// @ts-ignore
const __VLS_3171 = __VLS_asFunctionalComponent1(__VLS_3170, new __VLS_3170({
    value: "landscape",
    label: "横屏",
}));
const __VLS_3172 = __VLS_3171({
    value: "landscape",
    label: "横屏",
}, ...__VLS_functionalComponentArgsRest(__VLS_3171));
// @ts-ignore
[app,];
var __VLS_3157;
// @ts-ignore
[];
var __VLS_3151;
let __VLS_3175;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_3176 = __VLS_asFunctionalComponent1(__VLS_3175, new __VLS_3175({
    label: "视频设置",
}));
const __VLS_3177 = __VLS_3176({
    label: "视频设置",
}, ...__VLS_functionalComponentArgsRest(__VLS_3176));
const { default: __VLS_3180 } = __VLS_3178.slots;
let __VLS_3181;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_3182 = __VLS_asFunctionalComponent1(__VLS_3181, new __VLS_3181({
    modelValue: (__VLS_ctx.app.videoSetting),
}));
const __VLS_3183 = __VLS_3182({
    modelValue: (__VLS_ctx.app.videoSetting),
}, ...__VLS_functionalComponentArgsRest(__VLS_3182));
// @ts-ignore
[app,];
var __VLS_3178;
// @ts-ignore
[];
var __VLS_2945;
// @ts-ignore
[];
var __VLS_2879;
let __VLS_3186;
/** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
elTabPane;
// @ts-ignore
const __VLS_3187 = __VLS_asFunctionalComponent1(__VLS_3186, new __VLS_3186({
    label: "系统操作",
    name: "systemActions",
}));
const __VLS_3188 = __VLS_3187({
    label: "系统操作",
    name: "systemActions",
}, ...__VLS_functionalComponentArgsRest(__VLS_3187));
const { default: __VLS_3191 } = __VLS_3189.slots;
const __VLS_3192 = SystemActions;
// @ts-ignore
const __VLS_3193 = __VLS_asFunctionalComponent1(__VLS_3192, new __VLS_3192({}));
const __VLS_3194 = __VLS_3193({}, ...__VLS_functionalComponentArgsRest(__VLS_3193));
// @ts-ignore
[];
var __VLS_3189;
// @ts-ignore
[];
var __VLS_37;
const __VLS_3197 = ReadStyleEditor;
// @ts-ignore
const __VLS_3198 = __VLS_asFunctionalComponent1(__VLS_3197, new __VLS_3197({
    modelValue: (__VLS_ctx.readStyleVisible),
}));
const __VLS_3199 = __VLS_3198({
    modelValue: (__VLS_ctx.readStyleVisible),
}, ...__VLS_functionalComponentArgsRest(__VLS_3198));
// @ts-ignore
[readStyleVisible,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
