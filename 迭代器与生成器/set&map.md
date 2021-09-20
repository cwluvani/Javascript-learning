#Set
ES6 提供了新的数据结构 Set。它类似于数组，但是**成员的值都是唯一的，没有重复的值**。
Set本身是一个构造函数，用来生成 Set 数据结构。
    
    const s = new Set();
    [2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));
    for (for i of s) {
        console.log(i);
    } // 2 3 5 4

Set函数可以接受一个数组（**或者具有 iterable 接口的其他数据结构**）作为参数，用来初始化
    
    const set = new Set([1,2,3,4,5,6]);
    [...set]
    
    const set = new Set( document.querySelectorAll('div') );
    set.size // 56
    ==> 等同于
    const set = new Set();
    document.querySelectorAll('div')
            .forEach(div => set.add(div));
    set.size //56

##This expose a new method to cut the repeat member
** `[...new Set(array)]` **

###上面的方法也可以用于，去除字符串里面的重复字符。
    `[...new Set('ababbc')].join('')`

##Set实例的属性和方法

- Set.prototype.constructor：构造函数，默认就是Set函数。
- Set.prototype.size：返回Set实例的成员总数。
  
- Set 实例的方法分为两大类：操作方法（用于操作数据）和遍历方法（用于遍历成员）。下面先介绍四个操作方法。
    - Set.prototype.add(value)：添加某个值，返回 Set 结构本身。
    - Set.prototype.delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
    - Set.prototype.has(value)：返回一个布尔值，表示该值是否为Set的成员。
    - Set.prototype.clear()：清除所有成员，没有返回值。
  
example:

    s.add(1).add(2).add(2)
    s.size // 2    ** note : set structure shouldn't have the repeat member
  
**Array.from**方法可以将 Set 结构转为数组。
  
    const items = new Set([1, 2, 3, 4, 5, 5])
    const array = Array.from(items);

这就提供了去除数组重复成员的另一种方法。

    function dedupe(array) {
      return Array.from(new Set(array));
    }
    dedupe([1,1,2,3,4]) // [1,2,3,4]

遍历操作
Set 结构的实例有四个遍历方法，可以用于遍历成员。

* Set.prototype.keys()：返回键名的遍历器
* Set.prototype.values()：返回键值的遍历器
* Set.prototype.entries()：返回键值对的遍历器
* Set.prototype.forEach()：使用回调函数遍历每个成员

Set的遍历顺序就是插入顺序。这个特性有时非常有用，
比如使用 Set 保存一个回调函数列表，调用时就能保证按照添加顺序调用。


