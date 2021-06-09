/* 
const element = React.createElement(
  "h1",
  { title: "foo" },
  "Hello"
)
*/

const ele = {
    type: 'h1',
    props: {
        title: '标题',
        children: 'CHILD_TEXT'
    }
}
const container = document.querySelector('#root')
const node = document.createElement(ele.type)
node['title'] = ele.props.title
const textNode = document.createTextNode(null)
textNode.nodeValue = ele.props.children
node.append(textNode)
container.appendChild(node)