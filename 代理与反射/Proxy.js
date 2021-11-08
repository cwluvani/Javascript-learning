// 对外界的访问进行过滤和改写

/**
 * Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，
 * 所以属于一种“元编程”（meta programming），即对编程语言进行编程。
 */

let obj = new Proxy({}, {
    get(target, propKey, receiver) {
        console.log(`getting ${propKey} !`);
        return Reflect.get(target, propKey, receiver);
    },
    set(target, propKey, value, receiver) {
        console.log(`setting ${propKey} !`);
        return Reflect.set(target, propKey, value, receiver);
    }
}); // 为空对象架设拦截，重定义读取的get和设置set行为

obj.count = 1;  // setting count!
++obj.count; // setting count! setting count! 2

// 形式
var proxy = new Proxy(target, handler); //target 是拦截的目标对象；handler是用来定制拦截行为的对象
//第二个参数是一个配置对象，对于每一个被代理的操作，需要提供一个对应的处理函数，该函数将拦截对应的操作。

let proxy = new Proxy({}, {
    get(target, propKey) {
        return 35;
    }
});

proxy.time // 35
proxy.name // 35
proxy.title // 35

let target = {}
let handler = {};

let proxy = new Proxy(target, handler);
proxy.a = 'b'
target.a // "b"

let handler = {
    get(target, name) {
        if (name === 'prototype') {
            return Object.prototype;
        }
        return 'Hello, ' + name;
    },

    apply(target, thisBinding, args) {
        return args[0];
    },

    construct(target, args) {
        return {value: args[1]};
    }
};

let fproxy = new Proxy(function(x, y) {  // fproxy 就是代理后的function obj
    return x + y;
}, handler);

fproxy(1, 2) //1
new fproxy(1, 2) // {value: 2}
fproxy.prototype === Object.prototype // true
fproxy.foo === "Hello, foo"


let person = {
    name: 'jack'
};

let proxy = new Proxy(person, {
    get(target, propKey) {
        if (propKey in target) {
            return target[propKey];
        } else {
            throw new ReferenceError('Prop name " ' + propKey + '" does not exist.');
        }
    }
});

proxy.name // jack
proxy.age // throw a referenceError

// 读取负数索引
function createArray(...elements) {
    let handler = {
        get(target, propKey, receiver) {
            let index = Number(propKey);
            if (index < 0) {
                propKey = String(target.length + index);
            }
            return Reflect.get(target, propKey, receiver);
        }
    };

    let target = [];
    target.push(...elements);
    return new Proxy(target, handler);
}
let arr = createArray('a', 'b', 'c');
arr[-1]; //c


//函数链式调用,将get变为执行某个函数

let pipe = function(value) {
    let funcStack = [];
    let oproxy = new Proxy({}, {
        get(pipeObject, fnName) {
            if (fnName === 'get') {
                return funcStack.reduce(function(val, fn) {
                    return fn(val);
                }, value);
            }
            funcStack.push(window[fnName]);
            return oproxy;
        }
    });
    return oproxy;
}

var double = n => n * 2;
var pow    = n => n * n;
var reverseInt = n => n.toString().split("").reverse().join("") | 0;

pipe(3).double.pow.reverseInt.get; // 63


// get 拦截实现生成各种DOM结点的通用函数dom

const dom = new Proxy({}, {
    get(target, property) {
        return function(attrs = {}, ...children) {
            const el = document.createElement(property);
            for (let prop of Object.keys(attrs)) {
                el.setAttribute(prop, attrs[prop]);
            }
            for (let child of children) {
                if (typeof child === 'string') {
                    child = document.createTextNode(child);
                }
                el.appendChild(child);
            }
            return el;
        }
    }
});

const el = dom.div({},
    'Hello, my name is ',
    dom.a({href: '//example.com'}, 'Mark'),
    '. I like:',
    dom.ul({},
      dom.li({}, 'The web'),
      dom.li({}, 'Food'),
      dom.li({}, '…actually that\'s it')
    )
  );

const proxy = new Proxy({}, {
    get(target, key, receiver) {
        return receiver;
    }
});
proxy.getReceiver === proxy; //true

// 有时，我们会在对象上面设置内部属性，属性名的第一个字符使用下划线开头，
// 表示这些属性不应该被外部使用。结合get和set方法，就可以做到防止这些内部属性被外部读写。

const handler = {
    get(target, key) {
        invariant(key, 'get');
        return target[key];
    },
    set(target, key, value) {
        invariant(key, 'set');
        target[key] = value;
        return true;
    }
};

function invariant(key, action) {
    if (key[0] === '_') {
        throw new Error(``);
    }
}

const target = {};
const proxy = new Proxy(target, handler);
proxy._prop
// Error: Invalid attempt to get private "_prop" property
proxy._prop = 'c'
// Error: Invalid attempt to set private "_prop" property


// apply方法 拦截函数调用、call、apply操作

//apply方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组。


/**
 * 虽然 Proxy 可以代理针对目标对象的访问，但它不是目标对象的透明代理，
 * 即不做任何拦截的情况下，也无法保证与目标对象的行为一致。
 * 主要原因就是在 Proxy 代理的情况下，
 * 目标对象内部的this关键字会指向 Proxy 代理。
 */
const target = {
    m() {
        console.log(this === proxy);
    }
};
const handler = {};
const proxy = new Proxy(target, handler);

target.m() // false
proxy.m()  // true