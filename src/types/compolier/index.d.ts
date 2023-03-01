
export interface CompilerOptions {

  warn?: Function // allow customizing warning in different environments; e.g. node
  // modules?: Array<ModuleOptions> // platform specific modules; e.g. style; class
  directives?: { [key: string]: Function } // platform specific directives
  staticKeys?: string // a list of AST properties to be considered static; for optimization
  isUnaryTag?: (tag: string) => boolean | undefined // check if a tag is unary for the platform
  canBeLeftOpenTag?: (tag: string) => boolean | undefined // check if a tag can be left opened
  isReservedTag?: (tag: string) => boolean | undefined // check if a tag is a native for the platform
  preserveWhitespace?: boolean // preserve whitespace between elements? (Deprecated)
  whitespace?: 'preserve' | 'condense' // whitespace handling strategy
  optimize?: boolean // optimize static content?

  // web specific
  mustUseProp?: (tag: string, type: string | null, name: string) => boolean // check if an attribute should be bound as a property
  isPreTag?: (attr: string) => boolean | null // check if a tag needs to preserve whitespace
  getTagNamespace?: (tag: string) => string | undefined // check the namespace for a tag
  expectHTML?: boolean // only false for non-web builds
  isFromDOM?: boolean
  shouldDecodeTags?: boolean
  // 是否对属性值中的换行符或制表符做兼容处理
  shouldDecodeNewlines?: boolean
  // 是否对a标签的 href 属性值中的换行符或制表符做兼容处理
  shouldDecodeNewlinesForHref?: boolean
  outputSourceRange?: boolean
    // 是否保留注释
  shouldKeepComment?: boolean

  // runtime user-configurable
  delimiters?: [string, string] // template delimiters
  comments?: boolean // preserve comments in template

  // for ssr optimization compiler
  scopeId?: string

}

export type ASTAttr = {
  name: string,
  value: any,
}

export type ASTModifiers = { [key: string]: boolean }
export type ASTIfCondition = { exp: string | null; block: ASTElement }
export type ASTIfConditions = Array<ASTIfCondition>


export type ASTElementHandler = {
  value: string
  params?: Array<any>
  modifiers: ASTModifiers | null
  dynamic?: boolean
  start?: number
  end?: number
}

export type ASTNode = ASTElement | ASTText | ASTExpression

export type ASTElementHandlers = {
  [key: string]: ASTElementHandler | Array<ASTElementHandler>
}

export type ASTElement = {
  type: 1
  tag: string
  attrsList: Array<ASTAttr>
  attrsMap: { [key: string]: any }
  rawAttrsMap: { [key: string]: ASTAttr }
  parent: ASTElement | void
  children: Array<ASTNode>

  start?: number
  end?: number

  processed?: true

  static?: boolean
  staticRoot?: boolean
  staticInFor?: boolean
  staticProcessed?: boolean
  hasBindings?: boolean

  text?: string
  attrs?: Array<ASTAttr>
  dynamicAttrs?: Array<ASTAttr>
  props?: Array<ASTAttr>
  plain?: boolean
  pre?: true
  ns?: string

  component?: string
  inlineTemplate?: true
  transitionMode?: string | null
  slotName?: string | null
  slotTarget?: string | null
  slotTargetDynamic?: boolean
  slotScope?: string | null
  scopedSlots?: { [name: string]: ASTElement }

  ref?: string
  refInFor?: boolean

  if?: string
  ifProcessed?: boolean
  elseif?: string
  else?: true
  ifConditions?: ASTIfConditions

  for?: string
  forProcessed?: boolean
  key?: string
  alias?: string
  iterator1?: string
  iterator2?: string

  staticClass?: string
  classBinding?: string
  staticStyle?: string
  styleBinding?: string
  events?: ASTElementHandlers
  nativeEvents?: ASTElementHandlers

  transition?: string | true
  transitionOnAppear?: boolean

  model?: {
    value: string
    callback: string
    expression: string
  }

  directives?: Array<ASTDirective>

  forbidden?: true
  once?: true
  onceProcessed?: boolean
  wrapData?: (code: string) => string
  wrapListeners?: (code: string) => string

  // 2.4 ssr optimization
  ssrOptimizability?: number
}

export type ASTDirective = {
  name: string
  rawName: string
  value: string
  arg: string | null
  isDynamicArg: boolean
  modifiers: ASTModifiers | null
  start?: number
  end?: number
}

export type ASTExpression = {
  type: 2
  expression: string
  text: string
  tokens: Array<string | Object>
  static?: boolean
  // 2.4 ssr optimization
  ssrOptimizability?: number
  start?: number
  end?: number
}

export type ASTText = {
  type: 3
  text: string
  static?: boolean
  isComment?: boolean
  // 2.4 ssr optimization
  ssrOptimizability?: number
  start?: number
  end?: number
}
