for循环还有一个特别之处，就是设置循环变量的那部分是一个父作用域，
而循环体内部是一个单独的子作用域。

如果区块中存在let和const命令，
这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。
凡是在声明之前就使用这些变量，就会报错。
(temporal dead zone)

块级作用域的出现，实际上使得获得广泛应用的*匿名立即执行函数表达式*（匿名 IIFE）不再必要了。
IIFE写法

    (function () {
        var tmp = ...;
        ...
    }());

块级作用域写法

    {
        let tmp = ...;
        ...
    }

如果改变了块级作用域内声明的函数的处理规则，显然会对老代码产生很大影响。为了减轻因此产生的不兼容问题，ES6 在附录 B里面规定，浏览器的实现可以不遵守上面的规定，有自己的行为方式。

允许在块级作用域内声明函数。
函数声明类似于var，即会提升到全局作用域或函数作用域的头部。
同时，函数声明还会提升到所在的块级作用域的头部。

    // 浏览器的 ES6 环境
    function f() { console.log('I am outside!'); }
    
    (function () {
    if (false) {
    // 重复声明一次函数f
    function f() { console.log('I am inside!'); }
    }
    
    f();
    }());
    // Uncaught TypeError: f is not a function

**上下类同**

    // 浏览器的 ES6 环境
    function f() { console.log('I am outside!'); }
    (function () {
    var f = undefined;
    if (false) {
    function f() { console.log('I am inside!'); }
    }
    
    f();
    }());
    // Uncaught TypeError: f is not a function

So, 考虑到环境导致的行为差异太大，应该避免在块级作用域内声明函数。
如果确实需要，也应该写成函数表达式，而不是函数声明语句。

const声明的变量不得改变值，这意味着，const一旦声明变量，就必须立即初始化，不能留到以后赋值。
const实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。
对于简单类型的数据（数值、字符串、布尔值），值就保存在变量指向的那个内存地址， 因此等同于常量。
但对于复合类型的数据（主要是对象和数组），变量指向的内存地址，保存的只是一个指向实际数据的指针，
const只能保证这个指针是固定的（即总是指向另一个固定的地址），
至于它指向的数据结构是不是可变的，就完全不能控制了。
因此，将一个对象声明为常量必须非常小心。

如果真的想将对象冻结，应该使用Object.freeze方法。
const foo = Object.freeze({});

// 常规模式时，下面一行不起作用；
// 严格模式时，该行会报错
foo.prop = 123;

除了将对象本身冻结，对象的属性也应该冻结。下面是一个将对象彻底冻结的函数。
var constantize = (obj) => {
Object.freeze(obj);
Object.keys(obj).forEach( (key, i) => {
if ( typeof obj[key] === 'object' ) {
constantize( obj[key] );
}
});
};


ES5 只有两种声明变量的方法：var命令和function命令。
ES6 除了添加let和const命令，
还有另外两种声明变量的方法：import命令和class命令。
所以，ES6 一共有 6 种声明变量的方法。

---

顶层对象，在浏览器环境指的是window对象，在 Node 指的是global对象。
ES5 之中，顶层对象的属性与全局变量是等价的。

顶层对象的属性与全局变量挂钩，被认为是 JavaScript 语言最大的设计败笔之一。
这样的设计带来了几个很大的问题，*首先是没法在编译时就报出变量未声明的错误，
只有运行时才能知道（因为全局变量可能是顶层对象的属性创造的，而属性的创造是动态的）*；
其次，程序员很容易不知不觉地就创建了全局变量（比如打字出错）；
最后，顶层对象的属性是到处可以读写的，这非常不利于模块化编程。
另一方面，window对象有实体含义，指的是浏览器的窗口对象，顶层对象是一个有实体含义的对象，也是不合适的。

let命令、const命令、class命令声明的全局变量， 不属于顶层对象的属性。
也就是说，从 ES6 开始，全局变量将逐步与顶层对象的属性脱钩。

// 方法一
(typeof window !== 'undefined'
? window
: (typeof process === 'object' &&
typeof require === 'function' &&
typeof global === 'object')
? global
: this);

// 方法二
var getGlobal = function () {
if (typeof self !== 'undefined') { return self; }
if (typeof window !== 'undefined') { return window; }
if (typeof global !== 'undefined') { return global; }
throw new Error('unable to locate global object');
};

以上提供两种可以拿到顶层对象的方法

ES2020 在语言标准的层面，引入globalThis作为顶层对象。
也就是说，任何环境下，globalThis都是存在的，
都可以从它拿到顶层对象，指向全局环境下的this。

---

ES6 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为解构（Destructuring）。

本质上，这种写法属于“模式匹配”，只要等号两边的模式相同，左边的变量就会被赋予对应的值。

let [foo, [[bar], baz]] = [1, [[2], 3]];
foo // 1
bar // 2
baz // 3

let [ , , third] = ["foo", "bar", "baz"];
third // "baz"

