<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-vue-next'
import { useLocationsStore } from '@/stores/locations'
import { useVehicleTypesStore } from '@/stores/vehicleTypes'
import LocationFormModal from '@/components/locations/LocationFormModal.vue'
import { formatTimeWindow, formatLimit } from '@/lib/utils'
import type { Location } from '@/types'

const locationsStore = useLocationsStore()
const vehicleTypesStore = useVehicleTypesStore()

const showModal = ref(false)
const editingLocation = ref<Location | null>(null)
const showDeleteDialog = ref(false)
const deletingLocation = ref<Location | null>(null)
const isDeleting = ref(false)
const deleteDialogRef = ref<HTMLDialogElement | null>(null)

onMounted(() => {
  locationsStore.fetchAll()
  if (vehicleTypesStore.types.length === 0) {
    vehicleTypesStore.fetchAll()
  }
})

function openCreate() {
  editingLocation.value = null
  showModal.value = true
}

function openEdit(loc: Location) {
  editingLocation.value = loc
  showModal.value = true
}

function confirmDelete(loc: Location) {
  deletingLocation.value = loc
  showDeleteDialog.value = true
  deleteDialogRef.value?.showModal()
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
  deleteDialogRef.value?.close()
}

async function handleDelete() {
  if (!deletingLocation.value) return
  isDeleting.value = true
  try {
    await locationsStore.remove(deletingLocation.value.id)
    closeDeleteDialog()
  } finally {
    isDeleting.value = false
  }
}

function getTypeName(id: string): string {
  return vehicleTypesStore.getById(id)?.name ?? id
}

function handleSaved() {
  locationsStore.fetchAll()
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">地點管理</h1>
        <p class="text-base-content/50 text-sm mt-1">新增與管理所有配送地點</p>
      </div>
      <button class="btn btn-primary gap-2" @click="openCreate">
        <Plus class="w-4 h-4" />
        新增地點
      </button>
    </div>

    <!-- Loading -->
    <div v-if="locationsStore.loading" class="flex justify-center items-center py-16">
      <span class="loading loading-spinner loading-md text-primary" />
    </div>

    <!-- Error -->
    <div v-else-if="locationsStore.error" class="alert alert-error">
      <span>{{ locationsStore.error }}</span>
      <button class="btn btn-sm btn-ghost" @click="locationsStore.fetchAll">重試</button>
    </div>

    <!-- Table -->
    <div v-else class="card bg-base-100 shadow-sm border border-base-200">
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="border-b border-base-200 bg-base-50 text-xs text-base-content/60 uppercase tracking-wider">
              <th class="font-semibold">地點名稱</th>
              <th class="font-semibold">地址</th>
              <th class="font-semibold">經緯度</th>
              <th class="font-semibold">可收貨時窗</th>
              <th class="font-semibold">停留時間</th>
              <th class="font-semibold">可接受車型</th>
              <th class="font-semibold">需求量</th>
              <th class="font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty state -->
            <tr v-if="locationsStore.locations.length === 0">
              <td colspan="8">
                <div class="flex flex-col items-center justify-center py-12 text-base-content/40">
                  <MapPin class="w-10 h-10 mb-3 opacity-30" />
                  <p class="font-medium">尚無地點</p>
                  <p class="text-sm mt-1">點擊右上角「新增地點」開始建立</p>
                </div>
              </td>
            </tr>

            <!-- Data rows -->
            <tr
              v-for="loc in locationsStore.locations"
              :key="loc.id"
              class="hover:bg-base-50 border-b border-base-100 last:border-0"
            >
              <td class="font-medium">{{ loc.name }}</td>
              <td class="max-w-48">
                <span class="block truncate text-sm text-base-content/70" :title="loc.address">
                  {{ loc.address }}
                </span>
              </td>
              <td>
                <span class="text-xs text-base-content/50 font-mono">
                  {{ loc.latitude.toFixed(4) }},<br />{{ loc.longitude.toFixed(4) }}
                </span>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <span
                    v-for="(tw, i) in loc.timeWindows"
                    :key="i"
                    class="badge badge-ghost badge-sm text-xs font-normal"
                  >
                    {{ formatTimeWindow(tw) }}
                  </span>
                </div>
              </td>
              <td class="text-sm">{{ loc.dwellTime }} 分</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="typeId in loc.acceptedVehicleTypes"
                    :key="typeId"
                    class="badge badge-outline badge-sm text-xs"
                  >
                    {{ getTypeName(typeId) }}
                  </span>
                </div>
              </td>
              <td class="text-sm font-medium">{{ loc.cargoDemand }}</td>
              <td>
                <div class="flex justify-end gap-1">
                  <button
                    class="btn btn-ghost btn-xs tooltip"
                    data-tip="編輯"
                    @click="openEdit(loc)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-error/60 hover:text-error tooltip"
                    data-tip="刪除"
                    @click="confirmDelete(loc)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer count -->
      <div
        v-if="locationsStore.locations.length > 0"
        class="px-4 py-2.5 border-t border-base-200 text-xs text-base-content/40"
      >
        共 {{ locationsStore.locations.length }} 筆地點
      </div>
    </div>

    <!-- Form Modal -->
    <LocationFormModal
      :open="showModal"
      :edit-data="editingLocation"
      @update:open="showModal = $event"
      @saved="handleSaved"
    />

    <!-- Delete Confirm Dialog -->
    <dialog ref="deleteDialogRef" class="modal" @close="showDeleteDialog = false">
      <div class="modal-box max-w-sm">
        <h3 class="font-semibold text-base mb-2">確認刪除</h3>
        <p class="text-sm text-base-content/70">
          確定要刪除地點「<strong>{{ deletingLocation?.name }}</strong>」嗎？<br />
          此操作無法復原。
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
