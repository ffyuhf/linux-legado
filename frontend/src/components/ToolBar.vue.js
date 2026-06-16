/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import API from '@api';
import { CircleCheckFilled, Edit } from '@element-plus/icons-vue';
import hotkeys from 'hotkeys-js';
import { getSourceName, isInvaildSource, normalizeSource } from '../utils/souce';
const store = useSourceStore();
const pull = () => {
    const loadingMsg = ElMessage({
        message: '加载中……',
        showClose: true,
        duration: 0,
    });
    API.getSources()
        .then(({ data }) => {
        if (data.isSuccess) {
            store.changeTabName('editList');
            store.saveSources(data.data);
            ElMessage({
                message: `成功拉取${data.data.length}条源`,
                type: 'success',
            });
        }
        else {
            ElMessage({
                message: data.errorMsg ?? '后端错误',
                type: 'error',
            });
        }
    })
        .finally(() => loadingMsg.close());
};
const push = () => {
    const sources = store.sources;
    store.changeTabName('editList');
    if (sources.length === 0) {
        return ElMessage({
            message: '空空如也',
            type: 'info',
        });
    }
    ElMessage({
        message: '正在推送中',
        type: 'info',
    });
    API.saveSources(sources).then(({ data }) => {
        if (data.isSuccess) {
            const okData = data.data;
            if (Array.isArray(okData)) {
                let failMsg = ``;
                if (sources.length > okData.length) {
                    failMsg = '\n推送失败的源将用红色字体标注!';
                    store.setPushReturnSources(okData);
                }
                ElMessage({
                    message: `批量推送源到「阅读3.0APP」\n共计: ${sources.length} 条\n成功: ${okData.length} 条\n失败: ${sources.length - okData.length} 条${failMsg}`,
                    type: 'success',
                });
            }
        }
        else {
            ElMessage({
                message: `批量推送源失败!\nErrorMsg: ${data.errorMsg}`,
                type: 'error',
            });
        }
    });
};
const conver2Tab = () => {
    store.changeTabName('editTab');
    store.changeEditTabSource(store.currentSource);
};
const conver2Source = () => {
    store.changeCurrentSource(store.editTabSource);
};
const undo = () => {
    store.editHistoryUndo();
};
const clearEdit = () => {
    store.clearEdit();
    ElMessage({
        message: '已清除',
        type: 'success',
    });
};
const redo = () => {
    store.clearEdit();
    store.clearAllHistory();
    ElMessage({
        message: '已清除所有历史记录',
        type: 'success',
    });
};
const saveSource = () => {
    const source = store.currentSource;
    if (isInvaildSource(source)) {
        normalizeSource(source);
        API.saveSource(source).then(({ data }) => {
            const sourceName = getSourceName(source);
            if (data.isSuccess) {
                ElMessage({
                    message: `源《${sourceName}》已成功保存到「阅读3.0APP」`,
                    type: 'success',
                });
                //save to store
                store.saveCurrentSource();
            }
            else {
                ElMessage({
                    message: `源《${sourceName}》保存失败!\nErrorMsg: ${data.errorMsg}`,
                    type: 'error',
                });
            }
        });
    }
    else {
        ElMessage({
            message: `请检查<必填>项是否全部填写`,
            type: 'error',
        });
    }
};
const debug = () => {
    store.startDebug();
};
const buttons = ref(Array.of({ name: '⇈推送源', hotKeys: [], action: push }, { name: '⇊拉取源', hotKeys: [], action: pull }, { name: '⋙生成源', hotKeys: [], action: conver2Tab }, { name: '⋘编辑源', hotKeys: [], action: conver2Source }, { name: '✗清空表单', hotKeys: [], action: clearEdit }, { name: '↶撤销操作', hotKeys: [], action: undo }, { name: '↷重做操作', hotKeys: [], action: redo }, { name: '⇏调试源', hotKeys: [], action: debug }, { name: '✓保存源', hotKeys: [], action: saveSource }));
const hotkeysDialogVisible = ref(true);
const recordKeyDowning = ref(false);
const recordKeyDownIndex = ref(-1);
const stopRecordKeyDown = () => {
    if (!recordKeyDowning.value) {
        hotkeysDialogVisible.value = false;
    }
    recordKeyDowning.value = false;
};
watch(hotkeysDialogVisible, visibale => {
    if (!visibale) {
        hotkeys.unbind('*');
        readHotkeysConfig();
        bindHotKeys();
        return;
    }
    readHotkeysConfig();
    hotkeys.unbind();
    /**监听按键 */
    hotkeys('*', event => {
        event.preventDefault();
        const pressedKeys = hotkeys.getPressedKeyString();
        if (pressedKeys.length == 1 && pressedKeys[0] == 'esc') {
            //单独按下esc 不录入
            return;
        }
        if (recordKeyDowning.value && recordKeyDownIndex.value > -1)
            buttons.value[recordKeyDownIndex.value].hotKeys = pressedKeys;
    });
}, { immediate: true });
const recordKeyDown = (index) => {
    recordKeyDowning.value = true;
    ElMessage({
        message: '按ESC键或者点击空白处结束录入',
        type: 'info',
    });
    buttons.value[index].hotKeys = [];
    recordKeyDownIndex.value = index;
};
const saveHotKeys = () => {
    const hotKeysConfig = [];
    buttons.value.forEach(({ hotKeys }) => {
        hotKeysConfig.push(hotKeys);
    });
    saveHotkeysConfig(hotKeysConfig);
    hotkeysDialogVisible.value = false;
};
const bindHotKeys = () => {
    // hotkeys默认过滤INPUT SELECT TEXTAREA
    hotkeys.filter = () => true;
    buttons.value.forEach(({ hotKeys, action }) => {
        if (hotKeys.length == 0)
            return;
        hotkeys(hotKeys.join('+'), event => {
            event.preventDefault();
            action.call(null);
        });
    });
};
const saveHotkeysConfig = (config) => {
    localStorage.setItem('legado_web_hotkeys', JSON.stringify(config));
};
/**
 * 读取快捷键配置
 * @return 是否成功读取配置
 */
