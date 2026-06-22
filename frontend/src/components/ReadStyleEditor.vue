/**
 * 排版方案编辑器组件
 *
 * 提供排版方案列表的查看、编辑、删除，以及共享配置的编辑。
 * 对齐 Android ReadBookConfig.Config 的全部字段。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 02:11 nmb - 阶段八新增
 * 2026-06-16 07:01 nmb - v3.2 接入共享排版配置 getShareReadConfig/saveShareReadConfig
 */
<template>
  <el-dialog v-model="visible" title="排版方案管理" width="800px" @open="onOpen">
    <div v-loading="loading">
      <!-- 方案列表 -->
      <el-table :data="configs" border style="width: 100%" max-height="300">
        <el-table-column prop="name" label="方案名称" width="120" />
        <el-table-column label="日间背景" width="100">
          <template #default="{ row }">
            <el-color-picker v-model="row.bgStr" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="夜间背景" width="100">
          <template #default="{ row }">
            <el-color-picker v-model="row.bgStrNight" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="文字颜色" width="100">
          <template #default="{ row }">
            <el-color-picker v-model="row.textColor" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="textSize" label="字号" width="60" />
        <el-table-column label="操作" width="220">
          <template #default="{ row, $index }">
            <el-button size="small" @click="editConfig(row)">编辑</el-button>
            <el-button
              size="small"
              type="success"
              :disabled="isCurrentStyle($index)"
              @click="setAsCurrent($index)"
              title="设为当前排版方案"
            >设为当前</el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="configs.length <= 1"
              @click="deleteConfig($index)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button class="mt-12" type="primary" plain @click="addConfig">新增方案</el-button>

      <!-- 共享排版配置区（v3.2 新增） -->
      <el-divider content-position="left">共享排版配置</el-divider>
      <el-form v-if="shareConfig" label-width="120px" class="share-form">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="正文宽度%">
              <el-input-number v-model="shareConfig.textMaxWidth" :min="30" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="左边距">
              <el-input-number v-model="shareConfig.paddingLeft" :min="0" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="上边距">
              <el-input-number v-model="shareConfig.paddingTop" :min="0" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="顶部边距%">
              <el-input-number v-model="shareConfig.paddingTopPercent" :min="0" :max="50" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="底部边距%">
              <el-input-number v-model="shareConfig.paddingBottom" :min="0" :max="50" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="行距倍数">
              <el-input-number
                v-model="shareConfig.lineSpacingMultiplier"
                :step="0.05"
                :min="0.8"
                :max="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="首行缩进">
              <el-input-number v-model="shareConfig.firstLineIndent" :min="0" :max="200" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="段间距倍数">
              <el-input-number
                v-model="shareConfig.paragraphSpacing"
                :step="0.1"
                :min="0"
                :max="10"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" :loading="shareSaving" @click="saveShareConfig">
            保存共享配置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 方案编辑区 -->
      <el-divider content-position="left">方案详情</el-divider>
      <el-form v-if="currentConfig" label-width="100px" class="config-form">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="方案名称">
              <el-input v-model="currentConfig.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="字号">
              <el-input-number v-model="currentConfig.textSize" :min="12" :max="48" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="行距">
              <el-input-number v-model="currentConfig.lineSpacingExtra" :min="0" :max="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="日间背景">
              <el-color-picker v-model="currentConfig.bgStr" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="夜间背景">
              <el-color-picker v-model="currentConfig.bgStrNight" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="EInk背景">
              <el-color-picker v-model="currentConfig.bgStrEInk" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="日间文字">
              <el-color-picker v-model="currentConfig.textColor" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="夜间文字">
              <el-color-picker v-model="currentConfig.textColorNight" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="EInk文字">
              <el-color-picker v-model="currentConfig.textColorEInk" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="段距">
              <el-input-number v-model="currentConfig.paragraphSpacing" :min="0" :max="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="字间距">
              <el-input-number
                v-model="currentConfig.letterSpacing"
                :step="0.1"
                :min="0"
                :max="2"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="标题模式">
              <el-select v-model="currentConfig.titleMode">
                <el-option :value="0" label="居左" />
                <el-option :value="1" label="居中" />
                <el-option :value="2" label="隐藏" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="saveCurrent">保存方案</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import API from '@api'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

const visible = ref(props.modelValue)
const loading = ref(false)
const saving = ref(false)
const configs = ref<Record<string, any>[]>([])
const currentConfig = ref<Record<string, any> | null>(null)

/** 当前选中的排版方案索引（阶段八补全，用于"设为当前"状态高亮） */
const currentIndex = ref(0)

