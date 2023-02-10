import { expect } from 'chai';
import Observice from '../Observice';
import Watcher from '../Watcher';

describe('测试Observice', function() {
  describe('测试Observice的构造函数', function(){
    it('constarctor', function() {
      const obj = {a:15}
      let observice = new Observice(obj)
      const observedObj = observice.value

      // const beWatchedObj = {data:50}
      let watcher = new Watcher(observedObj, 'a', (newValue, oldValue) => {
        expect(oldValue).to.be.equal(15)
        expect(newValue).to.be.equal(10)
      })

      obj.a = 10;
    })
  })
})
