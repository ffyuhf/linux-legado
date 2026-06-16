/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
/**
 * 系统操作合集组件逻辑
 *
 * 数据层：
 * - 缓存管理 → useCacheStore
 * - 备份恢复 → useBackupStore
 * - 本地导入 → 直接调用 API.addLocalBook
 * - 搜索历史 → 直接调用 API.getSearchHistory/saveSearchHistory/clearSearchHistory
 * - 分组列表 → useBookGroupStore（供导入时选择目标分组）
 */
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import API from '@api';
import { useCacheStore, useBackupStore, useBookGroupStore } from '@/store';
const cache = useCacheStore();
const backup = useBackupStore();
const groupStore = useBookGroupStore();
/** 分组列表（供本地导入选择） */
const groups = groupStore.groups;
// ==================== 备份选项 ====================
const backupOpts = reactive({
    includeBooks: true,
    includeSources: true,
    includeConfigs: true,
});
/** 创建备份 */
const handleBackup = () => {
    backup.createBackup({ ...backupOpts });
};
/** 上传 zip 恢复（el-upload before-upload 钩子，返回 false 阻止默认上传） */
const handleRestore = async (file) => {
    try {
        await ElMessageBox.confirm('恢复将覆盖现有数据，确定继续吗？', '恢复确认', { type: 'warning', confirmButtonText: '确定恢复', cancelButtonText: '取消' });
    }
    catch {
        return false;
    }
    await backup.restoreBackup(file);
    return false;
};
/** 从 JSON 文件导入书源 */
const handleImportSources = async (file) => {
    await backup.importSourcesFromFile(file);
    return false;
};
// ==================== 缓存清理 ====================
/** 清除内容缓存（带确认） */
const handleClearContent = async () => {
    try {
        await ElMessageBox.confirm('确定清除全部内容缓存吗？', '提示', {
            type: 'warning',
        });
    }
    catch {
        return;
    }
    await cache.clearContentOnly();
};
/** 清除全部缓存（带确认） */
const handleClearAll = async () => {
    try {
        await ElMessageBox.confirm('确定清除全部缓存吗？此操作不可撤销。', '警告', { type: 'warning', confirmButtonText: '确定清除', cancelButtonText: '取消' });
    }
    catch {
        return;
    }
    await cache.clearAllCache();
};
// ==================== 本地书籍导入 ====================
const importing = ref(false);
const importForm = reactive({
    bookName: '',
    author: '',
    groupId: undefined,
});
/** 导入本地 TXT 文件（el-upload before-upload 钩子） */
const handleLocalImport = async (file) => {
    importing.value = true;
    try {
        const { data } = await API.addLocalBook(file, importForm.bookName || undefined, importForm.author || undefined, importForm.groupId);
        if (data.isSuccess && data.data) {
            const bookName = data.data.name;
            ElMessage.success(`本地书籍《${bookName}》导入成功`);
            // 重置表单
            importForm.bookName = '';
            importForm.author = '';
            importForm.groupId = undefined;
        }
        else {
            ElMessage.error(data.errorMsg || '导入失败');
        }
    }
    catch (e) {
        ElMessage.error('导入失败: ' + e.message);
    }
    finally {
        importing.value = false;
    }
    return false;
};
const history = ref([]);
const historyLoading = ref(false);
/** 加载搜索历史 */
const loadHistory = async () => {
    historyLoading.value = true;
    try {
        const { data } = await API.getSearchHistory();
        if (data.isSuccess && data.data) {
            history.value = data.data;
        }
    }
    catch (e) {
        ElMessage.error('加载搜索历史失败: ' + e.message);
    }
    finally {
        historyLoading.value = false;
    }
};
/** 清除全部搜索历史 */
const handleClearHistory = async () => {
    try {
        await ElMessageBox.confirm('确定清除全部搜索历史吗？', '提示', {
            type: 'warning',
        });
    }
    catch {
        return;
    }
    try {
        const { data } = await API.clearSearchHistory();
        if (data.isSuccess) {
            ElMessage.success('搜索历史已清除');
            history.value = [];
        }
    }
    catch (e) {
        ElMessage.error('清除搜索历史失败: ' + e.message);
    }
};
/** 删除单条搜索历史（前端移除，后端暂无单条删除API） */
const handleRemoveHistory = (idx) => {
    history.value.splice(idx, 1);
};
// ==================== 初始化 ====================
onMounted(async () => {
    await Promise.all([
        cache.loadCacheSize(),
        loadHistory(),
        groupStore.loadGroups(),
    ]);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "system-actions" },
});
/** @type {__VLS_StyleScopedClasses['system-actions']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    contentPosition: "left",
}));
const __VLS_2 = __VLS_1({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-block" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.cache.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['action-block']} */ ;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components['el-descriptions'] | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components['el-descriptions']} */
elDescriptions;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    column: (2),
    border: true,
    size: "small",
    ...{ class: "cache-info" },
}));
const __VLS_8 = __VLS_7({
    column: (2),
    border: true,
    size: "small",
    ...{ class: "cache-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {__VLS_StyleScopedClasses['cache-info']} */ ;
const { default: __VLS_11 } = __VLS_9.slots;
let __VLS_12;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    label: "缓存总大小",
}));
const __VLS_14 = __VLS_13({
    label: "缓存总大小",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
(__VLS_ctx.cache.formattedTotalSize());
// @ts-ignore
[vLoading, cache, cache,];
var __VLS_15;
let __VLS_18;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "缓存章节数",
}));
const __VLS_20 = __VLS_19({
    label: "缓存章节数",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
(__VLS_ctx.cache.cacheSize.chapterCount);
// @ts-ignore
[cache,];
var __VLS_21;
let __VLS_24;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    label: "书籍总数",
}));
const __VLS_26 = __VLS_25({
    label: "书籍总数",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const { default: __VLS_29 } = __VLS_27.slots;
(__VLS_ctx.cache.cacheSize.bookCount);
// @ts-ignore
[cache,];
var __VLS_27;
let __VLS_30;
/** @ts-ignore @type { | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item'] | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components['el-descriptions-item']} */
elDescriptionsItem;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    label: "书源总数",
}));
const __VLS_32 = __VLS_31({
    label: "书源总数",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const { default: __VLS_35 } = __VLS_33.slots;
(__VLS_ctx.cache.cacheSize.sourceCount);
// @ts-ignore
[cache,];
var __VLS_33;
// @ts-ignore
[];
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-buttons" },
});
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
let __VLS_36;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}));
const __VLS_38 = __VLS_37({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_41;
const __VLS_42 = {
    /** @type {typeof __VLS_41.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.cache.loadCacheSize();
        // @ts-ignore
        [cache, Refresh,];
    },
};
const { default: __VLS_43 } = __VLS_39.slots;
// @ts-ignore
[];
var __VLS_39;
var __VLS_40;
let __VLS_44;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    type: "warning",
    loading: (__VLS_ctx.cache.clearing),
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    type: "warning",
    loading: (__VLS_ctx.cache.clearing),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_49;
const __VLS_50 = {
    /** @type {typeof __VLS_49.click} */
    onClick: (__VLS_ctx.handleClearContent),
};
const { default: __VLS_51 } = __VLS_47.slots;
// @ts-ignore
[cache, handleClearContent,];
var __VLS_47;
var __VLS_48;
let __VLS_52;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    type: "danger",
    loading: (__VLS_ctx.cache.clearing),
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    type: "danger",
    loading: (__VLS_ctx.cache.clearing),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_57;
const __VLS_58 = {
    /** @type {typeof __VLS_57.click} */
    onClick: (__VLS_ctx.handleClearAll),
};
const { default: __VLS_59 } = __VLS_55.slots;
// @ts-ignore
[cache, handleClearAll,];
var __VLS_55;
var __VLS_56;
let __VLS_60;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    contentPosition: "left",
}));
const __VLS_62 = __VLS_61({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const { default: __VLS_65 } = __VLS_63.slots;
// @ts-ignore
[];
var __VLS_63;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-block" },
});
/** @type {__VLS_StyleScopedClasses['action-block']} */ ;
let __VLS_66;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
    labelWidth: "160px",
}));
const __VLS_68 = __VLS_67({
    labelWidth: "160px",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
const { default: __VLS_71 } = __VLS_69.slots;
let __VLS_72;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    label: "备份内容",
}));
const __VLS_74 = __VLS_73({
    label: "备份内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const { default: __VLS_77 } = __VLS_75.slots;
let __VLS_78;
/** @ts-ignore @type { | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox'] | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox']} */
elCheckbox;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    modelValue: (__VLS_ctx.backupOpts.includeBooks),
}));
const __VLS_80 = __VLS_79({
    modelValue: (__VLS_ctx.backupOpts.includeBooks),
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
const { default: __VLS_83 } = __VLS_81.slots;
// @ts-ignore
[backupOpts,];
var __VLS_81;
let __VLS_84;
/** @ts-ignore @type { | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox'] | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox']} */
elCheckbox;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.backupOpts.includeSources),
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.backupOpts.includeSources),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const { default: __VLS_89 } = __VLS_87.slots;
// @ts-ignore
[backupOpts,];
var __VLS_87;
let __VLS_90;
/** @ts-ignore @type { | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox'] | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components['el-checkbox']} */
elCheckbox;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    modelValue: (__VLS_ctx.backupOpts.includeConfigs),
}));
const __VLS_92 = __VLS_91({
    modelValue: (__VLS_ctx.backupOpts.includeConfigs),
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
const { default: __VLS_95 } = __VLS_93.slots;
// @ts-ignore
[backupOpts,];
var __VLS_93;
// @ts-ignore
[];
var __VLS_75;
// @ts-ignore
[];
var __VLS_69;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-buttons" },
});
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
let __VLS_96;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.backup.backingUp),
}));
const __VLS_98 = __VLS_97({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.backup.backingUp),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
let __VLS_101;
const __VLS_102 = {
    /** @type {typeof __VLS_101.click} */
    onClick: (__VLS_ctx.handleBackup),
};
const { default: __VLS_103 } = __VLS_99.slots;
// @ts-ignore
[backup, handleBackup,];
var __VLS_99;
var __VLS_100;
let __VLS_104;
/** @ts-ignore @type { | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload'] | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload']} */
elUpload;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleRestore),
    accept: ".zip",
}));
const __VLS_106 = __VLS_105({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleRestore),
    accept: ".zip",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const { default: __VLS_109 } = __VLS_107.slots;
let __VLS_110;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
    type: "success",
    loading: (__VLS_ctx.backup.restoring),
}));
const __VLS_112 = __VLS_111({
    type: "success",
    loading: (__VLS_ctx.backup.restoring),
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
const { default: __VLS_115 } = __VLS_113.slots;
// @ts-ignore
[backup, handleRestore,];
var __VLS_113;
// @ts-ignore
[];
var __VLS_107;
let __VLS_116;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
    contentPosition: "left",
}));
const __VLS_118 = __VLS_117({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const { default: __VLS_121 } = __VLS_119.slots;
// @ts-ignore
[];
var __VLS_119;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-buttons" },
});
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
let __VLS_122;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
    ...{ 'onClick': {} },
}));
const __VLS_124 = __VLS_123({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
let __VLS_127;
const __VLS_128 = {
    /** @type {typeof __VLS_127.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.backup.exportSources();
        // @ts-ignore
        [backup,];
    },
};
const { default: __VLS_129 } = __VLS_125.slots;
// @ts-ignore
[];
var __VLS_125;
var __VLS_126;
let __VLS_130;
/** @ts-ignore @type { | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload'] | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload']} */
elUpload;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleImportSources),
    accept: ".json",
}));
const __VLS_132 = __VLS_131({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleImportSources),
    accept: ".json",
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
const { default: __VLS_135 } = __VLS_133.slots;
let __VLS_136;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({}));
const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
const { default: __VLS_141 } = __VLS_139.slots;
// @ts-ignore
[handleImportSources,];
var __VLS_139;
// @ts-ignore
[];
var __VLS_133;
let __VLS_142;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
    contentPosition: "left",
}));
const __VLS_144 = __VLS_143({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
const { default: __VLS_147 } = __VLS_145.slots;
// @ts-ignore
[];
var __VLS_145;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-block" },
});
/** @type {__VLS_StyleScopedClasses['action-block']} */ ;
let __VLS_148;
/** @ts-ignore @type { | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form'] | typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components['el-form']} */
elForm;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
    labelWidth: "160px",
}));
const __VLS_150 = __VLS_149({
    labelWidth: "160px",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
const { default: __VLS_153 } = __VLS_151.slots;
let __VLS_154;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
    label: "书名（可选）",
}));
const __VLS_156 = __VLS_155({
    label: "书名（可选）",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
const { default: __VLS_159 } = __VLS_157.slots;
let __VLS_160;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
    modelValue: (__VLS_ctx.importForm.bookName),
    placeholder: "留空则使用文件名",
    ...{ style: {} },
}));
const __VLS_162 = __VLS_161({
    modelValue: (__VLS_ctx.importForm.bookName),
    placeholder: "留空则使用文件名",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
// @ts-ignore
[importForm,];
var __VLS_157;
let __VLS_165;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
    label: "作者（可选）",
}));
const __VLS_167 = __VLS_166({
    label: "作者（可选）",
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
const { default: __VLS_170 } = __VLS_168.slots;
let __VLS_171;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({
    modelValue: (__VLS_ctx.importForm.author),
    placeholder: "留空则为未知",
    ...{ style: {} },
}));
const __VLS_173 = __VLS_172({
    modelValue: (__VLS_ctx.importForm.author),
    placeholder: "留空则为未知",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_172));
// @ts-ignore
[importForm,];
var __VLS_168;
let __VLS_176;
/** @ts-ignore @type { | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item'] | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components['el-form-item']} */
elFormItem;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent1(__VLS_176, new __VLS_176({
    label: "目标分组（可选）",
}));
const __VLS_178 = __VLS_177({
    label: "目标分组（可选）",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const { default: __VLS_181 } = __VLS_179.slots;
let __VLS_182;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({
    modelValue: (__VLS_ctx.importForm.groupId),
    placeholder: "不选择分组",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_184 = __VLS_183({
    modelValue: (__VLS_ctx.importForm.groupId),
    placeholder: "不选择分组",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
const { default: __VLS_187 } = __VLS_185.slots;
for (const [g] of __VLS_vFor((__VLS_ctx.groups))) {
    let __VLS_188;
    /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
    elOption;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent1(__VLS_188, new __VLS_188({
        key: (g.groupId),
        label: (g.groupName),
        value: (g.groupId),
    }));
    const __VLS_190 = __VLS_189({
        key: (g.groupId),
        label: (g.groupName),
        value: (g.groupId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    // @ts-ignore
    [importForm, groups,];
}
// @ts-ignore
[];
var __VLS_185;
// @ts-ignore
[];
var __VLS_179;
// @ts-ignore
[];
var __VLS_151;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-buttons" },
});
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
let __VLS_193;
/** @ts-ignore @type { | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload'] | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload']} */
elUpload;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleLocalImport),
    accept: ".txt",
}));
const __VLS_195 = __VLS_194({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleLocalImport),
    accept: ".txt",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
const { default: __VLS_198 } = __VLS_196.slots;
let __VLS_199;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_200 = __VLS_asFunctionalComponent1(__VLS_199, new __VLS_199({
    type: "primary",
    loading: (__VLS_ctx.importing),
}));
const __VLS_201 = __VLS_200({
    type: "primary",
    loading: (__VLS_ctx.importing),
}, ...__VLS_functionalComponentArgsRest(__VLS_200));
const { default: __VLS_204 } = __VLS_202.slots;
// @ts-ignore
[handleLocalImport, importing,];
var __VLS_202;
// @ts-ignore
[];
var __VLS_196;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "form-tip" },
});
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
let __VLS_205;
/** @ts-ignore @type { | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider'] | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components['el-divider']} */
elDivider;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205({
    contentPosition: "left",
}));
const __VLS_207 = __VLS_206({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
const { default: __VLS_210 } = __VLS_208.slots;
// @ts-ignore
[];
var __VLS_208;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-block" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.historyLoading) }, null, null);
/** @type {__VLS_StyleScopedClasses['action-block']} */ ;
if (__VLS_ctx.history.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "history-tags" },
    });
    /** @type {__VLS_StyleScopedClasses['history-tags']} */ ;
    for (const [item, idx] of __VLS_vFor((__VLS_ctx.history))) {
        let __VLS_211;
        /** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
        elTag;
        // @ts-ignore
        const __VLS_212 = __VLS_asFunctionalComponent1(__VLS_211, new __VLS_211({
            ...{ 'onClose': {} },
            key: (idx),
            ...{ class: "history-tag" },
            closable: true,
        }));
        const __VLS_213 = __VLS_212({
            ...{ 'onClose': {} },
            key: (idx),
            ...{ class: "history-tag" },
            closable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_212));
        let __VLS_216;
        const __VLS_217 = {
            /** @type {typeof __VLS_216.close} */
            onClose: (...[$event]) => {
                if (!!(__VLS_ctx.history.length === 0))
                    return;
                __VLS_ctx.handleRemoveHistory(idx);
                // @ts-ignore
                [vLoading, historyLoading, history, history, handleRemoveHistory,];
            },
        };
        /** @type {__VLS_StyleScopedClasses['history-tag']} */ ;
        const { default: __VLS_218 } = __VLS_214.slots;
        (item.word);
        // @ts-ignore
        [];
        var __VLS_214;
        var __VLS_215;
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-buttons" },
});
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
let __VLS_219;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_220 = __VLS_asFunctionalComponent1(__VLS_219, new __VLS_219({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}));
const __VLS_221 = __VLS_220({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Refresh),
}, ...__VLS_functionalComponentArgsRest(__VLS_220));
let __VLS_224;
const __VLS_225 = {
    /** @type {typeof __VLS_224.click} */
    onClick: (__VLS_ctx.loadHistory),
};
const { default: __VLS_226 } = __VLS_222.slots;
// @ts-ignore
[Refresh, loadHistory,];
var __VLS_222;
var __VLS_223;
let __VLS_227;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
    ...{ 'onClick': {} },
    type: "danger",
    plain: true,
    disabled: (__VLS_ctx.history.length === 0),
}));
const __VLS_229 = __VLS_228({
    ...{ 'onClick': {} },
    type: "danger",
    plain: true,
    disabled: (__VLS_ctx.history.length === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
let __VLS_232;
const __VLS_233 = {
    /** @type {typeof __VLS_232.click} */
    onClick: (__VLS_ctx.handleClearHistory),
};
const { default: __VLS_234 } = __VLS_230.slots;
// @ts-ignore
[history, handleClearHistory,];
var __VLS_230;
var __VLS_231;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
