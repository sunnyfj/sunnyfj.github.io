<script setup lang="ts">
const route = useRoute()

const imageModel = ref<HTMLImageElement>()
const imageAlt = ref<string>()

function setImageModel(img: HTMLImageElement) {
  imageModel.value = img
  imageAlt.value = img.alt
  const figure = img.closest('figure')
  if (figure) {
    const caption = figure.querySelector('figcaption')
    if (caption?.textContent)
      imageAlt.value ||= caption.textContent
  }
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLImageElement
  if (!(first instanceof HTMLElement))
    return
  if (first.tagName !== 'IMG')
    return
  if (first.classList.contains('no-preview'))
    return
  if (path.some(el => el instanceof HTMLElement && ['A', 'BUTTON'].includes(el.tagName)))
    return
  if (!path.some(el => el instanceof HTMLElement && (el.classList.contains('prose') || el.classList.contains('photos'))))
    return

  // Do not open image when they are moving. Mainly for mobile to avoid conflict with hovering behavior.
  const pos = first.getBoundingClientRect()
  await new Promise(resolve => setTimeout(resolve, 50))
  const newPos = first.getBoundingClientRect()
  if (pos.left !== newPos.left || pos.top !== newPos.top)
    return

  setImageModel(first)
})

onKeyStroke('ArrowRight', (e) => {
  if (!imageModel.value || imageModel.value.dataset.photoIndex == null)
    return

  const index = Number.parseInt(imageModel.value.dataset.photoIndex)
  const nextIndex = index + 1
  const nextImg = document.querySelector(`img[data-photo-index="${nextIndex}"]`) as HTMLImageElement | null
  if (nextImg) {
    setImageModel(nextImg)
    e.preventDefault()
  }
})

onKeyStroke('ArrowLeft', (e) => {
  if (!imageModel.value || imageModel.value.dataset.photoIndex == null)
    return

  const index = Number.parseInt(imageModel.value.dataset.photoIndex)
  const prevIndex = index - 1
  const prevImg = document.querySelector(`img[data-photo-index="${prevIndex}"]`) as HTMLImageElement | null
  if (prevImg) {
    setImageModel(prevImg)
    e.preventDefault()
  }
})

onKeyStroke('Escape', (e) => {
  if (imageModel.value) {
    imageModel.value = undefined
    e.preventDefault()
  }
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
  <Transition name="fade">
    <div v-if="imageModel" fixed bottom-0 left-0 right-0 top-0 z-500 backdrop-blur-7 @click="imageModel = undefined">
      <div absolute bottom-0 left-0 right-0 top-0 z--1 bg-black:50 />
      <img :src="imageModel.src" :alt="imageModel.alt" :class="imageModel.className" h-full max-h-screen max-w-screen w-full object-contain>
      <div v-if="imageAlt" absolute bottom-5 right-5 flex items-center justify-center bg-black:50 px2 py1 text-white>
        {{ imageAlt }}
      </div>
    </div>
  </Transition>
</template>
