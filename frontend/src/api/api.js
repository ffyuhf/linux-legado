/** https://github.com/gedoor/legado/tree/master/app/src/main/java/io/legado/app/api */
/** https://github.com/gedoor/legado/tree/master/app/src/main/java/io/legado/app/web */
import ajax from './axios';
export let legado_http_entry_point = '';
export let legado_webSocket_entry_point = '';
let wsOnError = () => { };
let wsOnMessage = () => { };
export const setWebsocketOnMessage = (callback) => (wsOnMessage = callback);
export const setWebsocketOnError = (callback) => {
    //WebSocket.prototype.onerror = callback
    wsOnError = callback;
};
export const setApiEntryPoint = (http_entry_point, webSocket_entry_point) => {
    legado_http_entry_point = new URL(http_entry_point).toString();
    legado_webSocket_entry_point = new URL(webSocket_entry_point).toString();
    ajax.defaults.baseURL = legado_http_entry_point;
};
// 书架API
const getReadConfig = async (http_url = legado_http_entry_point) => {
    const { data } = await ajax.get('getReadConfig', {
        baseURL: http_url.toString(),
        timeout: 3000,
    });
    if (data.isSuccess) {
        try {
            return JSON.parse(data.data);
        }
        catch { }
    }
};
const saveReadConfig = (config) => ajax.post('saveReadConfig', config);
const saveBookProgress = (bookProgress) => ajax.post('saveBookProgress', bookProgress);
const saveBookProgressWithBeacon = (bookProgress) => {
    if (!bookProgress)
        return;
    navigator.sendBeacon(new URL('saveBookProgress', legado_http_entry_point), JSON.stringify(bookProgress));
};
const getBookShelf = () => ajax.get('getBookshelf');
const getChapterList = (bookUrl) => ajax.get('getChapterList?url=' + encodeURIComponent(bookUrl));
const getBookContent = (bookUrl, chapterIndex) => ajax.get('getBookContent?url=' +
    encodeURIComponent(bookUrl) +
    '&index=' +
    chapterIndex);
const search = (searchKey, onReceive, onFinish) => {
    const socket = new WebSocket(new URL('searchBook', legado_webSocket_entry_point));
    socket.onerror = wsOnError;
    socket.onopen = () => {
        socket.send(`{"key":"${searchKey}"}`);
    };
    socket.onmessage = event => {
        try {
            onReceive(JSON.parse(event.data));
            wsOnMessage?.call(socket, event);
        }
        catch {
            onFinish();
        }
    };
    socket.onclose = () => {
        onFinish();
    };
};
const saveBook = (book) => ajax.post('saveBook', book);
const deleteBook = (book) => ajax.post('deleteBook', book);
const isBookSource = /bookSource/i.test(location.href);
const getSources = () => isBookSource ? ajax.get('getBookSources') : ajax.get('getRssSources');
const saveSource = (data) => isBookSource
    ? ajax.post('saveBookSource', data)
    : ajax.post('saveRssSource', data);
const saveSources = (data) => isBookSource
    ? ajax.post('saveBookSources', data)
    : ajax.post('saveRssSources', data);
const deleteSource = (data) => isBookSource
    ? ajax.post('deleteBookSources', data)
    : ajax.post('deleteRssSources', data);
