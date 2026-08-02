<template>
  <DefaultTheme.Layout />
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'

// const autoRedirectToChild = () => {
//   const {
//     site, page
//   } = useData()
//   const router = useRouter()

//   if (page.value.isNotFound || page.value.relativePath.endsWith('/index.md')) {
//     const base = page.value.relativePath.replace(
//       /(?:\/index)?\.md$/, ''
//     )

//     if (Array.isArray(page.value.frontmatter.order)) {
//       for (const child of page.value.frontmatter.order) {
//         if (typeof child === 'string') {
//           router.go(page.value.relativePath.replace(
//             /\/index\.md$/, `/${child}`
//           ))

//           return
//         }
//       }
//     }

//     const str = JSON.stringify(site.value.themeConfig.sidebar)
//     const idx = str.indexOf(`"base":"/${base}/"`)

//     if (idx == -1) return

//     const getLink = (item: AutoConfigItem): string | null => {
//       if (!item || !Array.isArray(item.items)) return null
//       for (const child of item.items) {
//         if (child.link) return `${item.base}${child.link}`

//         const link = getLink(child)

//         if (link) return link
//       }

//       return null
//     }
//     let start = str.lastIndexOf(
//       '{', idx
//     )
//     let dep = 0
//     let end = start

//     for (let i = start; i < str.length; i++) {
//       if (str[i] === '}' && --dep === 0) {
//         end = i
//         break
//       }
//       if (str[i] === '{') ++dep
//     }

//     const link = getLink(JSON.parse(str.slice(
//       start, end + 1
//     )))

//     if (link) router.go(link)
//   }
// }

</script>
