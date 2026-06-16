/**
 * 缓存状态管理 Store - 章节内容缓存查询与清理
 *
 * 封装阶段八缓存管理 API（getCacheSize/clearCache/clearContentCache/clearBookCache），
 * 配合 Settings.vue 缓存管理区块使用。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 06:22 codewhale - 阶段八补全新增
 */
/** 缓存大小信息结构（对齐后端 GET /getCacheSize 返回） */
export interface CacheSizeInfo {
    /** 缓存总字节数 */
    totalSize: number;
    /** 缓存章节数 */
    chapterCount: number;
    /** 书籍总数（数据库） */
    bookCount: number;
    /** 书源总数（数据库） */
    sourceCount: number;
}
export declare const useCacheStore: any;
