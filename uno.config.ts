import extractorPug from '@unocss/extractor-pug'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetRemToPx from '@unocss/preset-rem-to-px'
import presetTagify from '@unocss/preset-tagify'
import presetWind3 from '@unocss/preset-wind3'
import { defineConfig } from 'unocss'

export default defineConfig({
  // 快捷方式
  shortcuts: {
    // shortcuts to multiple utilities
    'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',
    'btn-green': 'text-white bg-green-500 hover:bg-green-700',
    // single utility alias
    'red': 'text-red-100',
  },
  // 预设
  presets: [
    // wind3 预设
    presetWind3(),

    // 属性化预设
    presetAttributify(),

    // 标签化预设
    presetTagify(),

    // 图标预设 ?bg ?mask
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      cdn: 'https://esm.sh/',
    }),

    // rem 转 px 预设
    // presetRemToPx({
    //   baseFontSize: 4,
    // }),
  ],
  extractors: [
    // Pug 提取器 template lang="pug"
    extractorPug,
  ],
})
