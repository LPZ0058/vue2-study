import { arrayMethods } from "./array";
import Dep from "./dep";
import { def, hasOwn, isArray, isObject, isPrimitive, isUndef, isValidArrayIndex } from "../util/lang";
import { warn } from "core/util/debug";

// 判断当前环境是否支持__proto__
const hasProto = '__proto__' in {}

/**
 * 注意：
 *  1. 一般一个Obsevice对象转换某个引用类型为响应式，且转换成响应式的引用类型的__ob__设置为对应的Obsevice对象（他们是一对一的关系 ,且能相互引用，因为
 *  Observer实例的value属性指向对应的引用类型）
 */
export default class Observer {
  public value: object
  public dep: Dep
  // TODO
  // public vmCount: number // number of vms that have this object as root $data

  constructor(value: object) {
    this.value = value
    this.dep = new Dep // 这个是给数组用的（且数组自己依赖的就只有这个dep），将该数组全部的Watcher都梆定到这里。
    def(value,'__ob__',this)

    if(Array.isArray(value)) {
      /**
       * vue2将数组转成响应式体现在两个方面：
       *  1. 调用改变数组的方法时能触发响应
       *  2. 将数组的引用类型元素转成响应式
       * 注意，和对象最大的不同是：
       *  1. 通过属性设置不能触发，如：a[2] = 3 ，这种不行。
       *  2. 数组的响应式是以整个数组为单位的，因此：
       *      1. 只有在Watcher的路径是访问那个数组时才会收集依赖（如果是指向数组的引用元素，则不归数组管）
       *      2. 数组不能直接给new Obersice()传参，必须是作为某个对象的属性传入。在Vue中，应该是直接作为vm.data的属性传入的。
       *         由1，数组的依赖的收集其实是在父级对象的setter上。
       */
      // 1. 转换数组的方法
      if (hasProto) {
        // 给要变成响应式的数组替换方法
        (value as any).__proto__ = arrayMethods
      } else {
        // 如果不支持，直接暴力替换
        Object.getOwnPropertyNames(arrayMethods).forEach((method) => {
          def(value, method, (arrayMethods as any)[method])
        })
      }

      // 2. 把每个数组元素转成响应式
      this.observerArray(value)
    } else {
      this.walk(value)
    }
  }

  // 将非响应式对象转成响应式的
  walk(obj: Record<string, any>) {
    const keys = Object.keys(obj)
    for(let i= 0; i <= keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
  // 将数组的元素转成响应式
  observerArray(items: any[]) {
    for(let i=0; i<items.length; i++) {
      observe(items)
    }
  }
}


/**
 * @description:  用来将某个对象的某个属性转变为响应式
 * @param {*} data 要转变属性的对象
 * @param {*} key  要转变的属性
 * @param {*} val  属性的值
 * @return {*}
 */
export function defineReactive(data: object, key: string, val: any) {
  const childOb = observe(val)

  const dep = new Dep()
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      dep.depend()

      if(childOb) { // 在这里收集子数组/对象的Watcher。这样看，如果子属性是对象，那么不是维护了两个dep？
        childOb.dep.depend()
      }
      return val
    },
    set: function(newVal) {
      if(val === newVal) {
        return
      }
      val = newVal
      dep.notify()
    }
  })
}

/**
 * 将某个变量转换成响应式的，并返回对应的Observer实例
 */
export function observe(value:any): Observer | void{
  if(!isObject(value)) {
    return;
  }

  let ob;
  value as Record<string, any>
  if(hasOwn(value,'__ob__') && value.__ob__ instanceof Observer) { //此时value是响应式的对象
    return value.__ob__
  } else {
    ob = new Observer(value)
  }

  return ob
}

/**
 * 这个方法就是给对象/数组设置属性的方法，就是熟悉的vm.$set
 * 注意，传入的target对象可能是非响应式的
 * @param target
 * @param key
 * @param value
 */
export function set<T>(target: T[], key: number, value: T): T
export function set<T>(target: object, key: string | number, value: T): T
export function set(target, key, value) {
  const isArray = Array.isArray(target)

  if(isArray) {// 如果target是数组
    if(isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key)
      // 这里数组的splice方法以及被覆盖了，因此直接调用就可以了（1. 触发Dep的watcher 2. 将value设置成响应的）
      target.splice(key, 1, value)
      return value
    }
  } else {
    // 如果target是对象
    // 1. 如果key已经存在了,直接赋值就可以了，因为此时该属性已经设置了setter
    if(key in target && !(key in Object.prototype)) {
      target[key] = value
      return value
    }

    // 2. 如果key不存在，既新增一个元素，则用defineReactive设置对应的属性
    const ob = target.__ob__ as Observer
    // 注意对象不能是 Vue 实例，或者 Vue 实例的根数据对象(文档的警告)
    if(target._isVue || (ob && (ob as any).vmCount)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
          'at runtime - declare it upfront in the data option.'
      )

      return value
    }

    if(!ob) { // 没用ob则target不是响应式对象，此时直接赋值就好
      target[key] = value
      return value
    }

    defineReactive((ob as Observer).value, key, value)
    // 直接通知梆定在当前对象上的watcher
    ob.dep.notify()
    return value
  }
}

/**
 * 这个方法就是给对象/数组删除属性的方法，就是熟悉的vm.$delete
 * 注意，传入的target对象可能是非响应式的
 * @param target
 * @param key
 */
export function del<T>(target: T[], key: number): void
export function del<T>(target: object, key: string | number): void
export function del(target, key) {
  // 如果是数组
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key,1)
    return
  }
  // 是对象,则删除属性，然后通知该对象的watcher
  const ob = target.__ob__ as Observer
  // 注意对象不能是 Vue 实例，或者 Vue 实例的根数据对象(文档的警告)
  if(target._isVue || (ob && (ob as any).vmCount)) {
    process.env.NODE_ENV !== 'production' && console.warn(
      `Cannot delete reactive property on undefined, null, or primitive value: ${target}`
    )
    return
  }

  // 如果 key 不是target自身的属性，那什么都不用做
  if(!hasOwn(target, key)) {
    return
  }

  delete target[key]
  if(!ob) { // 不是响应对象则直接返回
    return
  }
  ob.dep.notify()
}

