/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import '../assets/fonts/popfont.css';
import '../assets/fonts/iconfont.css';
import settings from '../config/themeConfig';
import API from '@api';
import { useDebounceFn } from '@vueuse/shared';
const store = useBookStore();
const saveConfigDebounce = useDebounceFn(() => API.saveReadConfig(store.config), 500);
//阅读界面设置改变时保存同步配置
watch(() => store.config, () => {
    saveConfigDebounce();
}, {
    deep: 2, //深度为2
});
//主题颜色
const theme = computed(() => store.theme);
const isNight = computed(() => store.isNight);
const moonIcon = computed(() => (theme.value == 6 ? '' : ''));
const themeColors = [
    {
        background: 'rgba(250, 245, 235, 0.8)',
    },
    {
        background: 'rgba(245, 234, 204, 0.8)',
    },
    {
        background: 'rgba(230, 242, 230, 0.8)',
    },
    {
        background: 'rgba(228, 241, 245, 0.8)',
    },
    {
        background: 'rgba(245, 228, 228, 0.8)',
    },
    {
        background: 'rgba(224, 224, 224, 0.8)',
    },
    {
        background: 'rgba(0, 0, 0, 0.5)',
    },
];
const popupTheme = computed(() => {
    return {
        background: settings.themes[theme.value].popup,
    };
});
const setTheme = (theme) => {
    store.config.theme = theme;
};
//预置字体
const fonts = ref(['雅黑', '宋体', '楷书']);
const setFont = (font) => {
    store.config.font = font;
};
const selectedFont = computed(() => {
    return store.config.font;
});
//自定义字体
const customFontName = ref(store.config.customFontName);
const customFontSavePopVisible = ref(false);
const setCustomFont = () => {
    customFontSavePopVisible.value = false;
    store.config.font = -1;
    store.config.customFontName = customFontName.value;
};
// 加载网络字体
const loadFontFromURL = () => {
    customFontSavePopVisible.value = false;
    ElMessageBox.prompt('请输入 字体网络链接', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^https?:.+$/,
        inputErrorMessage: 'url 形式不正确',
        beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true;
                instance.confirmButtonText = '下载中……';
                // instance.inputValue
                const url = instance.inputValue;
                if (typeof FontFace !== 'function') {
                    ElMessage.error('浏览器不支持FontFace');
                    return done();
                }
                const fontface = new FontFace(customFontName.value, `url("${url}")`);
                document.fonts.add(fontface);
                fontface
                    .load()
                    //API.getBookShelf()
                    .then(function () {
                    instance.confirmButtonLoading = false;
                    ElMessage.info('字体加载成功！');
                    setCustomFont();
                    done();
                })
                    .catch(function (error) {
                    instance.confirmButtonLoading = false;
                    instance.confirmButtonText = '确定';
                    ElMessage.error('下载失败，请检查您输入的 url');
                    throw error;
                });
            }
            else {
                done();
            }
        },
    });
};
//字体大小
const fontSize = computed(() => {
    return store.config.fontSize;
});
const moreFontSize = () => {
    if (store.config.fontSize < 48)
        store.config.fontSize += 2;
};
const lessFontSize = () => {
    if (store.config.fontSize > 12)
        store.config.fontSize -= 2;
};
//字 行 段落间距
const spacing = computed(() => {
    return store.config.spacing;
});
const lessLetterSpacing = () => {
    store.config.spacing.letter -= 0.01;
};
const moreLetterSpacing = () => {
    store.config.spacing.letter += 0.01;
};
const lessLineSpacing = () => {
    store.config.spacing.line -= 0.1;
};
const moreLineSpacing = () => {
    store.config.spacing.line += 0.1;
};
const lessParagraphSpacing = () => {
    store.config.spacing.paragraph -= 0.1;
};
const moreParagraphSpacing = () => {
    store.config.spacing.paragraph += 0.1;
};
//页面宽度
const readWidth = computed(() => {
    return store.config.readWidth;
});
const moreReadWidth = () => {
    // 此时会截断页面
    if (store.config.readWidth + 160 + 2 * 68 > window.innerWidth)
        return;
    store.config.readWidth += 160;
};
const lessReadWidth = () => {
    if (store.config.readWidth > 640)
        store.config.readWidth -= 160;
};
//翻页速度
const jumpDuration = computed(() => {
    return store.config.jumpDuration;
});
const moreJumpDuration = () => {
    store.config.jumpDuration += 100;
};
const lessJumpDuration = () => {
    if (store.config.jumpDuration === 0)
        return;
    store.config.jumpDuration -= 100;
};
//无限加载
const infiniteLoading = computed(() => {
    return store.config.infiniteLoading;
});
const setInfiniteLoading = (loading) => {
    store.config.infiniteLoading = loading;
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['font-item']} */ ;
/** @type {__VLS_StyleScopedClasses['infinite-loading-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['moon-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['font-list']} */ ;
/** @type {__VLS_StyleScopedClasses['infinite-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['font-item']} */ ;
/** @type {__VLS_StyleScopedClasses['infinite-loading-item']} */ ;
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['moon-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['font-list']} */ ;
/** @type {__VLS_StyleScopedClasses['infinite-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['font-item']} */ ;
/** @type {__VLS_StyleScopedClasses['infinite-loading-item']} */ ;
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "settings-wrapper" },
    ...{ style: (__VLS_ctx.popupTheme) },
    ...{ class: ({ night: __VLS_ctx.isNight, day: !__VLS_ctx.isNight }) },
});
/** @type {__VLS_StyleScopedClasses['settings-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['night']} */ ;
/** @type {__VLS_StyleScopedClasses['day']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "settings-title" },
});
/** @type {__VLS_StyleScopedClasses['settings-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "setting-list" },
});
/** @type {__VLS_StyleScopedClasses['setting-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "theme-list" },
});
/** @type {__VLS_StyleScopedClasses['theme-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
for (const [themeColor, index] of __VLS_vFor((__VLS_ctx.themeColors))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.setTheme(index);
                // @ts-ignore
                [popupTheme, isNight, isNight, themeColors, setTheme,];
            } },
        ...{ class: "theme-item" },
        key: (index),
        ...{ style: (themeColor) },
        ref: "themes",
        ...{ class: ({ selected: __VLS_ctx.theme == index }) },
    });
    /** @type {__VLS_StyleScopedClasses['theme-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['selected']} */ ;
    if (index < 6) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
            ...{ class: "iconfont" },
        });
        /** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
            ...{ class: "moon-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['moon-icon']} */ ;
        (__VLS_ctx.moonIcon);
    }
    // @ts-ignore
    [theme, moonIcon,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "font-list" },
});
/** @type {__VLS_StyleScopedClasses['font-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
for (const [font, index] of __VLS_vFor((__VLS_ctx.fonts))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.setFont(index);
                // @ts-ignore
                [fonts, setFont,];
            } },
        ...{ class: "font-item" },
        key: (index),
        ...{ class: ({ selected: __VLS_ctx.selectedFont == index }) },
    });
    /** @type {__VLS_StyleScopedClasses['font-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['selected']} */ ;
    (font);
    // @ts-ignore
    [selectedFont,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "font-list" },
});
/** @type {__VLS_StyleScopedClasses['font-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elTooltip | typeof __VLS_components.ElTooltip | typeof __VLS_components['el-tooltip'] | typeof __VLS_components.elTooltip | typeof __VLS_components.ElTooltip | typeof __VLS_components['el-tooltip']} */
elTooltip;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    effect: "dark",
    content: "自定义的字体名称",
    placement: "top",
}));
const __VLS_2 = __VLS_1({
    effect: "dark",
    content: "自定义的字体名称",
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    type: "text",
    ...{ class: "font-item font-item-input" },
    value: (__VLS_ctx.customFontName),
    placeholder: "请输入自定义的字体名称",
});
/** @type {__VLS_StyleScopedClasses['font-item']} */ ;
/** @type {__VLS_StyleScopedClasses['font-item-input']} */ ;
// @ts-ignore
[customFontName,];
var __VLS_3;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.elPopover | typeof __VLS_components.ElPopover | typeof __VLS_components['el-popover'] | typeof __VLS_components.elPopover | typeof __VLS_components.ElPopover | typeof __VLS_components['el-popover']} */
elPopover;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    placement: "top",
    width: "270",
    trigger: "click",
    visible: (__VLS_ctx.customFontSavePopVisible),
}));
const __VLS_8 = __VLS_7({
    placement: "top",
    width: "270",
    trigger: "click",
    visible: (__VLS_ctx.customFontSavePopVisible),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
let __VLS_12;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    size: "small",
    plain: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    size: "small",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_17;
const __VLS_18 = {
    /** @type {typeof __VLS_17.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.customFontSavePopVisible = false;
        // @ts-ignore
        [customFontSavePopVisible, customFontSavePopVisible,];
    },
};
const { default: __VLS_19 } = __VLS_15.slots;
// @ts-ignore
[];
var __VLS_15;
var __VLS_16;
let __VLS_20;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_25;
const __VLS_26 = {
    /** @type {typeof __VLS_25.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.setCustomFont();
        // @ts-ignore
        [setCustomFont,];
    },
};
const { default: __VLS_27 } = __VLS_23.slots;
// @ts-ignore
[];
var __VLS_23;
var __VLS_24;
let __VLS_28;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_33;
const __VLS_34 = {
    /** @type {typeof __VLS_33.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.loadFontFromURL();
        // @ts-ignore
        [loadFontFromURL,];
    },
};
const { default: __VLS_35 } = __VLS_31.slots;
// @ts-ignore
[];
var __VLS_31;
var __VLS_32;
{
    const { reference: __VLS_36 } = __VLS_9.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        type: "text",
        ...{ class: "font-item" },
    });
    /** @type {__VLS_StyleScopedClasses['font-item']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "font-size" },
});
/** @type {__VLS_StyleScopedClasses['font-size']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resize" },
});
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.lessFontSize) },
    ...{ class: "less" },
});
/** @type {__VLS_StyleScopedClasses['less']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "lang" },
});
/** @type {__VLS_StyleScopedClasses['lang']} */ ;
(__VLS_ctx.fontSize);
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.moreFontSize) },
    ...{ class: "more" },
});
/** @type {__VLS_StyleScopedClasses['more']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "letter-spacing" },
});
/** @type {__VLS_StyleScopedClasses['letter-spacing']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resize" },
});
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.lessLetterSpacing) },
    ...{ class: "less" },
});
/** @type {__VLS_StyleScopedClasses['less']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "lang" },
});
/** @type {__VLS_StyleScopedClasses['lang']} */ ;
(__VLS_ctx.spacing.letter.toFixed(2));
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.moreLetterSpacing) },
    ...{ class: "more" },
});
/** @type {__VLS_StyleScopedClasses['more']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "line-spacing" },
});
/** @type {__VLS_StyleScopedClasses['line-spacing']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resize" },
});
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.lessLineSpacing) },
    ...{ class: "less" },
});
/** @type {__VLS_StyleScopedClasses['less']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "lang" },
});
/** @type {__VLS_StyleScopedClasses['lang']} */ ;
(__VLS_ctx.spacing.line.toFixed(1));
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.moreLineSpacing) },
    ...{ class: "more" },
});
/** @type {__VLS_StyleScopedClasses['more']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "paragraph-spacing" },
});
/** @type {__VLS_StyleScopedClasses['paragraph-spacing']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resize" },
});
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resize" },
});
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.lessParagraphSpacing) },
    ...{ class: "less" },
});
/** @type {__VLS_StyleScopedClasses['less']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "lang" },
});
/** @type {__VLS_StyleScopedClasses['lang']} */ ;
(__VLS_ctx.spacing.paragraph.toFixed(1));
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.moreParagraphSpacing) },
    ...{ class: "more" },
});
/** @type {__VLS_StyleScopedClasses['more']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
if (!__VLS_ctx.store.miniInterface) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
        ...{ class: "read-width" },
    });
    /** @type {__VLS_StyleScopedClasses['read-width']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resize" },
    });
    /** @type {__VLS_StyleScopedClasses['resize']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (__VLS_ctx.lessReadWidth) },
        ...{ class: "less" },
    });
    /** @type {__VLS_StyleScopedClasses['less']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
        ...{ class: "iconfont" },
    });
    /** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "lang" },
    });
    /** @type {__VLS_StyleScopedClasses['lang']} */ ;
    (__VLS_ctx.readWidth);
    __VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (__VLS_ctx.moreReadWidth) },
        ...{ class: "more" },
    });
    /** @type {__VLS_StyleScopedClasses['more']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
        ...{ class: "iconfont" },
    });
    /** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "paragraph-spacing" },
});
/** @type {__VLS_StyleScopedClasses['paragraph-spacing']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resize" },
});
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resize" },
});
/** @type {__VLS_StyleScopedClasses['resize']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.lessJumpDuration) },
    ...{ class: "less" },
});
/** @type {__VLS_StyleScopedClasses['less']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "lang" },
});
/** @type {__VLS_StyleScopedClasses['lang']} */ ;
(__VLS_ctx.jumpDuration);
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (__VLS_ctx.moreJumpDuration) },
    ...{ class: "more" },
});
/** @type {__VLS_StyleScopedClasses['more']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({
    ...{ class: "iconfont" },
});
/** @type {__VLS_StyleScopedClasses['iconfont']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
    ...{ class: "infinite-loading" },
});
/** @type {__VLS_StyleScopedClasses['infinite-loading']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.setInfiniteLoading(false);
            // @ts-ignore
            [lessFontSize, fontSize, moreFontSize, lessLetterSpacing, spacing, spacing, spacing, moreLetterSpacing, lessLineSpacing, moreLineSpacing, lessParagraphSpacing, moreParagraphSpacing, store, lessReadWidth, readWidth, moreReadWidth, lessJumpDuration, jumpDuration, moreJumpDuration, setInfiniteLoading,];
        } },
    ...{ class: "infinite-loading-item" },
    key: (0),
    ...{ class: ({ selected: __VLS_ctx.infiniteLoading == false }) },
});
/** @type {__VLS_StyleScopedClasses['infinite-loading-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.setInfiniteLoading(true);
            // @ts-ignore
            [setInfiniteLoading, infiniteLoading,];
        } },
    ...{ class: "infinite-loading-item" },
    key: (1),
    ...{ class: ({ selected: __VLS_ctx.infiniteLoading == true }) },
});
/** @type {__VLS_StyleScopedClasses['infinite-loading-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
// @ts-ignore
[infiniteLoading,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
