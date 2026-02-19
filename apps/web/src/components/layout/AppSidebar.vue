<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { MapPin, Truck, Tag, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="flex flex-col w-64 min-h-full bg-base-100 border-r border-base-300">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-5 py-4 border-b border-base-300">
      <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <MapPin class="w-4 h-4 text-primary-content" />
      </div>
      <div>
        <span class="font-bold text-base leading-none tracking-tight">skMove</span>
        <p class="text-[10px] text-base-content/40 mt-0.5">路線規劃管理</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-3">
      <p class="text-[10px] font-semibold text-base-content/35 uppercase tracking-widest px-3 mb-2">
        管理
      </p>
      <ul class="menu p-0 gap-0.5">
        <li>
          <RouterLink to="/locations" active-class="active">
            <MapPin class="w-4 h-4" />
            地點管理
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/vehicles" active-class="active">
            <Truck class="w-4 h-4" />
            車輛管理
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/vehicle-types" active-class="active">
            <Tag class="w-4 h-4" />
            車輛類型
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- User / Logout -->
    <div class="border-t border-base-300 px-3 py-3">
      <button
        class="btn btn-ghost btn-sm btn-block justify-start gap-2 text-base-content/60 hover:text-base-content"
        @click="logout"
      >
        <LogOut class="w-4 h-4" />
        登出
      </button>
    </div>
  </aside>
</template>
