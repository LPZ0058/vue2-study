import Observer from './index';
type arrayPrototypeType = Record<string,any>
const arrayPrototype:arrayPrototypeType = Array.prototype

export const arrayMethods = Object.create(arrayPrototype)

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(function(method:string){

  const originMethod = (arrayPrototype)[method]
  Object.defineProperty(arrayMethods,method,{
    enumerable: false,
    configurable: true,
    writable: true,
    value: function mutator (...args: any[]) {
      const result = originMethod.apply(this, args)
      const ob = this.__ob__ as Observer
      // 如果是新增元素的方法，那么要把新增的源转成响应式的
      let insertedItem;
      switch(method) {
        case 'push':
        case 'unshift':
          insertedItem = args
          break;
        case 'splice':
          insertedItem = args.slice(2)
          break;
      }
      if (insertedItem) ob.observerArray(insertedItem)
      // 通知对应进行处理
      ob.dep.notify()
      return result
    }
  })
})
