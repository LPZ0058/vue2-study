import config from 'core/config'

import Vue from './runtime/index'

import type { Component } from 'types/component'
import type { GlobalAPI } from 'types/global-api'
import { query } from './utils'
import { cached, warn } from 'core/util'
// 根据id查询相应的Element，并返回innerHTML作为模板。这里传递给了cached进行了缓存增强，缓存了id和对应的模板
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    __DEV__ &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      )
    return this
  }

  const options = this.$options
  // 如果没有render，就解析template / el去生成render函数
  if (!options.render) {
    // 先看option是否提供了template
    let template = options.template
    if (template) {
      /**
       * 看看文档的描述
       * 一个字符串模板作为 Vue 实例的标识使用。模板将会替换挂载的元素。挂载元素的内容都将被忽略，除非模板的内容有分发插槽。
        如果值以 # 开始，则它将被用作选择符，并使用匹配元素的 innerHTML 作为模板。
        常用的技巧是用 <script type="x-template"> 包含模板
       */
      if (typeof template === 'string') {
        // 以#开头认为是选择符，获取其对应的DOM元素作为模板
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (__DEV__ && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
        // 如果不是以#开头，则直接使用

        // 如果是Element，则把其innerHTML作为模板
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (__DEV__) {
          warn('invalid template option:' + template, this)
        }
        return this
      }
      // 如果没有设置template属性，则找el指定的DOM元素的OuterHTML作为模板，具体实现看对应函数
    } else if (el) {
      template = getOuterHTML(el as Element)
    }
    if (template) {
      /**
       * // TODO 根据模板生成渲染函数 和 静态渲染函数，这段先跳，逻辑太多了
       * 记录一些优秀的博客：
       * https://cloud.tencent.com/developer/article/1483772
       */
      // const { render, staticRenderFns } = compileToFunctions(
      //   template,
      //   {
      //     outputSourceRange: __DEV__,
      //     shouldDecodeNewlines,
      //     shouldDecodeNewlinesForHref,
      //     delimiters: options.delimiters,
      //     comments: options.comments
      //   },
      //   this
      // )
      // options.render = render
      // options.staticRenderFns = staticRenderFns

    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

// Vue.compile = compileToFunctions

export default Vue as GlobalAPI
