#概念

###JavaScript 原有的表示“集合”的数据结构，
###主要是数组（Array）和对象（Object），ES6 又添加了Map和Set。

所以我们需要一种可以统一集合类型的**接口机制**，来处理所有不同的数据结构

遍历器（Iterator）就是这样一种机制。它是一种**接口**，为各种不同的数据结构**提供统一的访问机制。**
任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。

Iterator 的作用有三个：一是为各种数据结构，提供一个统一的、简便的访问接口；
二是使得数据结构的成员能够按某种次序排列；
三是 ES6 创造了一种新的遍历命令for...of循环，Iterator 接口主要供for...of消费。

Iterator 的遍历过程是这样的。

（1）**创建一个指针对象，指向当前数据结构的起始位置**也就是说，
    **遍历器对象本质上，就是一个指针对象。**

（2）第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。

（3）第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。

（4）不断调用指针对象的next方法，直到它指向数据结构的结束位置。

每一次调用next方法，都会返回数据结构的当前成员的信息。
具体来说，就是返回一个包含value和done两个属性的对象。
其中，value属性是当前成员的值，done属性是一个布尔值，表示遍历是否结束。

    let it = makeIterator(['a','b']);
    it.next();   // {value:'a', done: false}
    it.next();   // {value:'b', done:  false}
    it.next();   // {value:undefined, done: true}

    function makeIterator(array) {
        let nextIndex = 0;
        return {
            next: function() {
                return nextIndex < array.length ? 
                    {value: array[nextIndex++], done: false}:
                    {value: undefined, done: true};
            }
        }
    }
上面的实例模拟了next返回值。

**由于 Iterator 只是把接口规格加到数据结构之上，
所以，遍历器与它所遍历的那个数据结构，实际上是分开的，
完全可以写出没有对应数据结构的遍历器对象，或者说用遍历器对象模拟出数据结构。**

    let imitIter = idMaker();
    imitIter.next().value;
    ***无限向下写
    
    function idMaker() {
        let index = 0;
        return {
            next: function() {
                return {value: index++, done: false};
            }
        };
    }
上面的例子中，遍历器生成函数idMaker，返回一个遍历器对象（即指针对象）。
但是并没有对应的数据结构，或者说，遍历器对象自己描述了一个数据结构出来。

# 默认Iterator接口

Iterator 接口的目的，就是为所有数据结构，**提供了一种统一的访问机制**，即for...of循环（详见下文）。
**当使用for...of循环遍历某种数据结构时，该循环会自动去寻找 Iterator 接口。**

一种数据结构只要部署了Iterator 接口，我们就称这种数据结构是“可遍历的”（iterable）。

ES6 规定，默认的 Iterator 接口部署在数据结构的Symbol.iterator属性，
或者说，一个数据结构只要具有Symbol.iterator属性，就可以认为是“可遍历的”（iterable）

Symbol.iterator属性本身是一个函数，**就是当前数据结构默认的遍历器生成函数。**
执行这个函数，就会返回一个遍历器。
至于属性名Symbol.iterator，它是一个表达式，返回Symbol对象的iterator属性，
这是一个预定义好的、类型为 Symbol 的特殊值，所以要放在方括号内.
    
    const obj = {
        [Symbol.iterator] : function() {
            return {
                next: function() {
                    return {
                        value: 1,
                        done: true
                    };
                }
            };
        }
    };

上面代码中，对象obj是可遍历的（iterable），**因为具有Symbol.iterator属性** 执行这个属性，会返回一个遍历器对象。
该对象的根本特征就是具有next方法。每次调用next方法，都会返回一个代表当前成员的信息对象，具有value和done两个属性。

ES6 的有些数据结构原生具备 Iterator 接口（比如数组），即不用任何处理，就可以被for...of循环遍历。
原因在于，这些数据结构原生部署了Symbol.iterator属性（详见下文），另外一些数据结构没有（比如对象）。
凡是部署了Symbol.iterator属性的数据结构，就称为部署了遍历器接口。**调用这个接口，就会返回一个遍历器对象。**

原生具备 Iterator 接口的数据结构如下。

* Array
* Map
* Set
* String
* TypedArray
* 函数的 arguments 对象
* NodeList 对象


    let arr = [];
    let iter = arr[Symbol.iterator]();

    iter.next();
    //...
arr是一个数组，原生就有遍历器接口，部署在arr的Symbol.iterator属性上面。
所以，调用这个属性，就得到**遍历器对象。**

除了有原生Iterator接口的数据结构，其他数据结构（**主要是对象**）的Iterator接口都需要自己在Symbol.iterator属性上面部署，这样才会被for...of循环遍历
对象（Object）之所以没有默认部署 Iterator 接口，
是因为对象的哪个属性先遍历，哪个属性后遍历是不确定的，需要开发者手动指定。

遍历器是一种线性处理，对于任何非线性的数据结构，部署遍历器接口，就等于部署一种线性转换。
对象部署遍历器接口并不是很必要，因为这时对象实际上被当作 Map 结构使用，ES5 没有 Map 结构，而 ES6 原生提供了。

    class RangeIterator {
        constructor(start, stop) {
            this.value = start;
            this.stop = stop;
        }
        
        [Symbol.iterator]() {return this; }
        next() {
            var value = this.value;
            if (value < this.stop) {
                this.value++;
                return {done: false, value: value};
            }
            return {done: true, value: undefined};
        }
    }

    function range(start, stop) {
        return new RangeIterator(start, stop);
    }
    
    for (var value of range(0, 3)) {
        console.log(value);
    }
