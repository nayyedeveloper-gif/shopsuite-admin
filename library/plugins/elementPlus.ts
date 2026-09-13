// https://github.com/element-plus/element-plus/issues/4855

import type { App } from 'vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'

export function setup() {}

export default {
  install(_app: App) {
    // Element Plus CSS side-effects only; components via unplugin.
  },
}
