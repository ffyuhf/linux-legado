/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import API from '@api';
import { Folder, Delete, Download, Search } from '@element-plus/icons-vue';
import { isSourceMatches, getSourceUniqueKey, getSourceName, convertSourcesToMap, } from '@utils/souce';
import SourceItem from './SourceItem.vue';
const store = useSourceStore();
const sourceUrlSelect = ref([]);
const searchKey = ref('');
const sources = computed(() => store.sources);
/* 筛选源 */
const sourcesFiltered = computed(() => {
    const key = searchKey.value;
    if (key === '')
        return sources.value;
    return sources.value.filter(source => isSourceMatches(source, key));
});
// 计算当前筛选关键词下的选中源
const sourceSelect = computed(() => {
    const urls = sourceUrlSelect.value;
    if (urls.length == 0)
        return [];
    const sourcesFilteredMap = searchKey.value == ''
        ? store.sourcesMap
        : convertSourcesToMap(sourcesFiltered.value);
    return urls.reduce((sources, sourceUrl) => {
        const source = sourcesFilteredMap.get(sourceUrl);
        if (source)
            sources.push(source);
        return sources;
    }, []);
});
const deleteSelectSources = () => {
    const sourceSelectValue = sourceSelect.value;
    API.deleteSource(sourceSelectValue).then(({ data }) => {
        if (!data.isSuccess)
            return ElMessage.error(data.errorMsg);
        store.deleteSources(sourceSelectValue);
        const sourceUrlSelectRawValue = toRaw(sourceUrlSelect.value);
        sourceSelectValue.forEach(source => {
            const index = sourceUrlSelectRawValue.indexOf(getSourceUniqueKey(source));
            if (index > -1)
                sourceUrlSelectRawValue.splice(index, 1);
        });
        sourceUrlSelect.value = sourceUrlSelectRawValue;
    });
};
const clearAllSources = () => {
    store.clearAllSource();
    sourceUrlSelect.value = [];
};
//导入本地文件
const importSourceFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.addEventListener('change', () => {
        const files = input.files;
        if (files === null) {
            return ElMessage.info('未选择文件');
        }
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = () => {
            try {
                const jsonData = JSON.parse(reader.result);
                store.saveSources(jsonData);
            }
            catch (e) {
                ElMessage.error('上传的源格式错误: ' + e.message);
            }
        };
    });
    input.click();
};
const isBookSource = /bookSource/i.test(window.location.href);
const outExport = () => {
    const exportFile = document.createElement('a');
    const sources = sourceUrlSelect.value.length === 0
        ? sourcesFiltered.value
        : sourceSelect.value, sourceType = isBookSource ? 'BookSource' : 'RssSource';
    exportFile.download = `${sourceType}_${Date()
        .replace(/.*?\s(\d+)\s(\d+)\s(\d+:\d+:\d+).*/, '$2$1$3')
        .replace(/:/g, '')}.json`;
    const myBlob = new Blob([JSON.stringify(sources, null, 4)], {
        type: 'application/json',
    });
    exportFile.href = window.URL.createObjectURL(myBlob);
    exportFile.click();
    window.URL.revokeObjectURL(exportFile.href); //avoid memory leak
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.searchKey),
    ...{ class: "search" },
    prefixIcon: (__VLS_ctx.Search),
    placeholder: "筛选源",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.searchKey),
    ...{ class: "search" },
    prefixIcon: (__VLS_ctx.Search),
    placeholder: "筛选源",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['search']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tool" },
});
/** @type {__VLS_StyleScopedClasses['tool']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Folder),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Folder),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = {
    /** @type {typeof __VLS_10.click} */
    onClick: (__VLS_ctx.importSourceFile),
};
const { default: __VLS_12 } = __VLS_8.slots;
// @ts-ignore
[searchKey, Search, Folder, importSourceFile,];
var __VLS_8;
var __VLS_9;
let __VLS_13;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    ...{ 'onClick': {} },
    disabled: (__VLS_ctx.sourcesFiltered.length === 0),
    icon: (__VLS_ctx.Download),
}));
const __VLS_15 = __VLS_14({
    ...{ 'onClick': {} },
    disabled: (__VLS_ctx.sourcesFiltered.length === 0),
    icon: (__VLS_ctx.Download),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
const __VLS_19 = {
    /** @type {typeof __VLS_18.click} */
    onClick: (__VLS_ctx.outExport),
};
const { default: __VLS_20 } = __VLS_16.slots;
// @ts-ignore
[sourcesFiltered, Download, outExport,];
var __VLS_16;
var __VLS_17;
let __VLS_21;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    ...{ 'onClick': {} },
    type: "danger",
    icon: (__VLS_ctx.Delete),
    disabled: (__VLS_ctx.sourceSelect.length === 0),
}));
const __VLS_23 = __VLS_22({
    ...{ 'onClick': {} },
    type: "danger",
    icon: (__VLS_ctx.Delete),
    disabled: (__VLS_ctx.sourceSelect.length === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_26;
const __VLS_27 = {
    /** @type {typeof __VLS_26.click} */
    onClick: (__VLS_ctx.deleteSelectSources),
};
const { default: __VLS_28 } = __VLS_24.slots;
// @ts-ignore
[Delete, sourceSelect, deleteSelectSources,];
var __VLS_24;
var __VLS_25;
let __VLS_29;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    type: "danger",
    icon: (__VLS_ctx.Delete),
    disabled: (__VLS_ctx.sources.length === 0),
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    type: "danger",
    icon: (__VLS_ctx.Delete),
    disabled: (__VLS_ctx.sources.length === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_34;
const __VLS_35 = {
    /** @type {typeof __VLS_34.click} */
    onClick: (__VLS_ctx.clearAllSources),
};
const { default: __VLS_36 } = __VLS_32.slots;
// @ts-ignore
[Delete, sources, clearAllSources,];
var __VLS_32;
var __VLS_33;
let __VLS_37;
/** @ts-ignore @type { | typeof __VLS_components.elCheckboxGroup | typeof __VLS_components.ElCheckboxGroup | typeof __VLS_components['el-checkbox-group'] | typeof __VLS_components.elCheckboxGroup | typeof __VLS_components.ElCheckboxGroup | typeof __VLS_components['el-checkbox-group']} */
elCheckboxGroup;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    id: "source-list",
    modelValue: (__VLS_ctx.sourceUrlSelect),
}));
const __VLS_39 = __VLS_38({
    id: "source-list",
    modelValue: (__VLS_ctx.sourceUrlSelect),
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const { default: __VLS_42 } = __VLS_40.slots;
let __VLS_43;
/** @ts-ignore @type { | typeof __VLS_components.virtualList | typeof __VLS_components.VirtualList | typeof __VLS_components['virtual-list']} */
virtualList;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    ...{ style: {} },
    dataKey: ((source) => __VLS_ctx.getSourceName(source)),
    dataSources: (__VLS_ctx.sourcesFiltered),
    dataComponent: (SourceItem),
    estimateSize: (45),
}));
const __VLS_45 = __VLS_44({
    ...{ style: {} },
    dataKey: ((source) => __VLS_ctx.getSourceName(source)),
    dataSources: (__VLS_ctx.sourcesFiltered),
    dataComponent: (SourceItem),
    estimateSize: (45),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
// @ts-ignore
[sourcesFiltered, sourceUrlSelect, getSourceName,];
var __VLS_40;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
