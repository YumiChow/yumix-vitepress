import type {
  DefaultTheme, UserConfig
} from 'vitepress'
import {
  type FileTree, type FilePluginConfig,
  createFileTree
} from './plugins/file'
import type { MarkdownPluginConfig } from './plugins/markdown'
import {
  autoNavbar,
  autoSidebar, type NavigationPluginConfig
} from './plugins/navigation'
import type { GuardPluginConfig } from '../../client/guard'

export interface ConfigPluginConfig extends MarkdownPluginConfig, FilePluginConfig, NavigationPluginConfig {}

export interface ThemeConfig extends DefaultTheme.Config, ConfigPluginConfig, GuardPluginConfig {}

export interface ConfigPluginContext {
  fileTree?: FileTree
  fileTreeMap?: Record<string, FileTree>
}

export interface ConfigPlugin<T = void, U extends unknown[] = unknown[]> { (config: UserConfig<ThemeConfig>, ctx?: ConfigPluginContext, ...args: U): T }

export const configPlugins: Record<string, ConfigPlugin> = {
  createFileTree,
  autoSidebar,
  autoNavbar
}

export const applyConfigPlugins: ConfigPlugin = (
  config, ctx
) => {
  for (const plugin of Object.values(configPlugins)) {
    plugin(
      config,
      ctx
    )
  }
}
