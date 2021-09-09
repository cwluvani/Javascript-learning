#Document Object Model


> document is core
> all action are by the Tree structure
## 节点层级

document 节点表示每个文档的根节点。在这里，根节点的唯一子节点是<html>元素，我们称之
为文档元素（documentElement）。文档元素是文档最外层的元素，所有其他元素都存在于这个元素之
内。每个文档只能有一个文档元素。
DOM 中总共有 12 种节点类型，这些类型都继承一种基本类型。

## Node类型
在JavaScript中，所有节点类型都继承 **Node** 类型，因此所有类型都共享相同的基本属性和方法。

每个节点都有 nodeType 属性，表示该节点的类型。节点类型由定义在 Node 类型上的 12 个数值
常量表示：
节点类型可通过与这些常量比较来确定，比如：

    if (someNode.nodeType == Node.ELEMENT_NODE){
    alert("Node is an element.");
    } 

 ###nodeName 与 nodeValue

在使用这两个属性前，最好先检测节点类型，如下所示：

    if (someNode.nodeType == 1){
    value = someNode.nodeName; // 会显示元素的标签名
    }

在这个例子中，先检查了节点是不是元素。如果是，则将其 nodeName 的值赋给一个变量。对元素
而言，nodeName 始终等于元素的标签名，而 nodeValue 则始终为 null。


结点关系
每个节点都有一个 childNodes 属性，其中包含一个 NodeList 的实例。NodeList 是一个类数组
对象，用于存储可以按位置存取的有序节点。注意，NodeList 并不是 Array 的实例，但可以使用中括
号访问它的值，而且它也有 length 属性。NodeList 对象独特的地方在于，它其实是一个对 DOM 结
构的查询，因此 DOM 结构的变化会自动地在 NodeList 中反映出来。我们通常说 NodeList 是实时的
活动对象，而不是第一次访问时所获得内容的快照。

每个节点都有一个 parentNode 属性，指向其 DOM 树中的父元素。childNodes 中的所有节点都
有同一个父元素，因此它们的 parentNode 属性都指向同一个节点。

`hasChildNodes()`，这个方法如果返回 true 则说明节点有一个或多个子节点。

有一个所有节点都共享的关系。`ownerDocument` 属性是一个指向代表整个文档的文档节点
的指针

tips: 
> > 虽然所有节点类型都继承了 Node，但并非所有节点都有子节点。本章后面会讨论不同节点类型的差异。


###操纵结点

appendChild()，用于在 childNodes 列表末尾添加节点
用 insertBefore()方法。
这个方法接收两个参数：要插入的节点和参照节点。调用这个方法后，要插入的节点会变成参照节点的
前一个同胞节点，并被返回。如果参照节点是 null，则 insertBefore()与 appendChild()效果相
同，如下面的例子所示：

    // 作为最后一个子节点插入
    returnedNode = someNode.insertBefore(newNode, null);
    alert(newNode == someNode.lastChild); // true
    // 作为新的第一个子节点插入
    returnedNode = someNode.insertBefore(newNode, someNode.firstChild);
    alert(returnedNode == newNode); // true
    alert(newNode == someNode.firstChild); // true
    // 插入最后一个子节点前面
    returnedNode = someNode.insertBefore(newNode, someNode.lastChild);
    alert(newNode == someNode.childNodes[someNode.childNodes.length - 2]); // true 

appendChild() 和 insertBefore() 在插入节点时不会删除任何已有节点。相对地，
`replaceChild()`方法接收两个参数：要插入的节点和要替换的节点。*要替换的节点会被返回*并从文档
树中完全移除，要插入的节点会取而代之。下面看一个例子：
    
    //替换第一个子节点
    let returnedNode = someNode.replaceChild(newNode, someNode.lastChild);
    //替换最后一个子节点
    returnedNode = someNode.replaceChild(newNode, someNode.firstChild);
    //插入一个节点后，所有关系指针都会从被替换的节点复制过来。

removeChild()方法。这个方法接收一个参数，即要移除
的节点。被移除的节点会被返回。
    
    // delete the firstChild
    let formerFirstchild = someNode.removeChild(someNode.firstChild);
    // delete the lastChild
    let formerLastchild = someNode.removeChild(someNode.lastChild);

