import type { DefaultTheme } from 'vitepress'
import nodePath from 'node:path'
import type { ConfigPlugin } from '..'
import type { FileTree } from './file'

export interface NavigationPluginConfig {
  autoSidebar: AutoNavigationConfig[]
  autoNavbar: Record<string, AutoNavigationConfig[]>
}

export interface NavigationFrontmatter {
  /**
   * Specify the names of the child nodes to display in the sidebar tree of all their ancestor root nodes.
   *
   * - `string[]`: Only specific child nodes are displayed in order. To display the remaining child nodes after the specified child nodes, please add `"..."` to the end of `string[]`.
   * - `true`: Display all child nodes.
   * - `false`: Hide all child nodes.
   * @default true
   */
  order?: string[] | boolean
  name?: string
  collapsed?: boolean
}

export interface AutoNavigationConfig {
  /**
   * The root link to generate the sidebar and navbar.
   */
  link: string
  /**
   * How many levels will be generated in the sidebar and navbar.
   */
  deep: number
}

export const generateSidebar: ConfigPlugin<DefaultTheme.SidebarItem | null, [url: string, deep: number]> = (
  _config, ctx, url: string, deep: number
) => {
  const traverse = (
    node: FileTree, traverseDeep: number
  ): DefaultTheme.SidebarItem => {
    const sidebar: DefaultTheme.SidebarItem = {
      text: node.file?.data.name ?? node.file?.data.title ?? nodePath.basename(node.url),
      link: node.isPage ? node.url : undefined,
      collapsed: node.file?.data.collapsed ?? false,
      items: []
    }

    const children = node.file?.data.order

    if (node.isPage || children === false || traverseDeep <= 1) return sidebar

    for (const child of node.children) {
      const childName = nodePath.basename(child.url)

      // Filter by children config
      if (!Array.isArray(children) || children.includes(childName) || children.includes('...')) sidebar.items?.push(traverse(
        child, traverseDeep - 1
      ))
    }
    // Sort by children config
    if (Array.isArray(children)) {
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
    }

    return sidebar
  }

  if (!ctx?.fileTreeMap?.[url]) return null

  return traverse(
    ctx.fileTreeMap[url], deep
  )
}

export const autoSidebar: ConfigPlugin = (
  config, ctx
) => {
  if (!Array.isArray(config.themeConfig?.autoSidebar) || !ctx?.fileTreeMap) return

  const sidebarConfig: DefaultTheme.SidebarMulti = {}

  // File tree traversal
  for (const {
    link, deep
  } of config.themeConfig.autoSidebar) {
    const sidebar = generateSidebar(
      config,
      ctx,
      link
        .replace(
          /^\/+|\/+$/g, ''
        )
        .replace(
          /^$/g, '.'
        ),
      deep
    )

    if (!sidebar) continue

    Object.assign(
      sidebarConfig, {
        [link.replace(
          /^\/*(.*?)\/*$/, '/$1/'
        )]: sidebar
      }
    )
  }
  config.themeConfig.sidebar = sidebarConfig
}

export const generateNavbar: ConfigPlugin<DefaultTheme.NavItemWithChildren | DefaultTheme.NavItemChildren | DefaultTheme.NavItemWithLink | null, [url: string, deep: 1 | 2 | 3]> = (
  _config, ctx, url: string, deep: 1 | 2 | 3
) => {
  const traverse = (
    node: FileTree, traverseDeep: 1 | 2 | 3
  ): DefaultTheme.NavItemWithChildren | DefaultTheme.NavItemChildren | DefaultTheme.NavItemWithLink => {
    const children = node.file?.data.order

    if (node.isPage || children === false || traverseDeep < 1) traverseDeep = 1

    const items: (DefaultTheme.NavItemChildren | DefaultTheme.NavItemWithLink)[] = []

    if (traverseDeep > 1) {
      if (Array.isArray(children)) {
        // Sort by children config
        for (const childName of children) {
          const child = node.children.find(e => nodePath.basename(e.url) === childName)

          if (!child) continue
          items?.push(traverse(
            child, traverseDeep - 1 as 1 | 2 | 3
          ) as DefaultTheme.NavItemChildren | DefaultTheme.NavItemWithLink)
        }
      }

      // Filter by children config
      if (!children || (Array.isArray(children) && children.includes('...'))) {
        for (const child of node.children) {
          const childName = nodePath.basename(child.url)

          if (Array.isArray(children) && children.includes(childName)) continue
          items?.push(traverse(
            child, traverseDeep - 1 as 1 | 2 | 3
          ) as DefaultTheme.NavItemChildren | DefaultTheme.NavItemWithLink)
        }
      }
    }
    switch (traverseDeep) {
      case 1:
        return {
          text: node.file?.data.name ?? node.file?.data.title ?? nodePath.basename(node.url),
          link: node.url
        }
      case 2:
        return {
          text: node.file?.data.name ?? node.file?.data.title ?? nodePath.basename(node.url),
          items
        }
      case 3:
        return {
          text: node.file?.data.name ?? node.file?.data.title ?? nodePath.basename(node.url),
          items,
          activeMatch: node.url
        }
    }
  }

  if (!ctx?.fileTreeMap?.[url]) return null

  return traverse(
    ctx.fileTreeMap[url], deep
  )
}

export const autoNavbar: ConfigPlugin = (
  config, ctx
) => {
  if (!config.themeConfig?.autoNavbar || !ctx?.fileTreeMap || !config.locales) return

  // File tree traversal
  for (const [
    lang,
    items
  ] of Object.entries(config.themeConfig.autoNavbar as Record<string, AutoNavigationConfig[]>)) {
    if (Object.keys(config.locales ?? {})
      .includes(lang)) {
      for (const {
        link, deep
      } of items) {
        const navbar = generateNavbar(
          config,
          ctx,
          link
            .replace(
              /^\/+|\/+$/g, ''
            )
            .replace(
              /^$/g, '.'
            ),
          deep as 1 | 2 | 3
        )

        if (!navbar) continue
        config.locales[lang].themeConfig = {
          ...config.locales[lang].themeConfig ?? [],
          nav: [
            ...config.locales[lang].themeConfig?.nav ?? [],
            navbar
          ]
        }
      }
    }
  }
}
