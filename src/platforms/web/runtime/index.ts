import Vue from 'core/index'
import { isUnknownElement } from '../utils/element';
import { Component } from 'types/component';
import { inBrowser } from 'core/util';
import { query } from '../utils';
import { mountComponent } from 'core/instance/lifecycle';



/**
 * 这里拓展了Vue对象在浏览器运行时的属性和方法
 */
Vue.config.isUnknownElement = isUnknownElement


/**
 * // TODO 关于Vue的运行时版本和编译版本：
 *
 *
vue存在俩个版本，完整版和运行时版本，其区别就是有没有模版编译这一部分内容，完整版本是包含了
模版编译这一部分。

完整版本：vue完整版本包含了编译器，会根据template模版编译生成渲染函数的代码,源码中就是
render函数。

运行时版本：通过自己手写render函数，去定义渲染过程，这个时候并不需要完整的模版编译过程。
同样，也可以借助vue-loader来对*.vue文件进行编译。所以这部分内容，都可以交给webpack插件来
完成。

其实，模版编译的过程，对于性能的问题影响的非常大，加入了模版编译，使得vue整个包体积增大，
性能降低，所以，在开发中一般不会将模版编译这部分内容加入到vue中，而是将模版编译交给webpack
去处理，这样不仅仅减小了生成环境包的体积，也在性能方面有了很大的提高。
 */
// 这里就是运行时的版本
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 将el转换成对应的真实DOM元素
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

export default Vue
