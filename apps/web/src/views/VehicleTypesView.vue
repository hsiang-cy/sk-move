<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Tag } from 'lucide-vue-next'
import { useVehicleTypesStore } from '@/stores/vehicleTypes'
import VehicleTypeModal from '@/components/vehicle-types/VehicleTypeModal.vue'
import type { VehicleType } from '@/types'

const store = useVehicleTypesStore()

const showModal = ref(false)
const editingType = ref<VehicleType | null>(null)
const showDeleteDialog = ref(false)
const deletingType = ref<VehicleType | null>(null)
const isDeleting = ref(false)
const deleteDialogRef = ref<HTMLDialogElement | null>(null)

onMounted(() => {
  store.fetchAll()
})

function openCreate() {
  editingType.value = null
  showModal.value = true
}

function openEdit(t: VehicleType) {
  editingType.value = t
  showModal.value = true
}

function confirmDelete(t: VehicleType) {
  deletingType.value = t
  deleteDialogRef.value?.showModal()
}

function closeDeleteDialog() {
  deleteDialogRef.value?.close()
}

async function handleDelete() {
  if (!deletingType.value) return
  isDeleting.value = true
  try {
    await store.remove(deletingType.value.id)
    closeDeleteDialog()
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">車輛類型</h1>
        <p class="text-base-content/50 text-sm mt-1">
          定義車輛類別，供地點和車輛設定中使用
        </p>
      </div>
      <button class="btn btn-primary gap-2" @click="openCreate">
        <Plus class="w-4 h-4" />
        新增類型
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center items-center py-16">
      <span class="loading loading-spinner loading-md text-primary" />
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="alert alert-error">
      <span>{{ store.error }}</span>
      <button class="btn btn-sm btn-ghost" @click="store.fetchAll">重試</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.types.length === 0" class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body items-center text-center py-16">
        <div class="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
          <Tag class="w-7 h-7 text-base-content/30" />
        </div>
        <h3 class="font-semibold text-base-content/60">尚無車輛類型</h3>
        <p class="text-sm text-base-content/40 max-w-xs mt-1">
          建立車輛類型後，可在地點設定中指定可接受的車型，在車輛設定中指定車輛的類別
        </p>
        <button class="btn btn-primary btn-sm mt-4 gap-2" @click="openCreate">
          <Plus class="w-3.5 h-3.5" />
          建立第一個類型
        </button>
      </div>
    </div>

    <!-- Grid of type cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="t in store.types"
        :key="t.id"
        class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md hover:border-base-300 transition-all"
      >
        <div class="card-body p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center shrink-0">
                <Tag class="w-4 h-4 text-base-content/40" />
              </div>
              <span class="font-medium text-sm leading-tight">{{ t.name }}</span>
            </div>
            <div class="flex gap-0.5 shrink-0">
              <button
                class="btn btn-ghost btn-xs tooltip"
                data-tip="編輯"
                @click="openEdit(t)"
              >
                <Pencil class="w-3 h-3" />
              </button>
              <button
                class="btn btn-ghost btn-xs text-error/50 hover:text-error tooltip"
                data-tip="刪除"
                @click="confirmDelete(t)"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Count -->
    <p
      v-if="store.types.length > 0"
      class="mt-3 text-xs text-base-content/40 px-1"
    >
      共 {{ store.types.length }} 種車輛類型
    </p>

    <!-- Modal -->
    <VehicleTypeModal
      :open="showModal"
      :edit-data="editingType"
      @update:open="showModal = $event"
      @saved="store.fetchAll()"
    />

    <!-- Delete Confirm Dialog -->
    <dialog ref="deleteDialogRef" class="modal" @close="showDeleteDialog = false">
      <div class="modal-box max-w-sm">
        <h3 class="font-semibold text-base mb-2">確認刪除</h3>
        <p class="text-sm text-base-content/70">
          確定要刪除車輛類型「<strong>{{ deletingType?.name }}</strong>」嗎？<br />
          <span class="text-warning text-xs">注意：刪除後，使用此類型的地點和車輛設定可能受到影響。</span>
        </p>
        <div class="modal-action mt-5 pt-4 border-t border-base-200">
          <button class="btn btn-ghost btn-sm" @click="closeDeleteDialog">取消</button>
          <button
            class="btn btn-error btn-sm"
            :disabled="isDeleting"
            @click="handleDelete"
          >
            <span v-if="isDeleting" class="loading loading-spinner loading-xs" />
            確認刪除
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>關閉</button>
      </form>
    </dialog>
  </div>
</template>
