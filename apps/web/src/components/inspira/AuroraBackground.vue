<script setup lang="ts">
defineProps<{
  showRadialGradient?: boolean
}>()
</script>

<template>
  <div class="aurora-wrap">
    <div
      class="aurora-glow"
      :class="{ 'aurora-mask': showRadialGradient !== false }"
    />
    <slot />
  </div>
</template>

<style scoped>
.aurora-wrap {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: oklch(0.98 0.001 247.839);
  overflow: hidden;
}

.aurora-glow {
  pointer-events: none;
  position: absolute;
  inset: -10px;
  opacity: 0.45;
  will-change: transform;
  filter: blur(12px);
  background-image:
    repeating-linear-gradient(
      100deg,
      #fff 0%,
      #fff 7%,
      transparent 10%,
      transparent 12%,
      #fff 16%
    ),
    repeating-linear-gradient(
      100deg,
      #93c5fd 10%,
      #a5b4fc 15%,
      #6ee7b7 20%,
      #ddd6fe 25%,
      #bfdbfe 30%
    );
  background-size: 300%, 200%;
  background-position: 50% 50%, 50% 50%;
  animation: aurora 60s linear infinite;
}

.aurora-mask {
  mask-image: radial-gradient(ellipse at 75% 8%, black 10%, transparent 68%);
}

@keyframes aurora {
  from {
    background-position: 50% 50%, 50% 50%;
  }
  to {
    background-position: 350% 50%, 350% 50%;
  }
}
</style>
