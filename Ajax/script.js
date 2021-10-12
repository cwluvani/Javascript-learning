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

//XMLHttpRequest 对象原生支持CORS


//更好的跨域技术
//JSONP==>same as json format
//只不过会被包在函数调用里
/***JSONP 格式包含两个部分：回调和数据。回调是在页面接收到响应之后应该调用的函数，通常回调
 函数的名称是通过请求来动态指定的。而数据就是作为参数传给回调函数的 JSON 数据。下面是一个典
 型的 JSONP 请求：
 http://freegeoip.net/json/?callback=handleResponse**
 JSONP 调用是通过动态创建<script>元素并为 src 属性指定跨域 URL 实现的。此时的<script>
 与<img>元素类似，能够不受限制地从其他域加载资源。因为 JSONP 是有效的 JavaScript，所以 JSONP
 响应在被加载完成之后会立即执行。比如下面这个例子：
 **/

function handleResponse(response) {
    console.log(`
    You're at IP address ${response.ip}, which is in
    ${response.city}, ${response.region_name}`);
}

let script = document.createElement('script');
script.src = 'http://freegeoip.net/json/?callback=handleResponse';
document.body.insertBefore(script, document.body.firstChild);

//Fetch API

let r = fetch('/bar');
console.log(r); // Promise <pending>

fetch('bar.txt')
    .then((response) => {
        console.log(response);
    });
// Response { type: "basic", url: ... }


fetch('bar.txt')
    .then((response) => {
        response.text().then((data) => {
            console.log(data);
        })
    });
// bar.txt 的内容


fetch('/bar')
    .then((response) => {
        console.log(response.status); // 状态码
        console.log(response.statusText); // 状态文本
    });



// 违反 CORS、无网络连接、HTTPS 错配及其他浏览器/网络策略问题都会导致期约被拒绝。
// 可以通过 url 属性检查通过 fetch()发送请求时使用的完整 URL：


// foo.com/bar/baz 发送的请求
console.log(window.location.href); // https://foo.com/bar/baz
fetch('qux').then((response) => console.log(response.url));
// https://foo.com/bar/qux
fetch('/qux').then((response) => console.log(response.url));
// https://foo.com/qux
fetch('//qux.com').then((response) => console.log(response.url));
// https://qux.com
fetch('https://qux.com').then((response) => console.log(response.url));
// https://qux.com


// 常见fetch请求模式

let payload = JSON.stringify({
    foo: 'bar'
});

let jsonHeaders = new Headers({
    'content-Type': 'application/json'
});

fetch('/send-me-json', {
    method: 'POST',
    body: payload,
    headers: jsonHeaders
});

//因为请求体支持 FormData 实现，所以 fetch()也可以序列化并发送文件字段中的文件：
let imageFormData = new FormData();
let imageInput = document.querySelector("input[type='file']");
imageFormData.append('image', imageInput.files[0]);
fetch('/img-upload', {
    method: 'POST',
    body: imageFormData
});

//这个 fetch()实现可以支持多个文件：
let imageFormData = new FormData();
let imageInput = document.querySelector("input[type='file'][multiple]");
for (let i = 0; i < imageInput.files.length; ++i) {
    imageFormData.append('image', imageInput.files[i]);
}
fetch('/img-upload', {
    method: 'POST',
    body: imageFormData
});

//request Object

let r = new Request('https://foo.com');
console.log(r);
//Request {}

/***Request 构造函数也接收第二个参数——一个 init 对象。这个 init 对象与前面介绍的 fetch()
 的 init 对象一样。没有在 init 对象中涉及的值则会使用默认值：***
 ***/

//fetch 中用Request
let r = new Request('https://foo.com');
// 向 foo.com 发送 GET 请求
fetch(r);
// 向 foo.com 发送 POST 请求
fetch(r, { method: 'POST' });

//fetch()会在内部克隆传入的 Request 对象。
//与克隆 Request 一样，fetch()也不能拿请求体已经用过的 Request 对象来发送请求：

