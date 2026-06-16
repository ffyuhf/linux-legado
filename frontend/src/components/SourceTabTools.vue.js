/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useSourceStore } from '@/store';
const store = useSourceStore();
const current_tab = computed({
    get: () => store.currentTab,
    set: val => (store.currentTab = val),
});
const tabData = ref([
    ['editTab', '编辑源'],
    ['editDebug', '调试源'],
    ['editList', '源列表'],
    ['editHelp', '帮助信息'],
]);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components['el-tabs'] | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components['el-tabs']} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.current_tab),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.current_tab),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5;
const { default: __VLS_6 } = __VLS_3.slots;
for (const [tab, index] of __VLS_vFor((__VLS_ctx.tabData))) {
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
    elTabPane;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        key: (tab[0]),
        name: (tab[0]),
        label: (tab[1]),
    }));
    const __VLS_9 = __VLS_8({
        key: (tab[0]),
        name: (tab[0]),
        label: (tab[1]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    const { default: __VLS_12 } = __VLS_10.slots;
    if (index == 0) {
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.sourceJson | typeof __VLS_components.SourceJson | typeof __VLS_components['source-json']} */
        sourceJson;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
        const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
    }
    if (index == 1) {
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.sourceDebug | typeof __VLS_components.SourceDebug | typeof __VLS_components['source-debug']} */
        sourceDebug;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
        const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
    }
    if (index == 2) {
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.sourceList | typeof __VLS_components.SourceList | typeof __VLS_components['source-list']} */
        sourceList;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
        const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
    }
    if (index == 3) {
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.sourceHelp | typeof __VLS_components.SourceHelp | typeof __VLS_components['source-help']} */
        sourceHelp;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
        const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    }
    // @ts-ignore
    [current_tab, tabData,];
    var __VLS_10;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
