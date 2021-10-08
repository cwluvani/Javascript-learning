#网络请求与远程资源

##XMLHttpRequest 对象

    let xhr = new XMLHttpRequest();

###使用XHR

使用 XHR 对象首先要调用 open()方法，这个方法接收 3 个参数：请求类型（"get"、"post"等）、
请求 URL，以及表示请求是否异步的布尔值。

    xhr.open('get', 'example.php', false);

向example.php 发送一个同步请求

要发送定义好的请求，得调用send（）方法：
    
    xhr.open("get", "example.txt", false);
    xhr.send(null);

因为这个请求是同步的，所以 JavaScript 代码会等待服务器响应之后再继续执行。
**收到响应后**，
**XHR对象的以下属性会被填充上数据**。

 responseText：作为响应体返回的文本。
 responseXML：如果响应的内容类型是"text/xml"或"application/xml"，那就是包含响应
数据的 XML DOM 文档。
 status：响应的 HTTP 状态。
 statusText：响应的 HTTP 状态描述。

受到相应，检查status
为确保收到正确响应，应该检查这些状态(tip:状态码就是让你检查状态的)

    xhr.open('get', 'example.php', false);
    xhr.send(null);

    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        alert(xhr.responseText);
    } else {
        alert("request was unsuccessful:" + xhr.status);
    }

以上代码的alert信息完全取决于http响应的状态码

>  XHR 对象有一个 *readyState* 属性，表示当前处在请求/响应过程的哪个阶段。
这个属性有如下可能的值。
 0：未初始化（Uninitialized）。尚未调用 open()方法。
 1：已打开（Open）。已调用 open()方法，尚未调用 send()方法。
 2：已发送（Sent）。已调用 send()方法，尚未收到响应。
 3：接收中（Receiving）。已经收到部分响应。
 4：完成（Complete）。已经收到所有响应，可以使用了。

每次 readyState 从一个值变成另一个值，
都会触发 readystatechange 事件。可以借此机会检查 readyState 的值。

保证浏览器兼容，onreadystatechange 事件处理程序应该在调用 open()之前赋值。
    
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                alert(xhr.responseText);
            } else {
                alert("request was unsuccessful:" + xhr.status);
            }
        }
    };
    xhr.open("get", "example.tex", true);
    xhr.send(null);

在收到响应之前如果想取消异步请求，可以调用 abort()方法：
    `xhr.abort();`
XHR 对象会停止触发事件，并阻止访问这个对象上任何与响应相关的属性。中
断请求后，应该取消对 XHR 对象的引用。`xhr = null`由于内存问题，不推荐重用 XHR 对象。

### HTTP 头部

每个 HTTP **请求和响应都会**携带一些头部字段，这些字段可能对开发者有用。XHR 对象会通过一
些方法暴露与请求和响应相关的头部字段。

默认情况下，XHR请求会发送以下头部字段。

 Accept：浏览器可以处理的内容类型。
 Accept-Charset：浏览器可以显示的字符集。
 Accept-Encoding：浏览器可以处理的压缩编码类型。
 Accept-Language：浏览器使用的语言。
 Connection：浏览器与服务器的连接类型。
 Cookie：页面中设置的 Cookie。
 Host：发送请求的页面所在的域。
 Referer：发送请求的页面的 URI。注意，这个字段在 HTTP 规范中就拼错了，所以考虑到兼容
性也必须将错就错。（正确的拼写应该是 Referrer。）
 User-Agent：浏览器的用户代理字符串。

倘若需要发送额外的请求头部，可以使用setRequestHeader()方法
为保证请求头部被发送，必须在 open()之后、send()之前调用 setRequestHeader()

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                alert(xhr.responseText);
            } else {
                alert("Request was unsuccessful: " + xhr.status);
            }
        }
    };
    xhr.open("get", "example.php", true);
    xhr.setRequestHeader("MyHeader", "MyValue");
    xhr.send(null);

服务器通过读取自定义头部可以确定适当的操作。

可以使用 getResponseHeader()方法从 XHR 对象获取响应头部，只要传入要获取头部的名称即可。
...

###GET 请求

最常用的请求方法是 GET 请求，用于向服务器查询某些信息。
必要时，需要在 GET 请求的 **URL后面添加查询字符串参数**。
查询字符串中的每个名和值都必须使用
encodeURIComponent()编码，所有名/值对必须以和号（&）分隔.

    xhr.open('get', 'example.php?name1=value1&name2=value2', true);
可以使用以下函数将查询字符串参数添加到现有的 URL 末尾：

    function addURLParam(url, name, value) {
        url += (url.indexOf("?") == -1 ? "?" : "&");
        url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
        return url;
    }

