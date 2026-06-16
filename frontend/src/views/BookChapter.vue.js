/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import jump from '@/plugins/jump';
import settings from '@/config/themeConfig';
import API from '@api';
import { useLoading } from '@/hooks/loading';
import { useThrottleFn } from '@vueuse/shared';
import { isNullOrBlank } from '@/utils/utils';
const content = ref();
// loading spinner
const { isLoading, loadingWrapper } = useLoading(content, '正在获取信息');
const store = useBookStore();
/** 用户自定义翻页按键码(对齐 Android prevKeyCodes/nextKeyCodes),逗号分隔键名已解析为数组 */
const customPrevKeys = ref([]);
const customNextKeys = ref([]);
const { catalog, popCataVisible, readSettingsVisible, miniInterface, showContent, bookProgress, theme, isNight, } = storeToRefs(store);
const chapterPos = computed({
    get: () => store.readingBook.chapterPos,
    set: value => (store.readingBook.chapterPos = value),
});
const chapterIndex = computed({
    get: () => store.readingBook.chapterIndex,
    set: value => (store.readingBook.chapterIndex = value),
});
const isSeachBook = computed({
    get: () => store.readingBook.isSeachBook,
    set: value => (store.readingBook.isSeachBook = value),
});
// 当前阅读书籍readingBook持久化
watch(() => store.readingBook, book => {
    // 保存localStorage
    // localStorage.setItem(book.bookUrl, JSON.stringify(book));
    // 最近阅读
    localStorage.setItem('readingRecent', JSON.stringify(book));
    //保存 sessionStorage
    sessionStorage.setItem('chapterIndex', book.chapterIndex.toString());
    sessionStorage.setItem('chapterPos', book.chapterPos.toString());
}, { deep: 1 });
// 无限滚动
const infiniteLoading = computed(() => store.config.infiniteLoading);
let scrollObserver;
const loading = ref();
watchEffect(() => {
    if (!infiniteLoading.value) {
        scrollObserver?.disconnect();
    }
    else {
        scrollObserver?.observe(loading.value);
    }
});
const loadMore = () => {
    const index = chapterData.value.slice(-1)[0].index;
    if (catalog.value.length - 1 > index) {
        getContent(index + 1, false);
        store.saveBookProgress(); // 保存的是上一章的进度，不是预载的本章进度
    }
};
// IntersectionObserver回调 底部加载
const onReachBottom = (entries) => {
    if (isLoading.value)
        return;
    for (const { isIntersecting } of entries) {
        if (!isIntersecting)
            return;
        loadMore();
    }
};
// 字体
const fontFamily = computed(() => {
    if (store.config.font >= 0) {
        return settings.fonts[store.config.font];
    }
    return store.config.customFontName;
});
const fontSize = computed(() => {
    return store.config.fontSize + 'px';
});
// 主题部分
const bodyColor = computed(() => settings.themes[theme.value].body);
const chapterColor = computed(() => settings.themes[theme.value].content);
const popupColor = computed(() => settings.themes[theme.value].popup);
const readWidth = computed(() => {
    if (!miniInterface.value) {
        return store.config.readWidth - 130 + 'px';
    }
    else {
        return window.innerWidth + 'px';
    }
});
const popupWidth = computed(() => {
    if (!miniInterface.value) {
        return store.config.readWidth - 33;
    }
    else {
        return window.innerWidth - 33;
    }
});
const bodyTheme = computed(() => {
    return {
        background: bodyColor.value,
    };
});
const chapterTheme = computed(() => {
    return {
        background: chapterColor.value,
        width: readWidth.value,
    };
});
const showToolBar = ref(false);
const leftBarTheme = computed(() => {
    return {
        background: popupColor.value,
        marginLeft: miniInterface.value
            ? 0
            : -(store.config.readWidth / 2 + 68) + 'px',
        display: miniInterface.value && !showToolBar.value ? 'none' : 'block',
    };
});
const rightBarTheme = computed(() => {
    return {
        background: popupColor.value,
        marginRight: miniInterface.value
            ? 0
            : -(store.config.readWidth / 2 + 52) + 'px',
        display: miniInterface.value && !showToolBar.value ? 'none' : 'block',
    };
});
/**
 * pc移动端判断 最大阅读宽度修正
 * 阅读宽度最小为640px 加上工具栏 68px 52px 取较大值 为 776px
 */
