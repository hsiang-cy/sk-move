<script setup lang="ts">
// Decorative top-down cartoon city map background for login page
</script>

<template>
  <div class="map-wrap">
    <!--
      SVG 俯視卡通地圖
      viewBox 1200×800，preserveAspectRatio="xMidYMid slice" 填滿螢幕
      繪製順序：背景 → 公園 → 街廓 → 斜向道路 → 主幹道 → 中心虛線 → 圓環 → 定位針
    -->
    <svg
      class="map-svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- ── 底色 ── -->
      <rect width="1200" height="800" fill="#f7f6f4" />

      <!-- ══════════════════════════════════════════
           公園（道路前先畫，讓道路壓在上方）
           ══════════════════════════════════════════ -->
      <!-- 公園 A: 左上區塊 (Row1, V1-V2) -->
      <rect x="147" y="158" width="196" height="129" rx="10" fill="#d5e8d2" />
      <!-- 公園 B: 右中下區塊 (Row3, V4-V5) -->
      <rect x="737" y="488" width="146" height="144" rx="10" fill="#d5e8d2" />

      <!-- 公園樹木（填色小圓） -->
      <circle cx="183" cy="205" r="13" fill="#bad2b6" />
      <circle cx="220" cy="248" r="10" fill="#bad2b6" />
      <circle cx="265" cy="196" r="15" fill="#bad2b6" />
      <circle cx="312" cy="230" r="11" fill="#bad2b6" />
      <circle cx="194" cy="263" r="9"  fill="#bad2b6" />
      <circle cx="328" cy="188" r="12" fill="#bad2b6" />
      <circle cx="777" cy="530" r="12" fill="#bad2b6" />
      <circle cx="810" cy="570" r="9"  fill="#bad2b6" />
      <circle cx="848" cy="516" r="14" fill="#bad2b6" />
      <circle cx="872" cy="560" r="10" fill="#bad2b6" />

      <!-- ══════════════════════════════════════════
           街廓（城市街區，圓角矩形）
           ══════════════════════════════════════════ -->
      <!-- Row 0（頂部裁切） -->
      <rect x="147"  y="8"   width="196" height="114" rx="8" fill="#eceae6" />
      <rect x="557"  y="8"   width="146" height="114" rx="8" fill="#eceae6" />
      <rect x="917"  y="8"   width="146" height="114" rx="8" fill="#eceae6" />

      <!-- Row 1 -->
      <rect x="8"    y="158" width="105" height="129" rx="8" fill="#eceae6" />
      <rect x="377"  y="158" width="146" height="129" rx="8" fill="#eceae6" />
      <rect x="557"  y="158" width="146" height="129" rx="8" fill="#eceae6" />
      <rect x="917"  y="158" width="146" height="129" rx="8" fill="#eceae6" />
      <rect x="1097" y="158" width="95"  height="129" rx="8" fill="#eceae6" />

      <!-- Row 2（中間留空讓斜向道路穿過，保持視覺通透） -->
      <rect x="147"  y="323" width="196" height="129" rx="8" fill="#eceae6" />
      <rect x="737"  y="323" width="146" height="129" rx="8" fill="#eceae6" />
      <rect x="917"  y="323" width="146" height="129" rx="8" fill="#eceae6" />

      <!-- Row 3 -->
      <rect x="147"  y="488" width="196" height="144" rx="8" fill="#eceae6" />
      <rect x="377"  y="488" width="146" height="144" rx="8" fill="#eceae6" />
      <rect x="917"  y="488" width="146" height="144" rx="8" fill="#eceae6" />
      <rect x="1097" y="488" width="95"  height="144" rx="8" fill="#eceae6" />

      <!-- Row 4（底部裁切） -->
      <rect x="8"    y="668" width="105" height="124" rx="8" fill="#eceae6" />
      <rect x="147"  y="668" width="196" height="124" rx="8" fill="#eceae6" />
      <rect x="557"  y="668" width="146" height="124" rx="8" fill="#eceae6" />
      <rect x="737"  y="668" width="146" height="124" rx="8" fill="#eceae6" />

      <!-- ══════════════════════════════════════════
           斜向捷徑道路（V2/H3 交叉點 → V3/H2 交叉點）
           先畫讓主幹道壓住端點，形成自然交叉
           ══════════════════════════════════════════ -->
      <path
        d="M 360 470 L 540 305"
        stroke="#e3e2de"
        stroke-width="17"
        stroke-linecap="round"
      />

      <!-- ══════════════════════════════════════════
           主幹道（水平）
           ══════════════════════════════════════════ -->
      <rect x="0" y="130" width="1200" height="20" fill="#e3e2de" />
      <rect x="0" y="295" width="1200" height="20" fill="#e3e2de" />
      <rect x="0" y="460" width="1200" height="20" fill="#e3e2de" />
      <rect x="0" y="640" width="1200" height="20" fill="#e3e2de" />

      <!-- ══════════════════════════════════════════
           主幹道（垂直）
           ══════════════════════════════════════════ -->
      <rect x="121"  y="0" width="18" height="800" fill="#e3e2de" />
      <rect x="351"  y="0" width="18" height="800" fill="#e3e2de" />
      <rect x="531"  y="0" width="18" height="800" fill="#e3e2de" />
      <rect x="711"  y="0" width="18" height="800" fill="#e3e2de" />
      <rect x="891"  y="0" width="18" height="800" fill="#e3e2de" />
      <rect x="1071" y="0" width="18" height="800" fill="#e3e2de" />

      <!-- ══════════════════════════════════════════
           道路中心線（虛線，增加地圖感）
           ══════════════════════════════════════════ -->
      <!-- 水平 -->
      <line x1="0"    y1="140" x2="1200" y2="140" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="0"    y1="305" x2="1200" y2="305" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="0"    y1="470" x2="1200" y2="470" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="0"    y1="650" x2="1200" y2="650" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <!-- 垂直 -->
      <line x1="130"  y1="0" x2="130"  y2="800" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="360"  y1="0" x2="360"  y2="800" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="540"  y1="0" x2="540"  y2="800" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="720"  y1="0" x2="720"  y2="800" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="900"  y1="0" x2="900"  y2="800" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />
      <line x1="1080" y1="0" x2="1080" y2="800" stroke="#ccc9c3" stroke-width="1.5" stroke-dasharray="15 11" />

      <!-- ══════════════════════════════════════════
           圓環（V4/H3 交叉點，x=720 y=470）
           ══════════════════════════════════════════ -->
      <circle cx="720" cy="470" r="30" fill="#e3e2de" />
      <circle cx="720" cy="470" r="13" fill="#eceae6" />

      <!-- ══════════════════════════════════════════
           定位針（卡通水滴形狀，略帶透明感）
           path: 由 (0,16) 向上收束至 (0,-18) 的淚滴
           ══════════════════════════════════════════ -->
      <!-- 針 1: 公園 A（綠色針） -->
      <g transform="translate(248, 218)" opacity="0.75">
        <path
          d="M0,16 C-4,10 -12,4 -12,-4 C-12,-12 -6,-18 0,-18 C6,-18 12,-12 12,-4 C12,4 4,10 0,16Z"
          fill="#8ab486"
        />
        <circle cx="0" cy="-5" r="5" fill="#eaf4e8" opacity="0.9" />
      </g>
      <!-- 針 2: Row1 V2-V3 街廓 -->
      <g transform="translate(452, 215)" opacity="0.6">
        <path
          d="M0,16 C-4,10 -12,4 -12,-4 C-12,-12 -6,-18 0,-18 C6,-18 12,-12 12,-4 C12,4 4,10 0,16Z"
          fill="#bcb9b4"
        />
        <circle cx="0" cy="-5" r="5" fill="#f2f0ee" opacity="0.9" />
      </g>
      <!-- 針 3: Row0 V3-V4 街廓 -->
      <g transform="translate(632, 58)" opacity="0.55">
        <path
          d="M0,16 C-4,10 -12,4 -12,-4 C-12,-12 -6,-18 0,-18 C6,-18 12,-12 12,-4 C12,4 4,10 0,16Z"
          fill="#bcb9b4"
        />
        <circle cx="0" cy="-5" r="5" fill="#f2f0ee" opacity="0.9" />
      </g>
      <!-- 針 4: Row3 V1-V2 街廓 -->
      <g transform="translate(248, 562)" opacity="0.55">
        <path
          d="M0,16 C-4,10 -12,4 -12,-4 C-12,-12 -6,-18 0,-18 C6,-18 12,-12 12,-4 C12,4 4,10 0,16Z"
          fill="#bcb9b4"
        />
        <circle cx="0" cy="-5" r="5" fill="#f2f0ee" opacity="0.9" />
      </g>
      <!-- 針 5: Row1 V5-V6 街廓 -->
      <g transform="translate(992, 222)" opacity="0.55">
        <path
          d="M0,16 C-4,10 -12,4 -12,-4 C-12,-12 -6,-18 0,-18 C6,-18 12,-12 12,-4 C12,4 4,10 0,16Z"
          fill="#bcb9b4"
        />
        <circle cx="0" cy="-5" r="5" fill="#f2f0ee" opacity="0.9" />
      </g>
    </svg>

    <!-- 登入卡片疊在地圖上方 -->
    <slot />
  </div>
</template>

<style scoped>
.map-wrap {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f7f6f4;
}

.map-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
}
</style>
