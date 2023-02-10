/*
 * @Author: 蓝胖子007 1829390613@qq.com
 * @Date: 2023-02-09 20:09:40
 * @LastEditors: 蓝胖子007 1829390613@qq.com
 * @LastEditTime: 2023-02-09 21:54:41
 * @FilePath: \vue\vue2\src\utils\parsePath.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
// 这个正则表达式是匹配非下划线、数字、字母、.\$的内容（路径字符串中不能出现的东西）。
// 在正则的[]中$就是$, ^是非的意思, . 就是. , \w就是字母，数字，下划线等等
const bailRE = /[^\w.$]/;

export default function parsePath(path:string) :((obj: object) => any) | undefined{
  if(bailRE.test(path)) {
    return;
  }
  const segments:string[] = path.split('.');
  return function (obj: Record<string, any>) : any{
    for(let i=0; i < segments.length; i++) {
      if(!obj) return;
      obj = obj[segments[i]]
    }
    return obj;
  }
}