const express = require('express');
const app = express();
const port = 3001;

app.get('/events', (req, res) => {
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // 立刻发送响应头

    let eventId = 0;

    // 定时发送事件
    const intervalId = setInterval(() => {
        eventId++;
        const timestamp = new Date().toLocaleTimeString();

        // 发送一个没有 event 名称的默认事件
        res.write(`id: ${eventId}-message\n`);
        res.write(`data: 服务器时间: ${timestamp}\n\n`); // 注意末尾的 \n\n

        // 发送一个名为 'customEvent' 的自定义事件
        res.write(`id: ${eventId}-custom\n`);
        res.write(`event: customEvent\n`);
        res.write(`data: {"type": "update", "value": ${Math.random()}}\n\n`); // 发送 JSON 数据

    }, 2000); // 每 2 秒发送一次

    // 当客户端关闭连接时
    req.on('close', () => {
        console.log('客户端断开连接');
        clearInterval(intervalId); // 停止发送
        res.end(); // 关闭响应
    });
});

app.get('/', (req, res) => {
    // 提供一个简单的 HTML 页面用于测试
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>SSE Demo</title></head>
        <body>
            <h1>SSE 消息</h1>
            <div id="messages"></div>
            <script>
                const messagesDiv = document.getElementById('messages');
                const evtSource = new EventSource('/events'); // 连接到服务器端点

                // 监听 'open' 事件 (连接成功时触发)
                evtSource.onopen = function() {
                    console.log("连接已建立！");
                    messagesDiv.innerHTML += '<p>连接已建立！</p>';
                };

                // 监听 'message' 事件 (接收没有 event 名称的默认事件)
                evtSource.onmessage = function(event) {
                    console.log("收到默认消息:", event.data);
                    console.log("消息 ID:", event.lastEventId); // 获取 id 字段
                    messagesDiv.innerHTML += \`<p>默认消息: \${event.data}</p>\`;
                };

                // 监听 'customEvent' 事件 (接收 event: customEvent 的事件)
                evtSource.addEventListener('customEvent', function(event) {
                    console.log("收到自定义事件:", event.data);
                    const dataObj = JSON.parse(event.data); // 解析 JSON
                    messagesDiv.innerHTML += \`<p>自定义事件: 类型=\${dataObj.type}, 值=\${dataObj.value}</p>\`;
                });

                // 监听 'error' 事件
                evtSource.onerror = function(err) {
                    console.error("EventSource 失败:", err);
                    messagesDiv.innerHTML += '<p style="color:red;">连接错误或中断！</p>';
                    // 浏览器会自动尝试重连，除非错误是致命的 (如 404)
                    // 如果想手动关闭，可以调用 evtSource.close();
                    // if (evtSource.readyState == EventSource.CLOSED) {
                    //    messagesDiv.innerHTML += '<p style="color:red;">连接已彻底关闭！</p>';
                    // } else if (evtSource.readyState == EventSource.CONNECTING) {
                    //    messagesDiv.innerHTML += '<p style="color:orange;">正在尝试重连...</p>';
                    // }
                };

                // 手动关闭连接 (例如，在页面卸载时)
                // window.addEventListener('beforeunload', () => {
                //     evtSource.close();
                //     console.log("连接已关闭");
                // });
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`SSE 服务器运行在 http://localhost:${port}`);
});
