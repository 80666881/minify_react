// jsx的原理就是把元素用编译为React.createElement

//把标签编译为React.createElement

/* 
const element = (
<div id="foo">
    <a>bar</a>
    <b />
</div>
)
变为
const element = React.createElement(
    "div",
    { id: "foo" },
    React.createElement("a", null, "bar"),
    React.createElement("b")
)
 */

/* 
props里包含children，而日常我们写法是
<div props>
<children1>
<children2>
</div>
所以传参进去时，肯定是props和children分开的,或者参考babel的转化也行
React.createElement(type,props,...children)
*/

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === 'object' ? child : createTexteElement(child))// 如果是文本要处理为标准对象
        } //props里包含children
    }
}
function createTexteElement(text){
    return {
        type:'TEXT_ELEMENT',
        props:{
            nodeValue:text,
            children:[]
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
    <div id='foo'>
        <h1>bar</h1>
        hello
    </div>
)

//还要指定一个render函数，这个比较简单
function render(ele,container){
    // 主要创建节点要注意是文本要是普通element
//   const dom = document.createElement(element.type)
  const dom = ele.type === 'TEXT_ELEMENT'?document.createTextNode(''):document.createElement(ele.type)
// 写法1
  //   const {children,...props} = ele.props
//   for (const key in props) {
//     dom[key] = props[key]
//   }

// 写法2
const isProperty=key=>key!=='children'
Object.keys(ele.props).filter(isProperty).forEach(key=>{
    dom[key] = ele.props[key]
})


    // @@重点，需要遍历children
  ele.props.children.forEach(child=>render(child,dom))
  container.appendChild(dom)
}
Didact.render(element, container)


