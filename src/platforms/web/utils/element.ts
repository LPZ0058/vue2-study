import { makeMap } from "../../../core/util/lang";
import { inBrowser } from '../../../core/util/env';

export const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
)

export const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)

/**
 * 验证是否未html的保留元素（这里还没考虑svg元素的情况）
 * @param tag 要验证的tag名字
 * @returns
 */
export function isReservedTag(tag: string): true | undefined {
  return isHTMLTag(tag) || isSVG(tag)
}

/**
 * 判断是否是未知元素，什么是已知元素呢？源码的逻辑是：1. 浏览器的保留元素 2. 自主定制元素（// TODO 待了解(自主定制元素)）
 * 这里先只考虑 1. 浏览器的保留元素
 *
 */
export function isUnknownElement(tag: string): boolean {
  if(!inBrowser) return true
  return !isReservedTag(tag)
}

export const isTextInputType = makeMap(
  'text,number,password,search,email,tel,url'
)
