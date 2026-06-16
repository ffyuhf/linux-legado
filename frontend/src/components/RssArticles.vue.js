/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
/**
 * RSS 文章浏览组件逻辑
 *
 * 数据流：
 * 1. 打开时从 useSourceStore 加载 rssSources 列表
 * 2. 选择源后调用 API.getRssArticles 获取文章列表
 * 3. 点击文章调用 API.getRssArticle 获取正文 HTML
 */
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import API from '@api';
import { useSourceStore } from '@/store';
const props = defineProps();
const emit = defineEmits();
const visible = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
});
const sourceStore = useSourceStore();
/** 订阅源列表（从 sourceStore 获取） */
const rssSources = computed(() => sourceStore.rssSources);
// ==================== 文章列表 ====================
const currentSourceUrl = ref('');
const articles = ref([]);
const listLoading = ref(false);
const selectedIndex = ref(-1);
/** 加载选中源的文章列表 */
const loadArticles = async () => {
    if (!currentSourceUrl.value)
        return;
    listLoading.value = true;
    articles.value = [];
    selectedIndex.value = -1;
    content.value = '';
    try {
        const { data } = await API.getRssArticles(currentSourceUrl.value);
        if (data.isSuccess && data.data) {
            articles.value = data.data;
        }
        else {
            ElMessage.error(data.errorMsg || '获取文章列表失败');
        }
    }
    catch (e) {
        ElMessage.error('获取文章列表失败: ' + e.message);
    }
    finally {
        listLoading.value = false;
    }
};
// ==================== 文章正文 ====================
const currentTitle = ref('');
const content = ref('');
const contentLoading = ref(false);
/** 选择文章并加载正文 */
const selectArticle = async (idx) => {
    selectedIndex.value = idx;
    const article = articles.value[idx];
    currentTitle.value = article.title || '无标题';
    content.value = '';
    contentLoading.value = true;
    try {
        const { data } = await API.getRssArticle(article.link || '', currentSourceUrl.value);
        if (data.isSuccess) {
            content.value = data.data;
        }
        else {
            content.value = `<p>${data.errorMsg || '获取正文失败'}</p>`;
        }
    }
    catch (e) {
        content.value = `<p>获取正文失败: ${e.message}</p>`;
    }
    finally {
        contentLoading.value = false;
    }
};
// ==================== 工具 ====================
/** 格式化时间（兼容多种日期格式） */
const formatTime = (raw) => {
    const d = new Date(raw);
    if (isNaN(d.getTime()))
        return raw;
    return `${d.getMonth() + 1}/${d.getDate()}`;
};
/** 对话框打开时加载源列表 */
const onOpen = async () => {
    if (rssSources.value.length === 0) {
        try {
            const { data } = await API.getSources();
            if (data.isSuccess && data.data) {
                sourceStore.saveSources(data.data);
            }
        }
        catch (e) {
            ElMessage.error('加载订阅源失败: ' + e.message);
        }
    }
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components['el-dialog'] | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components['el-dialog']} */
elDialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onOpen': {} },
    modelValue: (__VLS_ctx.visible),
    title: "订阅文章",
    width: "900px",
    top: "5vh",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onOpen': {} },
    modelValue: (__VLS_ctx.visible),
    title: "订阅文章",
    width: "900px",
    top: "5vh",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = {
    /** @type {typeof __VLS_5.open} */
    onOpen: (__VLS_ctx.onOpen),
};
var __VLS_7;
const { default: __VLS_8 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rss-container" },
});
/** @type {__VLS_StyleScopedClasses['rss-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rss-left" },
});
/** @type {__VLS_StyleScopedClasses['rss-left']} */ ;
let __VLS_9;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.currentSourceUrl),
    placeholder: "选择订阅源",
    filterable: true,
    ...{ class: "source-select" },
}));
const __VLS_11 = __VLS_10({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.currentSourceUrl),
    placeholder: "选择订阅源",
    filterable: true,
    ...{ class: "source-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_14;
const __VLS_15 = {
    /** @type {typeof __VLS_14.change} */
    onChange: (__VLS_ctx.loadArticles),
};
/** @type {__VLS_StyleScopedClasses['source-select']} */ ;
const { default: __VLS_16 } = __VLS_12.slots;
for (const [s] of __VLS_vFor((__VLS_ctx.rssSources))) {
    let __VLS_17;
    /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
    elOption;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        key: (s.sourceUrl),
        label: (s.sourceName),
        value: (s.sourceUrl),
    }));
    const __VLS_19 = __VLS_18({
        key: (s.sourceUrl),
        label: (s.sourceName),
        value: (s.sourceUrl),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    // @ts-ignore
    [visible, onOpen, currentSourceUrl, loadArticles, rssSources,];
}
// @ts-ignore
[];
var __VLS_12;
var __VLS_13;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "article-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.listLoading) }, null, null);
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
if (__VLS_ctx.articles.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
    (__VLS_ctx.currentSourceUrl ? '暂无文章' : '请选择订阅源');
}
for (const [item, idx] of __VLS_vFor((__VLS_ctx.articles))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectArticle(idx);
                // @ts-ignore
                [currentSourceUrl, vLoading, listLoading, articles, articles, selectArticle,];
            } },
        key: (idx),
        ...{ class: "article-item" },
        ...{ class: ({ active: __VLS_ctx.selectedIndex === idx }) },
    });
    /** @type {__VLS_StyleScopedClasses['article-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-title" },
    });
    /** @type {__VLS_StyleScopedClasses['article-title']} */ ;
    (item.title || '无标题');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['article-meta']} */ ;
    if (item.pubDate) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(item.pubDate));
    }
    if (item.origin) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "article-origin" },
        });
        /** @type {__VLS_StyleScopedClasses['article-origin']} */ ;
        (item.origin);
    }
    // @ts-ignore
    [selectedIndex, formatTime,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rss-right" },
});
/** @type {__VLS_StyleScopedClasses['rss-right']} */ ;
if (!__VLS_ctx.content) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.contentLoading) }, null, null);
    /** @type {__VLS_StyleScopedClasses['article-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "content-title" },
    });
    /** @type {__VLS_StyleScopedClasses['content-title']} */ ;
    (__VLS_ctx.currentTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.content) }, null, null);
}
// @ts-ignore
[vLoading, content, content, contentLoading, currentTitle,];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