> 这四种方法都用于操纵某个节点的*子元素*，也就是说实用他们之前必须先取得父节点（使用前面介绍的*parentNode*属性）

####其他方法

所有节点类型还共享了两个方法。第一个是 cloneNode()，会返回与调用它的节点一模一样的节
点。**cloneNode()方法接收一个布尔值参数，表示是否深复制。**

传入 true 参数时，会进行深复制，
即复制节点及其整个子 DOM 树。如果传入 false，则只会复制调用该方法的节点。复制返回的节点属
于文档所有，但**尚未指定父节点**，所以可称为孤儿节点（orphan）。

    let deepList = myList.cloneNode(true);
    alert(deepList.childNodes.length); // 3（IE9 之前的版本）或 7（其他浏览器）
    let shallowList = myList.cloneNode(false);
    alert(shallowList.childNodes.length); // 0

通过 appendChild()、
insertBefore()或 replaceChild()方法把孤儿节点添加到文档中。

>意 cloneNode()方法不会复制添加到 DOM 节点的 JavaScript 属性，比如事件处理程
序。这个方法只复制 HTML 属性，以及可选地复制子节点。除此之外则一概不会复制。
IE 在很长时间内会复制事件处理程序，这是一个 bug，所以推荐在复制前先删除事件处
理程序。

`normalize()`是处理文档子树中的文本节点

节点上调用 normalize()方法会检测这个节点的所有后代，从中搜索上述两种情形。
如果发现空文本节点，则将其删除；
如果两个同胞节点是相邻的，则将其合并为一个文本节点。

##Document 类型

Document 类型是JavaScript中表示文档节点的类型。
文档对象 document 是
HTMLDocument 的实例（HTMLDocument 继承 Document），表示整个HTML页面。
document是window对象的属性，因此是一个全局对象。

 nodeType 等于 9；
 nodeName 值为"#document"；
 nodeValue 值为 null；
 parentNode 值为 null；
 ownerDocument 值为 null；
 子节点可以是 DocumentType（最多一个）、Element（最多一个）、ProcessingInstruction
或 Comment 类型。

###文档子节点
然 document.childNodes 中始终有<html>元素，但
使用 `documentElement` 属性可以更快更直接地访问该元素
浏览器解析完这个页面之后，文档只有一个子节点，即<html>元素。这个元素既可以通过
documentElement 属性获取，也可以通过 childNodes 列表访问，如下所示：

    let html = document.documentElement; // 取得对<html>的引用
    alert(html === document.childNodes[0]); // true
    alert(html === document.firstChild); // true 

这个例子表明 `documentElement、firstChild和childNodes[0]`都指向同一个值，即<html>元素

作为 HTMLDocument 的实例，document 对象还有一个 body 属性，直接指向<body>元素。因为
**这个元素是开发者使用最多的元素，所以 JavaScript 代码中经常可以看到 document.body**，比如：

    let body = document.body; // 取得对<body>的引用

Document 类型另一种可能的子节点是 DocumentType。<!doctype>标签是文档中独立的部分，
其信息可以通过 doctype 属性（在浏览器中是 document.doctype）来访问

一般来说，appendChild()、removeChild()和 replaceChild()方法不会用在 document 对象
上。这是因为文档类型（如果存在）是只读的，而且只能有一个 Element 类型的子节点（即<html>，
已经存在了）。


###文档信息
document 作为 HTMLDocument 的实例，还有一些标准 Document 对象上所没有的属性，
一般来说这些属性会提供浏览器所加载网页的信息。

1. title
   修改 title 属性并不会改变<title>元素。
    
        let originalTitle = document.title
        document.title = 'New page title'

* 接下来要介绍的 3 个属性是 URL、domain 和 referrer

URL 包含当前页面的完整 URL（地址栏中的 URL），
domain 包含页面的域名，
而 referrer 包含链接到当前页面的那个页面的 URL。
如果当前页面没有来源，则 referrer 属性包含空字符串。