上面代码是一个类部署 Iterator 接口的写法。Symbol.iterator属性对应一个函数，执行后返回当前对象的遍历器对象。

    let obj = {
        data: ['hello', 'world'],
        [Symbol.iterator]() {
            const self = this;
            let index = 0;
            return {
                next() {
                    if (index < self.data.length) {
                        return {
                            value:self.data[index++],
                            done:false
                        };
                    }
                    return {value: undefined, done: true};
                }
            };
        }
    };
为对象添加 Iterator 接口

对于类数组对象（存在数值键名和length属性），部署Iterator接口，有一个简便的方法，
**Symbol.iterator方法直接引用数组的Iterator接口**

    NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    // 或者
    NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];
    
    [...document.querySelectorAll('div')]  // works

NodeList 对象是类似数组的对象，本来就具有遍历接口，可以直接遍历。
上面代码中，我们将它的遍历接口改成数组的Symbol.iterator属性，可以看到没有任何影响。

另一个例子

    let iterable = {
        0: 'a',
        1: 'b',
        2: 'c',
        length: 3,
        [Symbol.iterator]: Array.prototype[Symbol.iterator]
    }
    for (let item of iterable) {
        console.log(item);
    }

注意，普通对象部署数组的Symbol.iterator方法，并无效果。


**如果Symbol.iterator方法对应的不是遍历器生成函数（即会返回一个遍历器对象），解释引擎将会报错。**

    var obj = {};
    obj[Symbol.iterator] = () => 1;
    [...obj]; //typeError: [] is not a function

变量obj的Symbol.iterator方法对应的不是遍历器生成函数，因此报错。

#调用Iterator接口的场合

（1）解构赋值

对数组和 Set 结构进行解构赋值时，会默认调用Symbol.iterator方法。

    let set = new Set().add('a').add('b').add('c');
    
    let [x,y] = set;
    // x='a'; y='b'
    
    let [first, ...rest] = set;
    // first='a'; rest=['b','c'];

（2）扩展运算符

扩展运算符（...）也会调用默认的 Iterator 接口。

    // 例一
    var str = 'hello';
    [...str] //  ['h','e','l','l','o']
    
    // 例二
    let arr = ['b', 'c'];
    ['a', ...arr, 'd']
    // ['a', 'b', 'c', 'd']

上面代码的扩展运算符内部就调用 Iterator 接口。

>实际上，这提供了一种简便机制，可以将任何部署了 Iterator 接口的数据结构，转为数组。
也就是说，只要某个数据结构部署了 Iterator 接口，就可以对它使用扩展运算符，将其转为数组。
`let arr = [...iterable]`

（3）yield*

yield*后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。
    
    let generator = function* () {
        yield 1;
        yield* [2,3,4];
        yield 5;
    };
    
    var iterator = generator();
    
    iterator.next() // { value: 1, done: false }
    iterator.next() // { value: 2, done: false }
    iterator.next() // { value: 3, done: false }
    iterator.next() // { value: 4, done: false }
    iterator.next() // { value: 5, done: false }
    iterator.next() // { value: undefined, done: true }

（4）其他场合

由于数组的遍历会调用遍历器接口，所以任何接受数组作为参数的场合，其实都调用了遍历器接口。下面是一些例子。
    
    for...of
    Array.from()
    Map(), Set(), WeakMap(), WeakSet()（比如new Map([['a',1],['b',2]])）
    Promise.all()
    Promise.race()

#字符串的Iterator接口
    
可以覆盖原生的Symbol.iterator方法，达到修改遍历器行为的目的

    var str = new String("hi");
    [...str] // ["h", "i"]

    str[Symbol.iterator] = function() {
        return {
            next: function() {
                if (this._first) {
                    this._first = false;
                    return {value: 'bye', done: false};
                } else {
                    return {done: true}
                }
            },
            _first: true
        };
    };

    [...str] //['bye']
    str // 'hi'

#Iterator 接口与 Generator 函数

    let myIterable = {
    [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
    }
    };
    [...myIterable] // [1, 2, 3]

    // 或者采用下面的简洁写法

    let obj = {
    * [Symbol.iterator]() {
      yield 'hello';
      yield 'world';
      }
      };
    
    for (let x of obj) {
    console.log(x);
    }
    // "hello"
    // "world"

# 遍历器对象的 return()，throw()

return()方法的使用场合是，如果for...of循环提前退出（通常是因为出错，或者有break语句），就会调用return()方法。如果一个对象在完成遍历前，需要清理或释放资源，就可以部署return()方法。

    function readLinesSync(file) {
    return {
    [Symbol.iterator]() {
    return {
    next() {
    return { done: false };
    },
    return() {
    file.close();
    return { done: true };
    }
    };
    },
    };
    }
    
    for (let line of readLinesSync(fileName)) {
    console.log(line);
    break;
    }
    
    // 情况二
    for (let line of readLinesSync(fileName)) {
    console.log(line);
    throw new Error();
    }

##普通对象

    let es6 = {
    edition: 6,
    committee: "TC39",
    standard: "ECMA-262"
    };
    
    for (let e in es6) {
    console.log(e);
    }
    // edition
    // committee
    // standard
    
    for (let e of es6) {
    console.log(e);
    }
    // TypeError: es6[Symbol.iterator] is not a function


































