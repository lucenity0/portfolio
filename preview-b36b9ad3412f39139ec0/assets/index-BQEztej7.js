(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();class pe{map=new Map;register(e){this.map.set(e.name.toLowerCase(),e)}registerAll(e){for(const t of e)this.register(t)}get(e){return this.map.get(e.toLowerCase())}all(){return[...this.map.values()]}visible(){return this.all().filter(e=>!e.hidden)}names(){return[...this.map.keys()]}}const fe=["e","s","se"];function ge(s){const e=document.createElement("section");e.className="window brackets is-opening",e.setAttribute("role","dialog"),e.setAttribute("aria-label",s);const t=document.createElement("header");t.className="window__bar";const n=document.createElement("span");n.className="window__dots";const i=document.createElement("span");i.className="window__dot";const o=document.createElement("span");o.className="window__dot";const a=document.createElement("span");a.className="window__dot",n.append(i,o,a);const r=document.createElement("span");r.className="window__title",r.textContent=s;const l=document.createElement("span");l.className="window__controls";const c=document.createElement("button");c.className="window__btn window__btn--min",c.type="button",c.title="minimize",c.setAttribute("aria-label","minimize window"),c.textContent="–";const d=document.createElement("button");d.className="window__btn window__btn--max",d.type="button",d.title="maximize",d.setAttribute("aria-label","maximize window"),d.textContent="□";const h=document.createElement("button");h.className="window__btn window__btn--close",h.type="button",h.title="close",h.setAttribute("aria-label","close window"),h.textContent="×",l.append(c,d,h),t.append(n,r,l);const p=document.createElement("div");p.className="window__body",e.append(t,p);const g=fe.map(b=>{const m=document.createElement("span");return m.className=`window__resize window__resize--${b}`,m.dataset.dir=b,e.append(m),m});return{el:e,barEl:t,bodyEl:p,closeBtn:h,minimizeBtn:c,maximizeBtn:d,resizeHandles:g}}class ye{root;folderBtn;countEl;listEl;items=new Map;open=!1;constructor(e){this.root=document.createElement("div"),this.root.className="tray",this.root.hidden=!0,this.folderBtn=document.createElement("button"),this.folderBtn.className="tray__folder",this.folderBtn.type="button",this.folderBtn.setAttribute("aria-label","minimized windows"),this.folderBtn.setAttribute("aria-haspopup","true"),this.folderBtn.setAttribute("aria-expanded","false"),this.folderBtn.innerHTML='<span class="tray__glyph" aria-hidden="true">▚</span><span class="tray__count">0</span>',this.countEl=this.folderBtn.querySelector(".tray__count"),this.listEl=document.createElement("div"),this.listEl.className="tray__list",this.listEl.hidden=!0,this.folderBtn.addEventListener("click",()=>this.toggle()),this.root.append(this.folderBtn,this.listEl),e.append(this.root)}add(e,t,n){this.items.set(e,{title:t,onRestore:n}),this.render()}remove(e){this.items.delete(e),this.items.size===0&&(this.open=!1),this.render()}has(e){return this.items.has(e)}toggle(){this.open=!this.open&&this.items.size>0,this.render()}render(){const e=this.items.size;this.root.hidden=e===0,this.countEl.textContent=String(e),this.listEl.hidden=!this.open||e===0,this.folderBtn.classList.toggle("is-open",this.open),this.folderBtn.setAttribute("aria-expanded",String(this.open&&e>0)),this.listEl.replaceChildren();for(const[t,n]of this.items){const i=document.createElement("button");i.className="tray__item",i.type="button",i.textContent=n.title,i.addEventListener("click",()=>{n.onRestore(),this.open=!1,this.render()}),this.listEl.append(i)}}}const k=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,_=s=>new Promise(e=>window.setTimeout(e,s));async function F(s,e,t={}){const{speed:n=18,delay:i=0}=t;if(k()){s.textContent=e;return}i>0&&await _(i),s.textContent="";for(const o of e)s.textContent+=o,await _(n)}function x(s,e){k()||(s.classList.add(e),s.addEventListener("animationend",()=>s.classList.remove(e),{once:!0}))}const U=["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];function ie(s,e){const t=performance.now();let n=null;if(k())s.textContent=`${e}…`;else{let i=0;const o=()=>{const a=U[i%U.length],r=".".repeat((i>>2)%4);s.textContent=`${a} ${e}${r}`,i++};o(),n=window.setInterval(o,90)}return{stop(){return n!==null&&window.clearInterval(n),(performance.now()-t)/1e3}}}const D={width:420,height:300},W=260,q=160,I=12;class we{root;tray;records=new Map;minimized=new Set;mru=[];topZ=100;spawnCount=0;constructor(e){this.root=e,this.tray=new ye(e)}open(e){const t=e.singleton??!0,n=this.records.get(e.id);if(t&&n)return this.minimized.has(e.id)?this.restore(e.id):n.instance.focus(),n.instance;const i=ge(e.title),{el:o,bodyEl:a,barEl:r,closeBtn:l,minimizeBtn:c,maximizeBtn:d,resizeHandles:h}=i,p=Math.max(W,this.root.clientWidth-16),g=Math.max(q,this.root.clientHeight-16),b=Math.min(e.width??D.width,p),m=Math.min(e.height??D.height,g);o.style.width=`${b}px`,o.style.height=`${m}px`;const f=this.spawnCount++%6*26,w=e.x??Math.max(8,this.root.clientWidth/2-b/2+f),v=e.y??Math.max(8,this.root.clientHeight/2-m/2+f);o.style.left=`${Math.min(w,Math.max(8,this.root.clientWidth-b-8))}px`,o.style.top=`${Math.min(v,Math.max(8,this.root.clientHeight-m-8))}px`,typeof e.content=="string"?a.textContent=e.content:a.appendChild(e.content);const u={id:e.id,el:o,bodyEl:a,close:()=>this.close(e.id),focus:()=>this.focus(e.id)};return l.addEventListener("click",y=>{y.stopPropagation(),this.close(e.id)}),c.addEventListener("click",y=>{y.stopPropagation(),this.minimize(e.id)}),d.addEventListener("click",y=>{y.stopPropagation(),this.toggleMaximize(e.id)}),r.addEventListener("dblclick",y=>{y.target.closest(".window__dot, .window__btn")||this.toggleMaximize(e.id)}),o.addEventListener("pointerdown",()=>this.focus(e.id)),o.addEventListener("keydown",y=>{y.key!=="Escape"||y.target.closest("input, textarea, select, [contenteditable]")||(y.stopPropagation(),this.close(e.id))}),this.enableDrag(o,r),this.enableResize(e.id,o,h),this.records.set(e.id,{instance:u,el:o,title:e.title}),this.root.appendChild(o),this.focus(e.id),u}close(e){const t=this.records.get(e);if(!t)return;this.records.delete(e);const n=this.minimized.delete(e);if(this.mru=this.mru.filter(i=>i!==e),this.tray.has(e)&&this.tray.remove(e),k()||n){t.el.remove();return}t.el.classList.add("is-closing"),t.el.addEventListener("animationend",()=>t.el.remove(),{once:!0}),window.setTimeout(()=>t.el.remove(),600)}toggleMaximize(e){const t=this.records.get(e);if(!t||this.minimized.has(e))return;if(k()||(t.el.classList.add("is-snapping"),window.setTimeout(()=>t.el.classList.remove("is-snapping"),300)),t.savedRect){const i=t.savedRect;t.el.style.left=i.left,t.el.style.top=i.top,t.el.style.width=i.width,t.el.style.height=i.height,delete t.savedRect,t.el.classList.remove("is-maximized")}else t.savedRect={left:t.el.style.left,top:t.el.style.top,width:t.el.style.width,height:t.el.style.height},t.el.style.left=`${I}px`,t.el.style.top=`${I}px`,t.el.style.width=`${this.root.clientWidth-I*2}px`,t.el.style.height=`${this.root.clientHeight-I*2}px`,t.el.classList.add("is-maximized");const n=t.el.querySelector(".window__btn--max");if(n){const i=t.el.classList.contains("is-maximized");n.textContent=i?"❐":"□",n.title=i?"restore":"maximize",n.setAttribute("aria-label",i?"restore window":"maximize window")}this.focus(e)}focus(e){const t=this.records.get(e);if(t){for(const[n,i]of this.records)i.el.classList.toggle("is-active",n===e&&!this.minimized.has(n));t.el.style.zIndex=String(++this.topZ),this.mru=[e,...this.mru.filter(n=>n!==e)]}}cycle(e){const t=this.mru.filter(i=>this.records.has(i)&&!this.minimized.has(i));if(t.length<2)return;const n=e===1?t[1]:t[t.length-1];n&&this.focus(n)}get(e){return this.records.get(e)?.instance}minimize(e){const t=this.records.get(e);if(!(!t||this.minimized.has(e))){if(this.minimized.add(e),t.el.classList.remove("is-active"),this.tray.add(e,t.title,()=>this.restore(e)),k()){t.el.style.display="none";return}t.el.classList.add("is-minimizing"),t.el.addEventListener("animationend",()=>{t.el.style.display="none",t.el.classList.remove("is-minimizing")},{once:!0})}}restore(e){const t=this.records.get(e);t&&(this.minimized.delete(e),this.tray.has(e)&&this.tray.remove(e),t.el.style.display="",t.el.classList.remove("is-minimizing"),this.focus(e),x(t.el,"is-opening"))}enableDrag(e,t){let n=0,i=0,o=0,a=0,r=!1;const l=d=>{if(!r)return;const h=o+(d.clientX-n),p=a+(d.clientY-i);e.style.left=`${Math.min(Math.max(h,-e.clientWidth+80),this.root.clientWidth-80)}px`,e.style.top=`${Math.min(Math.max(p,0),this.root.clientHeight-40)}px`},c=d=>{r=!1,t.releasePointerCapture?.(d.pointerId),window.removeEventListener("pointermove",l),window.removeEventListener("pointerup",c)};t.addEventListener("pointerdown",d=>{d.target.closest(".window__btn")||e.classList.contains("is-maximized")||(r=!0,n=d.clientX,i=d.clientY,o=e.offsetLeft,a=e.offsetTop,t.setPointerCapture?.(d.pointerId),window.addEventListener("pointermove",l),window.addEventListener("pointerup",c))})}enableResize(e,t,n){for(const i of n)i.addEventListener("pointerdown",o=>{if(o.preventDefault(),o.stopPropagation(),t.classList.contains("is-maximized"))return;this.focus(e);const a=i.dataset.dir??"se",r=o.clientX,l=o.clientY,c=t.offsetWidth,d=t.offsetHeight,h=g=>{a.includes("e")&&(t.style.width=`${Math.max(W,c+(g.clientX-r))}px`),a.includes("s")&&(t.style.height=`${Math.max(q,d+(g.clientY-l))}px`)},p=g=>{i.releasePointerCapture?.(g.pointerId),window.removeEventListener("pointermove",h),window.removeEventListener("pointerup",p)};i.setPointerCapture?.(o.pointerId),window.addEventListener("pointermove",h),window.addEventListener("pointerup",p)})}}function J(s){const e=[];let t="",n=!1,i=null;for(let o=0;o<s.length;o++){const a=s[o];if(i){a===i?i=null:i==='"'&&a==="\\"&&(s[o+1]==='"'||s[o+1]==="\\")?t+=s[++o]:t+=a;continue}if(a==="\\"&&o+1<s.length){t+=s[++o],n=!0;continue}if(a==='"'||a==="'"){i=a,n=!0;continue}if(/\s/.test(a)){n&&(e.push(t),t="",n=!1);continue}t+=a,n=!0}return n&&e.push(t),e}function be(s){const e=[],t={};for(const n of s){const i=/^--([^=\s]+)(?:=(.*))?$/.exec(n);i?t[i[1]]=i[2]!==void 0?i[2]:!0:e.push(n)}return{args:e,flags:t}}const Y="visitor@lucenity:~$",se="lucenity:history",Q=200,ve={default:"terminal__line",dim:"terminal__line terminal__line--dim",sub:"terminal__line terminal__line--sub"};function ke(s){if(s.length===0)return"";let e=s[0];for(const t of s.slice(1)){for(;!t.startsWith(e);)e=e.slice(0,-1);if(e==="")break}return e}function Ee(s,e,t){if(Math.abs(s.length-e.length)>t)return t+1;const n=Array.from({length:s.length+1},()=>new Array(e.length+1).fill(0));for(let i=0;i<=s.length;i++)n[i][0]=i;for(let i=0;i<=e.length;i++)n[0][i]=i;for(let i=1;i<=s.length;i++)for(let o=1;o<=e.length;o++){const a=s[i-1]===e[o-1]?0:1;let r=Math.min(n[i-1][o]+1,n[i][o-1]+1,n[i-1][o-1]+a);i>1&&o>1&&s[i-1]===e[o-2]&&s[i-2]===e[o-1]&&(r=Math.min(r,n[i-2][o-2]+1)),n[i][o]=r}return n[s.length][e.length]}function Se(s,e){if(s.length<2)return null;const t=s.length>=6?2:1;let n=null;for(const i of e){const o=Ee(s,i,t);o<=t&&(!n||o<n.dist)&&(n={name:i,dist:o})}return n?.name??null}function _e(){try{const s=localStorage.getItem(se);if(!s)return[];const e=JSON.parse(s);return Array.isArray(e)?e.filter(t=>typeof t=="string"):[]}catch{return[]}}function Le(s){try{localStorage.setItem(se,JSON.stringify(s))}catch{}}class Ce{scrollEl;inputRow;inputEl;ghostBefore;caretText;ghostAfter;registry;windows;history=[];historyIndex=0;busy=!1;onTyping;onSend;onClear;constructor(e,t,n){this.registry=t,this.windows=n;const i=document.createElement("div");i.className="terminal";const o=document.createElement("div");o.className="terminal__surface";const a=document.createElement("div");a.className="terminal__scroll",a.setAttribute("role","log"),a.setAttribute("aria-live","polite");const r=document.createElement("div");r.className="terminal__input-row";const l=document.createElement("span");l.className="terminal__prompt",l.textContent=Y;const c=document.createElement("span");c.className="terminal__field";const d=document.createElement("span");d.className="terminal__ghost",d.setAttribute("aria-hidden","true");const h=document.createTextNode(""),p=document.createElement("span");p.className="caret";const g=document.createTextNode("");p.append(g);const b=document.createTextNode("");d.append(h,p,b);const m=document.createElement("input");m.className="terminal__input",m.type="text",m.setAttribute("aria-label","terminal input"),m.autocomplete="off",m.autocapitalize="off",m.spellcheck=!1,c.append(d,m),r.append(l,c),a.append(r),o.append(a),i.append(o),e.append(i),this.scrollEl=a,this.inputRow=r,this.inputEl=m,this.ghostBefore=h,this.caretText=g,this.ghostAfter=b,this.history=_e(),this.historyIndex=this.history.length,m.addEventListener("input",()=>this.renderGhost()),document.addEventListener("selectionchange",()=>{document.activeElement===this.inputEl&&this.renderGhost()}),m.addEventListener("keyup",()=>this.renderGhost()),m.addEventListener("click",()=>this.renderGhost()),m.addEventListener("keydown",f=>this.onKeydown(f)),o.addEventListener("click",()=>{(window.getSelection()?.toString()??"")===""&&this.focusInput()}),document.addEventListener("keydown",f=>{if(f.ctrlKey&&(f.key==="]"||f.key==="[")){f.preventDefault(),this.windows.cycle(f.key==="]"?1:-1);return}if(this.busy||f.metaKey||f.ctrlKey||f.altKey)return;const w=document.activeElement;w!==this.inputEl&&(w instanceof Element&&w.closest(".window")||(f.key.length===1||f.key==="Backspace"||f.key==="Enter")&&this.focusInput())}),this.renderGhost()}print(e="",t="default"){const n=this.makeLine(t);n.textContent=e,this.insertLine(n)}printEl(e){this.insertLine(e)}clear(){for(const e of[...this.scrollEl.children])e!==this.inputRow&&e.remove();this.onClear?.()}focusInput(){this.inputEl.focus()}async typeLine(e,t="default",n=12){const i=this.makeLine(t);this.insertLine(i),await F(i,e,{speed:n}),this.scrollToBottom()}setBusy(e){this.busy=e,this.inputEl.disabled=e}echoPrompt(e){const t=this.makeLine("default"),n=document.createElement("span");n.className="terminal__prompt",n.textContent=`${Y} `,t.append(n,document.createTextNode(e)),this.insertLine(t)}makeLine(e){const t=document.createElement("div");return t.className=ve[e],t}insertLine(e){this.scrollEl.insertBefore(e,this.inputRow),this.scrollToBottom()}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}renderGhost(){const e=this.inputEl.value,t=this.inputEl.selectionStart??e.length;this.ghostBefore.textContent=e.slice(0,t),this.caretText.textContent=e[t]??"",this.ghostAfter.textContent=e.slice(t+1),this.onTyping?.(e.length)}onKeydown(e){if(this.busy){e.preventDefault();return}switch(e.key){case"Enter":e.preventDefault(),this.submit(this.inputEl.value);break;case"ArrowUp":e.preventDefault(),this.recallHistory(-1);break;case"ArrowDown":e.preventDefault(),this.recallHistory(1);break;case"Tab":e.preventDefault(),this.handleTab();break;default:e.key==="l"&&e.ctrlKey&&(e.preventDefault(),this.clear())}}pushHistory(e){this.history[this.history.length-1]!==e&&(this.history.push(e),this.history.length>Q&&(this.history=this.history.slice(this.history.length-Q)),Le(this.history)),this.historyIndex=this.history.length}recallHistory(e){if(this.history.length===0)return;this.historyIndex=Math.min(Math.max(this.historyIndex+e,0),this.history.length);const t=this.history[this.historyIndex]??"";this.inputEl.value=t,this.inputEl.setSelectionRange(t.length,t.length),this.renderGhost()}handleTab(){const e=this.inputEl.value,t=J(e),n=/\s$/.test(e),i=t.length===0||t.length===1&&!n,o=n?"":t[t.length-1]??"";let a;if(i)a=this.registry.visible().map(c=>c.name);else{const c=this.registry.get(t[0]??"");if(!c?.complete)return;const d=n?t.slice(1):t.slice(1,-1);a=c.complete(d)}const r=a.filter(c=>c.startsWith(o)).sort();if(r.length===0)return;if(r.length===1){const c=r[0],d=i?[]:n?t:t.slice(0,-1);this.setInput([...d,c].join(" ")+" ");return}const l=ke(r);if(l.length>o.length){const c=i?[]:n?t:t.slice(0,-1);this.setInput([...c,l].join(" "));return}this.print(r.join("  "),"dim")}setInput(e){this.inputEl.value=e,this.inputEl.setSelectionRange(e.length,e.length),this.renderGhost()}async submit(e){const t=e.trim();if(this.echoPrompt(e),this.inputEl.value="",this.renderGhost(),this.onSend?.(),t==="")return;this.pushHistory(t);const n=J(t);if(n.length===0)return;const i=(n[0]??"").replace(/^\//,""),{args:o,flags:a}=be(n.slice(1)),r=this.registry.get(i);if(!r){const l=Se(i,this.registry.visible().map(c=>c.name));this.print(l?`command not found: ${i} — did you mean \`${l}\`?`:`command not found: ${i} — type \`help\``,"dim");return}this.setBusy(!0);try{await r.run({terminal:this,windows:this.windows,args:o,flags:a,raw:t})}catch(l){const c=l instanceof Error?l.message:String(l);this.print(`error: ${c}`,"dim")}finally{this.setBusy(!1),this.focusInput()}}}const Te=["┌───────────────────────────┐","│   l u c e n i t y O S     │","│   bios v1.1 — mono/64k    │","└───────────────────────────┘"],Ae=[["● cpu ................ ok","sub",30],["● memory ............. 640k (plenty)","sub",30],["● pixel shaders ...... ok","sub",40],["● crt scanlines ...... flickering nicely","sub",30],["● liffy.service ...... loaded","sub",60],["● cat daemon ......... asleep (do not wake)","sub",120],["mounting /home/visitor ... done","dim",60]];async function xe(s){s.setBusy(!0);for(const e of Te)s.print(e,"dim");k()||await _(180);for(const[e,t,n]of Ae)await s.typeLine(e,t,6),k()||await _(n);s.print(),s.print("welcome. type `help` to see what i can do.","default"),s.print(),s.setBusy(!1),s.focusInput()}const Ie=["..#.......#...............",".###.....###..............",".#.##....#.##.............",".#..##..##..##............",".#.########..##...........",".################.........",".#################........",".##################.......",".##################.......","###################.......","###################.#####.","##...####...##############","##########################","####################...###",".################.........","..#############..........."],Me={sleep:{},awake:{10:"##..#####..########.#####.",11:"##..#####..###############"},think:{10:"##########.########.#####.",11:"##..####..################"},"munch-a":{12:"#####...##################"},"munch-b":{12:"######..##################"},peek:{10:"##..###############.#####.",11:"##..#####...##############"}};function oe(s="sleep"){const e=Me[s];return Ie.map((t,n)=>e[n]??t).map(t=>[...t].map(n=>n==="#"?"██":"  ").join("")).join(`
`)}function Ne(s,e){const t=s.querySelector(".cat__art");t&&(t.textContent=oe(e)),s.dataset.frame=e}function B(s="cat",e="sleep"){const t=document.createElement("div");t.className=s,t.dataset.frame=e;const n=document.createElement("pre");n.className="cat__art",n.textContent=oe(e),n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="cat__zzz",i.setAttribute("aria-hidden","true");for(let o=0;o<3;o++){const a=document.createElement("span");a.className="cat__z",a.textContent="z",a.style.animationDelay=`${o*.9}s`,i.append(a)}return t.append(i,n),t}const Pe=24,Re=3,$e=2e3,K=["quiet!","let me sleep!"],ze=1e3,Oe=3e3,V=5,X=260,Fe=45e3,Be=1e5,je=6e4,Ge=15e3,He=2e4,Ue=4500,De=["zzz... sudo... nice try... zzz","mrrp... a command... named after me...","zzz... git clone... take one home...","...ctrl+] ... windows go round... zzz","zzz... liffy keeps secrets too...","...feed me... 24 keys... zzz"],We=["mrrp... say meow... i dare you...","zzz... cookie... just type it...","...hold me... one whole second... prrr","zzz... stare at me... see what happens..."];class ae{el;catEl;fillEl;meterEl;plateEl;bubbleEl;opts;cornered=!1;munching=!1;thinking=!1;bobbing=!1;staring=!1;petting=!1;clickTimes=[];bubbleTimer=null;petTimer=null;hoverTimer=null;murmurs;murmurIdx=0;lastActivity=performance.now();constructor(e){this.opts=e,this.el=document.createElement("div"),this.el.className=`catc catc--${e.mode}`,this.el.dataset.frame=e.idleFrame,this.catEl=B("cat catc__cat",e.idleFrame),this.bubbleEl=document.createElement("span"),this.bubbleEl.className="catc__bubble",this.bubbleEl.setAttribute("role","status"),this.meterEl=document.createElement("div"),this.meterEl.className="catc__meter",this.fillEl=document.createElement("div"),this.fillEl.className="catc__fill",this.plateEl=document.createElement("button"),this.plateEl.className="catc__plate",this.plateEl.type="button",this.plateEl.title="feed the cat",this.plateEl.setAttribute("aria-label","feed the cat a cookie"),this.meterEl.append(this.fillEl,this.plateEl),this.el.append(this.bubbleEl,this.catEl,this.meterEl),e.mount.append(this.el),this.wireAngryClicks(),e.mode==="liffy"&&(this.wirePetHold(),this.wireStareHover()),this.plateEl.addEventListener("click",t=>{t.stopPropagation(),this.feed()}),this.murmurs=[...e.mode==="hero"?De:We].sort(()=>Math.random()-.5),this.scheduleMurmur(Fe)}onTyping(e){e>0&&(this.lastActivity=performance.now()),e>0&&!this.cornered&&this.corner();const t=Math.min(e/Pe,1);this.fillEl.style.width=`${t*100}%`,this.el.classList.toggle("catc--typing",e>0||this.munching),this.plateEl.classList.toggle("is-served",t>=1)}onSend(){this.lastActivity=performance.now(),this.fillEl.style.width="0%",this.plateEl.classList.remove("is-served"),this.munching||this.el.classList.remove("catc--typing")}fillNow(){this.cornered||this.corner(),this.fillEl.style.width="100%",this.el.classList.add("catc--typing"),this.plateEl.classList.add("is-served")}corner(){this.cornered=!0,this.el.classList.add("catc--corner"),this.setFrame("sleep"),this.opts.onCorner?.()}restoreCenter(){this.cornered=!1,this.el.classList.remove("catc--corner"),this.onSend(),this.setFrame(this.opts.idleFrame)}feed(){if(this.munching)return;if(this.munching=!0,this.plateEl.classList.remove("is-served"),this.fillEl.style.width="0%",k()){this.setFrame("munch-a"),this.say("nom.",900),window.setTimeout(()=>{this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing")},900);return}this.say("nom nom nom",V*X+300);let e=0;const t=window.setInterval(()=>{this.setFrame(e%2===0?"munch-a":"munch-b"),e++,e>V&&(window.clearInterval(t),this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing"))},X)}think(e){this.thinking=e,!this.munching&&this.setFrame(e?"think":this.restFrame())}bob(e){this.bobbing=e,e?(this.munching||this.setFrame("awake"),k()||this.el.classList.add("catc--bob")):(this.el.classList.remove("catc--bob"),!this.munching&&!this.thinking&&this.setFrame(this.restFrame()))}hop(){x(this.el,"catc--hop")}say(e,t=2e3){this.bubbleTimer!==null&&window.clearTimeout(this.bubbleTimer),this.bubbleEl.textContent=e,this.bubbleEl.classList.add("is-visible"),this.bubbleTimer=window.setTimeout(()=>{this.bubbleEl.classList.remove("is-visible"),this.bubbleTimer=null},t)}scheduleMurmur(e){window.setTimeout(()=>this.tryMurmur(),e)}tryMurmur(){if(!this.el.isConnected)return;if(this.munching||this.thinking||this.bobbing||this.petting||this.bubbleTimer!==null||document.hidden||performance.now()-this.lastActivity<He){this.scheduleMurmur(Ge);return}this.say(this.murmurs[this.murmurIdx++%this.murmurs.length],Ue),this.scheduleMurmur(Be+Math.random()*je)}restFrame(){return this.cornered?"sleep":this.opts.idleFrame}setFrame(e){Ne(this.catEl,e),this.el.dataset.frame=e}wireAngryClicks(){this.catEl.addEventListener("click",()=>{if(this.petting)return;const e=performance.now();this.clickTimes=this.clickTimes.filter(t=>e-t<$e),this.clickTimes.push(e),this.clickTimes.length>=Re&&(this.clickTimes=[],x(this.el,"catc--shake"),this.say(K[Math.floor(Math.random()*K.length)],2e3))})}wirePetHold(){this.catEl.addEventListener("pointerdown",()=>{this.petTimer=window.setTimeout(()=>{this.petting=!0,this.el.classList.add("catc--pet"),this.say("prrrrr.",6e4)},ze)});const e=()=>{this.petTimer!==null&&window.clearTimeout(this.petTimer),this.petTimer=null,this.petting&&(this.el.classList.remove("catc--pet"),this.bubbleEl.classList.remove("is-visible"),window.setTimeout(()=>{this.petting=!1},0))};this.catEl.addEventListener("pointerup",e),this.catEl.addEventListener("pointerleave",e)}wireStareHover(){this.catEl.addEventListener("mouseenter",()=>{this.hoverTimer=window.setTimeout(()=>{!this.munching&&!this.thinking&&!this.bobbing&&(this.staring=!0,this.setFrame("peek"))},Oe)}),this.catEl.addEventListener("mouseleave",()=>{this.hoverTimer!==null&&window.clearTimeout(this.hoverTimer),this.hoverTimer=null,this.staring&&(this.staring=!1,this.setFrame(this.restFrame()))})}}const Z=["hello, stranger!","oh, you're back.","shh. the cat sleeps.","type something. anything."];function qe(s){const e=document.createElement("div");e.className="hero",e.setAttribute("aria-hidden","true");const t=document.createElement("div");t.className="hero__title";const n=document.createElement("span"),i=document.createElement("span");i.className="caret hero__caret",t.append(n,i);const o=document.createElement("div");o.className="hero__sub",o.textContent="do not wake the cat. type instead.",e.append(t,o),s.append(e);const a=new ae({mount:s,mode:"hero",idleFrame:"sleep",onCorner:()=>e.classList.add("hero--hidden")}),r=Z[Math.floor(Math.random()*Z.length)];return(async()=>(x(e,"is-arriving"),x(a.el,"is-arriving"),k()||await _(350),await F(n,r,{speed:55}),k()||await _(250),o.classList.add("is-visible")))(),{companion:a,restore(){e.classList.remove("hero--hidden"),a.restoreCenter()}}}const j=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function Je(s){let e=j(s);return e=e.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(t,n,i)=>`<a href="${i}" target="_blank" rel="noreferrer noopener">${n}</a>`),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__([^_]+)__/g,"<strong>$1</strong>"),e=e.replace(/(^|[^*])\*([^*\s][^*]*)\*/g,"$1<em>$2</em>"),e=e.replace(/(^|[^_])_([^_\s][^_]*)_/g,"$1<em>$2</em>"),e}function M(s){return s.split(/(`[^`]+`)/g).map(e=>e.length>=2&&e.startsWith("`")&&e.endsWith("`")?`<code>${j(e.slice(1,-1))}</code>`:Je(e)).join("")}function Ye(s){return s.replace(/```[^\n]*\n?/g,"").replace(/`([^`]+)`/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/__([^_]+)__/g,"$1").replace(/\*([^*]+)\*/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^#{1,6}\s+/gm,"").replace(/^\s*[-*+]\s+/gm,"• ").replace(/^>\s?/gm,"").replace(/\n{3,}/g,`

`).trim()}const N=/^(\s*)([-*+]|\d+\.)\s+(.*)$/;function re(s){const e=s.replace(/\r\n?/g,`
`).split(`
`),t=[];let n=0;for(;n<e.length;){const i=e[n];if(/^```/.test(i.trim())){const r=i.trim().slice(0,3);n++;const l=[];for(;n<e.length&&!e[n].trim().startsWith(r);)l.push(e[n]),n++;n++,t.push(`<pre class="md-pre"><code>${j(l.join(`
`))}</code></pre>`);continue}if(i.trim()===""){n++;continue}const o=/^(#{1,6})\s+(.*)$/.exec(i);if(o){const r=o[1].length;t.push(`<h${r}>${M(o[2].trim())}</h${r}>`),n++;continue}if(/^(-{3,}|\*{3,}|_{3,})\s*$/.test(i.trim())){t.push("<hr />"),n++;continue}if(/^>\s?/.test(i)){const r=[];for(;n<e.length&&/^>\s?/.test(e[n]);)r.push(e[n].replace(/^>\s?/,"")),n++;t.push(`<blockquote>${M(r.join(" "))}</blockquote>`);continue}if(N.test(i)){const l=/^\s*\d+\./.test(i)?"ol":"ul",c=[];for(;n<e.length&&N.test(e[n]);){const d=N.exec(e[n]);c.push(`<li>${M(d[3])}</li>`),n++}t.push(`<${l}>${c.join("")}</${l}>`);continue}const a=[];for(;n<e.length&&e[n].trim()!==""&&!/^```/.test(e[n].trim())&&!/^#{1,6}\s/.test(e[n])&&!/^>\s?/.test(e[n])&&!N.test(e[n])&&!/^(-{3,}|\*{3,}|_{3,})\s*$/.test(e[n].trim());)a.push(e[n]),n++;t.push(`<p>${M(a.join(" "))}</p>`)}return t.join(`
`)}const Qe=`# Nafees S

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
- Type \`contact\` for the rest, or \`liffy\` to just ask me things.`;function Ke(s){const e=document.createElement("div");e.className="docs",e.innerHTML=re(Qe),e.prepend(B("cat docs__avatar")),s.windows.open({id:"about",title:"about — nafees",content:e,width:540,height:460}),s.terminal.print("opened: about","dim")}function Ve(s){const e=document.createElement("div");e.className="contact",e.innerHTML=`
    <h2>contact</h2>
    <ul class="contact__list">
      <li><span class="muted">github</span> —
        <a href="https://github.com/lucenity0" target="_blank" rel="noreferrer noopener">github.com/lucenity0</a></li>
      <li><span class="muted">email</span> —
        <a href="mailto:hello@lucenity.dev">hello@lucenity.dev</a></li>
    </ul>
    <p class="muted">placeholder — swap in real handles in Phase 3.</p>
  `,s.windows.open({id:"contact",title:"contact",content:e,width:420,height:260}),s.terminal.print("opened: contact","dim")}const E=[{slug:"mlnotes",name:"ML Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://mlnotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"bdanotes",name:"BDA Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://bdanotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"schedulr",name:"Schedulr",blurb:"a scheduling app for teams and individuals",kind:"web",url:"https://srikrishna-ps.github.io/schedulr/",embeddable:!0,tags:["web","productivity","team"]},{slug:"sample-ios",name:"sample iOS app",blurb:"an app store listing — opens its landing page",kind:"ios",url:"https://www.apple.com/app-store/",embeddable:!1,tags:["ios","placeholder"]}];function Xe(s){return E.find(e=>e.slug===s)}function le(s,e){const t=Xe(e);if(!t){s.terminal.print(`no such project: ${e} — try \`projects\``,"dim");return}const n=t.embeddable?et(t):tt(t),i=s.windows.open({id:`project:${t.slug}`,title:`project — ${t.name}`,content:n,width:720,height:500});i.bodyEl.style.padding="0",s.terminal.print(`opened: ${t.name}`,"dim")}function ce(s){const e=document.createElement("div");e.className="project__bar";const t=document.createElement("span");t.className="project__dots",t.textContent="◦ ◦ ◦";const n=document.createElement("span");return n.className="project__url",n.textContent=s,e.append(t,n),e}const Ze=1e4;function et(s){const e=document.createElement("div");e.className="project",e.append(ce(s.url));const t=document.createElement("div");t.className="project__stage";const n=document.createElement("iframe");n.className="project__frame",n.src=s.url,n.loading="lazy",n.referrerPolicy="no-referrer",n.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),n.title=s.name;const i=document.createElement("div");i.className="project__loading";const o=document.createElement("span");o.className="project__loading-label",o.textContent=`loading ${s.name}…`;const a=document.createElement("span");a.className="project__loadbar",a.append(document.createElement("i")),i.append(o,a);let r=!1;const l=()=>{r||(r=!0,window.clearTimeout(c),i.classList.add("is-done"),window.setTimeout(()=>i.remove(),400))};n.addEventListener("load",l);const c=window.setTimeout(()=>{if(r)return;r=!0,i.classList.add("is-error"),o.textContent="this is taking too long — the site may not want to be framed.",a.remove();const d=document.createElement("a");d.className="project__open",d.href=s.url,d.target="_blank",d.rel="noreferrer noopener",d.textContent="open in new tab ↗",i.append(d)},Ze);return t.append(n,i),e.append(t),e}function tt(s){const e=document.createElement("div");e.className="project project--fallback",e.append(ce(s.url));const t=document.createElement("div");t.className="project__fallback",t.innerHTML=`
    <p class="muted">this one can't be embedded (${s.kind==="ios"?"iOS / App&nbsp;Store":"the site blocks framing"}).</p>
    <p><strong>${s.name}</strong></p>
    <p class="muted">${s.blurb}</p>
  `;const n=document.createElement("a");return n.className="project__open",n.href=s.url,n.target="_blank",n.rel="noreferrer noopener",n.textContent="open in new tab ↗",t.append(n),e.append(t),e}function nt(){const s=new Set;for(const e of E)for(const t of e.tags??[])t!=="placeholder"&&s.add(t);return[...s].sort()}function it(s,e){const t=document.createElement("button");t.className="pgrid__card",t.type="button";const n=document.createElement("span");n.className="pgrid__thumb",n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="pgrid__initial",i.textContent=e.name.slice(0,1).toUpperCase(),n.append(i);const o=document.createElement("strong");o.className="pgrid__name",o.textContent=e.name;const a=document.createElement("span");a.className="pgrid__blurb",a.textContent=e.blurb;const r=document.createElement("span");return r.className="pgrid__meta",r.textContent=[e.kind,...(e.tags??[]).filter(l=>l!=="placeholder"&&l!==e.kind)].join(" · "),t.append(n,o,a,r),t.addEventListener("click",()=>le(s,e.slug)),t}function st(s){const e=document.createElement("div");e.className="pgrid";const t=document.createElement("div");t.className="pgrid__filters";const n=document.createElement("div");n.className="pgrid__grid";const i=new Map;for(const c of E)i.set(c,it(s,c));let o="all";const a=[],r=c=>{o=c;for(const h of a)h.classList.toggle("is-active",h.dataset.tag===c);let d=0;for(const[h,p]of i){const g=c==="all"||(h.tags??[]).includes(c)||h.kind===c;p.hidden=!g,g&&d++}l.hidden=d>0};for(const c of["all",...nt()]){const d=document.createElement("button");d.className="pgrid__chip",d.type="button",d.dataset.tag=c,d.textContent=c,d.addEventListener("click",()=>r(c)),a.push(d),t.append(d)}const l=document.createElement("p");l.className="pgrid__empty muted",l.textContent="nothing tagged that (yet).",l.hidden=!0;for(const c of i.values())n.append(c);e.append(t,n,l),r(o),s.windows.open({id:"projects",title:"projects",content:e,width:560,height:420}),s.terminal.print(`opened: projects (${E.length})`,"dim")}const ee=1.4,te=.72,ot=2.4,at=3,P=.75,rt=1.2,lt=.9,ct=5,dt=4,ht=3,ut=.8,mt=4,pt=8,G=new Set(["a","an","the","is","are","was","were","be","been","being","do","does","did","of","to","in","on","for","and","or","but","with","at","by","from","as","it","its","this","that","these","those","i","you","he","she","they","we","me","him","her","them","his","your","my","our","their","what","which","who","whom","how","when","where","why","can","could","would","should","will","shall","have","has","had","about","tell","know","any","some","into","so","u","get","got","give","us","please","hey","im"]),z=new Set(["work","use","using","make","made","build","built","run","get","got","thing","stuff","look","like","happen","involve","mean","explain","describe","show"]);function de(s){return s.length<=3?s:s.endsWith("ies")?`${s.slice(0,-3)}y`:s.endsWith("ing")&&s.length>5?s.slice(0,-3):s.endsWith("ed")&&s.length>4?s.slice(0,-2):s.endsWith("s")&&!s.endsWith("ss")?s.slice(0,-1):s}function T(s){return s.toLowerCase().split(/[^a-z0-9+#.]+/).map(e=>e.replace(/^[.]+|[.]+$/g,"")).filter(e=>e.length>1&&!G.has(e)).map(de)}const O=s=>[...new Set(s)];function A(s){return s.toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim()}const S=s=>` ${s} `;function ft(s,e,t){if(Math.abs(s.length-e.length)>t)return t+1;let n=null,i=Array.from({length:e.length+1},(o,a)=>a);for(let o=1;o<=s.length;o++){const a=[o];let r=o;for(let l=1;l<=e.length;l++){const c=s[o-1]===e[l-1]?0:1;let d=Math.min(i[l]+1,a[l-1]+1,i[l-1]+c);n&&o>1&&l>1&&s[o-1]===e[l-2]&&s[o-2]===e[l-1]&&(d=Math.min(d,n[l-2]+1)),a.push(d),d<r&&(r=d)}if(r>t)return t+1;n=i,i=a}return i[e.length]}const gt=new Set(["about","work","works","fun","intro","bio","apps"]);function yt(s){return s.includes(" ")?!0:s.length>=5&&!gt.has(s)&&!G.has(s)}function wt(s,e){const t=S(s),n=e.aliases[0];if(n&&t.includes(S(n))||t.includes(S(e.label)))return!0;for(const i of e.namePhrases)if(i.includes(" ")&&t.includes(S(i)))return!0;return!1}const he="",bt=/\b(?:[A-Za-z]\.){2,}|\b(?:prof|dr|mr|mrs|ms|sr|jr|st|vs|etc|fig|no|ph|approx|e\.g|i\.e|a\.m|p\.m)\.|\b[A-Z]\.(?=\s+[A-Z0-9])/gi,vt=s=>s.replace(bt,e=>e.replace(/\./g,he)),kt=s=>s.replace(new RegExp(he,"g"),".");function Et(s){const e=[];for(const t of s.split(/\n{2,}/)){const n=vt(t.replace(/\s*\n\s*/g," ").trim());if(n)for(const i of n.split(/(?<=[.!?])\s+(?=[A-Z0-9("'*])/)){const o=kt(i).trim();o&&e.push({text:o,terms:new Set(T(o))})}}return e}function St(s){const e=s[0]??"topic";return e.includes(" ")?s.filter(n=>!n.includes(" ")&&n.length>=3&&!G.has(n)).sort((n,i)=>n.length-i.length)[0]??e:e}function _t(s){const e=[];let t=!1;for(const n of s.split(`
`)){if(t)if(n.trim()===""||/^#{1,3}\s/.test(n))t=!1;else continue;if(/^\s*todo\b/i.test(n)){t=!0;continue}e.push(n)}return e.join(`
`)}function Lt(s){const t=_t(s.replace(/\r\n?/g,`
`).replace(/<!--[\s\S]*?-->/g,"")).split(`
`),n=[];let i="",o=[];const a=()=>{i&&o.join("").trim()&&n.push({heading:i,body:o})};for(const r of t){const l=/^#{1,3}\s+(.*)$/.exec(r);l?(a(),i=l[1].trim(),o=[]):i&&o.push(r)}return a(),n.map(({heading:r,body:l})=>{const c=O(r.split(/\s*[/|]\s*/).map(g=>A(g)).filter(Boolean)),d=Et(Ye(l.join(`
`)).trim()),h=new Map;let p=0;for(const g of d)for(const b of T(g.text))h.set(b,(h.get(b)??0)+1),p++;return{label:St(c),aliases:c,namePhrases:c.filter(yt),aliasTokens:new Set(c.flatMap(g=>T(g))),nameTokens:new Set(T(c[0]??"")),sentences:d,tf:h,length:p}})}const Ct=/^(tell me more|more|more please|go on|continue|keep going|say more|elaborate|expand|and\??|and then\??|what else\??|anything else\??|\.\.\.|…)$/,Tt=/^(yes|yeah|yep|yup|ya|sure|ok|okay|okie|mhm|please|pls|go ahead|do it|hit me|why not)$/,At=/\b(it|its|it's|that|this|they|them|those|these|the (app|project|tool|thing|system|paper|model|one|setup))\b/,xt=/^(does|do|did|is|are|was|were|has|have|had|can|could|will|would)\b/,It=/\b(which|what|who|list|all|any|anything|every|everything|how many|uses?d?|using|built with|written in|made with|know[sn]?|familiar)\b/,Mt=new Set(["first","second","third","one","two","three","last","latter","former","next","other","previous","previou"]),Nt=["team","guid","develop","coordinator"],Pt=/\b(project|app|apps|tool|paper|research|thing|one|work)\b/;class Rt{chunks;idf=new Map;df=new Map;avgdl;allAliasTokens=new Set;vocab=[];topic=null;pending=null;offeredMore=!1;constructor(e){this.chunks=Lt(e);const t=this.chunks.length||1;let n=0;for(const i of this.chunks){n+=i.length;for(const o of new Set([...i.tf.keys(),...i.aliasTokens]))this.df.set(o,(this.df.get(o)??0)+1);for(const o of i.aliasTokens)this.allAliasTokens.add(o)}for(const[i,o]of this.df)this.idf.set(i,Math.log(1+(t-o+.5)/(o+.5)));this.avgdl=n/t;for(const[i,o]of this.idf)i.length>=4&&o>=.5&&this.vocab.push({token:i,idf:o})}async ask(e,t){const n=e.trim(),i=n.toLowerCase(),o=i.replace(/[!.?]+$/,"").trim(),a=$t(i);if(a)return{text:a,grounded:!0};if(this.pending){const u=this.resolveClarify(o);if(this.pending=null,u!=null)return this.answerFrom(this.chunks[u],u,[])}const r=this.offeredMore;this.offeredMore=!1;const l=O(T(n));if((Ct.test(o)||r&&Tt.test(o)||l.length===0)&&this.topic)return this.continueTopic();if(l.length===0)return this.reprompt();if(this.topic&&l.every(u=>Mt.has(u)))return this.continueTopic();const d=[],h=l.map(u=>{if(this.idf.has(u))return u;const y=this.correct(u);return y&&d.push(`reading "${u}" as "${y}"`),y??u}),p=A(n),g=this.tryCompound(n);if(g)return this.decorate(g,d);const b=this.rank(h,p),m=b[0],f=m!=null&&(m.phraseHit||m.bestIdf>=P||m.matched>=2&&m.idfSum>=rt),w=h.some(u=>!z.has(u)&&(this.idf.get(u)??0)>=P&&this.chunks.some(y=>y.nameTokens.has(u)))||this.chunks.some(u=>wt(p,u)),v=/\bwho\b/.test(i)?Nt:[];if(It.test(i)){const u=this.tryAggregate(i,h);if(u)return this.decorate(u,d)}if(this.topic&&At.test(i)&&!w){const u=this.topic;return this.decorate(this.answerFrom(this.chunks[u.index],u.index,h,v),d)}if(f&&!m.phraseHit&&!w){const u=b[1];if(u&&u.index!==m.index&&u.score>=m.score*ut&&u.matched>0&&Pt.test(i))return this.pending={options:[{index:m.index,label:m.chunk.label},{index:u.index,label:u.chunk.label}]},{text:`that could mean ${m.chunk.label} or ${u.chunk.label} — which one?`,grounded:!0}}return f?this.decorate(this.answerFrom(m.chunk,m.index,h,v),d):xt.test(o)?{text:`hmm, nothing in my notes about that, so i can't confirm either way. i can talk about: ${this.topicList()}.`,grounded:!1}:this.fallback()}rank(e,t){return this.chunks.map((n,i)=>this.scoreChunk(n,i,e,t)).sort((n,i)=>i.score-n.score)}scoreChunk(e,t,n,i){let o=0,a=0,r=0,l=0;for(const d of n){const h=this.idf.get(d)??0,p=e.tf.get(d)??0,g=p===0?0:p*(ee+1)/(p+ee*(1-te+te*(e.length/this.avgdl))),b=h*g,m=e.aliasTokens.has(d)?h*ot:0;(b>0||m>0)&&(a++,l+=h,h>r&&(r=h)),o+=b+m}let c=!1;for(const d of e.namePhrases)S(i).includes(S(d))&&(o+=at,c=!0);return{chunk:e,index:t,score:o,matched:a,bestIdf:r,idfSum:l,phraseHit:c}}correct(e){if(e.length<5)return null;const t=e.length>=7?2:1;let n=null;for(const i of this.vocab){if(i.token[0]!==e[0])continue;const o=ft(e,i.token,t);o>t||(!n||o<n.dist||o===n.dist&&i.idf>n.idf)&&(n={token:i.token,dist:o,idf:i.idf})}return n?.token??null}tryCompound(e){const t=e.split(/\s*(?:\band\b|\bvs\.?\b|\bversus\b|[;,&])\s*/i).map(r=>r.trim()).filter(r=>r.length>=3);if(t.length<2||t.length>3)return null;const n=[];for(const r of t){const l=O(T(r)).map(d=>this.idf.has(d)?d:this.correct(d)??d);if(l.length===0)return null;const c=this.rank(l,A(r))[0];if(!c||!(c.phraseHit||c.bestIdf>=P))return null;n.push({part:r,r:c,terms:l})}if(new Set(n.map(r=>r.r.index)).size<2)return null;const o=[],a=[];for(const r of n){const l=this.answerFrom(r.r.chunk,r.r.index,r.terms);o.push(`${r.r.chunk.label}: ${l.text}`),a.push(r.r.chunk.label)}return this.offeredMore=!1,{text:o.join(`

`).replace(/ — say "more" for the rest\./g,""),grounded:!0,sources:a}}tryAggregate(e,t){let n=null;for(const r of t){const l=this.df.get(r)??0,c=this.idf.get(r)??0;l>=2&&l<=pt&&c>=P&&!this.allAliasTokens.has(r)&&!z.has(r)&&(!n||c>n.idf)&&(n={term:r,idf:c})}if(!n)return null;const i=e.split(/[^a-z0-9+#.]+/).filter(r=>r.length>1).find(r=>de(r.replace(/^[.]+|[.]+$/g,""))===n.term)??n.term,o=this.chunks.map((r,l)=>({chunk:r,index:l,tf:r.tf.get(n.term)??0})).filter(r=>r.tf>0).sort((r,l)=>l.tf-r.tf).slice(0,mt);if(o.length<2)return null;const a=o.map(r=>{const l=this.extract(r.chunk,[n.term]).slice(0,1),c=l.length>0?r.chunk.sentences[l[0]].text:"";return`${r.chunk.label}: ${c}`});return this.topic=null,{text:`${i} shows up in ${o.length} of my notes —

${a.join(`

`)}`,grounded:!0,sources:o.map(r=>r.chunk.label)}}resolveClarify(e){const t=this.pending.options,n=S(A(e));for(const i of t)if(n.includes(S(A(i.label))))return i.index;return/\b(first|former|1st|1)\b/.test(e)?t[0].index:/\b(second|latter|2nd|2)\b/.test(e)?t[1]?.index??null:/\b(both|either|all)\b/.test(e)?t[0].index:null}decorate(e,t){return t.length===0||!e.grounded?e:{...e,text:`(${t.join(", ")}) ${e.text}`}}answerFrom(e,t,n,i=[]){const o=[...n.filter(c=>!e.nameTokens.has(c)&&!z.has(c)&&(this.idf.get(c)??0)>=lt),...i];if(o.length>0){const c=this.extract(e,o);if(c.length>0)return this.topic={index:t,shown:new Set(c)},{text:c.map(d=>e.sentences[d].text).join(" "),grounded:!0,sources:[e.label]}}const a=e.sentences.slice(0,ct),r=new Set(a.map((c,d)=>d));this.topic={index:t,shown:r};let l=a.map(c=>c.text).join(" ");return e.sentences.length>a.length&&(l+=' — say "more" for the rest.',this.offeredMore=!0),{text:l,grounded:!0,sources:[e.label]}}extract(e,t){const i=e.sentences.map((o,a)=>{let r=0;for(const l of t)o.terms.has(l)&&(r+=this.idf.get(l)??.5);return{i:a,sc:r}}).filter(o=>o.sc>0).sort((o,a)=>a.sc-o.sc).slice(0,ht).sort((o,a)=>o.i-a.i).map(o=>o.i);if(i.length===1){const o=i[0],a=e.sentences[o+1];a&&e.sentences[o].text.length+a.text.length<380&&/^(it|its|this|that|the |so |which |and )/i.test(a.text)&&i.push(o+1)}return i}continueTopic(){const e=this.topic,t=this.chunks[e.index],n=[];for(let a=0;a<t.sentences.length;a++)e.shown.has(a)||n.push(a);if(n.length===0)return{text:`that's everything in my notes on ${t.label}. ask me something specific — its stack, how it works, who's involved.`,grounded:!0,sources:[t.label]};const i=n.slice(0,dt);i.forEach(a=>e.shown.add(a));let o=i.map(a=>t.sentences[a].text).join(" ");return e.shown.size<t.sentences.length&&(o+=" — more?",this.offeredMore=!0),{text:o,grounded:!0,sources:[t.label]}}reprompt(){return{text:`ask me something about nafees — try: ${this.topicList()}.`,grounded:!1}}fallback(){return{text:`hmm, that's not in my notes. i can talk about: ${this.topicList()}.`,grounded:!1}}topicList(){return this.chunks.slice(0,8).map(e=>e.label).join(", ")}}function $t(s){const e=s.replace(/[!.?]+$/,"").trim();return/^(hi|hey|hello|yo|sup|howdy|hiya|heya|hii+|hey there|good (morning|evening|afternoon))\b/.test(e)?`hey! i'm liffy — nafees's terminal sidekick. ask me anything about him. try: "what does he build?"`:/^(thanks|thank you|thx|ty|tysm|appreciate it|cheers|nice|cool|awesome|great)\b/.test(e)?"anytime :)":/^(wow+|woah|whoa|nice+|cool+|lol|lmao|haha+|hehe+|damn|based)\b/.test(e)?"right? ask me more.":/^(bye|cya|goodbye|see ya|see you|later|gtg|good night|gn)\b/.test(e)?"catch you later! (close the window whenever)":/\b(how are you|how's it going|hows it going|you good|wyd)\b/.test(e)?"just vibing in the terminal, waiting for questions about nafees. what do you want to know?":/(are|r) you (a )?(bot|ai|robot|real|human|person|chatgpt|claude)/.test(e)?"i'm a lil retrieval bot — no LLM, no keys. i only know what's in nafees's notes, and i answer straight from them.":/\byour (favorite|favourite|fav|opinion|thoughts?)\b/.test(e)?"i deal in facts from nafees's notes, not opinions. though between us — the cat is objectively the best part of this site.":/\b(tell|know|got|have).*(joke|something funny)\b|^joke$/.test(e)?"a chatbot with no LLM walks into a bar. that's it. that's me. i'm the joke. ask me about nafees instead.":/(who|what) are you|your name|are you liffy(?!\s*(review|the))/.test(e)?"i'm liffy, a tiny assistant that knows nafees. ask away — projects, skills, research, contact, whatever.":/^(help|what can you do|commands|options|menu|\?)$/.test(e)?'i answer questions about nafees from his notes. try: "what does he build?", "tell me about askcal", "which projects use fastapi?", or just a topic name.':/(who (made|built|created) you)/.test(e)?"nafees built me for this site — a grounded retriever over his own notes. ask me about him next.":null}const zt=`# Liffy's notes on Nafees

<!--
  This is Liffy's brain. Each \`##\`/\`###\` heading is a retrievable chunk;
  when someone asks a question, Liffy finds the best-matching section and
  reads it back. Tips:
    - Put likely question keywords in the HEADINGS (they're weighted 2x).
      Separate aliases with " / ". The FIRST alias is the topic's "name" —
      keep it a tidy single word where possible (it becomes the label).
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

## askcal / ask cal / pulse / scheduler / calendar app / inbox / email assistant / gmail / regret score

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

## contact / reach / email / socials / github / linkedin / instagram / discord / hire / hiring / availability / work with him / gmail

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
`;let Ot=null;const Ft=()=>Ot??=new Rt(zt),Bt=`hey, i'm liffy — nafees's lil terminal sidekick. ask me anything about him. try: "what does he build?"`,jt=/^me+o+w+[\s.!?~]*$/i,Gt=/\b(cookie|treat)\b/i,ne="meow. mrrp. purrrr. (translation: hi. i like you. bring snacks.)";function Ht(s){const e=Ft(),t=[];let n=!1;const i=document.createElement("div");i.className="liffy";const o=document.createElement("div");o.className="liffy__log",o.setAttribute("role","log"),o.setAttribute("aria-live","polite");const a=document.createElement("form");a.className="liffy__inputrow";const r=document.createElement("span");r.className="liffy__prompt",r.textContent="you>";const l=document.createElement("input");l.className="liffy__input",l.type="text",l.setAttribute("aria-label","ask liffy"),l.autocomplete="off",l.autocapitalize="off",l.spellcheck=!1,a.append(r,l),i.append(o,a);const c=()=>{o.scrollTop=o.scrollHeight},d=(w,v)=>{const u=document.createElement("div");u.className="liffy__line";const y=document.createElement("span");y.className=`liffy__who ${v}`,y.textContent=w;const L=document.createElement("span");return L.className="liffy__text",u.append(y,L),o.append(u),c(),L},h=async w=>{const v=d("liffy>","liffy__who--bot");if(k())v.textContent=w;else{const u=w.length>320?4:w.length>160?6:9;await F(v,w,{speed:u})}c()},p=["thinking","pondering","purring","consulting the cat","rummaging through notes","recalling"];let g=0;const b=async w=>{if(n)return;if(n=!0,l.disabled=!0,d("you>","liffy__who--user").textContent=w,t.push({role:"user",text:w}),jt.test(w)){const H=d("","liffy__who--bot");H.classList.add("liffy__thinking"),H.textContent="✳ thought for 0.0s (instinct)",t.push({role:"liffy",text:ne}),f.hop(),await h(ne),n=!1,l.disabled=!1,l.focus();return}const v=d("","liffy__who--bot");v.classList.add("liffy__thinking");const u=ie(v,p[g++%p.length]);f.think(!0),k()||await _(650+Math.random()*750);const y=await e.ask(w,t),L=u.stop();f.think(!1);const me=y.sources?.length?` · read notes: ${y.sources.join(", ")}`:"";v.textContent=`✳ thought for ${Math.max(L,.1).toFixed(1)}s${me}`,t.push({role:"liffy",text:y.text}),f.bob(!0),await h(y.text),f.bob(!1),n=!1,l.disabled=!1,l.focus()};a.addEventListener("submit",w=>{w.preventDefault();const v=l.value.trim();!v||n||(l.value="",f.onSend(),b(v))});const m=s.windows.open({id:"liffy",title:"liffy — ask about nafees",content:i,width:520,height:420});m.bodyEl.style.padding="0";const f=new ae({mount:i,mode:"liffy",idleFrame:"awake"});l.addEventListener("input",()=>{const w=l.value;Gt.test(w)?f.fillNow():f.onTyping(w.length)}),h(Bt),window.setTimeout(()=>l.focus(),60),s.terminal.print("opened: liffy","dim")}const Ut=`# Nafees S — résumé

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

---`;function Dt(s){const e=document.createElement("div");e.className="docs",e.innerHTML=re(Ut);const t="/preview-b36b9ad3412f39139ec0/resume.pdf";fetch(t,{method:"HEAD"}).then(n=>{const i=n.headers.get("content-type")??"";if(!n.ok||!i.includes("pdf"))return;const o=document.createElement("div");o.className="docs__toolbar";const a=document.createElement("a");a.className="docs__download",a.href=t,a.target="_blank",a.rel="noreferrer noopener",a.textContent="↓ download PDF",o.append(a),e.prepend(o)}).catch(()=>{}),s.windows.open({id:"resume",title:"resume — nafees",content:e,width:560,height:480}),s.terminal.print("opened: resume","dim")}function C(s,e){return async t=>{if(k()){e(t);return}const n=document.createElement("div");n.className="terminal__line terminal__line--sub",t.terminal.printEl(n);const i=ie(n,s);await _(320+Math.random()*260),i.stop(),n.remove(),e(t)}}function Wt(){const s=[],e=t=>{t.terminal.print("available commands:");for(const n of s.filter(i=>!i.hidden)){const i=(n.usage??n.name).padEnd(18);t.terminal.print(`  ${i}${n.summary}`,"dim")}};return s.push({name:"help",summary:"list available commands",run:e},{name:"about",summary:"who is lucenity",run:C("waking about",Ke)},{name:"resume",summary:"view my résumé",run:C("dusting off the résumé",Dt)},{name:"projects",summary:"browse my work",run:C("indexing projects",st)},{name:"project",summary:"open a specific project",usage:"project <slug>",run:async t=>{const n=t.args[0];if(!n){t.terminal.print("usage: project <slug>","dim"),t.terminal.print(`slugs: ${E.map(i=>i.slug).join(", ")}`,"sub");return}await C(`spinning up ${n}`,i=>le(i,n))(t)},complete:t=>t.length>1?[]:E.map(n=>n.slug)},{name:"contact",summary:"how to reach me",run:C("opening channels",Ve)},{name:"liffy",summary:"chat with liffy, my lil assistant",run:C("poking liffy awake",Ht)},{name:"clear",summary:"clear the screen",run:t=>t.terminal.clear()},{name:"whoami",summary:"print the current session identity",run:t=>t.terminal.print("visitor@lucenity — guest session","dim")},{name:"cat",summary:"",hidden:!0,run:t=>{const n=B("cat terminal__cat");t.terminal.printEl(n),t.terminal.print("the cat is asleep. it is always asleep. =^..^=","dim")}},{name:"sudo",summary:"",hidden:!0,run:t=>t.terminal.print("nice try. you're a guest here :)","dim")},{name:"git",usage:"git <subcommand>",summary:"",hidden:!0,run:t=>{const n=t.args[0];if(!n){t.terminal.print("usage: git <subcommand>","dim"),t.terminal.print("subcommands: init, clone","sub");return}if(n==="init")t.terminal.print("Nafees's Github! : https://github.com/lucenity0","dim");else if(n==="clone"){const i=t.args[1];if(!i){t.terminal.print("usage: git clone <slug>","dim"),t.terminal.print(`slugs: ${E.map(a=>a.slug).join(", ")}`,"sub");return}if(!E.find(a=>a.slug===i)){t.terminal.print(`error: no project found with slug '${i}'`,"dim"),t.terminal.print(`valid slugs: ${E.map(a=>a.slug).join(", ")}`,"sub");return}t.terminal.print(`Cloning into '${i}'...`,"dim"),t.terminal.print(`remote: https://github.com/lucenity0/${i}.git`,"sub")}},complete:t=>t.length<=1?["init","clone"]:t[0]==="clone"&&t.length===2?E.map(n=>n.slug):[]}),s}const $=document.getElementById("app");if(!$)throw new Error("#app mount element not found");const qt=new we($),ue=new pe;ue.registerAll(Wt());const R=new Ce($,ue,qt);xe(R).then(()=>{const s=qe($);R.onTyping=e=>s.companion.onTyping(e),R.onSend=()=>s.companion.onSend(),R.onClear=()=>s.restore()});
//# sourceMappingURL=index-BQEztej7.js.map
