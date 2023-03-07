import { expect } from 'chai';
import Observer from '../core/observer/index';
import Watcher from '../core/observer/watcher';


describe('测试Observer', function() {
  describe('测试Observer的构造函数', function(){
    // it('将对象转成响应式的情况', function(done) {
    //   const obj = {a:15, b:12, c:13}
    //   new Observer(obj)
    //   new Watcher(obj, 'a', (newValue, oldValue) => {
    //     expect(oldValue).to.be.equal(15)
    //     expect(newValue).to.be.equal(10)
    //   })

    //   obj.a = 10;
    //   obj.b = 11;
    //   obj.c = 12;

    //   done();
    // })


    // it('将数组转成响应式的情况', function(done) {
    //   const array:any[] = [1,2,{a: 15}]
    //   const obj: object = {array}
    //   new Observer(obj)

    //   // 设置Watcher
    //   new Watcher(obj,'array',(newArray, oldArray) => {
    //     expect(newArray[0]['item']).to.be.equal(3)
    //   })
    //   // 在前面添加一个元素，是个引用类型
    //   array.unshift({index:0, item:3})
    //   done();
    // })
  })
})

export {}
