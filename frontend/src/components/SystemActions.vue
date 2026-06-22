/**
 * 系统操作合集组件 - 缓存/备份/导入/搜索历史
 *
 * 在 Settings.vue 系统标签页内挂载，提供阶段八全部"操作类"功能入口：
 * - 缓存管理：显示大小、一键清除（全部/内容/单本）
 * - 数据备份：下载备份zip、上传恢复、导出/导入书源
 * - 本地导入：上传TXT文件导入书架
 * - 搜索历史：列表展示、清除
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 06:25 codewhale - 阶段八补全新增
 */
<template>
  <div class="system-actions">
    <!-- ==================== 缓存管理 ==================== -->
    <el-divider content-position="left">缓存管理</el-divider>
    <div class="action-block" v-loading="cache.loading">
      <el-descriptions :column="2" border size="small" class="cache-info">
        <el-descriptions-item label="缓存总大小">
          {{ cache.formattedTotalSize() }}
        </el-descriptions-item>
        <el-descriptions-item label="缓存章节数">
          {{ cache.cacheSize.chapterCount }}
        </el-descriptions-item>
        <el-descriptions-item label="书籍总数">
          {{ cache.cacheSize.bookCount }}
        </el-descriptions-item>
        <el-descriptions-item label="书源总数">
          {{ cache.cacheSize.sourceCount }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="action-buttons">
        <el-button @click="cache.loadCacheSize()" :icon="Refresh">刷新</el-button>
        <el-button
          type="warning"
          @click="handleClearContent"
          :loading="cache.clearing"
        >清除内容缓存</el-button>
        <el-button
          type="danger"
          @click="handleClearAll"
          :loading="cache.clearing"
        >清除全部缓存</el-button>
      </div>
    </div>

    <!-- ==================== 数据备份与恢复 ==================== -->
    <el-divider content-position="left">数据备份与恢复</el-divider>
    <div class="action-block">
      <el-form label-width="160px">
        <el-form-item label="备份内容">
          <el-checkbox v-model="backupOpts.includeBooks">书籍数据</el-checkbox>
          <el-checkbox v-model="backupOpts.includeSources">书源/RSS源</el-checkbox>
          <el-checkbox v-model="backupOpts.includeConfigs">配置文件</el-checkbox>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button
          type="primary"
          @click="handleBackup"
          :loading="backup.backingUp"
        >创建备份并下载</el-button>
        <el-upload
          :show-file-list="false"
          :before-upload="handleRestore"
          accept=".zip"
        >
          <el-button type="success" :loading="backup.restoring">
            上传备份恢复
          </el-button>
        </el-upload>
      </div>

      <el-divider content-position="left">书源导入导出</el-divider>
      <div class="action-buttons">
        <el-button @click="backup.exportSources()">导出全部书源</el-button>
        <el-upload
          :show-file-list="false"
          :before-upload="handleImportSources"
          accept=".json"
        >
          <el-button>从JSON文件导入书源</el-button>
        </el-upload>
      </div>
    </div>

    <!-- ==================== 本地书籍导入 ==================== -->
    <el-divider content-position="left">本地书籍导入</el-divider>
    <div class="action-block">
      <el-form label-width="160px">
        <el-form-item label="书名（可选）">
          <el-input
            v-model="importForm.bookName"
            placeholder="留空则使用文件名"
            style="max-width: 300px"
          />
        </el-form-item>
        <el-form-item label="作者（可选）">
          <el-input
            v-model="importForm.author"
            placeholder="留空则为未知"
            style="max-width: 300px"
          />
        </el-form-item>
        <el-form-item label="目标分组（可选）">
          <el-select
            v-model="importForm.groupId"
            placeholder="不选择分组"
            clearable
            style="max-width: 300px"
          >
            <el-option
              v-for="g in groups"
              :key="g.groupId"
              :label="g.groupName"
              :value="g.groupId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-upload
          :show-file-list="false"
          :before-upload="handleLocalImport"
          accept=".txt"
        >
          <el-button type="primary" :loading="importing">
            选择TXT文件导入
          </el-button>
        </el-upload>
        <span class="form-tip">支持 TXT 格式，自动检测编码与切分章节</span>
      </div>
    </div>

    <!-- ==================== 搜索历史 ==================== -->
    <el-divider content-position="left">搜索历史</el-divider>
    <div class="action-block" v-loading="historyLoading">
      <div v-if="history.length === 0" class="empty-tip">暂无搜索历史</div>
      <div v-else class="history-tags">
        <el-tag
          v-for="(item, idx) in history"
          :key="idx"
          class="history-tag"
          closable
          @close="handleRemoveHistory(idx)"
        >
          {{ item.word }}
        </el-tag>
      </div>
      <div class="action-buttons">
        <el-button @click="loadHistory" :icon="Refresh">刷新</el-button>
        <el-button
          type="danger"
          plain
          @click="handleClearHistory"
          :disabled="history.length === 0"
        >清除全部历史</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 系统操作合集组件逻辑
 *
 * 数据层：
 * - 缓存管理 → useCacheStore
 * - 备份恢复 → useBackupStore
 * - 本地导入 → 直接调用 API.addLocalBook
 * - 搜索历史 → 直接调用 API.getSearchHistory/saveSearchHistory/clearSearchHistory
 * - 分组列表 → useBookGroupStore（供导入时选择目标分组）
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import API from '@api'
import { useCacheStore, useBackupStore, useBookGroupStore } from '@/store'

const cache = useCacheStore()
const backup = useBackupStore()
const groupStore = useBookGroupStore()

/** 分组列表（供本地导入选择） */
const groups = groupStore.groups

// ==================== 备份选项 ====================
const backupOpts = reactive({
  includeBooks: true,
  includeSources: true,
  includeConfigs: true,
})

/** 创建备份 */
const handleBackup = () => {
  backup.createBackup({ ...backupOpts })
}

/** 上传 zip 恢复（el-upload before-upload 钩子，返回 false 阻止默认上传） */
const handleRestore = async (file: File): Promise<boolean> => {
  try {
    await ElMessageBox.confirm(
      '恢复将覆盖现有数据，确定继续吗？',
      '恢复确认',
      { type: 'warning', confirmButtonText: '确定恢复', cancelButtonText: '取消' },
    )
  } catch {
    return false
  }
  await backup.restoreBackup(file)
  return false
}

/** 从 JSON 文件导入书源 */
const handleImportSources = async (file: File): Promise<boolean> => {
  await backup.importSourcesFromFile(file)
  return false
}

// ==================== 缓存清理 ====================

/** 清除内容缓存（带确认） */
const handleClearContent = async () => {
  try {
    await ElMessageBox.confirm('确定清除全部内容缓存吗？', '提示', {
      type: 'warning',
    })
  } catch {
    return
  }
  await cache.clearContentOnly()
}

/** 清除全部缓存（带确认） */
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定清除全部缓存吗？此操作不可撤销。',
      '警告',
      { type: 'warning', confirmButtonText: '确定清除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  await cache.clearAllCache()
}

// ==================== 本地书籍导入 ====================

const importing = ref(false)
const importForm = reactive({
  bookName: '',
  author: '',
  groupId: undefined as number | undefined,
})

/** 导入本地 TXT 文件（el-upload before-upload 钩子） */
const handleLocalImport = async (file: File): Promise<boolean> => {
  importing.value = true
  try {
    const { data } = await API.addLocalBook(
      file,
      importForm.bookName || undefined,
      importForm.author || undefined,
      importForm.groupId,
    )
    if (data.isSuccess && data.data) {
      const bookName = (data.data as Record<string, unknown>).name as string
      ElMessage.success(`本地书籍《${bookName}》导入成功`)
      // 重置表单
      importForm.bookName = ''
      importForm.author = ''
      importForm.groupId = undefined
    } else {
      ElMessage.error(data.errorMsg || '导入失败')
    }
  } catch (e) {
    ElMessage.error('导入失败: ' + (e as Error).message)
  } finally {
    importing.value = false
  }
  return false
}

// ==================== 搜索历史 ====================

interface HistoryItem {
  word: string
  time: number
}

const history = ref<HistoryItem[]>([])
const historyLoading = ref(false)

/** 加载搜索历史 */
const loadHistory = async () => {
  historyLoading.value = true
  try {
    const { data } = await API.getSearchHistory()
    if (data.isSuccess && data.data) {
      history.value = data.data as HistoryItem[]
    }
  } catch (e) {
    ElMessage.error('加载搜索历史失败: ' + (e as Error).message)
  } finally {
    historyLoading.value = false
  }
}

/** 清除全部搜索历史 */
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定清除全部搜索历史吗？', '提示', {
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    const { data } = await API.clearSearchHistory()
    if (data.isSuccess) {
      ElMessage.success('搜索历史已清除')
      history.value = []
    }
  } catch (e) {
    ElMessage.error('清除搜索历史失败: ' + (e as Error).message)
  }
}

/** 删除单条搜索历史（前端移除，后端暂无单条删除API） */
const handleRemoveHistory = (idx: number) => {
  history.value.splice(idx, 1)
}

// ==================== 初始化 ====================
onMounted(async () => {
  await Promise.all([
    cache.loadCacheSize(),
    loadHistory(),
    groupStore.loadGroups(),
  ])
})
</script>

<style lang="scss" scoped>
.system-actions {
  .action-block {
    margin-bottom: 8px;
  }
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin: 12px 0;
  }
  .cache-info {
    margin-bottom: 12px;
    max-width: 500px;
  }
  .form-tip {
    margin-left: 12px;
    color: #909399;
    font-size: 12px;
  }
  .empty-tip {
    color: #909399;
    font-size: 14px;
    margin: 8px 0;
  }
  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 8px 0;
    .history-tag {
      cursor: default;
    }
  }
}
</style>
