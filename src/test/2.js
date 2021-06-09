/**
 * 对一个jsx会解析成type+props+chidlren
 * <div title='123'>123</div>
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


// render函数，第一个传入格式化的object，第二个是挂载的node
function render(ele,container){
  const {type,props} = ele
  const node = type === 'TEXT_ELEMENT'?document.createTextNode(''):document.createElement(type)
  const isProperty=key=>key!=='children'
  Object.keys(props).filter(isProperty).forEach(key=>{
    node[key] = ele.props[key]
  })
  ele.props.children.forEach(child=>render(child,node))
  container.appendChild(node)
}

const node = document.querySelector('#root')

_React.render(element,node)