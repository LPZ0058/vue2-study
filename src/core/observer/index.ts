import { arrayMethods } from "./array";
import Dep from "./dep";
import { def, hasOwn, isObject } from "../../utils/lang";

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
