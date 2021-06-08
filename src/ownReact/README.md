

### fiber

```js

newFiber = {
    type: oldFiber.type,
    props: element.props,
    dom: oldFiber.dom,
    parent: wipFiber,
    alternate: oldFiber,
    effectTag: "UPDATE",
    sibling:xx,
    child:xx
}

```

### wipRoot

需要处理的rootFiber

```js
currentRoot = null
wipRoot = {
    dom: container,
    props: {
        children: [element],
    },
    alternate: currentRoot,
}
```

commit完成后
currentRoot = wipRoot(workInProgress)

### currentRoot

当前已经渲染的rootFiber

### wipFiber

当前的fiber节点（workInProgress)
之后初始化hooks都为空数组

### nextUnitOfWork

nextUnitOfWork = wipRoot


performUnitOfWork=>
    =>reconcileChildren(打标签，创建，挂载fiber)
    =>遍历更新nextFiber，返回下次fiber
没有nextUnitOfWork，commitRoot

### alternate

当前已经渲染的fiberRoot（fiber树）

通过遍历rootFiber，如果是更新dom，那么alternate就是旧fiber(当前fiber节点)的child




### hookIndex

hook的index


### nextUnitOfWork

下个渲染单元


### 流程

performUnitOfWork=>updateFunctionComponent=>初始化useState=>进入协调过程
=>nextUnitOfWork(返回performUnitOfWork处理)


## workInProgress
workInProgress 节点其实就是 current 节点（即 rootFiber）的副本