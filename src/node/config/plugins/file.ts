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

export interface FileTree {
  path: string
  url: string
  file: MarkdownFile | null
  children: FileTree[]
}

export const createFileTree: ConfigPlugin = (
  config, ctx = {}
) => {
  const srcDir = config.srcDir ?? 'docs'
  const srcExclude = config.srcExclude ?? []
  const rewrites: UserConfig['rewrites'] = {}

  const scanDir = (
    path: string, url: string
  ): FileTree | undefined => {
  // Apply srcExclude
    if (picomatch(srcExclude)(path)) return undefined

    const stats = nodeFs.statSync(nodePath.join(
      srcDir, path
    ))

    if (!stats.isFile() && !stats.isDirectory()) return undefined

    // Read file
    const file = readMarkdownFile(
      config, ctx, nodePath.join(
        srcDir,
        path,
        stats.isFile() ? '' : 'index.md'
      )
    )

    if (stats.isFile() && !file) return undefined

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
        url = nodePath.posix.join(
          nodePath.posix.dirname(url), slug
        )
          .replace(
            /(?<=.)\/+$/, ''
          )
        // Rewrites
        if (stats.isFile()) {
          Object.assign(
            rewrites, {
              [path]: nodePath.posix.join(
                url, 'index.md'
              )
            }
          )
        }
      }
    }

    // Apply permalink
    if (config.themeConfig?.usePermalink) {
      const permalink = file?.data.permalink?.trim()

      if (permalink && urlSafe.test(permalink)) {
        // Rewrites
        if (stats.isFile()) {
          Object.assign(
            rewrites, {
              [path]: nodePath.posix.join(
                permalink, 'index.md'
              )
            }
          )
        }
      }
    }

    // Directory traversal
    if (stats.isDirectory()) {
      const entries = nodeFs.readdirSync(nodePath.join(
        srcDir,
        path
      ))

      entries.forEach((e) => {
        if (e === 'index.md') return

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

    return node
  }

  ctx.fileTree = scanDir(
    '.', '.'
  )
  config.srcExclude = [
    ...config.srcExclude ?? [],
    '**/index.md'
  ]
  config.rewrites = {
    ...config.rewrites,
    ...rewrites
  }
}
