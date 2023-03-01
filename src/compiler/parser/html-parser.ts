import { HTMLParserOptions } from "../../types/compolier/html-parser"
import { ASTAttr } from "../../types/compolier/index"
import { makeMap, unicodeRegExp } from "../../utils/lang"
import { canBeLeftOpenTag, isNonPhrasingTag, isUnaryTag } from "./utils"

export const isPlainTextElement = makeMap('script,style,textarea', true)

const reCache = {}

const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) =>
  tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

// TODO 下面这段正则 待研究，相关blog：https://juejin.cn/post/7129470911778357261
// 匹配html的属性，如：<div id="mydiv" class="myClass"  @click="myClick">中的id="mydiv"，class="myClass"，@click="myClick"
const attribute =
  // eslint-disable-next-line no-useless-escape
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 梆定vue的动态属性，如： v-bind:attr1='express1',
const dynamicArgAttribute =
  // eslint-disable-next-line no-useless-escape
  /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)


// eslint-disable-next-line no-useless-escape
const comment = /^<!\--/
const conditionalComment = /^<!\[/
const doctype = /^<!DOCTYPE [^>]+>/i

// 对属性里面的换行符或制表符进行处理
const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
}
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g
function decodeAttr(value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}

/**
 * 注意的点：
 *  1. 文本元素的和纯文本元素。纯文本元素就是<script>、<style>、<textarea>这三个元素，它们和普通的文本元素
 *     的区别就是：它们可以包含</d>这种结束标签等等的关键内容，既：要把纯文本元素内部的全部内热都当成文本元
 *     素去处理。
 *  2. 注意有个条件注释(ConditionalComment),好像是以前IE支持的？？，它不用进行特殊处理，直接切掉，因此在vue
 *     模板中写条件注释的无效的，类似的还有doctype
 * @param html
 * @param options
 */
