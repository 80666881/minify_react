/**
 * 目前的处理都是创建dom，但是更新和删除，我们就需要与上一颗树进行比较
 * 我们用alternate表示上一次的fiber
 * 
 * 用reconcileChildren方法来调和，传入当前fiber和children元素
 */

// 格式化props
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // 需要判断children是否为object，这样我们拿到的children都是标准的object
      // children
      children: children.map(node => typeof node === 'object' ? node : createTextElement(node))
    }
  }
}

function createTextElement(text){
  return {
    type:"TEXT_ELEMENT",
    props:{
      nodeValue: text,
      children: []
    }
  }
}

let nextUnitOfWork = null
let wipRoot
let deletions = null
let currentRoot = null


function workLoop(deadline){
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining()<1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  // 停止后要把当前函数放入workLoop，下次判断是否能执行
  requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function performUnitOfWork(fiber){
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }
  const elements = fiber.props.children

  reconcileChildren(fiber,elements)

  // 返回下一个unitOfWork
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

// function createDom(fiber){
//   const dom = fiber.type === 'TEXT_ELEMENT'?document.createTextNode(''):document.createElement(fiber.type)
//   const keys = Object.keys(fiber.props).filter(key=>key!=='children')
//   keys.forEach(key=>{
//     dom[key] = fiber.props[key]
//   })
//   fiber.props.children.forEach(child=>createDom(child))
//   return dom
// }
function createDom(fiber) {
  console.log('9999fiber: ', fiber);
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}

function reconcileChildren(wipFiber,elements){
  let index= 0 
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null
  while(index<elements.length || oldFiber!=null){
    const element = elements[index]
    let newFiber = null
    const sameType = oldFiber && element && element.type === oldFiber.type

    if(sameType){
      // 更新node
      // if the old fiber and the new element have the same type, 
      // we can keep the DOM node and just update it with the new props
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }
    // 替换
    if(element && !sameType){
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }

    if(oldFiber && !sameType){
      // 有旧元素，不一样的type，删除node
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)

    }


    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    // 判断如果是第一次，要把第一个子元素作为其child
    if (index === 0) {
      wipFiber.child = newFiber
      console.log('wipFiber: ', wipFiber);
    } else if (element) {
    // 这里是为了遍历兄弟元素
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}
const isProperty = key=>key!=='children' && !isEvent(key)
const isNew = (prev,next)=>key=>prev[key]!==next[key]
const isGone = (prev,next)=>key=>!(key in next)

const isEvent = key=>key.startsWith('on')
function updateDom(dom,prevProps,nextProps){
     //Remove old or changed event listeners
    Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
    // Remove old properties
    Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })
    // set new or changeProperty
    Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

    // Add event listeners
    Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })

}
// 渲染
function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
   // 下次更新的oldFiber
  currentRoot = wipRoot
  wipRoot = null
}
function commitWork(fiber){
  console.log('commitWorkfiber: ', fiber);
  if(!fiber) return
  const domParent = fiber.parent.dom
  // domParent.appendChild(fiber.dom)
  if(fiber.effectTag === 'PLACEMENT' && fiber.dom != null){
    domParent.appendChild(fiber.dom)
    console.log('domParent: ', domParent);

    
  }else if(fiber.effectTag === 'DELETION'){
    domParent.removeChild(fiber.dom)
  }else if(fiber.effectTag === 'UPDATE' && fiber.dom != null){
    updateDom(fiber.dom,fiber.alternate.props,fiber.props)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}



// render函数，第一个传入格式化的object，第二个是挂载的node
function render(ele,container){
  // 保存根节点fiber，为了commit时能从根节点commit
  wipRoot = {
      dom:container,
      props:{
        children:[ele]
      },
      alternate:currentRoot
    }
  nextUnitOfWork = wipRoot
  deletions = []
}



const container = document.querySelector('#root')
const _React = {
  createElement,
  render
}
const updateValue = e => {
  rerender(e.target.value)
}
/* @jsxRuntime classic*/
/* @jsx _React.createElement*/
const rerender = value => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  )
  _React.render(element, container)
}

rerender('World')