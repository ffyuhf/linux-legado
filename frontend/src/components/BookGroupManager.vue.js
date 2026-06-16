/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useBookGroupStore } from '@/store/bookGroupStore';
const props = defineProps();
const __VLS_emit = defineEmits();
const visible = ref(props.modelValue);
const store = useBookGroupStore();
const editVisible = ref(false);
const editForm = reactive({
    groupName: '',
    order: 0,
});
/** 对话框打开时加载分组 */
const onOpen = async () => {
    await store.loadGroups();
};
/** 新增分组 */
const addGroup = () => {
    editForm.groupId = undefined;
    editForm.groupName = '';
    editForm.order = store.groups.length;
    editVisible.value = true;
};
/** 编辑分组 */
const editGroup = (row) => {
    editForm.groupId = row.groupId;
    editForm.groupName = row.groupName;
    editForm.order = row.order;
    editVisible.value = true;
};
/** 确认删除 */
const confirmDelete = (row) => {
    ElMessageBox.confirm(`确定删除分组「${row.groupName}」吗？`, '警告', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }).then(async () => {
        await store.removeGroup(row.groupId);
    }).catch(() => { });
};
/** 保存分组 */
const saveGroup = async () => {
    if (!editForm.groupName.trim()) {
        ElMessage.warning('分组名称不能为空');
        return;
    }
    await store.saveGroup({
        groupId: editForm.groupId,
        groupName: editForm.groupName,
        order: editForm.order,
    });
    editVisible.value = false;
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
    title: "分组管理",
    width: "600px",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onOpen': {} },
    modelValue: (__VLS_ctx.visible),
    title: "分组管理",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = {
    /** @type {typeof __VLS_5.open} */
    onOpen: (__VLS_ctx.onOpen),
};
var __VLS_7;
const { default: __VLS_8 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.store.loading) }, null, null);
let __VLS_9;
/** @ts-ignore @type { | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table'] | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table']} */
elTable;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    data: (__VLS_ctx.store.groups),
    border: true,
    ...{ style: {} },
}));
const __VLS_11 = __VLS_10({
    data: (__VLS_ctx.store.groups),
    border: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
const { default: __VLS_14 } = __VLS_12.slots;
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    prop: "groupName",
    label: "分组名称",
    minWidth: "120",
}));
const __VLS_17 = __VLS_16({
    prop: "groupName",
    label: "分组名称",
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    prop: "order",
    label: "排序",
    width: "80",
}));
const __VLS_22 = __VLS_21({
    prop: "order",
    label: "排序",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_25;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    label: "操作",
    width: "150",
}));
const __VLS_27 = __VLS_26({
    label: "操作",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
{
    const { default: __VLS_31 } = __VLS_28.slots;
    const [{ row }] = __VLS_vSlot(__VLS_31);
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_37;
    const __VLS_38 = {
        /** @type {typeof __VLS_37.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.editGroup(row);
            // @ts-ignore
            [visible, onOpen, vLoading, store, store, editGroup,];
        },
    };
    const { default: __VLS_39 } = __VLS_35.slots;
    // @ts-ignore
    [];
    var __VLS_35;
    var __VLS_36;
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_45;
    const __VLS_46 = {
        /** @type {typeof __VLS_45.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.confirmDelete(row);
            // @ts-ignore
            [confirmDelete,];
        },
    };
    const { default: __VLS_47 } = __VLS_43.slots;
    // @ts-ignore
    [];
    var __VLS_43;
    var __VLS_44;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_28;
// @ts-ignore
[];
var __VLS_12;
let __VLS_48;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    ...{ class: "mt-12" },
    type: "primary",
    plain: true,
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    ...{ class: "mt-12" },
    type: "primary",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_53;
const __VLS_54 = {
    /** @type {typeof __VLS_53.click} */
    onClick: (__VLS_ctx.addGroup),
};
/** @type {__VLS_StyleScopedClasses['mt-12']} */ ;
const { default: __VLS_55 } = __VLS_51.slots;
// @ts-ignore
[addGroup,];
var __VLS_51;
var __VLS_52;
let __VLS_56;
/** @ts-ignore @type { | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components['el-dialog'] | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components['el-dialog']} */
elDialog;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.editVisible),
    title: "编辑分组",
    width: "400px",
    appendToBody: true,
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.editVisible),
    title: "编辑分组",
    width: "400px",
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
const { default: __VLS_61 } = __VLS_59.slots;
let __VLS_62;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    labelWidth: "80px",
}));
const __VLS_64 = __VLS_63({
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
const { default: __VLS_67 } = __VLS_65.slots;
let __VLS_68;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
    label: "名称",
}));
const __VLS_70 = __VLS_69({
    label: "名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const { default: __VLS_73 } = __VLS_71.slots;
let __VLS_74;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    modelValue: (__VLS_ctx.editForm.groupName),
    placeholder: "分组名称",
}));
const __VLS_76 = __VLS_75({
    modelValue: (__VLS_ctx.editForm.groupName),
    placeholder: "分组名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
// @ts-ignore
[editVisible, editForm,];
var __VLS_71;
let __VLS_79;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
    label: "排序",
}));
const __VLS_81 = __VLS_80({
    label: "排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
const { default: __VLS_84 } = __VLS_82.slots;
let __VLS_85;
/** @ts-ignore @type { | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components['el-input-number']} */
elInputNumber;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    modelValue: (__VLS_ctx.editForm.order),
    min: (0),
}));
const __VLS_87 = __VLS_86({
    modelValue: (__VLS_ctx.editForm.order),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
// @ts-ignore
[editForm,];
var __VLS_82;
// @ts-ignore
[];
var __VLS_65;
{
    const { footer: __VLS_90 } = __VLS_59.slots;
    let __VLS_91;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
        ...{ 'onClick': {} },
    }));
    const __VLS_93 = __VLS_92({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    let __VLS_96;
    const __VLS_97 = {
        /** @type {typeof __VLS_96.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.editVisible = false;
            // @ts-ignore
            [editVisible,];
        },
    };
    const { default: __VLS_98 } = __VLS_94.slots;
    // @ts-ignore
    [];
    var __VLS_94;
    var __VLS_95;
    let __VLS_99;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.store.saving),
    }));
    const __VLS_101 = __VLS_100({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.store.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_104;
    const __VLS_105 = {
        /** @type {typeof __VLS_104.click} */
        onClick: (__VLS_ctx.saveGroup),
    };
    const { default: __VLS_106 } = __VLS_102.slots;
    // @ts-ignore
    [store, saveGroup,];
    var __VLS_102;
    var __VLS_103;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_59;
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
