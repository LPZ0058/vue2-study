import { Component } from "../../types/component"

export default class VNode {
  // 节点的名称，如：p、div、ul、li等
  tag?: string
  // 节点的数据(属性的的对象)，如：style、class、attrs
  data: Record<string, any> | undefined
  // 子节点列表
  children?: Array<VNode> | null
  // 节点文本（只有文本节点和注释节点才有，和children是互斥的）
  text?: string
  // 该vnode对应的真实的节点
  elm: Node | undefined
  // 当前的Vue组件实例
  context?:Component
  // 对应的key
  key:string | number | undefined
  // 是否为静态节点
  isStatic: boolean

    // ----------------------------相关内容先放着---------------

  /**
   * 组件节点专属：componentOptions 和 componentInstance
   */
  // 当前主键节点的选项(是组件节点才有的),如：propsData,tag,children
  componentOptions?: Record<string,any>
  // 当前主键节点的实例(是组件节点才有的),在模板中，主键节点都是一个vue实例
  componentInstance?: Component

  /**
   * 函数式节点专属: fnContext 和 fnOptions
   */
  fnContext: Component | void
  fnOptions?: Record<string,any> | null

  /**
   * 异步组件相关
   */
  // asyncFactory?: Function // async component factory function
  // asyncMeta: Object | void
  // // 表示当前vnode是异步组件的占位符
  // isAsyncPlaceholder: boolean

    // -------------------------------------------------------

  // 父VNode
  parent: VNode | undefined | null
  // 是否为注释节点
  isComment: boolean
  // 是否为克隆节点
  isCloned: boolean
  constructor(
    tag?: string,
    data?: Record<string, any>,
    children?: Array<VNode> | null,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: Record<string,any>,

  ){
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context
    this.key = data && data.key
    this.isComment = false
    this.parent = undefined
    this.isCloned = false
    this.isStatic = false

    this.componentOptions = componentOptions
    this.componentInstance = undefined

    this.fnContext = undefined
    this.fnOptions = undefined
  }
}


/**
 * 创建注释节点
 * 注释节点的是有text属性，且isComment为true
 */
export const createEmptyVNode = (text = '') => {
  const node = new VNode(undefined,undefined,undefined,text,undefined,undefined)
  node.isComment = true
  return node
}
/**
 * 创建文本节点
 */
export function createTextVNode(val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

/**
 * 创建克隆节点
 * 用于提升性能，如:
 *  1. 在patchNode中 如果知道是同个clone节点，那么直接就退出了
 * @param vnode
 * @returns
 */
export function cloneVNode(vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
  )
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.isCloned = true
  return cloned
}
