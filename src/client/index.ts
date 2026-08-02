import type { Theme } from 'vitepress'
import Layout from './AppLayout.vue'
import {
  beforeRouteChangeGuard, type GuardPluginContext
} from './guard'

export const theme = {
  Layout,
  enhanceApp: (ctx: GuardPluginContext) => {
    ctx.router.onBeforeRouteChange = (to: string) => {
      return beforeRouteChangeGuard(
        ctx, to
      )
    }
  }
} satisfies Theme
