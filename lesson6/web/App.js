import React, { Fragment, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { includes } from 'lodash';
import { Divider,Button,Input } from 'antd';
const { Search } = Input;
import { MailOutlined, AppstoreOutlined, SettingOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { Treebeard, decorators } from 'react-treebeard';
import { Div } from 'react-treebeard/dist/components/common';
import styles from './styles';
import * as filters from './filter';
import Header from './Header';
import NodeViewer from './NodeViewer';

import CodeParser from './components/CodeParser';
import './markdown.css'

var rebuildListContent = function(arr,prefix){
  arr = arr.reduce((prev,curr)=>{
    if(curr.lastIndexOf("\.md")==-1) return prev;
    var pos = curr.indexOf(prefix);
    curr = curr.substring(pos+1,curr.length);
    
    prev.push(curr.split("/"))
    return prev;
  },[])
  var outputObj = {}
  arr.forEach((elm)=>{
    elm.reduce((prev,curr,index)=>{
      if(!prev[curr]){
        prev[curr] = {}
      }
      return prev[curr];
    },outputObj)
  })
  return outputObj;
}

var formatData = (rootObj)=>{
  var root = {
    name: '二码前端说',
    ori:'',
    id: 1,
    toggled: true,
    children:[]
  }
  
  var workKey = function(dataObj,parent){
    var keys = Object.keys(dataObj);
    for(var i=0;i<keys.length;i++){
      let key = keys[i];
      var _obj = {name:key,ori:`${parent.ori}/${key}`};
      parent.children.push(_obj);
      if(Object.keys(dataObj[key]).length !== 0){
        _obj.children = [];
        workKey(dataObj[key],_obj)
      }else{
        _obj.leaf=true;
        continue;
      }
    }
  }
  workKey(rootObj,root)
  return root;
}
export default class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state={data:{},isMardDownFile:true,cursor:require("./test.js")}
    this.onToggle = this.onToggle.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
  }


  refreshFromGit=(url="https://gitee.com/mcp1/mcp-doc-center.git")=>{
    if(window.bridge){
      window.bridge.refreshDoc(url,(code)=>{
          console.error(code);
        if(!code){
          this.readDirByWindow();
        }else{
          console.error("异常~~~~~~~");
        }
      });
    }
  }

  readDirByWindow=()=>{
    if (window.bridge) {
      var dirs = window.bridge.readDir("../../DocCenter");
      var list = rebuildListContent(dirs,"/DocCenter");
      var data = formatData(list);
      this.setState({data});
      this.loadType=0;//window方式
    }
  }


  onToggle(node, toggled) {
    const { cursor, data } = this.state;

    if (cursor) {
      this.setState(() => ({ cursor, active: false }));
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }

    this.setState(() => ({ cursor: node, data: Object.assign({}, data) ,isMardDownFile:!!node.leaf}));

    if(node.leaf){
      this.readFile(node.ori);
    }
  }

  readFile = (relPath) =>{
    if(this.loadType===0){
      if (window.bridge) {
        var content = window.bridge.readFile(relPath);
        this.setState(() => ({ cursor: content }));
      }
    }
  }

  onSelect(node) {

    const { cursor, data } = this.state;

    if (cursor) {
      this.setState(() => ({ cursor, active: false }));
      if (!includes(cursor.children, node)) {
        cursor.toggled = false;
        cursor.selected = false;
      }
    }

    node.selected = true;

    this.setState(() => ({ cursor: node, data: Object.assign({}, data) }));
  }

  onFilterMouseUp({ target: { value } }) {
    const filter = value.trim();
    if (!filter) {
      return this.setState(() => ({ data }));
    }
    let filtered = filters.filterTree(data, filter);
    filtered = filters.expandFilteredNodes(filtered, filter);
    this.setState(() => ({ data: filtered }));
  }

  render() {
    const { data, cursor,markDownCodeShow } = this.state;
    return (
      <Fragment>
        <div style={{display:"flex",marginTop:10}}>
        {/* <Button
              type="primary"
              size="large"
              style={{flex:1, border:0,fontSize:18,marginLeft:20,marginRight:20}}
              onClick={this.refreshFromGit}
              icon={<CloudSyncOutlined style={{fontSize:16}}/>}
       >拉取最新文档</Button> */}
        <Search placeholder="输入文档git地址"
              defaultValue="https://gitee.com/mcp1/mcp-doc-center.git"
              onSearch={this.refreshFromGit}
              enterButton={ <Button
              type="primary"
              size="large"
              style={{ border:0,fontSize:20}}
              icon={<CloudSyncOutlined style={{fontSize:20}}/>}
            >拉取最新文档</Button>} size="large"  loading={this.state.markDownBtnLoading} />

      </div>

        <div style={{display:"flex",height:"100%"}}>
        <Div style={styles.component}>
          <Treebeard
            data={data}
            onToggle={this.onToggle}
            onSelect={this.onSelect}
            decorators={{ ...decorators, Header }}
            customStyles={{
              header: {
                title: {
                  color: 'red'
                }
              }
            }}
          />
        </Div>
        <Div style={styles.component2}>
          {this.state.isMardDownFile?<CodeParser sourceCode={cursor} codeCallback={(code,lang)=>{console.log(code,lang)}} onComplete={(apis)=>{console.log(apis)}}></CodeParser>:<NodeViewer node={cursor} />}
        </Div>
        </div>
      </Fragment>
    );
  }
}