export function parseHTML(html, options: HTMLParserOptions) {
  // 维护层级关系的栈
  const stack: any[] = []
  const expectHTML = options.expectHTML
  // const isUnaryTag = options.isUnaryTag
  // const canBeLeftOpenTag = options.canBeLeftOpenTag || no

  // 给内部处理函数定位用
  let index = 0
  // lastTag指向父元素
  let last, lastTag
  while (html) {
    last = html
    // 如果父标签不是纯文本标签
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      // 处理标签
      if (textEnd === 0) {
        // 判断是否是以<!--开头，如果是，则是注释的开始标志
        // 处理注释
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')

          if (commentEnd >= 0) {
            // 如果保留注释，且提供comment的钩子
            if (options.shouldKeepComment && options.comment) {
              options.comment(
                html.substring(4, commentEnd),
                index,
                index + commentEnd + 3
              )
            }
            advance(commentEnd + 3)
            continue
          }
        }

        // 处理条件注释(以 <![ 开头 )，其实就是切掉这一段，不会进行什么特殊的调用
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // 处理doctype，也是直接切掉
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // 处理其他的结束标签
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // 处理其他的开始标签
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          //  如果在pre和textarea内第一个字符是换行符的话，需要忽略这个换行符
          // 具体为什么会出现问题，不太理解，居然看：https://github.com/vuejs/vue/pull/6022
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1)
          }
          continue
        }
      }
      // 处理文本
      let text, rest, next
      if (textEnd >= 0) {
        rest = html.slice(textEnd)
        /**
         * 这里是为了处理文本中有 < 的情况，因为上面是html.indexOf('<')
         * 逻辑是，先截取，然后看剩下的字符是否：1. 符合开始标签？ 2. 是否符合注释节点？ 3.是否符合 条件注释？
         * 如果都不符合，那么，认为 < 属于文本的一部分，然后找下一个 < 重复上面逻辑。如果符合，则·~~
         */
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          next = rest.indexOf('<', 1)
          // 如果rest里面没用 < 了，则剩下的都是文本，留到下次循环处理，既下面的if (textEnd < 0) {}
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        text = html.substring(0, textEnd)
      }

      // 没有找到 < 既：html剩下的全是文本
      if (textEnd < 0) {
        text = html
      }
      // 截取掉文本
      if (text) {
        advance(text.length)
      }
      // 如果提供了文本回调(options.chars) 且有文本
      if (options.chars && text) {
        options.chars(text, index - text.length, index)
      }
    } else { // 如果父标签是纯文本元素
      let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      // 这里进行映射存储，key为对应纯文本描述的tagname，值为对应的正则表达式
      const reStackedTag =
        reCache[stackedTag] ||
        (reCache[stackedTag] = new RegExp(
          '([\\s\\S]*?)(</' + stackedTag + '[^>]*>)',
          'i'
        ))
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            // eslint-disable-next-line no-useless-escape
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298x ，地址：https://github.com/vuejs/vue/issues/7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        // 调用回调
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      // 处理结束标签stackedTag
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    if (html === last) { // 此时整个html都是文本(上面的处理都没有命中)
      options.chars && options.chars(html)
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance(n) {
    index += n
    html = html.substring(n)
  }

  /**
   * 解析html的开始标签，并进行标签内容的初步提取，以便后面的handleStartTag进一步处理，其返回值类似：
   *
      match = {
          tagName: 'div',
          attrs: [
            [
              'id="box"',
              'id',
              '=',
              'box',
              undefined,
              undefined
            ],
            [
              ' v-if="watings"',
              'v-if',
              '=',
              'watings',
              undefined,
              undefined
            ]
          ],
          start: index,
          unarySlash: undefined,
          end: index
      }
   * @returns
   */
  function parseStartTag() {
    // 看html是否以开始标签开头，并匹配，如： <tagname attr1="value1" attr2="value2">...</tagname> 匹配 <tagname
    const start = html.match(startTagOpen)
    if (start) {
      const match: any = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      advance(start[0].length)
      // 此时html为：attr1="value1" attr2="value2">...</tagname>
      let end, attr
      // 循环匹配并处理开始标签的属性
      while (
        // html.match(startTagClose) 既：判断是否到了开始的标签的结尾，如：'>...</tagname>'中的'>' 或者 自闭合标签的'/>'
        !(end = html.match(startTagClose)) &&
        // 匹配动态属性，如：v-bind:[attr1]='express1'、v-on:[eventName1]='eventHandler1'
        // 匹配html的属性，如: attr1='value1' ,包括：@click="myClick"
        (attr = html.match(dynamicArgAttribute) || html.match(attribute))
      ) {
        // 这里的attr只是初级的形态，进一步的解析属性在下面的handleStartTag函数，会利用这里的attr进行解析
        attr.start = index
        advance(attr[0].length)
        attr.end = index
        match.attrs.push(attr)
      }
      if (end) {
        // 如果是自闭合标签，则match.unarySlash为/,反之为空字符串
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  /**
   *  接收parseStartTag解析出来的match，处理特殊情况，正式解析开始标签的属性名和属性值(解析后会把attrs属性替换,其元素的结构为：{name:{属性名}, value:{属性值}})
   * @param match parseStartTag解析出来的match
   */
  function handleStartTag(match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    // 像浏览器解析HTML那样，对一些特殊的情况进行处理
    if (expectHTML) {
      // HTML5里面：p 标签本身的内容模型是流式内容(Flow content)，并且 p 标签的特性是只允许包含段落式内容(Phrasing content)
      // 既：p标签只能嵌套段落元素，其他元素如果嵌套在p标签中会被自动解析到p标签外面
      // 因此，如果父元素的p标签，但是当前元素不是Phrasing conten的标签，那么就立即闭合p,既：
      // <p><h2></h2></p> 会被解析成：<p></p><h2></h2></p>，既在解析出<h2>（当前handle的StartTag）之前，先补一个</p>
      // 那么后面的单独的</p>咋办呢？后面有相应的处理逻辑:会自动补全成：<p></p><h2></h2><p></p>.这和浏览器的行为相同

      // html5标签相关文档链接：https://html.spec.whatwg.org/multipage/indices.html#elements-3
      // 段落标签相关文档链接：https://html.spec.whatwg.org/multipage/dom.html#phrasing-content

      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      /**
       *
        // 如果标签的上一个标签跟当前解析的标签名相同并且当前标签属于"可省略闭合标签"，那么，直接调用parseEndTag把上一个标签结束掉
        // e.g.
        // <ul>
        //      <li> 选项1
        //      <li> 选项2
        //      <li> 选项3
        //      <li> 选项4
        // </ul>
        // 会被处理成：
        // <ul>
        //     <li> 选项1
        //     </li><li> 选项2
        //     </li><li> 选项3
        //     </li><li> 选项4
        // </ul>
       */
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash

    const l = match.attrs.length
    const attrs: ASTAttr[] = new Array(l)
    for (let i = 0; i < l; i++) {
      /**
       * args的结构：
       *    [
              'id="box"',
              'id',
              '=',
              'box',
              undefined,
              undefined
            ]
       */
      const args = match.attrs[i]
      // 当前属性的值
      const value = args[3] || args[4] || args[5] || ''
      // 是否对属性值中的换行符或制表符做兼容处理，既shouldDecodeNewlinesForHref
      // (a标签的href属性可以单独设置shouldDecodeNewlinesForHref)
      // 如：会把'&lt;'转成'<'
      const shouldDecodeNewlines =
        tagName === 'a' && args[1] === 'href'
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines
      // 替换attrs的内容为{name:{属性名}, value:{属性值}}
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      }
      // 下面是记录标签属性在模版字符串中开始和结束的位置索引,但是感觉不必要?
      // if (__DEV__ && options.outputSourceRange) {
      //   attrs[i].start = args.start + args[0].match(/^\s*/).length
      //   attrs[i].end = args.end
      // }
    }

    // 非自闭合标签，则压栈以便维护结构关系，自闭合标签因为没有子标签，因此不需要压栈
    if (!unary) {
      stack.push({
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(),
        attrs: attrs,
        start: match.start,
        end: match.end
      })
      // 设置lastTag为栈顶元素
      lastTag = tagName
    }
    // 调用开始标签的处理函数
    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  /**
   * @param tagName
   * @param start
   * @param end
   */
  function parseEndTag(tagName?: any, start?: any, end?: any) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    // 寻找压入栈的tagName的位置,这里为什么不直接去栈顶元素呢?有可能html模板不是完全正确的,可能会导致栈顶元素不是传入的tagname?
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    // 如果找到tagname的位置
    if (pos >= 0) {
      // 把stack里面pos以及后面的元素全部都调用options.end回调
      for (let i = stack.length - 1; i >= pos; i--) {
        // if (__DEV__ && (i > pos || !tagName) && options.warn) {
        //   options.warn(`tag <${stack[i].tag}> has no matching end tag.`, {
        //     start: stack[i].start,
        //     end: stack[i].end
        //   })
        // }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // 清空传入元素以及stack在后面的元素
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
      // 下面处理没有在stack里面找到tagname,有可能是前面handleStartTag函数中expectHTML的处理了情况,很容易理解为什么调用options.start和options.end
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}
