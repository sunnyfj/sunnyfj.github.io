<script setup lang="ts">
const route = useRoute()
const ArtComponent = computed(() => {
  let art = 'random'
  if (art === 'random')
    art = Math.random() > 0.5 ? 'plum' : 'dots'
  if (typeof window !== 'undefined') {
    if (art === 'plum')
      return defineAsyncComponent(() => import('./components/ArtPlum.vue'))
    else if (art === 'dots')
      return defineAsyncComponent(() => import('./components/ArtDots.vue'))
  }
  return undefined
})

window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})
</script>

<template>
  <NavBar />
  <main class="of-x-hidden px-7 py-10">
    <RouterView />
    <Footer :key="route.path" />
  </main>
  <component :is="ArtComponent" />
</template>
