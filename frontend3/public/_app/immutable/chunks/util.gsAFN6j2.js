import{w as d}from"./index.s9qPHlv5.js";var b=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},w={};(function(){var s,h,o,c,f,F,u,a;a=function(e){var t,n,r,i;return t=(e&255<<24)>>>24,n=(e&255<<16)>>>16,r=(e&65280)>>>8,i=e&255,[t,n,r,i].join(".")},u=function(e){var t,n,r,i,l,g;for(t=[],r=i=0;i<=3&&e.length!==0;r=++i){if(r>0){if(e[0]!==".")throw new Error("Invalid IP");e=e.substring(1)}g=h(e),l=g[0],n=g[1],e=e.substring(n),t.push(l)}if(e.length!==0)throw new Error("Invalid IP");switch(t.length){case 1:if(t[0]>4294967295)throw new Error("Invalid IP");return t[0]>>>0;case 2:if(t[0]>255||t[1]>16777215)throw new Error("Invalid IP");return(t[0]<<24|t[1])>>>0;case 3:if(t[0]>255||t[1]>255||t[2]>65535)throw new Error("Invalid IP");return(t[0]<<24|t[1]<<16|t[2])>>>0;case 4:if(t[0]>255||t[1]>255||t[2]>255||t[3]>255)throw new Error("Invalid IP");return(t[0]<<24|t[1]<<16|t[2]<<8|t[3])>>>0;default:throw new Error("Invalid IP")}},o=function(e){return e.charCodeAt(0)},c=o("0"),F=o("a"),f=o("A"),h=function(e){var t,n,r,i,l;for(i=0,t=10,n="9",r=0,e.length>1&&e[r]==="0"&&(e[r+1]==="x"||e[r+1]==="X"?(r+=2,t=16):"0"<=e[r+1]&&e[r+1]<="9"&&(r++,t=8,n="7")),l=r;r<e.length;){if("0"<=e[r]&&e[r]<=n)i=i*t+(o(e[r])-c)>>>0;else if(t===16)if("a"<=e[r]&&e[r]<="f")i=i*t+(10+o(e[r])-F)>>>0;else if("A"<=e[r]&&e[r]<="F")i=i*t+(10+o(e[r])-f)>>>0;else break;else break;if(i>4294967295)throw new Error("too large");r++}if(r===l)throw new Error("empty octet");return[i,r]},s=function(){function e(t,n){var r,i,l;if(typeof t!="string")throw new Error("Missing `net' parameter");if(n||(l=t.split("/",2),t=l[0],n=l[1]),n||(n=32),typeof n=="string"&&n.indexOf(".")>-1){try{this.maskLong=u(n)}catch{throw new Error("Invalid mask: "+n)}for(r=i=32;i>=0;r=--i)if(this.maskLong===4294967295<<32-r>>>0){this.bitmask=r;break}}else if(n||n===0)this.bitmask=parseInt(n,10),this.maskLong=0,this.bitmask>0&&(this.maskLong=4294967295<<32-this.bitmask>>>0);else throw new Error("Invalid mask: empty");try{this.netLong=(u(t)&this.maskLong)>>>0}catch{throw new Error("Invalid net address: "+t)}if(!(this.bitmask<=32))throw new Error("Invalid mask for ip4: "+n);this.size=Math.pow(2,32-this.bitmask),this.base=a(this.netLong),this.mask=a(this.maskLong),this.hostmask=a(~this.maskLong),this.first=this.bitmask<=30?a(this.netLong+1):this.base,this.last=this.bitmask<=30?a(this.netLong+this.size-2):a(this.netLong+this.size-1),this.broadcast=this.bitmask<=30?a(this.netLong+this.size-1):void 0}return e.prototype.contains=function(t){return typeof t=="string"&&(t.indexOf("/")>0||t.split(".").length!==4)&&(t=new e(t)),t instanceof e?this.contains(t.base)&&this.contains(t.broadcast||t.last):(u(t)&this.maskLong)>>>0===(this.netLong&this.maskLong)>>>0},e.prototype.next=function(t){return t==null&&(t=1),new e(a(this.netLong+this.size*t),this.mask)},e.prototype.forEach=function(t){var n,r,i;for(i=u(this.first),r=u(this.last),n=0;i<=r;)t(a(i),i,n),n++,i++},e.prototype.toString=function(){return this.base+"/"+this.bitmask},e}(),w.ip2long=u,w.long2ip=a,w.Netmask=s}).call(b);const k=d(""),m=s=>new Promise((h,o)=>{s.then(c=>{c.ok?c.json().then(f=>{h(f)}).catch(f=>{o(f)}):c.text().then(f=>{o(f)}).catch(f=>{o(f)})}).catch(c=>{o(c)})}),v=(s,h)=>m(fetch(s,h)),y=s=>s.city.RepresentedCountry?s.city.RepresentedCountry:{IsInEuropeanUnion:!1,IsoCode:"",Names:null,Type:""},x=s=>/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(s),L=s=>/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/.test(s),p=s=>{if(!x(s))return!1;try{new w.Netmask(s)}catch{return!1}return!0};export{w as a,p as c,v as f,y as g,L as i,k as n};
