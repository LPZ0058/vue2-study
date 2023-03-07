import { warn } from 'core/util/index'

// export * from './attrs'
// export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 *
看看文档的描述：

提供一个在页面上已存在的 DOM 元素作为 Vue 实例的挂载目标。可以是 CSS 选择器，也可以是一个 HTMLElement 实例。
在实例挂载之后，元素可以用 vm.$el 访问。
 */
export function query(el: string | Element): Element {
  if (typeof el === 'string') { // 此时是css选择器字符
    const selected = document.querySelector(el)
    // 如果css selector找不到，那么就新建个div作为挂载的节点
    if (!selected) {
      __DEV__ && warn('Cannot find element: ' + el)
      return document.createElement('div')
    }
    return selected
  } else { // 此时是HTMLElemt，直接返回
    return el
  }
}
