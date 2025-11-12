<script lang='ts' setup>
import confetti from 'canvas-confetti'

let confettiInstance: any = null
// 用于控制背景烟花的变量
let backgroundAnimationId: number | null = null
let isBackgroundRunning = false

function onClickConfetti(options: confetti.Options) {
  confettiInstance?.(options)
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// 默认效果
function defaultConfetti() {
  onClickConfetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
}

// 主要效果 - 从顶部飘落
function primaryConfetti() {
  const end = Date.now() + 1000
  const colors = ['#409EFF', '#66b1ff', '#8cc5ff'];

  (function frame() {
    confettiInstance({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    })
    confettiInstance({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}

// 成功效果 - 星星和彩带
function successConfetti() {
  confettiInstance({
    particleCount: 100,
    spread: 70,
    scalar: 0.8,
    origin: { y: 0.6 },
    shapes: ['circle', 'square'],
    colors: ['#67C23A', '#85ce61', '#95d475'],
  })
}

// 信息效果 - 雪花效果
function infoConfetti() {
  confettiInstance({
    particleCount: 150,
    spread: 100,
    scalar: 1.2,
    origin: { y: 0.5 },
    shapes: ['circle'],
    colors: ['#909399', '#a6a9ad', '#b1b3b8'],
    gravity: 0.5,
    drift: 0.1,
  })
}

// 警告效果 - 火焰效果
function warningConfetti() {
  confettiInstance({
    particleCount: 80,
    spread: 60,
    scalar: 1.1,
    origin: { y: 0.7 },
    colors: ['#E6A23C', '#ebb563', '#f0c78a'],
    gravity: 1.2,
    decay: 0.94,
  })
}

// 危险效果 - 爆炸效果
function dangerConfetti() {
  const end = Date.now() + 500
  const colors = ['#F56C6C', '#f78989', '#f89797'];

  (function frame() {
    confettiInstance({
      particleCount: 10,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { y: 0.6 },
      colors,
      gravity: 1.5,
      scalar: 1.2,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}

function svgConfetti() {
  const pumpkin = {
    type: 'path',
    path: 'M449.4 142c-5 0-10 .3-15 1a183 183 0 0 0-66.9-19.1V87.5a17.5 17.5 0 1 0-35 0v36.4a183 183 0 0 0-67 19c-4.9-.6-9.9-1-14.8-1C170.3 142 105 219.6 105 315s65.3 173 145.7 173c5 0 10-.3 14.8-1a184.7 184.7 0 0 0 169 0c4.9.7 9.9 1 14.9 1 80.3 0 145.6-77.6 145.6-173s-65.3-173-145.7-173zm-220 138 27.4-40.4a11.6 11.6 0 0 1 16.4-2.7l54.7 40.3a11.3 11.3 0 0 1-7 20.3H239a11.3 11.3 0 0 1-9.6-17.5zM444 383.8l-43.7 17.5a17.7 17.7 0 0 1-13 0l-37.3-15-37.2 15a17.8 17.8 0 0 1-13 0L256 383.8a17.5 17.5 0 0 1 13-32.6l37.3 15 37.2-15c4.2-1.6 8.8-1.6 13 0l37.3 15 37.2-15a17.5 17.5 0 0 1 13 32.6zm17-86.3h-82a11.3 11.3 0 0 1-6.9-20.4l54.7-40.3a11.6 11.6 0 0 1 16.4 2.8l27.4 40.4a11.3 11.3 0 0 1-9.6 17.5z',
    matrix: [0.020491803278688523, 0, 0, 0.020491803278688523, -7.172131147540983, -5.9016393442622945],
  }
  // tree shape from https://thenounproject.com/icon/pine-tree-1471679/
  const tree = {
    type: 'path',
    path: 'M120 240c-41,14 -91,18 -120,1 29,-10 57,-22 81,-40 -18,2 -37,3 -55,-3 25,-14 48,-30 66,-51 -11,5 -26,8 -45,7 20,-14 40,-30 57,-49 -13,1 -26,2 -38,-1 18,-11 35,-25 51,-43 -13,3 -24,5 -35,6 21,-19 40,-41 53,-67 14,26 32,48 54,67 -11,-1 -23,-3 -35,-6 15,18 32,32 51,43 -13,3 -26,2 -38,1 17,19 36,35 56,49 -19,1 -33,-2 -45,-7 19,21 42,37 67,51 -19,6 -37,5 -56,3 25,18 53,30 82,40 -30,17 -79,13 -120,-1l0 41 -31 0 0 -41z',
    matrix: [0.03597122302158273, 0, 0, 0.03597122302158273, -4.856115107913669, -5.071942446043165],
  }
  // heart shape from https://thenounproject.com/icon/heart-1545381/
  const heart = {
    type: 'path',
    path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
    matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333],
  }

  const defaults = {
    scalar: 2,
    spread: 180,
    particleCount: 30,
    origin: { y: -0.1 },
    startVelocity: -35,
  }

  confettiInstance({
    ...defaults,
    shapes: [pumpkin],
    colors: ['#ff9a00', '#ff7400', '#ff4d00'],
  })
  confettiInstance({
    ...defaults,
    shapes: [tree],
    colors: ['#8d960f', '#be0f10', '#445404'],
  })
  confettiInstance({
    ...defaults,
    shapes: [heart],
    colors: ['#f93963', '#a10864', '#ee0b93'],
  })
}

// 背景慢放烟花效果
const backgroundConfettiInterval = 2
function startBackgroundConfetti() {
  if (isBackgroundRunning)
    return

  isBackgroundRunning = true

  function backgroundFrame() {
    if (!isBackgroundRunning)
      return

    // 随机位置生成少量粒子
    const x = Math.random()
    const y = Math.random()

    confettiInstance({
      particleCount: randomInRange(50, 100),
      spread: randomInRange(100, 260),
      startVelocity: randomInRange(20, 50),
      origin: { x, y },
      gravity: 0.2,
      drift: 0.2,
      decay: 0.85,
    })

    // 慢速播放，每500ms触发一次
    backgroundAnimationId = setTimeout(backgroundFrame, backgroundConfettiInterval * 1000)
  }

  backgroundFrame()
}

function stopBackgroundConfetti() {
  isBackgroundRunning = false
  if (backgroundAnimationId) {
    clearTimeout(backgroundAnimationId)
    backgroundAnimationId = null
  }
}

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  confettiInstance = confetti.create(canvas, {
    resize: true,
    useWorker: true, // 使用Web Worker提高性能
  })

  // 启动背景烟花效果
  startBackgroundConfetti()
})

// 组件卸载时清理
onUnmounted(() => {
  stopBackgroundConfetti()
})
</script>

<template>
  <canvas id="canvas" />
  <div class="button-container">
    <el-button @click="defaultConfetti">
      Default
    </el-button>
    <el-button type="primary" @click="primaryConfetti">
      Primary
    </el-button>
    <el-button type="success" @click="successConfetti">
      Success
    </el-button>
    <el-button type="info" @click="infoConfetti">
      Info
    </el-button>
    <el-button type="warning" @click="warningConfetti">
      Warning
    </el-button>
    <el-button type="danger" @click="dangerConfetti">
      Danger
    </el-button>
    <el-button @click="svgConfetti">
      Svg
    </el-button>
  </div>
</template>

<style scoped>
canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.button-container {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1; /* 确保按钮在前景层 */
}
</style>
