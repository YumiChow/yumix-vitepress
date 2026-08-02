import type {
  SiteData, EnhanceAppContext
} from 'vitepress'
import type { Ref } from 'vue'

export interface GuardPluginConfig {}

export interface GuardPluginContext extends Omit<EnhanceAppContext, 'siteData'> { siteData: Ref<SiteData<GuardPluginConfig>> }

export interface GuardPlugin<T = string, U extends unknown[] = []> { (ctx: GuardPluginContext, to?: string, ...args: U): T }

export const guardPlugins: Record<'beforeRouteChange', Record<string, GuardPlugin>> = { beforeRouteChange: {} }

export const beforeRouteChangeGuard: GuardPlugin<boolean> = (
  ctx, to = ''
) => {
  let newTo = to

  try {
    for (const plugin of Object.values(guardPlugins.beforeRouteChange)) {
      newTo = plugin(
        ctx, newTo
      )
    }

    if (to === newTo) return true

    void ctx.router.go(newTo)

    return false
  } catch {
    return false
  }
}
