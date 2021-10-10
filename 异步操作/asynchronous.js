
// 以往的异步编程

function double(value) {
  setTimeout( () => setTimeout(console.log, 0, value * 2), 1000 );
}

double(3); // 6 (大约1s之后)

//对这个例子而言，1000 毫秒之后，JavaScript 运行时会把回调函数推到自己的消息队列上去等待执行。

//1.异步返回值

function double(value, callback) {
  setTimeout( () => callback(value * 2), 1000);
}
double(3 ,(x) => console.log(`I was given: ${x}`));
// I was given: 6 (after 1000ms)

//这里setTimeout调用告诉 JavaScript 运行时在 1000 毫秒之后把一个函数推到消息队列上。
//这个函数会由运行时负责异步调度执行。而位于函数闭包中的回调及其参数在异步执行时仍然是可用的。

//2.失败处理

function double(value, success, failure) {
  setTimeout( () => {
    try {
      if (typeof value !== 'number') {
        throw 'Must provide number as first argument';
      }
      success(2 * value);
    } catch (e) {
      failure(e);
    }
  }, 1000);
}

const successCallback = (x) => console.log(`Success: ${x}`);
const failureCallback = (x) => console.log(`Failure: ${e}`);

double(3, successCallback, failureCallback);
double('b', successCallback, failureCallback);

//Success: 6
//Failure: Must provide number as first argument


//嵌套异步回调-----回调地狱 QAQ

//11.2 期约

//期约基础

// 的引用类型 Promise，可以通过 new 操作符来实例化。
//创建新期约时需要传入执行器（executor）函数作为参数（后面马上会介绍），
//下面的例子使用了一个空函数对象来应付一下解释器：

let p = new Promise( () => {} );
setTimeout(console.log, 0, p); //Promise <pending>

//是因为如果不提供执行器函数，就会抛出 SyntaxError。



//1. 期约状态机
 待定（pending）
 兑现（fulfilled，有时候也称为“解决”，resolved）
 拒绝（rejected）

// 通过执行函数控制期约  状态

let p1 = new Promise((resolve, reject) => resolve());
setTimeout(console.log, 0, p1); // Promise <resolved>
let p2 = new Promise((resolve, reject) => reject());
setTimeout(console.log, 0, p2); // Promise <rejected>
// Uncaught error (in promise) 

//为避免期约卡在待定状态，可以添加一个定时退出功能。
//比如，可以通过 setTimeout 设置一个10 秒钟后无论如何都会拒绝期约的回调：

let p = new Promise((resolve, reject) => {
  setTimeout(reject, 10000); //after 10s, execute reject
  // fn logic
});

setTimeout(console.log, 0, p);    // Promise <pending>
setTimeout(console.log, 11000, p); // 11s, check out state
//(After 10 seconds) Uncaught error
//(After 11 seconds) Promise <rejected>
//如果执行器中的代码在超时之前已经解决或拒绝，那么超时回调再尝试拒绝也会静默失败。



Promise.resolve()

//期约并非一开始就必须处于待定状态，然后通过执行器函数才能转换为落定状态。
//通过调用Promise.resolve()静态方法，可以实例化一个解决的期约。

let p1 = new Promise( (reject, resolve) => resolve() );
let p2 = Promise.resolve();
// equal

//这个解决的期约的值对应着传给 Promise.resolve()的第一个参数。
//使用这个静态方法，实际上可以把任何值都转换为一个期约：

//对这个静态方法而言，如果传入的参数本身是一个期约，那它的行为就类似于一个空包装。因此，Promise.resolve()可以说是一个幂等方法，

let p = Promise.resolve();

