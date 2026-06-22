<template>
  <div class="editor">
    <source-tab-form class="left" :config="config" />
    <tool-bar />
    <source-tab-tools class="right" />
  </div>
</template>
<script setup lang="ts">
import bookSourceConfig from '@/config/bookSourceEditConfig'
import rssSourceConfig from '@/config/rssSourceEditConfig'
import '@/assets/sourceeditor.css'
import { useDark } from '@vueuse/core'
import type { SourceConfig } from '@/config/sourceConfig'

useDark()

/** 当前路由，用于响应式判断源类型 */
const route = useRoute()
const isBookSource = ref<boolean>(/bookSource/i.test(route.path))
provide('isBookSource', isBookSource)

/** 当前编辑器配置，随源类型切换 */
const config = ref<SourceConfig>(
  isBookSource.value
    ? (bookSourceConfig as SourceConfig)
    : (rssSourceConfig as SourceConfig),
)

/** 源类型变化时同步更新配置与标题 */
watch(
  isBookSource,
  val => {
    config.value = val
      ? (bookSourceConfig as SourceConfig)
      : (rssSourceConfig as SourceConfig)
    document.title = val ? '书源管理' : '订阅源管理'
  },
  { immediate: true },
)
</script>
<style lang="scss" scoped>
.editor {
  display: flex;
  height: 100vh;
  overflow: hidden;
  .left {
    flex: 1;
    margin-left: 20px;
  }
  .right {
    flex: 1;
    width: 360px;
    margin-right: 20px;
  }
}
</style>
