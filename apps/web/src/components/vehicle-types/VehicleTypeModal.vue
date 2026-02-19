<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useVehicleTypesStore } from '@/stores/vehicleTypes'
import type { VehicleType } from '@/types'

interface Props {
  open: boolean
  editData?: VehicleType | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const store = useVehicleTypesStore()
const dialogRef = ref<HTMLDialogElement | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const name = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      submitError.value = null
      name.value = props.editData?.name ?? ''
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
)

function close() {
  emit('update:open', false)
}

async function handleSubmit() {
  if (!name.value.trim()) return

  isSubmitting.value = true
  submitError.value = null

  try {
    if (props.editData) {
      await store.update(props.editData.id, { name: name.value.trim() })
    } else {
      await store.create({ name: name.value.trim() })
    }
    emit('saved')
    close()
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : '儲存失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <dialog ref="dialogRef" class="modal" @close="close">
    <div class="modal-box max-w-sm">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-lg">{{ editData ? '編輯車輛類型' : '新增車輛類型' }}</h3>
        <button class="btn btn-ghost btn-sm btn-circle" @click="close">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">
              類型名稱 <span class="text-error">*</span>
            </span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="例：小貨車、大貨車、福祉車"
            class="input input-bordered w-full"
            required
            autofocus
          />
        </div>

        <div v-if="submitError" class="alert alert-error py-2.5 text-sm">
          <span>{{ submitError }}</span>
        </div>

        <div class="modal-action mt-2 pt-2 border-t border-base-200">
          <button type="button" class="btn btn-ghost" @click="close">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs" />
            {{ editData ? '更新' : '新增' }}
          </button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>關閉</button>
    </form>
  </dialog>
</template>
