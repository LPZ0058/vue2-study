import { nextTick } from "core/util/next-tick";
import { Component } from "../../types/component";

export function renderMixin(Vue: typeof Component) {
  // 设置vm.$nextTick
  Vue.prototype.$nextTick = function (fn:  (...args: any[]) => any) {
    return nextTick(fn, this)
  }
}

export function initRender(vm: Component) {
  // vm._vnode = null // the root of the child tree
  // vm._staticTrees = null // v-once cached trees
  // const options = vm.$options
  // const parentVnode = (vm.$vnode = options._parentVnode!) // the placeholder node in parent tree
  // const renderContext = parentVnode && (parentVnode.context as Component)
  // vm.$slots = resolveSlots(options._renderChildren, renderContext)
  // vm.$scopedSlots = parentVnode
  //   ? normalizeScopedSlots(
  //       vm.$parent!,
  //       parentVnode.data!.scopedSlots,
  //       vm.$slots
  //     )
  //   : emptyObject
  // // bind the createElement fn to this instance
  // // so that we get proper render context inside it.
  // // args order: tag, data, children, normalizationType, alwaysNormalize
  // // internal version is used by render functions compiled from templates
  // // @ts-expect-error
  // vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // // normalization is always applied for the public version, used in
  // // user-written render functions.
  // // @ts-expect-error
  // vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // // $attrs & $listeners are exposed for easier HOC creation.
  // // they need to be reactive so that HOCs using them are always updated
  // const parentData = parentVnode && parentVnode.data

  // /* istanbul ignore else */
  // if (__DEV__) {
  //   defineReactive(
  //     vm,
  //     '$attrs',
  //     (parentData && parentData.attrs) || emptyObject,
  //     () => {
  //       !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
  //     },
  //     true
  //   )
  //   defineReactive(
  //     vm,
  //     '$listeners',
  //     options._parentListeners || emptyObject,
  //     () => {
  //       !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
  //     },
  //     true
  //   )
  // } else {
  //   defineReactive(
  //     vm,
  //     '$attrs',
  //     (parentData && parentData.attrs) || emptyObject,
  //     null,
  //     true
  //   )
  //   defineReactive(
  //     vm,
  //     '$listeners',
  //     options._parentListeners || emptyObject,
  //     null,
  //     true
  //   )
  // }
}
