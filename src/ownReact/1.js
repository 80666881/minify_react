const ele = {
    type: 'h1',
    props: {
        title: 'foo',
        children: 'Hello'
    }
}

const container = document.querySelector('#root')
const myCreate = (ele,container) => {
    const node = document.createElement(ele.type)
    node['title'] = ele.props.title
    
    
    const text = document.createTextNode('')
    text['nodeValue'] = ele.props.children
    
    node.appendChild(text)
    
    container.appendChild(node)
}
myCreate(ele,container)