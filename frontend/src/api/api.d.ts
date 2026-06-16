/** https://github.com/gedoor/legado/tree/master/app/src/main/java/io/legado/app/api */
/** https://github.com/gedoor/legado/tree/master/app/src/main/java/io/legado/app/web */
/**
 * 前端 API 层 - 全部 HTTP 端点封装
 *
 * 修改历史:
 * 2026-06-13 12:00 nmb - 初始版本
 * 2026-06-14 12:30 nmb - 阶段七：新增设置管理 API
 * 2026-06-15 12:56 nmb - v2.0 新增单项设置操作 API
 * 2026-06-16 02:08 nmb - 阶段八：新增分组/排版/导入/RSS/备份/缓存/批量/搜索历史 API
 */
import type { webReadConfig } from '@/web';
import type { BaseBook, BookProgress, SeachBook } from '@/book';
import type { Source } from '@/source';
export type LeagdoApiResponse<T> = {
    isSuccess: boolean;
    errorMsg: string;
    data: T;
};
export declare let legado_http_entry_point: string;
export declare let legado_webSocket_entry_point: string;
declare let wsOnError: typeof WebSocket.prototype.onerror;
declare let wsOnMessage: typeof WebSocket.prototype.onmessage;
export declare const setWebsocketOnMessage: (callback: typeof wsOnMessage) => ((this: WebSocket, ev: MessageEvent) => any) | null;
export declare const setWebsocketOnError: (callback: typeof wsOnError) => void;
export declare const setApiEntryPoint: (http_entry_point: string, webSocket_entry_point: string) => void;
declare const _default: {
    getReadConfig: (http_url?: string) => Promise<webReadConfig | undefined>;
    saveReadConfig: (config: webReadConfig) => any;
    saveBookProgress: (bookProgress: BookProgress) => any;
    saveBookProgressWithBeacon: (bookProgress: BookProgress) => void;
    getBookShelf: () => any;
    getChapterList: (bookUrl: string) => any;
    getBookContent: (bookUrl: string, chapterIndex: number) => any;
    search: (searchKey: string, onReceive: (data: SeachBook[]) => void, onFinish: () => void) => void;
    saveBook: (book: BaseBook) => any;
    deleteBook: (book: BaseBook) => any;
    getSources: () => any;
    saveSources: (data: Source[]) => any;
    saveSource: (data: Source) => any;
    deleteSource: (data: Source[]) => any;
    debug: (sourceUrl: string, searchKey: string, onReceive: (data: string) => void, onFinish: () => void) => void;
    getProxyCoverUrl: (coverUrl: string) => string;
    getProxyImageUrl: (bookUrl: string, src: string, width: number | `${number}`) => string;
    getAppSettings: () => any;
    saveAppSettings: (settings: Record<string, unknown>) => any;
    getReadSettings: () => any;
    saveReadSettings: (settings: Record<string, unknown>) => any;
    getThemeSettings: () => any;
    saveThemeSettings: (settings: Record<string, unknown>) => any;
    getAllSettings: () => any;
    saveAllSettings: (settings: {
        app?: Record<string, unknown>;
        read?: Record<string, unknown>;
        theme?: Record<string, unknown>;
    }) => any;
    resetAppSettings: () => any;
    resetReadSettings: () => any;
    resetThemeSettings: () => any;
    resetAllSettings: () => any;
    getSetting: (key: string, category?: string, defaultValue?: string) => any;
    saveSetting: (key: string, value: unknown, category?: string) => any;
    deleteSetting: (key: string, category?: string) => any;
    getBookGroups: () => any;
    saveBookGroup: (data: Record<string, unknown>) => any;
    saveBookGroups: (data: Record<string, unknown>[]) => any;
    deleteBookGroup: (data: {
        id: number;
    }) => any;
    updateBookGroupOrder: (orders: number[]) => any;
    updateBookGroup: (bookUrls: string[], groupId: number) => any;
    getReadConfigs: () => any;
    saveReadConfigItem: (data: Record<string, unknown>) => any;
    deleteReadConfig: (index: number) => any;
    getShareReadConfig: () => any;
    saveShareReadConfig: (data: Record<string, unknown>) => any;
    setReadStyleSelect: (index: number, isComic: boolean) => any;
    addLocalBook: (file: File, bookName?: string, author?: string, groupId?: number) => any;
    addLocalBookJson: (data: {
        fileName: string;
        base64: string;
        bookName?: string;
        author?: string;
        groupId?: number;
    }) => any;
    getRssArticles: (url: string, page?: number) => any;
    getRssArticle: (url: string, sourceUrl?: string) => any;
    backup: (data: {
        includeBooks?: boolean;
        includeSources?: boolean;
        includeConfigs?: boolean;
    }) => any;
    restore: (file: File) => any;
    exportBookSources: () => any;
    importBookSources: (data: Record<string, unknown>[]) => any;
    clearCache: () => any;
    clearBookCache: (bookUrl: string) => any;
    clearContentCache: () => any;
    getCacheSize: () => any;
    saveBookProgressBatch: (progressList: Record<string, unknown>[]) => any;
    checkBookUpdate: (url: string) => any;
    checkBookUpdateBatch: (urls: string[]) => any;
    downloadContent: (url: string, start?: number, end?: number) => any;
    saveBookBatch: (books: Record<string, unknown>[]) => any;
    getSearchHistory: () => any;
    saveSearchHistory: (word: string) => any;
    clearSearchHistory: () => any;
    webDavCheck: () => any;
    webDavBackup: () => any;
    webDavRestore: () => any;
};
export default _default;
