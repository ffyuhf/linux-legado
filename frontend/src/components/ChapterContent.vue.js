/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { isLegadoUrl, lazyRegex } from '@/utils/utils';
import API from '@api';
import jump from '@/plugins/jump';
const store = useBookStore();
const readWidth = computed(() => store.config.readWidth);
const lineImgWidth = computed(() => store.config.fontSize * 2);
const bookUrl = computed(() => store.readingBook.bookUrl);
const props = defineProps();
const imgPatternStr = '<img[^>]*src=[\'"]([^\'"]*(?:[\'"][^>]+\\})?)[\'"][^>]*>';
const imgPattern = lazyRegex(imgPatternStr);
const imgPatternAll = lazyRegex(imgPatternStr, 'g');
const imgDataUrlPattern = lazyRegex('data:image[^;]+;base64,[^,]{39,}');
const replaceImage = (content) => {
    return content.replace(imgPatternAll(), (match, src) => {
        const dataUrl = src.match(imgDataUrlPattern());
        if (dataUrl) {
            return dataUrl[0];
        }
        if (isLegadoUrl(src)) {
            const proxySrc = API.getProxyImageUrl(bookUrl.value, src, lineImgWidth.value);
            return match.replace(src, proxySrc);
        }
        return match;
    });
};
const getImageSrc = (content) => {
    const src = content.match(imgPattern())[1]; //reg tested in template
    const dataUrl = src.match(imgDataUrlPattern());
    if (dataUrl) {
        return dataUrl[0]; //现成的base64图片，去掉阅读格式后缀
    }
    if (isLegadoUrl(src))
        return API.getProxyImageUrl(bookUrl.value, src, readWidth.value);
    return src;
};
const proxyImage = (event) => {
    /* 获取IMG标签原始的src
      <img src="/test" />
      假设location.href = http://example.com
      event.target.src 返回 http://example.com/test
      (event.target as HTMLImageElement)?.getAttribute("src")  返回/test
    */
    const src = event.target?.getAttribute("src");
    if (src != null && src.length > 0) {
        event.target.src = API.getProxyImageUrl(bookUrl.value, src, readWidth.value);
    }
};
/**
 * 处理传入的IMG标签错误事件，自动替换图片的代理链接
 */
const handleImgLoadError = (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement) {
        const srcUrl = target.getAttribute("src");
        console.log("[ChapterContent]: IMG Load Error, replace src:", srcUrl, "=>", API.getProxyImageUrl(bookUrl.value, srcUrl ?? "", readWidth.value));
        proxyImage(event);
    }
};
const calculateWordCount = (paragraph) => {
    //内嵌图片文字为1
    const imagePlaceHolder = ' ';
    return paragraph.replace(imgPatternAll(), imagePlaceHolder).length;
};
const chapterPos = computed(() => {
    let pos = -1;
    return Array.from(props.contents, content => {
        pos += calculateWordCount(content) + 1; //计算上一段的换行符
        return pos;
    });
});
const titleRef = ref();
const paragraphRef = ref();
const scrollToReadedLength = (length) => {
    if (length === 0)
        return;
    const paragraphIndex = chapterPos.value.findIndex(wordCount => wordCount >= length);
    if (paragraphIndex === -1)
        return;
    nextTick(() => {
        jump(paragraphRef.value[paragraphIndex], {
            duration: 0,
        });
    });
};
const __VLS_exposed = {
    scrollToReadedLength,
};
defineExpose(__VLS_exposed);
let intersectionObserver = null;
const emit = defineEmits(['readedLengthChange']);
onMounted(() => {
    intersectionObserver = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
            if (isIntersecting) {
                emit('readedLengthChange', props.chapterIndex, parseInt(target.dataset.chapterpos));
            }
        }
    }, {
        rootMargin: `0px 0px -${window.innerHeight - 24}px 0px`,
    });
    intersectionObserver.observe(titleRef.value);
    paragraphRef.value.forEach(element => {
        intersectionObserver.observe(element);
    });
});
onUnmounted(() => {
    intersectionObserver?.disconnect();
    intersectionObserver = null;
});
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
(__VLS_ctx.props.spacing.letter);
(__VLS_ctx.props.spacing.line);
(__VLS_ctx.props.spacing.paragraph);
// @ts-ignore
[props, props, props,];
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "title" },
    'data-chapterpos': "0",
    ref: "titleRef",
});
/** @type {__VLS_StyleScopedClasses['title']} */ ;
(__VLS_ctx.title);
for (const [para, index] of __VLS_vFor((__VLS_ctx.contents))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ref: "paragraphRef",
        'data-chapterpos': (__VLS_ctx.chapterPos[index]),
    });
    if (/^\s*<img[^>]*src[^>]+>$/.test(String(para))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ onError: (__VLS_ctx.proxyImage) },
            ...{ class: "full" },
            src: (__VLS_ctx.getImageSrc(para)),
            loading: "lazy",
        });
        /** @type {__VLS_StyleScopedClasses['full']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p)({
            ...{ onError: (__VLS_ctx.handleImgLoadError) },
            ...{ style: ({ fontFamily: __VLS_ctx.fontFamily, fontSize: __VLS_ctx.fontSize }) },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.replaceImage(para)) }, null, null);
    }
    // @ts-ignore
    [title, contents, chapterPos, proxyImage, getImageSrc, handleImgLoadError, fontFamily, fontSize, replaceImage,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    emits: {},
    __typeProps: {},
});
export default {};
