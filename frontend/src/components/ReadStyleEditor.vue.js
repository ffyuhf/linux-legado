/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive } from 'vue';
import API from '@api';
import { ElMessage, ElMessageBox } from 'element-plus';
const props = defineProps();
const __VLS_emit = defineEmits();
const visible = ref(props.modelValue);
const loading = ref(false);
const saving = ref(false);
const configs = ref([]);
const currentConfig = ref(null);
/** 当前选中的排版方案索引（阶段八补全，用于"设为当前"状态高亮） */
const currentIndex = ref(0);
/** 共享排版配置（v3.2 新增） */
const shareConfig = ref(null);
const shareSaving = ref(false);
/** 加载排版方案列表 */
const loadConfigs = async () => {
    loading.value = true;
    try {
        const { data } = await API.getReadConfigs();
        if (data.isSuccess && data.data) {
            configs.value = data.data;
            if (configs.value.length > 0 && !currentConfig.value) {
                currentConfig.value = reactive({ ...configs.value[0] });
            }
        }
    }
    catch (e) {
        ElMessage.error('加载排版方案失败: ' + e.message);
    }
    finally {
        loading.value = false;
    }
};
/**
 * 加载共享排版配置（v3.2 新增）
 * 调用 GET /getShareReadConfig 获取跨方案共享的布局参数
 */
const loadShareConfig = async () => {
    try {
        const { data } = await API.getShareReadConfig();
        if (data.isSuccess && data.data) {
            shareConfig.value = reactive({ ...data.data });
        }
    }
    catch (e) {
        ElMessage.error('加载共享配置失败: ' + e.message);
    }
};
/** 对话框打开时加载方案列表与共享配置 */
const onOpen = async () => {
    await loadConfigs();
    await loadShareConfig();
};
/** 新增方案 */
const addConfig = () => {
    currentConfig.value = reactive({
        name: '新方案',
        bgStr: '#EEEEEE',
        bgStrNight: '#000000',
        bgStrEInk: '#FFFFFF',
        textColor: '#3E3D3B',
        textColorNight: '#ADADAD',
        textColorEInk: '#000000',
        textSize: 20,
        lineSpacingExtra: 12,
        paragraphSpacing: 2,
        letterSpacing: 0.1,
        titleMode: 0,
    });
};
/** 编辑方案 */
const editConfig = (row) => {
    currentConfig.value = reactive({ ...row });
};
/** 删除方案 */
const deleteConfig = async (index) => {
    ElMessageBox.confirm('确定删除此排版方案吗？', '警告', {
        type: 'warning',
    }).then(async () => {
        try {
            const { data } = await API.deleteReadConfig(index);
            if (data.isSuccess) {
                ElMessage.success('方案已删除');
                await loadConfigs();
            }
        }
        catch (e) {
            ElMessage.error('删除失败: ' + e.message);
        }
    }).catch(() => { });
};
/**
 * 保存当前方案
 */
const saveCurrent = async () => {
    if (!currentConfig.value)
        return;
    saving.value = true;
    try {
        const { data } = await API.saveReadConfigItem(currentConfig.value);
        if (data.isSuccess) {
            ElMessage.success('方案已保存');
            await loadConfigs();
        }
    }
    catch (e) {
        ElMessage.error('保存失败: ' + e.message);
    }
    finally {
        saving.value = false;
    }
};
/**
 * 保存共享排版配置（v3.2 新增）
 * 调用 POST /saveShareReadConfig 持久化共享布局参数
 */
const saveShareConfig = async () => {
    if (!shareConfig.value)
        return;
    shareSaving.value = true;
    try {
        const { data } = await API.saveShareReadConfig(shareConfig.value);
        if (data.isSuccess) {
            ElMessage.success('共享配置已保存');
        }
        else {
            ElMessage.error(data.errorMsg || '保存共享配置失败');
        }
    }
    catch (e) {
        ElMessage.error('保存共享配置失败: ' + e.message);
    }
    finally {
        shareSaving.value = false;
    }
};
/**
 * 设为当前排版方案（阶段八补全）
 *
 * 调用 POST /setReadStyleSelect，后端将 index 写入 readStyleSelect 配置项。
 * index 对应普通方案列表（styleType=0）中的顺序索引。
 *
 * @param index 方案索引
 */
const setAsCurrent = async (index) => {
    saving.value = true;
    try {
        const { data } = await API.setReadStyleSelect(index, false);
        if (data.isSuccess) {
            ElMessage.success('已设为当前排版方案');
            currentIndex.value = index;
            await loadConfigs();
        }
        else {
            ElMessage.error(data.errorMsg || '设置失败');
        }
    }
    catch (e) {
        ElMessage.error('设置失败: ' + e.message);
    }
    finally {
        saving.value = false;
    }
};
/**
 * 判断指定方案是否为当前选中的排版方案
 * @param index 方案索引
 */
