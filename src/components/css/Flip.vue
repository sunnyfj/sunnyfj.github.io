<template>
  <div class="card">
    <div class="card-inner">
      <div class="card-face">
        <img src="@/assets/flip.png" alt="正面">
      </div>
      <div class="card-back">
        <img src="@/assets/flip-back.png" alt="背面">
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 700px;
  perspective: 2000px;
}

.card-inner {
  position: relative;
  width: min(60vw, 600px); /* 最大400px，响应式缩放 */
  aspect-ratio: 1 / 1;     /* 保持正方形 */
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover .card-inner {
  transform: rotateY(180deg);
}

.card-face,
.card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.card-face img,
.card-back img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin: 0;
}

.card-back {
  transform: rotateY(180deg);
}
</style>
