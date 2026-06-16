/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useSourceStore } from '@/store';
const store = useSourceStore();
const sourceString = ref('');
const update = async (string) => {
    try {
        store.changeEditTabSource(JSON.parse(string));
    }
    catch {
        ElMessage({
            message: '粘贴的源格式错误',
            type: 'error',
        });
    }
};
watchEffect(async () => {
    const source = store.editTabSource;
    if (Object.keys(source).length > 0) {
        sourceString.value = JSON.stringify(source, null, 4);
    }
    else {
        sourceString.value = '';
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input'] | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    id: "source-json",
    modelValue: (__VLS_ctx.sourceString),
    type: "textarea",
    placeholder: "这里输出序列化的JSON数据,可直接导入'阅读'APP",
    rows: (30),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    id: "source-json",
    modelValue: (__VLS_ctx.sourceString),
    type: "textarea",
    placeholder: "这里输出序列化的JSON数据,可直接导入'阅读'APP",
    rows: (30),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = {
    /** @type {typeof __VLS_5.change} */
    onChange: (__VLS_ctx.update),
};
var __VLS_7;
var __VLS_3;
var __VLS_4;
// @ts-ignore
[sourceString, update,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
