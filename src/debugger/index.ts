import { parseHTML } from "../compiler/parser/html-parser";
import { tagName } from '../platforms/web/runtime/node-option';


parseHTML(`  <div>
<p>段落一</p>
<p>段落二</p>
<div class="box">
  <div class="content">内容一</div>
  <div>内容二
<div @click="handleClick"></div>
  </div>
</div>
</div>`,{
  start: function(tagName, attrs, start, end) {
    console.log(tagName, attrs, start, end)
  },
  end: function(tagName) {
    console.log(tagName)
  }
})
