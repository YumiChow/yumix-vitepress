import type {
  DefaultTheme, UserConfig
} from 'vitepress'
import type { GuardPluginConfig } from '../guard'
import {
  type FileTree, type FilePluginConfig,
  createFileTree
} from './plugins/file'
import type { MarkdownPluginConfig } from './plugins/markdown'
import {
  autoSidebar, type SidebarPluginConfig
} from './plugins/sidebar'

export interface ConfigPluginConfig extends MarkdownPluginConfig, FilePluginConfig, SidebarPluginConfig {}

export interface ThemeConfig extends DefaultTheme.Config, ConfigPluginConfig, GuardPluginConfig {}

export interface ConfigPluginContext { fileTree?: FileTree }

export interface ConfigPlugin<T = void, U extends unknown[] = unknown[]> { (config: UserConfig<ThemeConfig>, ctx?: ConfigPluginContext, ...args: U): T }

export const configPlugins: Record<string, ConfigPlugin> = {
  createFileTree,
  autoSidebar
}