###POST请求
（tip：一般验证表单好像用挺多）
用于向服务器发送应该保存的数据。每个 POST 请求都应该在请求体中携带提交的数据，
而 GET 请求则不然。POST请求的请求体可以包含非常多的数据，而且数据可以是任意格式。

###XMLHttpRequest Level 2
1. FormData 类型 
   
FormData 类型便于表单序列化，也便于创建与表单类似格式的数据然后通过XHR发送。

    let data = new FormData(document.forms[0]);

2. 超时

IE8 给 XHR 对象增加了一个 timeout 属性，用于表示发送请求后等待多少毫秒，如果响应不成功就中断请求。

3. overrideMimeType()方法
   时调用 overrideMimeType()可以保证将响应
   当成 XML 而不是纯文本来处理


###进度事件
有以下 6 个进度相关的事件。
 loadstart：在接收到响应的第一个字节时触发。
 progress：在接收响应期间反复触发。
 error：在请求出错时触发。
 abort：在调用 abort()终止连接时触发。
 load：在成功接收完响应时触发。
 loadend：在通信完成时，且在 error、abort 或 load 之后触发。

    //如何向用户展示进度
    let xhr = new XMLHttpRequest();
    xhr.onload = function(event) {
        if ((xhr.status >= 200 && xhr.status < 300) ||
            xhr.status == 304) {
            alert(xhr.responseText);
        } else {
            alert("Request was unsuccessful: " + xhr.status);
        }
    };
    xhr.onprogress = function(event) {
        let divStatus = document.getElementById("status");
        if (event.lengthComputable) {
            divStatus.innerHTML = "Received " + event.position + "of" +
                event.totalSize +
            " bytes";
        }
    } // 可以给用户提供进度条

    xhr.open('get', 'altevents.php', true);
    xhr.send(null);

## CORS  跨资源共享

浏览器与服务器如何实现跨源通信。

CORS 背后的基本思路就是使用**自定义的 HTTP 头部允许浏览器和服务器相互了解**，以确实请求或响应应该成功还是失败。

对于简单的请求，比如 GET 或 POST 请求，没有自定义头部，而且请求体是 text/plain 类型，
这样的请求在发送时会有一个额外的头部叫 Origin。
Origin 头部包含发送请求的页面的源（协议、域名和端口），以便服务器确定是否为其提供响应。

Origin: http://www.nczonline.net
如果服务器决定响应请求，那么应该发送 Access-Control-Allow-Origin 头部，包含相同的源；
或者如果资源是公开的，那么就包含"*"。比如：
Access-Control-Allow-Origin: http://www.nczonline.net

现代浏览器通过 XMLHttpRequest 对象原生支持 CORS。在尝试访问不同源的资源时，这个行为
会被自动触发。要向不同域的源发送请求，可以使用标准 XHR对象并给 open()方法传入一个绝对 URL，
比如：
    
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
    alert(xhr.responseText);
    } else {
    alert("Request was unsuccessful: " + xhr.status);
    }
    }
    };
    
    xhr.open("get", "http://www.somewhere-else.com/page/", true);
    xhr.send(null);



CORS 通过一种叫预检请求（preflighted request）的服务器验证机制，允许使用自定义头部、除 GET
和 POST 之外的方法，以及不同请求体内容类型。在要发送涉及上述某种高级选项的请求时，会先向服
务器发送一个“预检”请求。这个请求使用 OPTIONS 方法发送并包含以下头部。
 Origin：与简单请求相同。
 Access-Control-Request-Method：请求希望使用的方法。
 Access-Control-Request-Headers：（可选）要使用的逗号分隔的自定义头部列表。
下面是一个假设的 POST 请求，包含自定义的 NCZ 头部：
Origin: http://www.nczonline.net
Access-Control-Request-Method: POST
Access-Control-Request-Headers: NCZ



在这个请求发送后，服务器可以确定是否允许这种类型的请求。
服务器会通过在响应中发送如下头部与浏览器沟通这些信息。

 Access-Control-Allow-Origin：与简单请求相同。
 Access-Control-Allow-Methods：允许的方法（逗号分隔的列表）。
 Access-Control-Allow-Headers：服务器允许的头部（逗号分隔的列表）。
 Access-Control-Max-Age：缓存预检请求的秒数。
例如：
Access-Control-Allow-Origin: http://www.nczonline.net
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: NCZ
Access-Control-Max-Age: 1728000

预检请求返回后，结果会按响应指定的时间缓存一段时间。换句话说，只有第一次发送这种类型的
请求时才会多发送一次额外的 HTTP 请求。



























































