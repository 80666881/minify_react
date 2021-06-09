/**
 * 目前的更新形式的遍历fiber树过程。直接找到parent，然后appendChild
 * 但我们更新过程可能被中断，此时的渲染就会终止，出现不完整的dom
 * 所以要等所有的dom构建完成我们触发commit方法一次性渲染
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

const _React = {
  createElement,
  render
}
/* @jsxRuntime classic*/
/* @jsx _React.createElement*/
const element = (
  <div id='foo'>
    <a>bar</a>
    <div>hello</div>
    111
  </div>
)

let nextUnitOfWork = null
let wipRoot

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
  console.log('fiber: ', fiber);
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }
  // if(fiber.parent){
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 创建新fiber
  const elements = fiber.props.children
  let index= 0 
  let preSibing = null
  while(index<elements.length){
    const element = elements[index]
    const newFiber = {
      parent:fiber,
      type:element.type,
      props:element.props,
      dom:null
    }
    if(index===0){
      fiber.child = newFiber
    }else{
      preSibing.sibling = newFiber
    }
    preSibing = newFiber
    index++
  }

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

function createDom(fiber){
  const dom = fiber.type === 'TEXT_ELEMENT'?document.createTextNode(''):document.createElement(fiber.type)
  const keys = Object.keys(fiber.props).filter(key=>key!=='children')
  keys.forEach(key=>{
    dom[key] = fiber.props[key]
  })
  fiber.props.children.forEach(child=>createDom(child))
  return dom
}

// 渲染
function commitRoot(){
  commitWork(wipRoot.child)
  wipRoot = null
}
function commitWork(fiber){
  if(!fiber) return
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
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
      }
    }
  nextUnitOfWork = wipRoot
}



const node = document.querySelector('#root')

_React.render(element,node)