/** 共享排版配置（v3.2 新增） */
const shareConfig = ref<Record<string, any> | null>(null)
const shareSaving = ref(false)

/** 加载排版方案列表 */
const loadConfigs = async () => {
  loading.value = true
  try {
    const { data } = await API.getReadConfigs()
    if (data.isSuccess && data.data) {
      configs.value = data.data as unknown as Record<string, any>[]
      if (configs.value.length > 0 && !currentConfig.value) {
        currentConfig.value = reactive({ ...configs.value[0] })
      }
    }
  } catch (e) {
    ElMessage.error('加载排版方案失败: ' + (e as Error).message)
  } finally {
    loading.value = false
  }
}

/**
 * 加载共享排版配置（v3.2 新增）
 * 调用 GET /getShareReadConfig 获取跨方案共享的布局参数
 */
const loadShareConfig = async () => {
  try {
    const { data } = await API.getShareReadConfig()
    if (data.isSuccess && data.data) {
      shareConfig.value = reactive({ ...data.data })
    }
  } catch (e) {
    ElMessage.error('加载共享配置失败: ' + (e as Error).message)
  }
}

/** 对话框打开时加载方案列表与共享配置 */
const onOpen = async () => {
  await loadConfigs()
  await loadShareConfig()
}

/** 新增方案 */
const addConfig = () => {
  currentConfig.value = reactive({
    name: '新方案',
    bgStr: '#EEEEEE',
    bgStrNight: '#000000',
    bgStrEInk: '#FFFFFF',
    textColor: '#3E3D3B',
    textColorNight: '#ADADAD',
    textColorEInk: '#000000',
    textSize: 20,
    lineSpacingExtra: 12,
    paragraphSpacing: 2,
    letterSpacing: 0.1,
    titleMode: 0,
  })
}

/** 编辑方案 */
const editConfig = (row: Record<string, any>) => {
  currentConfig.value = reactive({ ...row })
}

/** 删除方案 */
const deleteConfig = async (index: number) => {
  ElMessageBox.confirm('确定删除此排版方案吗？', '警告', {
    type: 'warning',
  }).then(async () => {
    try {
      const { data } = await API.deleteReadConfig(index)
      if (data.isSuccess) {
        ElMessage.success('方案已删除')
        await loadConfigs()
      }
    } catch (e) {
      ElMessage.error('删除失败: ' + (e as Error).message)
    }
  }).catch(() => {})
}

/**
 * 保存当前方案
 */
const saveCurrent = async () => {
  if (!currentConfig.value) return
  saving.value = true
  try {
    const { data } = await API.saveReadConfigItem(currentConfig.value)
    if (data.isSuccess) {
      ElMessage.success('方案已保存')
      await loadConfigs()
    }
  } catch (e) {
    ElMessage.error('保存失败: ' + (e as Error).message)
  } finally {
    saving.value = false
  }
}

/**
 * 保存共享排版配置（v3.2 新增）
 * 调用 POST /saveShareReadConfig 持久化共享布局参数
 */
const saveShareConfig = async () => {
  if (!shareConfig.value) return
  shareSaving.value = true
  try {
    const { data } = await API.saveShareReadConfig(shareConfig.value)
    if (data.isSuccess) {
      ElMessage.success('共享配置已保存')
    } else {
      ElMessage.error(data.errorMsg || '保存共享配置失败')
    }
  } catch (e) {
    ElMessage.error('保存共享配置失败: ' + (e as Error).message)
  } finally {
    shareSaving.value = false
  }
}

/**
 * 设为当前排版方案（阶段八补全）
 *
 * 调用 POST /setReadStyleSelect，后端将 index 写入 readStyleSelect 配置项。
 * index 对应普通方案列表（styleType=0）中的顺序索引。
 *
 * @param index 方案索引
 */
const setAsCurrent = async (index: number) => {
  saving.value = true
  try {
    const { data } = await API.setReadStyleSelect(index, false)
    if (data.isSuccess) {
      ElMessage.success('已设为当前排版方案')
      currentIndex.value = index
      await loadConfigs()
    } else {
      ElMessage.error(data.errorMsg || '设置失败')
    }
  } catch (e) {
    ElMessage.error('设置失败: ' + (e as Error).message)
  } finally {
    saving.value = false
  }
}

/**
 * 判断指定方案是否为当前选中的排版方案
 * @param index 方案索引
 */
const isCurrentStyle = (index: number): boolean => {
  return currentIndex.value === index
}
</script>

<style scoped>
.mt-12 { margin-top: 12px; }
.config-form { margin-top: 12px; }
.share-form { margin-top: 12px; }
</style>