setTimeout(console.log, 0, p === Promise.resolve(p)); //true
setTimeout((console.log, 0, p === Promise.resolve(Promise.resolve(p))); //true

//这个幂等性会保留传入期约的状态：
let p = new Promise(() => {});
setTimeout(console.log, 0, p); // Promise <pending>
setTimeout(console.log, 0, Promise.resolve(p)); // Promise <pending>
setTimeout(console.log, 0, p === Promise.resolve(p)); // true

//Tip: 该静态方法能够包装任何非期约值，包括错误对象，并将其转化为解决的期约，因此也能导致不符合预期的行为

let p = Promise.resolve(new Error('foo'));
setTimeout(console.log, 0, p);
//Promise <resovled>: Error:foo


//5. Promise.reject()

let p1 = new Promise((resolve, reject) => reject());
let p2 = Promise.reject();

//这个拒绝的期约的理由就是传给 Promise.reject()的第一个参数。这个参数也会传给后续的拒绝处理程序：
let p = Promise.reject(3);
setTimeout(console.log, 0, p); // Promise <rejected>: 3
p.then(null, (e) => setTimeout(console.log, 0, e)); // 3

//关键在于，Promise.reject()并没有照搬 Promise.resolve()的幂等逻辑。如果给它传一个期约对象，则这个期约会成为它返回的拒绝期约的理由：
setTimeout(console.log, 0, Promise.reject(Promise.resolve()));
// Promise <rejected>: Promise <resolved>


//6.同步/异步执行的二元性

try {
  throw new Error('foo');
} catch(e) {
  console.log(e); // Error: foo
}

try {
  Promise.reject(new Error('bar'));
} catch(e) {
  console.log(e);
}
//Uncaught (in promise) Error: bar

//**期约真正的异步特性：它们是同步对象（在同步执行模式中使用），但也是异步执行模式的媒介。**



//11.2.3 期约的实例方法

//期约实例的方法是连接外部同步代码与内部异步代码之间的桥梁。
//这些方法可以访问异步操作返回的数据，处理期约成功和失败的结果，连续对期约求值，
//或者添加只有期约进入终止状态时才会执行的代码。

1. 实现Thenable接口
// ECMAScript 暴露的异步结构中，任何对象都有一个 then()方法。
// 这个方法被认为实现了Thenable 接口。下面的例子展示了实现这一接口的最简单的类：
class MyThenable {
  then() {}
}

2. Promise.prototype.then()
//这个 then()方法接收最多两个参数：onResolved 处理程序和 onRejected 处理程序。
//这两个参数都是可选的，如果提供的话，则会在期约分别进入“兑现”和“拒绝”状态时执行。

function onResolved(id) {
  setTimeout(console.log, 0, id, 'resolved');
}
function onRejected(id) {
  setTimeout(console.log, 0, id, 'rejected');
}

let p1 = new Promise((resolve, reject) => setTimeout(resolve, 3000));
let p2 = new Promise((resolve, reject) => setTimeout(reject, 3000));

p1.then(() => onResolved('p1'),
        () => onRejected('p1'));
p2.then(() => onResolved('p2'),
        () => onRejected('p2'));

//p1 resolved
//p2 rejected

//因为期约只能转换为最终状态一次，所以这两个操作一定是互斥的。

//如前所述，两个处理程序参数都是可选的。而且，传给 then()的任何非函数类型的参数都会被静默忽略。
//如果想只提供 onRejected 参数，那就要在 onResolved 参数的位置上传入 undefined。
//这样有助于避免在内存中创建多余的对象，对期待函数参数的类型系统也是一个交代。


function onResolved(id) {
 setTimeout(console.log, 0, id, 'resolved');
}
function onRejected(id) {
 setTimeout(console.log, 0, id, 'rejected');
}
let p1 = new Promise((resolve, reject) => setTimeout(resolve, 3000));
let p2 = new Promise((resolve, reject) => setTimeout(reject, 3000));
// 非函数处理程序会被静默忽略，不推荐
p1.then('gobbeltygook');
// 不传 onResolved 处理程序的规范写法
p2.then(null, () => onRejected('p2'));
// p2 rejected（3 秒后）


Promise.prototype.then()方法返回一个新的期约实例：
let p1 = new Promise(() => {});
let p2 = p1.then();
setTimeout(console.log, 0, p1); // Promise <pending>
setTimeout(console.log, 0, p2); // Promise <pending>
setTimeout(console.log, 0, p1 === p2); // false 

//这个新期约实例基于 onResovled 处理程序的返回值构建。换句话说，该处理程序的返回值会通过
//Promise.resolve()包装来生成新期约。如果没有提供这个处理程序，则 Promise.resolve()就会
//包装上一个期约解决之后的值。如果没有显式的返回语句，则 Promise.resolve()会包装默认的返回值 undefined

let p3 = p1.then(() => undefined);
let p4 = p1.then(() => {});
let p5 = p1.then(() => Promise.resolve());
setTimeout(console.log, 0, p3); // Promise <resolved>: undefined
setTimeout(console.log, 0, p4); // Promise <resolved>: undefined
setTimeout(console.log, 0, p5); // Promise <resolved>: undefined

// 这些都一样
let p6 = p1.then(() => 'bar');
let p7 = p1.then(() => Promise.resolve('bar'));
setTimeout(console.log, 0, p6); // Promise <resolved>: bar
setTimeout(console.log, 0, p7); // Promise <resolved>: bar

// Promise.resolve()保留返回的期约
let p8 = p1.then(() => new Promise(() => {}));
let p9 = p1.then(() => Promise.reject());
// Uncaught (in promise): undefined
setTimeout(console.log, 0, p8); // Promise <pending>
setTimeout(console.log, 0, p9); // Promise <rejected>: undefined

抛出异常会返回拒绝的期约：
...
let p10 = p1.then(() => { throw 'baz'; });
// Uncaught (in promise) baz
setTimeout(console.log, 0, p10); // Promise <rejected> baz
注意，返回错误值不会触发上面的拒绝行为，而会把错误对象包装在一个解决的期约中：
...
let p11 = p1.then(() => Error('qux'));
setTimeout(console.log, 0, p11); // Promise <resolved>: Error: qux 


// onRejected 处理程序也与之类似：onRejected 处理程序返回的值也会被 Promise.resolve()
// 包装。乍一看这可能有点违反直觉，但是想一想，onRejected 处理程序的任务不就是捕获异步错误吗？
// 因此，拒绝处理程序在捕获错误后不抛出异常是符合期约的行为，应该返回一个解决期约。




3. Promise.prototype.catch()
// Promise.prototype.catch()方法用于给期约添加拒绝处理程序。这个方法只接收一个参数：onRejected 处理程序。
// 事实上，这个方法就是一个语法糖，调用它就相当于调用 Promise.prototype.then(null, onRejected)。

下面的代码展示了这两种同样的情况：
let p = Promise.reject();
let onRejected = function(e) {
 setTimeout(console.log, 0, 'rejected');
};
// 这两种添加拒绝处理程序的方式是一样的：
p.then(null, onRejected); // rejected
p.catch(onRejected); // rejected 


Promise.prototype.catch()返回一个新的期约实例


4.Promise.prototype.finally()

// Promise.prototype.finally()方法用于给期约添加 onFinally 处理程序，
// 这个处理程序在期约转换为解决或拒绝状态时都会执行。这个方法可以避免 onResolved 和 onRejected 处理程序中出现冗余代码。
// 但 onFinally 处理程序没有办法知道期约的状态是解决还是拒绝，所以这个方法主要用于添加清理代码。

Promise.prototype.finally()方法返回一个新的期约实例：
let p1 = new Promise(() => {});
let p2 = p1.finally();
setTimeout(console.log, 0, p1); // Promise <pending>
setTimeout(console.log, 0, p2); // Promise <pending>
setTimeout(console.log, 0, p1 === p2); // false 

// 这个新期约实例不同于 then()或 catch()方式返回的实例。因为 onFinally 被设计为一个状态
// 无关的方法，所以在大多数情况下它将表现为父期约的传递。对于已解决状态和被拒绝状态都是如此。


5.非重入期约方法

// 当期约进入落定状态时，与该状态相关的处理程序仅仅会被排期，而非立即执行。跟在添加这个处
// 理程序的代码之后的同步代码一定会在处理程序之前先执行。即使期约一开始就是与附加处理程序关联
// 的状态，执行顺序也是这样的。这个特性由 JavaScript 运行时保证，被称为“非重入”（non-reentrancy）
// 特性。下面的例子演示了这个特性：

// 创建解决的期约
let p = Promise.resolve();
// 添加解决处理程序
// 直觉上，这个处理程序会等期约一解决就执行
p.then(() => console.log('onResolved handler'));
// 同步输出，证明 then()已经返回
console.log('then() returns');
// 实际的输出：
// then() returns
// onResolved handler 

// 在这个例子中，在一个解决期约上调用 then()会把 onResolved 处理程序推进消息队列。
// 但这个处理程序在当前线程上的同步代码执行完成前不会执行。
// 因此，跟在 then()后面的同步代码一定先于处理程序执行。



let synchronousResolve;
// 创建一个期约并将解决函数保存在一个局部变量中
let p = new Promise((resolve) => {
 synchronousResolve = function() {
 console.log('1: invoking resolve()');
 resolve();
 console.log('2: resolve() returns');
 };
});
p.then(() => console.log('4: then() handler executes'));
synchronousResolve();
console.log('3: synchronousResolve() returns');
// 实际的输出：
// 1: invoking resolve()
// 2: resolve() returns
// 3: synchronousResolve() returns
// 4: then() handler executes 


非重入适用于 onResolved/onRejected 处理程序、catch()处理程序和 finally()处理程序。
下面的例子演示了这些处理程序都只能异步执行：

let p1 = Promise.resolve();
p1.then(() => console.log('p1.then() onResolved'));
console.log('p1.then() returns');
let p2 = Promise.reject();
p2.then(null, () => console.log('p2.then() onRejected'));
console.log('p2.then() returns');
let p3 = Promise.reject();
p3.catch(() => console.log('p3.catch() onRejected'));
console.log('p3.catch() returns');
let p4 = Promise.resolve();
p4.finally(() => console.log('p4.finally() onFinally'));
console.log('p4.finally() returns');
// p1.then() returns
// p2.then() returns
// p3.catch() returns
// p4.finally() returns
// p1.then() onResolved
// p2.then() onRejected
// p3.catch() onRejected
// p4.finally() onFinally 


6.临近处理程序的执行顺序

7.传递解决值和拒绝理由

在执行函数中，解决的值和拒绝的理由是分别作为 resolve()和 reject()的第一个参数往后传
的。然后，这些值又会传给它们各自的处理程序，作为 onResolved 或 onRejected 处理程序的唯一
参数。下面的例子展示了上述传递过程：
let p1 = new Promise((resolve, reject) => resolve('foo'));
p1.then((value) => console.log(value)); // foo
let p2 = new Promise((resolve, reject) => reject('bar'));
p2.catch((reason) => console.log(reason)); // bar 


8.拒绝期约与拒绝错误处理



11.2.4 七月连锁与期约合成

// 多个期约组合在一起可以构成强大的代码逻辑。这种组合可以通过两种方式实现：期约连锁与期约合成。
// 前者就是一个期约接一个期约地拼接，后者则是将多个期约组合为一个期约。

1.期约连锁

console.log('拜拜,回调地狱');


2. 期约图
// 因为一个期约可以有任意多个处理程序，所以期约连锁可以构建有向非循环图的结构。
// 这样，每个期约都是图中的一个节点，而使用实例方法添加的处理程序则是有向顶点。
// 因为图中的每个节点都会等待前一个节点落定，所以图的方向就是期约的解决或拒绝顺序。


下面的例子展示了一种期约有向图，也就是二叉树：
// A
// / \
// B C
// /\ /\
// D E F G
let A = new Promise((resolve, reject) => {
 console.log('A');
 resolve();
});
let B = A.then(() => console.log('B'));
let C = A.then(() => console.log('C'));
B.then(() => console.log('D'));
B.then(() => console.log('E'));
C.then(() => console.log('F'));
C.then(() => console.log('G'));
// A
// B
// C
// D
// E
// F
// G


3. Promise.all()和 Promise.race()

// Promise 类提供两个将多个期约实例组合成一个期约的静态方法：Promise.all()和 Promise.race()。
// 而合成后期约的行为取决于内部期约的行为。

异步产生值并将其传给处理程序。基于后续期约使用之前期约的返回值来串联期约是期约的基本功能。
这很像函数合成，即将多个函数合成为一个函数，比如：
function addTwo(x) {return x + 2;}
function addThree(x) {return x + 3;}
function addFive(x) {return x + 5;}
function addTen(x) {
 return addFive(addTwo(addThree(x)));
}
console.log(addTen(7)); // 17 


在这个例子中，有 3 个函数基于一个值合成为一个函数。类似地，期约也可以像这样合成起来，渐
进地消费一个值，并返回一个结果：

function addTwo(x) {return x + 2;}
function addThree(x) {return x + 3;}
function addFive(x) {return x + 5;}
function addTen(x) {
 return Promise.resolve(x)
 .then(addTwo)
 .then(addThree)
 .then(addFive);
}
addTen(8).then(console.log); // 18

使用 Array.prototype.reduce()可以写成更简洁的形式：
function addTwo(x) {return x + 2;}
function addThree(x) {return x + 3;}
function addFive(x) {return x + 5;}
function addTen(x) {
 return [addTwo, addThree, addFive]
 .reduce((promise, fn) => promise.then(fn), Promise.resolve(x));
}
addTen(8).then(console.log); // 18 

这种模式可以提炼出一个通用函数，可以把任意多个函数作为处理程序合成一个连续传值的期约连
锁。这个通用的合成函数可以这样实现：
function addTwo(x) {return x + 2;}
function addThree(x) {return x + 3;}
function addFive(x) {return x + 5;}

function compose(...fns) {
  return (x) => fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(x))
}
let addTen = compose(addTwo, addThree, addFive);
addTen(8).then(console.log); //18



