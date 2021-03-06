//Reflect对象与Proxy对象一样，也是 ES6 为了操作对象而提供的新 API。
//Reflect对象的设计目的有这样几个。

/**
 * （1） 将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），
 *  放到Reflect对象上。现阶段，某些方法同时在Object和Reflect对象上部署，
 * 未来的新方法将只部署在Reflect对象上。
 * 也就是说，从Reflect对象上可以拿到语言内部的方法。
 * 
 * （2） 修改某些Object方法的返回结果，让其变得更合理。
 * 比如，Object.defineProperty(obj, name, desc)在无法定义属性时，
 * 会抛出一个错误，而Reflect.defineProperty(obj, name, desc)则会返回false。
 * 
 * 
 * （3） 让Object操作都变成函数行为。某些Object操作是命令式，
 * 比如name in obj和delete obj[name]，
 * 而Reflect.has(obj, name)和Reflect.deleteProperty(obj, name)
 * 让它们变成了函数行为。
 * 
 * （4）Reflect对象的方法与Proxy对象的方法一一对应，只要是Proxy对象的方法，
 * 就能在Reflect对象上找到对应的方法。
 * 这就让Proxy对象可以方便地调用对应的Reflect方法，完成默认行为，作为修改行为的基础。
 * 也就是说，不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为。
 * 
 * 
 * 
 */

Proxy(target, {
    set: function(target, key, value, receiver) {
        let success = Reflect.set(target, key, value, receiver);
        if (success) {
            console.log('property' + key + ' on ' + target + ' set to ' + value);
        }
        return success;
    }
});

var loggedObj = new Proxy(obj, {
    get(target, name) {
      console.log('get', target, name);
      return Reflect.get(target, name);
    },
    deleteProperty(target, name) {
      console.log('delete' + name);
      return Reflect.deleteProperty(target, name);
    },
    has(target, name) {
      console.log('has' + name);
      return Reflect.has(target, name);
    }
});

/**
 * 
 * 上面代码中，每一个Proxy对象的拦截操作（get、delete、has），内部都调用对应的Reflect方法，保证原生行为能够正常执行。添加的工作，就是将每一个操作输出一行日志。
 */

// 有了Reflect对象以后，很多操作会更易读。
Function.prototype.apply.call(Math.floor, undefined, [1.75]) // 1
Reflect.apply(Math.floor, undefined, [1.75]) // 1


//实例：使用 Proxy 实现观察者模式

const person = observable({
    name: 'jack',
    age: 21
})

function print() {
    console.log(`${person.name}, ${person.age}`)
}

observe(print);
person.name = 'rose';
// rose, 20

/**
 * 下面，使用 Proxy 写一个观察者模式的最简单实现，
 * 即实现observable和observe这两个函数。
 * 思路是observable函数返回一个原始对象的 Proxy 代理，
 * 拦截赋值操作，触发充当观察者的各个函数。
 */

const queuedObservers = new Set();

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, recevier) {
    const result = Reflect.set(target, key, value, recevier);
    queuedObservers.forEach(observer => observer());
    return result;
}