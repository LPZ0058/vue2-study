import Dep from "./Dep";

export default class Observice {
  value: object
  constructor(value: object) {
    this.value = value;
    if(!Array.isArray(value)) {
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
}


/**
 * @description:  用来将某个对象的某个属性转变为响应式
 * @param {*} data 要转变属性的对象
 * @param {*} key  要转变的属性
 * @param {*} val  属性的值
 * @return {*}
 */
function defineReactive(data: object, key: string, val: any) {
  if(typeof val === 'object') {
    new Observice(val)
  }

  const dep = new Dep()
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      dep.depend()
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
