// 代码嵌入网页

// URL 协议  <a href="javacript: console.log('Hello!')"></a>

// script =>  defer  async    动态加载    解决阻塞
//阻塞是如果外部脚本加载时间很长（一直无法完成下载），那么浏览器就会一直等待脚本下载完成，造成网页长时间失去响应，浏览器就会呈现“假死”状态，这被称为“阻塞效应”。


// 3. 浏览器的组成
/**
 * 核心是两部分：
 * 渲染引擎
 * JavaScript解释器（JavaScript引擎）
 */

/**
 * 渲染引擎处理网页，通常分成四个阶段。
 * 解析代码：HTML 代码解析为 DOM，CSS 代码解析为 CSSOM（CSS Object Model）。
 * 对象合成：将 DOM 和 CSSOM 合成一棵渲染树（render tree）。
 * 布局：计算出渲染树的布局（layout）。
 * 绘制：将渲染树绘制到屏幕。
 */

/**
 * 早期，浏览器内部对 JavaScript 的处理过程如下：
 * 读取代码，进行词法分析（Lexical analysis），将代码分解成词元（token）。
 * 对词元进行语法分析（parsing），将代码整理成“语法树”（syntax tree）。
 * 使用“翻译器”（translator），将代码转为字节码（bytecode）。
 * 使用“字节码解释器”（bytecode interpreter），将字节码转为机器码。
 */

/**
 * 现代浏览器改为采用“即时编译”（Just In Time compiler，缩写 JIT），
 * 即字节码只在运行时编译，用到哪一行就编译哪一行，
 * 并且把编译结果缓存（inline cache）。
 */

// window 对象
/**
 * 1. window 对象是什么
 * 2. window 对象的属性
 * 3. window 对象的方法
 * 4. 事件
 * 5. 多窗口
 */

// window对象是顶层--------所有未声明就赋值的变量都自动变成window对象的属性。


//2 window properties

//window.name属性是一个字符串，表示当前浏览器窗口的名字。
//窗口不一定需要名字，这个属性主要配合超链接和表单的target属性使用。

let popup = window.open();
if ((popup !== null) && !popup.closed) {
    // 窗口仍然打开着
}

window.frames.length === window.length

if(window.parent !== window.top) {
    // 表明低昂前窗口嵌入不止一层
}


// 2.10 组件属性

window.locationbar
window.menubar
window.scrollbars
window.toolbar
window.statusbar
window.personalbar
// ...

// 2.11 全局对象属性

window.document
window.location //url
window.navigator  // 环境信息
window.history
window.localStorage
window.sessionStorage
window.console
window.screen

// 3. window 方法

// 4. 事件

// 5. 多窗口操作

//iframe 元素

// softBinding

if (!Function.prototype.softBind) {
    Function.prototype.softBind = function(obj) {
        let self = this;
        let args = Array.prototype.slice.call(arguments, 1);
        let fn = function() {
            return self.apply(
                (!this || this === (window || global)) ?
                    obj : this
                    ,
                args.concat.apply(args, arguments)
            );
        };
        fn.prototype = Object.create(self.prototype);
        return fn;
    };
}

// 取消显式参数声明

if (!Function.prototype._softBind) {
    Function.prototype._softBind = function() {
        let __self = this;
        let context = Array.prototype.shift.call(arguments);
        let args = Array.prototype.slice.call(arguments, 1);
        
        let fn = function() {
            return __self.apply(
                (!this || this === (window || global)) ?
                    context : this
                    ,
                args.concat.apply(args, arguments)
            );
        };

        fn.prototype = Object.create(__self.prototype);
        return fn;
    };
}

// 测试 softBind
function foo() {
    console.log('name:' + this.name);
}

let obj = {name: 'obj'},
    obj2 = {name: 'obj2'},
    obj3 = {name: 'obj3'};

let fooOBJ = foo._softBind( obj );

fooOBJ(); // name: obj

obj2.foo = foo._softBind(obj);
obj2.foo(); // name: obj2  ==> softBind works

fooOBJ.call(obj3);

setTimeout(obj2.foo, 10);
// name: obj

//软绑定版本的 foo() 可以手动将 this 绑定到 obj2 或者 obj3 上，
//但如果应用默认绑定，则会将 this 绑定到 obj。