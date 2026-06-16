/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Edit } from '@element-plus/icons-vue';
import { getSourceUniqueKey, getSourceName } from '@/utils/souce';
const props = defineProps();
const store = useSourceStore();
const currentSourceUrl = computed(() => store.currentSourceUrl);
const sourceUrl = computed(() => getSourceUniqueKey(props.source));
const handleSourceClick = (source) => {
    store.changeCurrentSource(source);
};
const isSaveError = computed(() => {
    const map = store.savedSourcesMap;
    if (map.size == 0)
        return false;
    return !map.has(sourceUrl.value);
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox'] | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox']} */
elCheckbox;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: "large",
    border: true,
    value: (__VLS_ctx.sourceUrl),
    ...{ class: ({
            error: __VLS_ctx.isSaveError,
            edit: __VLS_ctx.sourceUrl == __VLS_ctx.currentSourceUrl,
        }) },
}));
const __VLS_2 = __VLS_1({
    size: "large",
    border: true,
    value: (__VLS_ctx.sourceUrl),
    ...{ class: ({
            error: __VLS_ctx.isSaveError,
            edit: __VLS_ctx.sourceUrl == __VLS_ctx.currentSourceUrl,
        }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['edit']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
(__VLS_ctx.getSourceName(__VLS_ctx.source));
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onClick': {} },
    text: true,
    icon: (__VLS_ctx.Edit),
}));
const __VLS_9 = __VLS_8({
    ...{ 'onClick': {} },
    text: true,
    icon: (__VLS_ctx.Edit),
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = {
    /** @type {typeof __VLS_12.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.handleSourceClick(__VLS_ctx.source);
        // @ts-ignore
        [sourceUrl, sourceUrl, isSaveError, currentSourceUrl, getSourceName, source, source, Edit, handleSourceClick,];
    },
};
var __VLS_10;
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
