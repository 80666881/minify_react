/** @jsx createElement */
/** @jsxRuntime classic */
function createElement(type, config, ...args) {
    console.log('type',type)
     const props = Object.assign({}, config);
     const hasChildren = args.length > 0;
     const rawChildren = hasChildren ? [].concat(...args) : [];
     props.children = rawChildren
         .filter(c => c != null && c !== false)
         .map(c => c instanceof Object ? c : createTextElement(c));
     // 过滤-空-值, 剩下的-不属于-Object的值 -> createTextElement -> 变为 类型为TEXT_ELEMENT- Didact元素
     return { type, props };
 }
 
 function createTextElement(value) {
     // 规范数据
     return createElement("TEXT ELEMENT", { nodeValue: value });
 }
 
 
 function createPublicInstance(element, internalInstance) {
   // 当元素进到这里来, 说明type是个自定义element的构造函数
   const { type, props } = element;
   // 调用组件的构造函数，创建组件实例
   const publicInstance = new type(props);
   // 自定义组件对应的Instance引用, 用于在实例中通过this.__internalInstance获取组件对应的instance，以更新组件
   publicInstance.__internalInstance = internalInstance; 
   return publicInstance;
 }
 
 let rootInstance = null;
 
 
 class Component {
   constructor(props) {
     this.props = props;
     this.state = this.state || {};
   }
 
   //用于更新组件的内部状态
   setState(partialState) {
     this.state = Object.assign({}, this.state, partialState);
     // 通过this.__internalInstance获取Component对应的instance，并通过updateInstance进行更新
     updateInstance(this.__internalInstance);
   }
 }
 
 function updateInstance(internalInstance) {
   //internalInstance是自定义组件对应的instance {element, dom, childInstances}
   const parentDom = internalInstance.dom.parentNode;
   const element = internalInstance.element;
   //调用reconile函数，进行虚拟DOM比较，并更新DOM树
   reconcile(parentDom, internalInstance, element);
 }
 
 function render(element, container) {
     console.log('element: ', element);
     const prevInstance = rootInstance; //虚拟DOM的根节点
     const nextInstance = reconcile(container, prevInstance, element); //对比DOM diff，并更新真实DOM
     rootInstance = nextInstance; // 新的虚拟DOM根节点
 }
 
 
 function reconcile(parentDom, instance, element) {
   if (instance == null) {
     //虚拟的根节点为空时，使用当前React元素，创建新的虚拟DOM
     const newInstance = instantiate(element); 
     //将真实DOM插入容器
     parentDom.appendChild(newInstance.dom); 
     return newInstance;
   }else if(element == null){
     //删除DOM
     parentDom.removeChild(instance.dom);
     return null;
   }  else if(instance.element.type !== element.type){
     //使用当前React元素，创建新的虚拟DOM
     const newInstance = instantiate(element);
     //将真实DOM替换容器中的原有DOM
     parentDom.replaceChild(newInstance.dom, instance.dom);
     return newInstance;
   } else if (typeof element.type === 'string') { 
     //原有虚拟DOM节点类型与要创建的DOM节点类型一致且为原生类型（非自定义类型），可以重用dom以提升性能，只需要更新dom节点属性
     updateDomProperties(instance.dom, instance.element.props, element.props);
     //对instance子节点进行对比，以保证尽可能的重用DOM
     instance.childInstances = reconcileChildren(instance, element);
     instance.element = element;
     return instance;
   } else {
     //逻辑到之有两个条件
     //（1）原有虚拟DOM节点类型与要创建的DOM节点类型一致
     //（2）element type为自定义类型，其中publicInstance是自定义组件的实例
     //更新自定义组件的属性
     instance.publicInstance.props = element.props;
     //原有孩子节点instance数组
     const oldChildInstance = instance.childInstance;
     //调用自定义的render函数，创建自定义组件的孩子节点element
     const childElement = instance.publicInstance.render(); // 组件的render函数 
     //对比自定义组件的虚拟DOM，更新DOM
     const childInstance = reconcile(parentDom, oldChildInstance, childElement);
     //更新instance引用
     instance.dom = childInstance.dom;
     instance.childInstance = childInstance;
     instance.element = element;
     return instance; 
   }
 }
 
 function reconcileChildren(instance, element) {
     // instance 旧
     // element 新
     const dom = instance.dom;
     const childInstances = instance.childInstances;
     const nextChildElements = element.props.children || [];
     const newChildInstances = []; // 新的孩子数组
 
     //选取新旧子节点数据组中最大的值
     const count = Math.max(childInstances.length, nextChildElements.length);
 
     for (let i = 0; i < count; i++) {
         const childInstance = childInstances[i];
         const childElement = nextChildElements[i];
         //调用reconcile创建子节点的虚拟DOM
         /*这里存在三种情况：
          * (1). childInstance和childElement都存在，则调用reconcile进行diff操作
          * (2). childInstance为空而childElement存在，调用调用reconcile创建新的instance
          * (3). childInstance存在而childElement为空，则调用reconcile进行删除操作，此时会返回null
          */
         const newChildInstance = reconcile(dom, childInstance, childElement);
         newChildInstances.push(newChildInstance);
     }
     return newChildInstances.filter(instance => instance != null); //过滤null
 }
 
 
 function updateDomProperties(dom, prevProps, nextProps) {
 
     //判断是否为事件属性
     const isEvent = name => name.startsWith("on");
     //判断是否为普通属性
     const isAttribute = name => !isEvent(name) && name != "children";
 
 
     //移除原有DOM节点上绑定的事件
     Object.keys(prevProps).filter(isEvent).forEach(name => {
         const eventType = name.toLowerCase().substring(2);
         dom.removeEventListener(eventType, prevProps[name]);
     });
 
     //移除原有DOM节点的普通属性
     Object.keys(prevProps).filter(isAttribute).forEach(name => {
         dom[name] = null;
     });
 
     //添加新属性
     Object.keys(nextProps).filter(isAttribute).forEach(name => {
         dom[name] = nextProps[name];
     });
 
     //添加新事件
     Object.keys(nextProps).filter(isEvent).forEach(name => {
         const eventType = name.toLowerCase().substring(2);
         dom.addEventListener(eventType, nextProps[name]);
     });
 }
 
 function instantiate(element) {
   const { type, props } = element;
   const isDomElement = typeof type === 'string';
 
   if(isDomElement) {
     const isTextElement = type === "TEXT ELEMENT";
     const dom = isTextElement
       ? document.createTextNode("")
       : document.createElement(type);
 
     updateDomProperties(dom, [], props); //更新DOM节点的属性、绑定事件
 
     //递归地调用instantiate函数，创建虚拟DOM的子节点
     const childElements = props.children || [];
     const childInstances = childElements.map(instantiate);
     const childDoms = childInstances.map(childInstance => childInstance.dom);
     childDoms.forEach(childDom => dom.appendChild(childDom));
 
     const instance = { dom, element, childInstances };
     return instance;
   }else {
     const instance = {};
     //对于自定义类组件，创建对应的publicInstance
     const publicInstance = createPublicInstance(element, instance);
     //调用自定义组件的render方法，获取child element
     const childElement = publicInstance.render(); 
     //创建child element的instance
     const childInstance = instantiate(childElement); // 递归 孩子拿到 { dom, element, childInstances }
     const dom = childInstance.dom;
     //返回自定义类型组件的instance，其中publicInstance为自定义组件的实例
     //自定义组件的instance有几个特殊的地方：
     //(1) childInstance不是数组，而是自定义组件的根节点对应的instance
     //(2) dom是自定义组件的根节点对应的DOM
     //(3) publicInstance是自定义组件类实例，内部维护着__internalInstance指向instance
     Object.assign(instance, { dom, element, childInstance, publicInstance });
     return instance;
   }
 }
 
 
 class MyComponent extends Component{
     constructor(props) {
         super(props)
         this.state = {
             list: [1, 1, 1]
         }
     }
 
     handleClick = () => {
         const list = this.state.list;
         list.push(1);
         this.setState({
             list: list
         });
     }
 
     render() {
         return (
             <div id="container">
                 <a style="width: 40; height: 20; background-color: #FF0000" onClick={this.handleClick} >click</a>
                 {
                     this.state.list.map(item => {
                         return <div>{item}</div>
                     })
                 }
             </div>
         );
     }
 }
 
 
 render(<MyComponent />, document.getElementById("root"));