keys方法、values方法、entries方法返回的都是遍历器对象
*Set 结构没有键名，只有键值（或者说键名和键值是同一个值），所以keys方法和values方法的行为完全一致。*

    let set = new Set(['red', 'green', 'blue']
    for (let item of set.keys()) {
      console.log(item);
    }
    ==
    for (let item of set.values()) {
      console.log(item);
    }

    for (let item of set.entries()) {
      console.log(item);
    }

Set 结构的实例默认可遍历，它的默认遍历器生成函数就是它的values方法。
这意味着，可以省略values方法，直接用for...of循环遍历 Set。
    
    Set.prototype[Symbol.iterator] === Set.prototype.values
Symbol.iterator :
Whenever an object needs to be iterated (such as at the beginning of a for..of loop), 
its @@iterator method is called with no arguments, 
and the returned iterator is used to obtain the values to be iterated.

###遍历的应用
*扩展运算符（...）*内部使用for...of循环，所以也可以用于 Set 结构。
扩展运算符和 Set 结构相结合，就可以去除数组的重复成员。
  
    let arr = [3,5,2,2,5,5],
    let unique = [...new Set(arr)];
    // [3,5,2]

而且，数组的map和filter方法也可以间接用于 Set 了。

因此使用 Set 可以很容易地实现并集（Union）、交集（Intersect）和差集（Difference）。
  
    let a = new Set([1,2,3])
    let b = new Set([4, 3, 2])
    
    let union = new Set([...a, ...b]);
    let intersect = new Set([...a].filter(x => b.has(x)));
    let difference = new Set([...a].filter(x => !b.has(x)));

如果想在遍历操作中，同步改变原来的 Set 结构，目前没有直接的方法，
但有两种变通方法。一种是利用原 Set 结构映射出一个新的结构，然后赋值给原来的 Set 结构；
另一种是利用Array.from方法。

    // 方法一
    let set = new Set([1, 2, 3]);
    set = new Set([...set].map(val => val * 2));
    // set的值是2, 4, 6
    
    // 方法二
    let set = new Set([1, 2, 3]);
    set = new Set(Array.from(set, val => val * 2));
    // set的值是2, 4, 6


## WeakSet

与set有两个区别：
1. 首先，WeakSet 的成员只能是对象，而不能是其他类型的值。
2. WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用，
   也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，
   不考虑该对象还存在于 WeakSet 之中。

因为垃圾回收机制根据对象的可达性（reachability）来判断回收，如
果对象还能被访问到，垃圾回收机制就不会释放这块内存。

因此，WeakSet 适合临时存放一组对象，以及存放跟对象绑定的信息。
只要这些对象在外部消失，它在 WeakSet 里面的引用就会自动消失。

WeakSet 的成员是不适合引用的，因为它会随时消失。
另外，由于 WeakSet 内部有多少个成员，取决于垃圾回收机制有没有运行，
运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的，
因此 ES6 规定 WeakSet 不可遍历。

    const foos = new WeakSet();
    class Foo {
      constructor() {
        foos.add(this);
      }
      method () {
        if (!foos.has(this)) {
          throw new TypeError('Foo.prototypr.method 只能在Foo的实例上调用！')
        }
      }
    }

上面代码保证了Foo的实例方法，只能在Foo的实例上调用。
这里使用 WeakSet 的好处是，foos对实例的引用，不会被计入内存回收机制，
所以删除实例的时候，不用考虑foos，也不会出现内存泄漏。

## Map

JavaScript 的对象（Object），本质上是键值对的集合（Hash 结构），
但是**传统上只能用字符串当作键**。这给它的使用带来了很大的限制。

ES6 提供了 Map 数据结构。它类似于对象，也是键值对的集合，
但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。
也就是说，Object 结构提供了“字符串—值”的对应，
Map 结构提供了“值—值”的对应，是一种更完善的 Hash 结构实现。
如果你需要“键值对”的数据结构，Map 比 Object 更合适。

作为构造函数，Map 也可以接受一个数组作为参数。该数组的成员是一个个表示键值对的数组。

    const map = new Map([
    ['name', '张三'],
    ['title', 'Author']
    ]);
    
    map.size // 2
    map.has('name') // true
    map.get('name') // "张三"
    map.has('title') // true
    map.get('title') // "Author"

Map构造函数接受数组作为参数，实际上执行的是下面的算法。

    const items = [ ['name', 'zhangsan'], ['title', 'Author'] ];
    
    const map = new Map();
    
    items.forEach(
        ([key, value]) => map.set(key, value)
    );

事实上，不仅仅是数组，任何具有 Iterator 接口、
且每个成员都是一个**双元素的数组的数据结构**（详见《Iterator》一章）都可以当作Map构造函数的参数。
这就是说，Set和Map都可以用来生成新的 Map。

    const set = ([
        ['foo', 1]
        ['bar', 2]
    ])
    const m1 = new Map(set);
    m1.get('foo') //1
    
    const m2 = new Map([ ['baz', 3] ])
    const m3 = new Map(m2)

    m3.get('baz') // 3


注意，只有对同一个对象的引用，Map 结构才将其视为同一个键。这一点要非常小心。

    const map = new Map();

    map.set(['a'], 555);
    map.get(['a']) // undefined

Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。
这就解决了同名属性碰撞（clash）的问题，
我们扩展别人的库的时候，如果使用对象作为键名，就不用担心自己的属性与原作者的属性同名。

如果 Map 的键是一个简单类型的值（数字、字符串、布尔值），
则只要两个值严格相等，Map 将其视为一个键，比如0和-0就是一个键，
布尔值true和字符串true则是两个不同的键。
另外，undefined和null也是两个不同的键。
虽然NaN不严格相等于自身，但 Map 将其视为同一个键。

    let map = new Map();

    map.set(-0, 123);
    map.get(+0) // 123
    
    map.set(true, 1);
    map.set('true', 2);
    map.get(true) // 1
    
    map.set(undefined, 3);
    map.set(null, 4);
    map.get(undefined) // 3
    
    map.set(NaN, 123);
    map.get(NaN) // 123

###实例的属性和操作方法

1. size属性
返回Map结构的成员总数
   
2. Map.prototype.set(key, value)

set方法设置键名key对应的键值为value，然后返回整个 Map 结构。
如果key已经有值，则键值会被更新，否则就新生成该键。

3. Map.prototype.get(key)

get方法读取key对应的键值，如果找不到key，返回undefined。

4. Map.prototype.has(key)

has方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。

5. Map.prototype.delete(key)

delete方法删除某个键，返回true。如果删除失败，返回false。

6. Map.prototype.clear()

clear方法清除所有成员，没有返回值。


###遍历方法

Map 结构原生提供三个遍历器生成函数和一个遍历方法。

* Map.prototype.keys()：返回键名的遍历器。
* Map.prototype.values()：返回键值的遍历器。
* Map.prototype.entries()：返回所有成员的遍历器。
* Map.prototype.forEach()：遍历 Map 的所有成员。

Map 结构的默认遍历器接口（Symbol.iterator属性），就是entries方法。

    map[Symbol.iterator] === map.entries //true

Map 结构转为数组结构，比较快速的方法是使用扩展运算符（...）。

结合数组的map方法、filter方法，可以实现 Map 的遍历和过滤（Map 本身没有map和filter方法）。

此外，Map 还有一个forEach方法，与数组的forEach方法类似，也可以实现遍历。

forEach方法还可以接受第二个参数，用来绑定this。

    const reporter = {
        report: function(key, value) {
        console.log("Key: %s, Value: %s", key, value);
        }
    };
    
    map.forEach(function(value, key, map) {
        this.report(key, value);
    }, reporter);
上面代码中，forEach方法的回调函数的this，就指向reporter。

###与其他数据结构的互相转换
（1）Map 转为数组
    
    const myMap = new Map()
    .set(true, 7)
    .set({foo: 3}, ['abc']);
    [...myMap]
    // [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]

（2）数组 转为 Map

将数组传入 Map 构造函数，就可以转为 Map。

（3）Map 转为对象

    function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
    obj[k] = v;
    }
    return obj;
    }

    const myMap = new Map()
    .set('yes', true)
    .set('no', false);
    strMapToObj(myMap)
    // { yes: true, no: false }

