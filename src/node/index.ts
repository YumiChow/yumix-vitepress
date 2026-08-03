import type {
  DefaultTheme, UserConfig
} from 'vitepress'
import {
  type FileTree, type FilePluginConfig, filePlugin
} from './plugins/file'
import type { MarkdownPluginConfig } from './plugins/markdown'
import {
  navigationPlugin, type NavigationPluginConfig
} from './plugins/navigation'
import type { GuardPluginConfig } from '../client'

export interface ConfigPluginConfig extends MarkdownPluginConfig, FilePluginConfig, NavigationPluginConfig {}

export interface ThemeConfig extends DefaultTheme.Config, ConfigPluginConfig, GuardPluginConfig {}

export interface ConfigPluginContext {
  fileTree?: FileTree
  fileTreeMap?: Record<string, FileTree>
}

export interface ConfigPlugin { (config: UserConfig<ThemeConfig>, ctx: ConfigPluginContext): void }

export interface ConfigWorker<T = void, U extends unknown[] = []> { (config: UserConfig<ThemeConfig>, ctx: ConfigPluginContext, ...args: U): T }

export const configPlugins: Record<string, ConfigPlugin> = {
  filePlugin,
  navigationPlugin
}

export const defineConfig = (config: UserConfig<ThemeConfig>): UserConfig<ThemeConfig> => {
  const ctx = {}

  Object.values(configPlugins)
    .forEach(e => e(
      config, ctx
    ))

  return config
}
