/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import API from '@api';
import { Search } from '@element-plus/icons-vue';
const store = useSourceStore();
const printDebug = ref('');
const searchKey = ref('');
watch(() => store.isDebuging, () => {
    if (store.isDebuging)
        startDebug();
});
const appendDebugMsg = (msg) => {
    const debugDom = document.querySelector('#debug-text');
    debugDom.scrollTop = debugDom.scrollHeight;
    printDebug.value += msg + '\n';
};
const startDebug = async () => {
    printDebug.value = '';
    try {
        await API.saveSource(store.currentSource);
    }
    catch (e) {
        store.debugFinish();
        throw e;
    }
    API.debug(store.currentSourceUrl, searchKey.value || store.searchKey, appendDebugMsg, store.debugFinish);
};
const isBookSource = computed(() => {
    return /bookSource/i.test(window.location.href);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.isBookSource) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
    elInput;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onKeydown': {} },
        id: "debug-key",
        modelValue: (__VLS_ctx.searchKey),
        placeholder: "搜索书名、作者",
        prefixIcon: (__VLS_ctx.Search),
        ...{ style: {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onKeydown': {} },
        id: "debug-key",
        modelValue: (__VLS_ctx.searchKey),
        placeholder: "搜索书名、作者",
        prefixIcon: (__VLS_ctx.Search),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.keydown} */
        onKeydown: (__VLS_ctx.startDebug),
    };
    var __VLS_3;
    var __VLS_4;
}
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    id: "debug-text",
    modelValue: (__VLS_ctx.printDebug),
    type: "textarea",
    readonly: true,
    rows: (29),
    placeholder: "这里用于输出调试信息",
}));
const __VLS_9 = __VLS_8({
    id: "debug-text",
    modelValue: (__VLS_ctx.printDebug),
    type: "textarea",
    readonly: true,
    rows: (29),
    placeholder: "这里用于输出调试信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
// @ts-ignore
[isBookSource, searchKey, Search, startDebug, printDebug,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
