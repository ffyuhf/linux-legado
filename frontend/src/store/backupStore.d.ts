/**
 * 备份恢复状态管理 Store - 数据备份、恢复、书源导入导出
 *
 * 封装阶段八备份恢复 API（backup/restore/exportBookSources/importBookSources），
 * 配合 Settings.vue 数据备份区块和 BookShelf.vue 使用。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 06:22 codewhale - 阶段八补全新增
 */
/** 备份选项 */
export interface BackupOptions {
    /** 是否包含书籍数据 */
    includeBooks?: boolean;
    /** 是否包含书源 */
    includeSources?: boolean;
    /** 是否包含配置 */
    includeConfigs?: boolean;
}
/** 恢复结果统计 */
export interface RestoreResult {
    books: number;
    sources: number;
    configs: number;
}
export declare const useBackupStore: any;
