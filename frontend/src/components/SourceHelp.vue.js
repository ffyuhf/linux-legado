/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Link } from '@element-plus/icons-vue';
const isBookSource = inject('isBookSource', ref(true));
const sourceTitle = computed(() => {
    return isBookSource.value ? '书源' : '订阅源';
});
const sourcePath = computed(() => {
    return isBookSource.value ? 'ruleHelp' : 'rssRuleHelp';
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    icon: (__VLS_ctx.Link),
    href: "/help/#appHelp",
    target: "_blank",
}));
const __VLS_2 = __VLS_1({
    icon: (__VLS_ctx.Link),
    href: "/help/#appHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[Link,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    icon: (__VLS_ctx.Link),
    href: (`/help/#${__VLS_ctx.sourcePath}`),
    target: "_blank",
}));
const __VLS_8 = __VLS_7({
    icon: (__VLS_ctx.Link),
    href: (`/help/#${__VLS_ctx.sourcePath}`),
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
(__VLS_ctx.sourceTitle);
// @ts-ignore
[Link, sourcePath, sourceTitle,];
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_12;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    icon: (__VLS_ctx.Link),
    href: "/help/#jsHelp",
    target: "_blank",
}));
const __VLS_14 = __VLS_13({
    icon: (__VLS_ctx.Link),
    href: "/help/#jsHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
// @ts-ignore
[Link,];
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_18;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    icon: (__VLS_ctx.Link),
    href: "/help/#xpathHelp",
    target: "_blank",
}));
const __VLS_20 = __VLS_19({
    icon: (__VLS_ctx.Link),
    href: "/help/#xpathHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
// @ts-ignore
[Link,];
var __VLS_21;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_24;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    icon: (__VLS_ctx.Link),
    href: "/help/#regexHelp",
    target: "_blank",
}));
const __VLS_26 = __VLS_25({
    icon: (__VLS_ctx.Link),
    href: "/help/#regexHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const { default: __VLS_29 } = __VLS_27.slots;
// @ts-ignore
[Link,];
var __VLS_27;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_30;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    icon: (__VLS_ctx.Link),
    href: "/help/#txtTocRuleHelp",
    target: "_blank",
}));
const __VLS_32 = __VLS_31({
    icon: (__VLS_ctx.Link),
    href: "/help/#txtTocRuleHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const { default: __VLS_35 } = __VLS_33.slots;
// @ts-ignore
[Link,];
var __VLS_33;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_36;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    icon: (__VLS_ctx.Link),
    href: "/help/#debugHelp",
    target: "_blank",
}));
const __VLS_38 = __VLS_37({
    icon: (__VLS_ctx.Link),
    href: "/help/#debugHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const { default: __VLS_41 } = __VLS_39.slots;
// @ts-ignore
[Link,];
var __VLS_39;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_42;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    icon: (__VLS_ctx.Link),
    href: "/help/#httpTTSHelp",
    target: "_blank",
}));
const __VLS_44 = __VLS_43({
    icon: (__VLS_ctx.Link),
    href: "/help/#httpTTSHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
const { default: __VLS_47 } = __VLS_45.slots;
// @ts-ignore
[Link,];
var __VLS_45;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_48;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    icon: (__VLS_ctx.Link),
    href: "/help/#webDavBookHelp",
    target: "_blank",
}));
const __VLS_50 = __VLS_49({
    icon: (__VLS_ctx.Link),
    href: "/help/#webDavBookHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
// @ts-ignore
[Link,];
var __VLS_51;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_54;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    icon: (__VLS_ctx.Link),
    href: "/help/#webDavHelp",
    target: "_blank",
}));
const __VLS_56 = __VLS_55({
    icon: (__VLS_ctx.Link),
    href: "/help/#webDavHelp",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
const { default: __VLS_59 } = __VLS_57.slots;
// @ts-ignore
[Link,];
var __VLS_57;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
let __VLS_60;
/** @ts-ignore @type { | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link'] | typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components['el-link']} */
elLink;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    icon: (__VLS_ctx.Link),
    href: "https://regexr-cn.com/",
    target: "_blank",
}));
const __VLS_62 = __VLS_61({
    icon: (__VLS_ctx.Link),
    href: "https://regexr-cn.com/",
    target: "_blank",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const { default: __VLS_65 } = __VLS_63.slots;
// @ts-ignore
[Link,];
var __VLS_63;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_66;
/** @ts-ignore @type { | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text'] | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text']} */
elText;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({}));
const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
const { default: __VLS_71 } = __VLS_69.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
// @ts-ignore
[];
var __VLS_69;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_72;
/** @ts-ignore @type { | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text'] | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text']} */
elText;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const { default: __VLS_77 } = __VLS_75.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
// @ts-ignore
[];
var __VLS_75;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_78;
/** @ts-ignore @type { | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text'] | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text']} */
elText;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
const { default: __VLS_83 } = __VLS_81.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
// @ts-ignore
[];
var __VLS_81;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_84;
/** @ts-ignore @type { | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text'] | typeof __VLS_components.elText | typeof __VLS_components.ElText | typeof __VLS_components['el-text']} */
elText;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const { default: __VLS_89 } = __VLS_87.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
// @ts-ignore
[];
var __VLS_87;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