const isCurrentStyle = (index) => {
    return currentIndex.value === index;
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
    title: "排版方案管理",
    width: "800px",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onOpen': {} },
    modelValue: (__VLS_ctx.visible),
    title: "排版方案管理",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = {
    /** @type {typeof __VLS_5.open} */
    onOpen: (__VLS_ctx.onOpen),
};
var __VLS_7;
const { default: __VLS_8 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
let __VLS_9;
/** @ts-ignore @type { | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table'] | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table']} */
elTable;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    data: (__VLS_ctx.configs),
    border: true,
    ...{ style: {} },
    maxHeight: "300",
}));
const __VLS_11 = __VLS_10({
    data: (__VLS_ctx.configs),
    border: true,
    ...{ style: {} },
    maxHeight: "300",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
const { default: __VLS_14 } = __VLS_12.slots;
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    prop: "name",
    label: "方案名称",
    width: "120",
}));
const __VLS_17 = __VLS_16({
    prop: "name",
    label: "方案名称",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    label: "日间背景",
    width: "100",
}));
const __VLS_22 = __VLS_21({
    label: "日间背景",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const { default: __VLS_25 } = __VLS_23.slots;
{
    const { default: __VLS_26 } = __VLS_23.slots;
    const [{ row }] = __VLS_vSlot(__VLS_26);
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        modelValue: (row.bgStr),
        size: "small",
    }));
    const __VLS_29 = __VLS_28({
        modelValue: (row.bgStr),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    // @ts-ignore
    [visible, onOpen, vLoading, loading, configs,];
}
// @ts-ignore
[];
var __VLS_23;
let __VLS_32;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    label: "夜间背景",
    width: "100",
}));
const __VLS_34 = __VLS_33({
    label: "夜间背景",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const { default: __VLS_37 } = __VLS_35.slots;
{
    const { default: __VLS_38 } = __VLS_35.slots;
    const [{ row }] = __VLS_vSlot(__VLS_38);
    let __VLS_39;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        modelValue: (row.bgStrNight),
        size: "small",
    }));
    const __VLS_41 = __VLS_40({
        modelValue: (row.bgStrNight),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_35;
let __VLS_44;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    label: "文字颜色",
    width: "100",
}));
const __VLS_46 = __VLS_45({
    label: "文字颜色",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_49 } = __VLS_47.slots;
{
    const { default: __VLS_50 } = __VLS_47.slots;
    const [{ row }] = __VLS_vSlot(__VLS_50);
    let __VLS_51;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        modelValue: (row.textColor),
        size: "small",
    }));
    const __VLS_53 = __VLS_52({
        modelValue: (row.textColor),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_47;
let __VLS_56;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    prop: "textSize",
    label: "字号",
    width: "60",
}));
const __VLS_58 = __VLS_57({
    prop: "textSize",
    label: "字号",
    width: "60",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_61;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    label: "操作",
    width: "220",
}));
const __VLS_63 = __VLS_62({
    label: "操作",
    width: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const { default: __VLS_66 } = __VLS_64.slots;
{
    const { default: __VLS_67 } = __VLS_64.slots;
    const [{ row, $index }] = __VLS_vSlot(__VLS_67);
    let __VLS_68;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_73;
    const __VLS_74 = {
        /** @type {typeof __VLS_73.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.editConfig(row);
            // @ts-ignore
            [editConfig,];
        },
    };
    const { default: __VLS_75 } = __VLS_71.slots;
    // @ts-ignore
    [];
    var __VLS_71;
    var __VLS_72;
    let __VLS_76;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        size: "small",
        type: "success",
        disabled: (__VLS_ctx.isCurrentStyle($index)),
        title: "设为当前排版方案",
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        size: "small",
        type: "success",
        disabled: (__VLS_ctx.isCurrentStyle($index)),
        title: "设为当前排版方案",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_81;
    const __VLS_82 = {
        /** @type {typeof __VLS_81.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.setAsCurrent($index);
            // @ts-ignore
            [isCurrentStyle, setAsCurrent,];
        },
    };
    const { default: __VLS_83 } = __VLS_79.slots;
    // @ts-ignore
    [];
    var __VLS_79;
    var __VLS_80;
    let __VLS_84;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        disabled: (__VLS_ctx.configs.length <= 1),
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        disabled: (__VLS_ctx.configs.length <= 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_89;
    const __VLS_90 = {
        /** @type {typeof __VLS_89.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.deleteConfig($index);
            // @ts-ignore
            [configs, deleteConfig,];
        },
    };
    const { default: __VLS_91 } = __VLS_87.slots;
    // @ts-ignore
    [];
    var __VLS_87;
    var __VLS_88;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_64;
// @ts-ignore
[];
var __VLS_12;
let __VLS_92;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    ...{ class: "mt-12" },
    type: "primary",
    plain: true,
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    ...{ class: "mt-12" },
    type: "primary",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_97;
const __VLS_98 = {
    /** @type {typeof __VLS_97.click} */
    onClick: (__VLS_ctx.addConfig),
};
/** @type {__VLS_StyleScopedClasses['mt-12']} */ ;
const { default: __VLS_99 } = __VLS_95.slots;
// @ts-ignore
[addConfig,];
var __VLS_95;
var __VLS_96;
let __VLS_100;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
    contentPosition: "left",
}));
const __VLS_102 = __VLS_101({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const { default: __VLS_105 } = __VLS_103.slots;
// @ts-ignore
[];
var __VLS_103;
if (__VLS_ctx.shareConfig) {
    let __VLS_106;
    /** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
    elForm;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
        labelWidth: "120px",
        ...{ class: "share-form" },
    }));
    const __VLS_108 = __VLS_107({
        labelWidth: "120px",
        ...{ class: "share-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    /** @type {__VLS_StyleScopedClasses['share-form']} */ ;
    const { default: __VLS_111 } = __VLS_109.slots;
    let __VLS_112;
    /** @ts-ignore @type { | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row'] | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row']} */
    elRow;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
        gutter: (16),
    }));
    const __VLS_114 = __VLS_113({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const { default: __VLS_117 } = __VLS_115.slots;
    let __VLS_118;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
        span: (8),
    }));
    const __VLS_120 = __VLS_119({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    const { default: __VLS_123 } = __VLS_121.slots;
    let __VLS_124;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
        label: "正文宽度%",
    }));
    const __VLS_126 = __VLS_125({
        label: "正文宽度%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const { default: __VLS_129 } = __VLS_127.slots;
    let __VLS_130;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
        modelValue: (__VLS_ctx.shareConfig.textMaxWidth),
        min: (30),
        max: (100),
    }));
    const __VLS_132 = __VLS_131({
        modelValue: (__VLS_ctx.shareConfig.textMaxWidth),
        min: (30),
        max: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    // @ts-ignore
    [shareConfig, shareConfig,];
    var __VLS_127;
    // @ts-ignore
    [];
    var __VLS_121;
    let __VLS_135;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
        span: (8),
    }));
    const __VLS_137 = __VLS_136({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    const { default: __VLS_140 } = __VLS_138.slots;
    let __VLS_141;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
        label: "左边距",
    }));
    const __VLS_143 = __VLS_142({
        label: "左边距",
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    const { default: __VLS_146 } = __VLS_144.slots;
    let __VLS_147;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
        modelValue: (__VLS_ctx.shareConfig.paddingLeft),
        min: (0),
        max: (100),
    }));
    const __VLS_149 = __VLS_148({
        modelValue: (__VLS_ctx.shareConfig.paddingLeft),
        min: (0),
        max: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    // @ts-ignore
    [shareConfig,];
    var __VLS_144;
    // @ts-ignore
    [];
    var __VLS_138;
    let __VLS_152;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
        span: (8),
    }));
    const __VLS_154 = __VLS_153({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    const { default: __VLS_157 } = __VLS_155.slots;
    let __VLS_158;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
        label: "上边距",
    }));
    const __VLS_160 = __VLS_159({
        label: "上边距",
    }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    const { default: __VLS_163 } = __VLS_161.slots;
    let __VLS_164;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
        modelValue: (__VLS_ctx.shareConfig.paddingTop),
        min: (0),
        max: (100),
    }));
    const __VLS_166 = __VLS_165({
        modelValue: (__VLS_ctx.shareConfig.paddingTop),
        min: (0),
        max: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    // @ts-ignore
    [shareConfig,];
    var __VLS_161;
    // @ts-ignore
    [];
    var __VLS_155;
    // @ts-ignore
    [];
    var __VLS_115;
    let __VLS_169;
    /** @ts-ignore @type { | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row'] | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row']} */
    elRow;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
        gutter: (16),
    }));
    const __VLS_171 = __VLS_170({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    const { default: __VLS_174 } = __VLS_172.slots;
    let __VLS_175;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
        span: (8),
    }));
    const __VLS_177 = __VLS_176({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    const { default: __VLS_180 } = __VLS_178.slots;
    let __VLS_181;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
        label: "顶部边距%",
    }));
    const __VLS_183 = __VLS_182({
        label: "顶部边距%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    const { default: __VLS_186 } = __VLS_184.slots;
    let __VLS_187;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
        modelValue: (__VLS_ctx.shareConfig.paddingTopPercent),
        min: (0),
        max: (50),
    }));
    const __VLS_189 = __VLS_188({
        modelValue: (__VLS_ctx.shareConfig.paddingTopPercent),
        min: (0),
        max: (50),
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    // @ts-ignore
    [shareConfig,];
    var __VLS_184;
    // @ts-ignore
    [];
    var __VLS_178;
    let __VLS_192;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({
        span: (8),
    }));
    const __VLS_194 = __VLS_193({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    const { default: __VLS_197 } = __VLS_195.slots;
    let __VLS_198;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
        label: "底部边距%",
    }));
    const __VLS_200 = __VLS_199({
        label: "底部边距%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    const { default: __VLS_203 } = __VLS_201.slots;
    let __VLS_204;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
        modelValue: (__VLS_ctx.shareConfig.paddingBottom),
        min: (0),
        max: (50),
    }));
    const __VLS_206 = __VLS_205({
        modelValue: (__VLS_ctx.shareConfig.paddingBottom),
        min: (0),
        max: (50),
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    // @ts-ignore
    [shareConfig,];
    var __VLS_201;
    // @ts-ignore
    [];
    var __VLS_195;
    let __VLS_209;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({
        span: (8),
    }));
    const __VLS_211 = __VLS_210({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    const { default: __VLS_214 } = __VLS_212.slots;
    let __VLS_215;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({
        label: "行距倍数",
    }));
    const __VLS_217 = __VLS_216({
        label: "行距倍数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    const { default: __VLS_220 } = __VLS_218.slots;
    let __VLS_221;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({
        modelValue: (__VLS_ctx.shareConfig.lineSpacingMultiplier),
        step: (0.05),
        min: (0.8),
        max: (3),
    }));
    const __VLS_223 = __VLS_222({
        modelValue: (__VLS_ctx.shareConfig.lineSpacingMultiplier),
        step: (0.05),
        min: (0.8),
        max: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_222));
    // @ts-ignore
    [shareConfig,];
    var __VLS_218;
    // @ts-ignore
    [];
    var __VLS_212;
    // @ts-ignore
    [];
    var __VLS_172;
    let __VLS_226;
    /** @ts-ignore @type { | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row'] | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row']} */
    elRow;
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent1(__VLS_226, new __VLS_226({
        gutter: (16),
    }));
    const __VLS_228 = __VLS_227({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    const { default: __VLS_231 } = __VLS_229.slots;
    let __VLS_232;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent1(__VLS_232, new __VLS_232({
        span: (12),
    }));
    const __VLS_234 = __VLS_233({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    const { default: __VLS_237 } = __VLS_235.slots;
    let __VLS_238;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent1(__VLS_238, new __VLS_238({
        label: "首行缩进",
    }));
    const __VLS_240 = __VLS_239({
        label: "首行缩进",
    }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    const { default: __VLS_243 } = __VLS_241.slots;
    let __VLS_244;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({
        modelValue: (__VLS_ctx.shareConfig.firstLineIndent),
        min: (0),
        max: (200),
    }));
    const __VLS_246 = __VLS_245({
        modelValue: (__VLS_ctx.shareConfig.firstLineIndent),
        min: (0),
        max: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    // @ts-ignore
    [shareConfig,];
    var __VLS_241;
    // @ts-ignore
    [];
    var __VLS_235;
    let __VLS_249;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249({
        span: (12),
    }));
    const __VLS_251 = __VLS_250({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_250));
    const { default: __VLS_254 } = __VLS_252.slots;
    let __VLS_255;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({
        label: "段间距倍数",
    }));
    const __VLS_257 = __VLS_256({
        label: "段间距倍数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_256));
    const { default: __VLS_260 } = __VLS_258.slots;
    let __VLS_261;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({
        modelValue: (__VLS_ctx.shareConfig.paragraphSpacing),
        step: (0.1),
        min: (0),
        max: (10),
    }));
    const __VLS_263 = __VLS_262({
        modelValue: (__VLS_ctx.shareConfig.paragraphSpacing),
        step: (0.1),
        min: (0),
        max: (10),
    }, ...__VLS_functionalComponentArgsRest(__VLS_262));
    // @ts-ignore
    [shareConfig,];
    var __VLS_258;
    // @ts-ignore
    [];
    var __VLS_252;
    // @ts-ignore
    [];
    var __VLS_229;
    let __VLS_266;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({}));
    const __VLS_268 = __VLS_267({}, ...__VLS_functionalComponentArgsRest(__VLS_267));
    const { default: __VLS_271 } = __VLS_269.slots;
    let __VLS_272;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent1(__VLS_272, new __VLS_272({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.shareSaving),
    }));
    const __VLS_274 = __VLS_273({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.shareSaving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    let __VLS_277;
    const __VLS_278 = {
        /** @type {typeof __VLS_277.click} */
        onClick: (__VLS_ctx.saveShareConfig),
    };
    const { default: __VLS_279 } = __VLS_275.slots;
    // @ts-ignore
    [shareSaving, saveShareConfig,];
    var __VLS_275;
    var __VLS_276;
    // @ts-ignore
    [];
    var __VLS_269;
    // @ts-ignore
    [];
    var __VLS_109;
}
let __VLS_280;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent1(__VLS_280, new __VLS_280({
    contentPosition: "left",
}));
const __VLS_282 = __VLS_281({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
const { default: __VLS_285 } = __VLS_283.slots;
// @ts-ignore
[];
var __VLS_283;
if (__VLS_ctx.currentConfig) {
    let __VLS_286;
    /** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
    elForm;
    // @ts-ignore
    const __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286({
        labelWidth: "100px",
        ...{ class: "config-form" },
    }));
    const __VLS_288 = __VLS_287({
        labelWidth: "100px",
        ...{ class: "config-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_287));
    /** @type {__VLS_StyleScopedClasses['config-form']} */ ;
    const { default: __VLS_291 } = __VLS_289.slots;
    let __VLS_292;
    /** @ts-ignore @type { | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row'] | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row']} */
    elRow;
    // @ts-ignore
    const __VLS_293 = __VLS_asFunctionalComponent1(__VLS_292, new __VLS_292({
        gutter: (16),
    }));
    const __VLS_294 = __VLS_293({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_293));
    const { default: __VLS_297 } = __VLS_295.slots;
    let __VLS_298;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_299 = __VLS_asFunctionalComponent1(__VLS_298, new __VLS_298({
        span: (8),
    }));
    const __VLS_300 = __VLS_299({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_299));
    const { default: __VLS_303 } = __VLS_301.slots;
    let __VLS_304;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent1(__VLS_304, new __VLS_304({
        label: "方案名称",
    }));
    const __VLS_306 = __VLS_305({
        label: "方案名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    const { default: __VLS_309 } = __VLS_307.slots;
    let __VLS_310;
    /** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
    elInput;
    // @ts-ignore
    const __VLS_311 = __VLS_asFunctionalComponent1(__VLS_310, new __VLS_310({
        modelValue: (__VLS_ctx.currentConfig.name),
    }));
    const __VLS_312 = __VLS_311({
        modelValue: (__VLS_ctx.currentConfig.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_311));
    // @ts-ignore
    [currentConfig, currentConfig,];
    var __VLS_307;
    // @ts-ignore
    [];
    var __VLS_301;
    let __VLS_315;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_316 = __VLS_asFunctionalComponent1(__VLS_315, new __VLS_315({
        span: (8),
    }));
    const __VLS_317 = __VLS_316({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_316));
    const { default: __VLS_320 } = __VLS_318.slots;
    let __VLS_321;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_322 = __VLS_asFunctionalComponent1(__VLS_321, new __VLS_321({
        label: "字号",
    }));
    const __VLS_323 = __VLS_322({
        label: "字号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_322));
    const { default: __VLS_326 } = __VLS_324.slots;
    let __VLS_327;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_328 = __VLS_asFunctionalComponent1(__VLS_327, new __VLS_327({
        modelValue: (__VLS_ctx.currentConfig.textSize),
        min: (12),
        max: (48),
    }));
    const __VLS_329 = __VLS_328({
        modelValue: (__VLS_ctx.currentConfig.textSize),
        min: (12),
        max: (48),
    }, ...__VLS_functionalComponentArgsRest(__VLS_328));
    // @ts-ignore
    [currentConfig,];
    var __VLS_324;
    // @ts-ignore
    [];
    var __VLS_318;
    let __VLS_332;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_333 = __VLS_asFunctionalComponent1(__VLS_332, new __VLS_332({
        span: (8),
    }));
    const __VLS_334 = __VLS_333({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_333));
    const { default: __VLS_337 } = __VLS_335.slots;
    let __VLS_338;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_339 = __VLS_asFunctionalComponent1(__VLS_338, new __VLS_338({
        label: "行距",
    }));
    const __VLS_340 = __VLS_339({
        label: "行距",
    }, ...__VLS_functionalComponentArgsRest(__VLS_339));
    const { default: __VLS_343 } = __VLS_341.slots;
    let __VLS_344;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_345 = __VLS_asFunctionalComponent1(__VLS_344, new __VLS_344({
        modelValue: (__VLS_ctx.currentConfig.lineSpacingExtra),
        min: (0),
        max: (50),
    }));
    const __VLS_346 = __VLS_345({
        modelValue: (__VLS_ctx.currentConfig.lineSpacingExtra),
        min: (0),
        max: (50),
    }, ...__VLS_functionalComponentArgsRest(__VLS_345));
    // @ts-ignore
    [currentConfig,];
    var __VLS_341;
    // @ts-ignore
    [];
    var __VLS_335;
    // @ts-ignore
    [];
    var __VLS_295;
    let __VLS_349;
    /** @ts-ignore @type { | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row'] | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row']} */
    elRow;
    // @ts-ignore
    const __VLS_350 = __VLS_asFunctionalComponent1(__VLS_349, new __VLS_349({
        gutter: (16),
    }));
    const __VLS_351 = __VLS_350({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_350));
    const { default: __VLS_354 } = __VLS_352.slots;
    let __VLS_355;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_356 = __VLS_asFunctionalComponent1(__VLS_355, new __VLS_355({
        span: (8),
    }));
    const __VLS_357 = __VLS_356({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_356));
    const { default: __VLS_360 } = __VLS_358.slots;
    let __VLS_361;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_362 = __VLS_asFunctionalComponent1(__VLS_361, new __VLS_361({
        label: "日间背景",
    }));
    const __VLS_363 = __VLS_362({
        label: "日间背景",
    }, ...__VLS_functionalComponentArgsRest(__VLS_362));
    const { default: __VLS_366 } = __VLS_364.slots;
    let __VLS_367;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_368 = __VLS_asFunctionalComponent1(__VLS_367, new __VLS_367({
        modelValue: (__VLS_ctx.currentConfig.bgStr),
    }));
    const __VLS_369 = __VLS_368({
        modelValue: (__VLS_ctx.currentConfig.bgStr),
    }, ...__VLS_functionalComponentArgsRest(__VLS_368));
    // @ts-ignore
    [currentConfig,];
    var __VLS_364;
    // @ts-ignore
    [];
    var __VLS_358;
    let __VLS_372;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_373 = __VLS_asFunctionalComponent1(__VLS_372, new __VLS_372({
        span: (8),
    }));
    const __VLS_374 = __VLS_373({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_373));
    const { default: __VLS_377 } = __VLS_375.slots;
    let __VLS_378;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_379 = __VLS_asFunctionalComponent1(__VLS_378, new __VLS_378({
        label: "夜间背景",
    }));
    const __VLS_380 = __VLS_379({
        label: "夜间背景",
    }, ...__VLS_functionalComponentArgsRest(__VLS_379));
    const { default: __VLS_383 } = __VLS_381.slots;
    let __VLS_384;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent1(__VLS_384, new __VLS_384({
        modelValue: (__VLS_ctx.currentConfig.bgStrNight),
    }));
    const __VLS_386 = __VLS_385({
        modelValue: (__VLS_ctx.currentConfig.bgStrNight),
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    // @ts-ignore
    [currentConfig,];
    var __VLS_381;
    // @ts-ignore
    [];
    var __VLS_375;
    let __VLS_389;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_390 = __VLS_asFunctionalComponent1(__VLS_389, new __VLS_389({
        span: (8),
    }));
    const __VLS_391 = __VLS_390({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_390));
    const { default: __VLS_394 } = __VLS_392.slots;
    let __VLS_395;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_396 = __VLS_asFunctionalComponent1(__VLS_395, new __VLS_395({
        label: "EInk背景",
    }));
    const __VLS_397 = __VLS_396({
        label: "EInk背景",
    }, ...__VLS_functionalComponentArgsRest(__VLS_396));
    const { default: __VLS_400 } = __VLS_398.slots;
    let __VLS_401;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_402 = __VLS_asFunctionalComponent1(__VLS_401, new __VLS_401({
        modelValue: (__VLS_ctx.currentConfig.bgStrEInk),
    }));
    const __VLS_403 = __VLS_402({
        modelValue: (__VLS_ctx.currentConfig.bgStrEInk),
    }, ...__VLS_functionalComponentArgsRest(__VLS_402));
    // @ts-ignore
    [currentConfig,];
    var __VLS_398;
    // @ts-ignore
    [];
    var __VLS_392;
    // @ts-ignore
    [];
    var __VLS_352;
    let __VLS_406;
    /** @ts-ignore @type { | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row'] | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row']} */
    elRow;
    // @ts-ignore
    const __VLS_407 = __VLS_asFunctionalComponent1(__VLS_406, new __VLS_406({
        gutter: (16),
    }));
    const __VLS_408 = __VLS_407({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_407));
    const { default: __VLS_411 } = __VLS_409.slots;
    let __VLS_412;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_413 = __VLS_asFunctionalComponent1(__VLS_412, new __VLS_412({
        span: (8),
    }));
    const __VLS_414 = __VLS_413({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_413));
    const { default: __VLS_417 } = __VLS_415.slots;
    let __VLS_418;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_419 = __VLS_asFunctionalComponent1(__VLS_418, new __VLS_418({
        label: "日间文字",
    }));
    const __VLS_420 = __VLS_419({
        label: "日间文字",
    }, ...__VLS_functionalComponentArgsRest(__VLS_419));
    const { default: __VLS_423 } = __VLS_421.slots;
    let __VLS_424;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_425 = __VLS_asFunctionalComponent1(__VLS_424, new __VLS_424({
        modelValue: (__VLS_ctx.currentConfig.textColor),
    }));
    const __VLS_426 = __VLS_425({
        modelValue: (__VLS_ctx.currentConfig.textColor),
    }, ...__VLS_functionalComponentArgsRest(__VLS_425));
    // @ts-ignore
    [currentConfig,];
    var __VLS_421;
    // @ts-ignore
    [];
    var __VLS_415;
    let __VLS_429;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_430 = __VLS_asFunctionalComponent1(__VLS_429, new __VLS_429({
        span: (8),
    }));
    const __VLS_431 = __VLS_430({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_430));
    const { default: __VLS_434 } = __VLS_432.slots;
    let __VLS_435;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_436 = __VLS_asFunctionalComponent1(__VLS_435, new __VLS_435({
        label: "夜间文字",
    }));
    const __VLS_437 = __VLS_436({
        label: "夜间文字",
    }, ...__VLS_functionalComponentArgsRest(__VLS_436));
    const { default: __VLS_440 } = __VLS_438.slots;
    let __VLS_441;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_442 = __VLS_asFunctionalComponent1(__VLS_441, new __VLS_441({
        modelValue: (__VLS_ctx.currentConfig.textColorNight),
    }));
    const __VLS_443 = __VLS_442({
        modelValue: (__VLS_ctx.currentConfig.textColorNight),
    }, ...__VLS_functionalComponentArgsRest(__VLS_442));
    // @ts-ignore
    [currentConfig,];
    var __VLS_438;
    // @ts-ignore
    [];
    var __VLS_432;
    let __VLS_446;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_447 = __VLS_asFunctionalComponent1(__VLS_446, new __VLS_446({
        span: (8),
    }));
    const __VLS_448 = __VLS_447({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_447));
    const { default: __VLS_451 } = __VLS_449.slots;
    let __VLS_452;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_453 = __VLS_asFunctionalComponent1(__VLS_452, new __VLS_452({
        label: "EInk文字",
    }));
    const __VLS_454 = __VLS_453({
        label: "EInk文字",
    }, ...__VLS_functionalComponentArgsRest(__VLS_453));
    const { default: __VLS_457 } = __VLS_455.slots;
    let __VLS_458;
    /** @ts-ignore @type { | typeof __VLS_components.elColorPicker | typeof __VLS_components.ElColorPicker | typeof __VLS_components['el-color-picker']} */
    elColorPicker;
    // @ts-ignore
    const __VLS_459 = __VLS_asFunctionalComponent1(__VLS_458, new __VLS_458({
        modelValue: (__VLS_ctx.currentConfig.textColorEInk),
    }));
    const __VLS_460 = __VLS_459({
        modelValue: (__VLS_ctx.currentConfig.textColorEInk),
    }, ...__VLS_functionalComponentArgsRest(__VLS_459));
    // @ts-ignore
    [currentConfig,];
    var __VLS_455;
    // @ts-ignore
    [];
    var __VLS_449;
    // @ts-ignore
    [];
    var __VLS_409;
    let __VLS_463;
    /** @ts-ignore @type { | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row'] | typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components['el-row']} */
    elRow;
    // @ts-ignore
    const __VLS_464 = __VLS_asFunctionalComponent1(__VLS_463, new __VLS_463({
        gutter: (16),
    }));
    const __VLS_465 = __VLS_464({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_464));
    const { default: __VLS_468 } = __VLS_466.slots;
    let __VLS_469;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_470 = __VLS_asFunctionalComponent1(__VLS_469, new __VLS_469({
        span: (8),
    }));
    const __VLS_471 = __VLS_470({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_470));
    const { default: __VLS_474 } = __VLS_472.slots;
    let __VLS_475;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_476 = __VLS_asFunctionalComponent1(__VLS_475, new __VLS_475({
        label: "段距",
    }));
    const __VLS_477 = __VLS_476({
        label: "段距",
    }, ...__VLS_functionalComponentArgsRest(__VLS_476));
    const { default: __VLS_480 } = __VLS_478.slots;
    let __VLS_481;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_482 = __VLS_asFunctionalComponent1(__VLS_481, new __VLS_481({
        modelValue: (__VLS_ctx.currentConfig.paragraphSpacing),
        min: (0),
        max: (20),
    }));
    const __VLS_483 = __VLS_482({
        modelValue: (__VLS_ctx.currentConfig.paragraphSpacing),
        min: (0),
        max: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_482));
    // @ts-ignore
    [currentConfig,];
    var __VLS_478;
    // @ts-ignore
    [];
    var __VLS_472;
    let __VLS_486;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_487 = __VLS_asFunctionalComponent1(__VLS_486, new __VLS_486({
        span: (8),
    }));
    const __VLS_488 = __VLS_487({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_487));
    const { default: __VLS_491 } = __VLS_489.slots;
    let __VLS_492;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_493 = __VLS_asFunctionalComponent1(__VLS_492, new __VLS_492({
        label: "字间距",
    }));
    const __VLS_494 = __VLS_493({
        label: "字间距",
    }, ...__VLS_functionalComponentArgsRest(__VLS_493));
    const { default: __VLS_497 } = __VLS_495.slots;
    let __VLS_498;
    /** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
    elInputNumber;
    // @ts-ignore
    const __VLS_499 = __VLS_asFunctionalComponent1(__VLS_498, new __VLS_498({
        modelValue: (__VLS_ctx.currentConfig.letterSpacing),
        step: (0.1),
        min: (0),
        max: (2),
    }));
    const __VLS_500 = __VLS_499({
        modelValue: (__VLS_ctx.currentConfig.letterSpacing),
        step: (0.1),
        min: (0),
        max: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_499));
    // @ts-ignore
    [currentConfig,];
    var __VLS_495;
    // @ts-ignore
    [];
    var __VLS_489;
    let __VLS_503;
    /** @ts-ignore @type { | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col'] | typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components['el-col']} */
    elCol;
    // @ts-ignore
    const __VLS_504 = __VLS_asFunctionalComponent1(__VLS_503, new __VLS_503({
        span: (8),
    }));
    const __VLS_505 = __VLS_504({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_504));
    const { default: __VLS_508 } = __VLS_506.slots;
    let __VLS_509;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_510 = __VLS_asFunctionalComponent1(__VLS_509, new __VLS_509({
        label: "标题模式",
    }));
    const __VLS_511 = __VLS_510({
        label: "标题模式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_510));
    const { default: __VLS_514 } = __VLS_512.slots;
    let __VLS_515;
    /** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
    elSelect;
    // @ts-ignore
    const __VLS_516 = __VLS_asFunctionalComponent1(__VLS_515, new __VLS_515({
        modelValue: (__VLS_ctx.currentConfig.titleMode),
    }));
    const __VLS_517 = __VLS_516({
        modelValue: (__VLS_ctx.currentConfig.titleMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_516));
    const { default: __VLS_520 } = __VLS_518.slots;
    let __VLS_521;
    /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
    elOption;
    // @ts-ignore
    const __VLS_522 = __VLS_asFunctionalComponent1(__VLS_521, new __VLS_521({
        value: (0),
        label: "居左",
    }));
    const __VLS_523 = __VLS_522({
        value: (0),
        label: "居左",
    }, ...__VLS_functionalComponentArgsRest(__VLS_522));
    let __VLS_526;
    /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
    elOption;
    // @ts-ignore
    const __VLS_527 = __VLS_asFunctionalComponent1(__VLS_526, new __VLS_526({
        value: (1),
        label: "居中",
    }));
    const __VLS_528 = __VLS_527({
        value: (1),
        label: "居中",
    }, ...__VLS_functionalComponentArgsRest(__VLS_527));
    let __VLS_531;
    /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
    elOption;
    // @ts-ignore
    const __VLS_532 = __VLS_asFunctionalComponent1(__VLS_531, new __VLS_531({
        value: (2),
        label: "隐藏",
    }));
    const __VLS_533 = __VLS_532({
        value: (2),
        label: "隐藏",
    }, ...__VLS_functionalComponentArgsRest(__VLS_532));
    // @ts-ignore
    [currentConfig,];
    var __VLS_518;
    // @ts-ignore
    [];
    var __VLS_512;
    // @ts-ignore
    [];
    var __VLS_506;
    // @ts-ignore
    [];
    var __VLS_466;
    let __VLS_536;
    /** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
    elFormItem;
    // @ts-ignore
    const __VLS_537 = __VLS_asFunctionalComponent1(__VLS_536, new __VLS_536({}));
    const __VLS_538 = __VLS_537({}, ...__VLS_functionalComponentArgsRest(__VLS_537));
    const { default: __VLS_541 } = __VLS_539.slots;
    let __VLS_542;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_543 = __VLS_asFunctionalComponent1(__VLS_542, new __VLS_542({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_544 = __VLS_543({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_543));
    let __VLS_547;
    const __VLS_548 = {
        /** @type {typeof __VLS_547.click} */
        onClick: (__VLS_ctx.saveCurrent),
    };
    const { default: __VLS_549 } = __VLS_545.slots;
    // @ts-ignore
    [saving, saveCurrent,];
    var __VLS_545;
    var __VLS_546;
    // @ts-ignore
    [];
    var __VLS_539;
    // @ts-ignore
    [];
    var __VLS_289;
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
