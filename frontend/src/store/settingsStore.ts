/**
 * 设置状态管理 Store - 管理应用/阅读/主题三类设置
 *
 * 对应后端 AppSettings.kt，提供三类设置的加载、保存、重置功能。
 * 采用 Pinia 组合式 API，配合 Element Plus 实现 WebUI 设置页面。
 *
 * 创建日期: 2026-06-14
 * 修改历史:
 * 2026-06-14 12:28 nmb - 初始版本，对齐后端阶段七设置管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import API from '@api'
import { ElMessage } from 'element-plus'

  /** 三类设置的根数据结构 */
  interface AllSettings {
    app: Record<string, unknown>
    read: Record<string, unknown>
    theme: Record<string, unknown>
    defaults: Record<string, unknown>
  }
  
  /** 搜索历史条目（v3.2 新增） */
  interface SearchHistoryItem {
    word: string
    time: number
  }
  
  export const useSettingsStore = defineStore('settings', () => {
    // ==================== State ====================
    const appSettings = ref<Record<string, unknown>>({})
    const readSettings = ref<Record<string, unknown>>({})
    const themeSettings = ref<Record<string, unknown>>({})
    const defaults = ref<Record<string, unknown>>({})
    const loading = ref(false)
    const saving = ref(false)
  
    /** 搜索历史列表（v3.2 新增） */
    const searchHistory = ref<SearchHistoryItem[]>([])
    const searchHistoryLoading = ref(false)
  
    // ==================== Getters ====================

  /** 全部设置（合并默认值，用于前端展示） */
  const mergedAppSettings = computed(() => ({
    ...defaults.value,
    ...appSettings.value,
  }))
  const mergedReadSettings = computed(() => ({
    ...defaults.value,
    ...readSettings.value,
  }))
  const mergedThemeSettings = computed(() => ({
    ...defaults.value,
    ...themeSettings.value,
  }))

  // ==================== Actions ====================

  /**
   * 加载全部设置（应用+阅读+主题+默认值）
   * 页面初始化时调用
   */
  const loadAllSettings = async () => {
    loading.value = true
    try {
      const { data } = await API.getAllSettings()
      if (data.isSuccess && data.data) {
        appSettings.value = data.data.app || {}
        readSettings.value = data.data.read || {}
        themeSettings.value = data.data.theme || {}
        defaults.value = data.data.defaults || {}
      } else {
        ElMessage.error(data.errorMsg || '加载设置失败')
      }
    } catch (e) {
      ElMessage.error('加载设置失败: ' + (e as Error).message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 保存全部设置（批量提交）
   * @param changes 变更内容，包含 app/read/theme 三个分类
   */
  const saveAllSettings = async (changes: {
    app?: Record<string, unknown>
    read?: Record<string, unknown>
    theme?: Record<string, unknown>
  }) => {
    saving.value = true
    try {
      const { data } = await API.saveAllSettings(changes)
      if (data.isSuccess) {
        ElMessage.success('设置已保存')
        // 更新本地缓存
        if (changes.app) appSettings.value = { ...appSettings.value, ...changes.app }
        if (changes.read) readSettings.value = { ...readSettings.value, ...changes.read }
        if (changes.theme) themeSettings.value = { ...themeSettings.value, ...changes.theme }
      } else {
        ElMessage.error(data.errorMsg || '保存设置失败')
      }
    } catch (e) {
      ElMessage.error('保存设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 保存应用设置
   * @param settings 应用设置键值对
   */
  const saveAppSettings = async (settings: Record<string, unknown>) => {
    saving.value = true
    try {
      const { data } = await API.saveAppSettings(settings)
      if (data.isSuccess) {
        ElMessage.success('应用设置已保存')
        appSettings.value = { ...appSettings.value, ...settings }
      } else {
        ElMessage.error(data.errorMsg || '保存应用设置失败')
      }
    } catch (e) {
      ElMessage.error('保存应用设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 保存阅读设置
   * @param settings 阅读设置键值对
   */
  const saveReadSettings = async (settings: Record<string, unknown>) => {
    saving.value = true
    try {
      const { data } = await API.saveReadSettings(settings)
      if (data.isSuccess) {
        ElMessage.success('阅读设置已保存')
        readSettings.value = { ...readSettings.value, ...settings }
      } else {
        ElMessage.error(data.errorMsg || '保存阅读设置失败')
      }
    } catch (e) {
      ElMessage.error('保存阅读设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 保存主题设置
   * @param settings 主题设置键值对
   */
  const saveThemeSettings = async (settings: Record<string, unknown>) => {
    saving.value = true
    try {
      const { data } = await API.saveThemeSettings(settings)
      if (data.isSuccess) {
        ElMessage.success('主题设置已保存')
        themeSettings.value = { ...themeSettings.value, ...settings }
      } else {
        ElMessage.error(data.errorMsg || '保存主题设置失败')
      }
    } catch (e) {
      ElMessage.error('保存主题设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 重置应用设置到默认值
   */
  const resetAppSettings = async () => {
    saving.value = true
    try {
      const { data } = await API.resetAppSettings()
      if (data.isSuccess) {
        ElMessage.success('应用设置已重置')
        appSettings.value = {}
      } else {
        ElMessage.error(data.errorMsg || '重置应用设置失败')
      }
    } catch (e) {
      ElMessage.error('重置应用设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 重置阅读设置到默认值
   */
  const resetReadSettings = async () => {
    saving.value = true
    try {
      const { data } = await API.resetReadSettings()
      if (data.isSuccess) {
        ElMessage.success('阅读设置已重置')
        readSettings.value = {}
      } else {
        ElMessage.error(data.errorMsg || '重置阅读设置失败')
      }
    } catch (e) {
      ElMessage.error('重置阅读设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 重置主题设置到默认值
   */
  const resetThemeSettings = async () => {
    saving.value = true
    try {
      const { data } = await API.resetThemeSettings()
      if (data.isSuccess) {
        ElMessage.success('主题设置已重置')
        themeSettings.value = {}
      } else {
        ElMessage.error(data.errorMsg || '重置主题设置失败')
      }
    } catch (e) {
      ElMessage.error('重置主题设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 重置全部设置到默认值
   */
  const resetAllSettings = async () => {
    saving.value = true
    try {
      const { data } = await API.resetAllSettings()
      if (data.isSuccess) {
        ElMessage.success('全部设置已重置')
        appSettings.value = {}
        readSettings.value = {}
        themeSettings.value = {}
      } else {
        ElMessage.error(data.errorMsg || '重置全部设置失败')
      }
    } catch (e) {
      ElMessage.error('重置全部设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  // ==================== 单项设置操作（v2.0新增）====================

  /**
   * 获取单个设置项
   * @param key 配置键名
   * @param category 配置类别: app/read/theme
   * @param defaultValue 默认值（可选）
   * @returns 设置值
   */
  const getSetting = async (
    key: string,
    category: 'app' | 'read' | 'theme' = 'app',
    defaultValue?: string,
  ): Promise<unknown> => {
    try {
      const { data } = await API.getSetting(key, category, defaultValue)
      if (data.isSuccess) {
        return data.data
      } else {
        ElMessage.error(data.errorMsg || '获取设置失败')
      }
    } catch (e) {
      ElMessage.error('获取设置失败: ' + (e as Error).message)
    }
    return undefined
  }

  /**
   * 保存单个设置项
   * @param key 配置键名
   * @param value 设置值
   * @param category 配置类别: app/read/theme
   */
  const saveSetting = async (
    key: string,
    value: unknown,
    category: 'app' | 'read' | 'theme' = 'app',
  ): Promise<void> => {
    saving.value = true
    try {
      const { data } = await API.saveSetting(key, value, category)
      if (data.isSuccess) {
        ElMessage.success(`设置 ${key} 已保存`)
        // 同步更新本地缓存
        if (category === 'app') {
          appSettings.value = { ...appSettings.value, [key]: value }
        } else if (category === 'read') {
          readSettings.value = { ...readSettings.value, [key]: value }
        } else {
          themeSettings.value = { ...themeSettings.value, [key]: value }
        }
      } else {
        ElMessage.error(data.errorMsg || '保存设置失败')
      }
    } catch (e) {
      ElMessage.error('保存设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  /**
   * 删除单个设置项
   * @param key 配置键名
   * @param category 配置类别: app/read/theme
   */
  const deleteSetting = async (
    key: string,
    category: 'app' | 'read' | 'theme' = 'app',
  ): Promise<void> => {
    saving.value = true
    try {
      const { data } = await API.deleteSetting(key, category)
      if (data.isSuccess) {
        ElMessage.success(`设置 ${key} 已删除`)
        // 同步删除本地缓存
        if (category === 'app') {
          const updated = { ...appSettings.value }
          delete updated[key]
          appSettings.value = updated
        } else if (category === 'read') {
          const updated = { ...readSettings.value }
          delete updated[key]
          readSettings.value = updated
        } else {
          const updated = { ...themeSettings.value }
          delete updated[key]
          themeSettings.value = updated
        }
      } else {
        ElMessage.error(data.errorMsg || '删除设置失败')
      }
    } catch (e) {
      ElMessage.error('删除设置失败: ' + (e as Error).message)
    } finally {
      saving.value = false
    }
  }

  // ==================== 搜索历史操作（v3.2 新增）====================
  
  /**
   * 加载搜索历史列表
   * 从后端拉取全部搜索历史，按时间倒序排列
   */
  const loadSearchHistory = async () => {
    searchHistoryLoading.value = true
    try {
      const { data } = await API.getSearchHistory()
      if (data.isSuccess && data.data) {
        // 按时间倒序排列，最近搜索在前
        searchHistory.value = [...data.data].sort((a, b) => b.time - a.time)
      } else {
        ElMessage.error(data.errorMsg || '加载搜索历史失败')
      }
    } catch (e) {
      ElMessage.error('加载搜索历史失败: ' + (e as Error).message)
    } finally {
      searchHistoryLoading.value = false
    }
  }
  
  /**
   * 保存单条搜索历史
   * @param word 搜索关键词
   */
  const saveSearchHistory = async (word: string) => {
    if (!word.trim()) return
    try {
      const { data } = await API.saveSearchHistory(word.trim())
      if (data.isSuccess) {
        // 保存成功后重新加载列表，保持数据一致性
        await loadSearchHistory()
      } else {
        ElMessage.error(data.errorMsg || '保存搜索历史失败')
      }
    } catch (e) {
      ElMessage.error('保存搜索历史失败: ' + (e as Error).message)
    }
  }
  
  /**
   * 清除全部搜索历史
   */
  const clearSearchHistory = async () => {
    searchHistoryLoading.value = true
    try {
      const { data } = await API.clearSearchHistory()
      if (data.isSuccess) {
        searchHistory.value = []
        ElMessage.success('搜索历史已清除')
      } else {
        ElMessage.error(data.errorMsg || '清除搜索历史失败')
      }
    } catch (e) {
      ElMessage.error('清除搜索历史失败: ' + (e as Error).message)
    } finally {
      searchHistoryLoading.value = false
    }
  }
  
  return {
    // State
    appSettings,
    readSettings,
    themeSettings,
    defaults,
    loading,
    saving,
    // 搜索历史 State（v3.2 新增）
    searchHistory,
    searchHistoryLoading,
    // Getters
    mergedAppSettings,
    mergedReadSettings,
    mergedThemeSettings,
    // Actions
    loadAllSettings,
    saveAllSettings,
    saveAppSettings,
    saveReadSettings,
    saveThemeSettings,
    resetAppSettings,
    resetReadSettings,
    resetThemeSettings,
    resetAllSettings,
    // 单项设置操作（v2.0新增）
    getSetting,
    saveSetting,
    deleteSetting,
    // 搜索历史操作（v3.2 新增）
    loadSearchHistory,
    saveSearchHistory,
    clearSearchHistory,
  }
})
