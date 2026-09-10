<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-badge">W</div>
        <div>
          <p class="eyebrow">Wedding Feast</p>
          <h1>婚礼排桌</h1>
        </div>
      </div>

      <nav class="nav">
        <NuxtLink to="/" class="nav-link">项目概览</NuxtLink>
        <NuxtLink to="/guests" class="nav-link">宾客名单</NuxtLink>
        <NuxtLink to="/seating" class="nav-link">桌次安排</NuxtLink>
      </nav>

      <div class="sidebar-note">
        <p>目标</p>
        <strong>录宾客 · 排桌 · 保存</strong>
      </div>

      <div class="account-actions">
        <span>{{ user?.displayName || user?.username }}</span>
        <button class="btn soft" type="button" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()

async function handleLogout() {
  await logout()
  await navigateTo('/login')
}
</script>
