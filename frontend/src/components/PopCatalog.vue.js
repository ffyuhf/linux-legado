/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import settings from '../config/themeConfig';
import '../assets/fonts/popfont.css';
import CatalogItem from './CatalogItem.vue';
const store = useBookStore();
const { catalog, popCataVisible, miniInterface } = storeToRefs(store);
//主题
const isNight = computed(() => store.theme);
const theme = computed(() => store.theme);
const popupTheme = computed(() => {
    return {
        background: settings.themes[theme.value].popup,
    };
});
//虚拟列表 数据源
const virtualListdata = computed(() => {
    const catalogValue = catalog.value;
    if (miniInterface.value)
        return catalogValue;
    // pc端 virtualListIitem有2个章节
    const length = Math.ceil(catalogValue.length / 2);
    const virtualListDataSource = new Array(length);
    let i = 0;
    while (i < length) {
        virtualListDataSource[i] = {
            index: i,
            catas: catalogValue.slice(2 * i, 2 * i + 2),
        };
        i++;
    }
    return virtualListDataSource;
});
//打开目录 计算当前章节对应的虚拟列表位置
const virtualListRef = ref();
const currentChapterIndex = computed({
    get: () => store.readingBook.chapterIndex,
    set: value => (store.readingBook.chapterIndex = value),
});
const virtualListIndex = computed(() => {
    const index = currentChapterIndex.value;
    if (miniInterface.value)
        return index;
    // pc端 virtualListIitem有2个章节
    return Math.floor(index / 2);
});
onUpdated(() => {
    // dom更新触发ResizeObserver，更新虚拟列表内部的sizes Map
    if (!popCataVisible.value)
        return;
    virtualListRef.value.scrollToIndex(virtualListIndex.value);
});
// 点击加载对应章节内容
const emit = defineEmits(['getContent']);
const gotoChapter = (chapter) => {
    const chapterIndex = catalog.value.indexOf(chapter);
    currentChapterIndex.value = chapterIndex;
    store.setPopCataVisible(false);
    store.setContentLoading(true);
    store.saveBookProgress();
    emit('getContent', chapterIndex);
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cata']} */ ;
/** @type {__VLS_StyleScopedClasses['cata']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: ({ 'cata-wrapper': true, visible: __VLS_ctx.popCataVisible }) },
    ...{ style: (__VLS_ctx.popupTheme) },
});
/** @type {__VLS_StyleScopedClasses['visible']} */ ;
/** @type {__VLS_StyleScopedClasses['cata-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "title" },
});
/** @type {__VLS_StyleScopedClasses['title']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.virtualList | typeof __VLS_components.VirtualList | typeof __VLS_components['virtual-list']} */
virtualList;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ style: {} },
    ...{ class: ({ night: __VLS_ctx.isNight, day: !__VLS_ctx.isNight }) },
    ref: "virtualListRef",
    dataKey: "index",
    wrapClass: "data-wrapper",
    itemClass: "cata",
    dataSources: (__VLS_ctx.virtualListdata),
    dataComponent: (CatalogItem),
    estimateSize: (40),
    extraProps: ({ gotoChapter: __VLS_ctx.gotoChapter, currentChapterIndex: __VLS_ctx.currentChapterIndex }),
}));
const __VLS_2 = __VLS_1({
    ...{ style: {} },
    ...{ class: ({ night: __VLS_ctx.isNight, day: !__VLS_ctx.isNight }) },
    ref: "virtualListRef",
    dataKey: "index",
    wrapClass: "data-wrapper",
    itemClass: "cata",
    dataSources: (__VLS_ctx.virtualListdata),
    dataComponent: (CatalogItem),
    estimateSize: (40),
    extraProps: ({ gotoChapter: __VLS_ctx.gotoChapter, currentChapterIndex: __VLS_ctx.currentChapterIndex }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5;
/** @type {__VLS_StyleScopedClasses['night']} */ ;
/** @type {__VLS_StyleScopedClasses['day']} */ ;
var __VLS_3;
// @ts-ignore
var __VLS_6 = __VLS_5;
// @ts-ignore
[popCataVisible, popupTheme, isNight, isNight, virtualListdata, gotoChapter, currentChapterIndex,];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
});
export default {};
