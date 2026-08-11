import type {
  EnhanceAppContext, SiteData, Theme
} from 'vitepress'
import Layout from './AppLayout.vue'
import './style.css'
import {
  redirectPlugin, type RedirectPluginConfig
} from './plugins/redirect'
import type { Ref } from 'vue'

export const addGuard = <K extends 'onAfterPageLoad' | 'onAfterRouteChange' | 'onBeforePageLoad' | 'onBeforeRouteChange'>(
  ctx: GuardPluginContext, event: K, func: Exclude<GuardPluginContext['router'][K], undefined>
): void => {
  const e = ctx.router[event]

  ctx.router[event] = (async (to) => {
    let res: boolean | void

    if (e) {
      res = await e(to)
      if (res === false) {
        if ([
          'onBeforePageLoad',
          'onBeforeRouteChange'
        ].includes(event)) {
          return false
        }

        return
      }
    }

    return await func(to)
  }) as GuardPluginContext['router'][K]
}

export interface GuardPluginConfig extends RedirectPluginConfig {}

export interface GuardPluginContext extends Omit<EnhanceAppContext, 'siteData'> { siteData: Ref<SiteData<GuardPluginConfig>> }

export interface GuardPlugin { (ctx: GuardPluginContext): void }

export interface GuardWorker<T = string, U extends unknown[] = []> { (ctx: GuardPluginContext, to: string, ...args: U): T }

export const guardPlugins: Record<string, GuardPlugin> = { redirectPlugin }

export const theme: Theme = {
  Layout,
  enhanceApp: (ctx: GuardPluginContext) => {
    Object.values(guardPlugins)
      .forEach(e => e(ctx))
  }
}
