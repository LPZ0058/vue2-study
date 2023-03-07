import { Component } from "types/component"
import { ComponentOptions } from "types/options"
import { isArray } from "./lang"

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions(
  parent: Record<string, any>,
  child: Record<string, any>,
  vm?: Component | null
): ComponentOptions {
  // if (__DEV__) {
  //   checkComponents(child)
  // }

  // if (isFunction(child)) {
  //   // @ts-expect-error
  //   child = child.options
  // }

  // normalizeProps(child, vm)
  // normalizeInject(child, vm)
  // normalizeDirectives(child)

  // // Apply extends and mixins on the child options,
  // // but only if it is a raw options object that isn't
  // // the result of another mergeOptions call.
  // // Only merged options has the _base property.
  // if (!child._base) {
  //   if (child.extends) {
  //     parent = mergeOptions(parent, child.extends, vm)
  //   }
  //   if (child.mixins) {
  //     for (let i = 0, l = child.mixins.length; i < l; i++) {
  //       parent = mergeOptions(parent, child.mixins[i], vm)
  //     }
  //   }
  // }

  const options: ComponentOptions = {} as any
  // let key
  // for (key in parent) {
  //   mergeField(key)
  // }
  // for (key in child) {
  //   if (!hasOwn(parent, key)) {
  //     mergeField(key)
  //   }
  // }
  // function mergeField(key: any) {
  //   const strat = strats[key] || defaultStrat
  //   options[key] = strat(parent[key], child[key], vm, key)
  // }
  return options
}


