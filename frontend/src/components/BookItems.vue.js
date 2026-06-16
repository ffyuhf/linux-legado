/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { dateFormat, isLegadoUrl } from '../utils/utils';
import API from '@api';
const props = defineProps();
const emit = defineEmits(['bookClick']);
const handleClick = (book) => emit('bookClick', book);
const getCover = ({ bookUrl, coverUrl }) => {
    if (coverUrl === undefined)
        return API.getProxyCoverUrl(bookUrl);
    return isLegadoUrl(coverUrl) ? API.getProxyCoverUrl(coverUrl) : coverUrl;
};
const proxyImage = (evt) => {
    const target = evt.target;
    target.src = API.getProxyCoverUrl(target.src);
};
const subJustify = computed(() => props.isSearch ? 'space-between' : 'flex-start');
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
/** @type {__VLS_StyleScopedClasses['book']} */ ;
/** @type {__VLS_StyleScopedClasses['wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['books-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['books-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['book']} */ ;
(__VLS_ctx.subJustify);
// @ts-ignore
[subJustify,];
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "books-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['books-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrapper" },
});
/** @type {__VLS_StyleScopedClasses['wrapper']} */ ;
for (const [book] of __VLS_vFor((__VLS_ctx.books))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleClick(book);
                // @ts-ignore
                [books, handleClick,];
            } },
        ...{ class: "book" },
        key: (book.bookUrl),
    });
    /** @type {__VLS_StyleScopedClasses['book']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cover-img" },
    });
    /** @type {__VLS_StyleScopedClasses['cover-img']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        ...{ onError: (__VLS_ctx.proxyImage) },
        ...{ class: "cover" },
        src: (__VLS_ctx.getCover(book)),
        key: (book.coverUrl),
        alt: "",
        loading: "lazy",
    });
    /** @type {__VLS_StyleScopedClasses['cover']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info" },
    });
    /** @type {__VLS_StyleScopedClasses['info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "name" },
    });
    /** @type {__VLS_StyleScopedClasses['name']} */ ;
    (book.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sub" },
    });
    /** @type {__VLS_StyleScopedClasses['sub']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "author" },
    });
    /** @type {__VLS_StyleScopedClasses['author']} */ ;
    (book.author);
    if (__VLS_ctx.isSearch) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "tags" },
        });
        /** @type {__VLS_StyleScopedClasses['tags']} */ ;
        for (const [tag] of __VLS_vFor((book.kind?.split(',').slice(0, 2)))) {
            let __VLS_0;
            /** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
            elTag;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                key: (tag),
            }));
            const __VLS_2 = __VLS_1({
                key: (tag),
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            const { default: __VLS_5 } = __VLS_3.slots;
            (tag);
            // @ts-ignore
            [proxyImage, getCover, isSearch,];
            var __VLS_3;
            // @ts-ignore
            [];
        }
    }
    if (!__VLS_ctx.isSearch) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "update-info" },
        });
        /** @type {__VLS_StyleScopedClasses['update-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "dot" },
        });
        /** @type {__VLS_StyleScopedClasses['dot']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "size" },
        });
        /** @type {__VLS_StyleScopedClasses['size']} */ ;
        (book.totalChapterNum);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "dot" },
        });
        /** @type {__VLS_StyleScopedClasses['dot']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "date" },
        });
        /** @type {__VLS_StyleScopedClasses['date']} */ ;
        (__VLS_ctx.dateFormat(book.lastCheckTime));
    }
    if (__VLS_ctx.isSearch) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "intro" },
        });
        /** @type {__VLS_StyleScopedClasses['intro']} */ ;
        (book.intro);
    }
    if (!__VLS_ctx.isSearch) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "dur-chapter" },
        });
        /** @type {__VLS_StyleScopedClasses['dur-chapter']} */ ;
        (book.durChapterTitle);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "last-chapter" },
    });
    /** @type {__VLS_StyleScopedClasses['last-chapter']} */ ;
    (book.latestChapterTitle);
    // @ts-ignore
    [isSearch, isSearch, isSearch, dateFormat,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
