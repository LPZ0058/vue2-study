import { Component } from "../../types/component"

export function callHook(vm: Component, hook: string) {
  console.log('这是callHook方法')
}

export function initLifecycle(vm: Component) {
  console.log('initLifecycle方法')
}
