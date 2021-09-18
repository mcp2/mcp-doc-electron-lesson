
import React from 'react';
import _ from "lodash"
import MarkDownParser from './MarkDownParser'
export default class CodeParser extends React.Component {
    //默认的props
    static defaultProps = {
        scope: null
    }
    constructor(props) {
        super(props);
        this.state = {
            mdResult: "",
            codeBlocks: ""
        }
        this.runCode = [];
    }


    
    getSnapshotBeforeUpdate(prevProps, prevState) {
        if(this.props.sourceCode!==prevProps.sourceCode){
            this.Parser && this.Parser(this.props.sourceCode)
            return;
        }
        return null;
    }

    // 不加这个，会有getSnapshotBeforeUpdate的warning
    componentDidUpdate(pervProps, pervState, paramFromSnapshot) {
        
    }
    componentDidMount() {
        // 声明式的代码
        let self = this;
        let codeBlocks = null;
        this.Parser = _.flow(
            MarkDownParser.parse(function (code, lang) {
                if (self.props.codeCallback) {
                    self.props.codeCallback(code, lang);
                }
                // if (self.props.scope) {
                // codeBlocks = (<ReactLivePlayground scope={self.props.scope} code={code}></ReactLivePlayground>);
                // }
            }),
            (result) => {
                let titleList = window.titleList;
                titleList.forEach(elm => {
                    result = result.replace(elm.content, `${elm.content}<a name='/arlene/doc/${elm.content}'></a>`);
                });
                self.setState({ "mdResult": result })
            },
            () => {
                self.setState({ "codeBlocks": codeBlocks });
            },
            () => {
                // console.log("getApi", getApi())
                // this.props.onComplete && this.props.onComplete(getApi());
                // let apis = getApi();
                let titleList = window.titleList;
                let _apiList = titleList.reduce((prev, curr, idx) => {
                    prev.push(<li key={idx} ><a style={{ "color": "#eee", "textOverflow": "ellipsis", "width": "80%", "display": "inline-block", "overflow": "hidden", "whiteSpace": "nowrap", paddingLeft: "15px" }} href={`#/arlene/doc/${curr.content}`}>{`${curr.content}`}</a></li>);
                    return prev;
                }, [])
                this.setState({ "apiList": _apiList })
            }
        );
        this.Parser(this.props.sourceCode)

    }

    render() {
        return (
            <div style={{ display: "flex", flex: 1, height: "100%", borderTop: "1px solid #333" }}>
                <div style={{ flexDirection: "column", flex: 1, padding: '15px 0px 15px 30px', marginRight: 210 }}>
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: this.state.mdResult }} >
                    </div>
                    {this.state.codeBlocks}
                </div>
                <div style={{ position: "fixed", top: 60, right: 0, bottom: 0, width: 200, padding: "0px 15px", borderLeft: "1px solid #333" }}>
                    <h2 style={{ borderBottom: "0.5px solid #474d54", paddingBottom: 10 }}>API说明</h2>
                    <ul id="code-card-list">
                        {this.state.apiList}
                    </ul>
                </div>
            </div>
        )
    }

}

