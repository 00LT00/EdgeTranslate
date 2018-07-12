// 用于存储一个div元素，这个元素用来在页面的右侧展示翻译结果
var frame;

var mousedown = false; // 在鼠标拖动边框时，用于标记鼠标是否已经按下
var originX; // 鼠标开始拖动的x坐标轴初始位置
var originWidth; // 侧边栏的初始宽度

/**
 * 负责根据传入的翻译结果内容将结果显示在用户正在使用的页面中
 * 
 * @param {Object} content 翻译的结果
 */
var display = function (content) {
    createBlock(content);
    chrome.runtime.onMessage.removeListener(display);
}

/**
 * 在页面的右侧创建一块区域，用于显示翻译的结果，创建一个frame元素，将其插入到document中
 * 
 * @param {Object} content 翻译的结果
 */
var createBlock = function (content) {
    // 判断frame是否已经添加到了页面中
    if (!isChildNode(frame, document.documentElement)) { // frame不在页面中，创建新的frame
        frame = document.createElement('DIV');
        frame.id = 'translate_frame';
        document.body.style.transition = 'width 500ms';
        document.body.style.width = '85%';
        document.documentElement.addEventListener('click', clickListener)

        frame.innerHTML = render(template, content);
        // 将frame放入document
        document.documentElement.appendChild(frame);
    } else { // frame已经在页面中，直接改变frame的值
        document.documentElement.addEventListener('click', clickListener);
        frame.style.transition = 'none';
        frame.style.right = '-' + frame.clientWidth + 'px';
        // 这个延时的目的是使得侧边栏出现的过渡动画生效
        setTimeout(function () {
            frame.style.transition = 'right 300ms';
            frame.style.right = '0';
        }, 50);
        frame.innerHTML = render(template, content); // 渲染新的内容
    }
    addEventListener();
}

/**
 * 需要对侧边栏中的元素添加事件监听时，请在此函数中添加
 */
function addEventListener() {
    // 给关闭按钮添加点击事件监听，用于关闭侧边栏
    document.getElementsByClassName('translate-icon-close')[0].onclick = removeSlider;
    frame.addEventListener('mousedown', dragHandler);
    frame.addEventListener('mousemove', moveHandler);
    document.addEventListener('mousemove', dragOn);
    document.addEventListener('mouseup', dragOff);
    document.getElementsByClassName('translate-icon-tuding-fix')[0].addEventListener('click', fixOn);
    document.getElementsByClassName('translate-icon-tuding-full')[0].addEventListener('click', fixOff);
}

/**
 * 
 * 一个工具api,判断传入的第一个元素是否是传入的第二个元素的子节点
 * 
 * @param {Element} node1 第一个document Element 元素,非空
 * @param {Element} node2 第二个document Element 元素，非空
 */
var isChildNode = function (node1, node2) {
    // 判断传入的参数是否合法
    if (!(node1 && node2))
        return false;
    while (node1 && !node1.isSameNode(document.body)) {
        if (node1.isSameNode(node2))
            return true;
        else
            node1 = node1.parentNode;
    }
    return false;
}

/**
 * block start
 * 事件监听的回调函数定义请在此区域中进行
 */

/**
 * 
 * 用于处理点击页面除侧边栏外的区域的回调函数 ，负责将侧边栏关闭
 * 
 * @param {object} event 点击事件的object
 */
var clickListener = function (event) {
    let node = event.target;
    if (!isChildNode(node, frame)) {
        removeSlider();
    }
}

/**
 * 将侧边栏元素从页面中除去，即将frame从document中删除
 */
var removeSlider = function () {
    if (isChildNode(frame, document.documentElement)) {
        document.documentElement.removeChild(frame);
        document.body.style.width = '100%';
        document.documentElement.removeEventListener('click', clickListener);
        document.removeEventListener('mousemove', dragOn);
        document.removeEventListener('mouseup', dragOff);
    }
}

/**
 * 处理鼠标的拖动事件
 * @param {Object} event 
 */
var dragOn = function (event) {
    if (mousedown) {
        frame.style.width = originX - event.x + originWidth + 'px';
        document.body.style.width = window.innerWidth - originWidth - (originX - event.x) + 'px';
    }
}

/**
 * 处理释放鼠标按钮后，边框的宽度停止改变的事件
 */
var dragOff = function () {
    if (mousedown) {
        frame.style.transition = 'width 500ms';
        document.body.style.transition = 'width 500ms';
        mousedown = false;
    }
}

/**
 * 
 * 处理鼠标移动到侧边栏边框附近时，鼠标样式的改变功能
 * 
 * @param {Object} event 事件发生的全部信息
 */
var dragHandler = function (event) {
    var node = event.target;
    if (node.isSameNode(frame)) {
        if (event.x <= node.offsetLeft + 4) {
            mousedown = true;
            frame.style.transition = 'none';
            document.body.style.transition = 'none';
            originX = node.offsetLeft;
            originWidth = node.clientWidth;
        }
    }
}

/**
 * 
 * 处理鼠标移动到侧边栏附近鼠标形状的改变特效
 * 
 * @param {Object} event 事件发生的所有信息
 */
var moveHandler = function (event) {
    var node = event.target;
    if (node.isSameNode(frame)) {
        if (event.x <= node.offsetLeft + 4)
            frame.style.cursor = 'e-resize';
        else
            frame.style.cursor = 'auto';
    }
}

/**
 * 负责将侧边栏固定
 */
var fixOn = function () {
    document.getElementsByClassName('translate-icon-tuding-full')[0].style.display = 'inline';
    document.getElementsByClassName('translate-icon-tuding-fix')[0].style.display = 'none';
    document.getElementsByClassName('translate-icon-tuding-blank')[0].style.display = 'none';
    document.documentElement.removeEventListener('click', clickListener);
}

/**
 * 负责解除侧边栏的固定
 */
var fixOff = function () {
    document.getElementsByClassName('translate-icon-tuding-full')[0].style.display = 'none';
    document.getElementsByClassName('translate-icon-tuding-fix')[0].style.display = 'inline';
    document.getElementsByClassName('translate-icon-tuding-blank')[0].style.display = 'inline';
    document.documentElement.addEventListener('click', clickListener);
}
/**
 * end block
 */


chrome.runtime.onMessage.addListener(display);