11.2.5 期约扩展
// ES6 期约实现是很可靠的，但它也有不足之处。比如，很多第三方期约库实现中具备而 ECMAScript
// 规范却未涉及的两个特性：期约取消和进度追踪。



11.3 异步函数

//异步函数，也称为" async/await ", 是 ES6 期约模式在 ECMAScript 函数中的应用。

//让以同步方式写的代码能够异步执行。
//example:
let p = new Promise( (resolve, reject) => setTimeout(resolve, 1000, 3) );

p.then((x) => console.log(x)); //3

function handler(x) {console.log(x);}
let p = new Promise((resolve, reject) => setTimeout(resolve, 1000, 'resolved'));
p.then(handler); //resolved

// 为了在同步代码实现异步，ES8提供了 async/await关键字

async function foo() {}

let bar = async function() {}

let baz = async () => {}

class Qux {
  async qux() {}
}

// 使用 async 关键字可以让函数具有异步特征，但总体上其代码仍然是同步求值的。
// 而在参数或闭包方面，异步函数仍然具有普通 JavaScript 函数的正常行为。
// 正如下面的例子所示，foo()函数仍然会在后面的指令之前被求值：

async function foo() {
  console.log(1);
}
foo();
console.log(2);

//1
//2

// 不过，异步函数如果使用 return 关键字返回了值（如果没有 return 则会返回 undefined），
// 这个值会被 Promise.resolve()包装成一个期约对象。
// 异步函数始终返回期约对象。在函数外部调用这个函数可以得到它返回的期约：

