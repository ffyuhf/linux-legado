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

import type { webReadConfig } from '@/web'
import ajax from './axios'
import type {
  BaseBook,
  Book,
  BookChapter,
  BookProgress,
  SeachBook,
} from '@/book'
import type { Source } from '@/source'

export type LeagdoApiResponse<T> = {
  isSuccess: boolean
  errorMsg: string
  data: T
}

export let legado_http_entry_point = ''
export let legado_webSocket_entry_point = ''

let wsOnError: typeof WebSocket.prototype.onerror = () => {}
let wsOnMessage: typeof WebSocket.prototype.onmessage = () => {}
export const setWebsocketOnMessage = (callback: typeof wsOnMessage) =>
  (wsOnMessage = callback)
export const setWebsocketOnError = (callback: typeof wsOnError) => {
  //WebSocket.prototype.onerror = callback
  wsOnError = callback
}

export const setApiEntryPoint = (
  http_entry_point: string,
  webSocket_entry_point: string,
) => {
  legado_http_entry_point = new URL(http_entry_point).toString()
  legado_webSocket_entry_point = new URL(webSocket_entry_point).toString()
  ajax.defaults.baseURL = legado_http_entry_point
}

// 书架API
const getReadConfig = async (http_url = legado_http_entry_point) => {
  const { data } = await ajax.get<LeagdoApiResponse<string>>('getReadConfig', {
    baseURL: http_url.toString(),
    timeout: 3000,
  })
  if (data.isSuccess) {
    try {
      return JSON.parse(data.data) as webReadConfig
    } catch {}
  }
}
const saveReadConfig = (config: webReadConfig) =>
  ajax.post<LeagdoApiResponse<string>>('saveReadConfig', config)

const saveBookProgress = (bookProgress: BookProgress) =>
  ajax.post('saveBookProgress', bookProgress)

const saveBookProgressWithBeacon = (bookProgress: BookProgress) => {
  if (!bookProgress) return
  navigator.sendBeacon(
    new URL('saveBookProgress', legado_http_entry_point),
    JSON.stringify(bookProgress),
  )
}

const getBookShelf = () => ajax.get<LeagdoApiResponse<Book[]>>('getBookshelf')

const getChapterList = (bookUrl: string) =>
  ajax.get<LeagdoApiResponse<BookChapter[]>>(
    'getChapterList?url=' + encodeURIComponent(bookUrl),
  )

const getBookContent = (bookUrl: string, chapterIndex: number) =>
  ajax.get<LeagdoApiResponse<string>>(
    'getBookContent?url=' +
      encodeURIComponent(bookUrl) +
      '&index=' +
      chapterIndex,
  )

const search = (
  searchKey: string,
  onReceive: (data: SeachBook[]) => void,
  onFinish: () => void,
) => {
  const socket = new WebSocket(
    new URL('searchBook', legado_webSocket_entry_point),
  )
  socket.onerror = wsOnError
  socket.onopen = () => {
    socket.send(`{"key":"${searchKey}"}`)
  }
  socket.onmessage = event => {
    try {
      onReceive(JSON.parse(event.data))
      wsOnMessage?.call(socket, event)
    } catch {
      onFinish()
    }
  }
  socket.onclose = () => {
    onFinish()
  }
}

const saveBook = (book: BaseBook) =>
  ajax.post<LeagdoApiResponse<string>>('saveBook', book)
const deleteBook = (book: BaseBook) =>
  ajax.post<LeagdoApiResponse<string>>('deleteBook', book)

const isBookSource = /bookSource/i.test(location.href)

const getSources = () =>
  isBookSource ? ajax.get('getBookSources') : ajax.get('getRssSources')

const saveSource = (data: Source) =>
  isBookSource
    ? ajax.post<LeagdoApiResponse<string>>('saveBookSource', data)
    : ajax.post<LeagdoApiResponse<string>>('saveRssSource', data)

