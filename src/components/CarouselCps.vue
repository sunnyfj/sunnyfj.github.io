<script lang='ts' setup>
const carouselList = ref<HTMLDivElement | null>(null)
const carouselCount = ref(3)

const currentIndex = ref(0)

function moveTo(index: number) {
  if (!carouselList.value)
    return
  carouselList.value.style.transition = 'transform 0.5s ease-in-out'
  carouselList.value.style.transform = `translateX(${-index * 100}%)`
  currentIndex.value = index
}

function prev() {
  if (currentIndex.value === 0) {
    carouselList.value!.style.transition = 'none'
    carouselList.value!.style.transform = `translateX(-${(carouselCount.value) * 100}%)`
    // 使得浏览器渲染完成后再切换过渡 1 同步代码 强制回流  2 异步代码
    const _ = carouselList.value!.clientWidth
    moveTo(carouselCount.value - 1)
  }
  else {
    moveTo((currentIndex.value - 1))
  }
}

function next() {
  if (currentIndex.value === carouselCount.value - 1) {
    carouselList.value!.style.transition = 'none'
    carouselList.value!.style.transform = `translateX(100%)`
    const _ = carouselList.value!.clientWidth
    moveTo(0)
  }
  else {
    moveTo((currentIndex.value + 1) % 3)
  }
}

function init() {
  if (!carouselList.value)
    return

  const firstItemClone = carouselList.value.firstElementChild!.cloneNode(true) as HTMLElement
  const lastItemClone = carouselList.value.lastElementChild!.cloneNode(true) as HTMLElement
  carouselList.value.appendChild(firstItemClone)
  carouselList.value.insertBefore(lastItemClone, carouselList.value.firstElementChild)
  lastItemClone.style.marginLeft = '-100%'
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="carousel">
    <div ref="carouselList" class="carousel-list">
      <div v-for="item in carouselCount" :key="item" class="carousel-item">
        {{ item }}
      </div>
    </div>
    <div class="carousel-arrow-left" @click="prev">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 1024 1024"><path fill="#aa6b6b" d="M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0" />
      </svg>
    </div>
    <div class="carousel-arrow-right" @click="next">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 1024 1024"><path fill="#aa6b6b" d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0" />
      </svg>
    </div>
    <div class="carousel-dots">
      <div v-for="(_item, index) in carouselCount" :key="index" class="carousel-dot" :class="{ active: index === currentIndex }" @click.stop="moveTo(index)" />
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  width: 400px;
  height: 300px;
  margin: 0 auto;
  border: 1px solid #aa6b6b;
}

.carousel-list {
  display: flex;
  width: 100%;
  height: 100%;
}

.carousel-item {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #aa6b6b;
}

.carousel-arrow-left,
.carousel-arrow-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  opacity: 0.8;
  transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.carousel-arrow-left:hover,
.carousel-arrow-right:hover {
  transform: translateY(-50%) scale(1.1);
  opacity: 1;
}

.carousel-arrow-left {
  left: 10px;
}

.carousel-arrow-right {
  right: 10px;
}

.carousel-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #aa6b6b;
  margin: 0 5px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
  opacity: 0.4;
}

.carousel-dot.active {
  opacity: 1;
}
</style>
