import{o as e}from"./rolldown-runtime-CMxvf4Kt.js";import{t}from"./react-ICqv4BO6.js";import{t as n}from"./jsx-runtime-DDrWIXeu.js";import{n as r}from"./db-DUD8mibL.js";import{a as i}from"./safeApi-C8XADnci.js";import{Nt as a,Pt as o,Un as s}from"./index-BsnmE8U4.js";var c=e(t(),1),l=n(),u=`sully_journal_open_char_id`,ee=[{id:`plain`,name:`白纸`,css:`bg-white`,text:`text-slate-700`},{id:`grid`,name:`网格`,css:`bg-white`,text:`text-slate-700`,style:{backgroundImage:`linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,backgroundSize:`20px 20px`}},{id:`dot`,name:`点阵`,css:`bg-[#fffdf5]`,text:`text-slate-700`,style:{backgroundImage:`radial-gradient(#d1d5db 1px, transparent 1px)`,backgroundSize:`20px 20px`}},{id:`lined`,name:`横线`,css:`bg-[#fefce8]`,text:`text-slate-700`,style:{backgroundImage:`repeating-linear-gradient(transparent, transparent 23px, #e5e7eb 23px, #e5e7eb 24px)`}},{id:`dark`,name:`夜空`,css:`bg-slate-800`,text:`text-white/90`},{id:`pink`,name:`少女`,css:`bg-pink-50`,text:`text-slate-700`,style:{backgroundImage:`radial-gradient(#fbcfe8 2px, transparent 2px)`,backgroundSize:`30px 30px`}}],te=[`✨`,`💖`,`🌸`,`🎀`,`🍰`,`🐱`,`🐶`,`☁️`,`🌙`,`⭐`,`🎵`,`🌿`,`🍓`,`🧸`,`🎈`,`💌`,`💤`,`🥺`,`😡`,`😭`],d=()=>{let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`},f=`/images/journal-cover.png`,p=[`零`,`一`,`二`,`三`,`四`,`五`,`六`,`七`,`八`,`九`,`十`],m=e=>{if(e<=10)return p[e]||String(e);if(e<20)return`十`+(e>10?p[e-10]:``);let t=Math.floor(e/10),n=e%10;return p[t]+`十`+(n?p[n]:``)},h=e=>{let t=(e||``).split(`-`).map(Number);return t.length<3||isNaN(t[1])||isNaN(t[2])?e||``:m(t[1])+`月`+m(t[2])},g=e=>{let t=new Date((e||``)+`T00:00:00`);return isNaN(t.getTime())?``:`周`+[`日`,`一`,`二`,`三`,`四`,`五`,`六`][t.getDay()]},ne=e=>(e||``).split(`-`)[2]||``,re=e=>{let t=[...e].sort((e,t)=>t.date.localeCompare(e.date)),n=t[0],r=0;for(let e of t)if(e.charPage)r++;else break;let i=((n?.charPage?.text||n?.userPage?.text||``).split(`
`).find(Boolean)||``).slice(0,22);return{count:t.length,lastDate:n?.date||``,hasNewReply:!!(n?.charPage&&!n.isArchived),lastLine:i,streak:r}},ie=[`lined`,`plain`,`grid`,`dot`],ae={lined:`j-sheet--lined`,plain:`j-sheet--plain`,grid:`j-sheet--grid`,dot:`j-sheet--dot`},_=`.j-root{--paper:#f2f1ec;--sheet:#faf9f4;--ink:#1a1a1d;--ink-2:#6e6c66;--ink-3:#a9a79f;--line:rgba(26,26,29,.20);--line-2:rgba(26,26,29,.10);
  --jf:'Noto Serif SC','Songti SC','STSong',serif;--jm:'Space Mono',ui-monospace,monospace;--jh:'Ma Shan Zheng','Songti SC',cursive;
  position:relative;height:100%;width:100%;background:var(--paper);color:var(--ink);font-family:var(--jf);overflow:hidden}
.j-root *{box-sizing:border-box}
.j-grain{position:absolute;inset:0;z-index:40;pointer-events:none;opacity:.06;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.j-scroll{position:absolute;inset:0;z-index:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
.j-cover{position:relative;height:360px;overflow:hidden;background:#16161a}
.j-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 38%;filter:grayscale(1) contrast(1.05) brightness(1.02);
  -webkit-mask-image:linear-gradient(180deg,#000 0%,#000 50%,rgba(0,0,0,.5) 74%,transparent 100%);mask-image:linear-gradient(180deg,#000 0%,#000 50%,rgba(0,0,0,.5) 74%,transparent 100%)}
.j-stop{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,6,10,.55) 0%,rgba(6,6,10,.25) 18%,transparent 38%)}
.j-sbot{position:absolute;inset:0;background:linear-gradient(0deg,rgba(6,6,10,0) 12%,rgba(6,6,10,.5) 30%,rgba(6,6,10,.38) 46%,transparent 62%)}
.j-close{position:absolute;right:20px;top:calc(env(safe-area-inset-top,0px) + 22px);z-index:5;width:30px;height:30px;border:0;background:transparent;color:rgba(255,255,255,.85);font-size:17px;cursor:pointer}
.j-cap{position:absolute;left:25px;top:calc(env(safe-area-inset-top,0px) + 24px);font-family:var(--jm);font-size:10px;letter-spacing:.24em;color:rgba(255,255,255,.82);z-index:4}
.j-ttl{position:absolute;left:25px;top:calc(env(safe-area-inset-top,0px) + 44px);font-weight:500;font-size:38px;letter-spacing:.2em;color:#fff;line-height:1;padding-left:.2em;z-index:4}
.j-trule{position:absolute;left:27px;top:calc(env(safe-area-inset-top,0px) + 94px);width:42px;height:1px;background:rgba(255,255,255,.7);z-index:4}
.j-sub{position:absolute;right:25px;bottom:74px;max-width:248px;text-align:right;font-family:var(--jh);font-size:19px;color:rgba(255,255,255,.95);line-height:1.3;text-shadow:0 1px 10px rgba(0,0,0,.35);z-index:4}
.j-lower{position:relative;z-index:3;margin-top:-44px;padding:0 0 30px}
.j-avw{position:relative;flex:0 0 auto}
.j-sname{position:absolute;right:-7px;bottom:-15px;font-family:var(--jf);font-weight:700;line-height:1;color:var(--ink);opacity:.15;z-index:0;pointer-events:none}
.j-sq{position:relative;z-index:1;background:#dad9d3;overflow:hidden}
.j-sq img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.05) brightness(1.02)}
.j-sq .j-ini{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--jf);font-weight:600;color:var(--ink-2)}
.j-sq::after{content:'';position:absolute;inset:0;box-shadow:0 0 0 1px var(--ink) inset}
.j-dot{width:6px;height:6px;border-radius:50%;display:inline-block;flex:0 0 auto}
.j-fill{background:var(--ink)}
.j-holl{background:transparent;border:1.5px solid var(--ink-3);width:7px;height:7px}
.j-focal{position:relative;margin:0 26px;padding:2px 0 0;cursor:pointer}
.j-focal .j-row{display:flex;align-items:stretch}
.j-focal .j-sq{width:88px;height:88px}.j-focal .j-ini{font-size:27px}
.j-focal .j-sname{font-size:64px;right:-9px;bottom:-18px}
.j-vsep{width:1px;background:var(--line-2);margin:3px 17px;flex:0 0 auto}
.j-focal .j-ci{flex:1;min-width:0;padding-top:4px}
.j-cn{display:flex;align-items:center;gap:10px;font-weight:700;font-size:25px;letter-spacing:.05em;line-height:1.05}
.j-focal .j-cs{font-family:var(--jh);font-size:17px;color:var(--ink-3);margin-top:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.j-dash{border-top:1px dashed var(--line);margin:11px 0 9px;width:74%}
.j-cm{font-size:11.5px;letter-spacing:.04em;color:var(--ink-2)}
.j-cm .j-sep{color:var(--ink-3);margin:0 6px}.j-cm .j-st{letter-spacing:.14em;color:var(--ink)}
.j-seclbl{display:flex;align-items:center;gap:13px;margin:30px 26px 8px}
.j-seclbl .j-t{font-size:11px;letter-spacing:.34em;color:var(--ink-2);white-space:nowrap}
.j-seclbl .j-ln{flex:1;height:1px;background:var(--line-2)}
.j-seclbl .j-n{font-family:var(--jm);font-size:11px;letter-spacing:.08em;color:var(--ink-3)}
.j-list{padding:2px 26px 0}
.j-crow{display:flex;align-items:stretch;padding:17px 0 0;cursor:pointer}
.j-crow .j-sq{width:64px;height:64px}.j-crow .j-ini{font-size:20px}
.j-crow .j-sname{font-size:48px}
.j-crow .j-ct{flex:1;min-width:0;padding-top:2px}
.j-crow .j-cn{font-size:20px;gap:8px}
.j-crow .j-cs{font-family:var(--jh);font-size:15px;color:var(--ink-3);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.j-crow .j-cm{margin-top:7px;font-size:11px}
.j-crow .j-st.j-wait{color:var(--ink)}.j-crow .j-st.j-read{color:var(--ink-3)}
.j-hsep{border-top:1px dashed var(--line);margin:17px 0 0 92px}
.j-crow.j-dim{opacity:.5}
.j-s2top{padding:calc(env(safe-area-inset-top,0px) + 22px) 26px 0;flex:0 0 auto}
.j-back{display:flex;align-items:center;gap:7px;font-size:12px;letter-spacing:.14em;color:var(--ink-2);margin-bottom:16px;cursor:pointer}
.j-back .j-ar{font-size:15px}
.j-ph{display:flex;align-items:center}
.j-ph .j-sq{width:62px;height:62px}.j-ph .j-ini{font-size:20px}
.j-ph .j-sname{font-size:48px}
.j-pn{font-weight:700;font-size:33px;letter-spacing:.1em;line-height:1}
.j-ps{font-size:11px;letter-spacing:.1em;color:var(--ink-2);margin-top:5px}
.j-hr{height:1.5px;background:var(--ink);margin-top:17px}
.j-body2{padding:0 26px 30px}
.j-twrite{display:flex;align-items:center;gap:12px;padding:18px 0 4px;cursor:pointer}
.j-ic{width:28px;height:28px;border:1px solid var(--ink-2);display:flex;align-items:center;justify-content:center;font-size:18px;flex:0 0 auto;color:var(--ink-2)}
.j-pl{font-size:15px;font-weight:500;letter-spacing:.04em}
.j-tsub{font-size:11px;color:var(--ink-3);margin-top:2px;letter-spacing:.04em}
.j-dd{margin-left:auto;font-size:11px;letter-spacing:.06em;color:var(--ink-3);white-space:nowrap}
.j-feat{position:relative;padding:18px 0 4px;border-top:1px dashed var(--line);margin-top:8px;cursor:pointer}
.j-fd{font-size:11.5px;letter-spacing:.12em;color:var(--ink-2);margin-bottom:11px}
.j-fd b{font-weight:700;font-size:18px;color:var(--ink);letter-spacing:.06em;margin-right:9px}
.j-ftext{font-size:15.5px;line-height:1.6;color:var(--ink);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.j-reply{margin-top:14px;padding-left:14px;border-left:1.5px solid var(--ink)}
.j-rl{font-size:9.5px;letter-spacing:.18em;color:var(--ink-3);margin-bottom:5px}
.j-rt{font-family:var(--jh);font-size:18px;color:var(--ink-2);line-height:1.3}
.j-st2{margin-top:13px;font-size:11px;letter-spacing:.14em;color:var(--ink-2)}
.j-pe{display:flex;align-items:center;gap:12px;padding:14px 0 0;border-top:1px dashed var(--line);margin-top:14px;cursor:pointer}
.j-pd{font-weight:700;font-size:16px;color:var(--ink-2);width:26px;flex:0 0 auto;text-align:center;font-family:var(--jm)}
.j-pl2{flex:1;min-width:0;font-size:14px;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.j-ps2{font-size:9px;letter-spacing:.14em;color:var(--ink-3);white-space:nowrap}
.j-pe.j-dim{opacity:.5}
.j-empty{text-align:center;color:var(--ink-3);font-size:14px;line-height:1.8;padding:60px 0}
.j-edit{display:flex;flex-direction:column}
.j-ehead{position:relative;z-index:2;padding:calc(env(safe-area-inset-top,0px) + 22px) 24px 0;flex:0 0 auto;display:flex;align-items:center;justify-content:space-between}
.j-ebk{font-size:18px;color:var(--ink-2);cursor:pointer}
.j-edt{font-family:var(--jm);font-size:10.5px;letter-spacing:.14em;color:var(--ink-2)}
.j-eact{display:flex;gap:14px;align-items:center}
.j-ea{font-size:12.5px;letter-spacing:.1em;color:var(--ink-2);cursor:pointer}
.j-ehidebtn{font-size:11px;letter-spacing:.08em;color:var(--ink-3);cursor:pointer}
.j-ehidebtn.on{color:var(--ink)}
.j-etabs{position:relative;z-index:2;display:flex;gap:22px;padding:16px 24px 0;flex:0 0 auto}
.j-etb{font-size:13px;letter-spacing:.14em;color:var(--ink-3);padding-bottom:6px;cursor:pointer}
.j-etb.on{color:var(--ink);border-bottom:1.5px solid var(--ink)}
.j-ewrap{position:relative;z-index:1;flex:1;padding:14px 22px 0;min-height:0;display:flex}
.j-sheet{flex:1;background:var(--sheet);box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 12px 26px -18px rgba(0,0,0,.4);padding:20px 20px 16px;display:flex;flex-direction:column;position:relative;overflow:hidden;touch-action:none}
.j-sheet--lined{background-image:repeating-linear-gradient(transparent 0,transparent 33px,rgba(26,26,29,.07) 33px,rgba(26,26,29,.07) 34px);background-position:0 44px}
.j-sheet--grid{background-image:repeating-linear-gradient(transparent 0,transparent 21px,rgba(26,26,29,.06) 21px,rgba(26,26,29,.06) 22px),repeating-linear-gradient(90deg,transparent 0,transparent 21px,rgba(26,26,29,.06) 21px,rgba(26,26,29,.06) 22px);background-position:0 44px}
.j-sheet--dot{background-image:radial-gradient(rgba(26,26,29,.10) 1px,transparent 1.4px);background-size:22px 22px;background-position:6px 50px}
.j-sheet--plain{background-image:none}
.j-sph{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:9px;border-bottom:1px solid var(--line-2);margin-bottom:13px;flex:0 0 auto}
.j-sd{font-weight:700;font-size:15px;letter-spacing:.08em}
.j-sw2{font-family:var(--jm);font-size:10px;letter-spacing:.12em;color:var(--ink-3)}
.j-stx{flex:1;width:100%;border:0;background:transparent;resize:none;outline:none;font-family:var(--jf);font-size:16px;line-height:34px;color:var(--ink);overflow-y:auto}
.j-stx::placeholder{color:var(--ink-3)}
.j-stk{position:absolute;font-size:40px;user-select:none;z-index:5;cursor:move;line-height:1}
.j-stk.drag{opacity:.9}
.j-stkimg{width:50px;height:50px;object-fit:contain;pointer-events:none}
.j-stkx{position:absolute;top:-12px;right:-12px;width:22px;height:22px;border:0;border-radius:50%;background:var(--ink);color:var(--paper);display:flex;align-items:center;justify-content:center;padding:0;font-size:13px;line-height:1;cursor:pointer;pointer-events:auto}
.j-stkr{position:absolute;bottom:-9px;right:-9px;width:16px;height:16px;border-radius:50%;background:var(--paper);box-shadow:0 0 0 1.5px var(--ink) inset;cursor:nwse-resize;pointer-events:auto}
.j-wait{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 40px 80px}
.j-arcwrap{position:relative;width:262px;height:96px;margin-bottom:34px}
.j-bird{position:absolute;left:172px;top:18px;width:26px;color:var(--ink)}
.j-bird.b2{left:120px;top:34px;width:17px;opacity:.55}
.j-bird.b3{left:206px;top:40px;width:13px;opacity:.4}
.j-w1{font-size:19px;letter-spacing:.14em;color:var(--ink)}
.j-w2{font-family:var(--jh);font-size:18px;color:var(--ink-2);margin-top:13px;text-align:center}
.j-w3{font-family:var(--jm);font-size:10.5px;letter-spacing:.34em;color:var(--ink-3);margin-top:24px}
.j-emptyx{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 40px 70px;text-align:center}
.j-ex1{font-size:17px;letter-spacing:.1em;color:var(--ink)}
.j-ex2{font-size:13px;line-height:1.8;color:var(--ink-3);margin-top:12px}
.j-exbtn{display:inline-flex;align-items:center;gap:9px;margin-top:26px;background:var(--ink);color:var(--paper);padding:11px 18px;font-size:13px;letter-spacing:.16em;cursor:pointer}
.j-etool{position:relative;z-index:2;flex:0 0 auto;padding:12px 22px calc(env(safe-area-inset-bottom,0px) + 18px);display:flex;align-items:center;gap:14px}
.j-chips{display:flex;gap:9px;align-items:center}
.j-chip{width:30px;height:30px;background:var(--sheet);position:relative;cursor:pointer;box-shadow:0 0 0 1px var(--line-2) inset}
.j-chip.on{box-shadow:0 0 0 1.5px var(--ink) inset}
.j-chip-lined{background-image:repeating-linear-gradient(transparent 0,transparent 5px,rgba(26,26,29,.28) 5px,rgba(26,26,29,.28) 6px)}
.j-chip-grid{background-image:repeating-linear-gradient(transparent 0,transparent 6px,rgba(26,26,29,.24) 6px,rgba(26,26,29,.24) 7px),repeating-linear-gradient(90deg,transparent 0,transparent 6px,rgba(26,26,29,.24) 6px,rgba(26,26,29,.24) 7px)}
.j-chip-dot{background-image:radial-gradient(rgba(26,26,29,.34) 1px,transparent 1.4px);background-size:7px 7px;background-position:3px 3px}
.j-stkbtn{width:32px;height:32px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--ink-2);font-size:15px;margin-left:auto;cursor:pointer}
.j-stkbtn.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.j-esend{display:flex;align-items:center;gap:9px;background:var(--ink);color:var(--paper);padding:10px 16px;font-size:13px;letter-spacing:.16em;cursor:pointer;white-space:nowrap}
.j-sw{font-size:14px;letter-spacing:0}
.j-earch{display:flex;align-items:center;gap:8px;border:1px solid var(--ink);padding:9px 15px;font-size:12.5px;letter-spacing:.14em;color:var(--ink);cursor:pointer;white-space:nowrap}
.j-archived{font-size:11px;letter-spacing:.12em;color:var(--ink-3);margin-left:4px}
.j-tray{position:relative;z-index:2;flex:0 0 auto;background:#ecebe5;border-top:1px solid var(--line-2);padding:14px 18px;height:158px;overflow-y:auto}
.j-traygrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.j-trayadd{aspect-ratio:1;border:1px dashed var(--line);display:flex;align-items:center;justify-content:center;color:var(--ink-3);font-size:18px;cursor:pointer}
.j-traycell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:24px;background:var(--sheet);box-shadow:0 0 0 1px var(--line-2) inset;cursor:pointer}
.j-trayimg{width:30px;height:30px;object-fit:contain;pointer-events:none}`,v=`journal-app-redesign-style`,oe={count:0,lastDate:``,hasNewReply:!1,lastLine:``,streak:0},se=()=>{(0,c.useEffect)(()=>{if(typeof document>`u`)return;let e=document.getElementById(v);e||(e=document.createElement(`style`),e.id=v,document.head.appendChild(e)),e.textContent!==_&&(e.textContent=_)},[])},y=()=>{let{closeApp:e,characters:t,apiConfig:n,addToast:p,userProfile:m,updateCharacter:_,registerBackHandler:v}=o();se();let[y,b]=(0,c.useState)(`select`),[x,ce]=(0,c.useState)(null),[S,le]=(0,c.useState)([]),[C,w]=(0,c.useState)(null),[ue,de]=(0,c.useState)({}),[T,fe]=(0,c.useState)(!1),[E,pe]=(0,c.useState)(!1),[D,O]=(0,c.useState)(!1),[k,A]=(0,c.useState)(`user`),[j,me]=(0,c.useState)(!1),[M,N]=(0,c.useState)(null),[P,F]=(0,c.useState)(null),[I,L]=(0,c.useState)(null),R=(0,c.useRef)(null),[z,he]=(0,c.useState)([]),[B,V]=(0,c.useState)(!1),[H,ge]=(0,c.useState)(``),[U,W]=(0,c.useState)(null),G=(0,c.useRef)(null),K=t.map(e=>e.id).join(`|`);(0,c.useEffect)(()=>{r.getJournalStickers().then(he)},[]),(0,c.useEffect)(()=>{let e=!1;return(async()=>{let t=K?K.split(`|`):[],n={};await Promise.all(t.map(async e=>{try{n[e]=re(await r.getDiariesByCharId(e))}catch{n[e]=oe}})),e||de(n)})(),()=>{e=!0}},[K]),(0,c.useEffect)(()=>{x&&de(e=>({...e,[x.id]:re(S)}))},[x,S]);let q=async e=>{le((await r.getDiariesByCharId(e)).sort((e,t)=>t.date.localeCompare(e.date)))},J=e=>{ce(e),b(`calendar`),q(e.id)},Y=(0,c.useCallback)(()=>{G.current&&=(clearTimeout(G.current),null),N(null),L(null),F(null),O(!1),V(!1),W(null)},[]),_e=(0,c.useCallback)(()=>{Y(),b(`select`)},[Y]),ve=(0,c.useCallback)(()=>{Y(),b(`calendar`)},[Y]),X=(0,c.useCallback)(()=>U?(W(null),!0):B?(V(!1),!0):T||E?(p(`当前操作处理中，稍等一下再返回`,`info`),!0):M||I||P?(N(null),L(null),F(null),!0):D?(O(!1),!0):y===`write`?(ve(),!0):y===`calendar`?(_e(),!0):(e(),!0),[p,e,U,M,E,T,y,I,ve,_e,P,B,D]);(0,c.useEffect)(()=>v(X),[X,v]),(0,c.useEffect)(()=>{if(y!==`select`||t.length===0||typeof window>`u`)return;let e=``;try{e=window.localStorage.getItem(u)||``,e&&window.localStorage.removeItem(u)}catch{return}if(!e)return;let n=t.find(t=>t.id===e);n&&J(n)},[t,y]);let ye=e=>{let t=S.find(t=>t.date===e);t?(w(t),A(t.charPage?`char`:`user`)):(w({id:`diary-${Date.now()}`,charId:x.id,date:e,userPage:{text:``,paperStyle:`lined`,stickers:[]},timestamp:Date.now(),isArchived:!1}),A(`user`)),b(`write`),F(null)},Z=(e,t=`user`)=>{let n=t===`user`?`userPage`:`charPage`;w(t=>{if(!t)return null;let r=t[n]||{text:``,paperStyle:`plain`,stickers:[]};return{...t,[n]:{...r,...e}}})},be=e=>{let t=k,n=t===`user`?C?.userPage:C?.charPage;if(!n&&t===`char`)return;let r={id:`st-${Date.now()}-${Math.random()}`,url:e,x:50,y:50,rotation:(Math.random()-.5)*40,scale:1};Z({stickers:[...n?.stickers||[],r]},t),O(!1)},xe=async()=>{if(!H.trim())return;let e=H.split(`
`),t=0;for(let n of e){let e=n.split(`--`);if(e.length>=2){let n=e[0].trim(),i=e.slice(1).join(`--`).trim();n&&i&&(await r.saveJournalSticker(n,i),t++)}}he(await r.getJournalStickers()),ge(``),V(!1),p(`成功添加 ${t} 个贴纸`,`success`)},Se=async()=>{U&&(await r.deleteJournalSticker(U.name),he(e=>e.filter(e=>e.name!==U.name)),W(null),p(`贴纸已删除`,`success`))},Ce=async()=>{C&&(await r.saveDiary(C),await q(C.charId),p(`日记已保存`,`success`))},we=(e,t)=>{e.stopPropagation(),F(t)},Te=e=>{let t=k===`user`?`userPage`:`charPage`;w(n=>{if(!n)return null;let r=n[t];return r?{...n,[t]:{...r,stickers:(r.stickers||[]).filter(t=>t.id!==e)}}:n}),N(null),L(null),F(null)},Ee=(e,t,n)=>{e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),n===`move`?(N(t),F(t)):L(t)},De=e=>{if(!M&&!I||!R.current||!C)return;let t=R.current.getBoundingClientRect(),n=k===`user`?C.userPage:C.charPage;if(n){if(M){let r=(e.clientX-t.left)/t.width*100,i=(e.clientY-t.top)/t.height*100,a=Math.max(0,Math.min(100,r)),o=Math.max(0,Math.min(100,i));Z({stickers:n.stickers.map(e=>e.id===M?{...e,x:a,y:o}:e)},k)}if(I){let r=n.stickers.find(e=>e.id===I);if(!r)return;let i=e.clientX-t.left-r.x/100*t.width,a=e.clientY-t.top-r.y/100*t.height,o=Math.sqrt(i*i+a*a),s=Math.max(.2,Math.min(3,o/40));Z({stickers:n.stickers.map(e=>e.id===I?{...e,scale:s}:e)},k)}}},Oe=e=>{N(null),L(null),e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId)},ke=()=>{F(null)},Ae=e=>{G.current=setTimeout(()=>{W(e)},600)},Q=()=>{G.current&&=(clearTimeout(G.current),null)},je=async()=>{if(!C||!x||!n.apiKey){p(`配置错误或内容为空`,`error`);return}if(!C.userPage.text.trim()){p(`请先写下今天的日记`,`info`);return}fe(!0),Ce();try{let e=s.buildCoreContext(x,m),t=ee.map(e=>e.id).join(`, `),a=z.length>0?`Custom Stickers (Name: URL): \n${z.map(e=>`- ${e.name}: ${e.url}`).join(`
`)}`:``,o=(await r.getMessagesByCharId(x.id)).slice(-30).map(e=>{let t=e.type===`image`?`[User sent an image]`:e.content;return`[${new Date(e.timestamp).toLocaleTimeString()}] ${e.role===`user`?`User`:`You`}: ${t}`}).join(`
`);e+=`### [Exchange Diary Mode Instructions]
你正在和用户进行【交换日记】互动。

### 关键：最近发生的互动 (Recent Context)
这是你们最近在聊天软件或见面时的对话记录。请**务必**阅读这些记录，并在日记中提及今天发生的具体事情（例如聊过的话题、去过的地方、用户发过的图片）。
不要只写空泛的回复，还要说一些用户不知道的，你自己没有说过的想法，和你自己独立于用户经历过的今天的事情。
[RECENT LOGS START]
${o}
[RECENT LOGS END]

### 任务
1. 阅读用户今天的日记 (${C.date})。
2. 以你的角色口吻写一篇**回复日记**。
   - 首先结合上文的聊天记录，回应用户的内容。
   - 最重要的是分享你的生活，此条为必须项**务必说至少一件用户不知道的，你今天做的事情，尽量与用户无关！用户希望看到角色完全独立的一面**。
   - 语言风格在符合设定的基础上，应该更加书面化和诗意，不过一切以角色性格优先。
3. 选择适合你心情的纸张和贴纸。

### 关于贴纸 (Stickers)
你可以使用默认的 Emoji，也可以使用【Custom Stickers】。
${a}
如果要使用 Custom Sticker，请将 URL 直接放入返回的 stickers 数组中。

### 输出格式 (必须是纯 JSON)
Structure:
{
  "text": "日记正文...",
  "paperStyle": "one of: ${t}",
  "stickers": ["sticker1", "http://custom-sticker-url..."] (从默认列表或 Custom Stickers 中选0-3个)
}`;let c=await fetch(`${n.baseUrl.replace(/\/+$/,``)}/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${n.apiKey}`},body:JSON.stringify({model:n.model,messages:[{role:`system`,content:e},{role:`user`,content:`Users Diary:\n${C.userPage.text}`}],temperature:.85})});if(!c.ok)throw Error(`API Error`);let l=(await i(c)).choices[0].message.content.trim();l=l.replace(/```json/g,``).replace(/```/g,``).trim();let u;try{u=JSON.parse(l)}catch{u={text:l,paperStyle:`plain`,stickers:[]}}let te=(u.stickers||[]).map(e=>({id:`st-${Math.random()}`,url:e,x:Math.random()*70+10,y:Math.random()*70+10,rotation:(Math.random()-.5)*40,scale:1})),d={text:u.text||``,paperStyle:ee.find(e=>e.id===u.paperStyle)?.id||`plain`,stickers:te},f={...C,charPage:d};w(f),await r.saveDiary(f),await q(x.id),A(`char`),p(`对方已回复`,`success`)}catch(e){p(`回复失败: ${e.message}`,`error`)}finally{fe(!1)}},Me=async()=>{if(!(!C||!x||C.isArchived)){pe(!0);try{let e=`${s.buildCoreContext(x,m)}

### [System Instruction: Diary Archival]
当前任务: 将这篇【交换日记】(${C.date}) 总结为一条属于你的“核心记忆”。

### 输入内容 (Input)
用户 (${m.name}) 的日记:
"${C.userPage.text}"

你 (${x.name}) 的回复:
"${C.charPage?.text||`(无)`}"

### 输出要求 (Output Requirements)
1. **绝对第一人称**: 必须用“我”来称呼自己，用“${m.name}”称呼用户。
2. **内容聚焦**: 总结日记中提到的关键事件、你的感受以及你们之间的互动。
3. **格式**: 输出一句简练的中文总结 (50字以内)。不要包含任何前缀。
`,t=await fetch(`${n.baseUrl.replace(/\/+$/,``)}/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${n.apiKey}`},body:JSON.stringify({model:n.model,messages:[{role:`user`,content:e}],temperature:.3})});if(t.ok){let e=(await i(t)).choices[0].message.content;e=e.replace(/^["']|["']$/g,``).trim();let n={id:`mem-${Date.now()}`,date:C.date,summary:e,mood:`diary`},a=[...x.memories||[],n];_(x.id,{memories:a});let o={...C,isArchived:!0};w(o),await r.saveDiary(o),await q(x.id),p(`已归档至记忆库`,`success`)}else throw Error(`API Error ${t.status}`)}catch(e){console.error(e),p(`归档失败: ${e.message}`,`error`)}finally{pe(!1)}}},Ne=(e,t)=>{let n=ae[e.paperStyle]||`j-sheet--plain`,r=t===k,i=C?.date||``;return(0,l.jsxs)(`div`,{ref:r?R:void 0,className:`j-sheet ${n}`,onPointerMove:r?De:void 0,onPointerUp:r?Oe:void 0,onPointerLeave:r?Oe:void 0,onClick:ke,children:[(0,l.jsxs)(`div`,{className:`j-sph`,children:[(0,l.jsx)(`span`,{className:`j-sd`,children:h(i)}),(0,l.jsx)(`span`,{className:`j-sw2`,children:t===`user`?g(i):`${x?.name||`TA`} · ${g(i)}`})]}),(0,l.jsx)(`textarea`,{value:e.text,onChange:e=>Z({text:e.target.value},t),placeholder:t===`user`?`写下今天…`:``,className:`j-stx`,readOnly:T}),!(t===`char`&&j)&&e.stickers.map(e=>{let t=P===e.id,n=e.scale||1;return(0,l.jsxs)(`div`,{onPointerDown:t=>Ee(t,e.id,`move`),onClick:t=>we(t,e.id),className:`j-stk ${M===e.id?`drag`:``}`,style:{left:`${e.x}%`,top:`${e.y}%`,transform:`translate(-50%, -50%) rotate(${e.rotation}deg) scale(${n})`,outline:t?`1px dashed var(--ink)`:`none`,outlineOffset:`3px`},children:[e.url.startsWith(`http`)||e.url.startsWith(`data`)?(0,l.jsx)(`img`,{src:e.url,className:`j-stkimg`,draggable:!1}):e.url,t&&(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`button`,{type:`button`,className:`j-stkx`,"aria-label":`删除贴纸`,onPointerDown:e=>{e.preventDefault(),e.stopPropagation()},onPointerUp:e=>{e.preventDefault(),e.stopPropagation()},onClick:t=>{t.preventDefault(),t.stopPropagation(),Te(e.id)},children:`×`}),(0,l.jsx)(`div`,{className:`j-stkr`,onPointerDown:t=>Ee(t,e.id,`resize`)})]})]},e.id)})]})};if(y===`select`){let e=[...t.map(e=>({c:e,s:ue[e.id]||oe}))].sort((e,t)=>Number(t.s.hasNewReply)-Number(e.s.hasNewReply)||(t.s.lastDate||``).localeCompare(e.s.lastDate||``)),n=e[0],r=e.slice(1),i=f,a=e=>e.streak>0?`连续 ${e.streak} 期`:`共 ${e.count} 期`,o=e=>{e.currentTarget.style.display=`none`};return(0,l.jsxs)(`div`,{className:`j-root`,children:[(0,l.jsx)(`div`,{className:`j-grain`}),(0,l.jsxs)(`div`,{className:`j-scroll`,children:[(0,l.jsxs)(`div`,{className:`j-cover`,children:[(0,l.jsx)(`img`,{className:`j-cover-img`,src:i,alt:``,onError:o}),(0,l.jsx)(`div`,{className:`j-stop`}),(0,l.jsx)(`div`,{className:`j-sbot`}),(0,l.jsx)(`button`,{className:`j-close`,onClick:X,"aria-label":`返回`,children:`✕`}),(0,l.jsx)(`div`,{className:`j-cap`,children:`私人日记 · 二〇二六`}),(0,l.jsx)(`div`,{className:`j-ttl`,children:`交换日记`}),(0,l.jsx)(`div`,{className:`j-trule`}),(0,l.jsxs)(`div`,{className:`j-sub`,children:[`把今天写成一页，`,(0,l.jsx)(`br`,{}),`与你交换。`]})]}),(0,l.jsxs)(`div`,{className:`j-lower`,children:[n&&(0,l.jsx)(`div`,{className:`j-focal`,onClick:()=>J(n.c),children:(0,l.jsxs)(`div`,{className:`j-row`,children:[(0,l.jsxs)(`div`,{className:`j-avw`,children:[(0,l.jsx)(`span`,{className:`j-sname`,children:n.c.name?.[0]}),(0,l.jsxs)(`div`,{className:`j-sq`,children:[(0,l.jsx)(`span`,{className:`j-ini`,children:n.c.name?.[0]}),n.c.avatar&&(0,l.jsx)(`img`,{src:n.c.avatar,alt:``,onError:o})]})]}),(0,l.jsx)(`div`,{className:`j-vsep`}),(0,l.jsxs)(`div`,{className:`j-ci`,children:[(0,l.jsx)(`div`,{className:`j-cn`,children:n.c.name}),n.s.lastLine&&(0,l.jsx)(`div`,{className:`j-cs`,children:n.s.lastLine}),(0,l.jsx)(`div`,{className:`j-dash`}),(0,l.jsxs)(`div`,{className:`j-cm`,children:[a(n.s),(0,l.jsx)(`span`,{className:`j-sep`,children:`·`}),n.s.lastDate?h(n.s.lastDate):`—`,n.s.hasNewReply&&(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`span`,{className:`j-sep`,children:`·`}),(0,l.jsx)(`span`,{className:`j-st`,children:`TA 也写了`})]})]})]})]})}),r.length>0&&(0,l.jsxs)(`div`,{className:`j-seclbl`,children:[(0,l.jsx)(`span`,{className:`j-t`,children:`其他日记`}),(0,l.jsx)(`span`,{className:`j-ln`}),(0,l.jsx)(`span`,{className:`j-n`,children:String(r.length).padStart(2,`0`)})]}),(0,l.jsx)(`div`,{className:`j-list`,children:r.map((e,t)=>(0,l.jsxs)(c.Fragment,{children:[t>0&&(0,l.jsx)(`div`,{className:`j-hsep`}),(0,l.jsxs)(`div`,{className:`j-crow`,onClick:()=>J(e.c),children:[(0,l.jsxs)(`div`,{className:`j-avw`,children:[(0,l.jsx)(`span`,{className:`j-sname`,children:e.c.name?.[0]}),(0,l.jsxs)(`div`,{className:`j-sq`,children:[(0,l.jsx)(`span`,{className:`j-ini`,children:e.c.name?.[0]}),e.c.avatar&&(0,l.jsx)(`img`,{src:e.c.avatar,alt:``,onError:o})]})]}),(0,l.jsx)(`div`,{className:`j-vsep`}),(0,l.jsxs)(`div`,{className:`j-ct`,children:[(0,l.jsx)(`div`,{className:`j-cn`,children:e.c.name}),e.s.lastLine&&(0,l.jsx)(`div`,{className:`j-cs`,children:e.s.lastLine}),(0,l.jsxs)(`div`,{className:`j-cm`,children:[a(e.s),(0,l.jsx)(`span`,{className:`j-sep`,children:`·`}),e.s.lastDate?h(e.s.lastDate):`—`,e.s.hasNewReply&&(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`span`,{className:`j-sep`,children:`·`}),(0,l.jsx)(`span`,{className:`j-st j-wait`,children:`TA 也写了`})]})]})]})]})]},e.c.id))})]})]})]})}if(y===`calendar`&&x){let e=[...S].sort((e,t)=>t.date.localeCompare(e.date)),t=e[0],n=e.slice(1),r=e.length,i=0;for(let t of e)if(t.charPage)i++;else break;let a=d(),o=e=>(e||``).split(`
`).find(Boolean)||``;return(0,l.jsxs)(`div`,{className:`j-root`,children:[(0,l.jsx)(`div`,{className:`j-grain`}),(0,l.jsxs)(`div`,{className:`j-scroll`,children:[(0,l.jsxs)(`div`,{className:`j-s2top`,children:[(0,l.jsxs)(`div`,{className:`j-back`,onClick:X,children:[(0,l.jsx)(`span`,{className:`j-ar`,children:`‹`}),`封面`]}),(0,l.jsxs)(`div`,{className:`j-ph`,children:[(0,l.jsxs)(`div`,{className:`j-avw`,children:[(0,l.jsx)(`span`,{className:`j-sname`,children:x.name?.[0]}),(0,l.jsxs)(`div`,{className:`j-sq`,children:[(0,l.jsx)(`span`,{className:`j-ini`,children:x.name?.[0]}),x.avatar&&(0,l.jsx)(`img`,{src:x.avatar,alt:``,onError:e=>{e.currentTarget.style.display=`none`}})]})]}),(0,l.jsx)(`div`,{className:`j-vsep`}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`div`,{className:`j-pn`,children:x.name}),(0,l.jsxs)(`div`,{className:`j-ps`,children:[`与你 · 共 `,r,` 期`,i>0?` · 连续 ${i}`:``]})]})]}),(0,l.jsx)(`div`,{className:`j-hr`})]}),(0,l.jsxs)(`div`,{className:`j-body2`,children:[(0,l.jsxs)(`div`,{className:`j-twrite`,onClick:()=>ye(a),children:[(0,l.jsx)(`div`,{className:`j-ic`,children:`＋`}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`div`,{className:`j-pl`,children:`写今天的日记`}),(0,l.jsx)(`div`,{className:`j-tsub`,children:`写下今天 · 与 TA 交换`})]}),(0,l.jsxs)(`div`,{className:`j-dd`,children:[h(a),` · `,g(a)]})]}),t&&(0,l.jsxs)(`div`,{className:`j-feat`,onClick:()=>ye(t.date),children:[(0,l.jsxs)(`div`,{className:`j-fd`,children:[(0,l.jsx)(`b`,{children:h(t.date)}),g(t.date)]}),(0,l.jsx)(`div`,{className:`j-ftext`,children:o(t.userPage.text)||`（空白的一页）`}),t.charPage?.text&&(0,l.jsxs)(`div`,{className:`j-reply`,children:[(0,l.jsx)(`div`,{className:`j-rl`,children:`TA 的一页`}),(0,l.jsxs)(`div`,{className:`j-rt`,children:[`「`,o(t.charPage.text),`」`]})]}),(0,l.jsx)(`div`,{className:`j-st2`,children:(e=>{let t=[];return e.charPage?t.push(`已交换`):t.push(`等 TA`),e.isArchived&&t.push(`已归档`),t.join(`  ·  `)})(t)})]}),n.map(e=>(0,l.jsxs)(`div`,{className:`j-pe`,onClick:()=>ye(e.date),children:[(0,l.jsx)(`div`,{className:`j-pd`,children:ne(e.date)}),(0,l.jsx)(`div`,{className:`j-vsep`}),(0,l.jsx)(`div`,{className:`j-pl2`,children:o(e.userPage.text)||`（空白）`}),(0,l.jsx)(`div`,{className:`j-ps2`,children:e.charPage?`已交换`:`等 TA`})]},e.id)),r===0&&(0,l.jsxs)(`div`,{className:`j-empty`,children:[`还没有交换过日记，`,(0,l.jsx)(`br`,{}),`从今天写下第一页吧。`]})]})]})]})}let Pe=C?.date||d(),$=k===`user`,Fe=$?C?.userPage:C?.charPage;return(0,l.jsxs)(`div`,{className:`j-root j-edit`,children:[(0,l.jsx)(`div`,{className:`j-grain`}),(0,l.jsxs)(`div`,{className:`j-ehead`,children:[(0,l.jsx)(`span`,{className:`j-ebk`,onClick:X,role:`button`,"aria-label":`返回日历`,children:`‹`}),(0,l.jsxs)(`span`,{className:`j-edt`,children:[h(Pe),` · `,g(Pe)]}),(0,l.jsxs)(`span`,{className:`j-eact`,children:[!$&&C?.charPage&&(0,l.jsx)(`span`,{className:`j-ehidebtn ${j?`on`:``}`,onClick:()=>me(!j),children:j?`显贴纸`:`隐贴纸`}),(0,l.jsx)(`span`,{className:`j-ea`,onClick:Ce,children:`保存`})]})]}),(0,l.jsxs)(`div`,{className:`j-etabs`,children:[(0,l.jsx)(`span`,{className:`j-etb ${$?`on`:``}`,onClick:()=>{A(`user`),F(null)},children:`你的一页`}),(0,l.jsx)(`span`,{className:`j-etb ${$?``:`on`}`,onClick:()=>{A(`char`),F(null)},children:x?.name?`${x.name}的一页`:`TA 的一页`})]}),(0,l.jsxs)(`div`,{className:`j-ewrap`,children:[$&&C&&Ne(C.userPage,`user`),!$&&(T?(0,l.jsxs)(`div`,{className:`j-wait`,children:[(0,l.jsxs)(`div`,{className:`j-arcwrap`,children:[(0,l.jsx)(`svg`,{width:`262`,height:`96`,viewBox:`0 0 262 96`,fill:`none`,children:(0,l.jsx)(`path`,{d:`M8 84 Q 132 -8 254 56`,stroke:`#a9a79f`,strokeWidth:`1.2`,strokeDasharray:`2 6`,strokeLinecap:`round`})}),(0,l.jsx)(`svg`,{className:`j-bird`,viewBox:`0 0 24 12`,fill:`none`,children:(0,l.jsx)(`path`,{d:`M1 9 C 5 3 8 3 12 8 C 16 3 19 3 23 9`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`})}),(0,l.jsx)(`svg`,{className:`j-bird b2`,viewBox:`0 0 24 12`,fill:`none`,children:(0,l.jsx)(`path`,{d:`M1 9 C 5 3 8 3 12 8 C 16 3 19 3 23 9`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`})}),(0,l.jsx)(`svg`,{className:`j-bird b3`,viewBox:`0 0 24 12`,fill:`none`,children:(0,l.jsx)(`path`,{d:`M1 9 C 5 3 8 3 12 8 C 16 3 19 3 23 9`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`})})]}),(0,l.jsx)(`div`,{className:`j-w1`,children:`交换中`}),(0,l.jsxs)(`div`,{className:`j-w2`,children:[x?.name||`TA`,` 正在读你的今天…`]}),(0,l.jsx)(`div`,{className:`j-w3`,children:`请 稍 候`})]}):C?.charPage?Ne(C.charPage,`char`):(0,l.jsxs)(`div`,{className:`j-emptyx`,children:[(0,l.jsx)(`div`,{className:`j-ex1`,children:`还没有交换今天`}),(0,l.jsxs)(`div`,{className:`j-ex2`,children:[`写完你的一页，`,(0,l.jsx)(`br`,{}),`就能看看 `,x?.name||`TA`,` 的今天。`]}),(0,l.jsxs)(`span`,{className:`j-exbtn`,onClick:je,children:[(0,l.jsx)(`span`,{className:`j-sw`,children:`⇄`}),`交换今天`]})]}))]}),D&&!T&&($||C?.charPage)&&(0,l.jsx)(`div`,{className:`j-tray`,children:(0,l.jsxs)(`div`,{className:`j-traygrid`,children:[(0,l.jsx)(`span`,{className:`j-trayadd`,onClick:()=>V(!0),role:`button`,"aria-label":`添加贴纸素材`,children:`＋`}),te.map((e,t)=>(0,l.jsx)(`span`,{className:`j-traycell`,onClick:()=>be(e),children:e},`def-${t}`)),z.map((e,t)=>(0,l.jsx)(`span`,{className:`j-traycell`,onClick:()=>be(e.url),onTouchStart:()=>Ae(e),onTouchEnd:Q,onMouseDown:()=>Ae(e),onMouseUp:Q,onMouseLeave:Q,onContextMenu:t=>{t.preventDefault(),W(e)},children:(0,l.jsx)(`img`,{src:e.url,className:`j-trayimg`})},`cust-${t}`))]})}),!T&&($||C?.charPage)&&(0,l.jsxs)(`div`,{className:`j-etool`,children:[(0,l.jsx)(`div`,{className:`j-chips`,children:ie.map(e=>(0,l.jsx)(`span`,{className:`j-chip j-chip-${e} ${Fe?.paperStyle===e?`on`:``}`,onClick:()=>Z({paperStyle:e},k)},e))}),(0,l.jsx)(`span`,{className:`j-stkbtn ${D?`on`:``}`,onClick:()=>O(!D),role:`button`,"aria-label":D?`关闭贴纸面板`:`打开贴纸面板`,children:`＋`}),$?(0,l.jsxs)(`span`,{className:`j-esend`,onClick:()=>{C?.userPage?.text?.trim()&&A(`char`),je()},children:[(0,l.jsx)(`span`,{className:`j-sw`,children:`⇄`}),`交换今天`]}):C?.charPage&&!C.isArchived?(0,l.jsx)(`span`,{className:`j-earch`,onClick:Me,children:E?`归档中…`:`归档记忆`}):C?.isArchived?(0,l.jsx)(`span`,{className:`j-archived`,children:`已归档`}):null]}),(0,l.jsx)(a,{isOpen:B,title:`添加贴纸`,onClose:()=>V(!1),footer:(0,l.jsx)(`button`,{onClick:xe,className:`w-full py-3 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition-all`,children:`确认添加`}),children:(0,l.jsxs)(`div`,{className:`space-y-3`,children:[(0,l.jsx)(`p`,{className:`text-xs text-slate-500`,children:`格式：贴纸名称--图片URL (每行一个)`}),(0,l.jsx)(`textarea`,{value:H,onChange:e=>ge(e.target.value),placeholder:`CoolCat--https://...
Heart--https://...`,className:`w-full h-32 bg-slate-100 rounded-2xl p-4 text-sm resize-none focus:outline-none text-slate-700`})]})}),(0,l.jsx)(a,{isOpen:!!U,title:`删除贴纸素材`,onClose:()=>W(null),footer:(0,l.jsxs)(`div`,{className:`flex gap-2 w-full`,children:[(0,l.jsx)(`button`,{onClick:()=>W(null),className:`flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold`,children:`取消`}),(0,l.jsx)(`button`,{onClick:Se,className:`flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold`,children:`删除`})]}),children:(0,l.jsxs)(`div`,{className:`flex flex-col items-center gap-3 py-2`,children:[U&&(0,l.jsx)(`img`,{src:U.url,className:`w-16 h-16 object-contain rounded-lg bg-slate-100 border`}),(0,l.jsx)(`p`,{className:`text-sm text-slate-600`,children:`确定要删除这个贴纸素材吗？(不会影响已使用的日记)`})]})})]})};export{y as default};