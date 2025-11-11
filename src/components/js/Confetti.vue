<script lang='ts' setup>
import confetti from 'canvas-confetti'

let confettiInstance: any = null
function onClickConfetti(options: confetti.Options) {
  confettiInstance?.(options)
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  confettiInstance = confetti.create(canvas, { resize: true })
})
</script>

<template>
  <canvas id="canvas" />
  <div h-2xl text-center>
    <el-button
      @click="onClickConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })"
    >
      Default
    </el-button>
    <el-button
      type="primary" @click="onClickConfetti({
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        particleCount: randomInRange(50, 100),
        origin: { y: 0.6 },
      })"
    >
      Primary
    </el-button>
    <el-button
      type="success" @click="onClickConfetti({
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        particleCount: randomInRange(50, 100),
        origin: { y: 0.6 },
      })"
    >
      Success
    </el-button>
    <el-button
      type="info" @click="onClickConfetti({
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        particleCount: randomInRange(50, 100),
        origin: { y: 0.6 },
      })"
    >
      Info
    </el-button>
    <el-button
      type="warning" @click="onClickConfetti({
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        particleCount: randomInRange(50, 100),
        origin: { y: 0.6 },
      })"
    >
      Warning
    </el-button>
    <el-button
      type="danger" @click="onClickConfetti({
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        particleCount: randomInRange(50, 100),
        origin: { y: 0.6 },
      })"
    >
      Danger
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
</style>
