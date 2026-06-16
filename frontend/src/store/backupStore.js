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
import { defineStore } from 'pinia';
import { ref } from 'vue';
import API from '@api';
import { ElMessage } from 'element-plus';
export const useBackupStore = defineStore('backup', () => {
    // ==================== State ====================
    const backingUp = ref(false);
    const restoring = ref(false);
    // ==================== Actions ====================
    /**
     * 创建备份并触发浏览器下载
     *
     * 调用 POST /backup 获取 zip blob，生成临时下载链接并触发下载。
     *
     * @param options 备份选项
     */
    const createBackup = async (options = {}) => {
        backingUp.value = true;
        try {
            const { data } = await API.backup({
                includeBooks: options.includeBooks ?? true,
                includeSources: options.includeSources ?? true,
                includeConfigs: options.includeConfigs ?? true,
            });
            // data 为 Blob（responseType: 'blob'）
            const blob = data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // 文件名带时间戳，避免覆盖
            const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            link.download = `legado_backup_${ts}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            ElMessage.success('备份创建成功，已开始下载');
        }
        catch (e) {
            ElMessage.error('创建备份失败: ' + e.message);
        }
        finally {
            backingUp.value = false;
        }
    };
    /**
     * 从备份 zip 恢复数据
     *
     * @param file 用户上传的 backup.zip
     * @returns 恢复统计结果
     */
    const restoreBackup = async (file) => {
        restoring.value = true;
        try {
            const { data } = await API.restore(file);
            if (data.isSuccess && data.data) {
                const result = data.data;
                ElMessage.success(`恢复成功：书籍 ${result.books} 个，源 ${result.sources} 个，配置 ${result.configs} 项`);
                return result;
            }
            else {
                ElMessage.error(data.errorMsg || '恢复备份失败');
            }
        }
        catch (e) {
            ElMessage.error('恢复备份失败: ' + e.message);
        }
        finally {
            restoring.value = false;
        }
        return null;
    };
    /**
     * 导出全部书源并触发下载
     *
     * 调用 GET /exportBookSources 获取 JSON blob 并下载。
     */
    const exportSources = async () => {
        try {
            const { data } = await API.exportBookSources();
            const blob = data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            link.download = `book_sources_${ts}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            ElMessage.success('书源导出成功，已开始下载');
        }
        catch (e) {
            ElMessage.error('导出书源失败: ' + e.message);
        }
    };
    /**
     * 导入书源
     *
     * @param sources 书源数组
     * @returns 导入数量
     */
    const importSources = async (sources) => {
        try {
            const { data } = await API.importBookSources(sources);
            if (data.isSuccess) {
                const count = data.data;
                ElMessage.success(`导入成功，共 ${count} 个书源`);
                return count;
            }
            else {
                ElMessage.error(data.errorMsg || '导入书源失败');
            }
        }
        catch (e) {
            ElMessage.error('导入书源失败: ' + e.message);
        }
        return 0;
    };
    /**
     * 从用户选择的 JSON 文件导入书源
     *
     * @param file 用户上传的书源 JSON 文件
     * @returns 导入数量
     */
    const importSourcesFromFile = async (file) => {
        try {
            const text = await file.text();
            const sources = JSON.parse(text);
            if (!Array.isArray(sources)) {
                ElMessage.error('书源文件格式错误：应为 JSON 数组');
                return 0;
            }
            return await importSources(sources);
        }
        catch (e) {
            ElMessage.error('解析书源文件失败: ' + e.message);
            return 0;
        }
    };
    return {
        // State
        backingUp,
        restoring,
        // Actions
        createBackup,
        restoreBackup,
        exportSources,
        importSources,
        importSourcesFromFile,
    };
});
