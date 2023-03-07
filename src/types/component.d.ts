import VNode from "core/vdom/vnode"
import Watcher from "src/core/observer/watcher"
import { $WeatchOptions } from "./component/index"
import { ComponentOptions } from "./options"

// import { $WeatchOptions } from "./component"

/**
 * Component
 */
export declare class  Component {
  constructor(option: any)

  // 指向当前vm实例
  _self: Component

  // 是否为Vue实例
  _isVue: true

  $data: Record<string, any>
  // the placeholder node for the component in parent's render tree
  $vnode: VNode
  // public methods
  $mount: (
    el?: Element | string,
    hydrating?: boolean
  ) => Component & { [key: string]: any }
  $watch: (
    expOrFn: string | (() => any),
    callback: Function,
    options?:$WeatchOptions
  ) => Function

  $set: <T>(
    target: Array<T> | Record<string,any>,
    key: number|string,
    value: T) => T

  $delete: <T>(
    target: Array<T> | Record<string, any>,
    key: number | string
  ) => void

  $forceUpdate: () => void
  $destroy: () => void

  $on: (event: string | Array<string>, fn: Function) => Component

  $once: (event: string, fn: Function) => Component

  $off: (event?: string | Array<string>, fn?: Function) => Component

  $emit: (event: string, ...args: Array<any>) => Component

  $nextTick: (fn: (...args: any[]) => any) => void | Promise<any>

  // Vue 实例使用的根 DOM 元素，就是当前Vue实例要挂载到的地方
  $el: any

  $options: ComponentOptions
  // 用于自定义子组件中，指向第一个非抽象父组件的实例（keeplive是抽象父组件）
  $parent: Component | undefined
  // 指向根vm实例
  $root: Component
  $children: Array<Component>
  // 记录持有注册过 ref attribute 的所有 DOM 元素和组件实例的对象
  $refs: {
    [key: string]: Component | Element | Array<Component | Element> | undefined
  }
  // 私有属性
  _uid: number | string

  // 被observe的存储data数据的对象;实际上访问vm.data名字时会通过代理访问
  _data: Record<string, any>
  // 表示keep-alive中组件状态，如被激活，该值为false,反之为true
  _inactive: boolean | null

  // 记录计算属性的Watcher
  _computedWatchers: { [key: string]: Watcher }

  _init: Function
  // 当前组件的vnode
  _vnode?: VNode | null // self root node

  // 传入新的VNode，和旧的VNode进行对比，然后更新DOM
  _update: (vnode: VNode, hydrating?: boolean) => void

  // 渲染函数，调用后会返回VNode
  _render: () => VNode

  _isMounted: boolean

  /**
   * vm._events是维护事件和对应回调的对象，key是事件名，value是对应回调函数的数组
   */
  _events: Record<string, any>

  /**
   * 这个属性就是vue对应视图渲染的watcher（组件级别）
   */
  _watcher: Watcher | null
  /**
   * 这个属性就是vue实现的全部watcher，包括：1. 主键渲染的vm._watcher 2. vm.$watcher创建的watcher
   */
  _watchers: Array<Watcher>
  // 标记是否已经被$destroy销毁
  _isDestroyed: boolean
  // 是否正在销毁，主要是为了防止$destroy方法的反复执行
  _isBeingDestroyed: boolean


  __patch__: (
    a: Element | VNode | void | null,
    b: VNode | null,
    hydrating?: boolean,
    removeOnly?: boolean,
    parentElm?: any,
    refElm?: any
  ) => any

  // createElement

  // _c is internal that accepts `normalizationType` optimization hint
  // _c: (
  //   vnode?: VNode,
  //   data?: VNodeData,
  //   children?: VNodeChildren,
  //   normalizationType?: number
  // ) => VNode | void

  // renderStatic
  // _m: (index: number, isInFor?: boolean) => VNode | VNodeChildren
  // markOnce
  // _o: (
  //   vnode: VNode | Array<VNode>,
  //   index: number,
  //   key: string
  // ) => VNode | VNodeChildren
  // toString
  _s: (value: any) => string
  // text to VNode
  _v: (value: string | number) => VNode
  // toNumber
  _n: (value: string) => number | string
  // empty vnode
  _e: () => VNode
  // loose equal
  _q: (a: any, b: any) => boolean
  // loose indexOf
  _i: (arr: Array<any>, val: any) => number
  // resolveFilter
  _f: (id: string) => Function
  // renderList
  _l: (val: any, render: Function) => Array<VNode> | null
  // renderSlot
  _t: (
    name: string,
    fallback?: Array<VNode>,
    props?: Record<string, any>
  ) => Array<VNode> | null
  // apply v-bind object
  // _b: (
  //   data: any,
  //   tag: string,
  //   value: any,
  //   asProp: boolean,
  //   isSync?: boolean
  // ) => VNodeData
  // apply v-on object
  // _g: (data: any, value: any) => VNodeData
  // check custom keyCode
  _k: (
    eventKeyCode: number,
    key: string,
    builtInAlias?: number | Array<number>,
    eventKeyName?: string
  ) => boolean | null
  // resolve scoped slots
  // _u: (
  //   scopedSlots: ScopedSlotsData,
  //   res?: Record<string, any>
  // ) => { [key: string]: Function }
}