所有这些信息都可以在请求的 HTTP 头部信息中获取只是在JavaScript中通过这几个属性暴露出来而已.

    let url = document.URL; //取得完整的URL
    let domain = document.domain; //取得域名
    let referrer = document.referrer; // 取得来源

这些属性中，只有 domain 属性是可以设置的。
如果 URL包含子域名如 p2p.wrox.com，则可以将 domain 设置为"wrox.com"（URL包含“www”
时也一样，比如 www.wrox.com）。不能给这个属性设置 URL 中不包含的值，比如：

    // 页面来自 p2p.wrox.com
    document.domain = "wrox.com"; // 成功
    document.domain = "nczonline.net"; // 出错！

浏览器对 domain 属性还有一个限制，即这个属性一旦放松就不能再收紧。比如，把
document.domain 设置为"wrox.com"之后，就不能再将其设置回"p2p.wrox.com"，后者会导致错
误，比如：

    // 页面来自 p2p.wrox.com
    document.domain = "wrox.com"; // 放松，成功
    document.domain = "p2p.wrox.com"; // 收紧，错误！

###定位元素

`getElementById()` 和 `getElementsByTagName()`


`getElementsByTagName()` 返回一个HTMLCollection对象 => （与NodeList类似）

HTMLCollection 对象还有一个额外的方法`namedItem()`，
可通过标签的 name 属性取得某一项 的引用。例：

      假设页面中包含如下的<img>元素：
      <img src="myimage.gif" name="myImage">
      那么也可以像这样从 images 中取得对这个<img>元素的引用：
      let myImage = images.namedItem("myImage"); 

对 HTMLCollection 对象而言，中括号既可以接收数值索引，也可以接收字符串索引。而在后台，
数值索引会调用` item()`，字符串索引会调用 `namedItem()`。

HTMLDocument 类型上定义的获取元素的第三个方法是 `getElementsByName()`。

getElementsByName()方法最常用于单选按钮，
因为*同一字段的单选按钮必须具有相同的 name 属性才能确保把正确的值发送给服务器*

      <fieldset>
       <legend>Which color do you prefer?</legend>
       <ul>
       <li>
       <input type="radio" value="red" name="color" id="colorRed">
       <label for="colorRed">Red</label>
       </li>
       <li>
       <input type="radio" value="green" name="color" id="colorGreen">
       <label for="colorGreen">Green</label>
       </li>
       <li>
       <input type="radio" value="blue" name="color" id="colorBlue"> 
       <label for="colorBlue">Blue</label>
       </li>
       </ul>
      </fieldset> 

这里所有的单选按钮都有名为"color"的 name 属性，但它们的 ID 都不一样。这是因为 ID 是为了
**匹配**对应的<label>元素，而 name 相同是为了保证只将三个中的一个值发送给服务器。然后就可以像
下面这样取得所有单选按钮：

      let radios = document.getElementsByName("color");

###特殊集合

 document.anchors 包含文档中所有带 name 属性的<a>元素。
 document.applets 包含文档中所有<applet>元素（因为<applet>元素已经不建议使用，所
以这个集合已经废弃）。
 document.forms 包含文档中所有<form>元素（与 document.getElementsByTagName ("form")
返回的结果相同）。
 document.images 包含文档中所有<img>元素（与 document.getElementsByTagName ("img")
返回的结果相同）。
 document.links 包含文档中所有带 href 属性的<a>元素。
这些特殊集合始终存在于 HTMLDocument 对象上，而且与所有 HTMLCollection 对象一样，其内
容也会实时更新以符合当前文档的内容。

###文档写入
网页输出流中写入内容。这个能力对应 4 个方法：
write()、writeln()、open()和 close()。



##Element类型

 nodeType 等于 1；
 nodeName 值为元素的标签名；
 nodeValue 值为 null；
 parentNode 值为 Document 或 Element 对象；
 子节点可以是 Element、Text、Comment、ProcessingInstruction、CDATASection、
EntityReference 类型。

可以通过 nodeName 或 tagName 属性来获取元素的标签名

      let div = document.getElementById("myDiv");
      alert(div.tagName); // "DIV"
      alert(div.nodeName == div.nodeName); //true

