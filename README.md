# animate

## Demo

```js
var Controller = require('src/Controller');
var elements = [
    {
        id: 'bg',
        source: {
            width: 660,
            height: 112,
            elements: [
                {
                    type: 'img',
                    source: 'http://cdn.qplus.com/huayang/mgift/999/img/bg.png',
                    left: 0,
                    bottom: 0
                },
                {
                    type: 'text',
                    text: 'hello world',
                    fontSize: 30,
                    fontFamily: '-apple-system-font,"Helvetica Neue",Helvetica,STHeiTi,sans-serif',
                    color: '#fff',
                    relative: [145, 36],
                    relativeSize: [240, 36]
                }
            ]
        },
        scope: [215, 320],
        xy: {
            215: [1056, 677],
            220: [326, 677],
            223: [366, 677],
            225: [356, 677],
            315: [356, 677],
            320: [356, 777]
        },
        opacity: {
            215: 1,
            220: 100,
            315: 100,
            320: 2
        },
        scale: {
            215: 100,
            320: 100
        }
    },
    {
        source: 'http://cdn.qplus.com/huayang/mgift/99/img/0.png',
        cloneSource: true,
        xy: {
            259: [124, 397],
            269: [124, 612],
            274: [84, 562],
            284: [84, 812]
        },
        opacity: {
            259: 1,
            269: 100,
            280: 100,
            284: 0
        }
    }
];

var controller = new Controller(
    {
        root: document.body,
        elements: elements
    }, 
    {
        fixX: -326,
        fixY: -397
    }
);

```

播放动画:

```js
controller.start();
```

查看某一帧:

```js
controller
    .on('create', function() {
        controller.showFrameAt(58);
    });
```

