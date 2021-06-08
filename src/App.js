
// function App() {
//   return (
//     <div className="App" onClick={
//       ()=>{
//       console.log('app click-----')
//     }}>
//         <div className="container" onClick={
//             ()=>{
//             console.log('$$$$ container click')
//           }}>
//           <h1>我是标题</h1>
//           <p>我是第一段话</p>
//           <p>我是第二段话</p>
//         </div>
//       </div>
//   );
// }

import React from "react";


class App extends React.Component{
  constructor(){
    super()
    this.state = {
      count:1
    }
  }
  render(){
    return (
      <div onClick={()=>{
        this.setState({
          count: this.state.count+1
        })
      }}>count {this.state.count}</div>
    )
  }
}

export default App;
