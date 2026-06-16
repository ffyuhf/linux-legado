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
import { defineStore } from 'pinia';
import { ref } from 'vue';
import API from '@api';
import { ElMessage } from 'element-plus';
export const useCacheStore = defineStore('cache', () => {
    // ==================== State ====================
    const cacheSize = ref({
        totalSize: 0,
        chapterCount: 0,
        bookCount: 0,
        sourceCount: 0,
    });
    const loading = ref(false);
    const clearing = ref(false);
    // ==================== Actions ====================
    /**
     * 加载缓存大小信息
     * 页面初始化或清理后刷新
     */
    const loadCacheSize = async () => {
        loading.value = true;
        try {
            const { data } = await API.getCacheSize();
            if (data.isSuccess && data.data) {
                cacheSize.value = data.data;
            }
            else {
                ElMessage.error(data.errorMsg || '获取缓存大小失败');
            }
        }
        catch (e) {
            ElMessage.error('获取缓存大小失败: ' + e.message);
        }
        finally {
            loading.value = false;
        }
    };
    /**
     * 清除全部缓存（章节缓存 + 数据库缓存）
     * @returns 清理释放的字节数
     */
    const clearAllCache = async () => {
        clearing.value = true;
        try {
            const { data } = await API.clearCache();
            if (data.isSuccess && data.data) {
                const size = data.data.size;
                ElMessage.success(`已清除全部缓存（${formatSize(size)}）`);
                await loadCacheSize();
                return size;
            }
            else {
                ElMessage.error(data.errorMsg || '清除缓存失败');
            }
        }
        catch (e) {
            ElMessage.error('清除缓存失败: ' + e.message);
        }
        finally {
            clearing.value = false;
        }
        return 0;
    };
    /**
     * 清除内容缓存（仅章节正文文件缓存）
     * @returns 清理释放的字节数
     */
    const clearContentOnly = async () => {
        clearing.value = true;
        try {
            const { data } = await API.clearContentCache();
            if (data.isSuccess && data.data) {
                const size = data.data.size;
                ElMessage.success(`已清除内容缓存（${formatSize(size)}）`);
                await loadCacheSize();
                return size;
            }
            else {
                ElMessage.error(data.errorMsg || '清除内容缓存失败');
            }
        }
        catch (e) {
            ElMessage.error('清除内容缓存失败: ' + e.message);
        }
        finally {
            clearing.value = false;
        }
        return 0;
    };
    /**
     * 清除指定书籍的缓存
     * @param bookUrl 书籍URL
     */
    const clearBookCache = async (bookUrl) => {
        clearing.value = true;
        try {
            const { data } = await API.clearBookCache(bookUrl);
            if (data.isSuccess) {
                ElMessage.success('书籍缓存已清除');
                await loadCacheSize();
            }
            else {
                ElMessage.error(data.errorMsg || '清除书籍缓存失败');
            }
        }
        catch (e) {
            ElMessage.error('清除书籍缓存失败: ' + e.message);
        }
        finally {
            clearing.value = false;
        }
    };
    /**
     * 格式化字节数为可读字符串
     * @param bytes 字节数
     * @returns 形如 "1.23 MB"
     */
    const formatSize = (bytes) => {
        if (bytes <= 0)
            return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }
        return `${value.toFixed(2)} ${units[unitIndex]}`;
    };
    /** 缓存大小格式化字符串（供模板直接展示） */
    const formattedTotalSize = () => formatSize(cacheSize.value.totalSize);
    return {
        // State
        cacheSize,
        loading,
        clearing,
        // Actions
        loadCacheSize,
        clearAllCache,
        clearContentOnly,
        clearBookCache,
        formatSize,
        formattedTotalSize,
    };
});