function readHotkeysConfig() {
    try {
        const localStorageConfig = localStorage.getItem('legado_web_hotkeys');
        if (localStorageConfig === null)
            return false;
        const config = JSON.parse(localStorageConfig);
        if (!Array.isArray(config) || config.length == 0)
            return false;
        buttons.value.forEach((button, index) => (button.hotKeys = config[index]));
        return true;
    }
    catch {
        ElMessage({ message: '快捷键配置错误', type: 'error' });
        localStorage.removeItem('legado_web_hotkeys');
    }
    return false;
}
onMounted(() => {
    /**读取热键配置 */
    if (readHotkeysConfig()) {
        hotkeysDialogVisible.value = false;
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "menu flex-column-center" },
});
/** @type {__VLS_StyleScopedClasses['menu']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-column-center']} */ ;
for (const [button] of __VLS_vFor((__VLS_ctx.buttons))) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        size: "large",
        key: (button.name),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        size: "large",
        key: (button.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.click} */
        onClick: (button.action),
    };
    const { default: __VLS_7 } = __VLS_3.slots;
    (button.name);
    // @ts-ignore
    [buttons,];
    var __VLS_3;
    var __VLS_4;
    // @ts-ignore
    [];
}
let __VLS_8;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    size: "large",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = {
    /** @type {typeof __VLS_13.click} */
    onClick: (() => (__VLS_ctx.hotkeysDialogVisible = true)),
};
const { default: __VLS_15 } = __VLS_11.slots;
// @ts-ignore
[hotkeysDialogVisible,];
var __VLS_11;
var __VLS_12;
let __VLS_16;
/** @ts-ignore @type { | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components['el-dialog'] | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components['el-dialog']} */
elDialog;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.hotkeysDialogVisible),
    showClose: (false),
    beforeClose: (__VLS_ctx.stopRecordKeyDown),
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.hotkeysDialogVisible),
    showClose: (false),
    beforeClose: (__VLS_ctx.stopRecordKeyDown),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const { default: __VLS_21 } = __VLS_19.slots;
{
    const { header: __VLS_22 } = __VLS_19.slots;
    const [{ titleClass, titleId }] = __VLS_vSlot(__VLS_22);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hotkeys-header flex-space-between" },
    });
    /** @type {__VLS_StyleScopedClasses['hotkeys-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-space-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        id: (titleId),
        ...{ class: (titleClass) },
    });
    if (__VLS_ctx.recordKeyDowning) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text'] | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text']} */
        elText;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
        const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
        const { default: __VLS_28 } = __VLS_26.slots;
        // @ts-ignore
        [hotkeysDialogVisible, stopRecordKeyDown, recordKeyDowning,];
        var __VLS_26;
    }
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.recordKeyDowning),
        icon: (__VLS_ctx.CircleCheckFilled),
    }));
    const __VLS_31 = __VLS_30({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.recordKeyDowning),
        icon: (__VLS_ctx.CircleCheckFilled),
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    let __VLS_34;
    const __VLS_35 = {
        /** @type {typeof __VLS_34.click} */
        onClick: (__VLS_ctx.saveHotKeys),
    };
    const { default: __VLS_36 } = __VLS_32.slots;
    // @ts-ignore
    [recordKeyDowning, CircleCheckFilled, saveHotKeys,];
    var __VLS_32;
    var __VLS_33;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hotkeys-settings flex-column-center" },
});
/** @type {__VLS_StyleScopedClasses['hotkeys-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-column-center']} */ ;
for (const [button, buttonIndex] of __VLS_vFor((__VLS_ctx.buttons))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (button.name),
        ...{ class: "hotkeys-item flex-space-between" },
    });
    /** @type {__VLS_StyleScopedClasses['hotkeys-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-space-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "title" },
    });
    /** @type {__VLS_StyleScopedClasses['title']} */ ;
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text'] | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text']} */
    elText;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({}));
    const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_42 } = __VLS_40.slots;
    (button.name);
    // @ts-ignore
    [buttons,];
    var __VLS_40;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hotkeys-item__content" },
    });
    /** @type {__VLS_StyleScopedClasses['hotkeys-item__content']} */ ;
    for (const [key, hotKeysIndex] of __VLS_vFor((button.hotKeys))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (key),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.kbd, __VLS_intrinsics.kbd)({});
        (key);
        if (hotKeysIndex + 1 < button.hotKeys.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            let __VLS_43;
            /** @ts-ignore @type { | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text'] | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text']} */
            elText;
            // @ts-ignore
            const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({}));
            const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
            const { default: __VLS_48 } = __VLS_46.slots;
            // @ts-ignore
            [];
            var __VLS_46;
        }
        // @ts-ignore
        [];
    }
    if (button.hotKeys.length == 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    let __VLS_49;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.recordKeyDowning),
        text: true,
        icon: (__VLS_ctx.Edit),
    }));
    const __VLS_51 = __VLS_50({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.recordKeyDowning),
        text: true,
        icon: (__VLS_ctx.Edit),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    let __VLS_54;
    const __VLS_55 = {
        /** @type {typeof __VLS_54.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.recordKeyDown(buttonIndex);
            // @ts-ignore
            [recordKeyDowning, Edit, recordKeyDown,];
        },
    };
    const { default: __VLS_56 } = __VLS_52.slots;
    // @ts-ignore
    [];
    var __VLS_52;
    var __VLS_53;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_19;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
