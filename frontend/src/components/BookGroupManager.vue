/**
 * 书籍分组管理组件
 *
 * 提供分组的增删改查界面，配合 bookGroupStore 使用。
 *
 * 创建日期: 2026-06-16
 * 修改历史:
 * 2026-06-16 02:10 nmb - 阶段八新增
 */
<template>
  <el-dialog v-model="visible" title="分组管理" width="600px" @open="onOpen">
    <div v-loading="store.loading">
      <el-table :data="store.groups" border style="width: 100%">
        <el-table-column prop="groupName" label="分组名称" min-width="120" />
        <el-table-column prop="order" label="排序" width="80" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="editGroup(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button class="mt-12" type="primary" plain @click="addGroup">新增分组</el-button>
    </div>

    <!-- 分组编辑对话框 -->
    <el-dialog v-model="editVisible" title="编辑分组" width="400px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.groupName" placeholder="分组名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.order" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="store.saving" @click="saveGroup">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useBookGroupStore } from '@/store/bookGroupStore'
import type { BookGroup } from '@/store/bookGroupStore'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

const visible = ref(props.modelValue)
const store = useBookGroupStore()
const editVisible = ref(false)

const editForm = reactive<{ groupId?: number; groupName: string; order: number }>({
  groupName: '',
  order: 0,
})

/** 对话框打开时加载分组 */
const onOpen = async () => {
  await store.loadGroups()
}

/** 新增分组 */
const addGroup = () => {
  editForm.groupId = undefined
  editForm.groupName = ''
  editForm.order = store.groups.length
  editVisible.value = true
}

/** 编辑分组 */
const editGroup = (row: BookGroup) => {
  editForm.groupId = row.groupId
  editForm.groupName = row.groupName
  editForm.order = row.order
  editVisible.value = true
}

/** 确认删除 */
const confirmDelete = (row: BookGroup) => {
  ElMessageBox.confirm(
    `确定删除分组「${row.groupName}」吗？`,
    '警告',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
  ).then(async () => {
    await store.removeGroup(row.groupId)
  }).catch(() => {})
}

/** 保存分组 */
const saveGroup = async () => {
  if (!editForm.groupName.trim()) {
    ElMessage.warning('分组名称不能为空')
    return
  }
  await store.saveGroup({
    groupId: editForm.groupId,
    groupName: editForm.groupName,
    order: editForm.order,
  })
  editVisible.value = false
}
</script>

<style scoped>
.mt-12 { margin-top: 12px; }
</style>