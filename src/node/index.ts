import type { UserConfig } from 'vitepress'
import {
  configPlugins, type ThemeConfig
} from './config'

export const defineConfig = (config: UserConfig<ThemeConfig>): UserConfig<ThemeConfig> => {
  const ctx = {}

  for (const plugin of Object.values(configPlugins)) {
    plugin(
      config,
      ctx
    )
  }

  return config
}