const saveSources = (data: Source[]) =>
  isBookSource
    ? ajax.post<LeagdoApiResponse<Source[]>>('saveBookSources', data)
    : ajax.post<LeagdoApiResponse<Source[]>>('saveRssSources', data)

const deleteSource = (data: Source[]) =>
  isBookSource
    ? ajax.post<LeagdoApiResponse<string>>('deleteBookSources', data)
    : ajax.post<LeagdoApiResponse<string>>('deleteRssSources', data)

const debug = (
  sourceUrl: string,
  searchKey: string,
  onReceive: (data: string) => void,
  onFinish: () => void,
) => {
  const url = new URL(
    `${isBookSource ? 'bookSource' : 'rssSource'}Debug`,
    legado_webSocket_entry_point,
  )
  const socket = new WebSocket(url)
  socket.onerror = wsOnError
  socket.onopen = () => {
    socket.send(JSON.stringify({ tag: sourceUrl, key: searchKey }))
  }
  socket.onmessage = event => {
    onReceive(event.data)
    wsOnMessage?.call(socket, event)
  }
  socket.onclose = () => {
    onFinish()
  }
}

const getProxyCoverUrl = (coverUrl: string) => {
  if (coverUrl.startsWith(legado_http_entry_point)) return coverUrl
  return new URL(
    'cover?path=' + encodeURIComponent(coverUrl),
    legado_http_entry_point,
  ).toString()
}
const getProxyImageUrl = (
  bookUrl: string,
  src: string,
  width: number | `${number}`,
) => {
  if (src.startsWith(legado_http_entry_point)) return src
  return new URL(
    'image?path=' +
      encodeURIComponent(src) +
      '&url=' +
      encodeURIComponent(bookUrl) +
      '&width=' +
      width,
    legado_http_entry_point,
  ).toString()
}

// ==================== 设置管理 API（阶段7）====================

const getAppSettings = () =>
  ajax.get<LeagdoApiResponse<Record<string, unknown>>>('getAppSettings')
const saveAppSettings = (settings: Record<string, unknown>) =>
  ajax.post<LeagdoApiResponse<string>>('saveAppSettings', settings)
const getReadSettings = () =>
  ajax.get<LeagdoApiResponse<Record<string, unknown>>>('getReadSettings')
const saveReadSettings = (settings: Record<string, unknown>) =>
  ajax.post<LeagdoApiResponse<string>>('saveReadSettings', settings)
const getThemeSettings = () =>
  ajax.get<LeagdoApiResponse<Record<string, unknown>>>('getThemeSettings')
const saveThemeSettings = (settings: Record<string, unknown>) =>
  ajax.post<LeagdoApiResponse<string>>('saveThemeSettings', settings)
const getAllSettings = () =>
  ajax.get<
    LeagdoApiResponse<{
      app: Record<string, unknown>
      read: Record<string, unknown>
      theme: Record<string, unknown>
      defaults: Record<string, unknown>
    }>
  >('getAllSettings')
const saveAllSettings = (settings: {
  app?: Record<string, unknown>
  read?: Record<string, unknown>
  theme?: Record<string, unknown>
}) => ajax.post<LeagdoApiResponse<string>>('saveAllSettings', settings)
const resetAppSettings = () =>
  ajax.post<LeagdoApiResponse<string>>('resetAppSettings')
const resetReadSettings = () =>
  ajax.post<LeagdoApiResponse<string>>('resetReadSettings')
const resetThemeSettings = () =>
  ajax.post<LeagdoApiResponse<string>>('resetThemeSettings')
const resetAllSettings = () =>
  ajax.post<LeagdoApiResponse<string>>('resetAllSettings')

// ==================== 单项设置操作 API（v2.0）====================

const getSetting = (key: string, category = 'app', defaultValue?: string) =>
  ajax.get<LeagdoApiResponse<unknown>>('getSetting', {
    params: { key, category, default: defaultValue },
  })
