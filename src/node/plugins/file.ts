import nodeFs from 'node:fs'
import nodePath from 'node:path'
import picomatch from 'picomatch'
import type { UserConfig } from 'vitepress'
import {
  readMarkdownFile, type MarkdownFile
} from './markdown'
import type { ConfigPlugin } from '..'

export interface FilePluginConfig {
  useSlug: boolean
  usePermalink: boolean
}

export interface FileFrontmatter {
  /**
   * Slug
   */
  layout?: 'doc' | 'home' | 'page' | 'dir'
  /**
   * Permalink
   */
  permalink?: string
  /**
   * Slug
   */
  slug?: string
  /**
   * Specify the names of the child nodes to display in the sidebar tree of all their ancestor root nodes.
   *
   * - `string[]`: Only specific child nodes are displayed in order. To display the remaining child nodes after the specified child nodes, please add `"..."` to the end of `string[]`.
   * - `true`: Display all child nodes.
   * - `false`: Hide all child nodes.
   * @default true
   */
  order?: string[] | boolean
}

export interface FileTree {
  path: string
  url: string
  file: MarkdownFile | null
  children: FileTree[]
}

export const filePlugin: ConfigPlugin = (
  config, ctx = {}
) => {
  const srcDir = config.srcDir ?? 'docs'
  const srcExclude = config.srcExclude ?? []
  const rewrites: UserConfig['rewrites'] = {}

  ctx.fileTreeMap = {}

  const scanDir = (
    path: string, url: string
  ): FileTree | undefined => {
  // Apply srcExclude
    if (picomatch(srcExclude)(path)) return undefined

    // Read file
    const file = readMarkdownFile(
      config, ctx, nodePath.join(
        srcDir,
        path.endsWith('.md')
          ? path
          : `${path}.md`
      )
    )

    if (path.endsWith('.md') && !file) return undefined

    const node: FileTree = {
      path,
      url,
      file,
      children: []
    }

    const urlSafe = /^(?!\.\.$)[a-zA-Z0-9\_\-\.\/]+$/

    // Apply slug
    if (config.themeConfig?.useSlug) {
      const slug = file?.data.slug?.trim()

      if (slug && urlSafe.test(slug)) {
        node.url = url = nodePath.posix.join(
          nodePath.posix.dirname(url), slug
        )
          .replace(
            /(?<=.)\/+$/, ''
          )
        // Rewrites
        Object.assign(
          rewrites, {
            [path.endsWith('.md')
              ? path
              : `${path}.md`
            ]: nodePath.posix.join(
              url, 'index.md'
            )
          }
        )
      }
    }

    // Apply permalink
    if (config.themeConfig?.usePermalink) {
      const permalink = file?.data.permalink?.trim()

      if (permalink && urlSafe.test(permalink)) {
        // Rewrites
        Object.assign(
          rewrites, {
            [path.endsWith('.md')
              ? path
              : `${path}.md`
            ]: nodePath.posix.join(
              permalink, 'index.md'
            )
          }
        )
      }
    }

    // Directory traversal
    if (!path.endsWith('.md')) {
      const entries = nodeFs.readdirSync(nodePath.join(
        srcDir,
        path
      ))

      entries.filter(e => (e.endsWith('.md')
        ? !entries.includes(nodePath.basename(
            e, nodePath.extname(e)
          ))
        : true))
        .forEach((e) => {
          const child = scanDir(
            nodePath.posix.join(
              path, e
            ), nodePath.posix.join(
              url, nodePath.basename(
                e, nodePath.extname(e)
              )
            )
          )

          if (child) node.children.push(child)
        })
    }
    Object.assign(
      ctx.fileTreeMap ?? {}, { [url]: node }
    )

    return node
  }

  ctx.fileTree = scanDir(
    '.', '.'
  )
  config.rewrites = {
    ...config.rewrites,
    ...rewrites
  }

  const transformPageData = config.transformPageData

  config.transformPageData = (
    pageData, context
  ) => {
    const children = pageData.frontmatter.order as string[] ?? []

    pageData.frontmatter.order = (ctx.fileTreeMap ?? {})[nodePath.dirname(pageData.relativePath)
    ].children.map(e => nodePath.basename(
      e.url, nodePath.extname(e.url)
    ))
      .sort((
        a, b
      ) => {
        if (children.includes(a) && children.includes(b)) {
          return children.indexOf(a) - children.indexOf(b)
        } else {
          return children.includes(a) ? -1 : 1
        }
      })

    if (transformPageData) transformPageData(
      pageData, context
    )
  }
}