let r = new Request('https://foo.com', {method: 'POST', body: 'foobar'});
r.text();
fetch(r);

// TypeError


//要想基于包含请求体的相同 Request 对象多次调用 fetch()，必须在第一次发送 fetch()请求前调用 clone()：
let r = new Request('https://foo.com',
    { method: 'POST', body: 'foobar' });
// 3 个都会成功
fetch(r.clone());
fetch(r.clone());
fetch(r);


// Response 对象

fetch('https://foo.com')
    .then((response) => {
        console.log(response);
    });
// Response {
// body: (...)
// bodyUsed: false
// headers: Headers {}
// ok: true
// redirected: false
// status: 200
// statusText: "OK"
// type: "basic"
// url: "https://foo.com/"
// }

// Body混入的5个方法

fetch('https://foo.com')
    .then((response) => response.text())
    .then(console.log);
// <!doctype html><html lang="en">
// <head>
// <meta charset="utf-8">
// ...


fetch('https://foo.com/foo.json')
    .then((response) => response.json())
    .then(console.log);
// {"foo": "bar"}

let myFormData = new FormData();
myFormData.append('foo', 'bar');

fetch('https://foo.com/form-data')
    .then((response) => response.formData())
    .then((formData) => console.log(formData.get('foo')));
// bar


fetch('https://foo.com')
    .then((response) => response.arrayBuffer())
    .then(console.log);
// ArrayBuffer(...) {}

fetch('https://foo.com')
    .then((response) => response.blob())
    .then(console.log);
// Blob(...) {size:..., type: "..."}

// 即使是在读取流的过程中，所有这些方法也会在它们被调用时给 ReadableStream 加锁，以阻止
// 其他读取器访问：
fetch('https://foo.com')
    .then((response) => {
        response.blob(); // 第一次调用给流加锁
        response.blob(); // 第二次调用再次加锁会失败
    });
// TypeError: Failed to execute 'blob' on 'Response': body stream is locked
let request = new Request('https://foo.com',
    { method: 'POST', body: 'foobar' });
request.blob(); // 第一次调用给流加锁
request.blob(); // 第二次调用再次加锁会失败
// TypeError: Failed to execute 'blob' on 'Request': body stream is locked






fetch('https://fetch.spec.whatwg.org/')
    .then((response) => response.body)
    .then((body) => {
        let reader = body.getReader();
        console.log(reader); // ReadableStreamDefaultReader {}
        reader.read()
            .then(console.log);
    });
// { value: Uint8Array{}, done: false }

// 在随着数据流的到来取得整个有效载荷，可以像下面这样递归调用 read()方法：
fetch('https://fetch.spec.whatwg.org/')
    .then((response) => response.body)
    .then((body) => {
        let reader = body.getReader();
        function processNextChunk({value, done}) {
            if (done) {
                return;
            }
            console.log(value);
            return reader.read()
                .then(processNextChunk);
        }
        return reader.read()
            .then(processNextChunk);
    });
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// ...

//异步函数非常适合这样的 fetch()操作。可以通过使用 async/await 将上面的递归调用打平：
fetch('https://fetch.spec.whatwg.org/')
    .then((response) => response.body)
    .then(async function(body) {
        let reader = body.getReader();
        while(true) {
            let { value, done } = await reader.read();
            if (done) {
                break;
            }
            console.log(value);
        }
    });
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// ...

// 另外，read()方法也可以真接封装到 Iterable 接口中。因此就可以在 for-await-of 循环中方
// 便地实现这种转换：
fetch('https://fetch.spec.whatwg.org/')
    .then((response) => response.body)
    .then(async function(body) {
        let reader = body.getReader();
        let asyncIterable = {
            [Symbol.asyncIterator]() {
                return {
                    next() {
                        return reader.read();
                    }
                };
            }
        };
        for await (chunk of asyncIterable) {
            console.log(chunk);
        }
    });
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }


// Web Socket

