const saveSetting = (key: string, value: unknown, category = 'app') =>
  ajax.post<LeagdoApiResponse<string>>(
    'saveSetting',
    typeof value === 'string' ? value : JSON.stringify(value),
    { params: { key, category }, headers: { 'Content-Type': 'text/plain' } },
  )
const deleteSetting = (key: string, category = 'app') =>
  ajax.post<LeagdoApiResponse<string>>('deleteSetting', null, {
    params: { key, category },
  })

// ==================== 书籍分组 API（阶段八）====================

/** 获取全部分组 */
const getBookGroups = () =>
  ajax.get<LeagdoApiResponse<Record<string, unknown>[]>>('getBookGroups')
/** 保存分组 */
const saveBookGroup = (data: Record<string, unknown>) =>
  ajax.post<LeagdoApiResponse<number>>('saveBookGroup', data)
/** 批量保存分组 */
const saveBookGroups = (data: Record<string, unknown>[]) =>
  ajax.post<LeagdoApiResponse<number[]>>('saveBookGroups', data)
/** 删除分组 */
const deleteBookGroup = (data: { id: number }) =>
  ajax.post<LeagdoApiResponse<string>>('deleteBookGroup', data)
/** 更新分组顺序 */
const updateBookGroupOrder = (orders: number[]) =>
  ajax.post<LeagdoApiResponse<string>>('updateBookGroupOrder', { orders })
/** 更新书籍所属分组 */
const updateBookGroup = (bookUrls: string[], groupId: number) =>
  ajax.post<LeagdoApiResponse<string>>('updateBookGroup', { bookUrls, groupId })

// ==================== 排版配置 API（阶段八）====================

/** 获取排版方案列表 */
const getReadConfigs = () =>
  ajax.get<LeagdoApiResponse<Record<string, unknown>[]>>('getReadConfigs')
/** 保存排版方案 */
const saveReadConfigItem = (data: Record<string, unknown>) =>
  ajax.post<LeagdoApiResponse<number>>('saveReadConfig', data)
/** 删除排版方案 */
const deleteReadConfig = (index: number) =>
  ajax.post<LeagdoApiResponse<boolean>>('deleteReadConfig', { index })
/** 获取共享排版配置 */
const getShareReadConfig = () =>
  ajax.get<LeagdoApiResponse<Record<string, unknown>>>('getShareReadConfig')
/** 保存共享排版配置 */
const saveShareReadConfig = (data: Record<string, unknown>) =>
  ajax.post<LeagdoApiResponse<number>>('saveShareReadConfig', data)
/** 设置当前排版方案 */
const setReadStyleSelect = (index: number, isComic: boolean) =>
  ajax.post<LeagdoApiResponse<string>>('setReadStyleSelect', { index, isComic })

// ==================== 本地书籍导入 API（阶段八）====================

