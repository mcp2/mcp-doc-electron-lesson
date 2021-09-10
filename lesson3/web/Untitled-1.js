
var formatData = (rootObj)=>{
    var root = {
      name: '二码前端说',
      id: 1,
      toggled: true,
      children:[]
    }
    
    var workKey = function(dataObj,parent){
      var keys = Object.keys(dataObj);
      for(var i=0;i<keys.length;i++){
        let key = keys[i];
        var _obj = {name:key};
        parent.children.push(_obj);
        if(Object.keys(dataObj[key]).length !== 0){
          _obj.children = [];
          workKey(dataObj[key],_obj)
        }else{
          continue;
        }
      }
    }
    workKey(rootObj,root)
    return root;
  }


  console.log(JSON.stringify(formatData({
    "assets": {
        "doc": {
            "Hybrid小程序开放接口文档.md": {},
            "MCPHybrid文档.md": {},
            "RoundedButton.md": {},
            "RoundedButton的副本.md": {}
        },
        "doc2": {
            "RoundedButton的副本.md": {},
            "RoundedButton的副本4.md": {},
            "aaa": {
                "RoundedButton的副本.md": {}
            },
            "bbb": {
                "RoundedButton的副本4.md": {}
            }
        }
    }
  })))