const debug = (sourceUrl, searchKey, onReceive, onFinish) => {
    const url = new URL(`${isBookSource ? 'bookSource' : 'rssSource'}Debug`, legado_webSocket_entry_point);
    const socket = new WebSocket(url);
    socket.onerror = wsOnError;
    socket.onopen = () => {
        socket.send(JSON.stringify({ tag: sourceUrl, key: searchKey }));
    };
    socket.onmessage = event => {
        onReceive(event.data);
        wsOnMessage?.call(socket, event);
    };
    socket.onclose = () => {
        onFinish();
    };
};
const getProxyCoverUrl = (coverUrl) => {
    if (coverUrl.startsWith(legado_http_entry_point))
        return coverUrl;
    return new URL('cover?path=' + encodeURIComponent(coverUrl), legado_http_entry_point).toString();
};
const getProxyImageUrl = (bookUrl, src, width) => {
    if (src.startsWith(legado_http_entry_point))
        return src;
    return new URL('image?path=' +
        encodeURIComponent(src) +
        '&url=' +
        encodeURIComponent(bookUrl) +
        '&width=' +
        width, legado_http_entry_point).toString();
};
// ==================== 设置管理 API（阶段7）====================
const getAppSettings = () => ajax.get('getAppSettings');
const saveAppSettings = (settings) => ajax.post('saveAppSettings', settings);
const getReadSettings = () => ajax.get('getReadSettings');
const saveReadSettings = (settings) => ajax.post('saveReadSettings', settings);
const getThemeSettings = () => ajax.get('getThemeSettings');
const saveThemeSettings = (settings) => ajax.post('saveThemeSettings', settings);
const getAllSettings = () => ajax.get('getAllSettings');
const saveAllSettings = (settings) => ajax.post('saveAllSettings', settings);
const resetAppSettings = () => ajax.post('resetAppSettings');
const resetReadSettings = () => ajax.post('resetReadSettings');
const resetThemeSettings = () => ajax.post('resetThemeSettings');
const resetAllSettings = () => ajax.post('resetAllSettings');
// ==================== 单项设置操作 API（v2.0）====================
const getSetting = (key, category = 'app', defaultValue) => ajax.get('getSetting', {
    params: { key, category, default: defaultValue },
});
const saveSetting = (key, value, category = 'app') => ajax.post('saveSetting', typeof value === 'string' ? value : JSON.stringify(value), { params: { key, category }, headers: { 'Content-Type': 'text/plain' } });
const deleteSetting = (key, category = 'app') => ajax.post('deleteSetting', null, {
    params: { key, category },
});
// ==================== 书籍分组 API（阶段八）====================
/** 获取全部分组 */
const getBookGroups = () => ajax.get('getBookGroups');
/** 保存分组 */
const saveBookGroup = (data) => ajax.post('saveBookGroup', data);
/** 批量保存分组 */
const saveBookGroups = (data) => ajax.post('saveBookGroups', data);
/** 删除分组 */
const deleteBookGroup = (data) => ajax.post('deleteBookGroup', data);
/** 更新分组顺序 */
const updateBookGroupOrder = (orders) => ajax.post('updateBookGroupOrder', { orders });
/** 更新书籍所属分组 */
const updateBookGroup = (bookUrls, groupId) => ajax.post('updateBookGroup', { bookUrls, groupId });
// ==================== 排版配置 API（阶段八）====================
/** 获取排版方案列表 */
const getReadConfigs = () => ajax.get('getReadConfigs');
/** 保存排版方案 */
const saveReadConfigItem = (data) => ajax.post('saveReadConfig', data);
/** 删除排版方案 */
const deleteReadConfig = (index) => ajax.post('deleteReadConfig', { index });
/** 获取共享排版配置 */
const getShareReadConfig = () => ajax.get('getShareReadConfig');
/** 保存共享排版配置 */
const saveShareReadConfig = (data) => ajax.post('saveShareReadConfig', data);
/** 设置当前排版方案 */
const setReadStyleSelect = (index, isComic) => ajax.post('setReadStyleSelect', { index, isComic });
// ==================== 本地书籍导入 API（阶段八）====================
/** 导入本地书籍（multipart 方式） */
const addLocalBook = (file, bookName, author, groupId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (bookName)
        formData.append('bookName', bookName);
    if (author)
        formData.append('author', author);
    if (groupId)
        formData.append('groupId', String(groupId));
    return ajax.post('addLocalBook', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
/** 导入本地书籍（Base64 JSON 方式） */
const addLocalBookJson = (data) => ajax.post('addLocalBookJson', data);
// ==================== RSS 文章 API（阶段八）====================
/** 获取 RSS 源文章列表 */
const getRssArticles = (url, page = 1) => ajax.get('getRssArticles', {
    params: { url, page },
});
/** 获取 RSS 文章内容 */
const getRssArticle = (url, sourceUrl) => ajax.get('getRssArticle', { params: { url, sourceUrl } });
// ==================== 备份恢复 API（阶段八）====================
/** 创建备份（返回 zip blob） */
const backup = (data) => ajax.post('backup', data, { responseType: 'blob' });
/** 恢复备份（上传 zip） */
const restore = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return ajax.post('restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
/** 导出书源 */
const exportBookSources = () => ajax.get('exportBookSources', { responseType: 'blob' });
/** 导入书源 */
const importBookSources = (data) => ajax.post('importBookSources', data);
// ==================== 缓存管理 API（阶段八）====================
/** 清除全部缓存 */
const clearCache = () => ajax.post('clearCache');
/** 清除书籍缓存 */
const clearBookCache = (bookUrl) => ajax.post('clearBookCache', { bookUrl });
/** 清除内容缓存 */
const clearContentCache = () => ajax.post('clearContentCache');
/** 获取缓存大小 */
const getCacheSize = () => ajax.get('getCacheSize');
// ==================== 书籍批量操作 API（阶段八）====================
/** 批量保存书籍进度 */
const saveBookProgressBatch = (progressList) => ajax.post('saveBookProgressBatch', progressList);
/** 检查书籍更新 */
const checkBookUpdate = (url) => ajax.get('checkBookUpdate', { params: { url } });
/** 批量检查更新 */
const checkBookUpdateBatch = (urls) => ajax.post('checkBookUpdateBatch', { urls });
/** 下载章节内容到缓存 */
const downloadContent = (url, start = 0, end = 100) => ajax.get('downloadContent', {
    params: { url, start, end },
});
/** 批量保存书籍 */
const saveBookBatch = (books) => ajax.post('saveBookBatch', books);
// ==================== 搜索历史 API（阶段八）====================
/** 获取搜索历史 */
const getSearchHistory = () => ajax.get('getSearchHistory');
/** 保存搜索历史 */
const saveSearchHistory = (word) => ajax.post('saveSearchHistory', { word });
/** 清除搜索历史 */
const clearSearchHistory = () => ajax.post('clearSearchHistory');
// ==================== WebDAV 同步 API（v3.3 新增）====================
/** 检查 WebDAV 连接 */
const webDavCheck = () => ajax.get('webDavCheck');
/** 上传备份到 WebDAV */
const webDavBackup = () => ajax.post('webDavBackup');
/** 从 WebDAV 恢复备份 */
const webDavRestore = () => ajax.post('webDavRestore');
export default {
    getReadConfig,
    saveReadConfig,
    saveBookProgress,
    saveBookProgressWithBeacon,
    getBookShelf,
    getChapterList,
    getBookContent,
    search,
    saveBook,
    deleteBook,
    getSources,
    saveSources,
    saveSource,
    deleteSource,
    debug,
    getProxyCoverUrl,
    getProxyImageUrl,
    // 设置管理 API（阶段7）
    getAppSettings,
    saveAppSettings,
    getReadSettings,
    saveReadSettings,
    getThemeSettings,
    saveThemeSettings,
    getAllSettings,
    saveAllSettings,
    resetAppSettings,
    resetReadSettings,
    resetThemeSettings,
    resetAllSettings,
    getSetting,
    saveSetting,
    deleteSetting,
    // 阶段八新增 API
    getBookGroups,
    saveBookGroup,
    saveBookGroups,
    deleteBookGroup,
    updateBookGroupOrder,
    updateBookGroup,
    getReadConfigs,
    saveReadConfigItem,
    deleteReadConfig,
    getShareReadConfig,
    saveShareReadConfig,
    setReadStyleSelect,
    addLocalBook,
    addLocalBookJson,
    getRssArticles,
    getRssArticle,
    backup,
    restore,
    exportBookSources,
    importBookSources,
    clearCache,
    clearBookCache,
    clearContentCache,
    getCacheSize,
    saveBookProgressBatch,
    checkBookUpdate,
    checkBookUpdateBatch,
    downloadContent,
    saveBookBatch,
    getSearchHistory,
    saveSearchHistory,
    clearSearchHistory,
    // WebDAV 同步 API（v3.3 新增）
    webDavCheck,
    webDavBackup,
    webDavRestore,
};