/** 导入本地书籍（multipart 方式） */
const addLocalBook = (file: File, bookName?: string, author?: string, groupId?: number) => {
  const formData = new FormData()
  formData.append('file', file)
  if (bookName) formData.append('bookName', bookName)
  if (author) formData.append('author', author)
  if (groupId) formData.append('groupId', String(groupId))
  return ajax.post<LeagdoApiResponse<Record<string, unknown>>>('addLocalBook', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
/** 导入本地书籍（Base64 JSON 方式） */
const addLocalBookJson = (data: {
  fileName: string
  base64: string
  bookName?: string
  author?: string
  groupId?: number
}) => ajax.post<LeagdoApiResponse<Record<string, unknown>>>('addLocalBookJson', data)

// ==================== RSS 文章 API（阶段八）====================

/** 获取 RSS 源文章列表 */
const getRssArticles = (url: string, page = 1) =>
  ajax.get<LeagdoApiResponse<Record<string, unknown>[]>>('getRssArticles', {
    params: { url, page },
  })
/** 获取 RSS 文章内容 */
const getRssArticle = (url: string, sourceUrl?: string) =>
  ajax.get<LeagdoApiResponse<string>>('getRssArticle', { params: { url, sourceUrl } })

// ==================== 备份恢复 API（阶段八）====================

/** 创建备份（返回 zip blob） */
const backup = (data: {
  includeBooks?: boolean
  includeSources?: boolean
  includeConfigs?: boolean
}) => ajax.post('backup', data, { responseType: 'blob' })
/** 恢复备份（上传 zip） */
const restore = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return ajax.post<
    LeagdoApiResponse<{ books: number; sources: number; configs: number }>
  >('restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
/** 导出书源 */
const exportBookSources = () =>
  ajax.get('exportBookSources', { responseType: 'blob' })
/** 导入书源 */
const importBookSources = (data: Record<string, unknown>[]) =>
  ajax.post<LeagdoApiResponse<number>>('importBookSources', data)

// ==================== 缓存管理 API（阶段八）====================

/** 清除全部缓存 */
const clearCache = () =>
  ajax.post<LeagdoApiResponse<{ cleared: boolean; size: number }>>('clearCache')
/** 清除书籍缓存 */
const clearBookCache = (bookUrl: string) =>
  ajax.post<LeagdoApiResponse<string>>('clearBookCache', { bookUrl })
/** 清除内容缓存 */
const clearContentCache = () =>
  ajax.post<LeagdoApiResponse<{ size: number }>>('clearContentCache')
/** 获取缓存大小 */
const getCacheSize = () =>
  ajax.get<
    LeagdoApiResponse<{
      totalSize: number
      chapterCount: number
      bookCount: number
      sourceCount: number
    }>
  >('getCacheSize')

// ==================== 书籍批量操作 API（阶段八）====================

/** 批量保存书籍进度 */
const saveBookProgressBatch = (progressList: Record<string, unknown>[]) =>
  ajax.post<LeagdoApiResponse<string>>('saveBookProgressBatch', progressList)
/** 检查书籍更新 */
const checkBookUpdate = (url: string) =>
  ajax.get<
    LeagdoApiResponse<{ hasUpdate: boolean; latestChapter: string | null }>
  >('checkBookUpdate', { params: { url } })
/** 批量检查更新 */
const checkBookUpdateBatch = (urls: string[]) =>
  ajax.post<
    LeagdoApiResponse<
      { url: string; hasUpdate: boolean; latestChapter: string | null }[]
    >
  >('checkBookUpdateBatch', { urls })
/** 下载章节内容到缓存 */
const downloadContent = (url: string, start = 0, end = 100) =>
  ajax.get<LeagdoApiResponse<{ downloaded: number }>>('downloadContent', {
    params: { url, start, end },
  })
/** 批量保存书籍 */
const saveBookBatch = (books: Record<string, unknown>[]) =>
  ajax.post<LeagdoApiResponse<string>>('saveBookBatch', books)

// ==================== 搜索历史 API（阶段八）====================

/** 获取搜索历史 */
const getSearchHistory = () =>
  ajax.get<LeagdoApiResponse<{ word: string; time: number }[]>>('getSearchHistory')
/** 保存搜索历史 */
const saveSearchHistory = (word: string) =>
  ajax.post<LeagdoApiResponse<string>>('saveSearchHistory', { word })
/** 清除搜索历史 */
const clearSearchHistory = () =>
  ajax.post<LeagdoApiResponse<string>>('clearSearchHistory')

// ==================== WebDAV 同步 API（v3.3 新增）====================

/** 检查 WebDAV 连接 */
const webDavCheck = () =>
  ajax.get<LeagdoApiResponse<{ success: boolean; message: string }>>('webDavCheck')
/** 上传备份到 WebDAV */
const webDavBackup = () =>
  ajax.post<
    LeagdoApiResponse<{ success: boolean; message: string; size: number }>
  >('webDavBackup')
/** 从 WebDAV 恢复备份 */
const webDavRestore = () =>
  ajax.post<
    LeagdoApiResponse<{ books: number; sources: number; configs: number }>
  >('webDavRestore')

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
}
