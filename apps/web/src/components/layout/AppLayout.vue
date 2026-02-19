<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
import AppSidebar from './AppSidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="drawer lg:drawer-open min-h-screen">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" />

    <!-- Main content -->
    <div class="drawer-content flex flex-col bg-base-200 min-h-screen">
      <!-- Mobile topbar -->
      <header class="navbar bg-base-100 border-b border-base-300 lg:hidden px-4 min-h-14">
        <label for="app-drawer" class="btn btn-ghost btn-square btn-sm">
          <Menu class="w-5 h-5" />
        </label>
        <span class="font-bold text-base ml-2">skMove</span>
      </header>

      <!-- Page -->
      <main class="flex-1 p-6 max-w-screen-xl">
        <RouterView />
      </main>
    </div>

    <!-- Sidebar drawer -->
    <div class="drawer-side z-40">
      <label for="app-drawer" class="drawer-overlay" aria-label="關閉選單" />
      <AppSidebar />
    </div>
  </div>
</template>
