/* 
render和commit阶段

当我们把一个dom绑定到某个元素上时，有可能此时浏览器中断了我们的绑定操作
if (fiber.parent) {
  // 此时进来一个中断
  fiber.parent.dom.appendChild(fiber.dom)
}
Instead, we’ll keep track of the root of the fiber tree. 
We call it the work in progress root or wipRoot.
所以我们要去除上面的代码，把fiber树都构建完再进行dom的操作

我们用workInProgress代表当前工作

*/
// 1.当前工作为null
let nextUnitOfWork = null

// 当前的rootFiber
let workInProgress = null
// 2.循环执行工作
function workLoop(deadline) {
  // 应该暂停
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    // performUnitOfWork执行下一单元工作，返回下下单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    // deadline的timeRemaining能获取剩余的执行时间
    shouldYield = deadline.timeRemaining() < 1

  }
  // 如果没有下一单元工作，并且有当前root渲染工作的，用commitRoot渲染
  if (!nextUnitOfWork && workInProgress) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

function commitRoot() {
  // 渲染子元素
  commitWork(workInProgress.child)
  // 把当前渲染单元置为null
  workInProgress = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 抽取一个专门方法来渲染dom
function createDom(fiber) {
  const dom =
      fiber.type == "TEXT_ELEMENT" ?
      document.createTextNode("") :
      document.createElement(fiber.type)
  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
          dom[name] = fiber.props[name]
      })
  return dom
}

// 3、为了拆分渲染单元，需要引入fiber结构树，每个元素都有自己的fiber，一个fiber代表一个单元的渲染工作
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    // 构建fiber树
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  // 递归顺序1，子节点
  if (fiber.child) {
    return fiber.child
  }

  // 递归顺序2，没有子节点，遍历兄弟节点
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    // 递归顺序3，没有兄弟节点，遍历父元素的兄弟节点
    nextFiber = nextFiber.parent
  }
}





// 4,render方法只是初始化一个root树的工作单元
function render(element, container) {
  // nextUnitOfWork = {
  //     dom: container,
  //     props: {
  //         children: [element]
  //     }
  // }
  workInProgress = {
    dom: container,
    props: {
      children: [element],
    },
  }
  nextUnitOfWork = workInProgress
}
// 当浏览器空闲时，直接循环workLoop
requestIdleCallback(workLoop)


function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTexteElement(child)) // 如果是文本要处理为标准对象
    } //props里包含children
  }
}

function createTexteElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

// 替换react
const Didact = {
  createElement,
  render
}
const container = document.querySelector('#root')
// 指定babel转化函数
/** @jsxRuntime classic */
/** @jsx Didact.createElement*/
const element = ( 
<div>
  <h1>
    h1
    <p>p标签</p>
    <a>a标签</a>
  </h1>
  <h2>h2标签</h2>
</div>);

console.log('element1',element);

Didact.render(element, container)