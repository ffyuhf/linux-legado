/**
 * RSS 文章浏览组件 - 阶段八补全
 *
 * 提供订阅源文章列表浏览与单篇正文阅读功能。
 * - 左侧：RSS 源选择 + 文章列表（调用 API.getRssArticles）
 * - 右侧：选中文章的正文内容（调用 API.getRssArticle）
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 06:35 codewhale - 阶段八补全新增
 */
<template>
  <el-dialog
    v-model="visible"
    title="订阅文章"
    width="900px"
    top="5vh"
    @open="onOpen"
  >
    <div class="rss-container">
      <!-- 左侧：源选择 + 文章列表 -->
      <div class="rss-left">
        <el-select
          v-model="currentSourceUrl"
          placeholder="选择订阅源"
          filterable
          class="source-select"
          @change="loadArticles"
        >
          <el-option
            v-for="s in rssSources"
            :key="s.sourceUrl"
            :label="s.sourceName"
            :value="s.sourceUrl"
          />
        </el-select>

        <div class="article-list" v-loading="listLoading">
          <div v-if="articles.length === 0" class="empty-tip">
            {{ currentSourceUrl ? '暂无文章' : '请选择订阅源' }}
          </div>
          <div
            v-for="(item, idx) in articles"
            :key="idx"
            class="article-item"
            :class="{ active: selectedIndex === idx }"
            @click="selectArticle(idx)"
          >
            <div class="article-title">{{ item.title || '无标题' }}</div>
            <div class="article-meta">
              <span v-if="item.pubDate">{{ formatTime(item.pubDate) }}</span>
              <span v-if="item.origin" class="article-origin">{{ item.origin }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：文章正文 -->
      <div class="rss-right">
        <div v-if="!content" class="empty-tip">请选择一篇文章阅读</div>
        <div v-else class="article-content" v-loading="contentLoading">
          <h3 class="content-title">{{ currentTitle }}</h3>
          <div v-html="content"></div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * RSS 文章浏览组件逻辑
 *
 * 数据流：
 * 1. 打开时从 useSourceStore 加载 rssSources 列表
 * 2. 选择源后调用 API.getRssArticles 获取文章列表
 * 3. 点击文章调用 API.getRssArticle 获取正文 HTML
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import API from '@api'
import { useSourceStore } from '@/store'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const sourceStore = useSourceStore()
/** 订阅源列表（从 sourceStore 获取） */
const rssSources = computed(() => sourceStore.rssSources as Array<{
  sourceUrl: string
  sourceName: string
}>)

// ==================== 文章列表 ====================

const currentSourceUrl = ref('')
const articles = ref<Array<Record<string, any>>>([])
const listLoading = ref(false)
const selectedIndex = ref(-1)

/** 加载选中源的文章列表 */
const loadArticles = async () => {
  if (!currentSourceUrl.value) return
  listLoading.value = true
  articles.value = []
  selectedIndex.value = -1
  content.value = ''
  try {
    const { data } = await API.getRssArticles(currentSourceUrl.value)
    if (data.isSuccess && data.data) {
      articles.value = data.data as Array<Record<string, any>>
    } else {
      ElMessage.error(data.errorMsg || '获取文章列表失败')
    }
  } catch (e) {
    ElMessage.error('获取文章列表失败: ' + (e as Error).message)
  } finally {
    listLoading.value = false
  }
}

// ==================== 文章正文 ====================

const currentTitle = ref('')
const content = ref('')
const contentLoading = ref(false)

/** 选择文章并加载正文 */
const selectArticle = async (idx: number) => {
  selectedIndex.value = idx
  const article = articles.value[idx]
  currentTitle.value = article.title || '无标题'
  content.value = ''
  contentLoading.value = true
  try {
    const { data } = await API.getRssArticle(
      article.link || '',
      currentSourceUrl.value,
    )
    if (data.isSuccess) {
      content.value = data.data as string
    } else {
      content.value = `<p>${data.errorMsg || '获取正文失败'}</p>`
    }
  } catch (e) {
    content.value = `<p>获取正文失败: ${(e as Error).message}</p>`
  } finally {
    contentLoading.value = false
  }
}

// ==================== 工具 ====================

/** 格式化时间（兼容多种日期格式） */
const formatTime = (raw: string): string => {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 对话框打开时加载源列表 */
const onOpen = async () => {
  if (rssSources.value.length === 0) {
    try {
      const { data } = await API.getSources()
      if (data.isSuccess && data.data) {
        sourceStore.saveSources(data.data)
      }
    } catch (e) {
      ElMessage.error('加载订阅源失败: ' + (e as Error).message)
    }
  }
}
</script>

<style lang="scss" scoped>
.rss-container {
  display: flex;
  gap: 16px;
  height: 70vh;

  .rss-left {
    width: 320px;
    min-width: 320px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
    padding-right: 16px;

    .source-select {
      margin-bottom: 12px;
    }

    .article-list {
      flex: 1;
      overflow-y: auto;

      .article-item {
        padding: 10px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f5f7fa;
        }
        &.active {
          background-color: #ecf5ff;
        }

        .article-title {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .article-meta {
          font-size: 12px;
          color: #909399;
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .rss-right {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;

    .article-content {
      .content-title {
        margin: 0 0 16px 0;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;
      }
      :deep(img) {
        max-width: 100%;
        height: auto;
      }
      :deep(p) {
        line-height: 1.8;
        margin: 12px 0;
      }
    }
  }

  .empty-tip {
    color: #909399;
    text-align: center;
    padding: 40px 0;
    font-size: 14px;
  }
}
</style>
