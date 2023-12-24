import{n as w,r as N,i as B,f as j,j as X,k as O,l as Y,m as Z,p as tt,q as et,v as q,w as nt,x as it,y as st}from"./scheduler.pJhfhOZw.js";const k=typeof window<"u";let rt=k?()=>window.performance.now():()=>Date.now(),D=k?t=>requestAnimationFrame(t):w;const g=new Set;function F(t){g.forEach(e=>{e.c(t)||(g.delete(e),e.f())}),g.size!==0&&D(F)}function lt(t){let e;return g.size===0&&D(F),{promise:new Promise(n=>{g.add(e={c:t,f:n})}),abort(){g.delete(e)}}}let S=!1;function at(){S=!0}function ot(){S=!1}function ct(t,e,n,i){for(;t<e;){const a=t+(e-t>>1);n(a)<=i?t=a+1:e=a}return t}function ut(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const s=[];for(let o=0;o<e.length;o++){const d=e[o];d.claim_order!==void 0&&s.push(d)}e=s}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let a=0;for(let s=0;s<e.length;s++){const o=e[s].claim_order,d=(a>0&&e[n[a]].claim_order<=o?a+1:ct(1,a,h=>e[n[h]].claim_order,o))-1;i[s]=n[d]+1;const u=d+1;n[u]=s,a=Math.max(u,a)}const c=[],r=[];let l=e.length-1;for(let s=n[a]+1;s!=0;s=i[s-1]){for(c.push(e[s-1]);l>=s;l--)r.push(e[l]);l--}for(;l>=0;l--)r.push(e[l]);c.reverse(),r.sort((s,o)=>s.claim_order-o.claim_order);for(let s=0,o=0;s<r.length;s++){for(;o<c.length&&r[s].claim_order>=c[o].claim_order;)o++;const d=o<c.length?c[o]:null;t.insertBefore(r[s],d)}}function ft(t,e){t.appendChild(e)}function U(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function dt(t){const e=R("style");return e.textContent="/* empty */",_t(U(t),e),e.sheet}function _t(t,e){return ft(t.head||t,e),e.sheet}function ht(t,e){if(S){for(ut(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function mt(t,e,n){t.insertBefore(e,n||null)}function pt(t,e,n){S&&!n?ht(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function v(t){t.parentNode&&t.parentNode.removeChild(t)}function Pt(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function R(t){return document.createElement(t)}function V(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function I(t){return document.createTextNode(t)}function jt(){return I(" ")}function Bt(){return I("")}function Dt(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Rt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function It(t){return t.dataset.svelteH}function $t(t){return Array.from(t.childNodes)}function W(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function J(t,e,n,i,a=!1){W(t);const c=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const l=t[r];if(e(l)){const s=n(l);return s===void 0?t.splice(r,1):t[r]=s,a||(t.claim_info.last_index=r),l}}for(let r=t.claim_info.last_index-1;r>=0;r--){const l=t[r];if(e(l)){const s=n(l);return s===void 0?t.splice(r,1):t[r]=s,a?s===void 0&&t.claim_info.last_index--:t.claim_info.last_index=r,l}}return i()})();return c.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,c}function K(t,e,n,i){return J(t,a=>a.nodeName===e,a=>{const c=[];for(let r=0;r<a.attributes.length;r++){const l=a.attributes[r];n[l.name]||c.push(l.name)}c.forEach(r=>a.removeAttribute(r))},()=>i(e))}function Ot(t,e,n){return K(t,e,n,R)}function qt(t,e,n){return K(t,e,n,V)}function yt(t,e){return J(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>I(e),!0)}function zt(t){return yt(t," ")}function z(t,e,n){for(let i=n;i<t.length;i+=1){const a=t[i];if(a.nodeType===8&&a.textContent.trim()===e)return i}return-1}function Gt(t,e){const n=z(t,"HTML_TAG_START",0),i=z(t,"HTML_TAG_END",n+1);if(n===-1||i===-1)return new H(e);W(t);const a=t.splice(n,i-n+1);v(a[0]),v(a[a.length-1]);const c=a.slice(1,a.length-1);if(c.length===0)return new H(e);for(const r of c)r.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1;return new H(e,c)}function kt(t,e){e=""+e,t.data!==e&&(t.data=e)}function Ft(t,e){t.value=e??""}function Ut(t,e,n,i){n==null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function Vt(t,e,n){t.classList.toggle(e,!!n)}function gt(t,e,{bubbles:n=!1,cancelable:i=!1}={}){return new CustomEvent(t,{detail:e,bubbles:n,cancelable:i})}class xt{is_svg=!1;e=void 0;n=void 0;t=void 0;a=void 0;constructor(e=!1){this.is_svg=e,this.e=this.n=null}c(e){this.h(e)}m(e,n,i=null){this.e||(this.is_svg?this.e=V(n.nodeName):this.e=R(n.nodeType===11?"TEMPLATE":n.nodeName),this.t=n.tagName!=="TEMPLATE"?n:n.content,this.c(e)),this.i(i)}h(e){this.e.innerHTML=e,this.n=Array.from(this.e.nodeName==="TEMPLATE"?this.e.content.childNodes:this.e.childNodes)}i(e){for(let n=0;n<this.n.length;n+=1)mt(this.t,this.n[n],e)}p(e){this.d(),this.h(e),this.i(this.a)}d(){this.n.forEach(v)}}class H extends xt{l=void 0;constructor(e=!1,n){super(e),this.e=this.n=null,this.l=n}c(e){this.l?this.n=this.l:super.c(e)}i(e){for(let n=0;n<this.n.length;n+=1)pt(this.t,this.n[n],e)}}function Wt(t,e){return new t(e)}const A=new Map;let b=0;function wt(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}function vt(t,e){const n={stylesheet:dt(e),rules:{}};return A.set(t,n),n}function G(t,e,n,i,a,c,r,l=0){const s=16.666/i;let o=`{
`;for(let _=0;_<=1;_+=s){const y=e+(n-e)*c(_);o+=_*100+`%{${r(y,1-y)}}
`}const d=o+`100% {${r(n,1-n)}}
}`,u=`__svelte_${wt(d)}_${l}`,h=U(t),{stylesheet:$,rules:f}=A.get(h)||vt(h,t);f[u]||(f[u]=!0,$.insertRule(`@keyframes ${u} ${d}`,$.cssRules.length));const m=t.style.animation||"";return t.style.animation=`${m?`${m}, `:""}${u} ${i}ms linear ${a}ms 1 both`,b+=1,u}function Nt(t,e){const n=(t.style.animation||"").split(", "),i=n.filter(e?c=>c.indexOf(e)<0:c=>c.indexOf("__svelte")===-1),a=n.length-i.length;a&&(t.style.animation=i.join(", "),b-=a,b||Et())}function Et(){D(()=>{b||(A.forEach(t=>{const{ownerNode:e}=t.stylesheet;e&&v(e)}),A.clear())})}let x;function Tt(){return x||(x=Promise.resolve(),x.then(()=>{x=null})),x}function P(t,e,n){t.dispatchEvent(gt(`${e?"intro":"outro"}${n}`))}const T=new Set;let p;function Jt(){p={r:0,c:[],p}}function Kt(){p.r||N(p.c),p=p.p}function At(t,e){t&&t.i&&(T.delete(t),t.i(e))}function Qt(t,e,n,i){if(t&&t.o){if(T.has(t))return;T.add(t),p.c.push(()=>{T.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}else i&&i()}const bt={duration:0};function Xt(t,e,n,i){let c=e(t,n,{direction:"both"}),r=i?0:1,l=null,s=null,o=null,d;function u(){o&&Nt(t,o)}function h(f,m){const _=f.b-r;return m*=Math.abs(_),{a:r,b:f.b,d:_,duration:m,start:f.start,end:f.start+m,group:f.group}}function $(f){const{delay:m=0,duration:_=300,easing:y=X,tick:C=w,css:L}=c||bt,M={start:rt()+m,b:f};f||(M.group=p,p.r+=1),"inert"in t&&(f?d!==void 0&&(t.inert=d):(d=t.inert,t.inert=!0)),l||s?s=M:(L&&(u(),o=G(t,r,f,_,m,y,L)),f&&C(0,1),l=h(M,_),j(()=>P(t,f,"start")),lt(E=>{if(s&&E>s.start&&(l=h(s,_),s=null,P(t,l.b,"start"),L&&(u(),o=G(t,r,l.b,l.duration,0,y,c.css))),l){if(E>=l.end)C(r=l.b,1-r),P(t,l.b,"end"),s||(l.b?u():--l.group.r||N(l.group.c)),l=null;else if(E>=l.start){const Q=E-l.start;r=l.a+l.d*y(Q/l.duration),C(r,1-r)}}return!!(l||s)}))}return{run(f){B(c)?Tt().then(()=>{c=c({direction:f?"in":"out"}),$(f)}):$(f)},end(){u(),l=s=null}}}function Yt(t){t&&t.c()}function Zt(t,e){t&&t.l(e)}function St(t,e,n){const{fragment:i,after_update:a}=t.$$;i&&i.m(e,n),j(()=>{const c=t.$$.on_mount.map(nt).filter(B);t.$$.on_destroy?t.$$.on_destroy.push(...c):N(c),t.$$.on_mount=[]}),a.forEach(j)}function Ct(t,e){const n=t.$$;n.fragment!==null&&(tt(n.after_update),N(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Lt(t,e){t.$$.dirty[0]===-1&&(it.push(t),st(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function te(t,e,n,i,a,c,r=null,l=[-1]){const s=et;q(t);const o=t.$$={fragment:null,ctx:[],props:c,update:w,not_equal:a,bound:O(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(s?s.$$.context:[])),callbacks:O(),dirty:l,skip_bound:!1,root:e.target||s.$$.root};r&&r(o.root);let d=!1;if(o.ctx=n?n(t,e.props||{},(u,h,...$)=>{const f=$.length?$[0]:h;return o.ctx&&a(o.ctx[u],o.ctx[u]=f)&&(!o.skip_bound&&o.bound[u]&&o.bound[u](f),d&&Lt(t,u)),h}):[],o.update(),d=!0,N(o.before_update),o.fragment=i?i(o.ctx):!1,e.target){if(e.hydrate){at();const u=$t(e.target);o.fragment&&o.fragment.l(u),u.forEach(v)}else o.fragment&&o.fragment.c();e.intro&&At(t.$$.fragment),St(t,e.target,e.anchor),ot(),Y()}q(s)}class ee{$$=void 0;$$set=void 0;$destroy(){Ct(this,1),this.$destroy=w}$on(e,n){if(!B(n))return w;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const a=i.indexOf(n);a!==-1&&i.splice(a,1)}}$set(e){this.$$set&&!Z(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const Mt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Mt);export{ht as A,Xt as B,Gt as C,Vt as D,Ft as E,Dt as F,Pt as G,H,ee as S,pt as a,Kt as b,zt as c,At as d,Bt as e,v as f,R as g,Ot as h,te as i,$t as j,Rt as k,Ut as l,I as m,yt as n,kt as o,Jt as p,Wt as q,Yt as r,jt as s,Qt as t,Zt as u,St as v,Ct as w,V as x,qt as y,It as z};