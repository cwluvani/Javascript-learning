ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。


CommonJS 和 AMD 模块，都只能在运行时确定这些东西。
比如，CommonJS 模块就是对象，输入时必须查找对象属性。

    let { stat, exists, readfile } = require('fs');
    
    let _fs = require('fs');
    let stat = _fs.stat;
    let exists = _fs.exists;
    let readfile = _fs.readfile;

上面代码的实质是整体加载fs模块（即加载fs的所有方法），生成一个对象（_fs），
然后再从这个对象上面读取 3 个方法。这种加载称为“运行时加载”，
因为只有运行时才能得到这个对象，导致完全没办法在编译时做“静态优化”。

ES6 模块不是对象，而是通过export命令显式指定输出的代码，再通过import命令输入。
`import { stat, exists, readfile } from 'fs'`

ES6 可以在编译时就完成模块加载，效率要比 CommonJS 模块的加载方式高。
当然，这也导致了没法引用 ES6 模块本身，因为它不是对象。

##export 命令
模块功能主要由两个命令构成：export和import。
export命令用于规定模块的对外接口，import命令用于输入其他模块提供的功能。


    // profile.js
    export var firstName = 'Micheal';
    export var lastName = 'Jackson';
    export var year = 1985

    // profile.js
    var firstName = '';
    var lastName = '';
    var year = '';
    
    export {firstName, lastName, year};
使用大括号指定所要输出的一组变量

命令除了输出变量，还可以输出函数或类（class）。

通常情况下，export输出的变量就是本来的名字，但是可以使用**as关键字**重命名。

    function v1() { ... }
    function v2() { ... }
    
    export {
        v1 as streamV1,
        v2 as streamV2,
        v2 as streamLatestVersion
    };

需要特别注意的是，export命令规定的是对外的接口，必须与模块内部的变量建立一一对应关系。

**export语句输出的接口，与其对应的值是动态绑定关系**，即通过该接口，可以取到模块内部实时的值。

    export var foo = 'bar';
    setTimeout( () => foo = 'baz', 500);
上面代码输出变量foo，值为bar，500 毫秒之后变成baz。

####CommonJS 模块输出的是值的缓存，不存在动态更新

##import
    
    // main.js
    import { firstName, lastName, year } from './profile.js';

上面代码的import命令，用于加载profile.js文件，并从中输入变量。
import命令接受一对大括号，里面指定要从其他模块导入的变量名。
大括号里面的变量名，必须与被导入模块（profile.js）对外接口的名称相同。 

如果想为输入的变量重新取一个名字，import命令要使用as关键字，将输入的变量重命名。

    import { lastName as surname } from './profile.js';
import命令输入的变量都是只读的，因为它的本质是输入接口。
也就是说，不允许在加载模块的脚本里面，改写接口。

但是，如果a是一个对象，改写a的属性是允许的。


    import { myMethod } from 'util';
上面代码中，util是模块文件名，由于不带有路径，必须通过配置，告诉引擎怎么取到这个模块。


由于import是静态执行，所以不能使用表达式和变量，这些只有在运行时才能得到结果的语法结构。

    // 报错
    import { 'f' + 'oo' } from 'my_module';
    
    // 报错
    let module = 'my_module';
    import { foo } from module;
    
    // 报错
    if (x === 1) {
    import { foo } from 'module1';
    } else {
    import { foo } from 'module2';
    }

在静态分析阶段，这些语法都是没法得到值的。即编译阶段根本就不知道if else +  ...  这些是什么

最后，import语句会执行所加载的模块，因此可以有下面的写法。

    import 'lodash'
上面代码仅仅执行lodash模块，但是不输入任何值。

###模块的整体加载

用星号指定一个**对象**，所有输出值都加载在这个对象上面.

    // circle.js
    export function area(radius) {
        return Math.PI * radius * radius;
    }
    export function circuference(radius) {
        return 2 * Math.PI * radius;
    }

    // main.js
    import * as circle from './circle';
    console.log ('圆面积:' + circle.area(4));
    console.log ('圆周长:' + circle.circuference(14));

###export default 命令

使用import命令的时候，用户需要**知道所要加载的变量名或函数名**，否则无法加载.

为了给用户提供方便，让他们不用阅读文档就能加载模块，
就要用到export default命令，为模块指定默认输出。

    //export-default.js
    export default function() {}

    import customName from './export-default';
其他模块加载该模块时，**import命令可以为该匿名函数指定任意名字。**

我们来看看export default 和 正常输出有哪里不同

    // 第一组
    export default function crc32() { // 输出
    // ...
    }
    
    import crc32 from 'crc32'; // 输入
    
    // 第二组
    export function crc32() { // 输出
    // ...
    };
    
    import {crc32} from 'crc32'; // 输入

export default命令用于指定模块的默认输出。显然，一个模块只能有一个默认输出，因此export default命令只能使用一次。
所以，import命令后面才不用加大括号，因为只可能唯一对应export default命令。

本质上，export default就是输出一个叫做default的变量或方法，
然后系统允许你为它取任意名字。所以，下面的写法是有效的。 `// 允许你为它取任意名的对外接口`

    // modules.js
    function add(x, y) {
        return x * y;
    }
    export { add as default };
    // eqaul to 
    // export default add;

    import { default as foo } from 'modules';
    // equal to 
    // import foo from 'modules'
    
正是因为export default命令其实只是输出一个叫做default的变量，
所以它后面不能跟变量声明语句。
    
    // 正确
    export var a = 1;
    
    // 正确
    var a = 1;
    export default a;
    
    // 错误
    export default var a = 1;

同样地，因为export default命令的本质是将后面的值，赋给default变量，
所以可以直接将一个值写在export default之后。

    // 正确
    export default 42;
    
    // 报错
    export 42;

