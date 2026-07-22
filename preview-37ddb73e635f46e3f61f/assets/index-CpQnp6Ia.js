(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();class Be{map=new Map;register(e){this.map.set(e.name.toLowerCase(),e)}registerAll(e){for(const t of e)this.register(t)}get(e){return this.map.get(e.toLowerCase())}all(){return[...this.map.values()]}visible(){return this.all().filter(e=>!e.hidden)}names(){return[...this.map.keys()]}}const je=["n","s","e","w","ne","nw","se","sw"];function Ge(o){const e=document.createElement("section");e.className="window brackets is-opening",e.setAttribute("role","dialog"),e.setAttribute("aria-label",o);const t=document.createElement("header");t.className="window__bar";const n=document.createElement("span");n.className="window__dots";const i=document.createElement("span");i.className="window__dot";const s=document.createElement("span");s.className="window__dot";const a=document.createElement("span");a.className="window__dot",n.append(i,s,a);const c=document.createElement("span");c.className="window__title",c.textContent=o;const l=document.createElement("span");l.className="window__controls";const r=document.createElement("button");r.className="window__btn window__btn--min",r.type="button",r.title="minimize",r.setAttribute("aria-label","minimize window"),r.textContent="–";const d=document.createElement("button");d.className="window__btn window__btn--max",d.type="button",d.title="maximize",d.setAttribute("aria-label","maximize window"),d.textContent="□";const p=document.createElement("button");p.className="window__btn window__btn--close",p.type="button",p.title="close",p.setAttribute("aria-label","close window"),p.textContent="×",l.append(r,d,p),t.append(n,c,l);const g=document.createElement("div");g.className="window__body",e.append(t,g);const v=je.map(b=>{const h=document.createElement("span");return h.className=`window__resize window__resize--${b}`,h.dataset.dir=b,e.append(h),h});return{el:e,barEl:t,bodyEl:g,closeBtn:p,minimizeBtn:r,maximizeBtn:d,resizeHandles:v}}class He{root;folderBtn;countEl;listEl;items=new Map;open=!1;constructor(e){this.root=document.createElement("div"),this.root.className="tray",this.root.hidden=!0,this.folderBtn=document.createElement("button"),this.folderBtn.className="tray__folder",this.folderBtn.type="button",this.folderBtn.setAttribute("aria-label","minimized windows"),this.folderBtn.setAttribute("aria-haspopup","true"),this.folderBtn.setAttribute("aria-expanded","false"),this.folderBtn.innerHTML='<span class="tray__glyph" aria-hidden="true">▚</span><span class="tray__count">0</span>',this.countEl=this.folderBtn.querySelector(".tray__count"),this.listEl=document.createElement("div"),this.listEl.className="tray__list",this.listEl.hidden=!0,this.folderBtn.addEventListener("click",()=>this.toggle()),this.root.append(this.folderBtn,this.listEl),e.append(this.root)}add(e,t,n){this.items.set(e,{title:t,onRestore:n}),this.render()}remove(e){this.items.delete(e),this.items.size===0&&(this.open=!1),this.render()}has(e){return this.items.has(e)}toggle(){this.open=!this.open&&this.items.size>0,this.render()}render(){const e=this.items.size;this.root.hidden=e===0,this.countEl.textContent=String(e),this.listEl.hidden=!this.open||e===0,this.folderBtn.classList.toggle("is-open",this.open),this.folderBtn.setAttribute("aria-expanded",String(this.open&&e>0)),this.listEl.replaceChildren();for(const[t,n]of this.items){const i=document.createElement("button");i.className="tray__item",i.type="button",i.textContent=n.title,i.addEventListener("click",()=>{n.onRestore(),this.open=!1,this.render()}),this.listEl.append(i)}}}const T=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,z=o=>new Promise(e=>window.setTimeout(e,o));async function ie(o,e,t={}){const{speed:n=18,delay:i=0}=t;if(T()){o.textContent=e;return}i>0&&await z(i),o.textContent="";for(const s of e)o.textContent+=s,await z(n)}function q(o,e){T()||(o.classList.add(e),o.addEventListener("animationend",()=>o.classList.remove(e),{once:!0}))}const le=["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];function Le(o,e){const t=performance.now();let n=null;if(T())o.textContent=`${e}…`;else{let i=0;const s=()=>{const a=le[i%le.length],c=".".repeat((i>>2)%4);o.textContent=`${a} ${e}${c}`,i++};s(),n=window.setInterval(s,90)}return{stop(){return n!==null&&window.clearInterval(n),(performance.now()-t)/1e3}}}const ce={width:420,height:300},G=260,O=160,A=8,Y=16,P=12;class Ue{root;tray;records=new Map;minimized=new Set;mru=[];topZ=100;spawnCount=0;area={w:0,h:0};ro;constructor(e){this.root=e,this.tray=new He(e),this.ro=new ResizeObserver(()=>this.remeasure()),this.ro.observe(e),window.addEventListener("resize",()=>this.remeasure()),this.measure()}measure(){const e=parseFloat(getComputedStyle(this.root).getPropertyValue("--desktop-inset-bottom"));this.area={w:this.root.clientWidth,h:Math.max(O,this.root.clientHeight-(Number.isFinite(e)?e:0))}}remeasure(){this.measure(),this.reclampAll()}reclampAll(){const{w:e,h:t}=this.area;if(!(e===0||t===0))for(const[n,i]of this.records){if(this.minimized.has(n))continue;const s=i.el;if(s.classList.contains("is-maximized")){s.style.left=`${P}px`,s.style.top=`${P}px`,s.style.width=`${e-P*2}px`,s.style.height=`${t-P*2}px`;continue}const a=Math.min(s.offsetWidth,Math.max(G,e-Y)),c=Math.min(s.offsetHeight,Math.max(O,t-Y));s.style.width=`${a}px`,s.style.height=`${c}px`;const l=Math.min(s.offsetLeft,Math.max(A,e-a-A)),r=Math.min(s.offsetTop,Math.max(A,t-c-A));s.style.left=`${Math.max(0,l)}px`,s.style.top=`${Math.max(0,r)}px`}}open(e){const t=e.singleton??!0,n=this.records.get(e.id);if(t&&n)return this.minimized.has(e.id)?this.restore(e.id):n.instance.focus(),n.instance;const i=Ge(e.title),{el:s,bodyEl:a,barEl:c,closeBtn:l,minimizeBtn:r,maximizeBtn:d,resizeHandles:p}=i,{w:g,h:v}=this.area,b=Math.max(G,g-Y),h=Math.max(O,v-Y),m=Math.min(e.width??ce.width,b),f=Math.min(e.height??ce.height,h);s.style.width=`${m}px`,s.style.height=`${f}px`;const k=this.spawnCount++%6*26,u=e.x??Math.max(A,g/2-m/2+k),E=e.y??Math.max(A,v/2-f/2+k);s.style.left=`${Math.min(u,Math.max(A,g-m-A))}px`,s.style.top=`${Math.min(E,Math.max(A,v-f-A))}px`,typeof e.content=="string"?a.textContent=e.content:a.appendChild(e.content);const C={id:e.id,el:s,bodyEl:a,close:()=>this.close(e.id),focus:()=>this.focus(e.id)};return l.addEventListener("click",_=>{_.stopPropagation(),this.close(e.id)}),r.addEventListener("click",_=>{_.stopPropagation(),this.minimize(e.id)}),d.addEventListener("click",_=>{_.stopPropagation(),this.toggleMaximize(e.id)}),c.addEventListener("dblclick",_=>{_.target.closest(".window__dot, .window__btn")||this.toggleMaximize(e.id)}),s.addEventListener("pointerdown",()=>this.focus(e.id)),s.addEventListener("keydown",_=>{_.key!=="Escape"||_.target.closest("input, textarea, select, [contenteditable]")||(_.stopPropagation(),this.close(e.id))}),this.enableDrag(s,c),this.enableResize(e.id,s,p),this.records.set(e.id,{instance:C,el:s,title:e.title}),this.root.appendChild(s),this.focus(e.id),C}close(e){const t=this.records.get(e);if(!t)return;this.records.delete(e);const n=this.minimized.delete(e);if(this.mru=this.mru.filter(i=>i!==e),this.tray.has(e)&&this.tray.remove(e),T()||n){t.el.remove();return}t.el.classList.add("is-closing"),t.el.addEventListener("animationend",()=>t.el.remove(),{once:!0}),window.setTimeout(()=>t.el.remove(),600)}toggleMaximize(e){const t=this.records.get(e);if(!t||this.minimized.has(e))return;if(this.measure(),T()||(t.el.classList.add("is-snapping"),window.setTimeout(()=>t.el.classList.remove("is-snapping"),300)),t.savedRect){const i=t.savedRect;t.el.style.left=i.left,t.el.style.top=i.top,t.el.style.width=i.width,t.el.style.height=i.height,delete t.savedRect,t.el.classList.remove("is-maximized")}else t.savedRect={left:t.el.style.left,top:t.el.style.top,width:t.el.style.width,height:t.el.style.height},t.el.style.left=`${P}px`,t.el.style.top=`${P}px`,t.el.style.width=`${this.area.w-P*2}px`,t.el.style.height=`${this.area.h-P*2}px`,t.el.classList.add("is-maximized");const n=t.el.querySelector(".window__btn--max");if(n){const i=t.el.classList.contains("is-maximized");n.textContent=i?"❐":"□",n.title=i?"restore":"maximize",n.setAttribute("aria-label",i?"restore window":"maximize window")}this.focus(e)}focus(e){const t=this.records.get(e);if(t){for(const[n,i]of this.records)i.el.classList.toggle("is-active",n===e&&!this.minimized.has(n));t.el.style.zIndex=String(++this.topZ),this.mru=[e,...this.mru.filter(n=>n!==e)]}}cycle(e){const t=this.mru.filter(i=>this.records.has(i)&&!this.minimized.has(i));if(t.length<2)return;const n=e===1?t[1]:t[t.length-1];n&&this.focus(n)}get(e){return this.records.get(e)?.instance}minimize(e){const t=this.records.get(e);if(!(!t||this.minimized.has(e))){if(this.minimized.add(e),t.el.classList.remove("is-active"),this.tray.add(e,t.title,()=>this.restore(e)),T()){t.el.style.display="none";return}t.el.classList.add("is-minimizing"),t.el.addEventListener("animationend",()=>{t.el.style.display="none",t.el.classList.remove("is-minimizing")},{once:!0})}}list(){return[...this.records.entries()].map(([e,t])=>({id:e,title:t.el.querySelector(".window__title")?.textContent??e,el:t.el,minimized:this.minimized.has(e)}))}restore(e){const t=this.records.get(e);t&&(this.minimized.delete(e),this.tray.has(e)&&this.tray.remove(e),t.el.style.display="",t.el.classList.remove("is-minimizing"),this.focus(e),q(t.el,"is-opening"))}enableDrag(e,t){let n=0,i=0,s=0,a=0,c=!1;const l=d=>{if(!c)return;const p=s+(d.clientX-n),g=a+(d.clientY-i);e.style.left=`${Math.min(Math.max(p,-e.clientWidth+80),this.area.w-80)}px`,e.style.top=`${Math.min(Math.max(g,0),this.area.h-40)}px`},r=d=>{c=!1,t.releasePointerCapture?.(d.pointerId),window.removeEventListener("pointermove",l),window.removeEventListener("pointerup",r),window.removeEventListener("pointercancel",r)};t.addEventListener("pointerdown",d=>{d.target.closest(".window__btn")||e.classList.contains("is-maximized")||(this.measure(),c=!0,n=d.clientX,i=d.clientY,s=e.offsetLeft,a=e.offsetTop,t.setPointerCapture?.(d.pointerId),window.addEventListener("pointermove",l),window.addEventListener("pointerup",r),window.addEventListener("pointercancel",r))})}enableResize(e,t,n){for(const i of n)i.addEventListener("pointerdown",s=>{if(s.preventDefault(),s.stopPropagation(),t.classList.contains("is-maximized"))return;this.focus(e),this.measure();const a=i.dataset.dir??"se",c=s.clientX,l=s.clientY,r=t.offsetLeft,d=t.offsetTop,p=t.offsetWidth,g=t.offsetHeight,{w:v,h:b}=this.area,h=r+p,m=d+g,f=u=>{const E=u.clientX-c,C=u.clientY-l;let _=r,S=d,w=p,M=g;a.includes("e")&&(w=Math.min(Math.max(G,p+E),Math.max(G,v-r-A))),a.includes("s")&&(M=Math.min(Math.max(O,g+C),Math.max(O,b-d-A))),a.includes("w")&&(_=Math.min(Math.max(0,r+E),h-G),w=h-_),a.includes("n")&&(S=Math.min(Math.max(0,d+C),m-O),M=m-S),t.style.left=`${_}px`,t.style.top=`${S}px`,t.style.width=`${w}px`,t.style.height=`${M}px`},k=u=>{i.releasePointerCapture?.(u.pointerId),window.removeEventListener("pointermove",f),window.removeEventListener("pointerup",k),window.removeEventListener("pointercancel",k)};i.setPointerCapture?.(s.pointerId),window.addEventListener("pointermove",f),window.addEventListener("pointerup",k),window.addEventListener("pointercancel",k)})}}function de(o){const e=[];let t="",n=!1,i=null;for(let s=0;s<o.length;s++){const a=o[s];if(i){a===i?i=null:i==='"'&&a==="\\"&&(o[s+1]==='"'||o[s+1]==="\\")?t+=o[++s]:t+=a;continue}if(a==="\\"&&s+1<o.length){t+=o[++s],n=!0;continue}if(a==='"'||a==="'"){i=a,n=!0;continue}if(/\s/.test(a)){n&&(e.push(t),t="",n=!1);continue}t+=a,n=!0}return n&&e.push(t),e}function De(o){const e=[],t={};for(const n of o){const i=/^--([^=\s]+)(?:=(.*))?$/.exec(n);i?t[i[1]]=i[2]!==void 0?i[2]:!0:e.push(n)}return{args:e,flags:t}}const he="visitor@lucenity:~$",Ce="lucenity:history",ue=200,We={default:"terminal__line",dim:"terminal__line terminal__line--dim",sub:"terminal__line terminal__line--sub"};function qe(o){if(o.length===0)return"";let e=o[0];for(const t of o.slice(1)){for(;!t.startsWith(e);)e=e.slice(0,-1);if(e==="")break}return e}function Ve(o,e,t){if(Math.abs(o.length-e.length)>t)return t+1;const n=Array.from({length:o.length+1},()=>new Array(e.length+1).fill(0));for(let i=0;i<=o.length;i++)n[i][0]=i;for(let i=0;i<=e.length;i++)n[0][i]=i;for(let i=1;i<=o.length;i++)for(let s=1;s<=e.length;s++){const a=o[i-1]===e[s-1]?0:1;let c=Math.min(n[i-1][s]+1,n[i][s-1]+1,n[i-1][s-1]+a);i>1&&s>1&&o[i-1]===e[s-2]&&o[i-2]===e[s-1]&&(c=Math.min(c,n[i-2][s-2]+1)),n[i][s]=c}return n[o.length][e.length]}function Ye(o,e){if(o.length<2)return null;const t=o.length>=6?2:1;let n=null;for(const i of e){const s=Ve(o,i,t);s<=t&&(!n||s<n.dist)&&(n={name:i,dist:s})}return n?.name??null}function Ke(){try{const o=localStorage.getItem(Ce);if(!o)return[];const e=JSON.parse(o);return Array.isArray(e)?e.filter(t=>typeof t=="string"):[]}catch{return[]}}function Je(o){try{localStorage.setItem(Ce,JSON.stringify(o))}catch{}}class Qe{scrollEl;inputRow;inputEl;ghostBefore;caretText;ghostAfter;registry;windows;history=[];historyIndex=0;busy=!1;onTyping;onSend;onClear;constructor(e,t,n){this.registry=t,this.windows=n;const i=document.createElement("div");i.className="terminal";const s=document.createElement("div");s.className="terminal__surface";const a=document.createElement("div");a.className="terminal__scroll",a.setAttribute("role","log"),a.setAttribute("aria-live","polite");const c=document.createElement("div");c.className="terminal__input-row";const l=document.createElement("span");l.className="terminal__prompt",l.textContent=he;const r=document.createElement("span");r.className="terminal__field";const d=document.createElement("span");d.className="terminal__ghost",d.setAttribute("aria-hidden","true");const p=document.createTextNode(""),g=document.createElement("span");g.className="caret";const v=document.createTextNode("");g.append(v);const b=document.createTextNode("");d.append(p,g,b);const h=document.createElement("input");h.className="terminal__input",h.type="text",h.setAttribute("aria-label","terminal input"),h.autocomplete="off",h.autocapitalize="off",h.spellcheck=!1,h.setAttribute("autocorrect","off"),h.setAttribute("enterkeyhint","go"),r.append(d,h),c.append(l,r),a.append(c),s.append(a),i.append(s),e.append(i),this.scrollEl=a,this.inputRow=c,this.inputEl=h,this.ghostBefore=p,this.caretText=v,this.ghostAfter=b,this.history=Ke(),this.historyIndex=this.history.length,h.addEventListener("input",()=>this.renderGhost()),document.addEventListener("selectionchange",()=>{document.activeElement===this.inputEl&&this.renderGhost()}),h.addEventListener("keyup",()=>this.renderGhost()),h.addEventListener("click",()=>this.renderGhost()),h.addEventListener("keydown",m=>this.onKeydown(m)),s.addEventListener("click",()=>{(window.getSelection()?.toString()??"")===""&&this.focusInput()}),document.addEventListener("keydown",m=>{if(m.ctrlKey&&(m.key==="]"||m.key==="[")){m.preventDefault(),this.windows.cycle(m.key==="]"?1:-1);return}if(this.busy||m.metaKey||m.ctrlKey||m.altKey)return;const f=document.activeElement;f!==this.inputEl&&(f instanceof Element&&f.closest(".window")||(m.key.length===1||m.key==="Backspace"||m.key==="Enter")&&this.focusInput())}),this.renderGhost()}print(e="",t="default"){const n=this.makeLine(t);n.textContent=e,this.insertLine(n)}printEl(e){this.insertLine(e)}clear(){for(const e of[...this.scrollEl.children])e!==this.inputRow&&e.remove();this.onClear?.()}focusInput(){this.inputEl.focus()}bindCatOverlap(e){let t=null,n=0;const i=e.querySelector(".cat__art")??e,s=()=>{this.scrollEl.classList.remove("is-cat-overlapping"),this.scrollEl.style.removeProperty("--cat-overlap-start"),this.scrollEl.style.removeProperty("--cat-overlap-end"),this.scrollEl.style.removeProperty("--cat-overlap-ramp")},a=()=>{const g=this.scrollEl.getBoundingClientRect(),v=i.getBoundingClientRect(),b=Math.max(g.top,v.top),h=Math.min(g.bottom,v.bottom),m=Math.min(g.right,v.right)-Math.max(g.left,v.left);if(h-b<=0||m<=0||g.height<=0){s();return}const k=Math.min(24,Math.max(10,v.height*.22)),u=Math.max(k,b-g.top),E=Math.min(g.height,h-g.top);if(E<=u){s();return}this.scrollEl.style.setProperty("--cat-overlap-start",`${u}px`),this.scrollEl.style.setProperty("--cat-overlap-end",`${E}px`),this.scrollEl.style.setProperty("--cat-overlap-ramp",`${k}px`),this.scrollEl.classList.add("is-cat-overlapping")},c=(g=900)=>{if(n=Math.max(n,performance.now()+g),t!==null)return;const v=()=>{a(),performance.now()<n?t=window.requestAnimationFrame(v):t=null};t=window.requestAnimationFrame(v)},l=()=>c(300),r=()=>c(900),d=window.visualViewport,p=new ResizeObserver(()=>c(120));return window.addEventListener("resize",l),d?.addEventListener("resize",l),e.addEventListener("transitionrun",r),e.addEventListener("transitionstart",r),e.addEventListener("transitionend",r),e.addEventListener("transitioncancel",r),p.observe(this.scrollEl),p.observe(e),i!==e&&p.observe(i),a(),()=>{window.removeEventListener("resize",l),d?.removeEventListener("resize",l),e.removeEventListener("transitionrun",r),e.removeEventListener("transitionstart",r),e.removeEventListener("transitionend",r),e.removeEventListener("transitioncancel",r),p.disconnect(),t!==null&&window.cancelAnimationFrame(t),s()}}async typeLine(e,t="default",n=12){const i=this.makeLine(t);this.insertLine(i),await ie(i,e,{speed:n}),this.scrollToBottom()}setBusy(e){this.busy=e,this.inputEl.disabled=e}echoPrompt(e){const t=this.makeLine("default"),n=document.createElement("span");n.className="terminal__prompt",n.textContent=`${he} `,t.append(n,document.createTextNode(e)),this.insertLine(t)}makeLine(e){const t=document.createElement("div");return t.className=We[e],t}insertLine(e){this.scrollEl.insertBefore(e,this.inputRow),this.scrollToBottom()}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}renderGhost(){const e=this.inputEl.value,t=this.inputEl.selectionStart??e.length;this.ghostBefore.textContent=e.slice(0,t),this.caretText.textContent=e[t]??"",this.ghostAfter.textContent=e.slice(t+1),this.onTyping?.(e.length)}onKeydown(e){if(this.busy){e.preventDefault();return}switch(e.key){case"Enter":e.preventDefault(),this.submit(this.inputEl.value);break;case"ArrowUp":e.preventDefault(),this.recallHistory(-1);break;case"ArrowDown":e.preventDefault(),this.recallHistory(1);break;case"Tab":e.preventDefault(),this.handleTab();break;default:e.key==="l"&&e.ctrlKey&&(e.preventDefault(),this.clear())}}pushHistory(e){this.history[this.history.length-1]!==e&&(this.history.push(e),this.history.length>ue&&(this.history=this.history.slice(this.history.length-ue)),Je(this.history)),this.historyIndex=this.history.length}recallHistory(e){if(this.history.length===0)return;this.historyIndex=Math.min(Math.max(this.historyIndex+e,0),this.history.length);const t=this.history[this.historyIndex]??"";this.inputEl.value=t,this.inputEl.setSelectionRange(t.length,t.length),this.renderGhost()}handleTab(){const e=this.inputEl.value,t=de(e),n=/\s$/.test(e),i=t.length===0||t.length===1&&!n,s=n?"":t[t.length-1]??"";let a;if(i)a=this.registry.visible().map(r=>r.name);else{const r=this.registry.get(t[0]??"");if(!r?.complete)return;const d=n?t.slice(1):t.slice(1,-1);a=r.complete(d)}const c=a.filter(r=>r.startsWith(s)).sort();if(c.length===0)return;if(c.length===1){const r=c[0],d=i?[]:n?t:t.slice(0,-1);this.setInput([...d,r].join(" ")+" ");return}const l=qe(c);if(l.length>s.length){const r=i?[]:n?t:t.slice(0,-1);this.setInput([...r,l].join(" "));return}this.print(c.join("  "),"dim")}setInput(e){this.inputEl.value=e,this.inputEl.setSelectionRange(e.length,e.length),this.renderGhost()}async submit(e){const t=e.trim();if(this.echoPrompt(e),this.inputEl.value="",this.renderGhost(),this.onSend?.(),t==="")return;this.pushHistory(t);const n=de(t);if(n.length===0)return;const i=(n[0]??"").replace(/^\//,""),{args:s,flags:a}=De(n.slice(1)),c=this.registry.get(i);if(!c){const l=Ye(i,this.registry.visible().map(r=>r.name));this.print(l?`command not found: ${i} — did you mean \`${l}\`?`:`command not found: ${i} — type \`help\``,"dim");return}this.setBusy(!0);try{await c.run({terminal:this,windows:this.windows,args:s,flags:a,raw:t})}catch(l){const r=l instanceof Error?l.message:String(l);this.print(`error: ${r}`,"dim")}finally{this.setBusy(!1),this.focusInput()}}}const Xe=["┌───────────────────────────┐","│   l u c e n i t y O S     │","│   bios v1.1 — mono/64k    │","└───────────────────────────┘"],Ze=[["● cpu ................ ok","sub",30],["● memory ............. 640k (plenty)","sub",30],["● pixel shaders ...... ok","sub",40],["● crt scanlines ...... flickering nicely","sub",30],["● liffy.service ...... loaded","sub",60],["● cat daemon ......... asleep (do not wake)","sub",120],["mounting /home/visitor ... done","dim",60]];async function et(o){o.setBusy(!0);for(const e of Xe)o.print(e,"dim");T()||await z(180);for(const[e,t,n]of Ze)await o.typeLine(e,t,6),T()||await z(n);o.print(),o.print("welcome. type `help` to see what i can do.","default"),o.print(),o.setBusy(!1),o.focusInput()}const D=["..#.......#...............",".###.....###..............",".#.##....#.##.............",".#..##..##..##............",".#.########..##...........",".################.........",".#################........",".##################.......",".##################.......","###################.......","###################.#####.","##...####...##############","##########################","####################...###",".################.........","..#############..........."],tt={sleep:{},awake:{10:"##..#####..########.#####.",11:"##..#####..###############"},think:{10:"##########.########.#####.",11:"##..####..################"},"munch-a":{12:"#####...##################"},"munch-b":{12:"######..##################"},peek:{10:"##..###############.#####.",11:"##..#####...##############"}};function xe(o="sleep"){const e=tt[o];return D.map((t,n)=>e[n]??t).map(t=>[...t].map(n=>n==="#"?"██":"  ").join("")).join(`
`)}function nt(o,e){const t=o.querySelector(".cat__art");t&&(t.textContent=xe(e)),o.dataset.frame=e}function se(o="cat",e="sleep"){const t=document.createElement("div");t.className=o,t.dataset.frame=e;const n=document.createElement("pre");n.className="cat__art",n.textContent=xe(e),n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="cat__zzz",i.setAttribute("aria-hidden","true");for(let s=0;s<3;s++){const a=document.createElement("span");a.className="cat__z",a.textContent="z",a.style.animationDelay=`${s*.9}s`,i.append(a)}return t.addEventListener("dragstart",s=>s.preventDefault()),t.append(i,n),t}const it=24,st=3,ot=2e3,me=["quiet!","let me sleep!"],at=1e3,rt=3e3,pe=5,fe=260,lt=45e3,ct=1e5,dt=6e4,ht=15e3,ut=2e4,mt=4500,pt=["zzz... sudo... nice try... zzz","mrrp... a command... named after me...","zzz... git clone... take one home...","...ctrl+] ... windows go round... zzz","zzz... liffy keeps secrets too...","...feed me... 24 keys... zzz","i can brew coffee... but i like cookies more... zzz","zzz... i know secrets... ask me... zzz","mrrp... coffee... i like it... zzz"],ft=["mrrp... say meow... i dare you...","zzz... cookie... just type it...","...hold me... one whole second... prrr","zzz... stare at me... see what happens...","...pet me... i like it... prrrr...","...i know secrets... ask me... zzz","cookie... treat... feed me... zzz","mrrp... coffee... i like it... zzz","zzz... secrets... ask me... zzz"];class Me{el;catEl;fillEl;meterEl;plateEl;bubbleEl;opts;cornered=!1;munching=!1;thinking=!1;bobbing=!1;staring=!1;petting=!1;clickTimes=[];bubbleTimer=null;petTimer=null;hoverTimer=null;murmurs;murmurIdx=0;lastActivity=performance.now();constructor(e){this.opts=e,this.el=document.createElement("div"),this.el.className=`catc catc--${e.mode}`,this.el.dataset.frame=e.idleFrame,this.catEl=se("cat catc__cat",e.idleFrame),this.bubbleEl=document.createElement("span"),this.bubbleEl.className="catc__bubble",this.bubbleEl.setAttribute("role","status"),this.meterEl=document.createElement("div"),this.meterEl.className="catc__meter",this.fillEl=document.createElement("div"),this.fillEl.className="catc__fill",this.plateEl=document.createElement("button"),this.plateEl.className="catc__plate",this.plateEl.type="button",this.plateEl.title="feed the cat",this.plateEl.setAttribute("aria-label","feed the cat a cookie"),this.meterEl.append(this.fillEl,this.plateEl),this.el.append(this.bubbleEl,this.catEl,this.meterEl),e.mount.append(this.el),this.wireAngryClicks(),e.mode==="liffy"&&(this.wirePetHold(),this.wireStareHover()),this.plateEl.addEventListener("click",t=>{t.stopPropagation(),this.feed()}),this.murmurs=[...e.mode==="hero"?pt:ft].sort(()=>Math.random()-.5),this.scheduleMurmur(lt)}onTyping(e){e>0&&(this.lastActivity=performance.now()),e>0&&!this.cornered&&this.corner();const t=Math.min(e/it,1);this.fillEl.style.width=`${t*100}%`,this.el.classList.toggle("catc--typing",e>0||this.munching),this.plateEl.classList.toggle("is-served",t>=1)}onSend(){this.lastActivity=performance.now(),this.fillEl.style.width="0%",this.plateEl.classList.remove("is-served"),this.munching||this.el.classList.remove("catc--typing")}fillNow(){this.cornered||this.corner(),this.fillEl.style.width="100%",this.el.classList.add("catc--typing"),this.plateEl.classList.add("is-served")}corner(){this.cornered=!0,this.el.classList.add("catc--corner"),this.setFrame("sleep"),this.opts.onCorner?.()}restoreCenter(){this.cornered=!1,this.el.classList.remove("catc--corner"),this.onSend(),this.setFrame(this.opts.idleFrame)}feed(){if(this.munching)return;if(this.munching=!0,this.plateEl.classList.remove("is-served"),this.fillEl.style.width="0%",T()){this.setFrame("munch-a"),this.say("nom.",900),window.setTimeout(()=>{this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing")},900);return}this.say("nom nom nom",pe*fe+300);let e=0;const t=window.setInterval(()=>{this.setFrame(e%2===0?"munch-a":"munch-b"),e++,e>pe&&(window.clearInterval(t),this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing"))},fe)}think(e){this.thinking=e,!this.munching&&this.setFrame(e?"think":this.restFrame())}bob(e){this.bobbing=e,e?(this.munching||this.setFrame("awake"),T()||this.el.classList.add("catc--bob")):(this.el.classList.remove("catc--bob"),!this.munching&&!this.thinking&&this.setFrame(this.restFrame()))}hop(){q(this.el,"catc--hop")}say(e,t=2e3){this.bubbleTimer!==null&&window.clearTimeout(this.bubbleTimer),this.bubbleEl.textContent=e,this.bubbleEl.classList.add("is-visible"),this.bubbleTimer=window.setTimeout(()=>{this.bubbleEl.classList.remove("is-visible"),this.bubbleTimer=null},t)}scheduleMurmur(e){window.setTimeout(()=>this.tryMurmur(),e)}tryMurmur(){if(!this.el.isConnected)return;if(this.munching||this.thinking||this.bobbing||this.petting||this.bubbleTimer!==null||document.hidden||performance.now()-this.lastActivity<ut){this.scheduleMurmur(ht);return}this.say(this.murmurs[this.murmurIdx++%this.murmurs.length],mt),this.scheduleMurmur(ct+Math.random()*dt)}restFrame(){return this.cornered?"sleep":this.opts.idleFrame}setFrame(e){nt(this.catEl,e),this.el.dataset.frame=e}wireAngryClicks(){this.catEl.addEventListener("click",()=>{if(this.petting)return;const e=performance.now();this.clickTimes=this.clickTimes.filter(t=>e-t<ot),this.clickTimes.push(e),this.clickTimes.length>=st&&(this.clickTimes=[],q(this.el,"catc--shake"),this.say(me[Math.floor(Math.random()*me.length)],2e3))})}wirePetHold(){this.catEl.addEventListener("pointerdown",()=>{this.petTimer=window.setTimeout(()=>{this.petting=!0,this.el.classList.add("catc--pet"),this.say("prrrrr.",6e4)},at)});const e=()=>{this.petTimer!==null&&window.clearTimeout(this.petTimer),this.petTimer=null,this.petting&&(this.el.classList.remove("catc--pet"),this.bubbleEl.classList.remove("is-visible"),window.setTimeout(()=>{this.petting=!1},0))};this.catEl.addEventListener("pointerup",e),this.catEl.addEventListener("pointerleave",e)}wireStareHover(){this.catEl.addEventListener("mouseenter",()=>{this.hoverTimer=window.setTimeout(()=>{!this.munching&&!this.thinking&&!this.bobbing&&(this.staring=!0,this.setFrame("peek"))},rt)}),this.catEl.addEventListener("mouseleave",()=>{this.hoverTimer!==null&&window.clearTimeout(this.hoverTimer),this.hoverTimer=null,this.staring&&(this.staring=!1,this.setFrame(this.restFrame()))})}}const ge=["hello, stranger!","oh, you're back.","shh. the cat sleeps.","type something. anything."];function gt(o){const e=document.createElement("div");e.className="hero",e.setAttribute("aria-hidden","true");const t=document.createElement("div");t.className="hero__title";const n=document.createElement("span"),i=document.createElement("span");i.className="caret hero__caret",t.append(n,i);const s=document.createElement("div");s.className="hero__sub",s.textContent="do not wake the cat. type instead.",e.append(t,s),o.append(e);const a=new Me({mount:o,mode:"hero",idleFrame:"sleep",onCorner:()=>e.classList.add("hero--hidden")}),c=ge[Math.floor(Math.random()*ge.length)];return(async()=>(q(e,"is-arriving"),q(a.el,"is-arriving"),T()||await z(350),await ie(n,c,{speed:55}),T()||await z(250),s.classList.add("is-visible")))(),{companion:a,restore(){e.classList.remove("hero--hidden"),a.restoreCenter()}}}const ye="lucenity-shell-mode";class yt{mode;listeners=[];toggleBtn;constructor(){const e=localStorage.getItem(ye);this.mode=e==="gui"?"gui":"tty",this.toggleBtn=document.createElement("button"),this.toggleBtn.type="button",this.toggleBtn.className="mode-toggle",this.toggleBtn.addEventListener("click",()=>{this.set(this.mode==="tty"?"gui":"tty")}),document.body.append(this.toggleBtn),this.apply(!1)}get current(){return this.mode}set(e){if(e!==this.mode){this.mode=e,localStorage.setItem(ye,e),this.apply(!0);for(const t of this.listeners)t(e)}}onChange(e){this.listeners.push(e)}apply(e){if(document.body.classList.toggle("mode-gui",this.mode==="gui"),this.toggleBtn.textContent=this.mode==="tty"?"[ gui ]":"[ terminal ]",this.toggleBtn.title=this.mode==="tty"?"switch to the GUI desktop":"switch back to the terminal",this.toggleBtn.setAttribute("aria-pressed",String(this.mode==="gui")),e&&this.mode==="gui"&&!T()){const t=document.querySelector(".rig__screen");t&&(t.classList.remove("is-powering"),t.offsetWidth,t.classList.add("is-powering"),t.addEventListener("animationend",()=>t.classList.remove("is-powering"),{once:!0}))}}}const wt=.75;function bt(){const o=document.documentElement,e=window.visualViewport;let t=0;const n=()=>{const s=e?.height??window.innerHeight,a=e?.offsetTop??0;o.style.setProperty("--vv-height",`${s}px`),o.style.setProperty("--vv-top",`${a}px`),document.body.classList.toggle("is-keyboard-open",s<window.innerHeight*wt)},i=()=>{cancelAnimationFrame(t),t=requestAnimationFrame(n)};return e&&(e.addEventListener("resize",i),e.addEventListener("scroll",i)),window.addEventListener("resize",i),window.addEventListener("orientationchange",i),n(),()=>{cancelAnimationFrame(t),e&&(e.removeEventListener("resize",i),e.removeEventListener("scroll",i)),window.removeEventListener("resize",i),window.removeEventListener("orientationchange",i)}}const oe=o=>o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function vt(o){let e=oe(o);return e=e.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(t,n,i)=>`<a href="${i}" target="_blank" rel="noreferrer noopener">${n}</a>`),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__([^_]+)__/g,"<strong>$1</strong>"),e=e.replace(/(^|[^*])\*([^*\s][^*]*)\*/g,"$1<em>$2</em>"),e=e.replace(/(^|[^_])_([^_\s][^_]*)_/g,"$1<em>$2</em>"),e}function K(o){return o.split(/(`[^`]+`)/g).map(e=>e.length>=2&&e.startsWith("`")&&e.endsWith("`")?`<code>${oe(e.slice(1,-1))}</code>`:vt(e)).join("")}function kt(o){return o.replace(/```[^\n]*\n?/g,"").replace(/`([^`]+)`/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/__([^_]+)__/g,"$1").replace(/\*([^*]+)\*/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^#{1,6}\s+/gm,"").replace(/^\s*[-*+]\s+/gm,"• ").replace(/^>\s?/gm,"").replace(/\n{3,}/g,`

`).trim()}const J=/^(\s*)([-*+]|\d+\.)\s+(.*)$/;function Te(o){const e=o.replace(/\r\n?/g,`
`).split(`
`),t=[];let n=0;for(;n<e.length;){const i=e[n];if(/^```/.test(i.trim())){const c=i.trim().slice(0,3);n++;const l=[];for(;n<e.length&&!e[n].trim().startsWith(c);)l.push(e[n]),n++;n++,t.push(`<pre class="md-pre"><code>${oe(l.join(`
`))}</code></pre>`);continue}if(i.trim()===""){n++;continue}const s=/^(#{1,6})\s+(.*)$/.exec(i);if(s){const c=s[1].length;t.push(`<h${c}>${K(s[2].trim())}</h${c}>`),n++;continue}if(/^(-{3,}|\*{3,}|_{3,})\s*$/.test(i.trim())){t.push("<hr />"),n++;continue}if(/^>\s?/.test(i)){const c=[];for(;n<e.length&&/^>\s?/.test(e[n]);)c.push(e[n].replace(/^>\s?/,"")),n++;t.push(`<blockquote>${K(c.join(" "))}</blockquote>`);continue}if(J.test(i)){const l=/^\s*\d+\./.test(i)?"ol":"ul",r=[];for(;n<e.length&&J.test(e[n]);){const d=J.exec(e[n]);r.push(`<li>${K(d[3])}</li>`),n++}t.push(`<${l}>${r.join("")}</${l}>`);continue}const a=[];for(;n<e.length&&e[n].trim()!==""&&!/^```/.test(e[n].trim())&&!/^#{1,6}\s/.test(e[n])&&!/^>\s?/.test(e[n])&&!J.test(e[n])&&!/^(-{3,}|\*{3,}|_{3,})\s*$/.test(e[n].trim());)a.push(e[n]),n++;t.push(`<p>${K(a.join(" "))}</p>`)}return t.join(`
`)}const Et=`# Nafees S

\`lucenity0\` · developer & designer — web, iOS, and applied ML

> Building small, sharp things for the web and iOS. This whole site is one of them.

---

## Overview

Third-year B.E. Computer Science & Engineering student at B.M.S. College of Engineering
(BMSCE), Bengaluru, expected to graduate in 2027. Works across full-stack development,
applied machine learning research, and freelance/client design under the personal brand
**Lucenity**. Focus areas span backend systems (FastAPI, PostgreSQL), native iOS (SwiftUI),
and multimodal / reinforcement learning research.

## Projects

### Liffy
Open-source, self-hosted AI-powered code review tool (\`lucenity0/Liffy\`). Built on FastAPI,
React/TypeScript, PostgreSQL, Redis, Celery, ChromaDB, and LangChain, with GitHub OAuth for
repo access. Users supply their own LLM API keys rather than routing through a hosted
service. Development included a full GitHub Issues/milestones setup run across a two-week
sprint, one-command setup scripts for both macOS and Windows, and Vertex AI integration for
Claude model access with prompt caching.

### Askcal
*(formerly Pulse)* — an AI-powered daily scheduler for student freelancers, built around a
coffee-brew metaphor as its core UX language. Stack: FastAPI + PostgreSQL backend, SwiftUI
iOS app, Google OAuth. Core feature is a regret-ranked inbox classifier that uses Gemini
structured output to pull signals out of Gmail and compute a deterministic 0–100 "regret
score" per email, auto-converting actionable mail into tasks slotted around real Google
Calendar events. Ships as a full monochrome iOS app with Today, Inbox, Calendar, Routines,
and Review views, backed by async SQLAlchemy and JWT auth with opaque refresh token
rotation, and 79 passing backend tests.

### Tiket
Full-stack ticket booking system (SwiftUI, FastAPI, PostgreSQL, AWS EC2, JWT). Handles
concurrency-safe seat allocation using PostgreSQL \`SELECT FOR UPDATE\`, deployed on EC2 and
load tested at 12,441 concurrent requests with zero double bookings. The SwiftUI frontend
supports real-time seat selection and dynamic barcode generation.

### Schedulr
OS concepts simulator (React, TypeScript, Vite, Tailwind CSS). Implements 12+ classical OS
algorithms — CPU scheduling, page replacement, disk scheduling — as a fully type-safe,
responsive SPA with real-time Gantt chart visualization. Actively used by junior students
at BMSCE.

## Research

### [Paper title to confirm] — Cross-Modal Attention for Hateful Meme Detection
Multimodal research on hateful meme detection using CLIP ViT-L/14 with a dynamic gating
mechanism. The framework combines a CrossModalAttention module, a DynamicGatingNetwork,
and a FocalLoss objective. Currently being prepared for IEEE resubmission, addressing gaps
identified in the first round: single-dataset evaluation, missing SOTA comparisons,
overfitting, and bibliography issues. Training ran on an NVIDIA RTX A5000, running static
and dynamic model variants simultaneously.

### Interpretable PPO-Based Adaptive Traffic Signal Control
Reinforcement learning research (Python, SUMO, TraCI) on adaptive traffic signal control.
Implements a PPO agent trained with curriculum learning across increasing traffic
complexity, paired with attention-based feature attribution to address the black-box
problem common to AI-driven infrastructure systems. Includes a real-time bidirectional
SUMO–TraCI communication loop (IoT-style feedback), with constrained emergency preemption
and priority queuing.

## Leadership

- **Senior Coordinator, Phase Shift 2025** (BMSCE), 2024–2025 — co-led logistics for
  BMSCE's annual technical fest.
- **Junior Coordinator, Utsav 2025** — managed the design team and on-ground event
  operations.

## Elsewhere

- GitHub — [github.com/lucenity0](https://github.com/lucenity0)
- Type \`contact\` for the rest, or \`liffy\` to just ask me things.`;function Ae(o){const e=document.createElement("div");e.className="docs",e.innerHTML=Te(Et),e.prepend(se("cat docs__avatar")),o.windows.open({id:"about",title:"about — nafees",content:e,width:540,height:460}),o.terminal.print("opened: about","dim")}function Ie(o){const e=document.createElement("div");e.className="contact",e.innerHTML=`
    <h2>contact</h2>
    <ul class="contact__list">
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        <span class="muted">github</span>
        <a href="https://github.com/lucenity0" target="_blank" rel="noreferrer noopener">github.com/lucenity0</a>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M2.5 4.5h19a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 1 18V6a1.5 1.5 0 0 1 1.5-1.5Zm0 2v.45l9.5 6.2 9.5-6.2V6.5h-19Zm19 2.85-8.95 5.84a1 1 0 0 1-1.1 0L2.5 9.35V18h19V9.35Z" />
        </svg>
        <span class="muted">email</span>
        <span class="contact__values">
          <span class="contact__primary">
            <span class="muted">primary:</span>
            <a href="mailto:nafees.s2005@gmail.com">nafees.s2005@gmail.com</a>
          </span>
          <span class="contact__secondary">
            <span class="muted">secondary:</span>
            <a href="mailto:0lucenity@gmail.com">0lucenity@gmail.com</a>
          </span>
        </span>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19.54 5.01A16.4 16.4 0 0 0 15.6 3.8l-.48.98a14.8 14.8 0 0 0-6.24 0L8.4 3.8c-1.42.25-2.74.66-3.94 1.21C1.96 8.68 1.28 12.24 1.62 15.75a16.1 16.1 0 0 0 4.84 2.44l1.17-1.6c-.64-.23-1.25-.51-1.82-.84l.45-.35c3.5 1.62 7.3 1.62 10.76 0l.46.35c-.57.33-1.18.61-1.82.84l1.17 1.6a16.1 16.1 0 0 0 4.84-2.44c.4-4.07-.69-7.6-2.13-10.74ZM8.74 14.05c-1.05 0-1.91-.97-1.91-2.16s.84-2.17 1.91-2.17 1.93.98 1.91 2.17c0 1.19-.84 2.16-1.91 2.16Zm6.52 0c-1.05 0-1.91-.97-1.91-2.16s.84-2.17 1.91-2.17 1.93.98 1.91 2.17c0 1.19-.84 2.16-1.91 2.16Z" />
        </svg>
        <span class="muted">discord</span>
        <span>lucenity</span>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
        <span class="muted">instagram</span>
        <a href="https://www.instagram.com/lucenity_/" target="_blank" rel="noreferrer noopener">@lucenity_</a>
      </li>
      <li class="contact__item">
        <svg class="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M4.5 3.5A2.5 2.5 0 1 1 4.5 8a2.5 2.5 0 0 1 0-4.5ZM2.5 9.5h4v12h-4v-12Zm6.5 0h3.83v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v6.31h-4v-5.59c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.69H9v-12Z" />
        </svg>
        <span class="muted">linkedin</span>
        <a href="https://www.linkedin.com/in/nafees-s-6770712b0/" target="_blank" rel="noreferrer noopener">nafees-s-6770712b0</a>
      </li>
    </ul>
  `,o.windows.open({id:"contact",title:"contact",content:e,width:520,height:360}),o.terminal.print("opened: contact","dim")}const I=[{slug:"mlnotes",name:"ML Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://mlnotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"bdanotes",name:"BDA Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://bdanotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"schedulr",name:"Schedulr",blurb:"a scheduling app for teams and individuals",kind:"web",url:"https://srikrishna-ps.github.io/schedulr/",embeddable:!0,tags:["web","productivity","team"]},{slug:"sample-ios",name:"sample iOS app",blurb:"an app store listing — opens its landing page",kind:"ios",url:"https://www.apple.com/app-store/",embeddable:!1,tags:["ios","placeholder"]}];function _t(o){return I.find(e=>e.slug===o)}function Pe(o,e){const t=_t(e);if(!t){o.terminal.print(`no such project: ${e} — try \`projects\``,"dim");return}const n=t.embeddable?Lt(t):Ct(t),i=o.windows.open({id:`project:${t.slug}`,title:`project — ${t.name}`,content:n,width:720,height:500});i.bodyEl.style.padding="0",o.terminal.print(`opened: ${t.name}`,"dim")}function Ne(o){const e=document.createElement("div");e.className="project__bar";const t=document.createElement("span");t.className="project__dots",t.textContent="◦ ◦ ◦";const n=document.createElement("span");return n.className="project__url",n.textContent=o,e.append(t,n),e}const St=1e4;function Lt(o){const e=document.createElement("div");e.className="project",e.append(Ne(o.url));const t=document.createElement("div");t.className="project__stage";const n=document.createElement("iframe");n.className="project__frame",n.src=o.url,n.loading="lazy",n.referrerPolicy="no-referrer",n.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),n.title=o.name;const i=document.createElement("div");i.className="project__loading";const s=document.createElement("span");s.className="project__loading-label",s.textContent=`loading ${o.name}…`;const a=document.createElement("span");a.className="project__loadbar",a.append(document.createElement("i")),i.append(s,a);let c=!1;const l=()=>{c||(c=!0,window.clearTimeout(r),i.classList.add("is-done"),window.setTimeout(()=>i.remove(),400))};n.addEventListener("load",l);const r=window.setTimeout(()=>{if(c)return;c=!0,i.classList.add("is-error"),s.textContent="this is taking too long — the site may not want to be framed.",a.remove();const d=document.createElement("a");d.className="project__open",d.href=o.url,d.target="_blank",d.rel="noreferrer noopener",d.textContent="open in new tab ↗",i.append(d)},St);return t.append(n,i),e.append(t),e}function Ct(o){const e=document.createElement("div");e.className="project project--fallback",e.append(Ne(o.url));const t=document.createElement("div");t.className="project__fallback",t.innerHTML=`
    <p class="muted">this one can't be embedded (${o.kind==="ios"?"iOS / App&nbsp;Store":"the site blocks framing"}).</p>
    <p><strong>${o.name}</strong></p>
    <p class="muted">${o.blurb}</p>
  `;const n=document.createElement("a");return n.className="project__open",n.href=o.url,n.target="_blank",n.rel="noreferrer noopener",n.textContent="open in new tab ↗",t.append(n),e.append(t),e}function xt(){const o=new Set;for(const e of I)for(const t of e.tags??[])t!=="placeholder"&&o.add(t);return[...o].sort()}function Mt(o,e){const t=document.createElement("button");t.className="pgrid__card",t.type="button";const n=document.createElement("span");n.className="pgrid__thumb",n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="pgrid__initial",i.textContent=e.name.slice(0,1).toUpperCase(),n.append(i);const s=document.createElement("strong");s.className="pgrid__name",s.textContent=e.name;const a=document.createElement("span");a.className="pgrid__blurb",a.textContent=e.blurb;const c=document.createElement("span");return c.className="pgrid__meta",c.textContent=[e.kind,...(e.tags??[]).filter(l=>l!=="placeholder"&&l!==e.kind)].join(" · "),t.append(n,s,a,c),t.addEventListener("click",()=>Pe(o,e.slug)),t}function ze(o){const e=document.createElement("div");e.className="pgrid";const t=document.createElement("div");t.className="pgrid__filters";const n=document.createElement("div");n.className="pgrid__grid";const i=new Map;for(const r of I)i.set(r,Mt(o,r));let s="all";const a=[],c=r=>{s=r;for(const p of a)p.classList.toggle("is-active",p.dataset.tag===r);let d=0;for(const[p,g]of i){const v=r==="all"||(p.tags??[]).includes(r)||p.kind===r;g.hidden=!v,v&&d++}l.hidden=d>0};for(const r of["all",...xt()]){const d=document.createElement("button");d.className="pgrid__chip",d.type="button",d.dataset.tag=r,d.textContent=r,d.addEventListener("click",()=>c(r)),a.push(d),t.append(d)}const l=document.createElement("p");l.className="pgrid__empty muted",l.textContent="nothing tagged that (yet).",l.hidden=!0;for(const r of i.values())n.append(r);e.append(t,n,l),c(s),o.windows.open({id:"projects",title:"projects",content:e,width:560,height:420}),o.terminal.print(`opened: projects (${I.length})`,"dim")}const we=1.4,be=.72,Tt=2.4,At=3,Q=.75,It=1.2,Pt=.9,Nt=5,zt=4,Rt=3,$t=.8,Ot=4,Ft=4,Bt=8,X=new Set(["a","an","the","is","are","was","were","be","been","being","do","does","did","of","to","in","on","for","and","or","but","with","at","by","from","as","it","its","this","that","these","those","i","you","he","she","they","we","me","him","her","them","his","your","my","our","their","what","which","who","whom","how","when","where","why","can","could","would","should","will","shall","have","has","had","about","tell","know","any","some","into","so","u","get","got","give","us","please","hey","im"]),te=new Set(["work","use","using","make","made","build","built","run","get","got","thing","stuff","look","like","happen","involve","mean","explain","describe","show"]);function Z(o){return o.length<=3?o:o.endsWith("ies")?`${o.slice(0,-3)}y`:o.endsWith("ing")&&o.length>5?o.slice(0,-3):o.endsWith("ed")&&o.length>4?o.slice(0,-2):o.endsWith("s")&&!o.endsWith("ss")?o.slice(0,-1):o}function $(o){return o.toLowerCase().split(/[^a-z0-9+#.]+/).map(e=>e.replace(/^[.]+|[.]+$/g,"")).filter(e=>e.length>1&&!X.has(e)).map(Z).filter(e=>!X.has(e))}const ne=o=>[...new Set(o)];function B(o){return o.toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim()}const N=o=>` ${o} `;function jt(o,e,t){if(Math.abs(o.length-e.length)>t)return t+1;let n=null,i=Array.from({length:e.length+1},(s,a)=>a);for(let s=1;s<=o.length;s++){const a=[s];let c=s;for(let l=1;l<=e.length;l++){const r=o[s-1]===e[l-1]?0:1;let d=Math.min(i[l]+1,a[l-1]+1,i[l-1]+r);n&&s>1&&l>1&&o[s-1]===e[l-2]&&o[s-2]===e[l-1]&&(d=Math.min(d,n[l-2]+1)),a.push(d),d<c&&(c=d)}if(c>t)return t+1;n=i,i=a}return i[e.length]}const Gt=new Set(["about","work","works","fun","intro","bio","apps"]);function Ht(o){return o.includes(" ")?!0:o.length>=5&&!Gt.has(o)&&!X.has(o)}function Ut(o,e){const t=N(o),n=e.aliases[0];if(n&&t.includes(N(n))||t.includes(N(e.label)))return!0;for(const i of e.namePhrases)if(i.includes(" ")&&t.includes(N(i)))return!0;return!1}const Re="",Dt=/\b(?:[A-Za-z]\.){2,}|\b(?:prof|dr|mr|mrs|ms|sr|jr|st|vs|etc|fig|no|ph|approx|e\.g|i\.e|a\.m|p\.m)\.|\b[A-Z]\.(?=\s+[A-Z0-9])/gi,Wt=o=>o.replace(Dt,e=>e.replace(/\./g,Re)),qt=o=>o.replace(new RegExp(Re,"g"),".");function Vt(o){const e=[];for(const t of o.split(/\n{2,}/)){const n=Wt(t.replace(/\s*\n\s*/g," ").trim());if(n)for(const i of n.split(/(?<=[.!?])\s+(?=[A-Z0-9("'*])/)){const s=qt(i).trim();s&&e.push({text:s,terms:new Set($(s))})}}return e}function Yt(o){const e=o[0]??"topic";return e.includes(" ")?o.filter(n=>!n.includes(" ")&&n.length>=3&&!X.has(n)).sort((n,i)=>n.length-i.length)[0]??e:e}function Kt(o){const e=[];let t=!1;for(const n of o.split(`
`)){if(t)if(n.trim()===""||/^#{1,3}\s/.test(n))t=!1;else continue;if(/^\s*todo\b/i.test(n)){t=!0;continue}e.push(n)}return e.join(`
`)}function Jt(o){const t=Kt(o.replace(/\r\n?/g,`
`).replace(/<!--[\s\S]*?-->/g,"")).split(`
`),n=[];let i="",s=[];const a=()=>{i&&s.join("").trim()&&n.push({heading:i,body:s})};for(const c of t){const l=/^#{1,3}\s+(.*)$/.exec(c);l?(a(),i=l[1].trim(),s=[]):i&&s.push(c)}return a(),n.map(({heading:c,body:l})=>{const r=c.split(/\s*[/|]\s*/),d=new Set(r.filter(h=>/!\s*$/.test(h)).flatMap(h=>$(B(h)))),p=ne(r.map(h=>B(h)).filter(Boolean)),g=Vt(kt(l.join(`
`)).trim()),v=new Map;let b=0;for(const h of g)for(const m of $(h.text))v.set(m,(v.get(m)??0)+1),b++;return{label:Yt(p),aliases:p,namePhrases:p.filter(Ht).filter(h=>h.includes(" ")||!d.has(Z(h))),aliasTokens:new Set(p.flatMap(h=>$(h))),priorityTokens:d,nameTokens:new Set($(p[0]??"")),sentences:g,tf:v,length:b}})}const Qt=/^(tell me more|more|more please|go on|continue|keep going|say more|elaborate|expand|and\??|and then\??|what else\??|anything else\??|\.\.\.|…)$/,Xt=/^(yes|yeah|yep|yup|ya|sure|ok|okay|okie|mhm|please|pls|go ahead|do it|hit me|why not)$/,Zt=/\b(it|its|it's|that|this|they|them|those|these|the (app|project|tool|thing|system|paper|model|one|setup))\b/,en=/^(does|do|did|is|are|was|were|has|have|had|can|could|will|would)\b/,tn=/\b(which|what|who|list|all|any|anything|every|everything|how many|uses?d?|using|built with|written in|made with|know[sn]?|familiar)\b/,nn=new Set(["first","second","third","one","two","three","last","latter","former","next","other","previous","previou"]),sn=["team","guid","develop","coordinator"],on=/\b(project|app|apps|tool|paper|research|thing|one|work)\b/;class an{chunks;idf=new Map;df=new Map;avgdl;allAliasTokens=new Set;vocab=[];topic=null;pending=null;offeredMore=!1;constructor(e){this.chunks=Jt(e);const t=this.chunks.length||1;let n=0;for(const i of this.chunks){n+=i.length;for(const s of new Set([...i.tf.keys(),...i.aliasTokens]))this.df.set(s,(this.df.get(s)??0)+1);for(const s of i.aliasTokens)this.allAliasTokens.add(s)}for(const[i,s]of this.df)this.idf.set(i,Math.log(1+(t-s+.5)/(s+.5)));this.avgdl=n/t;for(const[i,s]of this.idf)i.length>=4&&s>=.5&&this.vocab.push({token:i,idf:s})}async ask(e,t){const n=e.trim(),i=n.toLowerCase(),s=i.replace(/[!.?]+$/,"").trim(),a=rn(i);if(a)return{text:a,grounded:!0};if(this.pending){const u=this.resolveClarify(s);if(this.pending=null,u!=null)return this.answerFrom(this.chunks[u],u,[])}const c=this.offeredMore;this.offeredMore=!1;const l=ne($(n));if((Qt.test(s)||c&&Xt.test(s)||l.length===0)&&this.topic)return this.continueTopic();if(l.length===0)return this.reprompt();if(this.topic&&l.every(u=>nn.has(u)))return this.continueTopic();const d=[],p=l.map(u=>{if(this.idf.has(u))return u;const E=this.correct(u);return E&&d.push(`reading "${u}" as "${E}"`),E??u}),g=B(n),v=this.tryCompound(n);if(v)return this.decorate(v,d);const b=this.rank(p,g),h=b[0],m=h!=null&&(h.phraseHit||h.bestIdf>=Q||h.matched>=2&&h.idfSum>=It),f=p.some(u=>!te.has(u)&&(this.idf.get(u)??0)>=Q&&this.chunks.some(E=>E.nameTokens.has(u)))||this.chunks.some(u=>Ut(g,u)),k=/\bwho\b/.test(i)?sn:[];if(tn.test(i)){const u=this.tryAggregate(i,p);if(u)return this.decorate(u,d)}if(this.topic&&Zt.test(i)&&!f){const u=this.topic;return this.decorate(this.answerFrom(this.chunks[u.index],u.index,p,k),d)}if(m&&!h.phraseHit&&!f){const u=b[1];if(u&&u.index!==h.index&&u.score>=h.score*$t&&u.matched>0&&on.test(i))return this.pending={options:[{index:h.index,label:h.chunk.label},{index:u.index,label:u.chunk.label}]},{text:`that could mean ${h.chunk.label} or ${u.chunk.label} — which one?`,grounded:!0}}if(m){const u=this.decorate(this.answerFrom(h.chunk,h.index,p,k),d),E=h.priorityTerm;if(E&&!f){const C=b.find(_=>_.index!==h.index&&(_.chunk.aliasTokens.has(E)||(_.chunk.tf.get(E)??0)>0));if(C){const _=i.split(/[^a-z0-9+#.]+/).filter(S=>S.length>1).find(S=>Z(S.replace(/^[.]+|[.]+$/g,""))===E)??E;u.text+=`

(${_} also comes up in ${C.chunk.label} — ask about ${C.chunk.label} if that's what you meant.)`}}return u}return en.test(s)?{text:`hmm, nothing in my notes about that, so i can't confirm either way. i can talk about: ${this.topicList()}.`,grounded:!1}:this.fallback()}rank(e,t){return this.chunks.map((n,i)=>this.scoreChunk(n,i,e,t)).sort((n,i)=>i.score-n.score)}scoreChunk(e,t,n,i){let s=0,a=0,c=0,l=0,r=null;for(const p of n){const g=this.idf.get(p)??0,v=e.tf.get(p)??0,b=v===0?0:v*(we+1)/(v+we*(1-be+be*(e.length/this.avgdl))),h=g*b,m=e.aliasTokens.has(p)?g*Tt:0,f=e.priorityTokens.has(p)?Ot:0;f>0&&(r=p),(h>0||m>0)&&(a++,l+=g,g>c&&(c=g)),s+=h+m+f}let d=!1;for(const p of e.namePhrases)N(i).includes(N(p))&&(s+=At,d=!0);return{chunk:e,index:t,score:s,matched:a,bestIdf:c,idfSum:l,phraseHit:d,priorityTerm:r}}correct(e){if(e.length<5)return null;const t=e.length>=7?2:1;let n=null;for(const i of this.vocab){if(i.token[0]!==e[0])continue;const s=jt(e,i.token,t);s>t||(!n||s<n.dist||s===n.dist&&i.idf>n.idf)&&(n={token:i.token,dist:s,idf:i.idf})}return n?.token??null}tryCompound(e){const t=e.split(/\s*(?:\band\b|\bvs\.?\b|\bversus\b|[;,&])\s*/i).map(c=>c.trim()).filter(c=>c.length>=3);if(t.length<2||t.length>3)return null;const n=[];for(const c of t){const l=ne($(c)).map(d=>this.idf.has(d)?d:this.correct(d)??d);if(l.length===0)return null;const r=this.rank(l,B(c))[0];if(!r||!(r.phraseHit||r.bestIdf>=Q))return null;n.push({part:c,r,terms:l})}if(new Set(n.map(c=>c.r.index)).size<2)return null;const s=[],a=[];for(const c of n){const l=this.answerFrom(c.r.chunk,c.r.index,c.terms);s.push(`${c.r.chunk.label}: ${l.text}`),a.push(c.r.chunk.label)}return this.offeredMore=!1,{text:s.join(`

`).replace(/ — say "more" for the rest\./g,""),grounded:!0,sources:a}}tryAggregate(e,t){let n=null;for(const c of t){const l=this.df.get(c)??0,r=this.idf.get(c)??0;l>=2&&l<=Bt&&r>=Q&&!this.allAliasTokens.has(c)&&!te.has(c)&&(!n||r>n.idf)&&(n={term:c,idf:r})}if(!n)return null;const i=e.split(/[^a-z0-9+#.]+/).filter(c=>c.length>1).find(c=>Z(c.replace(/^[.]+|[.]+$/g,""))===n.term)??n.term,s=this.chunks.map((c,l)=>({chunk:c,index:l,tf:c.tf.get(n.term)??0})).filter(c=>c.tf>0).sort((c,l)=>l.tf-c.tf).slice(0,Ft);if(s.length<2)return null;const a=s.map(c=>{const l=this.extract(c.chunk,[n.term]).slice(0,1),r=l.length>0?c.chunk.sentences[l[0]].text:"";return`${c.chunk.label}: ${r}`});return this.topic=null,{text:`${i} shows up in ${s.length} of my notes —

${a.join(`

`)}`,grounded:!0,sources:s.map(c=>c.chunk.label)}}resolveClarify(e){const t=this.pending.options,n=N(B(e));for(const i of t)if(n.includes(N(B(i.label))))return i.index;return/\b(first|former|1st|1)\b/.test(e)?t[0].index:/\b(second|latter|2nd|2)\b/.test(e)?t[1]?.index??null:/\b(both|either|all)\b/.test(e)?t[0].index:null}decorate(e,t){return t.length===0||!e.grounded?e:{...e,text:`(${t.join(", ")}) ${e.text}`}}answerFrom(e,t,n,i=[]){const s=[...n.filter(r=>!e.nameTokens.has(r)&&!te.has(r)&&(this.idf.get(r)??0)>=Pt),...i];if(s.length>0){const r=this.extract(e,s);if(r.length>0)return this.topic={index:t,shown:new Set(r)},{text:r.map(d=>e.sentences[d].text).join(" "),grounded:!0,sources:[e.label]}}const a=e.sentences.slice(0,Nt),c=new Set(a.map((r,d)=>d));this.topic={index:t,shown:c};let l=a.map(r=>r.text).join(" ");return e.sentences.length>a.length&&(l+=' — say "more" for the rest.',this.offeredMore=!0),{text:l,grounded:!0,sources:[e.label]}}extract(e,t){const i=e.sentences.map((s,a)=>{let c=0;for(const l of t)s.terms.has(l)&&(c+=this.idf.get(l)??.5);return{i:a,sc:c}}).filter(s=>s.sc>0).sort((s,a)=>a.sc-s.sc).slice(0,Rt).sort((s,a)=>s.i-a.i).map(s=>s.i);if(i.length===1){const s=i[0],a=e.sentences[s+1];a&&e.sentences[s].text.length+a.text.length<380&&/^(it|its|this|that|the |so |which |and )/i.test(a.text)&&i.push(s+1)}return i}continueTopic(){const e=this.topic,t=this.chunks[e.index],n=[];for(let a=0;a<t.sentences.length;a++)e.shown.has(a)||n.push(a);if(n.length===0)return{text:`that's everything in my notes on ${t.label}. ask me something specific — its stack, how it works, who's involved.`,grounded:!0,sources:[t.label]};const i=n.slice(0,zt);i.forEach(a=>e.shown.add(a));let s=i.map(a=>t.sentences[a].text).join(" ");return e.shown.size<t.sentences.length&&(s+=" — more?",this.offeredMore=!0),{text:s,grounded:!0,sources:[t.label]}}reprompt(){return{text:`ask me something about nafees — try: ${this.topicList()}.`,grounded:!1}}fallback(){return{text:`hmm, that's not in my notes. i can talk about: ${this.topicList()}.`,grounded:!1}}topicList(){return this.chunks.slice(0,8).map(e=>e.label).join(", ")}}function rn(o){const e=o.replace(/[!.?]+$/,"").trim();return/^(hi|hey|hello|yo|sup|howdy|hiya|heya|hii+|hey there|good (morning|evening|afternoon))\b/.test(e)?`hey! i'm liffy — nafees's terminal sidekick. ask me anything about him. try: "what does he build?"`:/^(thanks|thank you|thx|ty|tysm|appreciate it|cheers|nice|cool|awesome|great)\b/.test(e)?"anytime :)":/^(wow+|woah|whoa|nice+|cool+|lol|lmao|haha+|hehe+|damn|based)\b/.test(e)?"right? ask me more.":/^(bye|cya|goodbye|see ya|see you|later|gtg|good night|gn)\b/.test(e)?"catch you later! (close the window whenever)":/\b(how are you|how's it going|hows it going|you good|wyd)\b/.test(e)?"just vibing in the terminal, waiting for questions about nafees. what do you want to know?":/(are|r) you (a )?(bot|ai|robot|real|human|person|chatgpt|claude)/.test(e)?"i'm a lil retrieval bot — no LLM, no keys. i only know what's in nafees's notes, and i answer straight from them.":/\byour (favorite|favourite|fav|opinion|thoughts?)\b/.test(e)?"i deal in facts from nafees's notes, not opinions. though between us — the cat is objectively the best part of this site.":/\b(tell|know|got|have).*(joke|something funny)\b|^joke$/.test(e)?"a chatbot with no LLM walks into a bar. that's it. that's me. i'm the joke. ask me about nafees instead.":/(who|what) are you|your name|are you liffy(?!\s*(review|the))/.test(e)?"i'm liffy, a tiny assistant that knows nafees. ask away — projects, skills, research, contact, whatever.":/^(help|what can you do|commands|options|menu|\?)$/.test(e)?'i answer questions about nafees from his notes. try: "what does he build?", "tell me about askcal", "which projects use fastapi?", or just a topic name.':/(who (made|built|created) you)/.test(e)?"nafees built me for this site — a grounded retriever over his own notes. ask me about him next.":null}const ln=`# Liffy's notes on Nafees

<!--
  This is Liffy's brain. Each \`##\` heading is a retrievable chunk; when
  someone asks a question, Liffy finds the best-matching chunk and reads
  it back (v2 engine: BM25 ranking + typo correction + compound-question
  splitting + cross-chunk aggregation + a real "did you mean A or B?"
  clarify loop + follow-up memory). Tips for editing this file:

    - Put likely question keywords in the HEADINGS (they're weighted
      heavily over body text). Separate aliases with " / ". The FIRST
      alias is the topic's "name" — keep it a tidy single word where
      possible; it becomes the chunk's label. IMPORTANT: the fallback
      "ask me about..." menu only ever lists the FIRST 8 SECTIONS IN
      FILE ORDER, regardless of what's relevant to the question — so
      keep the 8 most broadly useful sections (identity, pitch, skills,
      projects, experience, education, contact, one flagship project)
      at the very top of this file.
    - End an alias with "!" (e.g. "email!") to make this section the
      DEFAULT answer for that word when it's genuinely ambiguous across
      sections — "whats his gmail?" should mean contact info, not
      askcal's Gmail integration. The reply still points at the other
      context instead of hiding it. Use "!" sparingly, only for real
      conflicts.
    - NEVER reuse a keyword across two headings' aliases — including
      indirectly through a multi-word alias. "work history" and a bare
      "work" alias fight each other exactly as much as repeating "work"
      outright, because both reduce to the same word once stopwords
      (a/the/his/etc.) drop out. Before adding an alias, mentally strip
      stopwords and check the words left over aren't already claimed by
      another heading.
    - Body words are findable WITHOUT being aliases — the engine scans
      every chunk's body too, and answers cross-chunk questions like
      "which projects use fastapi?" by finding a term that lives in
      several bodies but isn't anyone's alias. So don't over-stuff
      headings with tech names; mentioning a stack in prose is usually
      enough — and keeping tech terms OUT of headings is exactly what
      lets that cross-chunk trick work at all. Alias a term and it drops
      out of that pool.
    - The engine splits "askcal and tiket?" into two answers, and asks
      "did you mean A or B?" on genuine ties, so don't panic about minor
      overlap between closely-related sections (e.g. "app" meaning
      either one specific project or the project list) — the clarify
      loop catches real ambiguity on its own. Save manual fixes for
      overlaps that would silently misroute somewhere unhelpful.
    - Keep sections conversational — they're spoken back verbatim, lead
      sentences first (opening ~5), the rest held behind "more".
    - Small talk, "who are you" / "who made you", and the "that's not in
      my notes" fallback line are hardcoded in retrieval.ts, NOT here —
      if those need new wording, that's a code change; this file can't
      reach them.
  Liffy only answers from this file, and never invents facts that
  aren't written down below — anything not here gets a graceful
  fallback instead.
-->

## who is nafees / who are you / about / bio / introduction / intro

I'm Nafees S, online as **lucenity0**. Third-year Computer Science & Engineering
student at B.M.S. College of Engineering (BMSCE) in Bengaluru, graduating in 2027.
I split my time between full-stack development, applied ML research, and freelance
design work under my own brand, Lucenity. Mostly I build things I actually want to
use, then spend way too long on the details. If you're sizing me up for a role,
ask me why you should hire me — I've got a real pitch, not just a bio.

## hire / hiring / why hire / hire him / why hire him / why should we hire him / why should you hire him / why should i hire him / should we hire him / should i hire him / why choose him / worth hiring / strengths / pitch / value proposition / good fit / qualifications / candidate / stand out / availability

Short version: I ship, not just study. Four solo-built products with real,
working stacks — Liffy, Askcal, Tiket, and Schedulr — done alongside a full CS
course load, not class assignments gathering dust in a repo. Tiket's seat
booking survived a load test at 12,441 concurrent requests with zero double
bookings, which is a concurrency problem most undergrads never touch. Askcal
ships JWT auth, live Gmail and Calendar integration, and 79 backend tests
passing — a real product, not a demo. I move across the whole stack instead of
staying in one lane: mobile (SwiftUI), backend (FastAPI, PostgreSQL, Celery),
ML research (CLIP, PPO, LangChain), and design (freelance client work under my
own brand, Lucenity).

Two research threads are active alongside all that — a CLIP-based hateful-meme
detector headed for IEEE resubmission, and a PPO agent for adaptive traffic
signal control — so it's not just shipping speed, there's research depth
behind it too. I've also led logistics for BMSCE's Phase Shift tech fest and
managed the design team for Utsav, so team and event coordination aren't new
either. None of this covers a specific start date, compensation range, or
relocation preference — that's a direct conversation, so just reach out. Ask
me about any project by name for the specifics, or ask for contact details.

## skills / tech stack / technologies / languages / programming / what do you know / stack

Languages: Python, Java, C, JavaScript, TypeScript, Swift, SQL.
Frameworks & databases: FastAPI, React, Tailwind CSS, SwiftUI, PostgreSQL,
SQLAlchemy, Alembic, Redis, Celery, Vite.
AI/ML: LLMs, prompt engineering, Gemini API, reinforcement learning (PPO), deep
learning, NLP, multimodal fusion, CLIP, LangChain, ChromaDB.
Tools: Git/GitHub, Docker, AWS EC2, Xcode, Figma, Jupyter Notebook, VS Code.

## projects / work / portfolio / what has he built / what do you build / apps / what has nafees made / list

The big ones: **Liffy** (this — an AI code review tool), **Askcal** (an AI daily
scheduler), **Tiket** (a ticket booking system), and **Schedulr** (an OS concepts
simulator). Ask about any of them by name and I'll go deeper — or ask why you
should hire me for the highlight reel across all four.

## experience / jobs / internships / career / roles

Graphic Designer at Clearly Blue Pvt Ltd — still affiliated with them on a
freelance basis. Beyond that, most of the hands-on experience comes from
research (the hateful-meme and traffic-signal projects), freelance design work
under Lucenity, and shipping full products solo (Liffy, Askcal, Tiket,
Schedulr). Currently prepping for placements and research program applications.

## education / study / college / university / school / degree / cgpa / gpa / graduate / graduation

B.E. in Computer Science & Engineering at B.M.S. College of Engineering
(BMSCE), Bengaluru — CGPA 8.21, expected June 2027. Before that, Narayana PU
College, 12th, Karnataka State Board, 94.33%, May 2023.

## contact / reach / email! / gmail! / socials / github / linkedin / instagram / discord / get in touch / reach out / resume / cv

Best way in is GitHub — [github.com/lucenity0](https://github.com/lucenity0).
Email: nafees.s2005@gmail.com (secondary: 0lucenity@gmail.com).
Discord: lucenity. Instagram: @lucenity_.
LinkedIn: https://www.linkedin.com/in/nafees-s-6770712b0/
No separate resume or CV link lives in these notes — email him directly and
he'll send one over.

## askcal / ask cal / pulse / scheduler / calendar app / inbox / email assistant / regret score

Askcal (renamed from Pulse) is a context-aware daily scheduler that ranks your
inbox by *regret*, not urgency — built for the student freelancer juggling
classes, client work, and job hunting at once. Gemini reads incoming email
with structured output, a deterministic formula turns that into a 0–100
regret score, and actionable mail (a due invoice, an OA link, a client brief)
auto-converts into a task while newsletters just stay newsletters — no manual
triage. Tasks then slot themselves around your real Google Calendar busy
blocks; pin one to an exact time and everything else routes around it. Work
lives in weighted Tracks — Uni, Career, Design, Finance, Feed — plus daily
Routines that reset at midnight and an evening Review that carries unfinished
work into tomorrow instead of guilt-tripping about it. Design is deliberately
strict off-white/black, no gradients, no mascot.

Stack: SwiftUI iOS app (monochrome, \`@Observable\` state) talking JWT-auth'd
to \`askcal-api\` — FastAPI, Python 3.13, async SQLAlchemy 2.0/asyncpg, Alembic,
PostgreSQL 16 — which in turn talks to Gmail, Calendar, and Gemini. Auth is
Google OAuth 2.0 down to a short-lived 15-minute JWT plus DB-backed opaque
refresh tokens. 79 backend tests passing, covering the regret formula,
scheduler, classifier, and auth. The iOS app has Today, Inbox, Calendar
(interactive, per-date drill-down), Routine, Tracks, Review, and More views.

Currently: auth, Gmail ingestion, classification, regret scoring, and
auto-scheduling are all live and tested. The landing page (\`askcal-landing\`,
Three.js + GSAP) still shows an earlier coffee-themed concept from before the
product pivoted to this monochrome look — rebuild's queued. Web dashboard and
adaptive scheduling (chronotype, weight nudging) aren't built yet on purpose.
Pre-open-source hardening — refresh-token encryption at rest, PKCE on the
OAuth flow, CI, a LICENSE — is the current blocker before it's safe to
self-host publicly.

## liffy / what is liffy / this project / this tool / code review

You're looking at it. Liffy is an open-source, self-hosted AI-powered code review
tool (\`lucenity0/Liffy\`). Built on FastAPI, React/TypeScript, PostgreSQL, Redis,
Celery, ChromaDB, and LangChain, with GitHub OAuth for repo access — and you bring
your own LLM API key instead of routing through a hosted service. Setup included
one-command install scripts for both macOS and Windows, and Vertex AI integration
for Claude model access with prompt caching.

## tiket / ticket / ticket booking / booking system / seats / concurrency

Tiket is a full-stack ticket booking system — SwiftUI, FastAPI, PostgreSQL, AWS
EC2, JWT. The interesting bit is concurrency-safe seat allocation using
PostgreSQL \`SELECT FOR UPDATE\`; it's been load tested at 12,441 concurrent
requests with zero double bookings. The SwiftUI frontend does real-time seat
selection and dynamic barcode generation.

## schedulr / os simulator / operating systems / scheduling algorithms / gantt chart / synchronization / page replacement / disk scheduling

Schedulr is an interactive web app for visualizing core OS concepts —
CPU scheduling, system calls, process synchronization, page replacement, and
disk scheduling — all running client-side with real-time visual feedback.
Co-developed with SriKrishna Pejathaya P S. Modules include Gantt charts and
process metrics for CPU scheduling, a system call visualizer with process
tree simulation, the classic synchronization problems (Producer-Consumer,
Readers-Writers, Dining Philosophers), page replacement algorithms (FIFO,
LRU, LFU, Optimal), and disk scheduling visualizations (FCFS, SSTF, SCAN,
C-SCAN). Minimal, modern, accessible UI, fully responsive across desktop,
tablet, and mobile. It's genuinely used by junior students at BMSCE, not just
a class demo.

Tech: React (TypeScript), Vite, Tailwind CSS, shadcn-ui. Recently added
preemptive scheduling support, a friendlier mobile view, and Skip-to-Result /
Previous-Step buttons on the page replacement and disk scheduling modules.
On the roadmap: real-time scheduling algorithms (Rate Monotonic, EDF),
multi-process scheduling, and memory allocation visualizations (First Fit,
Best Fit, Worst Fit).

## research / machine learning / ml research / papers / publications / academic work

Two research threads right now: a multimodal hateful-meme detection paper
(cross-modal attention, currently in IEEE resubmission) and a reinforcement
learning project on adaptive traffic signal control. Ask about either by name.

## memes / hateful meme detection / meme paper / multimodal / cross modal attention / clip / dynamic gating / ieee paper

Research on multimodal hateful meme detection using CLIP ViT-L/14 with a dynamic
gating mechanism. The framework combines a CrossModalAttention module, a
DynamicGatingNetwork, and a FocalLoss objective. It's being prepared for IEEE
resubmission, addressing gaps from the first round: single-dataset evaluation,
missing SOTA comparisons, overfitting, and bibliography issues. Training ran on
an NVIDIA RTX A5000, running the static and dynamic model variants side by side.
Team: S Gajalakshmi, S Nagashree, Saanvi S, Sachit P Naidu, guided by Prof.
Rekha G S.

## ppo / traffic signal / reinforcement learning / rl / sumo / traci / self driving / autonomous

Interpretable PPO-based adaptive traffic signal control — Python, SUMO, TraCI.
A PPO agent trained with curriculum learning across increasing traffic
complexity, paired with attention-based feature attribution to open up the
black-box problem in AI-driven infrastructure. Includes a real-time
bidirectional SUMO–TraCI communication loop (IoT-style feedback), with
constrained emergency preemption and priority queuing.

## leadership / fest / event / phase shift / utsav / coordinator / campus / extracurricular

Senior Coordinator for Phase Shift 2025 at BMSCE (2024–2025), co-leading
logistics for the college's annual technical fest. Before that, Junior
Coordinator for Utsav 2025, managing the design team and on-ground event
operations.

## freelance / design / lucenity brand / clients / lucenity.dev

Runs freelance/client design work under the Lucenity brand (lucenity.dev),
mostly using prompt engineering with AI design tools as the working method.
Brand identity itself is Cormorant Garamond wordmark, a warm ink/off-white/
starlight-gold palette, and a star-chart crosshair emblem, built to hold up
across any application background.

## how he works / workflow / build process / dev habits / approach

Prefers phased development with git checkpoints at each phase boundary,
verifying state directly before resuming a coding session rather than trusting
memory of where things were left. Likes confirmation before big architectural
changes, and tends to experiment first, then formalize understanding once
something's proven out.

## this site / website / how was this site made / terminal os / lucenityos / this portfolio

The site you're standing in is a terminal-style portfolio Nafees built from
scratch — vanilla TypeScript + Vite, no frameworks, no trackers. You type
commands, retro windows power on with a CRT flicker, and everything stays
monochrome pixels and scanlines. The windows drag, resize, minimize into a
little corner folder, and maximize; the boot sequence is honest BIOS theatre.
Even I live inside it — a retrieval bot with no LLM, reading straight from
Nafees's notes. There are also a few commands the help menu won't admit to;
the sleeping cat murmurs hints about them if you leave it alone long enough.
It's live at me.lucenity.dev.

## location / living / house / address / lives where / where does he live / visit / wherabouts / meet him / meeting

Nafees's location is private.. rather i don't know his whereabouts too. For now, he resides as me in this pixel world !

## age / how old / birthday / born / birthdate

His notes don't say — he keeps numbers like that off the record. All I can
tell you is he's a third-year CSE student graduating in 2027; you can do the
math from there if you really must.

## hobbies / interests / fun / outside of work / art / artist

Outside of code, I'm an artist — mostly digital art, with the occasional dip
into traditional media too. It's the other half of the "design-first" thing
that shows up in Lucenity's work.

## music / piano / singing / soprano / ariana grande / favorite artist / favorite singer

Music's a big one for me. I play piano, and I sing soprano. And yeah — I'm a
huge Ariana Grande fan, probably her biggest defender in any room I'm in. Her
range, the whistle notes, the way she layers harmonies on her own vocals — it's
just some of the best pop vocal work out there. If you catch me humming
something between builds, there's a very good chance it's off *Eternal
Sunshine* or *Positions*. (And if you ask nicely, I might just admit to
practicing a few of her songs myself...)

## games / gaming / nintendo / console / video games / fire emblem / what are you playing

Big Nintendo and console gamer. If you ask what I'm currently playing, it's
probably Fire Emblem Heroes — I'm prolly playing it right now, honestly.

## the cat

There's a cat that naps through the whole site. It is always asleep. =^..^=
It kept the seat warm during the "under construction" era and refuses to leave.
`;let cn=null;const dn=()=>cn??=new an(ln),hn=`hey, i'm liffy — nafees's lil terminal sidekick. ask me anything about him. try: "what does he build?"`,un=/^me+o+w+[\s.!?~]*$/i,ve=/\b(cookie|treat)\b/i,ke="purrrr. (translation: thanks for the treat! i like you.)",Ee="meow. mrrp. purrrr. (translation: hi. i like you. bring snacks.)",mn=/\b(pet|stroke|scratch)\b/i,pn=/\b(stare|look|watch)\b/i,_e="stare. stare. stare. (translation: i see you.)",Se="purrrr. (translation: thanks for the pets!)";function $e(o){const e=dn(),t=[];let n=!1;const i=document.createElement("div");i.className="liffy";const s=document.createElement("div");s.className="liffy__log u-fade-top",s.setAttribute("role","log"),s.setAttribute("aria-live","polite");const a=document.createElement("form");a.className="liffy__inputrow";const c=document.createElement("span");c.className="liffy__prompt",c.textContent="you>";const l=document.createElement("input");l.className="liffy__input",l.type="text",l.setAttribute("aria-label","ask liffy"),l.autocomplete="off",l.autocapitalize="off",l.spellcheck=!1,l.setAttribute("autocorrect","off"),l.setAttribute("enterkeyhint","go"),a.append(c,l),i.append(s,a),s.addEventListener("click",()=>{(window.getSelection()?.toString()??"")===""&&l.focus()});const r=()=>{s.scrollTop=s.scrollHeight},d=(f,k)=>{const u=document.createElement("div");u.className="liffy__line";const E=document.createElement("span");E.className=`liffy__who ${k}`,E.textContent=f;const C=document.createElement("span");return C.className="liffy__text",u.append(E,C),s.append(u),r(),C},p=async f=>{const k=d("liffy>","liffy__who--bot");if(T())k.textContent=f;else{const u=f.length>320?4:f.length>160?6:9;await ie(k,f,{speed:u})}r()},g=["thinking","pondering","purring","consulting the cat","rummaging through notes","recalling"];let v=0;const b=async f=>{if(n)return;if(n=!0,l.disabled=!0,d("you>","liffy__who--user").textContent=f,t.push({role:"user",text:f}),un.test(f)){const S=d("","liffy__who--bot");S.classList.add("liffy__thinking"),S.textContent="✳ thought for 0.0s (instinct)",t.push({role:"liffy",text:Ee}),m.hop(),await p(Ee),n=!1,l.disabled=!1,l.focus();return}if(ve.test(f)){const S=d("","liffy__who--bot");S.classList.add("liffy__thinking"),S.textContent="✳ thought for 0.0s (instinct)",t.push({role:"liffy",text:ke}),m.hop(),await p(ke),n=!1,l.disabled=!1,l.focus();return}if(pn.test(f)){const S=d("","liffy__who--bot");S.classList.add("liffy__thinking"),S.textContent="✳ thought for 0.0s (instinct)",t.push({role:"liffy",text:_e}),m.hop(),await p(_e),n=!1,l.disabled=!1,l.focus();return}if(mn.test(f)){const S=d("","liffy__who--bot");S.classList.add("liffy__thinking"),S.textContent="✳ thought for 0.0s (instinct)",t.push({role:"liffy",text:Se}),m.hop(),await p(Se),n=!1,l.disabled=!1,l.focus();return}const k=d("","liffy__who--bot");k.classList.add("liffy__thinking");const u=Le(k,g[v++%g.length]);m.think(!0),T()||await z(650+Math.random()*750);const E=await e.ask(f,t),C=u.stop();m.think(!1);const _=E.sources?.length?` · read notes: ${E.sources.join(", ")}`:"";k.textContent=`✳ thought for ${Math.max(C,.1).toFixed(1)}s${_}`,t.push({role:"liffy",text:E.text}),m.bob(!0),await p(E.text),m.bob(!1),n=!1,l.disabled=!1,l.focus()};a.addEventListener("submit",f=>{f.preventDefault();const k=l.value.trim();!k||n||(l.value="",m.onSend(),b(k))});const h=o.windows.open({id:"liffy",title:"liffy — ask about nafees",content:i,width:520,height:420});h.bodyEl.style.padding="0";const m=new Me({mount:i,mode:"liffy",idleFrame:"awake"});l.addEventListener("input",()=>{const f=l.value;ve.test(f)?m.fillNow():m.onTyping(f.length)}),p(hn),l.focus(),o.terminal.print("opened: liffy","dim")}const fn=`# Nafees S — résumé

\`lucenity0\` · web & iOS developer
nafees.s2005@gmail.com · +91-99728 47009 · [nafees-s](#) · [lucenity0](https://github.com/lucenity0)

## Education

**B.M.S. College of Engineering** — B.E. in Computer Science & Engineering
CGPA: 8.21 · Expected June 2027

**Narayana PU College** — 12th, Karnataka State Board
94.33% · May 2023

## Technical Skills

- **Languages:** Python, Java, C, JavaScript, TypeScript, Swift, SQL
- **Frameworks & Databases:** FastAPI, React, Tailwind CSS, SwiftUI, PostgreSQL, SQLAlchemy, Alembic, Redis, Celery, Vite
- **AI / ML:** LLMs, Prompt Engineering, Gemini API, Reinforcement Learning (PPO), Deep Learning, NLP, Multimodal Fusion, CLIP, LangChain, ChromaDB
- **Tools:** Git/GitHub, Docker, AWS EC2, Xcode, Figma, Jupyter Notebook, VS Code
- **Coursework:** Machine Learning, Linear Algebra, Probability & Statistics, Data Structures & Algorithms

## Projects & Research

### Askcal — AI-Powered Daily Scheduler
\`FastAPI, Gemini, PostgreSQL, SwiftUI, Google OAuth\` · Source Code

- Built a regret-ranked inbox classifier using Gemini structured output — extracts signals from Gmail and computes a deterministic 0–100 regret score per email, auto-converting actionable mail into tasks slotted around real Google Calendar events
- Shipped full monochrome iOS app (SwiftUI) with Today, Inbox, Calendar, Routines, and Review views; 79 backend tests passing; async SQLAlchemy + JWT auth with opaque refresh token rotation

### Interpretable PPO-Based Adaptive Traffic Signal Control
\`Python, SUMO, TraCI, RL\` · Source Code

- Implemented a PPO agent with curriculum learning on increasing traffic complexity; integrated attention-based feature attribution to address the black-box challenge in AI-driven infrastructure
- Engineered real-time bidirectional SUMO–TraCI communication (IoT-style feedback loop) with constrained emergency preemption and priority queuing

### Tiket — Full-Stack Ticket Booking System
\`SwiftUI, FastAPI, PostgreSQL, AWS EC2, JWT\` · Source Code

- Designed and deployed a full-stack ticket booking system with concurrency-safe seat allocation (PostgreSQL \`SELECT FOR UPDATE\`), JWT auth, and AWS EC2 deployment — load tested at 12,441 concurrent requests with zero double bookings
- Built production-grade iOS frontend in SwiftUI with real-time seat selection and dynamic barcode generation

### Schedulr — OS Concepts Simulator
\`React, TypeScript, Vite, Tailwind CSS\` · Source Code

- Implemented 12+ classical OS algorithms (CPU scheduling, page replacement, disk scheduling) in a fully type-safe, responsive SPA with real-time Gantt chart visualization — actively used by junior students at BMSCE

## Leadership

**Senior Coordinator, Phase Shift 2025 — BMSCE** · 2024 – 2025
- Co-led logistics for BMSCE's annual technical fest; previously Junior Coordinator for Utsav 2025, managing design team and on-ground event operations

---`;function Oe(o){const e=document.createElement("div");e.className="docs",e.innerHTML=Te(fn);const t="/preview-37ddb73e635f46e3f61f/resume.pdf";fetch(t,{method:"HEAD"}).then(n=>{const i=n.headers.get("content-type")??"";if(!n.ok||!i.includes("pdf"))return;const s=document.createElement("div");s.className="docs__toolbar";const a=document.createElement("a");a.className="docs__download",a.href=t,a.target="_blank",a.rel="noreferrer noopener",a.textContent="↓ download PDF",s.append(a),e.prepend(s)}).catch(()=>{}),o.windows.open({id:"resume",title:"resume — nafees",content:e,width:560,height:480}),o.terminal.print("opened: resume","dim")}function F(o,e){return async t=>{if(T()){e(t);return}const n=document.createElement("div");n.className="terminal__line terminal__line--sub",t.terminal.printEl(n);const i=Le(n,o);await z(320+Math.random()*260),i.stop(),n.remove(),e(t)}}function gn(){const o=[],e=t=>{t.terminal.print("available commands:");for(const n of o.filter(i=>!i.hidden)){const i=(n.usage??n.name).padEnd(18);t.terminal.print(`  ${i}${n.summary}`,"dim")}};return o.push({name:"help",summary:"list available commands",run:e},{name:"about",summary:"who is lucenity",run:F("waking about",Ae)},{name:"resume",summary:"view my résumé",run:F("dusting off the résumé",Oe)},{name:"projects",summary:"browse my work",run:F("indexing projects",ze)},{name:"project",summary:"open a specific project",usage:"project <slug>",run:async t=>{const n=t.args[0];if(!n){t.terminal.print("usage: project <slug>","dim"),t.terminal.print(`slugs: ${I.map(i=>i.slug).join(", ")}`,"sub");return}await F(`spinning up ${n}`,i=>Pe(i,n))(t)},complete:t=>t.length>1?[]:I.map(n=>n.slug)},{name:"contact",summary:"how to reach me",run:F("opening channels",Ie)},{name:"liffy",summary:"chat with liffy, my lil assistant",run:F("poking liffy awake",$e)},{name:"clear",summary:"clear the screen",run:t=>t.terminal.clear()},{name:"whoami",summary:"print the current session identity",run:t=>t.terminal.print("visitor@lucenity — guest session","dim")},{name:"cat",summary:"",hidden:!0,run:t=>{const n=se("cat terminal__cat");t.terminal.printEl(n),t.terminal.print("the cat is asleep. it is always asleep. =^..^=","dim")}},{name:"sudo",summary:"",hidden:!0,run:t=>t.terminal.print("nice try. you're a guest here :)","dim")},{name:"git",usage:"git <subcommand>",summary:"",hidden:!0,run:t=>{const n=t.args[0];if(!n){t.terminal.print("usage: git <subcommand>","dim"),t.terminal.print("subcommands: init, clone","sub");return}if(n==="init")t.terminal.print("Nafees's Github! : https://github.com/lucenity0","dim");else if(n==="clone"){const i=t.args[1];if(!i){t.terminal.print("usage: git clone <slug>","dim"),t.terminal.print(`slugs: ${I.map(a=>a.slug).join(", ")}`,"sub");return}if(!I.find(a=>a.slug===i)){t.terminal.print(`error: no project found with slug '${i}'`,"dim"),t.terminal.print(`valid slugs: ${I.map(a=>a.slug).join(", ")}`,"sub");return}t.terminal.print(`Cloning into '${i}'...`,"dim"),t.terminal.print(`remote: https://github.com/lucenity0/${i}.git`,"sub")}},complete:t=>t.length<=1?["init","clone"]:t[0]==="clone"&&t.length===2?I.map(n=>n.slug):[]},{name:"cookie",hidden:!0,summary:"",run:t=>{t.terminal.print("...sniff sniff...","dim"),t.terminal.print("I smell cookies!! Keep typing... maybe one will appear after 24 characters... =^.^=","sub")}},{name:"cookies",hidden:!0,summary:"",run:t=>{t.terminal.print("nom...? not yet! Keep typing until one shows up!","dim")}},{name:"biscuit",hidden:!0,summary:"",run:t=>{t.terminal.print("cookies, biscuits... I'll happily accept either :3","dim")}},{name:"sleep",hidden:!0,summary:"",run:t=>{t.terminal.print("*yaaawn...*","dim"),t.terminal.print("I might get sleepy if you don't talk to me... zzz... OH! sorry, I'm still awake!!","sub")}},{name:"sleepy",hidden:!0,summary:"",run:t=>{t.terminal.print("five more minutes...","dim")}},{name:"nap",hidden:!0,summary:"",run:t=>{t.terminal.print("the cat approves of naps. =^..^=","dim")}},{name:"yawn",hidden:!0,summary:"",run:t=>{t.terminal.print("*yaaawn... stretches dramatically*","dim")}},{name:"laydown",hidden:!0,summary:"",run:t=>{t.terminal.print("already lying down. productivity is optional.","dim")}},{name:"sheely",hidden:!0,summary:"",run:t=>{t.terminal.print("sheely detected... initiating maximum coziness.","dim")}},{name:"sweepy",hidden:!0,summary:"",run:t=>{t.terminal.print("sweepy... very sweepy...","dim")}},{name:"sleeping",hidden:!0,summary:"",run:t=>{t.terminal.print("I'm definitely not sleeping... probably.","dim")}},{name:"slep",hidden:!0,summary:"",run:t=>{t.terminal.print("slep mode activated.","dim")}},{name:"nom",hidden:!0,summary:"",run:t=>{t.terminal.print("nom nom... thanks for the cookies stranger! =^.^=","dim")}},{name:"nomnom",hidden:!0,summary:"",run:t=>{t.terminal.print("nomnomnom!! delicious.","dim")}},{name:"nomnomnom",hidden:!0,summary:"",run:t=>{t.terminal.print("*crumbs everywhere*","dim")}},{name:"coffee",hidden:!0,summary:"",run:t=>{t.terminal.print("y-yawnn... coffee is my favourite thing. *sips coffee* ☕","dim")}},{name:"espresso",hidden:!0,summary:"",run:t=>{t.terminal.print("one tiny cup, infinite energy.","dim")}},{name:"latte",hidden:!0,summary:"",run:t=>{t.terminal.print("latte art attempt #247... still looks like a blob.","dim")}},{name:"iced",usage:"iced latte",hidden:!0,summary:"",run:t=>{t.args[0]==="latte"&&t.terminal.print("cold, creamy, perfect.","dim")}},{name:"cappuccino",hidden:!0,summary:"",run:t=>{t.terminal.print("extra foam please ☁️","dim")}},{name:"mocha",hidden:!0,summary:"",run:t=>{t.terminal.print("coffee + chocolate = perfection.","dim")}},{name:"barista",hidden:!0,summary:"",run:t=>{const n=[`☕ Vanilla Latte
  • 1 espresso
  • 200ml steamed milk
  • 20ml vanilla syrup`,`☕ Caramel Latte
  • 1 espresso
  • 20ml caramel syrup
  • steamed milk`,`☕ Iced Mocha
  • 1 espresso
  • chocolate syrup
  • cold milk
  • ice`,`☕ Honey Cinnamon Latte
  • espresso
  • 1 tbsp honey
  • pinch of cinnamon
  • steamed milk`],i=n[Math.floor(Math.random()*n.length)];t.terminal.print("I have excellent barista skills! Feed me more cookies and I'll share more recipes...","dim"),t.terminal.print(i,"sub")}}),o}const H=5,yn=42,L={bright:"#f4f4f4",light:"#c8c8c8",mid:"#808080",dim:"#9a9a9a",far:"#3a3a3a",shadow:"#222222",ground:"#121212",groundLine:"#2a2a2a",liquid:"#1a1a1a"},wn=["###","..#",".#.","#..","###"];function bn(o){const e=document.createElement("canvas");e.className="gui__wallpaper",e.setAttribute("aria-hidden","true"),o.append(e);const t=e.getContext("2d"),n=T();let i=0,s=0,a=[],c=[],l=0;const r=(b,h,m,f,k)=>{t.fillStyle=k,t.fillRect(Math.round(b),Math.round(h),Math.round(m),Math.round(f))},d=(b,h,m,f)=>{t.globalAlpha=Math.max(0,Math.min(1,f));for(let k=0;k<5;k++)for(let u=0;u<3;u++)wn[k][u]==="#"&&r(b+u*m,h+k*m,m,m,L.light);t.globalAlpha=1},p=()=>{const b=o.clientWidth||1,h=o.clientHeight||1;i=Math.ceil(b/H),s=Math.ceil(h/H),e.width=i,e.height=s,e.style.width=`${i*H}px`,e.style.height=`${s*H}px`;let m=1337;const f=()=>(m=m*1103515245+12345&2147483647)/2147483647;a=[];const k=Math.max(10,Math.floor(s*.55)),u=Math.floor(i*k/260);for(let E=0;E<u;E++){const C=2+Math.floor(f()*(i-4)),_=2+Math.floor(f()*k);C>i-34&&_<24||a.push({x:C,y:_,ph:f()*Math.PI*2,sp:.6+f()*1.6,big:f()>.86})}c=[];for(let E=1;E<i;E+=2+Math.floor(f()*3))c.push({x:E,h:2+Math.floor(f()*3),ph:f()*Math.PI*2})},g=b=>{t.clearRect(0,0,i,s);const h=s-Math.ceil(yn/H)-10;for(const w of a){const M=n?.8:.45+.55*Math.sin(b*.002*w.sp+w.ph);if(M<.28)continue;const y=M>.8?L.bright:M>.55?L.light:L.mid;r(w.x,w.y,1,1,y),w.big&&M>.7&&(r(w.x-1,w.y,1,1,L.mid),r(w.x+1,w.y,1,1,L.mid),r(w.x,w.y-1,1,1,L.mid),r(w.x,w.y+1,1,1,L.mid))}const m=i-20,f=14,k=8;t.fillStyle=L.dim,t.beginPath(),t.arc(m,f,k,0,Math.PI*2),t.fill(),t.globalCompositeOperation="destination-out",t.beginPath(),t.arc(m+3.4,f-1.6,k,0,Math.PI*2),t.fill(),t.globalCompositeOperation="source-over",r(m-4,f+2,1,1,L.mid),r(m-6,f-2,1,1,L.mid),r(0,h,i,s-h,L.ground),r(0,h,i,1,L.groundLine);for(let w=3;w<i;w+=11)r(w,h+4+w*7%5,1,1,L.far);for(const w of c){const M=n?0:Math.round(Math.sin(b*.0016+w.ph)*.6);r(w.x+M,h-w.h,1,w.h,w.h>3?L.far:L.shadow),r(w.x,h-1,1,1,L.far)}const u=Math.max(6,Math.floor(i*.16)),E=n?0:Math.sin(b*.0022)>.3?-1:0,C=h-D.length+3+E;r(u+3,h+2,17,1,L.shadow);for(let w=0;w<D.length;w++){const M=D[w];for(let y=0;y<M.length;y++)M[y]==="#"&&r(u+y,C+w,1,1,L.light)}if(n)d(u+11,C-5,2,.9);else for(let M=0;M<3;M++){const y=(b+M*860)%2600/2600,x=y<.18?y/.18:y>.7?(1-y)/.3:1;d(u+9+y*6,C-1-y*16,1+(M>1?1:0),x)}const _=u+D[0].length+6,S=h-6;if(r(_,S,7,6,L.light),r(_+6,S+1,1,4,L.mid),r(_+7,S+1,2,1,L.mid),r(_+8,S+2,1,2,L.mid),r(_+7,S+4,2,1,L.mid),r(_+1,S,5,1,L.liquid),r(_+1,S+6,6,1,L.shadow),n)r(_+2,S-3,1,1,L.mid),r(_+5,S-5,1,1,L.mid);else{for(let w=0;w<2;w++){const M=_+2+w*3;for(let y=0;y<4;y++){const x=((b*.0012+w*.4+y*.25)%1+1)%1,j=y===0?.5:.5-x*.4;t.globalAlpha=Math.max(.08,j),r(M+Math.round(Math.sin(b*.003+y+w)*1),S-2-y*2,1,1,L.mid)}}t.globalAlpha=1}};if(p(),n)g(1800);else{const b=performance.now(),h=m=>{g(m-b),l=requestAnimationFrame(h)};l=requestAnimationFrame(h)}const v=new ResizeObserver(()=>{p(),n&&g(1800)});return v.observe(o),{destroy(){cancelAnimationFrame(l),v.disconnect(),e.remove()}}}function vn(o,e,t){const n=document.createElement("div");n.className="gui";const i=bn(n),s=[{id:"about",label:"about.txt",glyph:"≡",kind:"file",open:Ae},{id:"projects",label:"projects",glyph:"",kind:"folder",open:ze},{id:"resume",label:"resume.pdf",glyph:"PDF",kind:"file",open:Oe},{id:"liffy",label:"liffy",glyph:"=^..^=",kind:"app",open:$e},{id:"contact",label:"contact",glyph:"@",kind:"file",open:Ie},{id:"tty",label:"terminal",glyph:">_",kind:"sys",open:()=>t.set("tty")}],a=document.createElement("div");a.className="gui__icons";for(const y of s){const x=document.createElement("button");x.type="button",x.className=`gui__icon gui__icon--${y.kind}`;const j=document.createElement("span");j.className="gui__icon-art",j.textContent=y.glyph;const ee=document.createElement("span");ee.className="gui__icon-label",ee.textContent=y.label,x.append(j,ee),x.addEventListener("click",()=>y.open(e)),a.append(x)}const c=document.createElement("div");c.className="gui__taskbar";const l=document.createElement("button");l.type="button",l.className="gui__start",l.textContent="⌂ lucenity",l.setAttribute("aria-haspopup","true"),l.setAttribute("aria-expanded","false");const r=document.createElement("div");r.className="gui__menu",r.hidden=!0;for(const y of s){const x=document.createElement("button");x.type="button",x.className="gui__menu-item",x.textContent=y.label,x.addEventListener("click",()=>{d(),y.open(e)}),r.append(x)}const d=()=>{r.hidden=!0,l.setAttribute("aria-expanded","false")};l.addEventListener("click",y=>{y.stopPropagation(),r.hidden=!r.hidden,l.setAttribute("aria-expanded",String(!r.hidden))});const p=y=>{!r.hidden&&!r.contains(y.target)&&d()};document.addEventListener("click",p);const g=document.createElement("div");g.className="gui__tasks";const v=document.createElement("div");v.className="gui__tray";const b=document.createElement("span");b.className="gui__tray-cat",b.textContent="=^..^=",b.title="the cat is asleep. it is always asleep.";const h=document.createElement("span");h.className="gui__clock";const m=()=>{const y=new Date;h.textContent=`${String(y.getHours()).padStart(2,"0")}:${String(y.getMinutes()).padStart(2,"0")}`};m();const f=window.setInterval(m,15e3);v.append(b,h),c.append(l,g,v),n.append(a,r,c),o.append(n);const k=()=>{g.textContent="";for(const y of e.windows.list()){const x=document.createElement("button");x.type="button",x.className="gui__task",y.minimized?x.classList.add("is-min"):y.el.classList.contains("is-active")&&x.classList.add("is-on"),x.textContent=y.title,x.title=y.minimized?`restore ${y.title}`:y.title,x.addEventListener("click",()=>{y.minimized?e.windows.restore(y.id):y.el.classList.contains("is-active")?e.windows.minimize(y.id):e.windows.focus(y.id)}),g.append(x)}};let u=0,E=!1,C=!1;const _=()=>{if(E){C=!0;return}cancelAnimationFrame(u),u=requestAnimationFrame(k)},S=()=>{E=!0},w=()=>{E=!1,C&&(C=!1,_())};document.addEventListener("pointerdown",S,{capture:!0}),document.addEventListener("pointerup",w,{capture:!0}),document.addEventListener("pointercancel",w,{capture:!0});const M=new MutationObserver(y=>{y.every(x=>n.contains(x.target))||_()});return M.observe(o,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class"]}),k(),{destroy(){M.disconnect(),cancelAnimationFrame(u),document.removeEventListener("pointerdown",S,{capture:!0}),document.removeEventListener("pointerup",w,{capture:!0}),document.removeEventListener("pointercancel",w,{capture:!0}),window.clearInterval(f),document.removeEventListener("click",p),i.destroy(),n.remove()}}}const V=document.getElementById("app");if(!V)throw new Error("#app mount element not found");bt();const ae=new Ue(V),re=new Be;re.registerAll(gn());const R=new Qe(V,re,ae),W=new yt,kn={terminal:R,windows:ae,args:[],flags:{},raw:""};let U=null;const Fe=()=>{W.current==="gui"&&!U?U=vn(V,kn,W):W.current==="tty"&&U&&(U.destroy(),U=null,R.focusInput()),ae.remeasure()};W.onChange(Fe);Fe();re.register({name:"gui",summary:"switch to the GUI desktop",run:o=>{o.terminal.print("switching to gui — the toggle brings you back.","dim"),W.set("gui")}});et(R).then(()=>{const o=gt(V);R.bindCatOverlap(o.companion.el),R.onTyping=e=>o.companion.onTyping(e),R.onSend=()=>o.companion.onSend(),R.onClear=()=>o.restore()});
//# sourceMappingURL=index-CpQnp6Ia.js.map