const onResize = () => {
    store.setMiniInterface(window.innerWidth < 776);
    const width = store.config.readWidth; /**包含padding */
    checkPageWidth(width);
};
/** 判断阅读宽度是否超出页面或者低于默认值640 */
const checkPageWidth = (readWidth) => {
    if (store.miniInterface)
        return;
    if (readWidth < 640)
        store.config.readWidth = 640;
    if (readWidth + 2 * 68 > window.innerWidth)
        store.config.readWidth -= 160;
};
watch(() => store.config.readWidth, width => checkPageWidth(width));
// 顶部底部跳转
const top = ref();
const bottom = ref();
const toTop = () => {
    jump(top.value);
};
const toBottom = () => {
    jump(bottom.value);
};
// 书架路由切换
const router = useRouter();
const toShelf = () => {
    router.push('/');
};
// 获取章节内容
const chapterData = ref([]);
const noPoint = ref(true);
const getContent = (index, reloadChapter = true, chapterPos = 0) => {
    if (reloadChapter) {
        //展示进度条
        store.setShowContent(false);
        //强制滚回顶层
        jump(top.value, { duration: 0 });
        //从目录，按钮切换章节时保存进度 预加载时不保存
        saveReadingBookProgressToBrowser(index, chapterPos);
        chapterData.value = [];
    }
    const bookUrl = store.readingBook.bookUrl;
    const { title, index: chapterIndex } = catalog.value[index];
    loadingWrapper(API.getBookContent(bookUrl, chapterIndex).then(res => {
        if (res.data.isSuccess) {
            const data = res.data.data;
            const content = data.split(/\n+/);
            chapterData.value.push({ index, content, title });
            if (reloadChapter)
                toChapterPos(chapterPos);
        }
        else {
            ElMessage({ message: res.data.errorMsg, type: 'error' });
            const content = [res.data.errorMsg];
            chapterData.value.push({ index, content, title });
        }
        store.setContentLoading(true);
        noPoint.value = false;
        store.setShowContent(true);
        if (!res.data.isSuccess) {
            throw res.data;
        }
    }, err => {
        const content = ['获取章节内容失败！'];
        chapterData.value.push({ index, content, title });
        store.setShowContent(true);
        throw err;
    }));
};
// 章节进度跳转和计算
const chapter = ref();
const chapterRef = ref();
const toChapterPos = (pos) => {
    nextTick(() => {
        if (chapterRef.value.length === 1)
            chapterRef.value[0].scrollToReadedLength(pos);
    });
};
// 60秒保存一次进度
const saveBookProgressThrottle = useThrottleFn(() => store.saveBookProgress(), 60000);
const onReadedLengthChange = (index, pos) => {
    saveReadingBookProgressToBrowser(index, pos);
    saveBookProgressThrottle();
};
// 文档标题
watchEffect(() => {
    document.title = catalog.value[chapterIndex.value]?.title || document.title;
});
// 阅读记录保存浏览器
const saveReadingBookProgressToBrowser = (index, pos) => {
    // 保存pinia
    chapterIndex.value = index;
    chapterPos.value = pos;
};
// 进度同步
// 返回导航变化 同步请求会在获取书架前完成
/**
 * VisibilityChange https://developer.mozilla.org/zh-CN/docs/Web/API/Document/visibilitychange_event
 * 监听关闭页面 切换tab 返回桌面 等操作
 * 注意不用监听点击链接导航变化 不对Safari<14.5兼容处理
 **/