上面代码中，后一句报错是因为没有**指定对外的接口**，而前一句指定对外接口为default

export default也可以用来输出类。

    // MyClass.js
    export default class { ... }
    
    // main.js
    import MyClass from 'MyClass';
    let o = new MyClass();


###export 与 import 的复合写法

如果在一个模块之中，先输入后输出同一个模块，import语句可以与export语句写在一起。

    export { foo, bar } from 'my_module';
    
    // 可以简单理解为
    import { foo, bar } from 'my_module';
    export { foo, bar };

模块的接口改名和整体输出，也可以采用这种写法。

    // 接口改名
    export { foo as myFoo } from 'my_module';
    
    // 整体输出
    export * from 'my_module';
默认接口的写法如下。

    export { default } from 'foo';
具名接口改为默认接口的写法如下。

    export { es6 as default } from './someModule';
    
    // 等同于
    import { es6 } from './someModule';
    export default es6;
同样地，默认接口也可以改名为具名接口。

    export { default as es6 } from './someModule';

###tips：写成一行以后，foo和bar实际上并没有被导入当前模块，只是相当于对外转发了这两个接口，导致当前模块不能直接使用foo和bar。

##模块的继承

假设有一个circleplus模块，继承了circle模块。

    // circleplus.js

    export * from 'circle';
    export var e = 2.71828182846;
    export default function(x) {
        return Math.exp(x);
    }
上面代码中的export *，表示再输出circle模块的所有属性和方法。
注意，export *命令会忽略circle模块的default方法。
然后，上面代码又输出了自定义的e变量和默认方法。

这时，也可以将circle的属性或方法，改名后再输出。
继承的模块可以修改上一级模块的属性或方法

    // circleplus.js
    
    export { area as circleArea } from 'circle';


加载上面模块的写法如下。

    // main.js
    
    import * as math from 'circleplus';
    import exp from 'circleplus';
    console.log(exp(math.e));

###跨模块常量

const声明的常量只在当前代码块有效。如果想设置跨模块的常量（即跨多个文件），
或者说一个值要被多个模块共享，可以采用下面的写法。

    // constants.js 模块
    export const A = 1;
    export const B = 3;
    export const C = 4;
    
    // test1.js 模块
    import * as constants from './constants';
    console.log(constants.A); // 1
    console.log(constants.B); // 3
    
    // test2.js 模块
    import {A, B} from './constants';
    console.log(A); // 1
    console.log(B); // 3

如果要使用的常量非常多，可以建一个专门的constants目录，
将各种常量写在不同的文件里面，保存在该目录下。

    // constants/db.js
    export const db = {
    url: 'http://my.couchdbserver.local:5984',
    admin_username: 'admin',
    admin_password: 'admin password'
    };
    
    // constants/user.js
    export const users = ['root', 'admin', 'staff', 'ceo', 'chief', 'moderator'];

然后，将这些文件输出的常量，合并在index.js里面。

    // constants/index.js
    export {db} from './db';
    export {users} from './users';

使用的时候，直接加载index.js就可以了。

    // script.js
    import {db, users} from './constants/index';


##import()

import()函数，支持动态加载模块。

    import(specifier)

**import()返回一个 Promise 对象**。下面是一个例子。

    const main = document.querySelector('main');
    
    import(`./section-modules/${someVariable}.js`)
        .then(module => {
        module.loadPageInto(main);
    })
    .catch(err => {
        main.textContent = err.message;
    });
import()函数可以用在任何地方，不仅仅是模块，非模块的脚本也可以使用。
它是运行时执行，也就是说，什么时候运行到这一句，就会加载指定的模块。
另外，import()函数与所加载的模块没有静态连接关系，这点也是与import语句不相同。
import()类似于 Node 的require方法，区别主要是**前者是异步加载，后者是同步加载。**

适用场合
下面是import()的一些适用场合。

（1）按需加载。

import()可以在需要的时候，再加载某个模块。

    button.addEventListener('click', event => {
        import('./dialogBox.js')
        .then(dialogBox => {
        dialogBox.open();
    })
    .catch(error => {
        /* Error handling */
        })
    });
上面代码中，import()方法放在click事件的监听函数之中，只有用户点击了按钮，才会加载这个模块。

（2）条件加载

import()可以放在if代码块，根据不同的情况，加载不同的模块。

    if (condition) {
        import('moduleA').then(...);
    } else {
        import('moduleB').then(...);
    }
上面代码中，如果满足条件，就加载模块 A，否则加载模块 B。

（3）动态的模块路径

import()允许模块路径动态生成。

    import(f())
    .then(...);
上面代码中，根据函数f的返回结果，加载不同的模块。

###注意点
import()加载模块成功以后，*这个模块会作为一个对象，当作then方法的参数。*
因此，可以使用对象解构赋值的语法，获取输出接口。

    import('./myModule.js')
    .then( ({export1, export2} ) => {
        //...
    });

如果模块有default输出接口，可以用参数直接获得。

    import('./myModule.js')
    .then(myModule => {
    console.log(myModule.default);
    });

上面的代码也可以使用具名输入的形式。
    
    import('./myModule.js')
    .then(({default: theDefault}) => {
    console.log(theDefault);
    });

如果想同时加载多个模块，可以采用下面的写法。

    Promise.all([
        import('./module1.js'),
        import('./module2.js'),
        import('./module3.js'),
    ])
    .then(([module1, module2, module3]) => {
    ···
    });

import()也可以用在 async 函数之中。

    async function main() {
    const myModule = await import('./myModule.js');
    const {export1, export2} = await import('./myModule.js');
    const [module1, module2, module3] =
        await Promise.all([
            import('./module1.js'),
            import('./module2.js'),
            import('./module3.js'),
        ]);
    }
    main();






















