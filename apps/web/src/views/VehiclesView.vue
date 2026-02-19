<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Truck } from 'lucide-vue-next'
import { useVehiclesStore } from '@/stores/vehicles'
import { useVehicleTypesStore } from '@/stores/vehicleTypes'
import VehicleFormModal from '@/components/vehicles/VehicleFormModal.vue'
import { formatLimit } from '@/lib/utils'
import type { Vehicle } from '@/types'

const vehiclesStore = useVehiclesStore()
const vehicleTypesStore = useVehicleTypesStore()

const showModal = ref(false)
const editingVehicle = ref<Vehicle | null>(null)
const showDeleteDialog = ref(false)
const deletingVehicle = ref<Vehicle | null>(null)
const isDeleting = ref(false)
const deleteDialogRef = ref<HTMLDialogElement | null>(null)

onMounted(() => {
  vehiclesStore.fetchAll()
  if (vehicleTypesStore.types.length === 0) {
    vehicleTypesStore.fetchAll()
  }
})

function openCreate() {
  editingVehicle.value = null
  showModal.value = true
}

function openEdit(v: Vehicle) {
  editingVehicle.value = v
  showModal.value = true
}

function confirmDelete(v: Vehicle) {
  deletingVehicle.value = v
  deleteDialogRef.value?.showModal()
}

function closeDeleteDialog() {
  deleteDialogRef.value?.close()
}

async function handleDelete() {
  if (!deletingVehicle.value) return
  isDeleting.value = true
  try {
    await vehiclesStore.remove(deletingVehicle.value.id)
    closeDeleteDialog()
  } finally {
    isDeleting.value = false
  }
}

function getTypeName(id: string): string {
  return vehicleTypesStore.getById(id)?.name ?? id
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">車輛管理</h1>
        <p class="text-base-content/50 text-sm mt-1">新增與管理所有配送車輛</p>
      </div>
      <button class="btn btn-primary gap-2" @click="openCreate">
        <Plus class="w-4 h-4" />
        新增車輛
      </button>
    </div>

    <!-- Loading -->
    <div v-if="vehiclesStore.loading" class="flex justify-center items-center py-16">
      <span class="loading loading-spinner loading-md text-primary" />
    </div>

    <!-- Error -->
    <div v-else-if="vehiclesStore.error" class="alert alert-error">
      <span>{{ vehiclesStore.error }}</span>
      <button class="btn btn-sm btn-ghost" @click="vehiclesStore.fetchAll">重試</button>
    </div>

    <!-- Table -->
    <div v-else class="card bg-base-100 shadow-sm border border-base-200">
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="border-b border-base-200 bg-base-50 text-xs text-base-content/60 uppercase tracking-wider">
              <th class="font-semibold">車輛名稱</th>
              <th class="font-semibold">車牌</th>
              <th class="font-semibold">車輛類型</th>
              <th class="font-semibold">載貨量</th>
              <th class="font-semibold">距離限制</th>
              <th class="font-semibold">工時限制</th>
              <th class="font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty state -->
            <tr v-if="vehiclesStore.vehicles.length === 0">
              <td colspan="7">
                <div class="flex flex-col items-center justify-center py-12 text-base-content/40">
                  <Truck class="w-10 h-10 mb-3 opacity-30" />
                  <p class="font-medium">尚無車輛</p>
                  <p class="text-sm mt-1">點擊右上角「新增車輛」開始建立</p>
                </div>
              </td>
            </tr>

            <!-- Data rows -->
            <tr
              v-for="v in vehiclesStore.vehicles"
              :key="v.id"
              class="hover:bg-base-50 border-b border-base-100 last:border-0"
            >
              <td class="font-medium">{{ v.name }}</td>
              <td>
                <span class="badge badge-ghost badge-sm font-mono text-xs">
                  {{ v.licensePlate }}
                </span>
              </td>
              <td>
                <span class="badge badge-outline badge-sm text-xs">
                  {{ getTypeName(v.vehicleTypeId) }}
                </span>
              </td>
              <td class="text-sm font-medium">{{ v.cargoCapacity }}</td>
              <td class="text-sm">
                <span
                  :class="
                    v.distanceLimit === null
                      ? 'text-base-content/40'
                      : 'text-base-content'
                  "
                >
                  {{ formatLimit(v.distanceLimit, '公里') }}
                </span>
              </td>
              <td class="text-sm">
                <span
                  :class="
                    v.workingHoursLimit === null
                      ? 'text-base-content/40'
                      : 'text-base-content'
                  "
                >
                  {{ formatLimit(v.workingHoursLimit, '小時') }}
                </span>
              </td>
              <td>
                <div class="flex justify-end gap-1">
                  <button
                    class="btn btn-ghost btn-xs tooltip"
                    data-tip="編輯"
                    @click="openEdit(v)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-error/60 hover:text-error tooltip"
                    data-tip="刪除"
                    @click="confirmDelete(v)"
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
        v-if="vehiclesStore.vehicles.length > 0"
        class="px-4 py-2.5 border-t border-base-200 text-xs text-base-content/40"
      >
        共 {{ vehiclesStore.vehicles.length }} 輛車輛
      </div>
    </div>

    <!-- Form Modal -->
    <VehicleFormModal
      :open="showModal"
      :edit-data="editingVehicle"
      @update:open="showModal = $event"
      @saved="vehiclesStore.fetchAll()"
    />

    <!-- Delete Confirm Dialog -->
    <dialog ref="deleteDialogRef" class="modal" @close="showDeleteDialog = false">
      <div class="modal-box max-w-sm">
        <h3 class="font-semibold text-base mb-2">確認刪除</h3>
        <p class="text-sm text-base-content/70">
          確定要刪除車輛「<strong>{{ deletingVehicle?.name }}</strong>」嗎？<br />
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
