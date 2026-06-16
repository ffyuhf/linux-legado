/**
 * 书籍分组状态管理 Store
 *
 * 管理书架分组 CRUD，配合 BookShelf.vue 实现分组管理功能。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 02:09 nmb - 阶段八新增
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import API from '@api';
import { ElMessage } from 'element-plus';
export const useBookGroupStore = defineStore('bookGroup', () => {
    const groups = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    /** 加载全部分组 */
    const loadGroups = async () => {
        loading.value = true;
        try {
            const { data } = await API.getBookGroups();
            if (data.isSuccess && data.data) {
                groups.value = data.data;
            }
            else {
                ElMessage.error(data.errorMsg || '加载分组失败');
            }
        }
        catch (e) {
            ElMessage.error('加载分组失败: ' + e.message);
        }
        finally {
            loading.value = false;
        }
    };
    /** 保存分组（新增或更新） */
    const saveGroup = async (group) => {
        saving.value = true;
        try {
            const { data } = await API.saveBookGroup(group);
            if (data.isSuccess) {
                ElMessage.success('分组已保存');
                await loadGroups();
                return data.data;
            }
            else {
                ElMessage.error(data.errorMsg || '保存分组失败');
            }
        }
        catch (e) {
            ElMessage.error('保存分组失败: ' + e.message);
        }
        finally {
            saving.value = false;
        }
    };
    /** 删除分组 */
    const removeGroup = async (groupId) => {
        saving.value = true;
        try {
            const { data } = await API.deleteBookGroup({ id: groupId });
            if (data.isSuccess) {
                ElMessage.success('分组已删除');
                await loadGroups();
            }
            else {
                ElMessage.error(data.errorMsg || '删除分组失败');
            }
        }
        catch (e) {
            ElMessage.error('删除分组失败: ' + e.message);
        }
        finally {
            saving.value = false;
        }
    };
    /** 更新分组顺序 */
    const updateOrder = async (orders) => {
        try {
            const { data } = await API.updateBookGroupOrder(orders);
            if (data.isSuccess) {
                await loadGroups();
            }
        }
        catch (e) {
            ElMessage.error('更新分组顺序失败: ' + e.message);
        }
    };
    /** 更新书籍所属分组 */
    const updateBookGroup = async (bookUrls, groupId) => {
        saving.value = true;
        try {
            const { data } = await API.updateBookGroup(bookUrls, groupId);
            if (data.isSuccess) {
                ElMessage.success('书籍分组已更新');
            }
            else {
                ElMessage.error(data.errorMsg || '更新书籍分组失败');
            }
        }
        catch (e) {
            ElMessage.error('更新书籍分组失败: ' + e.message);
        }
        finally {
            saving.value = false;
        }
    };
    return {
        groups,
        loading,
        saving,
        loadGroups,
        saveGroup,
        removeGroup,
        updateOrder,
        updateBookGroup,
    };
});
