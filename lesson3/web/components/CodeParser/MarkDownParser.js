import Markdown from "markdown-it"
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
export default class MarkDownParser {
    constructor(codeCallback) {
        this.codeIndex = -1;
        var self = this;
        this.md = Markdown({
            html: true,
            highlight: function (str, lang) {
                if (codeCallback) {
                    codeCallback(str, lang);
                }
                self.codeIndex++;
                return `<div style="text-align:right"><span class="playCode" data-type="android" data-codeIndex="${self.codeIndex}">运行Android</span>|<span class="playCode" data-codeIndex="${self.codeIndex}">运行iOS</span></div>` + hljs.highlightAuto(str).value; // use external default escaping
            }
        });
        // <div><span class="playCode" data-type="android" data-codeIndex="${self.codeIndex}">运行Android</span>|<span class="playCode" data-codeIndex="${self.codeIndex}">运行iOS</span></div>
        // this.md.use(MarkDownPluginApi)
        // this.md.use(require('./MarkDownPluginMath'))

    }
    static of(codeCallback) {
        return new MarkDownParser(codeCallback);
    }
    static parse(codeCallback) {
        return function (value) {
            var md = MarkDownParser.of(codeCallback).md;
            // var result = md.render(value);
            let tokens = md.parse(value, {});


            var inlinePass = false;

            window.titleList = tokens.filter(({ type, tag }) => {
                if (type === "heading_open" && tag === "h2") {
                    inlinePass = true;
                    return false;
                } else if (inlinePass && type === "inline") {
                    return true;
                } else if (type === "heading_close") {
                    inlinePass = false;
                    return false;
                }
            })


            var result = md.renderer.render(tokens, md.options, {});
            return result;
        }
    }
};
