export interface NavbarPluginConfig { autoNavbar: boolean }

export interface NavbarFrontmatter {
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
