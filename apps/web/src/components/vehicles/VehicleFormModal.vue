<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useVehicleTypesStore } from '@/stores/vehicleTypes'
import { useVehiclesStore } from '@/stores/vehicles'
import type { Vehicle } from '@/types'

interface Props {
  open: boolean
  editData?: Vehicle | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const vehicleTypesStore = useVehicleTypesStore()
const vehiclesStore = useVehiclesStore()
const dialogRef = ref<HTMLDialogElement | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

type FormData = Omit<Vehicle, 'id'>

function defaultForm(): FormData {
  return {
    name: '',
    licensePlate: '',
    vehicleTypeId: '',
    distanceLimit: null,
    workingHoursLimit: null,
    cargoCapacity: 0,
  }
}

const form = ref<FormData>(defaultForm())
const unlimitedDistance = ref(true)
const unlimitedHours = ref(true)
const distanceLimitInput = ref<number>(0)
const hoursLimitInput = ref<number>(8)

watch(
  () => props.open,
  (val) => {
    if (val) {
      submitError.value = null
      if (props.editData) {
        form.value = {
          name: props.editData.name,
          licensePlate: props.editData.licensePlate,
          vehicleTypeId: props.editData.vehicleTypeId,
          distanceLimit: props.editData.distanceLimit,
          workingHoursLimit: props.editData.workingHoursLimit,
          cargoCapacity: props.editData.cargoCapacity,
        }
        unlimitedDistance.value = props.editData.distanceLimit === null
        unlimitedHours.value = props.editData.workingHoursLimit === null
        distanceLimitInput.value = props.editData.distanceLimit ?? 0
        hoursLimitInput.value = props.editData.workingHoursLimit ?? 8
      } else {
        form.value = defaultForm()
        unlimitedDistance.value = true
        unlimitedHours.value = true
        distanceLimitInput.value = 0
        hoursLimitInput.value = 8
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

async function handleSubmit() {
  isSubmitting.value = true
  submitError.value = null

  const payload: FormData = {
    ...form.value,
    distanceLimit: unlimitedDistance.value ? null : distanceLimitInput.value,
    workingHoursLimit: unlimitedHours.value ? null : hoursLimitInput.value,
  }

  try {
    if (props.editData) {
      await vehiclesStore.update(props.editData.id, payload)
    } else {
      await vehiclesStore.create(payload)
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
    <div class="modal-box w-full max-w-lg max-h-[92dvh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-semibold text-lg">{{ editData ? '編輯車輛' : '新增車輛' }}</h3>
        <button class="btn btn-ghost btn-sm btn-circle" @click="close">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Name -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">車輛名稱 <span class="text-error">*</span></span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="例：北區小貨車A"
            class="input input-bordered w-full"
            required
          />
        </div>

        <!-- License Plate -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">車牌號碼 <span class="text-error">*</span></span>
          </label>
          <input
            v-model="form.licensePlate"
            type="text"
            placeholder="例：ABC-1234"
            class="input input-bordered w-full"
            required
          />
        </div>

        <!-- Vehicle Type -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">車輛類型 <span class="text-error">*</span></span>
          </label>
          <select
            v-model="form.vehicleTypeId"
            class="select select-bordered w-full"
            required
          >
            <option value="" disabled>請選擇車輛類型</option>
            <option
              v-for="type in vehicleTypesStore.types"
              :key="type.id"
              :value="type.id"
            >
              {{ type.name }}
            </option>
          </select>
          <label v-if="vehicleTypesStore.types.length === 0" class="label pb-0">
            <span class="label-text-alt text-warning">
              尚未建立任何車輛類型，請先至「車輛類型」頁面新增
            </span>
          </label>
        </div>

        <!-- Cargo Capacity -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">
              載貨量 <span class="text-error">*</span>
            </span>
          </label>
          <input
            v-model.number="form.cargoCapacity"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            class="input input-bordered w-40"
            required
          />
          <label class="label pb-0">
            <span class="label-text-alt text-base-content/40">單位自訂（例：公斤、箱）</span>
          </label>
        </div>

        <!-- Distance Limit -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">行駛距離限制</span>
          </label>
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="unlimitedDistance"
                type="checkbox"
                class="checkbox checkbox-sm"
              />
              <span class="text-sm">無限制</span>
            </label>
            <div v-if="!unlimitedDistance" class="flex items-center gap-2">
              <input
                v-model.number="distanceLimitInput"
                type="number"
                min="1"
                placeholder="500"
                class="input input-bordered input-sm w-32"
              />
              <span class="text-sm text-base-content/50">公里</span>
            </div>
          </div>
        </div>

        <!-- Working Hours Limit -->
        <div class="form-control">
          <label class="label pt-0">
            <span class="label-text font-medium">工時限制</span>
          </label>
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="unlimitedHours"
                type="checkbox"
                class="checkbox checkbox-sm"
              />
              <span class="text-sm">無限制</span>
            </label>
            <div v-if="!unlimitedHours" class="flex items-center gap-2">
              <input
                v-model.number="hoursLimitInput"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="8"
                class="input input-bordered input-sm w-32"
              />
              <span class="text-sm text-base-content/50">小時</span>
            </div>
          </div>
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
            {{ editData ? '更新車輛' : '新增車輛' }}
          </button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>關閉</button>
    </form>
  </dialog>
</template>
