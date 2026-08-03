import type {
  DefaultTheme, HeadConfig, UserConfig
} from 'vitepress'
import nodePath from 'node:path'
import grayMatter from 'gray-matter'
import type { ConfigPlugin } from '..'
import type { NavigationFrontmatter } from './navigation'

export interface MarkdownPluginConfig { fallbackTitle: 'h1' | false }

/**
 * Hero Section Frontmatter of VitePress default theme
 * @see https://vitepress.dev/reference/default-theme-home-page#hero-section
 */
export interface HeroFrontmatter {
  /**
   * The string shown top of `text`. Comes with brand color and expected to be short, such as product name.
   */
  name?: string
  /**
   * The main text for the hero section. This will be defined as `h1` tag.
   */
  text: string

  /**
   *  Tagline displayed below `text`.
   */
  tagline?: string

  /**
   * The image is displayed next to the text and tagline area.
   */
  image?: DefaultTheme.ThemeableImage

  /**
   * Action buttons to display in home hero section.
   */
  actions?: {
    /**
     * Color theme of the button. Defaults to `brand`.
     */
    theme?: 'brand' | 'alt'

    /**
     * Label of the button.
     */
    text: string

    /**
     * Destination link of the button.
     */
    link: string

    /**
     * Link target attribute.
     */
    target?: string

    /**
     * Link rel attribute.
     */
    rel?: string
  }[]
}

/**
 * Features Section Frontmatter of VitePress default theme
 * @see https://vitepress.dev/reference/default-theme-home-page#features-section
 */
export interface FeatureFrontmatter {
  /**
   * Show icon on each feature box.
   */
  icon?: DefaultTheme.FeatureIcon

  /**
   * Title of the feature.
   */
  title: string

  /**
   * Details of the feature.
   */
  details: string

  /**
   * Link when clicked on feature component. The link can be both internal or external.
   * @example `guide/reference/default-theme-home-page` | `https://example.com`
   */
  link?: string

  /**
   * Link text to be shown inside feature component. Best used with `link` option.
   * @example `Learn more` | `Visit page`
   */
  linkText?: string

  /**
   * Link rel attribute for the `link` option.
   * @example `external`
   */
  rel?: string

  /**
   * Link target attribute for the `link` option.
   */
  target?: string
}

/**
 * Frontmatter of VitePress default theme
 * @see https://vitepress.dev/reference/frontmatter-config
 */
export interface DefaultThemeFrontmatter {
  layout?: 'doc' | 'home' | 'page'
  hero?: HeroFrontmatter
  features?: FeatureFrontmatter
  navbar?: boolean
  sidebar?: boolean
  aside?: DefaultTheme.Config['aside']
  outline?: DefaultTheme.Outline['level']
  lastUpdated?: boolean | Date
  editLink?: string
  footer?: boolean
  pageClass?: string
  isHome?: boolean
}

export interface DefaultFrontmatter extends DefaultThemeFrontmatter {
  /**
   * Title for the page. It's the same as {@link UserConfig.title}, and it overrides the site-level config.
   * @see https://vitepress.dev/reference/frontmatter-config#title
   */
  title?: string
  /**
   * The suffix for the title. It's the same as {@link UserConfig.titleTemplate}, and it overrides the site-level config.
   * @see https://vitepress.dev/reference/frontmatter-config#titletemplate
   */
  titleTemplate?: string | boolean
  /**
   * Description for the page. It's the same as {@link UserConfig.description}, and it overrides the site-level config.
   * @see https://vitepress.dev/reference/frontmatter-config#description
   */
  description?: string
  /**
   * Specify extra head tags to be injected for the current page. Will be appended after head tags injected by site-level config.
   * @see https://vitepress.dev/reference/frontmatter-config#title
   */
  head?: HeadConfig[]
}

/**
 * Frontmatter
 */
export interface Frontmatter extends DefaultFrontmatter, NavigationFrontmatter {
  /**
   * Permalink
   */
  permalink?: string

  /**
   * Slug
   */
  slug?: string
}

export interface MarkdownFile extends Omit<grayMatter.GrayMatterFile<string>, 'data'> { data: Frontmatter }

export const readMarkdownFile: ConfigPlugin<MarkdownFile | null, [string]> = (
  config, _ctx, path: string
) => {
  if (nodePath.extname(path) !== '.md') return null
  try {
    const file: MarkdownFile = grayMatter.read(path)

    if (config.themeConfig?.fallbackTitle === 'h1' && typeof file.data.title !== 'string') {
      const h1 = file.content.match(/^#\s+(.+)$/m)

      if (h1 && h1[1]) {
        file.data.title = h1[1].trim()
      }
    }

    return file
  } catch {
    return null
  }
}