async function foo() {
  console.log(1);
  return 3;
}
// 给返回的期约添加一个解决处理程序
foo().then(console.log);
console.log(2);

//1 //2 //3

// tip：直接返回一个期约对象也是一样的：
async function foo() {
  console.log(1);
  return Promise.resolve(3);
}

foo().then(console.log);

console.log(2);

// 异步函数的返回值期待（但实际上并不要求）一个实现 thenable 接口的对象，但常规的值也可以。
// 如果返回的是实现 thenable 接口的对象，则这个对象可以由提供给 then()的处理程序“解包”。
// 如果不是，则返回值就被当作已经解决的期约。下面的代码演示了这些情况：

async function foo() {
  return 'foo';
}
foo().then(console.log); //foo

async function bar() {
  return ['bar'];
} // 返回一个没有实现thenable接口的对象
bar().then(console.log); //['bar']

async function baz() {
  const thenable = {
    then(callback) { callback('baz'); }
  };
  return thenable;
}
baz().then(console.log); //baz

// 返回一个期约
async function qux() {
 return Promise.resolve('qux');
}
qux().then(console.log);
// qux

// 与在期约处理程序中一样，在异步函数中抛出错误会返回拒绝的期约：
async function foo() {
 console.log(1);
 throw 3;
}

// 给返回的期约添加一个拒绝处理程序
foo().catch(console.log);
console.log(2);
// 1
// 2
// 3 

