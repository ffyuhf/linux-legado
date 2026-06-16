/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import bookSourceConfig from '@/config/bookSourceEditConfig';
import rssSourceConfig from '@/config/rssSourceEditConfig';
import '@/assets/sourceeditor.css';
import { useDark } from '@vueuse/core';
useDark();
let config;
const isBookSource = ref(/bookSource/i.test(location.href));
provide('isBookSource', isBookSource);
if (isBookSource.value) {
    config = bookSourceConfig;
    document.title = '书源管理';
}
else {
    config = rssSourceConfig;
    document.title = '订阅源管理';
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "editor" },
});
/** @type {__VLS_StyleScopedClasses['editor']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.sourceTabForm | typeof __VLS_components.SourceTabForm | typeof __VLS_components['source-tab-form']} */
sourceTabForm;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "left" },
    config: (__VLS_ctx.config),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "left" },
    config: (__VLS_ctx.config),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['left']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.toolBar | typeof __VLS_components.ToolBar | typeof __VLS_components['tool-bar']} */
toolBar;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
/** @ts-ignore @type { | typeof __VLS_components.sourceTabTools | typeof __VLS_components.SourceTabTools | typeof __VLS_components['source-tab-tools']} */
sourceTabTools;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    ...{ class: "right" },
}));
const __VLS_12 = __VLS_11({
    ...{ class: "right" },
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
/** @type {__VLS_StyleScopedClasses['right']} */ ;
// @ts-ignore
[config,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