如果所有 Map 的键都是字符串，它可以无损地转为对象。

（4）对象转为 Map

对象转为 Map 可以通过Object.entries()。

（5）Map 转为 JSON

Map 转为 JSON 要区分两种情况。
一种情况是，Map 的键名都是字符串，这时可以选择转为对象 JSON。
另一种情况是，Map 的键名有非字符串，这时可以选择转为数组 JSON。

    function strMapToJson(strMap) {
        return JSON.stringify(strMapToObj(strMap));
    }

    let myMap = new Map().set('yes', true)
                            .set('no', false);
    strMapToJson(myMap)

（6）JSON 转为 Map

JSON 转为 Map，正常情况下，所有键名都是字符串。

###WeakMap

1. WeakMap只接受对象作为键名（null除外），不接受其他类型的值作为键名。
2. 其次，WeakMap的键名所指向的对象，不计入垃圾回收机制。

WeakMap的设计目的在于，有时我们想在某个对象上面存放一些数据，
但是这会形成对于这个对象的引用。
只要所引用的对象的其他引用都被清除，垃圾回收机制就会释放该对象所占用的内存。
也就是说，一旦不再需要，WeakMap 里面的键名对象和所对应的键值对会自动消失，不用手动删除引用。

注意，WeakMap 弱引用的只是键名，而不是键值。键值依然是正常引用

###用途
WeakMap 应用的典型场合就是 DOM 节点作为键名。下面是一个例子。
WeakMap 的另一个用处是部署私有属性。









