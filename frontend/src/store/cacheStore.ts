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

import { defineStore } from 'pinia'
import { ref } from 'vue'
import API from '@api'
import { ElMessage } from 'element-plus'

/** 缓存大小信息结构（对齐后端 GET /getCacheSize 返回） */
export interface CacheSizeInfo {
  /** 缓存总字节数 */
  totalSize: number
  /** 缓存章节数 */
  chapterCount: number
  /** 书籍总数（数据库） */
  bookCount: number
  /** 书源总数（数据库） */
  sourceCount: number
}

export const useCacheStore = defineStore('cache', () => {
  // ==================== State ====================
  const cacheSize = ref<CacheSizeInfo>({
    totalSize: 0,
    chapterCount: 0,
    bookCount: 0,
    sourceCount: 0,
  })
  const loading = ref(false)
  const clearing = ref(false)

  // ==================== Actions ====================

  /**
   * 加载缓存大小信息
   * 页面初始化或清理后刷新
   */
  const loadCacheSize = async () => {
    loading.value = true
    try {
      const { data } = await API.getCacheSize()
      if (data.isSuccess && data.data) {
        cacheSize.value = data.data as CacheSizeInfo
      } else {
        ElMessage.error(data.errorMsg || '获取缓存大小失败')
      }
    } catch (e) {
      ElMessage.error('获取缓存大小失败: ' + (e as Error).message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除全部缓存（章节缓存 + 数据库缓存）
   * @returns 清理释放的字节数
   */
  const clearAllCache = async (): Promise<number> => {
    clearing.value = true
    try {
      const { data } = await API.clearCache()
      if (data.isSuccess && data.data) {
        const size = (data.data as { cleared: boolean; size: number }).size
        ElMessage.success(`已清除全部缓存（${formatSize(size)}）`)
        await loadCacheSize()
        return size
      } else {
        ElMessage.error(data.errorMsg || '清除缓存失败')
      }
    } catch (e) {
      ElMessage.error('清除缓存失败: ' + (e as Error).message)
    } finally {
      clearing.value = false
    }
    return 0
  }

  /**
   * 清除内容缓存（仅章节正文文件缓存）
   * @returns 清理释放的字节数
   */
  const clearContentOnly = async (): Promise<number> => {
    clearing.value = true
    try {
      const { data } = await API.clearContentCache()
      if (data.isSuccess && data.data) {
        const size = (data.data as { size: number }).size
        ElMessage.success(`已清除内容缓存（${formatSize(size)}）`)
        await loadCacheSize()
        return size
      } else {
        ElMessage.error(data.errorMsg || '清除内容缓存失败')
      }
    } catch (e) {
      ElMessage.error('清除内容缓存失败: ' + (e as Error).message)
    } finally {
      clearing.value = false
    }
    return 0
  }

  /**
   * 清除指定书籍的缓存
   * @param bookUrl 书籍URL
   */
  const clearBookCache = async (bookUrl: string) => {
    clearing.value = true
    try {
      const { data } = await API.clearBookCache(bookUrl)
      if (data.isSuccess) {
        ElMessage.success('书籍缓存已清除')
        await loadCacheSize()
      } else {
        ElMessage.error(data.errorMsg || '清除书籍缓存失败')
      }
    } catch (e) {
      ElMessage.error('清除书籍缓存失败: ' + (e as Error).message)
    } finally {
      clearing.value = false
    }
  }

  /**
   * 格式化字节数为可读字符串
   * @param bytes 字节数
   * @returns 形如 "1.23 MB"
   */
  const formatSize = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let value = bytes
    let unitIndex = 0
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex++
    }
    return `${value.toFixed(2)} ${units[unitIndex]}`
  }

  /** 缓存大小格式化字符串（供模板直接展示） */
  const formattedTotalSize = () => formatSize(cacheSize.value.totalSize)

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
  }
})