// 不过，拒绝期约的错误不会被异步函数捕获：
async function foo() {
 console.log(1);
 Promise.reject(3);
}
// Attach a rejected handler to the returned promise
foo().catch(console.log);
console.log(2);
// 1
// 2
// Uncaught (in promise): 3


2. await

// 因为异步函数主要针对不会马上完成的任务，所以自然需要一种暂停和恢复执行的能力。
// 使用 await关键字可以暂停异步函数代码的执行，     **等待期约解决**。

let p = new Promise((resolve, reject) => setTimeout(resolve, 1000, 3));
p.then((x) => console.log(x)); // 3

//使用 async/await 可以写成这样：
async function foo() {
 let p = new Promise((resolve, reject) => setTimeout(resolve, 1000, 3));
 console.log(await p);
}
foo();
// 3 

// 注意，await 关键字会暂停执行异步函数后面的代码，让出 JavaScript 运行时的执行线程。
// 这个行为与生成器函数中的 yield 关键字是一样的。
// await 关键字同样是尝试“解包”对象的值，然后将这个值传给表达式，再异步恢复异步函数的执行。

// await 关键字期待（但实际上并不要求）一个实现 thenable 接口的对象，但常规的值也可以。如
// 果是实现 thenable 接口的对象，则这个对象可以由 await 来“解包”。如果不是，则这个值就被当作
// 已经解决的期约。下面的代码演示了这些情况：

