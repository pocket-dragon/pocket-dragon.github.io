/*! Built with http://stenciljs.com */
var __generator=this&&this.__generator||function(t,n){var e,o,r,i,a={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(e)throw new TypeError("Generator is already executing.");for(;a;)try{if(e=1,o&&(r=2&i[0]?o.return:i[0]?o.throw||((r=o.return)&&r.call(o),0):o.next)&&!(r=r.call(o,i[1])).done)return r;switch(o=0,r&&(i=[2&i[0],r.value]),i[0]){case 0:case 1:r=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,o=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(r=(r=a.trys).length>0&&r[r.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!r||i[1]>r[0]&&i[1]<r[3])){a.label=i[1];break}if(6===i[0]&&a.label<r[1]){a.label=r[1],r=i;break}if(r&&a.label<r[2]){a.label=r[2],a.ops.push(i);break}r[2]&&a.ops.pop(),a.trys.pop();continue}i=n.call(t,a)}catch(t){i=[6,t],o=0}finally{e=r=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,c])}}};App.loadBundle("p00b6sty",["exports","./chunk-c1d9906c.js"],function(t,n){var e=window.App.h,o=function(){function t(){}return t.prototype.componentDidLoad=function(){var t=document.querySelector(".mdc-top-app-bar");new n.MDCTopAppBar(t)},t.prototype.render=function(){return e("div",null,e("header",{class:"mdc-top-app-bar"},e("div",{class:"mdc-top-app-bar__row"},e("section",{class:"mdc-top-app-bar__section mdc-top-app-bar__section--align-start"},e("span",{class:"mdc-top-app-bar__title"},"Pocket Dragon")))),e("main",null,e("stencil-router",null,e("stencil-route-switch",{scrollTopOffset:0},e("stencil-route",{url:"/",component:"app-home",exact:!0}),e("stencil-route",{url:"/profile/:name",component:"app-profile"})))))},Object.defineProperty(t,"is",{get:function(){return"app-root"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"style",{get:function(){return".mdc-top-app-bar{background-color:#6200ee;background-color:var(--mdc-theme-primary,#6200ee);color:#fff;display:-webkit-box;display:-ms-flexbox;display:flex;position:fixed;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-sizing:border-box;box-sizing:border-box;width:100%;z-index:4}.mdc-top-app-bar .mdc-top-app-bar__action-item,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon{color:#fff;color:var(--mdc-theme-on-primary,#fff)}.mdc-top-app-bar .mdc-top-app-bar__action-item::after,.mdc-top-app-bar .mdc-top-app-bar__action-item::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before{background-color:#fff}\@supports not (-ms-ime-align:auto){.mdc-top-app-bar .mdc-top-app-bar__action-item::after,.mdc-top-app-bar .mdc-top-app-bar__action-item::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before{background-color:var(--mdc-theme-on-primary,#fff)}}.mdc-top-app-bar .mdc-top-app-bar__action-item:hover::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:hover::before{opacity:.08}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):focus::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):focus::before{-webkit-transition-duration:75ms;transition-duration:75ms;opacity:.24}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded)::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded)::after{-webkit-transition:opacity 150ms linear;transition:opacity 150ms linear}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):active::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):active::after{-webkit-transition-duration:75ms;transition-duration:75ms;opacity:.32}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:0.32}.mdc-top-app-bar__row{display:-webkit-box;display:-ms-flexbox;display:flex;position:relative;-webkit-box-sizing:border-box;box-sizing:border-box;width:100%;height:64px}.mdc-top-app-bar__section{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-flex:1;-ms-flex:1 1 auto;flex:1 1 auto;-webkit-box-align:center;-ms-flex-align:center;align-items:center;min-width:0;padding:8px 12px;z-index:1}.mdc-top-app-bar__section--align-start{-webkit-box-pack:start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-ordinal-group:0;-ms-flex-order:-1;order:-1}.mdc-top-app-bar__section--align-end{-webkit-box-pack:end;-ms-flex-pack:end;justify-content:flex-end;-webkit-box-ordinal-group:2;-ms-flex-order:1;order:1}.mdc-top-app-bar__title{font-family:Roboto,sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1.25rem;line-height:2rem;font-weight:500;letter-spacing:.0125em;text-decoration:inherit;text-transform:inherit;padding-left:20px;padding-right:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;z-index:1}.mdc-top-app-bar__title[dir=rtl],[dir=rtl] .mdc-top-app-bar__title{padding-left:0;padding-right:20px}.mdc-top-app-bar__action-item,.mdc-top-app-bar__navigation-icon{--mdc-ripple-fg-size:0;--mdc-ripple-left:0;--mdc-ripple-top:0;--mdc-ripple-fg-scale:1;--mdc-ripple-fg-translate-end:0;--mdc-ripple-fg-translate-start:0;-webkit-tap-highlight-color:transparent;will-change:transform,opacity;display:-webkit-box;display:-ms-flexbox;display:flex;position:relative;-ms-flex-negative:0;flex-shrink:0;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-sizing:border-box;box-sizing:border-box;width:48px;height:48px;padding:12px;border:none;outline:0;background-color:transparent;fill:currentColor;color:inherit;text-decoration:none;cursor:pointer}.mdc-top-app-bar__action-item::after,.mdc-top-app-bar__action-item::before,.mdc-top-app-bar__navigation-icon::after,.mdc-top-app-bar__navigation-icon::before{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:\"\";top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}.mdc-top-app-bar__action-item::before,.mdc-top-app-bar__navigation-icon::before{-webkit-transition:opacity 15ms linear;transition:opacity 15ms linear;z-index:1}.mdc-top-app-bar__action-item.mdc-ripple-upgraded::before,.mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::before{-webkit-transform:scale(var(--mdc-ripple-fg-scale,1));transform:scale(var(--mdc-ripple-fg-scale,1))}.mdc-top-app-bar__action-item.mdc-ripple-upgraded::after,.mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::after{top:0;left:0;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:center center;transform-origin:center center;width:var(--mdc-ripple-fg-size,100%);height:var(--mdc-ripple-fg-size,100%)}.mdc-top-app-bar__action-item.mdc-ripple-upgraded--unbounded::after,.mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top,0);left:var(--mdc-ripple-left,0)}.mdc-top-app-bar__action-item.mdc-ripple-upgraded--foreground-activation::after,.mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--foreground-activation::after{-webkit-animation:225ms forwards mdc-ripple-fg-radius-in,75ms forwards mdc-ripple-fg-opacity-in;animation:225ms forwards mdc-ripple-fg-radius-in,75ms forwards mdc-ripple-fg-opacity-in}.mdc-top-app-bar__action-item.mdc-ripple-upgraded--foreground-deactivation::after,.mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--foreground-deactivation::after{-webkit-animation:150ms mdc-ripple-fg-opacity-out;animation:150ms mdc-ripple-fg-opacity-out;-webkit-transform:translate(var(--mdc-ripple-fg-translate-end,0)) scale(var(--mdc-ripple-fg-scale,1));transform:translate(var(--mdc-ripple-fg-translate-end,0)) scale(var(--mdc-ripple-fg-scale,1))}.mdc-top-app-bar__action-item.mdc-ripple-upgraded::after,.mdc-top-app-bar__action-item.mdc-ripple-upgraded::before,.mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::after,.mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::before{top:var(--mdc-ripple-top,calc(50% - 50%));left:var(--mdc-ripple-left,calc(50% - 50%));width:var(--mdc-ripple-fg-size,100%);height:var(--mdc-ripple-fg-size,100%)}.mdc-top-app-bar--short{top:0;right:auto;left:0;width:100%;-webkit-transition:width 250ms cubic-bezier(.4,0,.2,1);transition:width 250ms cubic-bezier(.4,0,.2,1)}.mdc-top-app-bar--short[dir=rtl],[dir=rtl] .mdc-top-app-bar--short{right:0;left:auto}.mdc-top-app-bar--short .mdc-top-app-bar__row{height:56px}.mdc-top-app-bar--short .mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short .mdc-top-app-bar__title{-webkit-transition:opacity .2s cubic-bezier(.4,0,.2,1);transition:opacity .2s cubic-bezier(.4,0,.2,1);opacity:1}.mdc-top-app-bar--short-collapsed{border-bottom-left-radius:0;border-bottom-right-radius:4px;-webkit-box-shadow:0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);box-shadow:0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);width:56px;-webkit-transition:width .3s cubic-bezier(.4,0,.2,1);transition:width .3s cubic-bezier(.4,0,.2,1)}.mdc-top-app-bar--short-collapsed[dir=rtl],[dir=rtl] .mdc-top-app-bar--short-collapsed{border-bottom-left-radius:4px;border-bottom-right-radius:0}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__title{display:none}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__action-item{-webkit-transition:padding 150ms cubic-bezier(.4,0,.2,1);transition:padding 150ms cubic-bezier(.4,0,.2,1)}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item{width:112px}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end[dir=rtl],[dir=rtl] .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end{padding-left:12px;padding-right:0}.mdc-top-app-bar--dense .mdc-top-app-bar__row{height:48px}.mdc-top-app-bar--dense .mdc-top-app-bar__section{padding:0 4px}.mdc-top-app-bar--dense .mdc-top-app-bar__title{padding-left:12px;padding-right:0}.mdc-top-app-bar--dense .mdc-top-app-bar__title[dir=rtl],[dir=rtl] .mdc-top-app-bar--dense .mdc-top-app-bar__title{padding-left:0;padding-right:12px}.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:128px}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{-ms-flex-item-align:end;align-self:flex-end;padding-bottom:2px}.mdc-top-app-bar--prominent .mdc-top-app-bar__action-item,.mdc-top-app-bar--prominent .mdc-top-app-bar__navigation-icon{-ms-flex-item-align:start;align-self:flex-start}.mdc-top-app-bar--fixed{-webkit-transition:-webkit-box-shadow .2s linear;transition:-webkit-box-shadow .2s linear;transition:box-shadow .2s linear;transition:box-shadow .2s linear,-webkit-box-shadow .2s linear}.mdc-top-app-bar--fixed-scrolled{-webkit-box-shadow:0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);box-shadow:0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);-webkit-transition:-webkit-box-shadow .2s linear;transition:-webkit-box-shadow .2s linear;transition:box-shadow .2s linear;transition:box-shadow .2s linear,-webkit-box-shadow .2s linear}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:96px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section{padding:0 12px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-left:20px;padding-right:0;padding-bottom:9px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title[dir=rtl],[dir=rtl] .mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-left:0;padding-right:20px}.mdc-top-app-bar--fixed-adjust{padding-top:64px}.mdc-top-app-bar--dense-fixed-adjust{padding-top:48px}.mdc-top-app-bar--short-fixed-adjust{padding-top:56px}.mdc-top-app-bar--prominent-fixed-adjust{padding-top:128px}.mdc-top-app-bar--dense-prominent-fixed-adjust{padding-top:96px}\@media (max-width:599px){.mdc-top-app-bar__row{height:56px}.mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short{-webkit-transition:width .2s cubic-bezier(.4,0,.2,1);transition:width .2s cubic-bezier(.4,0,.2,1)}.mdc-top-app-bar--short-collapsed{-webkit-transition:width 250ms cubic-bezier(.4,0,.2,1);transition:width 250ms cubic-bezier(.4,0,.2,1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end[dir=rtl],[dir=rtl] .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end{padding-left:12px;padding-right:0}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-bottom:6px}.mdc-top-app-bar--fixed-adjust{padding-top:56px}}"},enumerable:!0,configurable:!0}),t}(),r="/",i="./",a=new RegExp(["(\\\\.)","(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?"].join("|"),"g");function c(t){return t.replace(/([.+*?=^!:${}()[\]|/\\])/g,"\\$1")}function s(t){return t.replace(/([=!:$/()])/g,"\\$1")}function u(t){return t&&t.sensitive?"":"i"}function l(t,n,e){return t instanceof RegExp?function(t,n){if(!n)return t;var e=t.source.match(/\((?!\?)/g);if(e)for(var o=0;o<e.length;o++)n.push({name:o,prefix:null,delimiter:null,optional:!1,repeat:!1,partial:!1,pattern:null});return t}(t,n):Array.isArray(t)?function(t,n,e){for(var o=[],r=0;r<t.length;r++)o.push(l(t[r],n,e).source);return new RegExp("(?:"+o.join("|")+")",u(e))}(t,n,e):function(t,n,e){return function(t,n,e){for(var o=(e=e||{}).strict,a=!1!==e.end,s=c(e.delimiter||r),l=e.delimiters||i,h=[].concat(e.endsWith||[]).map(c).concat("$").join("|"),f="",p=!1,d=0;d<t.length;d++){var y=t[d];if("string"==typeof y)f+=c(y),p=d===t.length-1&&l.indexOf(y[y.length-1])>-1;else{var g=c(y.prefix),v=y.repeat?"(?:"+y.pattern+")(?:"+g+"(?:"+y.pattern+"))*":y.pattern;n&&n.push(y),y.optional?y.partial?f+=g+"("+v+")?":f+="(?:"+g+"("+v+"))?":f+=g+"("+v+")"}}return a?(o||(f+="(?:"+s+")?"),f+="$"===h?"$":"(?="+h+")"):(o||(f+="(?:"+s+"(?="+h+"))?"),p||(f+="(?="+s+"|"+h+")")),new RegExp("^"+f,u(e))}(function(t,n){for(var e,o=[],u=0,l=0,h="",f=n&&n.delimiter||r,p=n&&n.delimiters||i,d=!1;null!==(e=a.exec(t));){var y=e[0],g=e[1],v=e.index;if(h+=t.slice(l,v),l=v+y.length,g)h+=g[1],d=!0;else{var m="",w=t[l],b=e[2],O=e[3],x=e[4],P=e[5];if(!d&&h.length){var S=h.length-1;p.indexOf(h[S])>-1&&(m=h[S],h=h.slice(0,S))}h&&(o.push(h),h="",d=!1);var A=""!==m&&void 0!==w&&w!==m,T="+"===P||"*"===P,j="?"===P||"*"===P,k=m||f,E=O||x;o.push({name:b||u++,prefix:m,delimiter:k,optional:j,repeat:T,partial:A,pattern:E?s(E):"[^"+c(k)+"]+?"})}}return(h||l<t.length)&&o.push(h+t.substr(l)),o}(t,e),n,e)}(t,n,e)}var h={},f=1e4,p=0;function d(t,n){void 0===n&&(n={}),"string"==typeof n&&(n={path:n});var e=n.path,o=void 0===e?"/":e,r=n.exact,i=void 0!==r&&r,a=n.strict,c=function(t,n){var e=""+n.end+n.strict,o=h[e]||(h[e]={}),r=JSON.stringify(t);if(o[r])return o[r];var i=[],a={re:l(t,i,n),keys:i};return p<f&&(o[r]=a,p+=1),a}(o,{end:i,strict:void 0!==a&&a}),s=c.re,u=c.keys,d=s.exec(t);if(!d)return null;var y=d[0],g=d.slice(1),v=t===y;return i&&!v?null:{path:o,url:"/"===o&&""===y?"/":y,isExact:v,params:u.reduce(function(t,n,e){return t[n.name]=g[e],t},{})}}function y(t,n){return e("context-consumer",{subscribe:t,renderer:n})}var g=function(t,n){void 0===n&&(n=y);var o=new Map,r={location:null,titleSuffix:"",root:"/",history:null};function i(t,n){Array.isArray(t)?t.slice().forEach(function(t){n[t]=r[t]}):n[t]=Object.assign({},r),n.forceUpdate()}function a(t){return function(n){o.has(n)||(o.set(n,t),i(t,n))}}function c(t,n){return a(n)(t),function(){o.delete(t)}}return{Provider:function(t){var n=t.state,e=t.children;return r=n,o.forEach(i),e},Consumer:function(t){var e=t.children;return n(c,e[0])},wrapConsumer:function(t,n){var o=t.is;return function(t){var r=t.children,i=function(t,n){var e={};for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&n.indexOf(o)<0&&(e[o]=t[o]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(t);r<o.length;r++)n.indexOf(o[r])<0&&(e[o[r]]=t[o[r]])}return e}(t,["children"]);return e(o,Object.assign({ref:a(n)},i),r)}},injectProps:function(t,n){var e=null,o=Object.keys(t.properties).find(function(n){return 1==t.properties[n].elementRef});if(void 0==o)throw new Error("Please ensure that your Component "+t.is+' has an attribtue with "@Element" decorator. This is required to be able to inject properties.');var r=t.prototype.componentWillLoad;t.prototype.componentWillLoad=function(){if(e=c(this[o],n),r)return r.bind(this)()};var i=t.prototype.componentDidUnload;t.prototype.componentDidUnload=function(){if(e(),i)return i.bind(this)()}}}}(),v=function(t,n,e,o){return new(e||(e=Promise))(function(r,i){function a(t){try{s(o.next(t))}catch(t){i(t)}}function c(t){try{s(o.throw(t))}catch(t){i(t)}}function s(t){t.done?r(t.value):new e(function(n){n(t.value)}).then(a,c)}s((o=o.apply(t,n||[])).next())})},m=function(){function t(){this.group=null,this.groupMatch=null,this.componentUpdated=null,this.match=null,this.unsubscribe=function(){},this.componentProps={},this.exact=!1,this.routeRender=null,this.scrollTopOffset=null,this.scrollOnNextRender=!1}return t.prototype.componentWillLoad=function(){return v(this,void 0,void 0,function(){return __generator(this,function(t){return this.groupMatch&&this.groupMatchChanged(this.groupMatch),[2]})})},t.prototype.groupMatchChanged=function(t){this.match=t},t.prototype.computeMatch=function(){this.group||(this.match=d(this.location.pathname,{path:this.url,exact:this.exact,strict:!0}))},t.prototype.componentDidUpdate=function(){return v(this,void 0,void 0,function(){return __generator(this,function(t){switch(t.label){case 0:return"function"!=typeof this.componentUpdated?[3,2]:[4,Promise.all(Array.from(this.el.children).map(function(t){return t.componentOnReady?t.componentOnReady():Promise.resolve(t)}))];case 1:t.sent(),"function"==typeof this.componentUpdated&&this.componentUpdated(this.scrollTo.bind(this)),t.label=2;case 2:return[2]}})})},t.prototype.scrollTo=function(){var t=this;if(null!=this.scrollTopOffset&&this.history&&!this.isServer)return"POP"===this.history.action&&null!=this.history.location.scrollPosition?this.queue.write(function(){window.scrollTo(t.history.location.scrollPosition[0],t.history.location.scrollPosition[1])}):this.queue.write(function(){window.scrollTo(0,t.scrollTopOffset)})},t.prototype.render=function(){if(!this.match)return null;var t=Object.assign({},this.componentProps,{history:this.history,match:this.match});if(this.routeRender)return this.routeRender(Object.assign({},t,{component:this.component}));if(this.component){var n=this.component;return e(n,Object.assign({},t))}},Object.defineProperty(t,"is",{get:function(){return"stencil-route"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"properties",{get:function(){return{component:{type:String,attr:"component"},componentProps:{type:"Any",attr:"component-props"},componentUpdated:{type:"Any",attr:"component-updated"},el:{elementRef:!0},exact:{type:Boolean,attr:"exact"},group:{type:String,attr:"group"},groupMatch:{type:"Any",attr:"group-match",watchCallbacks:["groupMatchChanged"]},history:{type:"Any",attr:"history"},isServer:{context:"isServer"},location:{type:"Any",attr:"location",watchCallbacks:["computeMatch"]},match:{state:!0},queue:{context:"queue"},routeRender:{type:"Any",attr:"route-render"},scrollTopOffset:{type:Number,attr:"scroll-top-offset"},url:{type:String,attr:"url"}}},enumerable:!0,configurable:!0}),Object.defineProperty(t,"style",{get:function(){return"stencil-route.inactive{display:none}"},enumerable:!0,configurable:!0}),t}();g.injectProps(m,["location","history"]);var w=function(){function t(){this.group=window.crypto?([1e7].toString()+-1e3.toString()+-4e3.toString()+-8e3.toString()+-1e11.toString()).replace(/[018]/g,function(t){return(t^window.crypto.getRandomValues(new Uint8Array(1))[0]&15>>t/4).toString(16)}):(1e17*Math.random()).toString().match(/.{4}/g).join("-"),this.scrollTopOffset=null,this.activeIndex=null}return t.prototype.componentWillLoad=function(){this.regenerateSubscribers(this.location)},t.prototype.regenerateSubscribers=function(t){return n=this,e=void 0,r=function(){var n,e,o=this;return __generator(this,function(r){switch(r.label){case 0:return n=null,this.subscribers=Array.from(this.el.children).map(function(e,o){var r=d(t.pathname,{path:e.url,exact:e.exact,strict:!0});return r&&null===n&&(n=o),{el:e,match:r}}),this.activeIndex===n?(this.subscribers[this.activeIndex].el.groupMatch=this.subscribers[this.activeIndex].match,[2]):(this.activeIndex=n,[4,new Promise(function(t){var n=o.subscribers[o.activeIndex];n.el.scrollTopOffset=o.scrollTopOffset,n.el.group=o.group,n.el.groupMatch=n.match,n.el.componentUpdated=t})]);case 1:return e=r.sent(),this.queue.write(function(){o.subscribers.forEach(function(t,n){if(t.el.componentUpdated=null,n===o.activeIndex)return t.el.style.display=null;t.el.scrollTopOffset=o.scrollTopOffset,t.el.group=o.group,t.el.groupMatch=null,t.el.style.display="none"})}),e(),[2]}})},new((o=void 0)||(o=Promise))(function(t,i){function a(t){try{s(r.next(t))}catch(t){i(t)}}function c(t){try{s(r.throw(t))}catch(t){i(t)}}function s(n){n.done?t(n.value):new o(function(t){t(n.value)}).then(a,c)}s((r=r.apply(n,e||[])).next())});var n,e,o,r},t.prototype.render=function(){return e("slot",null)},Object.defineProperty(t,"is",{get:function(){return"stencil-route-switch"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"properties",{get:function(){return{el:{elementRef:!0},group:{type:String,attr:"group",reflectToAttr:!0},location:{type:"Any",attr:"location",watchCallbacks:["regenerateSubscribers"]},queue:{context:"queue"},scrollTopOffset:{type:Number,attr:"scroll-top-offset"}}},enumerable:!0,configurable:!0}),t}();function b(t,n){return new RegExp("^"+n+"(\\/|\\?|#|$)","i").test(t)}function O(t,n){return b(t,n)?t.substr(n.length):t}function x(t){return"/"===t.charAt(t.length-1)?t.slice(0,-1):t}function P(t){return"/"===t.charAt(0)?t:"/"+t}function S(t){return"/"===t.charAt(0)?t.substr(1):t}function A(t){var n=t.pathname,e=t.search,o=t.hash,r=n||"/";return e&&"?"!==e&&(r+="?"===e.charAt(0)?e:"?"+e),o&&"#"!==o&&(r+="#"===o.charAt(0)?o:"#"+o),r}function T(t){return"/"===t.charAt(0)}function j(t,n){for(var e=n,o=e+1,r=t.length;o<r;e+=1,o+=1)t[e]=t[o];t.pop()}function k(t,n,e,o){var r,i;"string"==typeof t?(r=function(t){var n=t||"/",e="",o="",r=n.indexOf("#");-1!==r&&(o=n.substr(r),n=n.substr(0,r));var i=n.indexOf("?");return-1!==i&&(e=n.substr(i),n=n.substr(0,i)),{pathname:n,search:"?"===e?"":e,hash:"#"===o?"":o}}(t)).state=n:(void 0===(r=Object.assign({},t)).pathname&&(r.pathname=""),r.search?"?"!==r.search.charAt(0)&&(r.search="?"+r.search):r.search="",r.hash?"#"!==r.hash.charAt(0)&&(r.hash="#"+r.hash):r.hash="",void 0!==n&&void 0===r.state&&(r.state=n));try{r.pathname=decodeURI(r.pathname)}catch(t){throw t instanceof URIError?new URIError('Pathname "'+r.pathname+'" could not be decoded. This is likely caused by an invalid percent-encoding.'):t}return e&&(r.key=e),o?r.pathname?"/"!==r.pathname.charAt(0)&&(r.pathname=function(t,n){void 0===n&&(n="");var e,o=t&&t.split("/")||[],r=n&&n.split("/")||[],i=t&&T(t),a=n&&T(n),c=i||a;if(t&&T(t)?r=o:o.length&&(r.pop(),r=r.concat(o)),!r.length)return"/";if(r.length){var s=r[r.length-1];e="."===s||".."===s||""===s}else e=!1;for(var u=0,l=r.length;l>=0;l--){var h=r[l];"."===h?j(r,l):".."===h?(j(r,l),u++):u&&(j(r,l),u--)}if(!c)for(;u--;u)r.unshift("..");!c||""===r[0]||r[0]&&T(r[0])||r.unshift("");var f=r.join("/");return e&&"/"!==f.substr(-1)&&(f+="/"),f}(r.pathname,o.pathname)):r.pathname=o.pathname:r.pathname||(r.pathname="/"),r.query=(i=r.search)?(/^[?#]/.test(i)?i.slice(1):i).split("&").reduce(function(t,n){var e=n.split("="),o=e[0],r=e[1];return t[o]=r?decodeURIComponent(r.replace(/\+/g," ")):"",t},{}):{},r}function E(t){for(var n=[],e=1;e<arguments.length;e++)n[e-1]=arguments[e];t||console.error.apply(console,n)}function R(t){for(var n=[],e=1;e<arguments.length;e++)n[e-1]=arguments[e];t||console.warn.apply(console,n)}g.injectProps(w,["location"]);var _=function(){var t,n=[];return{setPrompt:function(n){return R(null==t,"A history supports only one prompt at a time"),t=n,function(){t===n&&(t=null)}},confirmTransitionTo:function(n,e,o,r){if(null!=t){var i="function"==typeof t?t(n,e):t;"string"==typeof i?"function"==typeof o?o(i,r):(R(!1,"A history needs a getUserConfirmation function in order to use a prompt message"),r(!0)):r(!1!==i)}else r(!0)},appendListener:function(t){var e=!0,o=function(){for(var n=[],o=0;o<arguments.length;o++)n[o]=arguments[o];e&&t.apply(void 0,n)};return n.push(o),function(){e=!1,n=n.filter(function(t){return t!==o})}},notifyListeners:function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];n.forEach(function(n){return n.apply(void 0,t)})}}},L=!("undefined"==typeof window||!window.document||!window.document.createElement),U=function(t,n,e){return t.addEventListener?t.addEventListener(n,e,!1):t.attachEvent("on"+n,e)},M=function(t,n,e){return t.removeEventListener?t.removeEventListener(n,e,!1):t.detachEvent("on"+n,e)},C=function(t,n){return n(window.confirm(t))},I=function(t){try{var n=window[t],e="__storage_test__";return n.setItem(e,e),n.removeItem(e),!0}catch(t){return t instanceof DOMException&&(22===t.code||1014===t.code||"QuotaExceededError"===t.name||"NS_ERROR_DOM_QUOTA_REACHED"===t.name)&&0!==n.length}},H=function(t){void 0===t&&(t="scrollPositions");var n=new Map;function e(t,e){if(n.set(t,e),I("sessionStorage")){var o=[];n.forEach(function(t,n){o.push([n,t])}),window.sessionStorage.setItem("scrollPositions",JSON.stringify(o))}}return I("sessionStorage")&&(n=window.sessionStorage.getItem(t)?new Map(JSON.parse(window.sessionStorage.getItem(t))):n),"scrollRestoration"in history&&(history.scrollRestoration="manual"),{set:e,get:function(t){return n.get(t)},has:function(t){return n.has(t)},capture:function(t){e(t,[window.scrollX,window.scrollY])}}},D=function(){try{return window.history.state||{}}catch(t){return{}}},q={hashbang:{encodePath:function(t){return"!"===t.charAt(0)?t:"!/"+S(t)},decodePath:function(t){return"!"===t.charAt(0)?t.substr(1):t}},noslash:{encodePath:S,decodePath:P},slash:{encodePath:P,decodePath:P}},B=function(){var t=window.location.href,n=t.indexOf("#");return-1===n?"":t.substring(n+1)},$=function(t){var n=window.location.href.indexOf("#");window.location.replace(window.location.href.slice(0,n>=0?n:0)+"#"+t)},N={browser:function(t){void 0===t&&(t={}),E(L,"Browser history needs a DOM");var n,e=window.history,o=(-1===(n=window.navigator.userAgent).indexOf("Android 2.")&&-1===n.indexOf("Android 4.0")||-1===n.indexOf("Mobile Safari")||-1!==n.indexOf("Chrome")||-1!==n.indexOf("Windows Phone"))&&window.history&&"pushState"in window.history,r=!(-1===window.navigator.userAgent.indexOf("Trident")),i=H(),a=t.forceRefresh,c=void 0!==a&&a,s=t.getUserConfirmation,u=void 0===s?C:s,l=t.keyLength,h=void 0===l?6:l,f=t.basename?x(P(t.basename)):"",p=function(t){var n=(t=t||{}).key,e=t.state,o=window.location,r=o.pathname+o.search+o.hash;return R(!f||b(r,f),'You are attempting to use a basename on a page whose URL path does not begin with the basename. Expected path "'+r+'" to begin with "'+f+'".'),f&&(r=O(r,f)),k(r,e,n)},d=function(){return Math.random().toString(36).substr(2,h)},y=_(),g=function(t){i.capture(Y.location.key),Object.assign(Y,t),Y.location.scrollPosition=i.get(Y.location.key),Y.length=e.length,y.notifyListeners(Y.location,Y.action)},v=function(t){(function(t){return void 0===t.state&&-1===navigator.userAgent.indexOf("CriOS")})(t)||S(p(t.state))},m=function(){S(p(D()))},w=!1,S=function(t){w?(w=!1,g()):y.confirmTransitionTo(t,"POP",u,function(n){n?g({action:"POP",location:t}):T(t)})},T=function(t){var n=Y.location,e=I.indexOf(n.key);-1===e&&(e=0);var o=I.indexOf(t.key);-1===o&&(o=0);var r=e-o;r&&(w=!0,B(r))},j=p(D()),I=[j.key],q=function(t){return f+A(t)},B=function(t){e.go(t)},$=0,N=function(t){1===($+=t)?(U(window,"popstate",v),r&&U(window,"hashchange",m)):0===$&&(M(window,"popstate",v),r&&M(window,"hashchange",m))},W=!1,Y={length:e.length,action:"POP",location:j,createHref:q,push:function(t,n){R(!("object"==typeof t&&void 0!==t.state&&void 0!==n),"You should avoid providing a 2nd state argument to push when the 1st argument is a location-like object that already has state; it is ignored");var r=k(t,n,d(),Y.location);y.confirmTransitionTo(r,"PUSH",u,function(t){if(t){var n=q(r),i=r.key,a=r.state;if(o)if(e.pushState({key:i,state:a},null,n),c)window.location.href=n;else{var s=I.indexOf(Y.location.key),u=I.slice(0,-1===s?0:s+1);u.push(r.key),I=u,g({action:"PUSH",location:r})}else R(void 0===a,"Browser history cannot push state in browsers that do not support HTML5 history"),window.location.href=n}})},replace:function(t,n){R(!("object"==typeof t&&void 0!==t.state&&void 0!==n),"You should avoid providing a 2nd state argument to replace when the 1st argument is a location-like object that already has state; it is ignored");var r=k(t,n,d(),Y.location);y.confirmTransitionTo(r,"REPLACE",u,function(t){if(t){var n=q(r),i=r.key,a=r.state;if(o)if(e.replaceState({key:i,state:a},null,n),c)window.location.replace(n);else{var s=I.indexOf(Y.location.key);-1!==s&&(I[s]=r.key),g({action:"REPLACE",location:r})}else R(void 0===a,"Browser history cannot replace state in browsers that do not support HTML5 history"),window.location.replace(n)}})},go:B,goBack:function(){return B(-1)},goForward:function(){return B(1)},block:function(t){void 0===t&&(t="");var n=y.setPrompt(t);return W||(N(1),W=!0),function(){return W&&(W=!1,N(-1)),n()}},listen:function(t){var n=y.appendListener(t);return N(1),function(){N(-1),n()}}};return Y},hash:function(t){void 0===t&&(t={}),E(L,"Hash history needs a DOM");var n=window.history,e=-1===window.navigator.userAgent.indexOf("Firefox"),o=t.getUserConfirmation,r=void 0===o?C:o,i=t.hashType,a=void 0===i?"slash":i,c=t.basename?x(P(t.basename)):"",s=q[a],u=s.encodePath,l=s.decodePath,h=function(){var t=l(B());return R(!c||b(t,c),'You are attempting to use a basename on a page whose URL path does not begin with the basename. Expected path "'+t+'" to begin with "'+c+'".'),c&&(t=O(t,c)),k(t)},f=_(),p=function(t){Object.assign(W,t),W.length=n.length,f.notifyListeners(W.location,W.action)},d=!1,y=null,g=function(){var t,n,e=B(),o=u(e);if(e!==o)$(o);else{var r=h(),i=W.location;if(!d&&(n=r,(t=i).pathname===n.pathname&&t.search===n.search&&t.hash===n.hash&&t.key===n.key&&function t(n,e){if(n===e)return!0;if(null==n||null==e)return!1;if(Array.isArray(n))return Array.isArray(e)&&n.length===e.length&&n.every(function(n,o){return t(n,e[o])});var o=typeof n;if(o!==typeof e)return!1;if("object"===o){var r=n.valueOf(),i=e.valueOf();if(r!==n||i!==e)return t(r,i);var a=Object.keys(n),c=Object.keys(e);return a.length===c.length&&a.every(function(o){return t(n[o],e[o])})}return!1}(t.state,n.state)))return;if(y===A(r))return;y=null,v(r)}},v=function(t){d?(d=!1,p()):f.confirmTransitionTo(t,"POP",r,function(n){n?p({action:"POP",location:t}):m(t)})},m=function(t){var n=W.location,e=j.lastIndexOf(A(n));-1===e&&(e=0);var o=j.lastIndexOf(A(t));-1===o&&(o=0);var r=e-o;r&&(d=!0,I(r))},w=B(),S=u(w);w!==S&&$(S);var T=h(),j=[A(T)],I=function(t){R(e,"Hash history go(n) causes a full page reload in this browser"),n.go(t)},H=0,D=function(t){1===(H+=t)?U(window,"hashchange",g):0===H&&M(window,"hashchange",g)},N=!1,W={length:n.length,action:"POP",location:T,createHref:function(t){return"#"+u(c+A(t))},push:function(t,n){R(void 0===n,"Hash history cannot push state; it is ignored");var e=k(t,void 0,void 0,W.location);f.confirmTransitionTo(e,"PUSH",r,function(t){if(t){var n=A(e),o=u(c+n);if(B()!==o){y=n,function(t){window.location.hash=t}(o);var r=j.lastIndexOf(A(W.location)),i=j.slice(0,-1===r?0:r+1);i.push(n),j=i,p({action:"PUSH",location:e})}else R(!1,"Hash history cannot PUSH the same path; a new entry will not be added to the history stack"),p()}})},replace:function(t,n){R(void 0===n,"Hash history cannot replace state; it is ignored");var e=k(t,void 0,void 0,W.location);f.confirmTransitionTo(e,"REPLACE",r,function(t){if(t){var n=A(e),o=u(c+n);B()!==o&&(y=n,$(o));var r=j.indexOf(A(W.location));-1!==r&&(j[r]=n),p({action:"REPLACE",location:e})}})},go:I,goBack:function(){return I(-1)},goForward:function(){return I(1)},block:function(t){void 0===t&&(t="");var n=f.setPrompt(t);return N||(D(1),N=!0),function(){return N&&(N=!1,D(-1)),n()}},listen:function(t){var n=f.appendListener(t);return D(1),function(){D(-1),n()}}};return W}},W=function(){function t(){this.root="/",this.historyType="browser",this.titleSuffix="",this.asyncListeners=[],this.asyncGroups={}}return t.prototype.componentWillLoad=function(){var t=this;this.history=N[this.historyType](),this.history.listen(function(n){return e=t,o=void 0,i=function(){return __generator(this,function(t){return n=this.getLocation(n),this.location=n,[2]})},new((r=void 0)||(r=Promise))(function(t,n){function a(t){try{s(i.next(t))}catch(t){n(t)}}function c(t){try{s(i.throw(t))}catch(t){n(t)}}function s(n){n.done?t(n.value):new r(function(t){t(n.value)}).then(a,c)}s((i=i.apply(e,o||[])).next())});var e,o,r,i}),this.location=this.getLocation(this.history.location)},t.prototype.getLocation=function(t){var n=0==t.pathname.indexOf(this.root)?"/"+t.pathname.slice(this.root.length):t.pathname;return Object.assign({},t,{pathname:n})},t.prototype.render=function(){var t={location:this.location,titleSuffix:this.titleSuffix,root:this.root,history:this.history};return e(g.Provider,{state:t},e("slot",null))},Object.defineProperty(t,"is",{get:function(){return"stencil-router"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"properties",{get:function(){return{history:{state:!0},historyType:{type:String,attr:"history-type"},location:{state:!0},root:{type:String,attr:"root"},titleSuffix:{type:String,attr:"title-suffix"}}},enumerable:!0,configurable:!0}),t}();t.AppRoot=o,t.StencilRoute=m,t.StencilRouteSwitch=w,t.StencilRouter=W,Object.defineProperty(t,"__esModule",{value:!0})});