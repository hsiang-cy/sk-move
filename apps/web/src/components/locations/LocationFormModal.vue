<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, X } from 'lucide-vue-next'
import { useVehicleTypesStore } from '@/stores/vehicleTypes'
import { useLocationsStore } from '@/stores/locations'
import type { Location } from '@/types'

interface Props {
  open: boolean
  editData?: Location | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const vehicleTypesStore = useVehicleTypesStore()
const locationsStore = useLocationsStore()
const dialogRef = ref<HTMLDialogElement | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

type FormData = Omit<Location, 'id'>

function defaultForm(): FormData {
  return {
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    timeWindows: [{ start: '09:00', end: '17:00' }],
    dwellTime: 15,
    acceptedVehicleTypes: [],
    cargoDemand: 0,
  }
}

const form = ref<FormData>(defaultForm())

watch(
  () => props.open,
  (val) => {
    if (val) {
      submitError.value = null
      if (props.editData) {
        form.value = {
          name: props.editData.name,
          address: props.editData.address,
          latitude: props.editData.latitude,
          longitude: props.editData.longitude,
          timeWindows: props.editData.timeWindows.map((tw) => ({ ...tw })),
          dwellTime: props.editData.dwellTime,
          acceptedVehicleTypes: [...props.editData.acceptedVehicleTypes],
          cargoDemand: props.editData.cargoDemand,
        }
      } else {
        form.value = defaultForm()
      }
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
)

function close() {
  emit('update:open', false)
}

function addTimeWindow() {
  form.value.timeWindows.push({ start: '09:00', end: '17:00' })
}

function removeTimeWindow(index: number) {
  form.value.timeWindows.splice(index, 1)
}

function isTypeSelected(id: string): boolean {
  return form.value.acceptedVehicleTypes.includes(id)
}

function toggleType(id: string) {
  const idx = form.value.acceptedVehicleTypes.indexOf(id)
  if (idx === -1) {
    form.value.acceptedVehicleTypes.push(id)
  } else {
    form.value.acceptedVehicleTypes.splice(idx, 1)
  }
}

async function handleSubmit() {
  if (form.value.timeWindows.length === 0) {
    submitError.value = '至少需要一個時窗'
    return
  }
  if (form.value.acceptedVehicleTypes.length === 0) {
    submitError.value = '至少選擇一種可接受的車輛類型'
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    if (props.editData) {
      await locationsStore.update(props.editData.id, form.value)
    } else {
      await locationsStore.create(form.value)
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
    <div class="modal-box w-full max-w-2xl max-h-[92dvh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-semibold text-lg">{{ editData ? '編輯地點' : '新增地點' }}</h3>
        <button class="btn btn-ghost btn-sm btn-circle" @click="close">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Name -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">地點名稱 <span class="text-error">*</span></span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="例：台北倉庫"
            class="input input-bordered w-full"
            required
          />
        </div>

        <!-- Address -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">地址 <span class="text-error">*</span></span>
          </label>
          <input
            v-model="form.address"
            type="text"
            placeholder="例：台北市信義區信義路五段7號"
            class="input input-bordered w-full"
            required
          />
        </div>

        <!-- Lat / Lng -->
        <div class="grid grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label pt-0">
              <span class="label-text font-medium">緯度 <span class="text-error">*</span></span>
            </label>
            <input
              v-model.number="form.latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              placeholder="25.0330"
              class="input input-bordered w-full"
              required
            />
          </div>
          <div class="form-control">
            <label class="label pt-0">
              <span class="label-text font-medium">經度 <span class="text-error">*</span></span>
            </label>
            <input
              v-model.number="form.longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              placeholder="121.5654"
              class="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <!-- Time Windows -->
        <div class="form-control">
          <div class="flex items-center justify-between mb-1.5">
            <span class="label-text font-medium">
              可收貨時窗 <span class="text-error">*</span>
            </span>
            <button type="button" class="btn btn-ghost btn-xs gap-1" @click="addTimeWindow">
              <Plus class="w-3 h-3" />新增時段
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(tw, i) in form.timeWindows"
              :key="i"
              class="flex items-center gap-2"
            >
              <input
                v-model="tw.start"
                type="time"
                class="input input-bordered input-sm flex-1"
                required
              />
              <span class="text-base-content/40 text-sm select-none">至</span>
              <input
                v-model="tw.end"
                type="time"
                class="input input-bordered input-sm flex-1"
                required
              />
              <button
                v-if="form.timeWindows.length > 1"
                type="button"
                class="btn btn-ghost btn-sm btn-circle text-base-content/30 hover:text-error"
                @click="removeTimeWindow(i)"
              >
                <X class="w-3.5 h-3.5" />
              </button>
              <div v-else class="w-8 shrink-0" />
            </div>
          </div>
        </div>

        <!-- Dwell Time -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">
              預計停留時間 <span class="text-error">*</span>
            </span>
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="form.dwellTime"
              type="number"
              min="1"
              placeholder="15"
              class="input input-bordered w-32"
              required
            />
            <span class="text-sm text-base-content/50">分鐘（含裝卸貨時間）</span>
          </div>
        </div>

        <!-- Accepted Vehicle Types -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">
              可接受車輛類型 <span class="text-error">*</span>
            </span>
          </label>
          <div
            v-if="vehicleTypesStore.types.length > 0"
            class="border border-base-300 rounded-xl p-3 flex flex-wrap gap-2"
          >
            <label
              v-for="type in vehicleTypesStore.types"
              :key="type.id"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border transition-all select-none"
              :class="
                isTypeSelected(type.id)
                  ? 'border-primary bg-primary text-primary-content font-medium'
                  : 'border-base-300 hover:border-base-content/30 bg-base-100'
              "
            >
              <input
                type="checkbox"
                class="hidden"
                :checked="isTypeSelected(type.id)"
                @change="toggleType(type.id)"
              />
              <span class="text-sm">{{ type.name }}</span>
            </label>
          </div>
          <div
            v-else
            class="border border-dashed border-base-300 rounded-xl p-4 text-center text-sm text-base-content/40"
          >
            尚未建立任何車輛類型，請先至
            <RouterLink to="/vehicle-types" class="link link-primary" @click="close">
              車輛類型
            </RouterLink>
            頁面新增
          </div>
        </div>

        <!-- Cargo Demand -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">
              貨物需求量 <span class="text-error">*</span>
            </span>
          </label>
          <input
            v-model.number="form.cargoDemand"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            class="input input-bordered w-40"
            required
          />
          <label class="label pb-0">
            <span class="label-text-alt text-base-content/40">單位自訂（例：公斤、箱、件）</span>
          </label>
        </div>

        <!-- Error -->
        <div v-if="submitError" class="alert alert-error py-2.5 text-sm">
          <span>{{ submitError }}</span>
        </div>

        <!-- Actions -->
        <div class="modal-action mt-2 pt-2 border-t border-base-200">
          <button type="button" class="btn btn-ghost" @click="close">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs" />
            {{ editData ? '更新地點' : '新增地點' }}
          </button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>關閉</button>
    </form>
  </dialog>
</template>
