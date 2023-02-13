import Watcher from '../core/observer/watcher';
/*
 * @Author: 蓝胖子007 1829390613@qq.com
 * @Date: 2023-02-09 20:51:25
 * @LastEditors: 蓝胖子007 1829390613@qq.com
 * @LastEditTime: 2023-02-09 21:11:21
 * @FilePath: \vue\vue2\src\typings.d.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
export {}
declare global {
  interface Window { target: Watcher | undefined; }
}
