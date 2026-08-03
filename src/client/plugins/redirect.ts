import { inBrowser } from 'vitepress'
import {
  addGuard, type GuardPlugin
} from '..'

export interface RedirectPluginConfig {
  useRedirect: boolean
  autoRedirectToFirstChild: boolean
}

export const redirectPlugin: GuardPlugin = (ctx) => {
  addGuard(
    ctx, 'onAfterRouteChange', async (to) => {
      if (!inBrowser) return

      // useRedirect
      const redirect = ctx.router.route.data.frontmatter.redirect as unknown

      if (ctx.siteData.value.themeConfig.useRedirect && typeof redirect === 'string') {
        await ctx.router.go(
          redirect, { replace: true }
        )

        return
      }

      // autoRedirectToFirstChild
      const order = ctx.router.route.data.frontmatter.order as unknown

      if (ctx.router.route.data.frontmatter.layout === 'dir' && ctx.siteData.value.themeConfig.autoRedirectToFirstChild && Array.isArray(order) && typeof order[0] === 'string') {
        await ctx.router.go(
          `${to.replace(
            /(?<=.)\/+$/, ''
          )}/${order[0]}`, { replace: true }
        )

        return
      }
    }
  )
}