// 等待一个原始值
async function foo() {
 console.log(await 'foo');
}
foo();
// foo

// 等待一个没有实现 thenable 接口的对象
async function bar() {
 console.log(await ['bar']);
}
bar();
// ['bar']

// 等待一个实现了 thenable 接口的非期约对象
async function baz() {
 const thenable = {
 then(callback) { callback('baz'); }
 };
 console.log(await thenable);
}
baz();
// baz

// 等待一个期约
async function qux() {
 console.log(await Promise.resolve('qux'));
}
qux();
// qux

// 等待会抛出错误的同步操作，会返回拒绝的期约：
async function foo() {
 console.log(1);
 await (() => { throw 3; })();
}
// 给返回的期约添加一个拒绝处理程序
foo().catch(console.log);
console.log(2);
// 1
// 2
// 3

// 如前面的例子所示，单独的 Promise.reject()不会被异步函数捕获，而会抛出未捕获错误。不
// 过，对拒绝的期约使用 await 则会释放（unwrap）错误值（将拒绝期约返回）：
async function foo() {
 console.log(1);
 await Promise.reject(3);
 console.log(4); // 这行代码不会执行
}

// 给返回的期约添加一个拒绝处理程序
foo().catch(console.log);
console.log(2);
// 1
// 2
// 3 

3. await 的限制

// await 关键字必须在异步函数中使用，不能在顶级上下文如<script>标签或模块中使用。
// 不过，定义并立即调用异步函数是没问题的。下面两段代码实际是相同的：
async function foo() {
  console.log(await Promise.resolve(3));
}
foo(); //3

(async function() {
  console.log(await Promise.resolve(3));
}) (); //3

// 此外，异步函数的特质不会扩展到嵌套函数。
// 因此，await 关键字也只能直接出现在异步函数的定义中。
// 在同步函数内部使用 await 会抛出 SyntaxError。



11.3.2 停止和恢复执行   //let's work!!

// 使用 await 关键字之后的区别其实比看上去的还要微妙一些。
// 比如，下面的例子中按顺序调用了3个函数，但它们的输出结果顺序是相反的：

