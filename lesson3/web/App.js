import React, { Fragment, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { includes } from 'lodash';
import { Divider,Button,Input } from 'antd';
import { MailOutlined, AppstoreOutlined, SettingOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { Treebeard, decorators } from 'react-treebeard';
import { Div } from 'react-treebeard/dist/components/common';
import styles from './styles';
import * as filters from './filter';
import Header from './Header';
import NodeViewer from './NodeViewer';
import EventUtils from '../common/EventUtils';

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
    this.state={data:{}}
    this.onToggle = this.onToggle.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
    this.initEvent();
  }

  initEvent = ()=>{
    EventUtils.addEvent("readDirFinished",(ev)=>{
      var list = rebuildListContent(ev.detail,"/assets/doc");
      var data = formatData(list);
      this.setState({data});
      this.loadType=1;//window方式
    });

    EventUtils.addEvent("readFileFinished",(ev)=>{
      this.setState(() => ({ cursor: ev.detail }));
    });

  }

  readDirByWindow=()=>{
    if (window.bridge) {
      var dirs = window.bridge.readDir("../../assets/doc");
      var list = rebuildListContent(dirs,"/assets/doc");
      var data = formatData(list);
      this.setState({data});
      this.loadType=0;//window方式
    }
  }
  readDirByEvent=()=>{
    EventUtils.sendEvent("readDir","../../assets/doc");
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

    this.setState(() => ({ cursor: node, data: Object.assign({}, data) }));

    if(node.leaf){
      this.readFile(node.ori);
    }
  }

  readFile = (relPath) =>{
    if(this.loadType===0){
      console.log("bridge mode")
      if (window.bridge) {
        var content = window.bridge.readFile(relPath);
        this.setState(() => ({ cursor: content }));
      }
    }else if(this.loadType===1){
      console.log("event mode")
      EventUtils.sendEvent("readFile",relPath);
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
    const { data, cursor } = this.state;
    return (
      <Fragment>
        <Button
              type="primary"
              size="large"
              style={{ border:0,fontSize:20,marginLeft:50,marginRight:50}}
              onClick={this.readDirByWindow}
              icon={<CloudSyncOutlined style={{fontSize:20}}/>}
       >读取目录(ContextBridge)</Button>

      <Button
              type="primary"
              size="large"
              style={{ border:0,fontSize:20,marginTop:20,marginLeft:50,marginRight:50}}
              onClick={this.readDirByEvent}
              icon={<AppstoreOutlined style={{fontSize:20}}/>}
       >读取目录(Event)</Button>

        <Div style={styles.searchBox}>
          <Div className="input-group">
            <span className="input-group-addon">
              <i className="fa fa-search" />
            </span>
            <input
              className="form-control"
              onKeyUp={this.onFilterMouseUp.bind(this)}
              placeholder="Search the tree..."
              type="text"
            />
          </Div>
        </Div>
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
        <Div style={styles.component}>
          <NodeViewer node={cursor} />
        </Div>
      </Fragment>
    );
  }
}