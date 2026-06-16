/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const store = useSourceStore();
const __VLS_props = defineProps();
const currentSource = computed(() => store.currentSource);
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
/** @ts-ignore @type { | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components['el-tabs'] | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components['el-tabs']} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    id: "source-edit",
}));
const __VLS_2 = __VLS_1({
    id: "source-edit",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5;
const { default: __VLS_6 } = __VLS_3.slots;
for (const [{ name, children }] of __VLS_vFor((Object.values(__VLS_ctx.config)))) {
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane'] | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components['el-tab-pane']} */
    elTabPane;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        label: (name),
        key: (name),
    }));
    const __VLS_9 = __VLS_8({
        label: (name),
        key: (name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    const { default: __VLS_12 } = __VLS_10.slots;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
    elForm;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        labelPosition: "right",
        labelWidth: "auto",
    }));
    const __VLS_15 = __VLS_14({
        labelPosition: "right",
        labelWidth: "auto",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    const { default: __VLS_18 } = __VLS_16.slots;
    for (const [{ type, title, namespace, id, array, hint, required = false, }] of __VLS_vFor((children))) {
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
        elFormItem;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            label: (title),
            key: (title),
            required: (required),
        }));
        const __VLS_21 = __VLS_20({
            label: (title),
            key: (title),
            required: (required),
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        const { default: __VLS_24 } = __VLS_22.slots;
        if (type == 'String' && typeof namespace == 'undefined') {
            let __VLS_25;
            /** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
            elInput;
            // @ts-ignore
            const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
                type: "textarea",
                modelValue: (__VLS_ctx.currentSource[id]),
                placeholder: (hint),
                autosize: true,
            }));
            const __VLS_27 = __VLS_26({
                type: "textarea",
                modelValue: (__VLS_ctx.currentSource[id]),
                placeholder: (hint),
                autosize: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        }
        if (type == 'String' && typeof namespace != 'undefined') {
            let __VLS_30;
            /** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
            elInput;
            // @ts-ignore
            const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                type: "textarea",
                modelValue: (__VLS_ctx.currentSource[namespace][id]),
                placeholder: (hint),
                autosize: true,
            }));
            const __VLS_32 = __VLS_31({
                type: "textarea",
                modelValue: (__VLS_ctx.currentSource[namespace][id]),
                placeholder: (hint),
                autosize: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        }
        if (type === 'Boolean') {
            let __VLS_35;
            /** @ts-ignore @type { | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components['el-switch']} */
            elSwitch;
            // @ts-ignore
            const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                modelValue: (__VLS_ctx.currentSource[id]),
            }));
            const __VLS_37 = __VLS_36({
                modelValue: (__VLS_ctx.currentSource[id]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        }
        if (type === 'Number') {
            let __VLS_40;
            /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
            elInputNumber;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                modelValue: (__VLS_ctx.currentSource[id]),
                min: (0),
            }));
            const __VLS_42 = __VLS_41({
                modelValue: (__VLS_ctx.currentSource[id]),
                min: (0),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        }
        if (type === 'Array') {
            let __VLS_45;
            /** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
            elSelect;
            // @ts-ignore
            const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
                modelValue: (__VLS_ctx.currentSource[id]),
            }));
            const __VLS_47 = __VLS_46({
                modelValue: (__VLS_ctx.currentSource[id]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            const { default: __VLS_50 } = __VLS_48.slots;
            for (const [optionName, index] of __VLS_vFor((array))) {
                let __VLS_51;
                /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
                elOption;
                // @ts-ignore
                const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                    value: (index),
                    key: (optionName),
                    label: (optionName),
                }));
                const __VLS_53 = __VLS_52({
                    value: (index),
                    key: (optionName),
                    label: (optionName),
                }, ...__VLS_functionalComponentArgsRest(__VLS_52));
                // @ts-ignore
                [config, currentSource, currentSource, currentSource, currentSource, currentSource,];
            }
            // @ts-ignore
            [];
            var __VLS_48;
        }
        // @ts-ignore
        [];
        var __VLS_22;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_16;
    // @ts-ignore
    [];
    var __VLS_10;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
