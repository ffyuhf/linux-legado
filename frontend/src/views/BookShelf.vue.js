/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import '@/assets/bookshelf.css';
import '@/assets/fonts/shelffont.css';
import { useBookStore } from '@/store';
import githubUrl from '@/assets/imgs/github.png';
import { useLoading } from '@/hooks/loading';
import { Search as SearchIcon } from '@element-plus/icons-vue';
import { baseURL_localStorage_key } from '@/api/axios';
import API, { legado_http_entry_point, parseLeagdoHttpUrlWithDefault, setApiEntryPoint, } from '@api';
import { validatorHttpUrl } from '@/utils/utils';
/** 阶段八补全：分组管理组件 + 本地导入 */
import BookGroupManager from '@/components/BookGroupManager.vue';
import RssArticles from '@/components/RssArticles.vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
const store = useBookStore();
/** 分组管理对话框可见性（阶段八补全） */
const groupManagerVisible = ref(false);
/** RSS 订阅文章对话框可见性（阶段八补全） */
const rssArticlesVisible = ref(false);
/**
 * 导入本地 TXT 书籍到书架
 * 复用后端 POST /addLocalBook，导入后刷新书架
 */
const handleLocalImport = async (file) => {
    try {
        const { data } = await API.addLocalBook(file);
        if (data.isSuccess && data.data) {
            const bookName = data.data.name;
            ElMessage.success(`本地书籍《${bookName}》导入成功`);
            await store.loadBookShelf();
        }
        else {
            ElMessage.error(data.errorMsg || '导入失败');
        }
    }
    catch (e) {
        ElMessage.error('导入失败: ' + e.message);
    }
    return false;
};
const isNight = computed(() => store.isNight);
/** shortcuts of `store.setConfig` */
const applyReadConfig = (config) => {
    try {
        if (config !== undefined)
            store.setConfig(config);
    }
    catch {
        ElMessage.info('阅读界面配置解析错误');
    }
};
const readingRecent = ref({
    name: '尚无阅读记录',
    author: '',
    bookUrl: '',
    chapterIndex: 0,
    chapterPos: 0,
    isSeachBook: false,
});
const shelfWrapper = ref();
//const shelfWrapper = useTemplateRef<HTMLElement>("shelfWrapper")
const { showLoading, closeLoading, loadingWrapper, isLoading } = useLoading(shelfWrapper, '正在获取书籍信息');
// 书架书籍和在线书籍搜索
const books = shallowRef([]);
const shelf = computed(() => store.shelf);
const searchWord = ref('');
const isSearching = ref(false);
watchEffect(() => {
    if (isSearching.value && searchWord.value != '')
        return;
    isSearching.value = false;
    books.value = [];
    if (searchWord.value == '') {
        books.value = shelf.value;
        return;
    }
    books.value = shelf.value.filter(book => {
        return (book.name.includes(searchWord.value) ||
            book.author.includes(searchWord.value));
    });
});
//搜索在线书籍
const searchBook = () => {
    if (searchWord.value == '')
        return;
    books.value = [];
    store.clearSearchBooks();
    showLoading();
    isSearching.value = true;
    API.search(searchWord.value, searcBooks => {
        if (isLoading) {
            closeLoading();
        }
        try {
            store.setSearchBooks(searcBooks);
            books.value = store.searchBooks;
            //store.searchBooks.forEach((item) => books.value.push(item));
        }
        catch (e) {
            ElMessage.error('后端数据错误');
            throw e;
        }
    }, () => {
        closeLoading();
        if (books.value.length == 0) {
            ElMessage.info('搜索结果为空');
        }
    });
};
//连接状态
const connectionStore = useConnectionStore();
const { connectStatus, connectType, newConnect } = storeToRefs(connectionStore);
const setLegadoRetmoteUrl = () => {
    ElMessageBox.prompt('请输入 后端地址 ( 如：http://127.0.0.1:9527 或者通过内网穿透的地址)', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: legado_http_entry_point,
        inputValidator: value => validatorHttpUrl(value),
        inputErrorMessage: '输入的格式不对',
        beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
                connectionStore.setNewConnect(true);
                instance.confirmButtonLoading = true;
                instance.confirmButtonText = '校验中……';
                // instance.inputValue
                const url = new URL(instance.inputValue).toString();
                API.getReadConfig(url)
                    .then(function (config) {
                    connectionStore.setNewConnect(false);
                    applyReadConfig(config);
                    instance.confirmButtonLoading = false;
                    store.clearSearchBooks();
                    setApiEntryPoint(...parseLeagdoHttpUrlWithDefault(url));
                    if (url === location.origin) {
                        localStorage.removeItem(baseURL_localStorage_key);
                    }
                    else {
                        localStorage.setItem(baseURL_localStorage_key, url);
                    }
                    store.loadBookShelf();
                    done();
                })
                    .catch(function (error) {
                    connectionStore.setNewConnect(false);
                    instance.confirmButtonLoading = false;
                    instance.confirmButtonText = '确定';
                    throw error;
                });
            }
            else {
                done();
            }
        },
    });
};
const router = useRouter();
const handleBookClick = async (book) => {
    // 判断是否为 searchBook
    const isSeachBook = 'respondTime' in book;
    if (isSeachBook) {
        await API.saveBook(book);
    }
    const { bookUrl, name, author, 
    // @ts-expect-error: descruct with default value
    durChapterIndex = 0, 
    // @ts-expect-error: descruct with default value
    durChapterPos = 0, } = book;
    toDetail(bookUrl, name, author, durChapterIndex, durChapterPos, isSeachBook);
};
const toDetail = (bookUrl, bookName, bookAuthor, chapterIndex, chapterPos, isSeachBook = false, fromReadRecentClick = false) => {
    if (bookName === '尚无阅读记录')
        return;
    // 最近书籍不再书架上 自动搜索
    if (fromReadRecentClick &&
        shelf.value.every(book => book.bookUrl !== bookUrl)) {
        searchWord.value = bookName;
        searchBook();
        return;
    }
    sessionStorage.setItem('bookUrl', bookUrl);
    sessionStorage.setItem('bookName', bookName);
    sessionStorage.setItem('bookAuthor', bookAuthor);
    sessionStorage.setItem('chapterIndex', String(chapterIndex));
    sessionStorage.setItem('chapterPos', String(chapterPos));
    sessionStorage.setItem('isSeachBook', String(isSeachBook));
    readingRecent.value = {
        name: bookName,
        author: bookAuthor,
        bookUrl,
        chapterIndex,
        chapterPos,
        isSeachBook,
    };
    localStorage.setItem('readingRecent', JSON.stringify(readingRecent.value));
    router.push({
        path: '/chapter',
    });
};
const loadShelf = async () => {
    await store.loadWebConfig();
    await store.saveBookProgress();
    //确保各种网络情况下同步请求先完成
    await store.loadBookShelf();
};
onMounted(() => {
    //获取最近阅读书籍
    const readingRecentStr = localStorage.getItem('readingRecent');
    if (readingRecentStr != null) {
        readingRecent.value = JSON.parse(readingRecentStr);
        if (typeof readingRecent.value.chapterIndex == 'undefined') {
            readingRecent.value.chapterIndex = 0;
        }
    }
    console.log('bookshelf mounted');
    loadingWrapper(loadShelf());
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['index-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['navigation-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['reading-recent']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['shelf-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['navigation-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['navigation-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['shelf-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: ({ 'index-wrapper': true, night: __VLS_ctx.isNight, day: !__VLS_ctx.isNight }) },
});
/** @type {__VLS_StyleScopedClasses['night']} */ ;
/** @type {__VLS_StyleScopedClasses['day']} */ ;
/** @type {__VLS_StyleScopedClasses['index-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "navigation-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['navigation-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "navigation-title-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['navigation-title-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "navigation-title" },
});
/** @type {__VLS_StyleScopedClasses['navigation-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "navigation-sub-title" },
});
/** @type {__VLS_StyleScopedClasses['navigation-sub-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['search-wrapper']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input'] | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onKeyup': {} },
    placeholder: "搜索书籍，在线书籍自动加入书架",
    modelValue: (__VLS_ctx.searchWord),
    ...{ class: "search-input" },
    prefixIcon: (__VLS_ctx.SearchIcon),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    placeholder: "搜索书籍，在线书籍自动加入书架",
    modelValue: (__VLS_ctx.searchWord),
    ...{ class: "search-input" },
    prefixIcon: (__VLS_ctx.SearchIcon),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = {
    /** @type {typeof __VLS_5.keyup} */
    onKeyup: (__VLS_ctx.searchBook),
};
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bottom-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['bottom-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "recent-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['recent-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "recent-title" },
});
/** @type {__VLS_StyleScopedClasses['recent-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "reading-recent" },
});
/** @type {__VLS_StyleScopedClasses['reading-recent']} */ ;
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
elTag;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.readingRecent.name == '尚无阅读记录' ? 'warning' : 'primary'),
    ...{ class: "recent-book" },
    size: "large",
    ...{ class: ({ 'no-point': __VLS_ctx.readingRecent.bookUrl == '' }) },
}));
const __VLS_9 = __VLS_8({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.readingRecent.name == '尚无阅读记录' ? 'warning' : 'primary'),
    ...{ class: "recent-book" },
    size: "large",
    ...{ class: ({ 'no-point': __VLS_ctx.readingRecent.bookUrl == '' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = {
    /** @type {typeof __VLS_12.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.toDetail(__VLS_ctx.readingRecent.bookUrl, __VLS_ctx.readingRecent.name, __VLS_ctx.readingRecent.author, __VLS_ctx.readingRecent.chapterIndex, __VLS_ctx.readingRecent.chapterPos, __VLS_ctx.readingRecent.isSeachBook, true);
        // @ts-ignore
        [isNight, isNight, searchWord, SearchIcon, searchBook, readingRecent, readingRecent, readingRecent, readingRecent, readingRecent, readingRecent, readingRecent, readingRecent, toDetail,];
    },
};
/** @type {__VLS_StyleScopedClasses['recent-book']} */ ;
/** @type {__VLS_StyleScopedClasses['no-point']} */ ;
const { default: __VLS_14 } = __VLS_10.slots;
(__VLS_ctx.readingRecent.name);
// @ts-ignore
[readingRecent,];
var __VLS_10;
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "setting-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['setting-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "setting-title" },
});
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "setting-item" },
});
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
elTag;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.connectType),
    size: "large",
    ...{ class: "setting-connect" },
    ...{ class: ({ 'no-point': __VLS_ctx.newConnect }) },
}));
const __VLS_17 = __VLS_16({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.connectType),
    size: "large",
    ...{ class: "setting-connect" },
    ...{ class: ({ 'no-point': __VLS_ctx.newConnect }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
const __VLS_21 = {
    /** @type {typeof __VLS_20.click} */
    onClick: (__VLS_ctx.setLegadoRetmoteUrl),
};
/** @type {__VLS_StyleScopedClasses['setting-connect']} */ ;
/** @type {__VLS_StyleScopedClasses['no-point']} */ ;
const { default: __VLS_22 } = __VLS_18.slots;
(__VLS_ctx.connectStatus);
// @ts-ignore
[connectType, newConnect, setLegadoRetmoteUrl, connectStatus,];
var __VLS_18;
var __VLS_19;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "setting-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['setting-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "setting-title" },
});
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "setting-item" },
});
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    ...{ 'onClick': {} },
    size: "small",
    title: "分组管理",
}));
const __VLS_25 = __VLS_24({
    ...{ 'onClick': {} },
    size: "small",
    title: "分组管理",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_28;
const __VLS_29 = {
    /** @type {typeof __VLS_28.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.groupManagerVisible = true;
        // @ts-ignore
        [groupManagerVisible,];
    },
};
const { default: __VLS_30 } = __VLS_26.slots;
// @ts-ignore
[];
var __VLS_26;
var __VLS_27;
let __VLS_31;
/** @ts-ignore @type { | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload'] | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components['el-upload']} */
elUpload;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleLocalImport),
    accept: ".txt",
    ...{ class: "import-upload" },
}));
const __VLS_33 = __VLS_32({
    showFileList: (false),
    beforeUpload: (__VLS_ctx.handleLocalImport),
    accept: ".txt",
    ...{ class: "import-upload" },
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
/** @type {__VLS_StyleScopedClasses['import-upload']} */ ;
const { default: __VLS_36 } = __VLS_34.slots;
let __VLS_37;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    size: "small",
    title: "导入本地书籍",
}));
const __VLS_39 = __VLS_38({
    size: "small",
    title: "导入本地书籍",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const { default: __VLS_42 } = __VLS_40.slots;
// @ts-ignore
[handleLocalImport,];
var __VLS_40;
// @ts-ignore
[];
var __VLS_34;
let __VLS_43;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    ...{ 'onClick': {} },
    size: "small",
    title: "订阅文章",
}));
const __VLS_45 = __VLS_44({
    ...{ 'onClick': {} },
    size: "small",
    title: "订阅文章",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
let __VLS_48;
const __VLS_49 = {
    /** @type {typeof __VLS_48.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.rssArticlesVisible = true;
        // @ts-ignore
        [rssArticlesVisible,];
    },
};
const { default: __VLS_50 } = __VLS_46.slots;
// @ts-ignore
[];
var __VLS_46;
var __VLS_47;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bottom-icons" },
});
/** @type {__VLS_StyleScopedClasses['bottom-icons']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://github.com/gedoor/legado_web_bookshelf",
    target: "_blank",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bottom-icon" },
});
/** @type {__VLS_StyleScopedClasses['bottom-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: (__VLS_ctx.githubUrl),
    alt: "",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/settings');
            // @ts-ignore
            [githubUrl, $router,];
        } },
    ...{ class: "bottom-icon" },
    title: "应用设置",
});
/** @type {__VLS_StyleScopedClasses['bottom-icon']} */ ;
let __VLS_51;
/** @ts-ignore @type { | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components['el-icon'] | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components['el-icon']} */
elIcon;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    size: (28),
}));
const __VLS_53 = __VLS_52({
    size: (28),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
const { default: __VLS_56 } = __VLS_54.slots;
let __VLS_57;
/** @ts-ignore @type { | typeof __VLS_components.Setting} */
Setting;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({}));
const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
// @ts-ignore
[];
var __VLS_54;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "shelf-wrapper" },
    ref: "shelfWrapper",
});
/** @type {__VLS_StyleScopedClasses['shelf-wrapper']} */ ;
let __VLS_62;
/** @ts-ignore @type { | typeof __VLS_components.bookItems | typeof __VLS_components.BookItems | typeof __VLS_components['book-items'] | typeof __VLS_components.bookItems | typeof __VLS_components.BookItems | typeof __VLS_components['book-items']} */
bookItems;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    ...{ 'onBookClick': {} },
    books: (__VLS_ctx.books),
    isSearch: (__VLS_ctx.isSearching),
}));
const __VLS_64 = __VLS_63({
    ...{ 'onBookClick': {} },
    books: (__VLS_ctx.books),
    isSearch: (__VLS_ctx.isSearching),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_67;
const __VLS_68 = {
    /** @type {typeof __VLS_67.bookClick} */
    onBookClick: (__VLS_ctx.handleBookClick),
};
var __VLS_65;
var __VLS_66;
const __VLS_69 = BookGroupManager;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    modelValue: (__VLS_ctx.groupManagerVisible),
}));
const __VLS_71 = __VLS_70({
    modelValue: (__VLS_ctx.groupManagerVisible),
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
const __VLS_74 = RssArticles;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    modelValue: (__VLS_ctx.rssArticlesVisible),
}));
const __VLS_76 = __VLS_75({
    modelValue: (__VLS_ctx.rssArticlesVisible),
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
// @ts-ignore
[groupManagerVisible, rssArticlesVisible, books, isSearching, handleBookClick,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