const onVisibilityChange = () => {
    const _bookProgress = bookProgress.value;
    if (document.visibilityState == 'hidden' && _bookProgress) {
        store.saveBookProgress();
    }
};
// 定时同步
// 章节切换
const toNextChapter = () => {
    store.setContentLoading(true);
    const index = chapterIndex.value + 1;
    if (typeof catalog.value[index] !== 'undefined') {
        ElMessage({
            message: '下一章',
            type: 'info',
        });
        getContent(index);
        store.saveBookProgress();
    }
    else {
        ElMessage({
            message: '本章是最后一章',
            type: 'error',
        });
    }
};
const toPreChapter = () => {
    store.setContentLoading(true);
    const index = chapterIndex.value - 1;
    if (typeof catalog.value[index] !== 'undefined') {
        ElMessage({
            message: '上一章',
            type: 'info',
        });
        getContent(index);
        store.saveBookProgress();
    }
    else {
        ElMessage({
            message: '本章是第一章',
            type: 'error',
        });
    }
};
let canJump = true;
// 监听方向键
const handleKeyPress = (event) => {
    if (!canJump)
        return;
    // 自定义物理按键翻页(对齐 Android prevKeyCodes/nextKeyCodes),空列表时不拦截
    if (customPrevKeys.value.length && customPrevKeys.value.includes(event.key)) {
        event.stopPropagation();
        event.preventDefault();
        toPreChapter();
        return;
    }
    if (customNextKeys.value.length && customNextKeys.value.includes(event.key)) {
        event.stopPropagation();
        event.preventDefault();
        toNextChapter();
        return;
    }
    switch (event.key) {
        case 'ArrowLeft':
            event.stopPropagation();
            event.preventDefault();
            toPreChapter();
            break;
        case 'ArrowRight':
            event.stopPropagation();
            event.preventDefault();
            toNextChapter();
            break;
        case 'ArrowUp':
            event.stopPropagation();
            event.preventDefault();
            if (document.documentElement.scrollTop === 0) {
                ElMessage.warning('已到达页面顶部');
            }
            else {
                canJump = false;
                jump(0 - document.documentElement.clientHeight + 100, {
                    duration: store.config.jumpDuration,
                    callback: () => (canJump = true),
                });
            }
            break;
        case 'ArrowDown':
            event.stopPropagation();
            event.preventDefault();
            if (document.documentElement.clientHeight +
                document.documentElement.scrollTop ===
                document.documentElement.scrollHeight) {
                ElMessage.warning('已到达页面底部');
            }
            else {
                canJump = false;
                jump(document.documentElement.clientHeight - 100, {
                    duration: store.config.jumpDuration,
                    callback: () => (canJump = true),
                });
            }
            break;
    }
};
// 阻止默认滚动事件
const ignoreKeyPress = (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
    }
};
onMounted(async () => {
    await store.loadWebConfig();
    // 加载自定义翻页按键码(对齐 Android prevKeyCodes/nextKeyCodes,加载失败则保留默认方向键翻页)
    try {
        const prevResp = await API.getSetting('prevKeyCodes', 'read', '');
        if (prevResp.data?.isSuccess) {
            const raw = prevResp.data.data || '';
            customPrevKeys.value = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
        const nextResp = await API.getSetting('nextKeyCodes', 'read', '');
        if (nextResp.data?.isSuccess) {
            const raw = nextResp.data.data || '';
            customNextKeys.value = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
    }
    catch {
        // 按键码配置加载失败时忽略,不阻塞阅读
    }
    //获取书籍数据
    const bookUrl = sessionStorage.getItem('bookUrl');
    const name = sessionStorage.getItem('bookName');
    const author = sessionStorage.getItem('bookAuthor');
    const chapterIndex = Number(sessionStorage.getItem('chapterIndex') || 0);
    const chapterPos = Number(sessionStorage.getItem('chapterPos') || 0);
    const isSeachBook = sessionStorage.getItem('isSeachBook') === 'true';
    if (isNullOrBlank(bookUrl) || isNullOrBlank(name) || author === null) {
        ElMessage.warning('书籍信息为空，即将自动返回书架页面...');
        return setTimeout(toShelf, 500);
    }
    const book = {
        // @ts-expect-error: bookUrl name author is NON_Blank string here
        bookUrl,
        // @ts-expect-error: bookUrl name author is NON_Blank string here
        name,
        author,
        chapterIndex,
        chapterPos,
        isSeachBook,
    };
    onResize();
    window.addEventListener('resize', onResize);
    loadingWrapper(store.loadWebCatalog(book).then(chapters => {
        store.setReadingBook(book);
        getContent(chapterIndex, true, chapterPos);
        window.addEventListener('keyup', handleKeyPress);
        window.addEventListener('keydown', ignoreKeyPress);
        // 兼容Safari < 14
        document.addEventListener('visibilitychange', onVisibilityChange);
        //监听底部加载
        scrollObserver = new IntersectionObserver(onReachBottom, {
            rootMargin: '-100% 0% 20% 0%',
        });
        if (infiniteLoading.value === true)
            scrollObserver.observe(loading.value);
        //第二次点击同一本书 页面标题不会变化
        document.title = '...';
        document.title = name + ' | ' + chapters[chapterIndex].title;
    }));
});
onUnmounted(() => {
    window.removeEventListener('keyup', handleKeyPress);
    window.removeEventListener('keydown', ignoreKeyPress);
    window.removeEventListener('resize', onResize);
    // 兼容Safari < 14
    document.removeEventListener('visibilitychange', onVisibilityChange);
    readSettingsVisible.value = false;
    popCataVisible.value = false;
    scrollObserver?.disconnect();
    scrollObserver = null;
});
const addToBookShelfConfirm = async () => {
    const book = store.readingBook;
    // 阅读的是搜索的书籍 并未在书架
    if (book.isSeachBook === true) {
        await ElMessageBox.confirm(`是否将《${book.name}》放入书架？`, '放入书架', {
            confirmButtonText: '确认',
            cancelButtonText: '否',
            type: 'info',
            /*
              ElMessageBox.confirm默认在触发hashChange事件时自动关闭
              按下物理返回键时触发hashChange事件
              使用router.push("/")则不会触发hashChange事件
              */
            closeOnHashChange: false,
        })
            .then(() => {
            //选择是，无动作
            isSeachBook.value = false;
        })
            .catch(async () => {
            //选择否，删除书籍
            await API.deleteBook(book);
        })
            .finally(() => sessionStorage.removeItem('isSeachBook'));
    }
};
onBeforeRouteLeave(async (to, from, next) => {
    console.log('onBeforeRouteLeave');
    // 弹窗时停止响应按键翻页
    window.removeEventListener('keyup', handleKeyPress);
    await addToBookShelfConfirm();
    next();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tools']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['tools']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['read-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['tools']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showToolBar = !__VLS_ctx.showToolBar;
            // @ts-ignore
            [showToolBar, showToolBar,];
        } },
    ...{ class: "chapter-wrapper" },
    ...{ style: (__VLS_ctx.bodyTheme) },
    ...{ class: ({ night: __VLS_ctx.isNight, day: !__VLS_ctx.isNight }) },
});
/** @type {__VLS_StyleScopedClasses['chapter-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['night']} */ ;
/** @type {__VLS_StyleScopedClasses['day']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tool-bar" },
    ...{ style: (__VLS_ctx.leftBarTheme) },
});
/** @type {__VLS_StyleScopedClasses['tool-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tools" },
});
/** @type {__VLS_StyleScopedClasses['tools']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elPopover | typeof __VLS_components.ElPopover | typeof __VLS_components['el-popover'] | typeof __VLS_components.elPopover | typeof __VLS_components.ElPopover | typeof __VLS_components['el-popover']} */
elPopover;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    placement: "right",
    width: (__VLS_ctx.popupWidth),
    trigger: "click",
    showArrow: (false),
    visible: (__VLS_ctx.popCataVisible),
    popperClass: "pop-cata",
}));
const __VLS_2 = __VLS_1({
    placement: "right",
    width: (__VLS_ctx.popupWidth),
    trigger: "click",
    showArrow: (false),
    visible: (__VLS_ctx.popCataVisible),
    popperClass: "pop-cata",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.PopCatalog} */
PopCatalog;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ 'onGetContent': {} },
    ...{ class: "popup" },
}));
const __VLS_8 = __VLS_7({
    ...{ 'onGetContent': {} },
    ...{ class: "popup" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_11;
const __VLS_12 = {
    /** @type {typeof __VLS_11.getContent} */
    onGetContent: (__VLS_ctx.getContent),
};
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
var __VLS_9;
var __VLS_10;
{
    const { reference: __VLS_13 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tool-icon" },
        ...{ class: ({ 'no-point': false }) },
    });
    /** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['no-point']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "iconfont" },
    });
    /** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "icon-text" },
    });
    /** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
    // @ts-ignore
    [bodyTheme, isNight, isNight, leftBarTheme, popupWidth, popCataVisible, getContent,];
}
// @ts-ignore
[];
var __VLS_3;
let __VLS_14;
/** @ts-ignore @type { | typeof __VLS_components.elPopover | typeof __VLS_components.ElPopover | typeof __VLS_components['el-popover'] | typeof __VLS_components.elPopover | typeof __VLS_components.ElPopover | typeof __VLS_components['el-popover']} */
elPopover;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    placement: "right",
    width: (__VLS_ctx.popupWidth),
    trigger: "click",
    showArrow: (false),
    visible: (__VLS_ctx.readSettingsVisible),
    popperClass: "pop-setting",
}));
const __VLS_16 = __VLS_15({
    placement: "right",
    width: (__VLS_ctx.popupWidth),
    trigger: "click",
    showArrow: (false),
    visible: (__VLS_ctx.readSettingsVisible),
    popperClass: "pop-setting",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type { | typeof __VLS_components.readSettings | typeof __VLS_components.ReadSettings | typeof __VLS_components['read-settings']} */
readSettings;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    ...{ class: "popup" },
}));
const __VLS_22 = __VLS_21({
    ...{ class: "popup" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
{
    const { reference: __VLS_25 } = __VLS_17.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tool-icon" },
        ...{ class: ({ 'no-point': __VLS_ctx.noPoint }) },
    });
    /** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['no-point']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "iconfont" },
    });
    /** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "icon-text" },
    });
    /** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
    // @ts-ignore
    [popupWidth, readSettingsVisible, noPoint,];
}
// @ts-ignore
[];
var __VLS_17;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.toShelf) },
    ...{ class: "tool-icon" },
});
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "icon-text" },
});
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.toTop) },
    ...{ class: "tool-icon" },
    ...{ class: ({ 'no-point': __VLS_ctx.noPoint }) },
});
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['no-point']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "icon-text" },
});
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.toBottom) },
    ...{ class: "tool-icon" },
    ...{ class: ({ 'no-point': __VLS_ctx.noPoint }) },
});
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['no-point']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "icon-text" },
});
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "read-bar" },
    ...{ style: (__VLS_ctx.rightBarTheme) },
});
/** @type {__VLS_StyleScopedClasses['read-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tools" },
});
/** @type {__VLS_StyleScopedClasses['tools']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.toPreChapter) },
    ...{ class: "tool-icon" },
    ...{ class: ({ 'no-point': __VLS_ctx.noPoint }) },
});
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['no-point']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
if (__VLS_ctx.miniInterface) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.toNextChapter) },
    ...{ class: "tool-icon" },
    ...{ class: ({ 'no-point': __VLS_ctx.noPoint }) },
});
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['no-point']} */ ;
if (__VLS_ctx.miniInterface) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chapter-bar" },
});
/** @type {__VLS_StyleScopedClasses['chapter-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chapter" },
    ref: "content",
    ...{ style: (__VLS_ctx.chapterTheme) },
});
/** @type {__VLS_StyleScopedClasses['chapter']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "content" },
});
/** @type {__VLS_StyleScopedClasses['content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "top-bar" },
    ref: "top",
});
/** @type {__VLS_StyleScopedClasses['top-bar']} */ ;
for (const [data] of __VLS_vFor((__VLS_ctx.chapterData))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (data.index),
        chapterIndex: (data.index),
        ref: "chapter",
    });
    if (__VLS_ctx.showContent) {
        let __VLS_26;
        /** @ts-ignore @type { | typeof __VLS_components.chapterContent | typeof __VLS_components.ChapterContent | typeof __VLS_components['chapter-content']} */
        chapterContent;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            ...{ 'onReadedLengthChange': {} },
            ref: "chapterRef",
            chapterIndex: (data.index),
            contents: (data.content),
            title: (data.title),
            spacing: (__VLS_ctx.store.config.spacing),
            fontSize: (__VLS_ctx.fontSize),
            fontFamily: (__VLS_ctx.fontFamily),
        }));
        const __VLS_28 = __VLS_27({
            ...{ 'onReadedLengthChange': {} },
            ref: "chapterRef",
            chapterIndex: (data.index),
            contents: (data.content),
            title: (data.title),
            spacing: (__VLS_ctx.store.config.spacing),
            fontSize: (__VLS_ctx.fontSize),
            fontFamily: (__VLS_ctx.fontFamily),
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        let __VLS_31;
        const __VLS_32 = {
            /** @type {typeof __VLS_31.readedLengthChange} */
            onReadedLengthChange: (__VLS_ctx.onReadedLengthChange),
        };
        var __VLS_33;
        var __VLS_29;
        var __VLS_30;
    }
    // @ts-ignore
    [noPoint, noPoint, noPoint, noPoint, toShelf, toTop, toBottom, rightBarTheme, toPreChapter, miniInterface, miniInterface, toNextChapter, chapterTheme, chapterData, showContent, store, fontSize, fontFamily, onReadedLengthChange,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loading" },
    ref: "loading",
});
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bottom-bar" },
    ref: "bottom",
});
/** @type {__VLS_StyleScopedClasses['bottom-bar']} */ ;
// @ts-ignore
var __VLS_34 = __VLS_33;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
