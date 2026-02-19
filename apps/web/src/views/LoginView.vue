<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import MapBackground from '@/components/inspira/MapBackground.vue'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const loginError = ref<string | null>(null)

async function handleLogin() {
  isLoading.value = true
  loginError.value = null

  try {
    await auth.login({ username: username.value, password: password.value })
    router.push('/locations')
  } catch (e) {
    loginError.value =
      e instanceof Error
        ? e.message.includes('401') || e.message.includes('403')
          ? '帳號或密碼錯誤'
          : e.message
        : '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <MapBackground>
    <div
      class="relative z-10 w-full max-w-sm mx-4"
    >
      <!-- Card -->
      <div class="card bg-base-100 shadow-xl border border-base-200">
        <div class="card-body px-8 py-8">
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm"
            >
              <MapPin class="w-5 h-5 text-primary-content" />
            </div>
            <div>
              <h1 class="text-xl font-bold leading-none tracking-tight">skMove</h1>
              <p class="text-xs text-base-content/40 mt-0.5">路線規劃管理系統</p>
            </div>
          </div>

          <h2 class="font-semibold text-base text-base-content/70 mb-4">登入帳號</h2>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username -->
            <div class="form-control">
              <label class="label pt-0">
                <span class="label-text">帳號</span>
              </label>
              <input
                v-model="username"
                type="text"
                placeholder="請輸入帳號"
                class="input input-bordered w-full"
                autocomplete="username"
                required
              />
            </div>

            <!-- Password -->
            <div class="form-control">
              <label class="label pt-0">
                <span class="label-text">密碼</span>
              </label>
              <input
                v-model="password"
                type="password"
                placeholder="請輸入密碼"
                class="input input-bordered w-full"
                autocomplete="current-password"
                required
              />
            </div>

            <!-- Error -->
            <div v-if="loginError" class="alert alert-error py-2.5 text-sm">
              <span>{{ loginError }}</span>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn btn-primary btn-block mt-2"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading loading-spinner loading-xs" />
              {{ isLoading ? '登入中...' : '登入' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </MapBackground>
</template>