let [x, , y] = [1, 2, 3];
x // 1
y // 3

let [head, ...tail] = [1, 2, 3, 4];
head // 1
tail // [2, 3, 4]

let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []

如果等号的右边不是数组（或者严格地说，不是可遍历的结构，参见《Iterator》一章），那么将会报错。

对于 Set 结构，也可以使用数组的解构赋值。
事实上，只要某种数据结构具有 Iterator 接口，都可以采用数组形式的解构赋值。


解构赋值允许指定默认值。

注意，ES6 内部使用严格相等运算符（===），判断一个位置是否有值。
所以，只有当一个数组成员严格等于undefined，默认值才会生效。

let [x = 1] = [undefined];
x // 1

let [x = 1] = [null];
x // null

如果默认值是一个表达式，
那么这个表达式是惰性求值的，即只有在用到的时候，才会求值。


* 解构不仅可以用于数组，还可以用于对象。


对象的解构赋值，可以很方便地将现有对象的方法，赋值到某个变量。
// 例一
let { log, sin, cos } = Math;

// 例二
const { log } = console;
log('hello') // hello


let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"
foo // error: foo is not defined
也就是说，对象的解构赋值的内部机制，是先找到同名属性，
然后再赋给对应的变量。真正被赋值的是后者，而不是前者。


如果解构模式是嵌套的对象，而且子对象所在的父属性不存在，那么将会报错。
//报错
let {foo: {bar}} = {baz: 'baz'};


（1）如果要将一个已经声明的变量用于解构赋值，必须非常小心。
// 正确的写法
let x;
({x} = {x: 1});

（2）解构赋值允许等号左边的模式之中，不放置任何变量名。因此，可以写出非常古怪的赋值表达式。

let arr = [1, 2, 3];
let {0 : first, [arr.length - 1] : last} = arr;
first // 1
last // 3

（3）由于数组本质是特殊的对象，因此可以对数组进行对象属性的解构。


函数的参数也可以使用解构赋值。

function move({x = 0, y = 0} = {}) {
return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, 0]
move({}); // [0, 0]
move(); // [0, 0]

解构赋值虽然很方便，但是解析起来并不容易。
对于编译器来说，一个式子到底是模式，还是表达式，
没有办法从一开始就知道，必须解析到（或解析不到）等号才能知道。

由此带来的问题是，如果模式中出现圆括号怎么处理。
ES6 的规则是，只要有可能导致解构的歧义，就不得使用圆括号。

可以使用圆括号的情况
可以使用圆括号的情况只有一种：赋值语句的非模式部分，可以使用圆括号。

[(b)] = [3]; // 正确
({ p: (d) } = {}); // 正确
[(parseInt.prop)] = [3]; // 正确

上面三行语句都可以正确执行，因为首先它们都是赋值语句，而不是声明语句；
其次它们的圆括号都不属于模式的一部分。
第一行语句中，模式是取数组的第一个成员，跟圆括号无关；
第二行语句中，模式是p，而不是d；第三行语句与第一行语句的性质一致。



###解构用途

（1）交换变量的值

let x = 1;
let y = 2;

[x, y] = [y, x];

（2）从函数返回多个值

函数只能返回一个值，如果要返回多个值，只能将它们放在数组或对象里返回。有了解构赋值，取出这些值就非常方便。

// 返回一个数组

function example() {
return [1, 2, 3];
}
let [a, b, c] = example();

// 返回一个对象

function example() {
return {
foo: 1,
bar: 2
};
}
let { foo, bar } = example();


（3）函数参数的定义

解构赋值可以方便地将一组参数与变量名对应起来。

// 参数是一组有次序的值
function f([x, y, z]) { ... }
f([1, 2, 3]);

// 参数是一组无次序的值
function f({x, y, z}) { ... }
f({z: 3, y: 2, x: 1});

（4）提取 JSON 数据

解构赋值对提取 JSON 对象中的数据，尤其有用。

let jsonData = {
id: 42,
status: "OK",
data: [867, 5309]
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
// 42, "OK", [867, 5309]


（5）函数参数的默认值

jQuery.ajax = function (url, {
async = true,
beforeSend = function () {},
cache = true,
complete = function () {},
crossDomain = false,
global = true,
// ... more config
} = {}) {
// ... do stuff
};
指定参数的默认值，就避免了在函数体内部再写var foo = config.foo || 'default foo';这样的语句。


（6）遍历 Map 结构

任何部署了 Iterator 接口的对象，都可以用for...of循环遍历。Map 结构原生支持 Iterator 接口，配合变量的解构赋值，获取键名和键值就非常方便。

const map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
console.log(key + " is " + value);
}
// first is hello
// second is world


（7）输入模块的指定方法

加载模块时，往往需要指定输入哪些方法。解构赋值使得输入语句非常清晰。

const { SourceMapConsumer, SourceNode } = require("source-map");

