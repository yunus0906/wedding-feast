<template>
  <section class="page">
    <div class="hero">
      <div>
        <p class="eyebrow">MVP v0.1</p>
        <h2>婚礼排桌系统</h2>
        <p class="muted">管理宾客名单，并在可视化画布上完成婚宴桌次安排。</p>
      </div>
      <NuxtLink class="btn primary" to="/guests">开始录入宾客</NuxtLink>
    </div>

    <div class="grid-4">
      <div class="stat">
        <label>宾客人数</label>
        <strong>{{ guestStore.stats.totalGuests }}</strong>
      </div>
      <div class="stat">
        <label>出席总人数</label>
        <strong>{{ guestStore.stats.headCount }}</strong>
      </div>
      <div class="stat">
        <label>桌子数量</label>
        <strong>{{ seatingStore.tables.length }}</strong>
      </div>
      <div class="stat">
        <label>已入座</label>
        <strong>{{ seatingStore.seats.length }}</strong>
      </div>
    </div>

    <div class="panel">
      <h3 style="margin-top:0">开发任务</h3>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>模块</th>
              <th>功能</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tasks" :key="item.name">
              <td>{{ item.module }}</td>
              <td>{{ item.name }}</td>
              <td><span class="tag">{{ item.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const guestStore = useGuestStore()
const seatingStore = useSeatingStore()

const tasks = [
  { module: '基础', name: 'Nuxt / Pinia / TypeScript / 全局布局', status: '已完成' },
  { module: '宾客', name: 'CRUD / 搜索 / 统计 / 导入导出', status: '已完成' },
  { module: '桌次', name: '画布 / 圆桌 / 座位 / 保存', status: '已完成' },
  { module: '增强', name: 'Supabase / xlsx / 对齐辅助线 / 撤销重做', status: '后续' }
]
</script>
