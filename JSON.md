##JSON 用于数据交换的文本格式

**规范**

1. 复合类型的值只能是数组或对象，不能是函数、正则表达式对象、日期对象。

2. 原始类型的值只有四种：字符串、数值（必须以十进制表示）、布尔值和null（不能使用NaN, Infinity, -Infinity和undefined）。

3. 字符串必须使用双引号表示，不能使用单引号。

4. 对象的键名必须放在双引号里面。

5. 数组或对象最后一个成员的后面，不能加逗号。

---

* JSON对象是 JavaScript 的原生对象，
  用来处理 JSON 格式数据。它有两个静态方法：JSON.stringify()和JSON.parse()。
  
  * JSON.stringify()
    用于将一个值转为 JSON 字符串。该字符串符合 JSON 格式，并且可以被JSON.parse()方法还原。
    
    * tips: 
      * 如果对象的属性是undefined、函数或 XML 对象，该属性会被JSON.stringify()过滤。
      * 如果数组的成员是undefined、函数或 XML 对象，则这些值被转成null。
      * 正则对象会被转成空对象。
      * JSON.stringify()方法会忽略对象的不可遍历的属性。
        *     var obj = {};
              Object.defineProperties(obj, {
                'foo': {
                  value: 1,
                  enumerable: true
                },
                'bar': {
                  value: 2,
                  enumerable: false
                }
              });
  
              JSON.stringify(obj); // "{"foo":1}"
    
    * 第二个参数
      * 指定参数对象的哪些属性需要转成字符串。
    * 第三个参数
      * 用于增加返回的 JSON 字符串的可读性。
    * 参数对象的 toJSON() 方法
      * 如果参数对象有自定义的toJSON()方法，那么JSON.stringify()会使用这个方法的返回值作为参数，而忽略原对象的其他属性。
      * toJSON()方法的一个应用是，将正则对象自动转为字符串。因为JSON.stringify()默认不能转换正则对象，但是设置了toJSON()方法以后，就可以转换正则对象了。
  
  * JSON.parse() 将 JSON 字符串转换成对应的值。
    为了处理解析错误，可以将JSON.parse()方法放在try...catch代码块中。
      
      try {
      JSON.parse("'String'");
      } catch(e) {
      console.log('parsing error');
      }
    
    * JSON.parse()方法可以接受一个处理函数，作为第二个参数，用法与JSON.stringify()方法类似。
    
    
    