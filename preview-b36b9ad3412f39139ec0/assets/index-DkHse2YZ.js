(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();class Le{map=new Map;register(e){this.map.set(e.name.toLowerCase(),e)}registerAll(e){for(const t of e)this.register(t)}get(e){return this.map.get(e.toLowerCase())}all(){return[...this.map.values()]}visible(){return this.all().filter(e=>!e.hidden)}names(){return[...this.map.keys()]}}const Ce=["e","s","se"];function Te(o){const e=document.createElement("section");e.className="window brackets is-opening",e.setAttribute("role","dialog"),e.setAttribute("aria-label",o);const t=document.createElement("header");t.className="window__bar";const n=document.createElement("span");n.className="window__dots";const i=document.createElement("span");i.className="window__dot";const s=document.createElement("span");s.className="window__dot";const a=document.createElement("span");a.className="window__dot",n.append(i,s,a);const r=document.createElement("span");r.className="window__title",r.textContent=o;const l=document.createElement("span");l.className="window__controls";const c=document.createElement("button");c.className="window__btn window__btn--min",c.type="button",c.title="minimize",c.setAttribute("aria-label","minimize window"),c.textContent="–";const d=document.createElement("button");d.className="window__btn window__btn--max",d.type="button",d.title="maximize",d.setAttribute("aria-label","maximize window"),d.textContent="□";const u=document.createElement("button");u.className="window__btn window__btn--close",u.type="button",u.title="close",u.setAttribute("aria-label","close window"),u.textContent="×",l.append(c,d,u),t.append(n,r,l);const g=document.createElement("div");g.className="window__body",e.append(t,g);const w=Ce.map(k=>{const h=document.createElement("span");return h.className=`window__resize window__resize--${k}`,h.dataset.dir=k,e.append(h),h});return{el:e,barEl:t,bodyEl:g,closeBtn:u,minimizeBtn:c,maximizeBtn:d,resizeHandles:w}}class xe{root;folderBtn;countEl;listEl;items=new Map;open=!1;constructor(e){this.root=document.createElement("div"),this.root.className="tray",this.root.hidden=!0,this.folderBtn=document.createElement("button"),this.folderBtn.className="tray__folder",this.folderBtn.type="button",this.folderBtn.setAttribute("aria-label","minimized windows"),this.folderBtn.setAttribute("aria-haspopup","true"),this.folderBtn.setAttribute("aria-expanded","false"),this.folderBtn.innerHTML='<span class="tray__glyph" aria-hidden="true">▚</span><span class="tray__count">0</span>',this.countEl=this.folderBtn.querySelector(".tray__count"),this.listEl=document.createElement("div"),this.listEl.className="tray__list",this.listEl.hidden=!0,this.folderBtn.addEventListener("click",()=>this.toggle()),this.root.append(this.folderBtn,this.listEl),e.append(this.root)}add(e,t,n){this.items.set(e,{title:t,onRestore:n}),this.render()}remove(e){this.items.delete(e),this.items.size===0&&(this.open=!1),this.render()}has(e){return this.items.has(e)}toggle(){this.open=!this.open&&this.items.size>0,this.render()}render(){const e=this.items.size;this.root.hidden=e===0,this.countEl.textContent=String(e),this.listEl.hidden=!this.open||e===0,this.folderBtn.classList.toggle("is-open",this.open),this.folderBtn.setAttribute("aria-expanded",String(this.open&&e>0)),this.listEl.replaceChildren();for(const[t,n]of this.items){const i=document.createElement("button");i.className="tray__item",i.type="button",i.textContent=n.title,i.addEventListener("click",()=>{n.onRestore(),this.open=!1,this.render()}),this.listEl.append(i)}}}const _=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,x=o=>new Promise(e=>window.setTimeout(e,o));async function Y(o,e,t={}){const{speed:n=18,delay:i=0}=t;if(_()){o.textContent=e;return}i>0&&await x(i),o.textContent="";for(const s of e)o.textContent+=s,await x(n)}function $(o,e){_()||(o.classList.add(e),o.addEventListener("animationend",()=>o.classList.remove(e),{once:!0}))}const V=["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];function de(o,e){const t=performance.now();let n=null;if(_())o.textContent=`${e}…`;else{let i=0;const s=()=>{const a=V[i%V.length],r=".".repeat((i>>2)%4);o.textContent=`${a} ${e}${r}`,i++};s(),n=window.setInterval(s,90)}return{stop(){return n!==null&&window.clearInterval(n),(performance.now()-t)/1e3}}}const X={width:420,height:300},U=260,D=160,C=12;class Ae{root;tray;records=new Map;minimized=new Set;mru=[];topZ=100;spawnCount=0;constructor(e){this.root=e,this.tray=new xe(e),window.addEventListener("resize",()=>this.reclampAll())}reclampAll(){const e=this.root.clientWidth,t=this.root.clientHeight;if(!(e===0||t===0))for(const[n,i]of this.records){if(this.minimized.has(n))continue;const s=i.el;if(s.classList.contains("is-maximized")){s.style.left=`${C}px`,s.style.top=`${C}px`,s.style.width=`${e-C*2}px`,s.style.height=`${t-C*2}px`;continue}const a=Math.min(s.offsetWidth,Math.max(U,e-16)),r=Math.min(s.offsetHeight,Math.max(D,t-16));s.style.width=`${a}px`,s.style.height=`${r}px`;const l=Math.min(s.offsetLeft,Math.max(8,e-a-8)),c=Math.min(s.offsetTop,Math.max(8,t-r-8));s.style.left=`${Math.max(0,l)}px`,s.style.top=`${Math.max(0,c)}px`}}open(e){const t=e.singleton??!0,n=this.records.get(e.id);if(t&&n)return this.minimized.has(e.id)?this.restore(e.id):n.instance.focus(),n.instance;const i=Te(e.title),{el:s,bodyEl:a,barEl:r,closeBtn:l,minimizeBtn:c,maximizeBtn:d,resizeHandles:u}=i,g=Math.max(U,this.root.clientWidth-16),w=Math.max(D,this.root.clientHeight-16),k=Math.min(e.width??X.width,g),h=Math.min(e.height??X.height,w);s.style.width=`${k}px`,s.style.height=`${h}px`;const f=this.spawnCount++%6*26,b=e.x??Math.max(8,this.root.clientWidth/2-k/2+f),E=e.y??Math.max(8,this.root.clientHeight/2-h/2+f);s.style.left=`${Math.min(b,Math.max(8,this.root.clientWidth-k-8))}px`,s.style.top=`${Math.min(E,Math.max(8,this.root.clientHeight-h-8))}px`,typeof e.content=="string"?a.textContent=e.content:a.appendChild(e.content);const m={id:e.id,el:s,bodyEl:a,close:()=>this.close(e.id),focus:()=>this.focus(e.id)};return l.addEventListener("click",y=>{y.stopPropagation(),this.close(e.id)}),c.addEventListener("click",y=>{y.stopPropagation(),this.minimize(e.id)}),d.addEventListener("click",y=>{y.stopPropagation(),this.toggleMaximize(e.id)}),r.addEventListener("dblclick",y=>{y.target.closest(".window__dot, .window__btn")||this.toggleMaximize(e.id)}),s.addEventListener("pointerdown",()=>this.focus(e.id)),s.addEventListener("keydown",y=>{y.key!=="Escape"||y.target.closest("input, textarea, select, [contenteditable]")||(y.stopPropagation(),this.close(e.id))}),this.enableDrag(s,r),this.enableResize(e.id,s,u),this.records.set(e.id,{instance:m,el:s,title:e.title}),this.root.appendChild(s),this.focus(e.id),m}close(e){const t=this.records.get(e);if(!t)return;this.records.delete(e);const n=this.minimized.delete(e);if(this.mru=this.mru.filter(i=>i!==e),this.tray.has(e)&&this.tray.remove(e),_()||n){t.el.remove();return}t.el.classList.add("is-closing"),t.el.addEventListener("animationend",()=>t.el.remove(),{once:!0}),window.setTimeout(()=>t.el.remove(),600)}toggleMaximize(e){const t=this.records.get(e);if(!t||this.minimized.has(e))return;if(_()||(t.el.classList.add("is-snapping"),window.setTimeout(()=>t.el.classList.remove("is-snapping"),300)),t.savedRect){const i=t.savedRect;t.el.style.left=i.left,t.el.style.top=i.top,t.el.style.width=i.width,t.el.style.height=i.height,delete t.savedRect,t.el.classList.remove("is-maximized")}else t.savedRect={left:t.el.style.left,top:t.el.style.top,width:t.el.style.width,height:t.el.style.height},t.el.style.left=`${C}px`,t.el.style.top=`${C}px`,t.el.style.width=`${this.root.clientWidth-C*2}px`,t.el.style.height=`${this.root.clientHeight-C*2}px`,t.el.classList.add("is-maximized");const n=t.el.querySelector(".window__btn--max");if(n){const i=t.el.classList.contains("is-maximized");n.textContent=i?"❐":"□",n.title=i?"restore":"maximize",n.setAttribute("aria-label",i?"restore window":"maximize window")}this.focus(e)}focus(e){const t=this.records.get(e);if(t){for(const[n,i]of this.records)i.el.classList.toggle("is-active",n===e&&!this.minimized.has(n));t.el.style.zIndex=String(++this.topZ),this.mru=[e,...this.mru.filter(n=>n!==e)]}}cycle(e){const t=this.mru.filter(i=>this.records.has(i)&&!this.minimized.has(i));if(t.length<2)return;const n=e===1?t[1]:t[t.length-1];n&&this.focus(n)}get(e){return this.records.get(e)?.instance}minimize(e){const t=this.records.get(e);if(!(!t||this.minimized.has(e))){if(this.minimized.add(e),t.el.classList.remove("is-active"),this.tray.add(e,t.title,()=>this.restore(e)),_()){t.el.style.display="none";return}t.el.classList.add("is-minimizing"),t.el.addEventListener("animationend",()=>{t.el.style.display="none",t.el.classList.remove("is-minimizing")},{once:!0})}}list(){return[...this.records.entries()].map(([e,t])=>({id:e,title:t.el.querySelector(".window__title")?.textContent??e,el:t.el,minimized:this.minimized.has(e)}))}restore(e){const t=this.records.get(e);t&&(this.minimized.delete(e),this.tray.has(e)&&this.tray.remove(e),t.el.style.display="",t.el.classList.remove("is-minimizing"),this.focus(e),$(t.el,"is-opening"))}enableDrag(e,t){let n=0,i=0,s=0,a=0,r=!1;const l=d=>{if(!r)return;const u=s+(d.clientX-n),g=a+(d.clientY-i);e.style.left=`${Math.min(Math.max(u,-e.clientWidth+80),this.root.clientWidth-80)}px`,e.style.top=`${Math.min(Math.max(g,0),this.root.clientHeight-40)}px`},c=d=>{r=!1,t.releasePointerCapture?.(d.pointerId),window.removeEventListener("pointermove",l),window.removeEventListener("pointerup",c)};t.addEventListener("pointerdown",d=>{d.target.closest(".window__btn")||e.classList.contains("is-maximized")||(r=!0,n=d.clientX,i=d.clientY,s=e.offsetLeft,a=e.offsetTop,t.setPointerCapture?.(d.pointerId),window.addEventListener("pointermove",l),window.addEventListener("pointerup",c))})}enableResize(e,t,n){for(const i of n)i.addEventListener("pointerdown",s=>{if(s.preventDefault(),s.stopPropagation(),t.classList.contains("is-maximized"))return;this.focus(e);const a=i.dataset.dir??"se",r=s.clientX,l=s.clientY,c=t.offsetWidth,d=t.offsetHeight,u=w=>{a.includes("e")&&(t.style.width=`${Math.max(U,c+(w.clientX-r))}px`),a.includes("s")&&(t.style.height=`${Math.max(D,d+(w.clientY-l))}px`)},g=w=>{i.releasePointerCapture?.(w.pointerId),window.removeEventListener("pointermove",u),window.removeEventListener("pointerup",g)};i.setPointerCapture?.(s.pointerId),window.addEventListener("pointermove",u),window.addEventListener("pointerup",g)})}}function Z(o){const e=[];let t="",n=!1,i=null;for(let s=0;s<o.length;s++){const a=o[s];if(i){a===i?i=null:i==='"'&&a==="\\"&&(o[s+1]==='"'||o[s+1]==="\\")?t+=o[++s]:t+=a;continue}if(a==="\\"&&s+1<o.length){t+=o[++s],n=!0;continue}if(a==='"'||a==="'"){i=a,n=!0;continue}if(/\s/.test(a)){n&&(e.push(t),t="",n=!1);continue}t+=a,n=!0}return n&&e.push(t),e}function Me(o){const e=[],t={};for(const n of o){const i=/^--([^=\s]+)(?:=(.*))?$/.exec(n);i?t[i[1]]=i[2]!==void 0?i[2]:!0:e.push(n)}return{args:e,flags:t}}const ee="visitor@lucenity:~$",he="lucenity:history",te=200,Ie={default:"terminal__line",dim:"terminal__line terminal__line--dim",sub:"terminal__line terminal__line--sub"};function Ne(o){if(o.length===0)return"";let e=o[0];for(const t of o.slice(1)){for(;!t.startsWith(e);)e=e.slice(0,-1);if(e==="")break}return e}function Pe(o,e,t){if(Math.abs(o.length-e.length)>t)return t+1;const n=Array.from({length:o.length+1},()=>new Array(e.length+1).fill(0));for(let i=0;i<=o.length;i++)n[i][0]=i;for(let i=0;i<=e.length;i++)n[0][i]=i;for(let i=1;i<=o.length;i++)for(let s=1;s<=e.length;s++){const a=o[i-1]===e[s-1]?0:1;let r=Math.min(n[i-1][s]+1,n[i][s-1]+1,n[i-1][s-1]+a);i>1&&s>1&&o[i-1]===e[s-2]&&o[i-2]===e[s-1]&&(r=Math.min(r,n[i-2][s-2]+1)),n[i][s]=r}return n[o.length][e.length]}function Re(o,e){if(o.length<2)return null;const t=o.length>=6?2:1;let n=null;for(const i of e){const s=Pe(o,i,t);s<=t&&(!n||s<n.dist)&&(n={name:i,dist:s})}return n?.name??null}function $e(){try{const o=localStorage.getItem(he);if(!o)return[];const e=JSON.parse(o);return Array.isArray(e)?e.filter(t=>typeof t=="string"):[]}catch{return[]}}function ze(o){try{localStorage.setItem(he,JSON.stringify(o))}catch{}}class Oe{scrollEl;inputRow;inputEl;ghostBefore;caretText;ghostAfter;registry;windows;history=[];historyIndex=0;busy=!1;onTyping;onSend;onClear;constructor(e,t,n){this.registry=t,this.windows=n;const i=document.createElement("div");i.className="terminal";const s=document.createElement("div");s.className="terminal__surface";const a=document.createElement("div");a.className="terminal__scroll",a.setAttribute("role","log"),a.setAttribute("aria-live","polite");const r=document.createElement("div");r.className="terminal__input-row";const l=document.createElement("span");l.className="terminal__prompt",l.textContent=ee;const c=document.createElement("span");c.className="terminal__field";const d=document.createElement("span");d.className="terminal__ghost",d.setAttribute("aria-hidden","true");const u=document.createTextNode(""),g=document.createElement("span");g.className="caret";const w=document.createTextNode("");g.append(w);const k=document.createTextNode("");d.append(u,g,k);const h=document.createElement("input");h.className="terminal__input",h.type="text",h.setAttribute("aria-label","terminal input"),h.autocomplete="off",h.autocapitalize="off",h.spellcheck=!1,c.append(d,h),r.append(l,c),a.append(r),s.append(a),i.append(s),e.append(i),this.scrollEl=a,this.inputRow=r,this.inputEl=h,this.ghostBefore=u,this.caretText=w,this.ghostAfter=k,this.history=$e(),this.historyIndex=this.history.length,h.addEventListener("input",()=>this.renderGhost()),document.addEventListener("selectionchange",()=>{document.activeElement===this.inputEl&&this.renderGhost()}),h.addEventListener("keyup",()=>this.renderGhost()),h.addEventListener("click",()=>this.renderGhost()),h.addEventListener("keydown",f=>this.onKeydown(f)),s.addEventListener("click",()=>{(window.getSelection()?.toString()??"")===""&&this.focusInput()}),document.addEventListener("keydown",f=>{if(f.ctrlKey&&(f.key==="]"||f.key==="[")){f.preventDefault(),this.windows.cycle(f.key==="]"?1:-1);return}if(this.busy||f.metaKey||f.ctrlKey||f.altKey)return;const b=document.activeElement;b!==this.inputEl&&(b instanceof Element&&b.closest(".window")||(f.key.length===1||f.key==="Backspace"||f.key==="Enter")&&this.focusInput())}),this.renderGhost()}print(e="",t="default"){const n=this.makeLine(t);n.textContent=e,this.insertLine(n)}printEl(e){this.insertLine(e)}clear(){for(const e of[...this.scrollEl.children])e!==this.inputRow&&e.remove();this.onClear?.()}focusInput(){this.inputEl.focus()}async typeLine(e,t="default",n=12){const i=this.makeLine(t);this.insertLine(i),await Y(i,e,{speed:n}),this.scrollToBottom()}setBusy(e){this.busy=e,this.inputEl.disabled=e}echoPrompt(e){const t=this.makeLine("default"),n=document.createElement("span");n.className="terminal__prompt",n.textContent=`${ee} `,t.append(n,document.createTextNode(e)),this.insertLine(t)}makeLine(e){const t=document.createElement("div");return t.className=Ie[e],t}insertLine(e){this.scrollEl.insertBefore(e,this.inputRow),this.scrollToBottom()}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}renderGhost(){const e=this.inputEl.value,t=this.inputEl.selectionStart??e.length;this.ghostBefore.textContent=e.slice(0,t),this.caretText.textContent=e[t]??"",this.ghostAfter.textContent=e.slice(t+1),this.onTyping?.(e.length)}onKeydown(e){if(this.busy){e.preventDefault();return}switch(e.key){case"Enter":e.preventDefault(),this.submit(this.inputEl.value);break;case"ArrowUp":e.preventDefault(),this.recallHistory(-1);break;case"ArrowDown":e.preventDefault(),this.recallHistory(1);break;case"Tab":e.preventDefault(),this.handleTab();break;default:e.key==="l"&&e.ctrlKey&&(e.preventDefault(),this.clear())}}pushHistory(e){this.history[this.history.length-1]!==e&&(this.history.push(e),this.history.length>te&&(this.history=this.history.slice(this.history.length-te)),ze(this.history)),this.historyIndex=this.history.length}recallHistory(e){if(this.history.length===0)return;this.historyIndex=Math.min(Math.max(this.historyIndex+e,0),this.history.length);const t=this.history[this.historyIndex]??"";this.inputEl.value=t,this.inputEl.setSelectionRange(t.length,t.length),this.renderGhost()}handleTab(){const e=this.inputEl.value,t=Z(e),n=/\s$/.test(e),i=t.length===0||t.length===1&&!n,s=n?"":t[t.length-1]??"";let a;if(i)a=this.registry.visible().map(c=>c.name);else{const c=this.registry.get(t[0]??"");if(!c?.complete)return;const d=n?t.slice(1):t.slice(1,-1);a=c.complete(d)}const r=a.filter(c=>c.startsWith(s)).sort();if(r.length===0)return;if(r.length===1){const c=r[0],d=i?[]:n?t:t.slice(0,-1);this.setInput([...d,c].join(" ")+" ");return}const l=Ne(r);if(l.length>s.length){const c=i?[]:n?t:t.slice(0,-1);this.setInput([...c,l].join(" "));return}this.print(r.join("  "),"dim")}setInput(e){this.inputEl.value=e,this.inputEl.setSelectionRange(e.length,e.length),this.renderGhost()}async submit(e){const t=e.trim();if(this.echoPrompt(e),this.inputEl.value="",this.renderGhost(),this.onSend?.(),t==="")return;this.pushHistory(t);const n=Z(t);if(n.length===0)return;const i=(n[0]??"").replace(/^\//,""),{args:s,flags:a}=Me(n.slice(1)),r=this.registry.get(i);if(!r){const l=Re(i,this.registry.visible().map(c=>c.name));this.print(l?`command not found: ${i} — did you mean \`${l}\`?`:`command not found: ${i} — type \`help\``,"dim");return}this.setBusy(!0);try{await r.run({terminal:this,windows:this.windows,args:s,flags:a,raw:t})}catch(l){const c=l instanceof Error?l.message:String(l);this.print(`error: ${c}`,"dim")}finally{this.setBusy(!1),this.focusInput()}}}const Be=["┌───────────────────────────┐","│   l u c e n i t y O S     │","│   bios v1.1 — mono/64k    │","└───────────────────────────┘"],Fe=[["● cpu ................ ok","sub",30],["● memory ............. 640k (plenty)","sub",30],["● pixel shaders ...... ok","sub",40],["● crt scanlines ...... flickering nicely","sub",30],["● liffy.service ...... loaded","sub",60],["● cat daemon ......... asleep (do not wake)","sub",120],["mounting /home/visitor ... done","dim",60]];async function je(o){o.setBusy(!0);for(const e of Be)o.print(e,"dim");_()||await x(180);for(const[e,t,n]of Fe)await o.typeLine(e,t,6),_()||await x(n);o.print(),o.print("welcome. type `help` to see what i can do.","default"),o.print(),o.setBusy(!1),o.focusInput()}const Ge=["..#.......#...............",".###.....###..............",".#.##....#.##.............",".#..##..##..##............",".#.########..##...........",".################.........",".#################........",".##################.......",".##################.......","###################.......","###################.#####.","##...####...##############","##########################","####################...###",".################.........","..#############..........."],He={sleep:{},awake:{10:"##..#####..########.#####.",11:"##..#####..###############"},think:{10:"##########.########.#####.",11:"##..####..################"},"munch-a":{12:"#####...##################"},"munch-b":{12:"######..##################"},peek:{10:"##..###############.#####.",11:"##..#####...##############"}};function ue(o="sleep"){const e=He[o];return Ge.map((t,n)=>e[n]??t).map(t=>[...t].map(n=>n==="#"?"██":"  ").join("")).join(`
`)}function Ue(o,e){const t=o.querySelector(".cat__art");t&&(t.textContent=ue(e)),o.dataset.frame=e}function J(o="cat",e="sleep"){const t=document.createElement("div");t.className=o,t.dataset.frame=e;const n=document.createElement("pre");n.className="cat__art",n.textContent=ue(e),n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="cat__zzz",i.setAttribute("aria-hidden","true");for(let s=0;s<3;s++){const a=document.createElement("span");a.className="cat__z",a.textContent="z",a.style.animationDelay=`${s*.9}s`,i.append(a)}return t.append(i,n),t}const De=24,We=3,qe=2e3,ne=["quiet!","let me sleep!"],Ye=1e3,Je=3e3,ie=5,se=260,Ke=45e3,Qe=1e5,Ve=6e4,Xe=15e3,Ze=2e4,et=4500,tt=["zzz... sudo... nice try... zzz","mrrp... a command... named after me...","zzz... git clone... take one home...","...ctrl+] ... windows go round... zzz","zzz... liffy keeps secrets too...","...feed me... 24 keys... zzz"],nt=["mrrp... say meow... i dare you...","zzz... cookie... just type it...","...hold me... one whole second... prrr","zzz... stare at me... see what happens..."];class me{el;catEl;fillEl;meterEl;plateEl;bubbleEl;opts;cornered=!1;munching=!1;thinking=!1;bobbing=!1;staring=!1;petting=!1;clickTimes=[];bubbleTimer=null;petTimer=null;hoverTimer=null;murmurs;murmurIdx=0;lastActivity=performance.now();constructor(e){this.opts=e,this.el=document.createElement("div"),this.el.className=`catc catc--${e.mode}`,this.el.dataset.frame=e.idleFrame,this.catEl=J("cat catc__cat",e.idleFrame),this.bubbleEl=document.createElement("span"),this.bubbleEl.className="catc__bubble",this.bubbleEl.setAttribute("role","status"),this.meterEl=document.createElement("div"),this.meterEl.className="catc__meter",this.fillEl=document.createElement("div"),this.fillEl.className="catc__fill",this.plateEl=document.createElement("button"),this.plateEl.className="catc__plate",this.plateEl.type="button",this.plateEl.title="feed the cat",this.plateEl.setAttribute("aria-label","feed the cat a cookie"),this.meterEl.append(this.fillEl,this.plateEl),this.el.append(this.bubbleEl,this.catEl,this.meterEl),e.mount.append(this.el),this.wireAngryClicks(),e.mode==="liffy"&&(this.wirePetHold(),this.wireStareHover()),this.plateEl.addEventListener("click",t=>{t.stopPropagation(),this.feed()}),this.murmurs=[...e.mode==="hero"?tt:nt].sort(()=>Math.random()-.5),this.scheduleMurmur(Ke)}onTyping(e){e>0&&(this.lastActivity=performance.now()),e>0&&!this.cornered&&this.corner();const t=Math.min(e/De,1);this.fillEl.style.width=`${t*100}%`,this.el.classList.toggle("catc--typing",e>0||this.munching),this.plateEl.classList.toggle("is-served",t>=1)}onSend(){this.lastActivity=performance.now(),this.fillEl.style.width="0%",this.plateEl.classList.remove("is-served"),this.munching||this.el.classList.remove("catc--typing")}fillNow(){this.cornered||this.corner(),this.fillEl.style.width="100%",this.el.classList.add("catc--typing"),this.plateEl.classList.add("is-served")}corner(){this.cornered=!0,this.el.classList.add("catc--corner"),this.setFrame("sleep"),this.opts.onCorner?.()}restoreCenter(){this.cornered=!1,this.el.classList.remove("catc--corner"),this.onSend(),this.setFrame(this.opts.idleFrame)}feed(){if(this.munching)return;if(this.munching=!0,this.plateEl.classList.remove("is-served"),this.fillEl.style.width="0%",_()){this.setFrame("munch-a"),this.say("nom.",900),window.setTimeout(()=>{this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing")},900);return}this.say("nom nom nom",ie*se+300);let e=0;const t=window.setInterval(()=>{this.setFrame(e%2===0?"munch-a":"munch-b"),e++,e>ie&&(window.clearInterval(t),this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing"))},se)}think(e){this.thinking=e,!this.munching&&this.setFrame(e?"think":this.restFrame())}bob(e){this.bobbing=e,e?(this.munching||this.setFrame("awake"),_()||this.el.classList.add("catc--bob")):(this.el.classList.remove("catc--bob"),!this.munching&&!this.thinking&&this.setFrame(this.restFrame()))}hop(){$(this.el,"catc--hop")}say(e,t=2e3){this.bubbleTimer!==null&&window.clearTimeout(this.bubbleTimer),this.bubbleEl.textContent=e,this.bubbleEl.classList.add("is-visible"),this.bubbleTimer=window.setTimeout(()=>{this.bubbleEl.classList.remove("is-visible"),this.bubbleTimer=null},t)}scheduleMurmur(e){window.setTimeout(()=>this.tryMurmur(),e)}tryMurmur(){if(!this.el.isConnected)return;if(this.munching||this.thinking||this.bobbing||this.petting||this.bubbleTimer!==null||document.hidden||performance.now()-this.lastActivity<Ze){this.scheduleMurmur(Xe);return}this.say(this.murmurs[this.murmurIdx++%this.murmurs.length],et),this.scheduleMurmur(Qe+Math.random()*Ve)}restFrame(){return this.cornered?"sleep":this.opts.idleFrame}setFrame(e){Ue(this.catEl,e),this.el.dataset.frame=e}wireAngryClicks(){this.catEl.addEventListener("click",()=>{if(this.petting)return;const e=performance.now();this.clickTimes=this.clickTimes.filter(t=>e-t<qe),this.clickTimes.push(e),this.clickTimes.length>=We&&(this.clickTimes=[],$(this.el,"catc--shake"),this.say(ne[Math.floor(Math.random()*ne.length)],2e3))})}wirePetHold(){this.catEl.addEventListener("pointerdown",()=>{this.petTimer=window.setTimeout(()=>{this.petting=!0,this.el.classList.add("catc--pet"),this.say("prrrrr.",6e4)},Ye)});const e=()=>{this.petTimer!==null&&window.clearTimeout(this.petTimer),this.petTimer=null,this.petting&&(this.el.classList.remove("catc--pet"),this.bubbleEl.classList.remove("is-visible"),window.setTimeout(()=>{this.petting=!1},0))};this.catEl.addEventListener("pointerup",e),this.catEl.addEventListener("pointerleave",e)}wireStareHover(){this.catEl.addEventListener("mouseenter",()=>{this.hoverTimer=window.setTimeout(()=>{!this.munching&&!this.thinking&&!this.bobbing&&(this.staring=!0,this.setFrame("peek"))},Je)}),this.catEl.addEventListener("mouseleave",()=>{this.hoverTimer!==null&&window.clearTimeout(this.hoverTimer),this.hoverTimer=null,this.staring&&(this.staring=!1,this.setFrame(this.restFrame()))})}}const oe=["hello, stranger!","oh, you're back.","shh. the cat sleeps.","type something. anything."];function it(o){const e=document.createElement("div");e.className="hero",e.setAttribute("aria-hidden","true");const t=document.createElement("div");t.className="hero__title";const n=document.createElement("span"),i=document.createElement("span");i.className="caret hero__caret",t.append(n,i);const s=document.createElement("div");s.className="hero__sub",s.textContent="do not wake the cat. type instead.",e.append(t,s),o.append(e);const a=new me({mount:o,mode:"hero",idleFrame:"sleep",onCorner:()=>e.classList.add("hero--hidden")}),r=oe[Math.floor(Math.random()*oe.length)];return(async()=>($(e,"is-arriving"),$(a.el,"is-arriving"),_()||await x(350),await Y(n,r,{speed:55}),_()||await x(250),s.classList.add("is-visible")))(),{companion:a,restore(){e.classList.remove("hero--hidden"),a.restoreCenter()}}}const ae="lucenity-shell-mode";class st{mode;listeners=[];toggleBtn;constructor(){const e=localStorage.getItem(ae);this.mode=e==="gui"?"gui":"tty",this.toggleBtn=document.createElement("button"),this.toggleBtn.type="button",this.toggleBtn.className="mode-toggle",this.toggleBtn.addEventListener("click",()=>{this.set(this.mode==="tty"?"gui":"tty")}),document.body.append(this.toggleBtn),this.apply(!1)}get current(){return this.mode}set(e){if(e!==this.mode){this.mode=e,localStorage.setItem(ae,e),this.apply(!0);for(const t of this.listeners)t(e)}}onChange(e){this.listeners.push(e)}apply(e){if(document.body.classList.toggle("mode-gui",this.mode==="gui"),this.toggleBtn.textContent=this.mode==="tty"?"[ gui ]":"[ terminal ]",this.toggleBtn.title=this.mode==="tty"?"switch to the GUI desktop":"switch back to the terminal",this.toggleBtn.setAttribute("aria-pressed",String(this.mode==="gui")),e&&this.mode==="gui"&&!_()){const t=document.querySelector(".rig__screen");t&&(t.classList.remove("is-powering"),t.offsetWidth,t.classList.add("is-powering"),t.addEventListener("animationend",()=>t.classList.remove("is-powering"),{once:!0}))}}}const K=o=>o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function ot(o){let e=K(o);return e=e.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(t,n,i)=>`<a href="${i}" target="_blank" rel="noreferrer noopener">${n}</a>`),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__([^_]+)__/g,"<strong>$1</strong>"),e=e.replace(/(^|[^*])\*([^*\s][^*]*)\*/g,"$1<em>$2</em>"),e=e.replace(/(^|[^_])_([^_\s][^_]*)_/g,"$1<em>$2</em>"),e}function O(o){return o.split(/(`[^`]+`)/g).map(e=>e.length>=2&&e.startsWith("`")&&e.endsWith("`")?`<code>${K(e.slice(1,-1))}</code>`:ot(e)).join("")}function at(o){return o.replace(/```[^\n]*\n?/g,"").replace(/`([^`]+)`/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/__([^_]+)__/g,"$1").replace(/\*([^*]+)\*/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^#{1,6}\s+/gm,"").replace(/^\s*[-*+]\s+/gm,"• ").replace(/^>\s?/gm,"").replace(/\n{3,}/g,`

`).trim()}const B=/^(\s*)([-*+]|\d+\.)\s+(.*)$/;function pe(o){const e=o.replace(/\r\n?/g,`
`).split(`
`),t=[];let n=0;for(;n<e.length;){const i=e[n];if(/^```/.test(i.trim())){const r=i.trim().slice(0,3);n++;const l=[];for(;n<e.length&&!e[n].trim().startsWith(r);)l.push(e[n]),n++;n++,t.push(`<pre class="md-pre"><code>${K(l.join(`
`))}</code></pre>`);continue}if(i.trim()===""){n++;continue}const s=/^(#{1,6})\s+(.*)$/.exec(i);if(s){const r=s[1].length;t.push(`<h${r}>${O(s[2].trim())}</h${r}>`),n++;continue}if(/^(-{3,}|\*{3,}|_{3,})\s*$/.test(i.trim())){t.push("<hr />"),n++;continue}if(/^>\s?/.test(i)){const r=[];for(;n<e.length&&/^>\s?/.test(e[n]);)r.push(e[n].replace(/^>\s?/,"")),n++;t.push(`<blockquote>${O(r.join(" "))}</blockquote>`);continue}if(B.test(i)){const l=/^\s*\d+\./.test(i)?"ol":"ul",c=[];for(;n<e.length&&B.test(e[n]);){const d=B.exec(e[n]);c.push(`<li>${O(d[3])}</li>`),n++}t.push(`<${l}>${c.join("")}</${l}>`);continue}const a=[];for(;n<e.length&&e[n].trim()!==""&&!/^```/.test(e[n].trim())&&!/^#{1,6}\s/.test(e[n])&&!/^>\s?/.test(e[n])&&!B.test(e[n])&&!/^(-{3,}|\*{3,}|_{3,})\s*$/.test(e[n].trim());)a.push(e[n]),n++;t.push(`<p>${O(a.join(" "))}</p>`)}return t.join(`
`)}const rt=`# Nafees S

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
- Type \`contact\` for the rest, or \`liffy\` to just ask me things.`;function fe(o){const e=document.createElement("div");e.className="docs",e.innerHTML=pe(rt),e.prepend(J("cat docs__avatar")),o.windows.open({id:"about",title:"about — nafees",content:e,width:540,height:460}),o.terminal.print("opened: about","dim")}function ge(o){const e=document.createElement("div");e.className="contact",e.innerHTML=`
    <h2>contact</h2>
    <ul class="contact__list">
      <li><span class="muted">github</span> —
        <a href="https://github.com/lucenity0" target="_blank" rel="noreferrer noopener">github.com/lucenity0</a></li>
      <li><span class="muted">email</span> —
        <a href="mailto:hello@lucenity.dev">hello@lucenity.dev</a></li>
    </ul>
    <p class="muted">placeholder — swap in real handles in Phase 3.</p>
  `,o.windows.open({id:"contact",title:"contact",content:e,width:420,height:260}),o.terminal.print("opened: contact","dim")}const L=[{slug:"mlnotes",name:"ML Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://mlnotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"bdanotes",name:"BDA Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://bdanotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"schedulr",name:"Schedulr",blurb:"a scheduling app for teams and individuals",kind:"web",url:"https://srikrishna-ps.github.io/schedulr/",embeddable:!0,tags:["web","productivity","team"]},{slug:"sample-ios",name:"sample iOS app",blurb:"an app store listing — opens its landing page",kind:"ios",url:"https://www.apple.com/app-store/",embeddable:!1,tags:["ios","placeholder"]}];function lt(o){return L.find(e=>e.slug===o)}function ye(o,e){const t=lt(e);if(!t){o.terminal.print(`no such project: ${e} — try \`projects\``,"dim");return}const n=t.embeddable?dt(t):ht(t),i=o.windows.open({id:`project:${t.slug}`,title:`project — ${t.name}`,content:n,width:720,height:500});i.bodyEl.style.padding="0",o.terminal.print(`opened: ${t.name}`,"dim")}function we(o){const e=document.createElement("div");e.className="project__bar";const t=document.createElement("span");t.className="project__dots",t.textContent="◦ ◦ ◦";const n=document.createElement("span");return n.className="project__url",n.textContent=o,e.append(t,n),e}const ct=1e4;function dt(o){const e=document.createElement("div");e.className="project",e.append(we(o.url));const t=document.createElement("div");t.className="project__stage";const n=document.createElement("iframe");n.className="project__frame",n.src=o.url,n.loading="lazy",n.referrerPolicy="no-referrer",n.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),n.title=o.name;const i=document.createElement("div");i.className="project__loading";const s=document.createElement("span");s.className="project__loading-label",s.textContent=`loading ${o.name}…`;const a=document.createElement("span");a.className="project__loadbar",a.append(document.createElement("i")),i.append(s,a);let r=!1;const l=()=>{r||(r=!0,window.clearTimeout(c),i.classList.add("is-done"),window.setTimeout(()=>i.remove(),400))};n.addEventListener("load",l);const c=window.setTimeout(()=>{if(r)return;r=!0,i.classList.add("is-error"),s.textContent="this is taking too long — the site may not want to be framed.",a.remove();const d=document.createElement("a");d.className="project__open",d.href=o.url,d.target="_blank",d.rel="noreferrer noopener",d.textContent="open in new tab ↗",i.append(d)},ct);return t.append(n,i),e.append(t),e}function ht(o){const e=document.createElement("div");e.className="project project--fallback",e.append(we(o.url));const t=document.createElement("div");t.className="project__fallback",t.innerHTML=`
    <p class="muted">this one can't be embedded (${o.kind==="ios"?"iOS / App&nbsp;Store":"the site blocks framing"}).</p>
    <p><strong>${o.name}</strong></p>
    <p class="muted">${o.blurb}</p>
  `;const n=document.createElement("a");return n.className="project__open",n.href=o.url,n.target="_blank",n.rel="noreferrer noopener",n.textContent="open in new tab ↗",t.append(n),e.append(t),e}function ut(){const o=new Set;for(const e of L)for(const t of e.tags??[])t!=="placeholder"&&o.add(t);return[...o].sort()}function mt(o,e){const t=document.createElement("button");t.className="pgrid__card",t.type="button";const n=document.createElement("span");n.className="pgrid__thumb",n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="pgrid__initial",i.textContent=e.name.slice(0,1).toUpperCase(),n.append(i);const s=document.createElement("strong");s.className="pgrid__name",s.textContent=e.name;const a=document.createElement("span");a.className="pgrid__blurb",a.textContent=e.blurb;const r=document.createElement("span");return r.className="pgrid__meta",r.textContent=[e.kind,...(e.tags??[]).filter(l=>l!=="placeholder"&&l!==e.kind)].join(" · "),t.append(n,s,a,r),t.addEventListener("click",()=>ye(o,e.slug)),t}function be(o){const e=document.createElement("div");e.className="pgrid";const t=document.createElement("div");t.className="pgrid__filters";const n=document.createElement("div");n.className="pgrid__grid";const i=new Map;for(const c of L)i.set(c,mt(o,c));let s="all";const a=[],r=c=>{s=c;for(const u of a)u.classList.toggle("is-active",u.dataset.tag===c);let d=0;for(const[u,g]of i){const w=c==="all"||(u.tags??[]).includes(c)||u.kind===c;g.hidden=!w,w&&d++}l.hidden=d>0};for(const c of["all",...ut()]){const d=document.createElement("button");d.className="pgrid__chip",d.type="button",d.dataset.tag=c,d.textContent=c,d.addEventListener("click",()=>r(c)),a.push(d),t.append(d)}const l=document.createElement("p");l.className="pgrid__empty muted",l.textContent="nothing tagged that (yet).",l.hidden=!0;for(const c of i.values())n.append(c);e.append(t,n,l),r(s),o.windows.open({id:"projects",title:"projects",content:e,width:560,height:420}),o.terminal.print(`opened: projects (${L.length})`,"dim")}const re=1.4,le=.72,pt=2.4,ft=3,F=.75,gt=1.2,yt=.9,wt=5,bt=4,vt=3,kt=.8,Et=4,_t=4,St=8,j=new Set(["a","an","the","is","are","was","were","be","been","being","do","does","did","of","to","in","on","for","and","or","but","with","at","by","from","as","it","its","this","that","these","those","i","you","he","she","they","we","me","him","her","them","his","your","my","our","their","what","which","who","whom","how","when","where","why","can","could","would","should","will","shall","have","has","had","about","tell","know","any","some","into","so","u","get","got","give","us","please","hey","im"]),W=new Set(["work","use","using","make","made","build","built","run","get","got","thing","stuff","look","like","happen","involve","mean","explain","describe","show"]);function G(o){return o.length<=3?o:o.endsWith("ies")?`${o.slice(0,-3)}y`:o.endsWith("ing")&&o.length>5?o.slice(0,-3):o.endsWith("ed")&&o.length>4?o.slice(0,-2):o.endsWith("s")&&!o.endsWith("ss")?o.slice(0,-1):o}function A(o){return o.toLowerCase().split(/[^a-z0-9+#.]+/).map(e=>e.replace(/^[.]+|[.]+$/g,"")).filter(e=>e.length>1&&!j.has(e)).map(G).filter(e=>!j.has(e))}const q=o=>[...new Set(o)];function I(o){return o.toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim()}const T=o=>` ${o} `;function Lt(o,e,t){if(Math.abs(o.length-e.length)>t)return t+1;let n=null,i=Array.from({length:e.length+1},(s,a)=>a);for(let s=1;s<=o.length;s++){const a=[s];let r=s;for(let l=1;l<=e.length;l++){const c=o[s-1]===e[l-1]?0:1;let d=Math.min(i[l]+1,a[l-1]+1,i[l-1]+c);n&&s>1&&l>1&&o[s-1]===e[l-2]&&o[s-2]===e[l-1]&&(d=Math.min(d,n[l-2]+1)),a.push(d),d<r&&(r=d)}if(r>t)return t+1;n=i,i=a}return i[e.length]}const Ct=new Set(["about","work","works","fun","intro","bio","apps"]);function Tt(o){return o.includes(" ")?!0:o.length>=5&&!Ct.has(o)&&!j.has(o)}function xt(o,e){const t=T(o),n=e.aliases[0];if(n&&t.includes(T(n))||t.includes(T(e.label)))return!0;for(const i of e.namePhrases)if(i.includes(" ")&&t.includes(T(i)))return!0;return!1}const ve="",At=/\b(?:[A-Za-z]\.){2,}|\b(?:prof|dr|mr|mrs|ms|sr|jr|st|vs|etc|fig|no|ph|approx|e\.g|i\.e|a\.m|p\.m)\.|\b[A-Z]\.(?=\s+[A-Z0-9])/gi,Mt=o=>o.replace(At,e=>e.replace(/\./g,ve)),It=o=>o.replace(new RegExp(ve,"g"),".");function Nt(o){const e=[];for(const t of o.split(/\n{2,}/)){const n=Mt(t.replace(/\s*\n\s*/g," ").trim());if(n)for(const i of n.split(/(?<=[.!?])\s+(?=[A-Z0-9("'*])/)){const s=It(i).trim();s&&e.push({text:s,terms:new Set(A(s))})}}return e}function Pt(o){const e=o[0]??"topic";return e.includes(" ")?o.filter(n=>!n.includes(" ")&&n.length>=3&&!j.has(n)).sort((n,i)=>n.length-i.length)[0]??e:e}function Rt(o){const e=[];let t=!1;for(const n of o.split(`
`)){if(t)if(n.trim()===""||/^#{1,3}\s/.test(n))t=!1;else continue;if(/^\s*todo\b/i.test(n)){t=!0;continue}e.push(n)}return e.join(`
`)}function $t(o){const t=Rt(o.replace(/\r\n?/g,`
`).replace(/<!--[\s\S]*?-->/g,"")).split(`
`),n=[];let i="",s=[];const a=()=>{i&&s.join("").trim()&&n.push({heading:i,body:s})};for(const r of t){const l=/^#{1,3}\s+(.*)$/.exec(r);l?(a(),i=l[1].trim(),s=[]):i&&s.push(r)}return a(),n.map(({heading:r,body:l})=>{const c=r.split(/\s*[/|]\s*/),d=new Set(c.filter(h=>/!\s*$/.test(h)).flatMap(h=>A(I(h)))),u=q(c.map(h=>I(h)).filter(Boolean)),g=Nt(at(l.join(`
`)).trim()),w=new Map;let k=0;for(const h of g)for(const f of A(h.text))w.set(f,(w.get(f)??0)+1),k++;return{label:Pt(u),aliases:u,namePhrases:u.filter(Tt).filter(h=>h.includes(" ")||!d.has(G(h))),aliasTokens:new Set(u.flatMap(h=>A(h))),priorityTokens:d,nameTokens:new Set(A(u[0]??"")),sentences:g,tf:w,length:k}})}const zt=/^(tell me more|more|more please|go on|continue|keep going|say more|elaborate|expand|and\??|and then\??|what else\??|anything else\??|\.\.\.|…)$/,Ot=/^(yes|yeah|yep|yup|ya|sure|ok|okay|okie|mhm|please|pls|go ahead|do it|hit me|why not)$/,Bt=/\b(it|its|it's|that|this|they|them|those|these|the (app|project|tool|thing|system|paper|model|one|setup))\b/,Ft=/^(does|do|did|is|are|was|were|has|have|had|can|could|will|would)\b/,jt=/\b(which|what|who|list|all|any|anything|every|everything|how many|uses?d?|using|built with|written in|made with|know[sn]?|familiar)\b/,Gt=new Set(["first","second","third","one","two","three","last","latter","former","next","other","previous","previou"]),Ht=["team","guid","develop","coordinator"],Ut=/\b(project|app|apps|tool|paper|research|thing|one|work)\b/;class Dt{chunks;idf=new Map;df=new Map;avgdl;allAliasTokens=new Set;vocab=[];topic=null;pending=null;offeredMore=!1;constructor(e){this.chunks=$t(e);const t=this.chunks.length||1;let n=0;for(const i of this.chunks){n+=i.length;for(const s of new Set([...i.tf.keys(),...i.aliasTokens]))this.df.set(s,(this.df.get(s)??0)+1);for(const s of i.aliasTokens)this.allAliasTokens.add(s)}for(const[i,s]of this.df)this.idf.set(i,Math.log(1+(t-s+.5)/(s+.5)));this.avgdl=n/t;for(const[i,s]of this.idf)i.length>=4&&s>=.5&&this.vocab.push({token:i,idf:s})}async ask(e,t){const n=e.trim(),i=n.toLowerCase(),s=i.replace(/[!.?]+$/,"").trim(),a=Wt(i);if(a)return{text:a,grounded:!0};if(this.pending){const m=this.resolveClarify(s);if(this.pending=null,m!=null)return this.answerFrom(this.chunks[m],m,[])}const r=this.offeredMore;this.offeredMore=!1;const l=q(A(n));if((zt.test(s)||r&&Ot.test(s)||l.length===0)&&this.topic)return this.continueTopic();if(l.length===0)return this.reprompt();if(this.topic&&l.every(m=>Gt.has(m)))return this.continueTopic();const d=[],u=l.map(m=>{if(this.idf.has(m))return m;const y=this.correct(m);return y&&d.push(`reading "${m}" as "${y}"`),y??m}),g=I(n),w=this.tryCompound(n);if(w)return this.decorate(w,d);const k=this.rank(u,g),h=k[0],f=h!=null&&(h.phraseHit||h.bestIdf>=F||h.matched>=2&&h.idfSum>=gt),b=u.some(m=>!W.has(m)&&(this.idf.get(m)??0)>=F&&this.chunks.some(y=>y.nameTokens.has(m)))||this.chunks.some(m=>xt(g,m)),E=/\bwho\b/.test(i)?Ht:[];if(jt.test(i)){const m=this.tryAggregate(i,u);if(m)return this.decorate(m,d)}if(this.topic&&Bt.test(i)&&!b){const m=this.topic;return this.decorate(this.answerFrom(this.chunks[m.index],m.index,u,E),d)}if(f&&!h.phraseHit&&!b){const m=k[1];if(m&&m.index!==h.index&&m.score>=h.score*kt&&m.matched>0&&Ut.test(i))return this.pending={options:[{index:h.index,label:h.chunk.label},{index:m.index,label:m.chunk.label}]},{text:`that could mean ${h.chunk.label} or ${m.chunk.label} — which one?`,grounded:!0}}if(f){const m=this.decorate(this.answerFrom(h.chunk,h.index,u,E),d),y=h.priorityTerm;if(y&&!b){const p=k.find(v=>v.index!==h.index&&(v.chunk.aliasTokens.has(y)||(v.chunk.tf.get(y)??0)>0));if(p){const v=i.split(/[^a-z0-9+#.]+/).filter(S=>S.length>1).find(S=>G(S.replace(/^[.]+|[.]+$/g,""))===y)??y;m.text+=`

(${v} also comes up in ${p.chunk.label} — ask about ${p.chunk.label} if that's what you meant.)`}}return m}return Ft.test(s)?{text:`hmm, nothing in my notes about that, so i can't confirm either way. i can talk about: ${this.topicList()}.`,grounded:!1}:this.fallback()}rank(e,t){return this.chunks.map((n,i)=>this.scoreChunk(n,i,e,t)).sort((n,i)=>i.score-n.score)}scoreChunk(e,t,n,i){let s=0,a=0,r=0,l=0,c=null;for(const u of n){const g=this.idf.get(u)??0,w=e.tf.get(u)??0,k=w===0?0:w*(re+1)/(w+re*(1-le+le*(e.length/this.avgdl))),h=g*k,f=e.aliasTokens.has(u)?g*pt:0,b=e.priorityTokens.has(u)?Et:0;b>0&&(c=u),(h>0||f>0)&&(a++,l+=g,g>r&&(r=g)),s+=h+f+b}let d=!1;for(const u of e.namePhrases)T(i).includes(T(u))&&(s+=ft,d=!0);return{chunk:e,index:t,score:s,matched:a,bestIdf:r,idfSum:l,phraseHit:d,priorityTerm:c}}correct(e){if(e.length<5)return null;const t=e.length>=7?2:1;let n=null;for(const i of this.vocab){if(i.token[0]!==e[0])continue;const s=Lt(e,i.token,t);s>t||(!n||s<n.dist||s===n.dist&&i.idf>n.idf)&&(n={token:i.token,dist:s,idf:i.idf})}return n?.token??null}tryCompound(e){const t=e.split(/\s*(?:\band\b|\bvs\.?\b|\bversus\b|[;,&])\s*/i).map(r=>r.trim()).filter(r=>r.length>=3);if(t.length<2||t.length>3)return null;const n=[];for(const r of t){const l=q(A(r)).map(d=>this.idf.has(d)?d:this.correct(d)??d);if(l.length===0)return null;const c=this.rank(l,I(r))[0];if(!c||!(c.phraseHit||c.bestIdf>=F))return null;n.push({part:r,r:c,terms:l})}if(new Set(n.map(r=>r.r.index)).size<2)return null;const s=[],a=[];for(const r of n){const l=this.answerFrom(r.r.chunk,r.r.index,r.terms);s.push(`${r.r.chunk.label}: ${l.text}`),a.push(r.r.chunk.label)}return this.offeredMore=!1,{text:s.join(`

`).replace(/ — say "more" for the rest\./g,""),grounded:!0,sources:a}}tryAggregate(e,t){let n=null;for(const r of t){const l=this.df.get(r)??0,c=this.idf.get(r)??0;l>=2&&l<=St&&c>=F&&!this.allAliasTokens.has(r)&&!W.has(r)&&(!n||c>n.idf)&&(n={term:r,idf:c})}if(!n)return null;const i=e.split(/[^a-z0-9+#.]+/).filter(r=>r.length>1).find(r=>G(r.replace(/^[.]+|[.]+$/g,""))===n.term)??n.term,s=this.chunks.map((r,l)=>({chunk:r,index:l,tf:r.tf.get(n.term)??0})).filter(r=>r.tf>0).sort((r,l)=>l.tf-r.tf).slice(0,_t);if(s.length<2)return null;const a=s.map(r=>{const l=this.extract(r.chunk,[n.term]).slice(0,1),c=l.length>0?r.chunk.sentences[l[0]].text:"";return`${r.chunk.label}: ${c}`});return this.topic=null,{text:`${i} shows up in ${s.length} of my notes —

${a.join(`

`)}`,grounded:!0,sources:s.map(r=>r.chunk.label)}}resolveClarify(e){const t=this.pending.options,n=T(I(e));for(const i of t)if(n.includes(T(I(i.label))))return i.index;return/\b(first|former|1st|1)\b/.test(e)?t[0].index:/\b(second|latter|2nd|2)\b/.test(e)?t[1]?.index??null:/\b(both|either|all)\b/.test(e)?t[0].index:null}decorate(e,t){return t.length===0||!e.grounded?e:{...e,text:`(${t.join(", ")}) ${e.text}`}}answerFrom(e,t,n,i=[]){const s=[...n.filter(c=>!e.nameTokens.has(c)&&!W.has(c)&&(this.idf.get(c)??0)>=yt),...i];if(s.length>0){const c=this.extract(e,s);if(c.length>0)return this.topic={index:t,shown:new Set(c)},{text:c.map(d=>e.sentences[d].text).join(" "),grounded:!0,sources:[e.label]}}const a=e.sentences.slice(0,wt),r=new Set(a.map((c,d)=>d));this.topic={index:t,shown:r};let l=a.map(c=>c.text).join(" ");return e.sentences.length>a.length&&(l+=' — say "more" for the rest.',this.offeredMore=!0),{text:l,grounded:!0,sources:[e.label]}}extract(e,t){const i=e.sentences.map((s,a)=>{let r=0;for(const l of t)s.terms.has(l)&&(r+=this.idf.get(l)??.5);return{i:a,sc:r}}).filter(s=>s.sc>0).sort((s,a)=>a.sc-s.sc).slice(0,vt).sort((s,a)=>s.i-a.i).map(s=>s.i);if(i.length===1){const s=i[0],a=e.sentences[s+1];a&&e.sentences[s].text.length+a.text.length<380&&/^(it|its|this|that|the |so |which |and )/i.test(a.text)&&i.push(s+1)}return i}continueTopic(){const e=this.topic,t=this.chunks[e.index],n=[];for(let a=0;a<t.sentences.length;a++)e.shown.has(a)||n.push(a);if(n.length===0)return{text:`that's everything in my notes on ${t.label}. ask me something specific — its stack, how it works, who's involved.`,grounded:!0,sources:[t.label]};const i=n.slice(0,bt);i.forEach(a=>e.shown.add(a));let s=i.map(a=>t.sentences[a].text).join(" ");return e.shown.size<t.sentences.length&&(s+=" — more?",this.offeredMore=!0),{text:s,grounded:!0,sources:[t.label]}}reprompt(){return{text:`ask me something about nafees — try: ${this.topicList()}.`,grounded:!1}}fallback(){return{text:`hmm, that's not in my notes. i can talk about: ${this.topicList()}.`,grounded:!1}}topicList(){return this.chunks.slice(0,8).map(e=>e.label).join(", ")}}function Wt(o){const e=o.replace(/[!.?]+$/,"").trim();return/^(hi|hey|hello|yo|sup|howdy|hiya|heya|hii+|hey there|good (morning|evening|afternoon))\b/.test(e)?`hey! i'm liffy — nafees's terminal sidekick. ask me anything about him. try: "what does he build?"`:/^(thanks|thank you|thx|ty|tysm|appreciate it|cheers|nice|cool|awesome|great)\b/.test(e)?"anytime :)":/^(wow+|woah|whoa|nice+|cool+|lol|lmao|haha+|hehe+|damn|based)\b/.test(e)?"right? ask me more.":/^(bye|cya|goodbye|see ya|see you|later|gtg|good night|gn)\b/.test(e)?"catch you later! (close the window whenever)":/\b(how are you|how's it going|hows it going|you good|wyd)\b/.test(e)?"just vibing in the terminal, waiting for questions about nafees. what do you want to know?":/(are|r) you (a )?(bot|ai|robot|real|human|person|chatgpt|claude)/.test(e)?"i'm a lil retrieval bot — no LLM, no keys. i only know what's in nafees's notes, and i answer straight from them.":/\byour (favorite|favourite|fav|opinion|thoughts?)\b/.test(e)?"i deal in facts from nafees's notes, not opinions. though between us — the cat is objectively the best part of this site.":/\b(tell|know|got|have).*(joke|something funny)\b|^joke$/.test(e)?"a chatbot with no LLM walks into a bar. that's it. that's me. i'm the joke. ask me about nafees instead.":/(who|what) are you|your name|are you liffy(?!\s*(review|the))/.test(e)?"i'm liffy, a tiny assistant that knows nafees. ask away — projects, skills, research, contact, whatever.":/^(help|what can you do|commands|options|menu|\?)$/.test(e)?'i answer questions about nafees from his notes. try: "what does he build?", "tell me about askcal", "which projects use fastapi?", or just a topic name.':/(who (made|built|created) you)/.test(e)?"nafees built me for this site — a grounded retriever over his own notes. ask me about him next.":null}const qt=`# Liffy's notes on Nafees

<!--
  This is Liffy's brain. Each \`##\`/\`###\` heading is a retrievable chunk;
  when someone asks a question, Liffy finds the best-matching section and
  reads it back. Tips:
    - Put likely question keywords in the HEADINGS (they're weighted 2x).
      Separate aliases with " / ". The FIRST alias is the topic's "name" —
      keep it a tidy single word where possible (it becomes the label).
    - End an alias with "!" (e.g. "email!") to make this section the
      DEFAULT answer for that word when it appears in several sections —
      "whats his gmail?" should mean contact info, not askcal's Gmail
      integration. The reply still points at the other section. Keep each
      keyword in ONE heading only; duplicated aliases fight each other.
    - Keep sections short and conversational — they're spoken verbatim.
    - The engine also: fixes typos against this file's vocabulary, answers
      "which projects use fastapi?" by scanning EVERY section for terms
      that aren't heading keywords, splits "askcal and tiket?" into two
      answers, and asks "did you mean A or B?" on genuine ties. So don't
      over-stuff headings — body words are findable too.
  Liffy only answers from this file; anything not here → graceful fallback.
-->

## who is nafees / who are you / about / bio / introduction / intro

I'm Nafees S, online as **lucenity0**. Third-year Computer Science & Engineering
student at B.M.S. College of Engineering (BMSCE) in Bengaluru, graduating in 2027.
I split my time between full-stack development, applied ML research, and freelance
design work under my own brand, Lucenity. Mostly I build things I actually want to
use, then spend way too long on the details.

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
simulator). Ask about any of them by name and I'll go deeper.

## liffy / what is liffy / this project / this tool / code review

You're looking at it. Liffy is an open-source, self-hosted AI-powered code review
tool (\`lucenity0/Liffy\`). Built on FastAPI, React/TypeScript, PostgreSQL, Redis,
Celery, ChromaDB, and LangChain, with GitHub OAuth for repo access — and you bring
your own LLM API key instead of routing through a hosted service. Setup included
one-command install scripts for both macOS and Windows, and Vertex AI integration
for Claude model access with prompt caching.

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

## education / study / college / university / school / degree / cgpa / gpa / graduate / graduation

B.E. in Computer Science & Engineering at B.M.S. College of Engineering
(BMSCE), Bengaluru — CGPA 8.21, expected June 2027. Before that, Narayana PU
College, 12th, Karnataka State Board, 94.33%, May 2023.

## location / living / house / address / lives where / where does he live / visit / wherabouts / meet him / meeting

Nafees's location is private.. rather i don't know his whereabouts too. For now, he resides as me in this pixel world !

## age / how old / birthday / born / birthdate

His notes don't say — he keeps numbers like that off the record. All I can
tell you is he's a third-year CSE student graduating in 2027; you can do the
math from there if you really must.

## experience / jobs / internships / work history / roles

Graphic Designer at Clearly Blue Pvt Ltd — still affiliated with them on a
freelance basis. Beyond that, most of the hands-on experience comes from
research (the hateful-meme and traffic-signal projects), freelance design work
under Lucenity, and shipping full products solo (Liffy, Askcal, Tiket,
Schedulr). Currently prepping for placements and research program applications.

## leadership / fest / event / phase shift / utsav / coordinator / campus

Senior Coordinator for Phase Shift 2025 at BMSCE (2024–2025), co-leading
logistics for the college's annual technical fest. Before that, Junior
Coordinator for Utsav 2025, managing the design team and on-ground event
operations.

## freelance / design work / lucenity brand / clients / lucenity.dev

Runs freelance/client design work under the Lucenity brand (lucenity.dev),
mostly using prompt engineering with AI design tools as the working method.
Brand identity itself is Cormorant Garamond wordmark, a warm ink/off-white/
starlight-gold palette, and a star-chart crosshair emblem, built to hold up
across any application background.

## how he works / workflow / build process / dev habits

Prefers phased development with git checkpoints at each phase boundary,
verifying state directly before resuming a coding session rather than trusting
memory of where things were left. Likes confirmation before big architectural
changes, and tends to experiment first, then formalize understanding once
something's proven out.

## contact / reach / email! / gmail! / socials / github / linkedin / instagram / discord / hire / hiring / availability / work with him

Best way in is GitHub — [github.com/lucenity0](https://github.com/lucenity0).
Email: nafees.s2005@gmail.com (secondary: 0lucenity@gmail.com).
Discord: lucenity. Instagram: @lucenity_.
LinkedIn: https://www.linkedin.com/in/nafees-s-6770712b0/

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
`;let Yt=null;const Jt=()=>Yt??=new Dt(qt),Kt=`hey, i'm liffy — nafees's lil terminal sidekick. ask me anything about him. try: "what does he build?"`,Qt=/^me+o+w+[\s.!?~]*$/i,Vt=/\b(cookie|treat)\b/i,ce="meow. mrrp. purrrr. (translation: hi. i like you. bring snacks.)";function ke(o){const e=Jt(),t=[];let n=!1;const i=document.createElement("div");i.className="liffy";const s=document.createElement("div");s.className="liffy__log",s.setAttribute("role","log"),s.setAttribute("aria-live","polite");const a=document.createElement("form");a.className="liffy__inputrow";const r=document.createElement("span");r.className="liffy__prompt",r.textContent="you>";const l=document.createElement("input");l.className="liffy__input",l.type="text",l.setAttribute("aria-label","ask liffy"),l.autocomplete="off",l.autocapitalize="off",l.spellcheck=!1,a.append(r,l),i.append(s,a);const c=()=>{s.scrollTop=s.scrollHeight},d=(b,E)=>{const m=document.createElement("div");m.className="liffy__line";const y=document.createElement("span");y.className=`liffy__who ${E}`,y.textContent=b;const p=document.createElement("span");return p.className="liffy__text",m.append(y,p),s.append(m),c(),p},u=async b=>{const E=d("liffy>","liffy__who--bot");if(_())E.textContent=b;else{const m=b.length>320?4:b.length>160?6:9;await Y(E,b,{speed:m})}c()},g=["thinking","pondering","purring","consulting the cat","rummaging through notes","recalling"];let w=0;const k=async b=>{if(n)return;if(n=!0,l.disabled=!0,d("you>","liffy__who--user").textContent=b,t.push({role:"user",text:b}),Qt.test(b)){const S=d("","liffy__who--bot");S.classList.add("liffy__thinking"),S.textContent="✳ thought for 0.0s (instinct)",t.push({role:"liffy",text:ce}),f.hop(),await u(ce),n=!1,l.disabled=!1,l.focus();return}const E=d("","liffy__who--bot");E.classList.add("liffy__thinking");const m=de(E,g[w++%g.length]);f.think(!0),_()||await x(650+Math.random()*750);const y=await e.ask(b,t),p=m.stop();f.think(!1);const v=y.sources?.length?` · read notes: ${y.sources.join(", ")}`:"";E.textContent=`✳ thought for ${Math.max(p,.1).toFixed(1)}s${v}`,t.push({role:"liffy",text:y.text}),f.bob(!0),await u(y.text),f.bob(!1),n=!1,l.disabled=!1,l.focus()};a.addEventListener("submit",b=>{b.preventDefault();const E=l.value.trim();!E||n||(l.value="",f.onSend(),k(E))});const h=o.windows.open({id:"liffy",title:"liffy — ask about nafees",content:i,width:520,height:420});h.bodyEl.style.padding="0";const f=new me({mount:i,mode:"liffy",idleFrame:"awake"});l.addEventListener("input",()=>{const b=l.value;Vt.test(b)?f.fillNow():f.onTyping(b.length)}),u(Kt),window.setTimeout(()=>l.focus(),60),o.terminal.print("opened: liffy","dim")}const Xt=`# Nafees S — résumé

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

---`;function Ee(o){const e=document.createElement("div");e.className="docs",e.innerHTML=pe(Xt);const t="/preview-b36b9ad3412f39139ec0/resume.pdf";fetch(t,{method:"HEAD"}).then(n=>{const i=n.headers.get("content-type")??"";if(!n.ok||!i.includes("pdf"))return;const s=document.createElement("div");s.className="docs__toolbar";const a=document.createElement("a");a.className="docs__download",a.href=t,a.target="_blank",a.rel="noreferrer noopener",a.textContent="↓ download PDF",s.append(a),e.prepend(s)}).catch(()=>{}),o.windows.open({id:"resume",title:"resume — nafees",content:e,width:560,height:480}),o.terminal.print("opened: resume","dim")}function M(o,e){return async t=>{if(_()){e(t);return}const n=document.createElement("div");n.className="terminal__line terminal__line--sub",t.terminal.printEl(n);const i=de(n,o);await x(320+Math.random()*260),i.stop(),n.remove(),e(t)}}function Zt(){const o=[],e=t=>{t.terminal.print("available commands:");for(const n of o.filter(i=>!i.hidden)){const i=(n.usage??n.name).padEnd(18);t.terminal.print(`  ${i}${n.summary}`,"dim")}};return o.push({name:"help",summary:"list available commands",run:e},{name:"about",summary:"who is lucenity",run:M("waking about",fe)},{name:"resume",summary:"view my résumé",run:M("dusting off the résumé",Ee)},{name:"projects",summary:"browse my work",run:M("indexing projects",be)},{name:"project",summary:"open a specific project",usage:"project <slug>",run:async t=>{const n=t.args[0];if(!n){t.terminal.print("usage: project <slug>","dim"),t.terminal.print(`slugs: ${L.map(i=>i.slug).join(", ")}`,"sub");return}await M(`spinning up ${n}`,i=>ye(i,n))(t)},complete:t=>t.length>1?[]:L.map(n=>n.slug)},{name:"contact",summary:"how to reach me",run:M("opening channels",ge)},{name:"liffy",summary:"chat with liffy, my lil assistant",run:M("poking liffy awake",ke)},{name:"clear",summary:"clear the screen",run:t=>t.terminal.clear()},{name:"whoami",summary:"print the current session identity",run:t=>t.terminal.print("visitor@lucenity — guest session","dim")},{name:"cat",summary:"",hidden:!0,run:t=>{const n=J("cat terminal__cat");t.terminal.printEl(n),t.terminal.print("the cat is asleep. it is always asleep. =^..^=","dim")}},{name:"sudo",summary:"",hidden:!0,run:t=>t.terminal.print("nice try. you're a guest here :)","dim")},{name:"git",usage:"git <subcommand>",summary:"",hidden:!0,run:t=>{const n=t.args[0];if(!n){t.terminal.print("usage: git <subcommand>","dim"),t.terminal.print("subcommands: init, clone","sub");return}if(n==="init")t.terminal.print("Nafees's Github! : https://github.com/lucenity0","dim");else if(n==="clone"){const i=t.args[1];if(!i){t.terminal.print("usage: git clone <slug>","dim"),t.terminal.print(`slugs: ${L.map(a=>a.slug).join(", ")}`,"sub");return}if(!L.find(a=>a.slug===i)){t.terminal.print(`error: no project found with slug '${i}'`,"dim"),t.terminal.print(`valid slugs: ${L.map(a=>a.slug).join(", ")}`,"sub");return}t.terminal.print(`Cloning into '${i}'...`,"dim"),t.terminal.print(`remote: https://github.com/lucenity0/${i}.git`,"sub")}},complete:t=>t.length<=1?["init","clone"]:t[0]==="clone"&&t.length===2?L.map(n=>n.slug):[]}),o}function en(o,e,t){const n=document.createElement("div");n.className="gui";const i=[{id:"about",label:"about.txt",glyph:"≡",kind:"file",open:fe},{id:"projects",label:"projects",glyph:"",kind:"folder",open:be},{id:"resume",label:"resume.pdf",glyph:"PDF",kind:"file",open:Ee},{id:"liffy",label:"liffy",glyph:"=^..^=",kind:"app",open:ke},{id:"contact",label:"contact",glyph:"@",kind:"file",open:ge},{id:"tty",label:"terminal",glyph:">_",kind:"sys",open:()=>t.set("tty")}],s=document.createElement("div");s.className="gui__icons";for(const p of i){const v=document.createElement("button");v.type="button",v.className=`gui__icon gui__icon--${p.kind}`;const S=document.createElement("span");S.className="gui__icon-art",S.textContent=p.glyph;const H=document.createElement("span");H.className="gui__icon-label",H.textContent=p.label,v.append(S,H),v.addEventListener("click",()=>p.open(e)),s.append(v)}const a=document.createElement("div");a.className="gui__taskbar";const r=document.createElement("button");r.type="button",r.className="gui__start",r.textContent="⌂ lucenity",r.setAttribute("aria-haspopup","true"),r.setAttribute("aria-expanded","false");const l=document.createElement("div");l.className="gui__menu",l.hidden=!0;for(const p of i){const v=document.createElement("button");v.type="button",v.className="gui__menu-item",v.textContent=p.label,v.addEventListener("click",()=>{c(),p.open(e)}),l.append(v)}const c=()=>{l.hidden=!0,r.setAttribute("aria-expanded","false")};r.addEventListener("click",p=>{p.stopPropagation(),l.hidden=!l.hidden,r.setAttribute("aria-expanded",String(!l.hidden))});const d=p=>{!l.hidden&&!l.contains(p.target)&&c()};document.addEventListener("click",d);const u=document.createElement("div");u.className="gui__tasks";const g=document.createElement("div");g.className="gui__tray";const w=document.createElement("span");w.className="gui__tray-cat",w.textContent="=^..^=",w.title="the cat is asleep. it is always asleep.";const k=document.createElement("span");k.className="gui__clock";const h=()=>{const p=new Date;k.textContent=`${String(p.getHours()).padStart(2,"0")}:${String(p.getMinutes()).padStart(2,"0")}`};h();const f=window.setInterval(h,15e3);g.append(w,k),a.append(r,u,g),n.append(s,l,a),o.append(n);const b=()=>{u.textContent="";for(const p of e.windows.list()){const v=document.createElement("button");v.type="button",v.className="gui__task",p.minimized?v.classList.add("is-min"):p.el.classList.contains("is-active")&&v.classList.add("is-on"),v.textContent=p.title,v.title=p.minimized?`restore ${p.title}`:p.title,v.addEventListener("click",()=>{p.minimized?e.windows.restore(p.id):p.el.classList.contains("is-active")?e.windows.minimize(p.id):e.windows.focus(p.id)}),u.append(v)}};let E=0;const m=()=>{cancelAnimationFrame(E),E=requestAnimationFrame(b)},y=new MutationObserver(p=>{p.every(v=>n.contains(v.target))||m()});return y.observe(o,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style"]}),b(),{destroy(){y.disconnect(),cancelAnimationFrame(E),window.clearInterval(f),document.removeEventListener("click",d),n.remove()}}}const z=document.getElementById("app");if(!z)throw new Error("#app mount element not found");const _e=new Ae(z),Q=new Le;Q.registerAll(Zt());const N=new Oe(z,Q,_e),R=new st,tn={terminal:N,windows:_e,args:[],flags:{},raw:""};let P=null;const Se=()=>{R.current==="gui"&&!P?P=en(z,tn,R):R.current==="tty"&&P&&(P.destroy(),P=null,N.focusInput())};R.onChange(Se);Se();Q.register({name:"gui",summary:"switch to the GUI desktop",run:o=>{o.terminal.print("switching to gui — the toggle brings you back.","dim"),R.set("gui")}});je(N).then(()=>{const o=it(z);N.onTyping=e=>o.companion.onTyping(e),N.onSend=()=>o.companion.onSend(),N.onClear=()=>o.restore()});
//# sourceMappingURL=index-DkHse2YZ.js.map