async/await 中真正起作用的是 await。async 关键字，无论从哪方面来看，都不过是一个标识符。
毕竟，异步函数如果不包含 await 关键字，其执行基本上跟普通函数没有什么区别：

要完全理解 await 关键字，必须知道它并非只是等待一个值可用那么简单。
JavaScript 运行时在碰到 await 关键字时，会记录在哪里暂停执行。
等到 await 右边的值可用了，JavaScript 运行时会向消息队列中推送一个任务，这个任务会恢复异步函数的执行。
因此，即使 await 后面跟着一个立即可用的值，函数的其余部分也会被异步求值。
// 消息队列任务 & 主线程任务
// 下面的例子演示了这一点：

async function foo() {
  console.log(2);
  await null;
  console.log(4);
}

console.log(1);
foo();
console.log(3);

//1 2 3 4

// 控制台中输出结果的顺序很好地解释了运行时的工作过程：
// (1) 打印 1；
// (2) 调用异步函数 foo()；
// (3)（在 foo()中）打印 2；
// (4)（在 foo()中）await 关键字暂停执行，为立即可用的值 null 向消息队列中添加一个任务；
// (5) foo()退出；
// (6) 打印 3；
// (7) 同步线程的代码执行完毕；
// (8) JavaScript 运行时从消息队列中取出任务，恢复异步函数执行；
// (9)（在 foo()中）恢复执行，await 取得 null 值（这里并没有使用）；
// (10)（在 foo()中）打印 4；
// (11) foo()返回。


如果 await 后面是一个期约，则问题会稍微复杂一些。
此时，为了执行异步函数，实际上会有两个任务被添加到消息队列并被异步求值。

// 下面的例子虽然看起来很反直觉，但它演示了真正的执行顺序：

注： 
//TC39 对 await 后面是期约的情况如何处理做过一次修改。修改后，本例中的 Promise.resolve(8)只会生成一个
//异步任务。因此在新版浏览器中，这个示例的输出结果为 123458967。实际开发中，对于并行的异步操作我们通常
//更关注结果，而不依赖执行顺序。

async function foo() {
  console.log(2);
  console.log(await Promise.resolve(8));
  console.log(9);
}
async function bar() {
  console.log(4);
  console.log(await 6);
  console.log(7);
}

console.log(1);
foo();
console.log(3);
bar();
console.log(5);

// 1 2 3 4 5 6 7 8 9

// 运行时会像这样执行上面的例子：

// (1) 打印 1；
// (2) 调用异步函数 foo()；
// (3)（在 foo()中）打印 2；
// (4)（在 foo()中）await 关键字暂停执行，向消息队列中添加一个期约在落定之后执行的任务；
// (5) 期约立即落定，把给 await 提供值的任务添加到消息队列；
// (6) foo()退出；
// (7) 打印 3；
// (8) 调用异步函数 bar()；
// (9)（在 bar()中）打印 4；
// (10)（在 bar()中）await 关键字暂停执行，为立即可用的值 6 向消息队列中添加一个任务；
// (11) bar()退出；
// (12) 打印 5；
// (13) 顶级线程执行完毕；
// (14) JavaScript 运行时从消息队列中取出解决 await 期约的处理程序，并将解决的值 8 提供给它；
// (15) ##JavaScript 运行时向消息队列中添加一个恢复执行 foo()函数的任务；
// (16) JavaScript 运行时从消息队列中取出恢复执行 bar()的任务及值 6；
// (17)（在 bar()中）恢复执行，await 取得值 6；
// (18)（在 bar()中）打印 6；
// (19)（在 bar()中）打印 7；
// (20) bar()返回；
// (21) 异步任务完成，JavaScript 从消息队列中取出恢复执行 foo()的任务及值 8；
// (22)（在 foo()中）打印 8；
// (23)（在 foo()中）打印 9；
// (24) foo()返回。


11.3.3 异步函数策略

1. 实现sleep

async function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function foo() {
  const t0 = Date.now();
  await sleep(1500);
  console.log(Date.now() - t0);
}
foo();
// 1502

2. 利用平行执行

3. 串行执行期约

4. 栈追踪与内存管理

