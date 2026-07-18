(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();class de{map=new Map;register(e){this.map.set(e.name.toLowerCase(),e)}registerAll(e){for(const t of e)this.register(t)}get(e){return this.map.get(e.toLowerCase())}all(){return[...this.map.values()]}visible(){return this.all().filter(e=>!e.hidden)}names(){return[...this.map.keys()]}}const he=["e","s","se"];function ue(s){const e=document.createElement("section");e.className="window brackets is-opening",e.setAttribute("role","dialog"),e.setAttribute("aria-label",s);const t=document.createElement("header");t.className="window__bar";const n=document.createElement("span");n.className="window__dots";const i=document.createElement("button");i.className="window__dot window__dot--close",i.type="button",i.title="close",i.setAttribute("aria-label","close window");const o=document.createElement("span");o.className="window__dot";const a=document.createElement("span");a.className="window__dot",n.append(i,o,a);const r=document.createElement("span");r.className="window__title",r.textContent=s;const l=document.createElement("span");l.className="window__controls";const c=document.createElement("button");c.className="window__btn window__btn--min",c.type="button",c.title="minimize",c.setAttribute("aria-label","minimize window"),c.textContent="–";const d=document.createElement("button");d.className="window__btn window__btn--max",d.type="button",d.title="maximize",d.setAttribute("aria-label","maximize window"),d.textContent="□",l.append(c,d),t.append(n,r,l);const h=document.createElement("div");h.className="window__body",e.append(t,h);const m=he.map(u=>{const g=document.createElement("span");return g.className=`window__resize window__resize--${u}`,g.dataset.dir=u,e.append(g),g});return{el:e,barEl:t,bodyEl:h,closeBtn:i,minimizeBtn:c,maximizeBtn:d,resizeHandles:m}}class me{root;folderBtn;countEl;listEl;items=new Map;open=!1;constructor(e){this.root=document.createElement("div"),this.root.className="tray",this.root.hidden=!0,this.folderBtn=document.createElement("button"),this.folderBtn.className="tray__folder",this.folderBtn.type="button",this.folderBtn.setAttribute("aria-label","minimized windows"),this.folderBtn.setAttribute("aria-haspopup","true"),this.folderBtn.setAttribute("aria-expanded","false"),this.folderBtn.innerHTML='<span class="tray__glyph" aria-hidden="true">▚</span><span class="tray__count">0</span>',this.countEl=this.folderBtn.querySelector(".tray__count"),this.listEl=document.createElement("div"),this.listEl.className="tray__list",this.listEl.hidden=!0,this.folderBtn.addEventListener("click",()=>this.toggle()),this.root.append(this.folderBtn,this.listEl),e.append(this.root)}add(e,t,n){this.items.set(e,{title:t,onRestore:n}),this.render()}remove(e){this.items.delete(e),this.items.size===0&&(this.open=!1),this.render()}has(e){return this.items.has(e)}toggle(){this.open=!this.open&&this.items.size>0,this.render()}render(){const e=this.items.size;this.root.hidden=e===0,this.countEl.textContent=String(e),this.listEl.hidden=!this.open||e===0,this.folderBtn.classList.toggle("is-open",this.open),this.folderBtn.setAttribute("aria-expanded",String(this.open&&e>0)),this.listEl.replaceChildren();for(const[t,n]of this.items){const i=document.createElement("button");i.className="tray__item",i.type="button",i.textContent=n.title,i.addEventListener("click",()=>{n.onRestore(),this.open=!1,this.render()}),this.listEl.append(i)}}}const b=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,S=s=>new Promise(e=>window.setTimeout(e,s));async function N(s,e,t={}){const{speed:n=18,delay:i=0}=t;if(b()){s.textContent=e;return}i>0&&await S(i),s.textContent="";for(const o of e)s.textContent+=o,await S(n)}function T(s,e){b()||(s.classList.add(e),s.addEventListener("animationend",()=>s.classList.remove(e),{once:!0}))}const B=["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];function Z(s,e){const t=performance.now();let n=null;if(b())s.textContent=`${e}…`;else{let i=0;const o=()=>{const a=B[i%B.length],r=".".repeat((i>>2)%4);s.textContent=`${a} ${e}${r}`,i++};o(),n=window.setInterval(o,90)}return{stop(){return n!==null&&window.clearInterval(n),(performance.now()-t)/1e3}}}const F={width:420,height:300},j=260,G=160,A=12;class pe{root;tray;records=new Map;minimized=new Set;mru=[];topZ=100;spawnCount=0;constructor(e){this.root=e,this.tray=new me(e)}open(e){const t=e.singleton??!0,n=this.records.get(e.id);if(t&&n)return this.minimized.has(e.id)?this.restore(e.id):n.instance.focus(),n.instance;const i=ue(e.title),{el:o,bodyEl:a,barEl:r,closeBtn:l,minimizeBtn:c,maximizeBtn:d,resizeHandles:h}=i,m=Math.max(j,this.root.clientWidth-16),u=Math.max(G,this.root.clientHeight-16),g=Math.min(e.width??F.width,m),y=Math.min(e.height??F.height,u);o.style.width=`${g}px`,o.style.height=`${y}px`;const p=this.spawnCount++%6*26,f=e.x??Math.max(8,this.root.clientWidth/2-g/2+p),E=e.y??Math.max(8,this.root.clientHeight/2-y/2+p);o.style.left=`${Math.min(f,Math.max(8,this.root.clientWidth-g-8))}px`,o.style.top=`${Math.min(E,Math.max(8,this.root.clientHeight-y-8))}px`,typeof e.content=="string"?a.textContent=e.content:a.appendChild(e.content);const v={id:e.id,el:o,bodyEl:a,close:()=>this.close(e.id),focus:()=>this.focus(e.id)};return l.addEventListener("click",w=>{w.stopPropagation(),this.close(e.id)}),c.addEventListener("click",w=>{w.stopPropagation(),this.minimize(e.id)}),d.addEventListener("click",w=>{w.stopPropagation(),this.toggleMaximize(e.id)}),r.addEventListener("dblclick",w=>{w.target.closest(".window__dot, .window__btn")||this.toggleMaximize(e.id)}),o.addEventListener("pointerdown",()=>this.focus(e.id)),o.addEventListener("keydown",w=>{w.key!=="Escape"||w.target.closest("input, textarea, select, [contenteditable]")||(w.stopPropagation(),this.close(e.id))}),this.enableDrag(o,r),this.enableResize(e.id,o,h),this.records.set(e.id,{instance:v,el:o,title:e.title}),this.root.appendChild(o),this.focus(e.id),v}close(e){const t=this.records.get(e);if(!t)return;this.records.delete(e);const n=this.minimized.delete(e);if(this.mru=this.mru.filter(i=>i!==e),this.tray.has(e)&&this.tray.remove(e),b()||n){t.el.remove();return}t.el.classList.add("is-closing"),t.el.addEventListener("animationend",()=>t.el.remove(),{once:!0}),window.setTimeout(()=>t.el.remove(),600)}toggleMaximize(e){const t=this.records.get(e);if(!t||this.minimized.has(e))return;if(b()||(t.el.classList.add("is-snapping"),window.setTimeout(()=>t.el.classList.remove("is-snapping"),300)),t.savedRect){const i=t.savedRect;t.el.style.left=i.left,t.el.style.top=i.top,t.el.style.width=i.width,t.el.style.height=i.height,delete t.savedRect,t.el.classList.remove("is-maximized")}else t.savedRect={left:t.el.style.left,top:t.el.style.top,width:t.el.style.width,height:t.el.style.height},t.el.style.left=`${A}px`,t.el.style.top=`${A}px`,t.el.style.width=`${this.root.clientWidth-A*2}px`,t.el.style.height=`${this.root.clientHeight-A*2}px`,t.el.classList.add("is-maximized");const n=t.el.querySelector(".window__btn--max");if(n){const i=t.el.classList.contains("is-maximized");n.textContent=i?"❐":"□",n.title=i?"restore":"maximize",n.setAttribute("aria-label",i?"restore window":"maximize window")}this.focus(e)}focus(e){const t=this.records.get(e);if(t){for(const[n,i]of this.records)i.el.classList.toggle("is-active",n===e&&!this.minimized.has(n));t.el.style.zIndex=String(++this.topZ),this.mru=[e,...this.mru.filter(n=>n!==e)]}}cycle(e){const t=this.mru.filter(i=>this.records.has(i)&&!this.minimized.has(i));if(t.length<2)return;const n=e===1?t[1]:t[t.length-1];n&&this.focus(n)}get(e){return this.records.get(e)?.instance}minimize(e){const t=this.records.get(e);if(!(!t||this.minimized.has(e))){if(this.minimized.add(e),t.el.classList.remove("is-active"),this.tray.add(e,t.title,()=>this.restore(e)),b()){t.el.style.display="none";return}t.el.classList.add("is-minimizing"),t.el.addEventListener("animationend",()=>{t.el.style.display="none",t.el.classList.remove("is-minimizing")},{once:!0})}}restore(e){const t=this.records.get(e);t&&(this.minimized.delete(e),this.tray.has(e)&&this.tray.remove(e),t.el.style.display="",t.el.classList.remove("is-minimizing"),this.focus(e),T(t.el,"is-opening"))}enableDrag(e,t){let n=0,i=0,o=0,a=0,r=!1;const l=d=>{if(!r)return;const h=o+(d.clientX-n),m=a+(d.clientY-i);e.style.left=`${Math.min(Math.max(h,-e.clientWidth+80),this.root.clientWidth-80)}px`,e.style.top=`${Math.min(Math.max(m,0),this.root.clientHeight-40)}px`},c=d=>{r=!1,t.releasePointerCapture?.(d.pointerId),window.removeEventListener("pointermove",l),window.removeEventListener("pointerup",c)};t.addEventListener("pointerdown",d=>{d.target.closest(".window__dot--close, .window__btn")||e.classList.contains("is-maximized")||(r=!0,n=d.clientX,i=d.clientY,o=e.offsetLeft,a=e.offsetTop,t.setPointerCapture?.(d.pointerId),window.addEventListener("pointermove",l),window.addEventListener("pointerup",c))})}enableResize(e,t,n){for(const i of n)i.addEventListener("pointerdown",o=>{if(o.preventDefault(),o.stopPropagation(),t.classList.contains("is-maximized"))return;this.focus(e);const a=i.dataset.dir??"se",r=o.clientX,l=o.clientY,c=t.offsetWidth,d=t.offsetHeight,h=u=>{a.includes("e")&&(t.style.width=`${Math.max(j,c+(u.clientX-r))}px`),a.includes("s")&&(t.style.height=`${Math.max(G,d+(u.clientY-l))}px`)},m=u=>{i.releasePointerCapture?.(u.pointerId),window.removeEventListener("pointermove",h),window.removeEventListener("pointerup",m)};i.setPointerCapture?.(o.pointerId),window.addEventListener("pointermove",h),window.addEventListener("pointerup",m)})}}function U(s){const e=[];let t="",n=!1,i=null;for(let o=0;o<s.length;o++){const a=s[o];if(i){a===i?i=null:i==='"'&&a==="\\"&&(s[o+1]==='"'||s[o+1]==="\\")?t+=s[++o]:t+=a;continue}if(a==="\\"&&o+1<s.length){t+=s[++o],n=!0;continue}if(a==='"'||a==="'"){i=a,n=!0;continue}if(/\s/.test(a)){n&&(e.push(t),t="",n=!1);continue}t+=a,n=!0}return n&&e.push(t),e}function fe(s){const e=[],t={};for(const n of s){const i=/^--([^=\s]+)(?:=(.*))?$/.exec(n);i?t[i[1]]=i[2]!==void 0?i[2]:!0:e.push(n)}return{args:e,flags:t}}const D="visitor@lucenity:~$",ee="lucenity:history",H=200,ge={default:"terminal__line",dim:"terminal__line terminal__line--dim",sub:"terminal__line terminal__line--sub"};function ye(s){if(s.length===0)return"";let e=s[0];for(const t of s.slice(1)){for(;!t.startsWith(e);)e=e.slice(0,-1);if(e==="")break}return e}function we(s,e,t){if(Math.abs(s.length-e.length)>t)return t+1;const n=Array.from({length:s.length+1},()=>new Array(e.length+1).fill(0));for(let i=0;i<=s.length;i++)n[i][0]=i;for(let i=0;i<=e.length;i++)n[0][i]=i;for(let i=1;i<=s.length;i++)for(let o=1;o<=e.length;o++){const a=s[i-1]===e[o-1]?0:1;let r=Math.min(n[i-1][o]+1,n[i][o-1]+1,n[i-1][o-1]+a);i>1&&o>1&&s[i-1]===e[o-2]&&s[i-2]===e[o-1]&&(r=Math.min(r,n[i-2][o-2]+1)),n[i][o]=r}return n[s.length][e.length]}function be(s,e){if(s.length<2)return null;const t=s.length>=6?2:1;let n=null;for(const i of e){const o=we(s,i,t);o<=t&&(!n||o<n.dist)&&(n={name:i,dist:o})}return n?.name??null}function Ee(){try{const s=localStorage.getItem(ee);if(!s)return[];const e=JSON.parse(s);return Array.isArray(e)?e.filter(t=>typeof t=="string"):[]}catch{return[]}}function ve(s){try{localStorage.setItem(ee,JSON.stringify(s))}catch{}}class ke{scrollEl;inputRow;inputEl;ghostBefore;caretText;ghostAfter;registry;windows;history=[];historyIndex=0;busy=!1;onTyping;onSend;onClear;constructor(e,t,n){this.registry=t,this.windows=n;const i=document.createElement("div");i.className="terminal";const o=document.createElement("div");o.className="terminal__surface";const a=document.createElement("div");a.className="terminal__scroll",a.setAttribute("role","log"),a.setAttribute("aria-live","polite");const r=document.createElement("div");r.className="terminal__input-row";const l=document.createElement("span");l.className="terminal__prompt",l.textContent=D;const c=document.createElement("span");c.className="terminal__field";const d=document.createElement("span");d.className="terminal__ghost",d.setAttribute("aria-hidden","true");const h=document.createTextNode(""),m=document.createElement("span");m.className="caret";const u=document.createTextNode("");m.append(u);const g=document.createTextNode("");d.append(h,m,g);const y=document.createElement("input");y.className="terminal__input",y.type="text",y.setAttribute("aria-label","terminal input"),y.autocomplete="off",y.autocapitalize="off",y.spellcheck=!1,c.append(d,y),r.append(l,c),a.append(r),o.append(a),i.append(o),e.append(i),this.scrollEl=a,this.inputRow=r,this.inputEl=y,this.ghostBefore=h,this.caretText=u,this.ghostAfter=g,this.history=Ee(),this.historyIndex=this.history.length,y.addEventListener("input",()=>this.renderGhost()),document.addEventListener("selectionchange",()=>{document.activeElement===this.inputEl&&this.renderGhost()}),y.addEventListener("keyup",()=>this.renderGhost()),y.addEventListener("click",()=>this.renderGhost()),y.addEventListener("keydown",p=>this.onKeydown(p)),o.addEventListener("click",()=>{(window.getSelection()?.toString()??"")===""&&this.focusInput()}),document.addEventListener("keydown",p=>{if(p.ctrlKey&&(p.key==="]"||p.key==="[")){p.preventDefault(),this.windows.cycle(p.key==="]"?1:-1);return}if(this.busy||p.metaKey||p.ctrlKey||p.altKey)return;const f=document.activeElement;f!==this.inputEl&&(f instanceof Element&&f.closest(".window")||(p.key.length===1||p.key==="Backspace"||p.key==="Enter")&&this.focusInput())}),this.renderGhost()}print(e="",t="default"){const n=this.makeLine(t);n.textContent=e,this.insertLine(n)}printEl(e){this.insertLine(e)}clear(){for(const e of[...this.scrollEl.children])e!==this.inputRow&&e.remove();this.onClear?.()}focusInput(){this.inputEl.focus()}async typeLine(e,t="default",n=12){const i=this.makeLine(t);this.insertLine(i),await N(i,e,{speed:n}),this.scrollToBottom()}setBusy(e){this.busy=e,this.inputEl.disabled=e}echoPrompt(e){const t=this.makeLine("default"),n=document.createElement("span");n.className="terminal__prompt",n.textContent=`${D} `,t.append(n,document.createTextNode(e)),this.insertLine(t)}makeLine(e){const t=document.createElement("div");return t.className=ge[e],t}insertLine(e){this.scrollEl.insertBefore(e,this.inputRow),this.scrollToBottom()}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}renderGhost(){const e=this.inputEl.value,t=this.inputEl.selectionStart??e.length;this.ghostBefore.textContent=e.slice(0,t),this.caretText.textContent=e[t]??"",this.ghostAfter.textContent=e.slice(t+1),this.onTyping?.(e.length)}onKeydown(e){if(this.busy){e.preventDefault();return}switch(e.key){case"Enter":e.preventDefault(),this.submit(this.inputEl.value);break;case"ArrowUp":e.preventDefault(),this.recallHistory(-1);break;case"ArrowDown":e.preventDefault(),this.recallHistory(1);break;case"Tab":e.preventDefault(),this.handleTab();break;default:e.key==="l"&&e.ctrlKey&&(e.preventDefault(),this.clear())}}pushHistory(e){this.history[this.history.length-1]!==e&&(this.history.push(e),this.history.length>H&&(this.history=this.history.slice(this.history.length-H)),ve(this.history)),this.historyIndex=this.history.length}recallHistory(e){if(this.history.length===0)return;this.historyIndex=Math.min(Math.max(this.historyIndex+e,0),this.history.length);const t=this.history[this.historyIndex]??"";this.inputEl.value=t,this.inputEl.setSelectionRange(t.length,t.length),this.renderGhost()}handleTab(){const e=this.inputEl.value,t=U(e),n=/\s$/.test(e),i=t.length===0||t.length===1&&!n,o=n?"":t[t.length-1]??"";let a;if(i)a=this.registry.visible().map(c=>c.name);else{const c=this.registry.get(t[0]??"");if(!c?.complete)return;const d=n?t.slice(1):t.slice(1,-1);a=c.complete(d)}const r=a.filter(c=>c.startsWith(o)).sort();if(r.length===0)return;if(r.length===1){const c=r[0],d=i?[]:n?t:t.slice(0,-1);this.setInput([...d,c].join(" ")+" ");return}const l=ye(r);if(l.length>o.length){const c=i?[]:n?t:t.slice(0,-1);this.setInput([...c,l].join(" "));return}this.print(r.join("  "),"dim")}setInput(e){this.inputEl.value=e,this.inputEl.setSelectionRange(e.length,e.length),this.renderGhost()}async submit(e){const t=e.trim();if(this.echoPrompt(e),this.inputEl.value="",this.renderGhost(),this.onSend?.(),t==="")return;this.pushHistory(t);const n=U(t);if(n.length===0)return;const i=(n[0]??"").replace(/^\//,""),{args:o,flags:a}=fe(n.slice(1)),r=this.registry.get(i);if(!r){const l=be(i,this.registry.visible().map(c=>c.name));this.print(l?`command not found: ${i} — did you mean \`${l}\`?`:`command not found: ${i} — type \`help\``,"dim");return}this.setBusy(!0);try{await r.run({terminal:this,windows:this.windows,args:o,flags:a,raw:t})}catch(l){const c=l instanceof Error?l.message:String(l);this.print(`error: ${c}`,"dim")}finally{this.setBusy(!1),this.focusInput()}}}const Se=["┌───────────────────────────┐","│   l u c e n i t y O S     │","│   bios v1.1 — mono/64k    │","└───────────────────────────┘"],_e=[["● cpu ................ ok","sub",30],["● memory ............. 640k (plenty)","sub",30],["● pixel shaders ...... ok","sub",40],["● crt scanlines ...... flickering nicely","sub",30],["● liffy.service ...... loaded","sub",60],["● cat daemon ......... asleep (do not wake)","sub",120],["mounting /home/visitor ... done","dim",60]];async function Le(s){s.setBusy(!0);for(const e of Se)s.print(e,"dim");b()||await S(180);for(const[e,t,n]of _e)await s.typeLine(e,t,6),b()||await S(n);s.print(),s.print("welcome. type `help` to see what i can do.","default"),s.print(),s.setBusy(!1),s.focusInput()}const Ce=["..#.......#...............",".###.....###..............",".#.##....#.##.............",".#..##..##..##............",".#.########..##...........",".################.........",".#################........",".##################.......",".##################.......","###################.......","###################.#####.","##...####...##############","##########################","####################...###",".################.........","..#############..........."],Te={sleep:{},awake:{10:"##..#####..########.#####.",11:"##..#####..###############"},think:{10:"##########.########.#####.",11:"##..####..################"},"munch-a":{12:"#####...##################"},"munch-b":{12:"######..##################"},peek:{10:"##..###############.#####.",11:"##..#####...##############"}};function te(s="sleep"){const e=Te[s];return Ce.map((t,n)=>e[n]??t).map(t=>[...t].map(n=>n==="#"?"██":"  ").join("")).join(`
`)}function Ae(s,e){const t=s.querySelector(".cat__art");t&&(t.textContent=te(e)),s.dataset.frame=e}function R(s="cat",e="sleep"){const t=document.createElement("div");t.className=s,t.dataset.frame=e;const n=document.createElement("pre");n.className="cat__art",n.textContent=te(e),n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="cat__zzz",i.setAttribute("aria-hidden","true");for(let o=0;o<3;o++){const a=document.createElement("span");a.className="cat__z",a.textContent="z",a.style.animationDelay=`${o*.9}s`,i.append(a)}return t.append(i,n),t}const Ie=24,Me=3,xe=2e3,W=["quiet!","let me sleep!"],Pe=1e3,Ne=3e3,q=5,J=260,Re=45e3,ze=1e5,Oe=6e4,$e=15e3,Be=2e4,Fe=4500,je=["zzz... sudo... nice try... zzz","mrrp... a command... named after me...","zzz... git clone... take one home...","...ctrl+] ... windows go round... zzz","zzz... liffy keeps secrets too...","...feed me... 24 keys... zzz"],Ge=["mrrp... say meow... i dare you...","zzz... cookie... just type it...","...hold me... one whole second... prrr","zzz... stare at me... see what happens..."];class ne{el;catEl;fillEl;meterEl;plateEl;bubbleEl;opts;cornered=!1;munching=!1;thinking=!1;bobbing=!1;staring=!1;petting=!1;clickTimes=[];bubbleTimer=null;petTimer=null;hoverTimer=null;murmurs;murmurIdx=0;lastActivity=performance.now();constructor(e){this.opts=e,this.el=document.createElement("div"),this.el.className=`catc catc--${e.mode}`,this.el.dataset.frame=e.idleFrame,this.catEl=R("cat catc__cat",e.idleFrame),this.bubbleEl=document.createElement("span"),this.bubbleEl.className="catc__bubble",this.bubbleEl.setAttribute("role","status"),this.meterEl=document.createElement("div"),this.meterEl.className="catc__meter",this.fillEl=document.createElement("div"),this.fillEl.className="catc__fill",this.plateEl=document.createElement("button"),this.plateEl.className="catc__plate",this.plateEl.type="button",this.plateEl.title="feed the cat",this.plateEl.setAttribute("aria-label","feed the cat a cookie"),this.meterEl.append(this.fillEl,this.plateEl),this.el.append(this.bubbleEl,this.catEl,this.meterEl),e.mount.append(this.el),this.wireAngryClicks(),e.mode==="liffy"&&(this.wirePetHold(),this.wireStareHover()),this.plateEl.addEventListener("click",t=>{t.stopPropagation(),this.feed()}),this.murmurs=[...e.mode==="hero"?je:Ge].sort(()=>Math.random()-.5),this.scheduleMurmur(Re)}onTyping(e){e>0&&(this.lastActivity=performance.now()),e>0&&!this.cornered&&this.corner();const t=Math.min(e/Ie,1);this.fillEl.style.width=`${t*100}%`,this.el.classList.toggle("catc--typing",e>0||this.munching),this.plateEl.classList.toggle("is-served",t>=1)}onSend(){this.lastActivity=performance.now(),this.fillEl.style.width="0%",this.plateEl.classList.remove("is-served"),this.munching||this.el.classList.remove("catc--typing")}fillNow(){this.cornered||this.corner(),this.fillEl.style.width="100%",this.el.classList.add("catc--typing"),this.plateEl.classList.add("is-served")}corner(){this.cornered=!0,this.el.classList.add("catc--corner"),this.setFrame("sleep"),this.opts.onCorner?.()}restoreCenter(){this.cornered=!1,this.el.classList.remove("catc--corner"),this.onSend(),this.setFrame(this.opts.idleFrame)}feed(){if(this.munching)return;if(this.munching=!0,this.plateEl.classList.remove("is-served"),this.fillEl.style.width="0%",b()){this.setFrame("munch-a"),this.say("nom.",900),window.setTimeout(()=>{this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing")},900);return}this.say("nom nom nom",q*J+300);let e=0;const t=window.setInterval(()=>{this.setFrame(e%2===0?"munch-a":"munch-b"),e++,e>q&&(window.clearInterval(t),this.munching=!1,this.setFrame(this.restFrame()),this.el.classList.remove("catc--typing"))},J)}think(e){this.thinking=e,!this.munching&&this.setFrame(e?"think":this.restFrame())}bob(e){this.bobbing=e,e?(this.munching||this.setFrame("awake"),b()||this.el.classList.add("catc--bob")):(this.el.classList.remove("catc--bob"),!this.munching&&!this.thinking&&this.setFrame(this.restFrame()))}hop(){T(this.el,"catc--hop")}say(e,t=2e3){this.bubbleTimer!==null&&window.clearTimeout(this.bubbleTimer),this.bubbleEl.textContent=e,this.bubbleEl.classList.add("is-visible"),this.bubbleTimer=window.setTimeout(()=>{this.bubbleEl.classList.remove("is-visible"),this.bubbleTimer=null},t)}scheduleMurmur(e){window.setTimeout(()=>this.tryMurmur(),e)}tryMurmur(){if(!this.el.isConnected)return;if(this.munching||this.thinking||this.bobbing||this.petting||this.bubbleTimer!==null||document.hidden||performance.now()-this.lastActivity<Be){this.scheduleMurmur($e);return}this.say(this.murmurs[this.murmurIdx++%this.murmurs.length],Fe),this.scheduleMurmur(ze+Math.random()*Oe)}restFrame(){return this.cornered?"sleep":this.opts.idleFrame}setFrame(e){Ae(this.catEl,e),this.el.dataset.frame=e}wireAngryClicks(){this.catEl.addEventListener("click",()=>{if(this.petting)return;const e=performance.now();this.clickTimes=this.clickTimes.filter(t=>e-t<xe),this.clickTimes.push(e),this.clickTimes.length>=Me&&(this.clickTimes=[],T(this.el,"catc--shake"),this.say(W[Math.floor(Math.random()*W.length)],2e3))})}wirePetHold(){this.catEl.addEventListener("pointerdown",()=>{this.petTimer=window.setTimeout(()=>{this.petting=!0,this.el.classList.add("catc--pet"),this.say("prrrrr.",6e4)},Pe)});const e=()=>{this.petTimer!==null&&window.clearTimeout(this.petTimer),this.petTimer=null,this.petting&&(this.el.classList.remove("catc--pet"),this.bubbleEl.classList.remove("is-visible"),window.setTimeout(()=>{this.petting=!1},0))};this.catEl.addEventListener("pointerup",e),this.catEl.addEventListener("pointerleave",e)}wireStareHover(){this.catEl.addEventListener("mouseenter",()=>{this.hoverTimer=window.setTimeout(()=>{!this.munching&&!this.thinking&&!this.bobbing&&(this.staring=!0,this.setFrame("peek"))},Ne)}),this.catEl.addEventListener("mouseleave",()=>{this.hoverTimer!==null&&window.clearTimeout(this.hoverTimer),this.hoverTimer=null,this.staring&&(this.staring=!1,this.setFrame(this.restFrame()))})}}const Q=["hello, stranger!","oh, you're back.","shh. the cat sleeps.","type something. anything."];function Ue(s){const e=document.createElement("div");e.className="hero",e.setAttribute("aria-hidden","true");const t=document.createElement("div");t.className="hero__title";const n=document.createElement("span"),i=document.createElement("span");i.className="caret hero__caret",t.append(n,i);const o=document.createElement("div");o.className="hero__sub",o.textContent="do not wake the cat. type instead.",e.append(t,o),s.append(e);const a=new ne({mount:s,mode:"hero",idleFrame:"sleep",onCorner:()=>e.classList.add("hero--hidden")}),r=Q[Math.floor(Math.random()*Q.length)];return(async()=>(T(e,"is-arriving"),T(a.el,"is-arriving"),b()||await S(350),await N(n,r,{speed:55}),b()||await S(250),o.classList.add("is-visible")))(),{companion:a,restore(){e.classList.remove("hero--hidden"),a.restoreCenter()}}}const z=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function De(s){let e=z(s);return e=e.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(t,n,i)=>`<a href="${i}" target="_blank" rel="noreferrer noopener">${n}</a>`),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/__([^_]+)__/g,"<strong>$1</strong>"),e=e.replace(/(^|[^*])\*([^*\s][^*]*)\*/g,"$1<em>$2</em>"),e=e.replace(/(^|[^_])_([^_\s][^_]*)_/g,"$1<em>$2</em>"),e}function I(s){return s.split(/(`[^`]+`)/g).map(e=>e.length>=2&&e.startsWith("`")&&e.endsWith("`")?`<code>${z(e.slice(1,-1))}</code>`:De(e)).join("")}function He(s){return s.replace(/```[^\n]*\n?/g,"").replace(/`([^`]+)`/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/__([^_]+)__/g,"$1").replace(/\*([^*]+)\*/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^#{1,6}\s+/gm,"").replace(/^\s*[-*+]\s+/gm,"• ").replace(/^>\s?/gm,"").replace(/\n{3,}/g,`

`).trim()}const M=/^(\s*)([-*+]|\d+\.)\s+(.*)$/;function ie(s){const e=s.replace(/\r\n?/g,`
`).split(`
`),t=[];let n=0;for(;n<e.length;){const i=e[n];if(/^```/.test(i.trim())){const r=i.trim().slice(0,3);n++;const l=[];for(;n<e.length&&!e[n].trim().startsWith(r);)l.push(e[n]),n++;n++,t.push(`<pre class="md-pre"><code>${z(l.join(`
`))}</code></pre>`);continue}if(i.trim()===""){n++;continue}const o=/^(#{1,6})\s+(.*)$/.exec(i);if(o){const r=o[1].length;t.push(`<h${r}>${I(o[2].trim())}</h${r}>`),n++;continue}if(/^(-{3,}|\*{3,}|_{3,})\s*$/.test(i.trim())){t.push("<hr />"),n++;continue}if(/^>\s?/.test(i)){const r=[];for(;n<e.length&&/^>\s?/.test(e[n]);)r.push(e[n].replace(/^>\s?/,"")),n++;t.push(`<blockquote>${I(r.join(" "))}</blockquote>`);continue}if(M.test(i)){const l=/^\s*\d+\./.test(i)?"ol":"ul",c=[];for(;n<e.length&&M.test(e[n]);){const d=M.exec(e[n]);c.push(`<li>${I(d[3])}</li>`),n++}t.push(`<${l}>${c.join("")}</${l}>`);continue}const a=[];for(;n<e.length&&e[n].trim()!==""&&!/^```/.test(e[n].trim())&&!/^#{1,6}\s/.test(e[n])&&!/^>\s?/.test(e[n])&&!M.test(e[n])&&!/^(-{3,}|\*{3,}|_{3,})\s*$/.test(e[n].trim());)a.push(e[n]),n++;t.push(`<p>${I(a.join(" "))}</p>`)}return t.join(`
`)}const We=`# Nafees S

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
- Type \`contact\` for the rest, or \`liffy\` to just ask me things.`;function qe(s){const e=document.createElement("div");e.className="docs",e.innerHTML=ie(We),e.prepend(R("cat docs__avatar")),s.windows.open({id:"about",title:"about — nafees",content:e,width:540,height:460}),s.terminal.print("opened: about","dim")}function Je(s){const e=document.createElement("div");e.className="contact",e.innerHTML=`
    <h2>contact</h2>
    <ul class="contact__list">
      <li><span class="muted">github</span> —
        <a href="https://github.com/lucenity0" target="_blank" rel="noreferrer noopener">github.com/lucenity0</a></li>
      <li><span class="muted">email</span> —
        <a href="mailto:hello@lucenity.dev">hello@lucenity.dev</a></li>
    </ul>
    <p class="muted">placeholder — swap in real handles in Phase 3.</p>
  `,s.windows.open({id:"contact",title:"contact",content:e,width:420,height:260}),s.terminal.print("opened: contact","dim")}const k=[{slug:"mlnotes",name:"ML Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://mlnotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"bdanotes",name:"BDA Notes",blurb:"a live web thing — embeds inside its window",kind:"web",url:"https://bdanotes.lucenity.dev/",embeddable:!0,tags:["web","placeholder"]},{slug:"schedulr",name:"Schedulr",blurb:"a scheduling app for teams and individuals",kind:"web",url:"https://srikrishna-ps.github.io/schedulr/",embeddable:!0,tags:["web","productivity","team"]},{slug:"sample-ios",name:"sample iOS app",blurb:"an app store listing — opens its landing page",kind:"ios",url:"https://www.apple.com/app-store/",embeddable:!1,tags:["ios","placeholder"]}];function Qe(s){return k.find(e=>e.slug===s)}function se(s,e){const t=Qe(e);if(!t){s.terminal.print(`no such project: ${e} — try \`projects\``,"dim");return}const n=t.embeddable?Ve(t):Ye(t),i=s.windows.open({id:`project:${t.slug}`,title:`project — ${t.name}`,content:n,width:720,height:500});i.bodyEl.style.padding="0",s.terminal.print(`opened: ${t.name}`,"dim")}function oe(s){const e=document.createElement("div");e.className="project__bar";const t=document.createElement("span");t.className="project__dots",t.textContent="◦ ◦ ◦";const n=document.createElement("span");return n.className="project__url",n.textContent=s,e.append(t,n),e}const Ke=1e4;function Ve(s){const e=document.createElement("div");e.className="project",e.append(oe(s.url));const t=document.createElement("div");t.className="project__stage";const n=document.createElement("iframe");n.className="project__frame",n.src=s.url,n.loading="lazy",n.referrerPolicy="no-referrer",n.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),n.title=s.name;const i=document.createElement("div");i.className="project__loading";const o=document.createElement("span");o.className="project__loading-label",o.textContent=`loading ${s.name}…`;const a=document.createElement("span");a.className="project__loadbar",a.append(document.createElement("i")),i.append(o,a);let r=!1;const l=()=>{r||(r=!0,window.clearTimeout(c),i.classList.add("is-done"),window.setTimeout(()=>i.remove(),400))};n.addEventListener("load",l);const c=window.setTimeout(()=>{if(r)return;r=!0,i.classList.add("is-error"),o.textContent="this is taking too long — the site may not want to be framed.",a.remove();const d=document.createElement("a");d.className="project__open",d.href=s.url,d.target="_blank",d.rel="noreferrer noopener",d.textContent="open in new tab ↗",i.append(d)},Ke);return t.append(n,i),e.append(t),e}function Ye(s){const e=document.createElement("div");e.className="project project--fallback",e.append(oe(s.url));const t=document.createElement("div");t.className="project__fallback",t.innerHTML=`
    <p class="muted">this one can't be embedded (${s.kind==="ios"?"iOS / App&nbsp;Store":"the site blocks framing"}).</p>
    <p><strong>${s.name}</strong></p>
    <p class="muted">${s.blurb}</p>
  `;const n=document.createElement("a");return n.className="project__open",n.href=s.url,n.target="_blank",n.rel="noreferrer noopener",n.textContent="open in new tab ↗",t.append(n),e.append(t),e}function Xe(){const s=new Set;for(const e of k)for(const t of e.tags??[])t!=="placeholder"&&s.add(t);return[...s].sort()}function Ze(s,e){const t=document.createElement("button");t.className="pgrid__card",t.type="button";const n=document.createElement("span");n.className="pgrid__thumb",n.setAttribute("aria-hidden","true");const i=document.createElement("span");i.className="pgrid__initial",i.textContent=e.name.slice(0,1).toUpperCase(),n.append(i);const o=document.createElement("strong");o.className="pgrid__name",o.textContent=e.name;const a=document.createElement("span");a.className="pgrid__blurb",a.textContent=e.blurb;const r=document.createElement("span");return r.className="pgrid__meta",r.textContent=[e.kind,...(e.tags??[]).filter(l=>l!=="placeholder"&&l!==e.kind)].join(" · "),t.append(n,o,a,r),t.addEventListener("click",()=>se(s,e.slug)),t}function et(s){const e=document.createElement("div");e.className="pgrid";const t=document.createElement("div");t.className="pgrid__filters";const n=document.createElement("div");n.className="pgrid__grid";const i=new Map;for(const c of k)i.set(c,Ze(s,c));let o="all";const a=[],r=c=>{o=c;for(const h of a)h.classList.toggle("is-active",h.dataset.tag===c);let d=0;for(const[h,m]of i){const u=c==="all"||(h.tags??[]).includes(c)||h.kind===c;m.hidden=!u,u&&d++}l.hidden=d>0};for(const c of["all",...Xe()]){const d=document.createElement("button");d.className="pgrid__chip",d.type="button",d.dataset.tag=c,d.textContent=c,d.addEventListener("click",()=>r(c)),a.push(d),t.append(d)}const l=document.createElement("p");l.className="pgrid__empty muted",l.textContent="nothing tagged that (yet).",l.hidden=!0;for(const c of i.values())n.append(c);e.append(t,n,l),r(o),s.windows.open({id:"projects",title:"projects",content:e,width:560,height:420}),s.terminal.print(`opened: projects (${k.length})`,"dim")}const K=1.4,V=.72,tt=2.4,nt=3,it=.75,st=.9,ot=5,at=4,rt=3,O=new Set(["a","an","the","is","are","was","were","be","been","being","do","does","did","of","to","in","on","for","and","or","but","with","at","by","from","as","it","its","this","that","these","those","i","you","he","she","they","we","me","him","her","them","his","your","my","our","their","what","which","who","whom","how","when","where","why","can","could","would","should","will","shall","have","has","had","about","tell","know","any","some","into","so","u","does","did","get","got","give","us","please","hey","im"]),lt=new Set(["work","use","using","make","made","build","built","run","get","got","thing","stuff","look","like","happen","involve","mean","explain","describe","show"]);function ct(s){return s.length<=3?s:s.endsWith("ies")?`${s.slice(0,-3)}y`:s.endsWith("ing")&&s.length>5?s.slice(0,-3):s.endsWith("ed")&&s.length>4?s.slice(0,-2):s.endsWith("s")&&!s.endsWith("ss")?s.slice(0,-1):s}function C(s){return s.toLowerCase().split(/[^a-z0-9+#.]+/).map(e=>e.replace(/^[.]+|[.]+$/g,"")).filter(e=>e.length>1&&!O.has(e)).map(ct)}const ae=s=>[...new Set(s)];function re(s){return s.toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim()}const Y=s=>` ${s} `;function dt(s,e,t){if(Math.abs(s.length-e.length)>t)return t+1;let n=Array.from({length:e.length+1},(i,o)=>o);for(let i=1;i<=s.length;i++){const o=[i];let a=i;for(let r=1;r<=e.length;r++){const l=s[i-1]===e[r-1]?0:1,c=Math.min(n[r]+1,o[r-1]+1,n[r-1]+l);o.push(c),c<a&&(a=c)}if(a>t)return t+1;n=o}return n[e.length]}const ht=new Set(["about","work","works","fun","intro","bio","apps"]);function ut(s){return s.includes(" ")?!0:s.length>=5&&!ht.has(s)&&!O.has(s)}const le="",mt=/\b(?:[A-Za-z]\.){2,}|\b(?:prof|dr|mr|mrs|ms|sr|jr|st|vs|etc|fig|no|ph|approx|e\.g|i\.e|a\.m|p\.m)\.|\b[A-Z]\.(?=\s+[A-Z0-9])/g,pt=s=>s.replace(mt,e=>e.replace(/\./g,le)),ft=s=>s.replace(new RegExp(le,"g"),".");function gt(s){const e=[];for(const t of s.split(/\n{2,}/)){const n=pt(t.replace(/\s*\n\s*/g," ").trim());if(n)for(const i of n.split(/(?<=[.!?])\s+(?=[A-Z0-9("'*])/)){const o=ft(i).trim();o&&e.push({text:o,terms:new Set(C(o))})}}return e}function yt(s){const e=s[0]??"topic";return e.includes(" ")?s.filter(n=>!n.includes(" ")&&n.length>=3&&!O.has(n)).sort((n,i)=>n.length-i.length)[0]??e:e}function wt(s){const e=[];let t=!1;for(const n of s.split(`
`)){if(t)if(n.trim()===""||/^#{1,3}\s/.test(n))t=!1;else continue;if(/^\s*todo\b/i.test(n)){t=!0;continue}e.push(n)}return e.join(`
`)}function bt(s){const t=wt(s.replace(/\r\n?/g,`
`).replace(/<!--[\s\S]*?-->/g,"")).split(`
`),n=[];let i="",o=[];const a=()=>{i&&o.join("").trim()&&n.push({heading:i,body:o})};for(const r of t){const l=/^#{1,3}\s+(.*)$/.exec(r);l?(a(),i=l[1].trim(),o=[]):i&&o.push(r)}return a(),n.map(({heading:r,body:l})=>{const c=ae(r.split(/\s*[/|]\s*/).map(u=>re(u)).filter(Boolean)),d=gt(He(l.join(`
`)).trim()),h=new Map;let m=0;for(const u of d)for(const g of C(u.text))h.set(g,(h.get(g)??0)+1),m++;return{label:yt(c),aliases:c,namePhrases:c.filter(ut),aliasTokens:new Set(c.flatMap(u=>C(u))),nameTokens:new Set(C(c[0]??"")),sentences:d,tf:h,length:m}})}const Et=/^(tell me more|more|more please|go on|continue|keep going|say more|elaborate|expand|and\??|and then\??|what else\??|anything else\??|\.\.\.|…)$/,vt=/\b(it|its|it's|that|this|they|them|those|these|the (app|project|tool|thing|system|paper|model|one|setup))\b/;class kt{chunks;idf=new Map;avgdl;names=[];topic=null;constructor(e){this.chunks=bt(e);const t=this.chunks.length||1,n=new Map;let i=0;for(const o of this.chunks){i+=o.length;for(const a of new Set([...o.tf.keys(),...o.aliasTokens]))n.set(a,(n.get(a)??0)+1)}for(const[o,a]of n)this.idf.set(o,Math.log(1+(t-a+.5)/(a+.5)));this.avgdl=i/t,this.chunks.forEach((o,a)=>{for(const r of o.namePhrases)r.includes(" ")||this.names.push({token:r,index:a})})}async ask(e,t){const n=e.trim(),i=n.toLowerCase(),o=St(i);if(o)return{text:o,grounded:!0};const a=ae(C(n)),r=re(n);if((Et.test(i.replace(/[!.?]+$/,"").trim())||a.length===0)&&this.topic)return this.continueTopic();if(a.length===0)return this.reprompt();if(this.topic&&vt.test(i))return this.answerFrom(this.chunks[this.topic.index],this.topic.index,a);const c=this.chunks.map((m,u)=>this.scoreChunk(m,u,a,r)).sort((m,u)=>u.score-m.score);let d=c[0];const h=d!=null&&(d.phraseHit||d.bestIdf>=it||d.matched>=2);if(!d||!h){const m=this.rescueTypo(a);if(m==null)return this.fallback();d=c.find(u=>u.index===m)}return this.answerFrom(d.chunk,d.index,a)}scoreChunk(e,t,n,i){let o=0,a=0,r=0;for(const c of n){const d=this.idf.get(c)??0,h=e.tf.get(c)??0,m=h===0?0:h*(K+1)/(h+K*(1-V+V*(e.length/this.avgdl))),u=d*m,g=e.aliasTokens.has(c)?d*tt:0;(u>0||g>0)&&(a++,d>r&&(r=d)),o+=u+g}let l=!1;for(const c of e.namePhrases)Y(i).includes(Y(c))&&(o+=nt,l=!0);return{chunk:e,index:t,score:o,matched:a,bestIdf:r,phraseHit:l}}rescueTypo(e){let t=null;for(const n of e){if(n.length<4)continue;const i=n.length>=7?2:1;for(const{token:o,index:a}of this.names){const r=dt(n,o,i);r<=i&&(!t||r<t.dist)&&(t={index:a,dist:r})}}return t?.index??null}answerFrom(e,t,n){const i=n.filter(l=>!e.nameTokens.has(l)&&!lt.has(l)&&(this.idf.get(l)??0)>=st);if(i.length>0){const l=this.extract(e,i);if(l.length>0)return this.topic={index:t,shown:new Set(l)},{text:l.map(c=>e.sentences[c].text).join(" "),grounded:!0,sources:[e.label]}}const o=e.sentences.slice(0,ot),a=new Set(o.map((l,c)=>c));this.topic={index:t,shown:a};let r=o.map(l=>l.text).join(" ");return e.sentences.length>o.length&&(r+=' — say "more" for the rest.'),{text:r,grounded:!0,sources:[e.label]}}extract(e,t){return e.sentences.map((i,o)=>{let a=0;for(const r of t)i.terms.has(r)&&(a+=this.idf.get(r)??.5);return{i:o,sc:a}}).filter(i=>i.sc>0).sort((i,o)=>o.sc-i.sc).slice(0,rt).sort((i,o)=>i.i-o.i).map(i=>i.i)}continueTopic(){const e=this.topic,t=this.chunks[e.index],n=[];for(let a=0;a<t.sentences.length;a++)e.shown.has(a)||n.push(a);if(n.length===0)return{text:`that's everything in my notes on ${t.label}. ask me something specific — its stack, how it works, who's involved.`,grounded:!0,sources:[t.label]};const i=n.slice(0,at);i.forEach(a=>e.shown.add(a));let o=i.map(a=>t.sentences[a].text).join(" ");return e.shown.size<t.sentences.length&&(o+=" — more?"),{text:o,grounded:!0,sources:[t.label]}}reprompt(){return{text:`ask me something about nafees — try: ${this.topicList()}.`,grounded:!1}}fallback(){return{text:`hmm, that's not in my notes. i can talk about: ${this.topicList()}.`,grounded:!1}}topicList(){return this.chunks.slice(0,8).map(e=>e.label).join(", ")}}function St(s){const e=s.replace(/[!.?]+$/,"").trim();return/^(hi|hey|hello|yo|sup|howdy|hiya|heya|hii+|hey there|good (morning|evening|afternoon))\b/.test(e)?`hey! i'm liffy — nafees's terminal sidekick. ask me anything about him. try: "what does he build?"`:/^(thanks|thank you|thx|ty|tysm|appreciate it|cheers|nice|cool|awesome|great)\b/.test(e)?"anytime :)":/^(bye|cya|goodbye|see ya|see you|later|gtg|good night|gn)\b/.test(e)?"catch you later! (close the window whenever)":/\b(how are you|how's it going|hows it going|you good|wyd)\b/.test(e)?"just vibing in the terminal, waiting for questions about nafees. what do you want to know?":/(are|r) you (a )?(bot|ai|robot|real|human|person|chatgpt|claude)/.test(e)?"i'm a lil retrieval bot — no LLM, no keys. i only know what's in nafees's notes, and i answer straight from them.":/(who|what) are you|your name|are you liffy(?!\s*(review|the))/.test(e)?"i'm liffy, a tiny assistant that knows nafees. ask away — projects, skills, research, contact, whatever.":/^(help|what can you do|commands|options|menu|\?)$/.test(e)?`i answer questions about nafees from his notes. try: "what does he build?", "tell me about askcal", "what's his stack?", or just a topic name.`:/(who (made|built|created) you)/.test(e)?"nafees built me for this site — a grounded retriever over his own notes. ask me about him next.":null}const _t=`# Liffy's notes on Nafees

<!--
  This is Liffy's brain. Each \`##\`/\`###\` heading is a retrievable chunk;
  when someone asks a question, Liffy finds the best-matching section and
  reads it back. Tips:
    - Put likely question keywords in the HEADINGS (they're weighted 2x).
    - Keep sections short and conversational — they're spoken verbatim.
    - Replace every TODO with real info.
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
This portfolio site itself runs on TypeScript + Vite, no framework.

## projects / work / portfolio / what has he built / what do you build / apps / what has nafees made

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

## hateful meme detection / multimodal / cross modal attention / clip / dynamic gating / ieee paper

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

## education / study / college / university / school / degree / cgpa / gpa

B.E. in Computer Science & Engineering at B.M.S. College of Engineering
(BMSCE), Bengaluru — CGPA 8.21, expected June 2027. Before that, Narayana PU
College, 12th, Karnataka State Board, 94.33%, May 2023.

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

## contact / reach / email / socials / github / linkedin / hire / hiring / availability / work with him

Best way in is GitHub — [github.com/lucenity0](https://github.com/lucenity0).
TODO: add email + any other socials you want Liffy to hand out, and a line on
what kind of roles/collabs you're open to right now.

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
It kept the seat warm during the "under construction" era and refuses to leave.`;let Lt=null;const Ct=()=>Lt??=new kt(_t),Tt=`hey, i'm liffy — nafees's lil terminal sidekick. ask me anything about him. try: "what does he build?"`,At=/^me+o+w+[\s.!?~]*$/i,It=/\b(cookie|treat)\b/i,X="meow. mrrp. purrrr. (translation: hi. i like you. bring snacks.)";function Mt(s){const e=Ct(),t=[];let n=!1;const i=document.createElement("div");i.className="liffy";const o=document.createElement("div");o.className="liffy__log",o.setAttribute("role","log"),o.setAttribute("aria-live","polite");const a=document.createElement("form");a.className="liffy__inputrow";const r=document.createElement("span");r.className="liffy__prompt",r.textContent="you>";const l=document.createElement("input");l.className="liffy__input",l.type="text",l.setAttribute("aria-label","ask liffy"),l.autocomplete="off",l.autocapitalize="off",l.spellcheck=!1,a.append(r,l),i.append(o,a);const c=()=>{o.scrollTop=o.scrollHeight},d=(f,E)=>{const v=document.createElement("div");v.className="liffy__line";const w=document.createElement("span");w.className=`liffy__who ${E}`,w.textContent=f;const _=document.createElement("span");return _.className="liffy__text",v.append(w,_),o.append(v),c(),_},h=async f=>{const E=d("liffy>","liffy__who--bot");if(b())E.textContent=f;else{const v=f.length>320?4:f.length>160?6:9;await N(E,f,{speed:v})}c()},m=["thinking","pondering","purring","consulting the cat","rummaging through notes","recalling"];let u=0;const g=async f=>{if(n)return;if(n=!0,l.disabled=!0,d("you>","liffy__who--user").textContent=f,t.push({role:"user",text:f}),At.test(f)){const $=d("","liffy__who--bot");$.classList.add("liffy__thinking"),$.textContent="✳ thought for 0.0s (instinct)",t.push({role:"liffy",text:X}),p.hop(),await h(X),n=!1,l.disabled=!1,l.focus();return}const E=d("","liffy__who--bot");E.classList.add("liffy__thinking");const v=Z(E,m[u++%m.length]);p.think(!0),b()||await S(650+Math.random()*750);const w=await e.ask(f,t),_=v.stop();p.think(!1),E.textContent=`✳ thought for ${Math.max(_,.1).toFixed(1)}s`,t.push({role:"liffy",text:w.text}),p.bob(!0),await h(w.text),p.bob(!1),n=!1,l.disabled=!1,l.focus()};a.addEventListener("submit",f=>{f.preventDefault();const E=l.value.trim();!E||n||(l.value="",p.onSend(),g(E))});const y=s.windows.open({id:"liffy",title:"liffy — ask about nafees",content:i,width:520,height:420});y.bodyEl.style.padding="0";const p=new ne({mount:i,mode:"liffy",idleFrame:"awake"});l.addEventListener("input",()=>{const f=l.value;It.test(f)?p.fillNow():p.onTyping(f.length)}),h(Tt),window.setTimeout(()=>l.focus(),60),s.terminal.print("opened: liffy","dim")}const xt=`# Nafees S — résumé

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

---

> Tip: drop a \`resume.pdf\` into \`public/\` and this window will offer a download link.`;function Pt(s){const e=document.createElement("div");e.className="docs",e.innerHTML=ie(xt);const t="/preview-b36b9ad3412f39139ec0/resume.pdf";fetch(t,{method:"HEAD"}).then(n=>{const i=n.headers.get("content-type")??"";if(!n.ok||!i.includes("pdf"))return;const o=document.createElement("div");o.className="docs__toolbar";const a=document.createElement("a");a.className="docs__download",a.href=t,a.target="_blank",a.rel="noreferrer noopener",a.textContent="↓ download PDF",o.append(a),e.prepend(o)}).catch(()=>{}),s.windows.open({id:"resume",title:"resume — nafees",content:e,width:560,height:480}),s.terminal.print("opened: resume","dim")}function L(s,e){return async t=>{if(b()){e(t);return}const n=document.createElement("div");n.className="terminal__line terminal__line--sub",t.terminal.printEl(n);const i=Z(n,s);await S(320+Math.random()*260),i.stop(),n.remove(),e(t)}}function Nt(){const s=[],e=t=>{t.terminal.print("available commands:");for(const n of s.filter(i=>!i.hidden)){const i=(n.usage??n.name).padEnd(18);t.terminal.print(`  ${i}${n.summary}`,"dim")}};return s.push({name:"help",summary:"list available commands",run:e},{name:"about",summary:"who is lucenity",run:L("waking about",qe)},{name:"resume",summary:"view my résumé",run:L("dusting off the résumé",Pt)},{name:"projects",summary:"browse my work",run:L("indexing projects",et)},{name:"project",summary:"open a specific project",usage:"project <slug>",run:async t=>{const n=t.args[0];if(!n){t.terminal.print("usage: project <slug>","dim"),t.terminal.print(`slugs: ${k.map(i=>i.slug).join(", ")}`,"sub");return}await L(`spinning up ${n}`,i=>se(i,n))(t)},complete:t=>t.length>1?[]:k.map(n=>n.slug)},{name:"contact",summary:"how to reach me",run:L("opening channels",Je)},{name:"liffy",summary:"chat with liffy, my lil assistant",run:L("poking liffy awake",Mt)},{name:"clear",summary:"clear the screen",run:t=>t.terminal.clear()},{name:"whoami",summary:"print the current session identity",run:t=>t.terminal.print("visitor@lucenity — guest session","dim")},{name:"cat",summary:"",hidden:!0,run:t=>{const n=R("cat terminal__cat");t.terminal.printEl(n),t.terminal.print("the cat is asleep. it is always asleep. =^..^=","dim")}},{name:"sudo",summary:"",hidden:!0,run:t=>t.terminal.print("nice try. you're a guest here :)","dim")},{name:"git",usage:"git <subcommand>",summary:"",hidden:!0,run:t=>{const n=t.args[0];if(!n){t.terminal.print("usage: git <subcommand>","dim"),t.terminal.print("subcommands: init, clone","sub");return}if(n==="init")t.terminal.print("Nafees's Github! : https://github.com/lucenity0","dim");else if(n==="clone"){const i=t.args[1];if(!i){t.terminal.print("usage: git clone <slug>","dim"),t.terminal.print(`slugs: ${k.map(a=>a.slug).join(", ")}`,"sub");return}if(!k.find(a=>a.slug===i)){t.terminal.print(`error: no project found with slug '${i}'`,"dim"),t.terminal.print(`valid slugs: ${k.map(a=>a.slug).join(", ")}`,"sub");return}t.terminal.print(`Cloning into '${i}'...`,"dim"),t.terminal.print(`remote: https://github.com/lucenity0/${i}.git`,"sub")}},complete:t=>t.length<=1?["init","clone"]:t[0]==="clone"&&t.length===2?k.map(n=>n.slug):[]}),s}const P=document.getElementById("app");if(!P)throw new Error("#app mount element not found");const Rt=new pe(P),ce=new de;ce.registerAll(Nt());const x=new ke(P,ce,Rt);Le(x).then(()=>{const s=Ue(P);x.onTyping=e=>s.companion.onTyping(e),x.onSend=()=>s.companion.onSend(),x.onClear=()=>s.restore()});
//# sourceMappingURL=index-we7XTPEH.js.map
