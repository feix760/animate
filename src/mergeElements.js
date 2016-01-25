/**
 * 合并元素
 * @param {Object} opt
 * @param {Number} opt.width
 * @param {Number} opt.height
 * @param {Array.<Object>} opt.elements
 *
 * element 结构:
 * @param {String} element.type img|font 类型 
 * @param {String|HTMLElement} element.source 
 * @param {?Array.<Number>} element.relative 相对父区域子区域起点
 * @param {?Array.<Number>} element.relativeSize 相对父区域子区域大小
 * @param {?Number} element.top|left|bottom|right 位置控制
 * @param {?Number} element.width|height 大小控制
 * @param {?String} element.align|verticalAlign 对齐控制 'left|center|right|top|bottom'
 *
 * element img:
 * @param {?Number} element.borderRadius 图片圆角
 *      (合并之后锯齿现象严重, 可以考虑使用元素的继承`extend`)
 *
 * element font:
 * @param {?Number} element.fontSize 
 * @param {?String} element.fontFamily 
 * @param {?String} element.color 
 * @param {?Number} element.maxWidth 
 *
 * @return {Canvas} 
 */
module.exports = function(opt) {
    var canvas = document.createElement('canvas');
    canvas.width = opt.width;
    canvas.height = opt.height;
    var ctx = canvas.getContext('2d');
    (opt.elements || []).forEach(function(ele) {
        switch (ele.type) {
            case 'img':
                mergeImg(opt, ctx, ele);
                break;
            case 'text':
                mergeText(opt, ctx, ele);
                break;
        }
    });
    return canvas;
};

function setPosition(opt, ele) {
    // set relative
    var rel = ele.relative = ele.relative || [0, 0],
        relSize = ele.relativeSize = ele.relativeSize || [opt.width, opt.height];

    // override width
    if (ele.left !== undefined && ele.right !== undefined) {
        ele.width = relSize[0] - ele.left - ele.right;
    }

    // override height
    if (ele.top !== undefined && ele.bottom !== undefined) {
        ele.height = relSize[1] - ele.top - ele.bottom;
    }

    if (ele.align) {
        switch (ele.align) {
            case 'center':
                ele.left = rel[0] + (relSize[0] - ele.width) / 2;
                break;
            case 'right':
                ele.right = 0;
                break;
            case 'left':
                ele.left = 0;
                break;
        }
    }
    if (ele.right !== undefined) {
        ele.left = relSize[0] - ele.width - ele.right;
    }
    if (ele.verticalAlign) {
        switch (ele.verticalAlign) {
            case 'center':
                ele.top = rel[1] + (relSize[1] - ele.height) / 2;
                break;
            case 'top':
                ele.top = 0;
                break;
            case 'bottom':
                ele.bottom = 0;
                break;
        }
    }
    if (ele.bottom !== undefined) {
        ele.top = relSize[1] - ele.height - ele.bottom;
    }
    ele.left = ele.left || 0;
    ele.top = ele.top || 0;
}

/**
 * 合并图片
 */
function mergeImg(opt, ctx, ele) {
    ele.width = ele.width || ele.source.width;
    ele.height = ele.height || ele.source.height;
    setPosition(opt, ele);

    if (ele.borderRadius) {
        ctx.save();
        roundedImage(
            ctx, ele.left, ele.top, 
            ele.width, ele.height, ele.borderRadius || 0
        );
        ctx.clip();
        ctx.drawImage(
            ele.source, ele.relative[0] + ele.left, ele.relative[1] + ele.top,
            ele.width, ele.height
        );
        ctx.restore();
    } else {
        ctx.drawImage(
            ele.source, ele.relative[0] + ele.left, ele.relative[1] + ele.top,
            ele.width, ele.height
        );
    }
}

/**
 * 图片圆角
 */
function roundedImage(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * 单行文字
 */
function mergeText(opt, ctx, ele) {
    ctx.font = [ele.fontSize + 'px', ele.fontFamily].join(' ');
    ctx.fillStyle = ele.color;
    ctx.textBaseline = 'top';
    if (!ele.maxWidth && ele.relativeSize) {
        ele.maxWidth = ele.relativeSize[0];
    }
    var info = maxWidthText(ctx, ele.text, ele.maxWidth || 0xffff);
    ele.width = info.width;
    setPosition(opt, ele);
    ctx.fillText(info.text, ele.relative[0] + ele.left, ele.relative[1] + ele.top);
}

/**
 * 截取文字
 * @param {Object} ctx 画布context
 * @param {String} text 文本
 * @param {Number} max 最大长度
 * @return {Object}
 */
function maxWidthText(ctx, text, max) {
    var str = '',
        width = 0;
    for (var l = text.length; l > 0; l--) {
        // 如果被截取了在后加'..'
        str = text.slice(0, l) + (l === text.length ? '' : '..');
        width = ctx.measureText(str).width;
        if (width <= max) {
            break;
        }
    }
    return {
        text: str,
        width: width
    };
}

