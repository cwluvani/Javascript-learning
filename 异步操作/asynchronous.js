
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
















































