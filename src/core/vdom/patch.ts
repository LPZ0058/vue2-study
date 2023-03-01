import { isDef, isUndef, isArray, isTrue, isPrimitive } from '../../utils/lang';
import { NodeOps } from "../../types/platforms/web/runtime/node-option"
import VNode, { cloneVNode } from './vnode';
import { isTextInputType, isUnknownElement } from '../../platforms/web/utils/element';

/**
 * // TODO 之所以这样是为了跨平台，至于如何操作，以后研究
 * @param backend
 */
export function createPatchFunction(backend:{nodeOps:NodeOps}) {
  const { nodeOps } = backend


  /**
   * 如果两个vnode是sameNode，则patchVnode
   * patchVNode的作用是根据vnode调整oldVnode对应的DOM元素
   * @param oldVnode
   * @param vnode
   * @param ownerArray vnode 所属的兄弟列表 ，，
   * @param index vnode 所属的下标
   * @returns
   */
  function patchVnode(oldVnode,vnode,ownerArray?,index?) {
    if (oldVnode === vnode) {
      return
    }
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode)
    }
    // 为新虚拟节点的elm赋值
    const elm = (vnode.elm = oldVnode.elm)
    // 如果新旧vnode是key相同的静态节点(要么是clone节点，要么是v-once)
    if (
      isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      return
    }


    const oldCh = oldVnode.children
    const ch = vnode.children

    // 新节点非文本节点或者注释节点
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) { // 若有新旧vnde有孩子节点，则：孩子节点不相同则更新孩子节点
        if (oldCh !== ch)
        // 更新子节点，这个方法就是面式的典中典了！！！！！
          updateChildren(elm, oldCh, ch)
      } else if (isDef(ch)) { // 若只有新vnode有孩子节点，那么清空DOM的内容，然后把新的VNode的孩子节点放入
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1)
      } else if (isDef(oldCh)) { // 若只有旧vnode有孩子节点，那么删除DOM上对应的孩子节点
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) { // 新旧vnode的都没用孩子节点，且新vnode不是文本/注释节点，但旧vnode是，那么删除DOM中的text
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {// 新节点是文本/注释节点，那么直接设置DOM的setTextContent就好了
      nodeOps.setTextContent(elm, vnode.text)
    }
  }

  /**
   * 遍历oldCh以便寻找到和node是sameVnode的虚拟节点，并返回它的下标
   * @param node
   * @param oldCh
   * @param start
   * @param end
   * @returns
   */
  function findIdxInOld(node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i]
      if (isDef(c) && sameVnode(node, c)) return i
    }
  }


  /**
   *
   * @param vnode
   * @param children
   */
  function createChildren(vnode, children) {
    if (isArray(children)) {
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i],vnode.elm,null)
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
    }
  }

  /**
   * 插入元素
   * @param parent 要插入的父节点
   * @param elm 要插入的dom节点
   * @param ref 参考dom节点
   */
  function insert(parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref) && (nodeOps.parentNode(ref) === parent)) {
        nodeOps.insertBefore(parent, elm, ref)
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
  }

  /**
   * 根据VNode创建dom元素
   * // TODO 这里没有处理元素的属性，以后再做
   * @param vnode 当前节点vnode
   * @param parentElm 当前节点的父节点(真实dom元素)
   * @param refElm 参考节点（真实元素既insertBefore时要before到这个节点之前）
   * @param ownerArray 所以属的列(一般是父节点的children列表)
   * @param index 在ownerArray中的下标
   */
  function createElm(
    vnode: VNode,
    // insertedVnodeQueue, // 这个是给元素创建的时候的钩子函数用的，先不管
    parentElm?: Node | null,
    refElm?: Node | null,
    ownerArray?: any, //
    index?: any
  ) {
    // 如果vnode已经有elm了那么表示它已经被渲染过了，常见于静态节点，此时clone一下
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      vnode = ownerArray[index] = cloneVNode(vnode)
    }


    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) { // 如果是元素
      /**
       * 判断要创建的元素是否合规
       * （现在只考虑：浏览器认识的元素(reserved tag)，且排除掉svg... // TODO 以后了解下svg）
       */
      if (isUnknownElement(tag)) {
        console.log(
          'Unknown custom element: <' +
            tag +
            '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
          vnode.context
        )
      }
      // 创建真实dom
      vnode.elm = nodeOps.createElement(tag, vnode)

      // 创建子元素
      createChildren(vnode, children)
      // 将创建的子元素插入指定位置
      insert(parentElm, vnode.elm, refElm)

    } else if (isTrue(vnode.isComment)) { // 如果是注释节点
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else { // 创建文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }
  /**
   * 移除指定Dom节点
   * @param el
   */
  function removeNode(el: Node) {
    const parent = nodeOps.parentNode(el)
    /**
     * 可能会有父节点不存在的情况，如果父节点不存在，那么就说明该节点已经不在dom树上了，直接退出就OK
     */
    if (isDef(parent)) {
      nodeOps.removeChild(parent as unknown as Node, el)
    }
  }

  /**
   * vnodes下标从startIdx到endIdx的节点，依次创建DOM，然后，插入到parentElm下refElm之前的位置
   * @param parentElm 父Dom
   * @param refElm  参考Dom
   * @param vnodes  虚拟节点列表
   * @param startIdx 开始的下标
   * @param endIdx 结束的下标
   */
  function addVnodes(parentElm,refElm,vnodes,startIdx,endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx],parentElm,refElm)
    }
  }

  /**
   * 挨个删除vnodes下标从startIdx到endIdx的DOM
   * @param vnodes
   * @param startIdx
   * @param endIdx
   */
  function removeVnodes(vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
        removeNode(ch.elm)
      }
  }

  /**
   * 根据传入的节点,生成一个tagname相同的空vnode
   * @param elm
   * @returns
   */
  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  /**
   * 更新子节点(面式典中典............)
   * // 注意一些细节：
   *    1. 旧节点对应着此时的DOM元素。
   *    2. 新vnode的elm属性是没被赋值的，因此只能通过旧的elm去操作对应的DOM
   *    3. 在任一时刻...
   * @param parentElm
   * @param oldCh
   * @param newCh
   */
  function updateChildren(
    parentElm,
    oldCh,
    newCh,
  ) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm


    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      /**
       * 前两个条件判断，是保障了每次执行到后面的情况的时候，oldEndIdx(oldEndVnode) 以及oldStartIdx(oldStartVnode)
       * 都是执行没用处理过的旧VNode(主要是 最后 else的处理，可能会导致oldStartIdx 和 oldEndIdx 之间有已经处理过的节点)。
       */
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode,newStartVnode,newCh,newEndIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode,newEndVnode,newCh,newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode,newEndVnode,newCh,newEndIdx)
        // 这个是将旧前的DOM节点放到旧后的下一个节点前(既 未处理节点的最后)，结合整个算法易想
        nodeOps.insertBefore(parentElm,oldStartVnode.elm,nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode,newStartVnode,newCh,newEndIdx)
        nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 生成 oldKeyToIdx 映射，这个只需要生成一次
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        /**
         * 快速在oldVNode中找到newStartVnode对应的节点的下标(idxInOld)，逻辑如下：
         * 1. 如果oldVNode有key和它相同，那么几乎就是这个oldVNode节点了，用sameVNode判断后直接patchVNode。这就要用到前面的(oldKeyToIdx 映射)
         * 2. 如果找不到，那就要遍历oldVNodes，用sameVNode一个个判断(定义在findIdxInOld函数中)
         */
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        // 如果在旧VNode中没有找到，那么意味着当前的newVNode在旧节点列表中没有对应的，因此新建该节点并插入直接在"全部未处理节点"前
        if (isUndef(idxInOld)) {
          // New element
          createElm(newStartVnode,parentElm,oldStartVnode.elm,newCh,newStartIdx)
        } else { // 如果在旧VNode中找到了 ...
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove,newStartVnode,newCh,newEndIdx)
            // 将这种情况下处理过的旧节点的位置直接置为undefined，避免重复
            oldCh[idxInOld] = undefined
            // 移动位置，因为它对应的是newStart，因此移动到“未处理的DOM节点之前”
            nodeOps.insertBefore(parentElm,vnodeToMove.elm,oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode,parentElm,oldStartVnode.elm,newCh,newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    // 旧孩子节点先被遍历完，那么意味着新孩子节点还有剩的，此时这些新的VNode就要直接创建对应的DOM元素
    // 但是有个问题，新建的这些VNode该插到哪个位置？是newEnd后一个节点的前面/或者newStart前一个节点的后面
    // 但是addVnodes是用的insertBefore进行插入的，因此选择newEnd后一个节点的前面
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm,refElm,newCh,newStartIdx,newEndIdx)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }

  /**
   * 注意的点：
   *  1. path的目标是将当前Vue实例控制的Dom渲染成(新的)VNode对应的Dom(既：以新的vnode为准)
   *  2. 现在只为跑通最基本的逻辑，因此删去了：
   *    2.1. 各种阶段的钩子相关代码
   *    2.2. 服务端渲染相关代码
   *    2.3. 跨平台相关代码
   *      // TODO 下一步应该把 "各种阶段的钩子相关代码" 加上，才是完整的功能
   * 基本逻辑：
   *  patch组件的新旧vnode（root vnode），如果：
   *    1. 新的vnode为空，显然是要删除对应的dom元素
   *    2. 新的vnode不为空，旧的vnode为空，显然是要根据新的vnode生成dom直接插入(一般是首次渲染)
   *    3. 新旧vnode都不为空：
   *        3.1 他们是sameVNode，那么只需要更新当前节点就好(patchVnode)
   *        3.2 他们不是sameVNode，那么将新VNode生成的DOM替换旧VNode生成的DOM(具体逻辑是 生成新VNode的DOM元素
   *            插到旧VNode的DOM元素的后面，然后删除旧VNode的DOM元素)
   * @param oldVnode 旧的VNode
   * @param vnode 新的VNode
   * @returns
   */
  return function patch(oldVnode, vnode) {
    // 如果新的节点为空，且旧的VNode存在，那么就是要删除对应的Dom节点
    if (isUndef(vnode)) {
      // if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }
    let isInitialPatch = false
    // const insertedVnodeQueue: any[] = []
    // 旧的虚拟节点为空，则直接根据新的虚拟节点(vnode)生成真实dom就好
    if (isUndef(oldVnode)) {
      isInitialPatch = true;
      createElm(vnode)
    } else { // 新旧VNode节点都有
      // VNode是没有nodeType属性的，如果这里有，那么表示不是VNode节点而是真实的DOM节点
      const isRealElement = isDef(oldVnode.nodeType)
      // 如果新旧节点是sameVnode,那么只需要patchVnode更新当前的DOM
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode)
      } else {
        // 若oldVnode是真实节点,
        // if (isRealElement) {
        //   // 将oldVnode换成空的tagname相同的vnode
        //   oldVnode = emptyNodeAt(oldVnode)
        // }
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        //创建新dom节点
        createElm(
          vnode,
          parentElm as any as Node,
          nodeOps.nextSibling(oldElm)
        )

        // update parent placeholder node element, recursively
        // TODO 以后研究
        // if (isDef(vnode.parent)) {
        //   let ancestor = vnode.parent
        //   const patchable = isPatchable(vnode)
        //   while (ancestor) {
        //     for (let i = 0; i < cbs.destroy.length; ++i) {
        //       cbs.destroy[i](ancestor)
        //     }
        //     ancestor.elm = vnode.elm
        //     if (patchable) {
        //       for (let i = 0; i < cbs.create.length; ++i) {
        //         cbs.create[i](emptyNode, ancestor)
        //       }
        //       // #6513
        //       // invoke insert hooks that may have been merged by create hooks.
        //       // e.g. for directives that uses the "inserted" hook.
        //       const insert = ancestor.data.hook.insert
        //       if (insert.merged) {
        //         // start at index 1 to avoid re-invoking component mounted hook
        //         for (let i = 1; i < insert.fns.length; i++) {
        //           insert.fns[i]()
        //         }
        //       }
        //     } else {
        //       registerRef(ancestor)
        //     }
        //     ancestor = ancestor.parent
        //   }
        // }

        // 删除旧节点,这只保留个简单的删除Node的操作,源码是还有调用destroy钩子,以后再说
        if (isDef(parentElm)) {
          // removeVnodes([oldVnode], 0, 0)
          removeNode(oldElm)
        }
      }
    }

    // invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }

}

/**
 * 判断新旧VNode是否是同一类型的节点
 * @param a
 * @param b
 * @returns
 */
function sameVnode(a: VNode, b: VNode) {
  return (
    a.key === b.key &&
    ((a.tag === b.tag &&
      a.isComment === b.isComment
      // && isDef(a.data) === isDef(b.data) &&
      // sameInputType(a, b)
      ))
  )
}

// function sameInputType(a, b) {
//   if (a.tag !== 'input') return true
//   let i
//   const typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type
//   const typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type
//   return typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB))
// }
/**
 * 创建一个oldVNode的映射,该映射是旧节点的key到其下标的映射。
 * 主要目的是知道newVNode的时候能通过这个映射快速定位到key相同的oldVNode上。
 * 也是由此，Vue推荐加key
 * @param children
 * @param beginIdx
 * @param endIdx
 * @returns
 */
function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}
