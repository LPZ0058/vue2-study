// 判断当前运行环境是否是浏览器
export const inBrowser = typeof window !== 'undefined'
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isEdge = UA && UA.indexOf('edge/') > 0
export const isAndroid = UA && UA.indexOf('android') > 0
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge

// 判断方法是否是JavaScript 内置的方法
// 比如 Function Object ExpReg window  document 等等  这些方法使用c 或者 c++ 实现
export function isNative(Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}


// 判断是不是ssr环境，这里直接返回false
// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
let _isServer
export const isServerRendering = () => {
  // if (_isServer === undefined) {
  //   /* istanbul ignore if */
  //   if (!inBrowser && !inWeex && typeof global !== 'undefined') {
  //     // detect presence of vue-server-renderer and avoid
  //     // Webpack shimming the process
  //     _isServer = global['process'] && global['process'].env.VUE_ENV === 'server'
  //   } else {
  //     _isServer = false
  //   }
  // }
  _isServer = false
  return _isServer
}