> 在 HTML 中，元素标签名始终以全大写表示


      if (element.tagName == "div"){ // 不要这样做，可能出错！
      // do something here
      }
      if (element.tagName.toLowerCase() == "div"){ // 推荐，适用于所有文档
      // 做点什么
      } 

所有 HTML 元素都通过 HTMLElement 类型表示，包括其直接实例和间接实例。另外，HTMLElement
直接继承 Element 并增加了一些属性。每个属性都对应下列属性之一，它们是所有 HTML 元素上都有
的标准属性：
 id，元素在文档中的唯一标识符；
 title，包含元素的额外信息，通常以提示条形式展示；
 lang，元素内容的语言代码（很少用）；
 dir，语言的书写方向（"ltr"表示从左到右，"rtl"表示从右到左，同样很少用）；
 className，相当于 class 属性，用于指定元素的 CSS 类（因为 class 是 ECMAScript 关键字，
所以不能直接用这个名字）。

      let div = document.getElementById("myDiv");
      alert(div.id); // "myDiv"
      alert(div.className); // "bd"
      alert(div.title); // "Body text"
      alert(div.lang); // "en"
      alert(div.dir); // "ltr"
      而且，可以使用下列代码修改元素的属性：
      div.id = "someOtherId";
      div.className = "ft";
      div.title = "Some other text";
      div.lang = "fr";
      div.dir ="rtl"; 

####

每个元素都有零个或多个属性，通常用于为元素或其内容附加更多信息。与属性相关的 DOM 方法
主要有 3 个：
`getAttribute()、setAttribute()和 removeAttribute()`

Element类型是唯一使用attributes属性的DOM节点类型。
attributes 属性包含一个NamedNodeMap实例，是一个类似 NodeList 的“实时”集合

NamedNodeMap 对象包含下列方法：
 getNamedItem(name)，返回 nodeName 属性等于 name 的节点；
 removeNamedItem(name)，删除 nodeName 属性等于 name 的节点；
 setNamedItem(node)，向列表中添加 node 节点，以其 nodeName 为索引；
 item(pos)，返回索引位置 pos 处的节点。


attributes 属性中的每个节点的 nodeName 是对应属性的名字，nodeValue 是属性的值。比如，
要取得元素 id 属性的值，可以使用以下代码：

      let id = element.attributes.getNamedItem('id').nodeValue;
      let id = element.attributes["id"].nodeValue; 

attributes 属性最有用的场景是需要迭代元素上所有属性的时候。
这时候往往是要把 DOM 结构序列化为 XML 或 HTML 字符串。

example: 以下代码能够迭代一个元素上的所有属性并以 attribute1=
"value1" attribute2="value2"的形式生成格式化字符串：

      function outputAttributes(element) {
         let pairs = [];
         
         for (let i = 0, len = element.attributes.length; i < len; ++i) {
            const attribute = element.attribute[i];
            pairs.push( `${attribute.nodeName}="${attribute.nodeValue}"`);
         }
         return pairs.join(' ');
      }

####创建元素
   可以使用 document.createElement()方法创建新元素。

      let div = document.createElement('div');

      document.body.appendChild(div);
元素被添加到文档树


####元素后代

      for (let i = 0; len = element.childNodes.length; ++i) {
         if (element.childNodes[i].nodeType == 1) {  
            // do something
         }
      }
以上代码会遍历某个元素的子节点，并且只在 nodeType 等于 1（即 Element 节点）时执行某个
操作。
要取得某个元素的子节点和其他后代节点  *means having a fixed block*
，可以使用元素的 getElementsByTagName()方法。

      let ul = document.getElementById('myList');
      let items = document.getElementsByTagName('li');

### Text类型

Text 节点由 Text 类型表示，包含按字面解释的纯文本，也可能包含转义后的 HTML 字符，但不
含 HTML 代码。Text 类型的节点具有以下特征：
 nodeType 等于 3；
 nodeName 值为"#text"；
 nodeValue 值为节点中包含的文本；
 parentNode 值为 Element 对象；
 不支持子节点。






