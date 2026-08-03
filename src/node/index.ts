import type { UserConfig } from 'vitepress'
import {
  applyConfigPlugins, type ThemeConfig
} from './config'

export const defineConfig = (config: UserConfig<ThemeConfig>): UserConfig<ThemeConfig> => {
  const ctx = {}

  applyConfigPlugins(
    config, ctx
  )

  return config
}
