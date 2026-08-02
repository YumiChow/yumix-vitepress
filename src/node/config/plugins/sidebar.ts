import type { DefaultTheme } from 'vitepress'
import nodePath from 'node:path'
import type { ConfigPlugin } from '..'
import type { FileTree } from './file'

export interface SidebarPluginConfig { autoSidebar: boolean }

export interface SidebarFrontmatter extends Pick<DefaultTheme.SidebarItem, 'collapsed' | 'text'> {
  /**
   * Whether to use this node as the root of the sidebar tree.
   *
   * - `true`: Use this node as the root node of the sidebar for itself and all descendant nodes.
   * @default false
   */
  root?: boolean
  /**
   * Specify the names of the child nodes to display in the sidebar tree of all their ancestor root nodes.
   *
   * - `string[]`: Only specific child nodes are displayed in order. To display the remaining child nodes after the specified child nodes, please add `"..."` to the end of `string[]`.
   * - `true`: Display all child nodes.
   * - `false`: Hide all child nodes.
   * @default true
   */
  children?: string[] | boolean
}

export const autoSidebar: ConfigPlugin = (
  config, ctx
) => {
  if (config.themeConfig?.autoSidebar !== true || !ctx?.fileTree) return

  const sidebarConfig: DefaultTheme.SidebarMulti = {}

  // File tree traversal
  const traverse = (node: FileTree): DefaultTheme.SidebarItem => {
    const sidebar: DefaultTheme.SidebarItem = {
      text: node.file?.data.sidebarConfig?.text ?? node.file?.data.title ?? nodePath.basename(node.url),
      link: node.url,
      collapsed: node.file?.data.sidebarConfig?.collapsed,
      items: node.file?.data.sidebarConfig?.children === false ? [] : node.children.map(e => traverse(e))
    }

    const children = node.file?.data.sidebarConfig?.children

    if (Array.isArray(children)) {
      // Sort by children config
      sidebar.items = sidebar.items?.sort((
        a, b
      ) => {
        const nameA = nodePath.basename(a.link ?? '')
        const nameB = nodePath.basename(b.link ?? '')

        if (children.includes(nameA) && children.includes(nameB)) {
          return children.indexOf(nameA) - children.indexOf(nameB)
        } else {
          return children.includes(nameA) ? -1 : 1
        }
      })

      // Filter by children config
      if (!children.includes('...')) {
        sidebar.items = sidebar.items?.filter(e => children.includes(nodePath.basename(e.link ?? '')))
      }
    }

    if (node.file?.data.sidebarConfig?.root) {
      Object.assign(
        sidebarConfig, { [node.url]: sidebar }
      )
    }

    return sidebar
  }

  return traverse(ctx.fileTree)
}
