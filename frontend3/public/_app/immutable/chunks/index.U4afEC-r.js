import{h as y}from"./scheduler.pJhfhOZw.js";function b(t){return t<.5?4*t*t*t:.5*Math.pow(2*t-2,3)+1}function m(t,{delay:e=0,duration:i=400,easing:r=b,amount:s=5,opacity:u=0}={}){const o=getComputedStyle(t),n=+o.opacity,l=o.filter==="none"?"":o.filter,a=n*(1-u),[p,f]=y(s);return{delay:e,duration:i,easing:r,css:(_,c)=>`opacity: ${n-a*c}; filter: ${l} blur(${c*p}${f});`}}export{m as b};
