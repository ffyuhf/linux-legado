/**
 * 书籍分组状态管理 Store
 *
 * 管理书架分组 CRUD，配合 BookShelf.vue 实现分组管理功能。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 02:09 nmb - 阶段八新增
 */
/** 分组数据接口 */
export interface BookGroup {
    groupId: number;
    groupName: string;
    cover?: string | null;
    order: number;
    enableRefresh?: number;
    show?: number;
    bookSort?: number;
    onlyUpdateRead?: number;
}
export declare const useBookGroupStore: any;
