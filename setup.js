<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>NexoraDev — Work Panel</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#08080f;--bg2:#0e0e1c;--bg3:#131322;--bg4:#1a1a2e;
  --accent:#00f0a0;--accent2:#7b6cff;--red:#ff5c5c;--yellow:#ffd166;--blue:#5cb8ff;
  --text:#f0f0f8;--muted:#6b6b90;--muted2:#3d3d5c;
  --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.13);
  --r:10px;--rs:6px;--t:all .25s cubic-bezier(.4,0,.2,1);
}
html,body{min-height:100%;font-family:'Syne',sans-serif;background:var(--bg);color:var(--text)}
::selection{background:var(--accent);color:#08080f}
input,textarea,select,button{font-family:inherit}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--muted2);border-radius:4px}

/* ── LOGIN ── */
#login-screen{position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px}
#login-screen.gone{display:none}
.login-box{width:100%;max-width:380px}
.login-logo{font-size:26px;font-weight:800;margin-bottom:4px}
.login-logo span{color:var(--accent)}
.login-sub{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);margin-bottom:36px}
.lbl{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.15em;text-transform:uppercase;display:block;margin-bottom:7px}
.inp{width:100%;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:13px 16px;border-radius:var(--rs);font-family:'DM Mono',monospace;font-size:14px;outline:none;transition:border-color .2s;margin-bottom:14px}
.inp:focus{border-color:rgba(0,240,160,.5)}
.inp::placeholder{color:var(--muted2)}
.btn-full{width:100%;background:var(--accent);color:#08080f;border:none;padding:14px;border-radius:var(--rs);font-size:15px;font-weight:700;cursor:pointer;transition:opacity .2s;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-full:hover:not(:disabled){opacity:.85}
.btn-full:disabled{opacity:.6;cursor:not-allowed}
.login-err{font-family:'DM Mono',monospace;font-size:12px;color:var(--red);margin-top:12px;padding:10px 14px;background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.2);border-radius:var(--rs);display:none}
.login-attempts{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted2);margin-top:10px;text-align:center}

/* ── APP SHELL ── */
#app{display:none;min-height:100vh;flex-direction:column}
#app.show{display:flex}

/* ── TOPBAR ── */
.topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:0 24px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;flex-shrink:0}
.topbar-logo{font-size:18px;font-weight:800}
.topbar-logo span{color:var(--accent)}
.topbar-right{display:flex;align-items:center;gap:12px}
.topbar-user{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:8px}
.user-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#08080f;flex-shrink:0}
.btn-sm-outline{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);border:1px solid var(--border2);padding:6px 14px;border-radius:20px;cursor:pointer;background:transparent;transition:var(--t)}
.btn-sm-outline:hover{border-color:var(--red);color:var(--red)}

/* ── LAYOUT ── */
.layout{display:flex;flex:1;overflow:hidden;min-height:calc(100vh - 58px)}
.sidebar{width:220px;background:var(--bg2);border-right:1px solid var(--border);padding:20px 0;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
.sidebar-section{padding:0 16px;margin-bottom:24px}
.sidebar-title{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px;padding:0 8px}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:600;color:var(--muted);transition:var(--t);margin-bottom:2px;user-select:none}
.nav-item:hover{background:rgba(255,255,255,.04);color:var(--text)}
.nav-item.act{background:rgba(0,240,160,.1);color:var(--accent)}
.nav-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
.nav-badge{margin-left:auto;background:var(--accent);color:#08080f;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;font-family:'DM Mono',monospace;min-width:20px;text-align:center}
.nav-badge.red{background:var(--red);color:#fff}

/* ── MAIN ── */
.main{flex:1;overflow-y:auto;padding:28px}
.page{display:none}
.page.act{display:block}

/* ── LOADING ── */
.spinner{display:inline-block;width:20px;height:20px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-state{display:flex;align-items:center;gap:12px;font-family:'DM Mono',monospace;font-size:13px;color:var(--muted);padding:40px 0}

/* ── PAGE HEADER ── */
.ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}
.ph-left h1{font-size:22px;font-weight:800;letter-spacing:-.5px}
.ph-left p{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);margin-top:3px}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:var(--rs);font-size:13px;font-weight:700;cursor:pointer;transition:var(--t);border:none;font-family:'Syne',sans-serif}
.btn-accent{background:var(--accent);color:#08080f}
.btn-accent:hover:not(:disabled){opacity:.85}
.btn-accent:disabled{opacity:.5;cursor:not-allowed}
.btn-outline{background:transparent;border:1px solid var(--border2);color:var(--muted)}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.btn-sm{padding:7px 14px;font-size:12px}
.btn-red{background:rgba(255,92,92,.12);color:var(--red);border:1px solid rgba(255,92,92,.25)}
.btn-red:hover{background:rgba(255,92,92,.2)}

/* ── STATS ROW ── */
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:28px}
.stat-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:20px}
.stat-num{font-size:32px;font-weight:800;display:block;line-height:1}
.stat-lbl{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);margin-top:4px;display:block}

/* ── WORKERS ── */
.workers-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.worker-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:20px;transition:var(--t)}
.worker-card:hover{border-color:var(--border2)}
.wc-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.wc-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#08080f;flex-shrink:0}
.wc-name{font-size:15px;font-weight:700}
.wc-role{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);margin-top:2px}
.wc-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px}
.wcs{text-align:center;padding:8px;background:var(--bg4);border-radius:var(--rs)}
.wcs-n{font-size:18px;font-weight:800;display:block}
.wcs-l{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-top:2px;display:block}
.wc-actions{display:flex;gap:8px}

/* ── TASK FILTERS ── */
.task-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.tf{font-family:'DM Mono',monospace;font-size:11px;padding:6px 14px;border-radius:20px;border:1px solid var(--border2);color:var(--muted);cursor:pointer;background:transparent;transition:var(--t)}
.tf.act,.tf:hover{background:rgba(0,240,160,.1);border-color:rgba(0,240,160,.4);color:var(--accent)}

/* ── TASK CARDS ── */
.task-list{display:flex;flex-direction:column;gap:12px}
.task-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:20px;cursor:pointer;transition:var(--t)}
.task-card:hover{border-color:rgba(0,240,160,.3);transform:translateY(-1px)}
.task-card.ph{border-left:3px solid var(--red)}
.task-card.pm{border-left:3px solid var(--yellow)}
.task-card.pl{border-left:3px solid var(--blue)}
.tc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
.tc-title{font-size:15px;font-weight:700;letter-spacing:-.3px;flex:1}
.tc-badges{display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0}
.badge{font-family:'DM Mono',monospace;font-size:10px;padding:3px 9px;border-radius:10px;font-weight:500;white-space:nowrap}
.b-new{background:rgba(123,108,255,.15);color:var(--accent2);border:1px solid rgba(123,108,255,.3)}
.b-inprog{background:rgba(255,209,102,.12);color:var(--yellow);border:1px solid rgba(255,209,102,.3)}
.b-review{background:rgba(92,184,255,.12);color:var(--blue);border:1px solid rgba(92,184,255,.3)}
.b-done{background:rgba(0,240,160,.1);color:var(--accent);border:1px solid rgba(0,240,160,.3)}
.b-blocked{background:rgba(255,92,92,.12);color:var(--red);border:1px solid rgba(255,92,92,.3)}
.b-med{background:rgba(255,209,102,.12);color:var(--yellow);border:1px solid rgba(255,209,102,.3)}
.b-high{background:rgba(255,92,92,.12);color:var(--red);border:1px solid rgba(255,92,92,.3)}
.b-low{background:rgba(92,184,255,.12);color:var(--blue);border:1px solid rgba(92,184,255,.3)}
.tc-info{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:6px}
.tc-meta{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px}
.tc-progress{margin-top:12px}
.pbar{height:3px;background:var(--border2);border-radius:2px;overflow:hidden;margin-top:5px}
.pfill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--accent2),var(--accent))}
.plbl{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);display:flex;justify-content:space-between}

/* ── MODAL ── */
#modal-overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.75);display:none;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
#modal-overlay.show{display:flex}
.modal{background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:800px;margin:auto}
.modal-header{padding:24px 28px 18px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:16px}
.mh-info{flex:1}
.mh-info h2{font-size:20px;font-weight:800;letter-spacing:-.5px;margin-bottom:8px}
.mh-meta{display:flex;gap:8px;flex-wrap:wrap}
.modal-close{width:34px;height:34px;border-radius:50%;border:1px solid var(--border2);background:transparent;color:var(--muted);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--t)}
.modal-close:hover{border-color:var(--red);color:var(--red)}
.modal-body{padding:24px 28px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.modal-full{grid-column:1/-1}
.msec-title{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.15em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.msec-title::after{content:'';flex:1;height:1px;background:var(--border)}
.detail-field{margin-bottom:12px}
.df-lbl{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
.df-val{font-size:14px;font-weight:600;color:var(--text)}
.detail-box{background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:14px;font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);line-height:1.7;white-space:pre-wrap;word-break:break-word}
/* Notes */
.notes-list{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;max-height:200px;overflow-y:auto}
.note-item{background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:12px}
.note-meta{display:flex;justify-content:space-between;margin-bottom:5px}
.note-author{font-family:'DM Mono',monospace;font-size:11px;color:var(--accent);font-weight:500}
.note-time{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2)}
.note-text{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);line-height:1.6;word-break:break-word}
.note-input-wrap{display:flex;gap:8px;align-items:flex-start}
.note-input{flex:1;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:10px 13px;border-radius:var(--rs);font-family:'DM Mono',monospace;font-size:13px;outline:none;transition:border-color .2s,height .2s;resize:none;height:40px;min-height:40px}
.note-input:focus{border-color:rgba(0,240,160,.4);height:80px}
/* Attachments */
.attach-list{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.attach-item{display:flex;align-items:center;gap:10px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:10px 14px}
.attach-icon{font-size:18px;flex-shrink:0}
.attach-name{font-family:'DM Mono',monospace;font-size:12px;color:var(--accent);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;text-decoration:underline}
.attach-size{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);flex-shrink:0}
.attach-del{font-size:14px;color:var(--muted2);cursor:pointer;transition:color .2s;background:none;border:none;flex-shrink:0}
.attach-del:hover{color:var(--red)}
.drop-zone{border:2px dashed var(--border2);border-radius:var(--rs);padding:24px;text-align:center;cursor:pointer;transition:var(--t)}
.drop-zone:hover,.drop-zone.drag{border-color:rgba(0,240,160,.4);background:rgba(0,240,160,.03)}
.drop-zone p{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted)}
.drop-zone span{color:var(--accent)}
/* Progress */
.prog-wrap{display:flex;align-items:center;gap:12px;margin-top:8px}
.prog-slider{flex:1;-webkit-appearance:none;height:4px;background:var(--border2);border-radius:2px;outline:none;cursor:pointer}
.prog-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer}
.prog-val{font-family:'DM Mono',monospace;font-size:13px;color:var(--accent);min-width:36px;text-align:right}
.status-sel{width:100%;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:9px 12px;border-radius:var(--rs);font-family:'DM Mono',monospace;font-size:12px;outline:none;cursor:pointer;appearance:none;transition:border-color .2s}
.status-sel:focus{border-color:rgba(0,240,160,.4)}
.modal-footer{padding:16px 28px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px}

/* ── CREATE TASK MODAL ── */
#create-overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.8);display:none;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
#create-overlay.show{display:flex}
.create-modal{background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:640px;margin:auto}
.cm-header{padding:22px 28px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.cm-header h2{font-size:18px;font-weight:800}
.cm-body{padding:22px 28px}
.fg{margin-bottom:16px}
.fl{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;display:block;margin-bottom:7px}
.fi,.fsel,.fta{width:100%;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:11px 14px;border-radius:var(--rs);font-family:'DM Mono',monospace;font-size:13px;outline:none;transition:border-color .2s;appearance:none}
.fi:focus,.fsel:focus,.fta:focus{border-color:rgba(0,240,160,.5)}
.fi::placeholder,.fta::placeholder{color:var(--muted2)}
.fta{min-height:100px;resize:vertical}
.fsel option{background:var(--bg2)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cm-footer{padding:16px 28px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px}

/* ── ADD WORKER MODAL ── */
#worker-overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center;padding:20px}
#worker-overlay.show{display:flex}
.wm{background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:400px}
.wm-header{padding:22px 24px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.wm-body{padding:22px 24px}
.wm-footer{padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px}

/* ── TOAST ── */
#toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--bg3);border:1px solid rgba(0,240,160,.3);border-radius:var(--rs);padding:12px 18px;font-family:'DM Mono',monospace;font-size:13px;color:var(--text);display:flex;align-items:center;gap:10px;transform:translateY(80px);opacity:0;transition:transform .35s,opacity .35s;pointer-events:none;max-width:320px}
#toast.show{transform:translateY(0);opacity:1}
#toast.err{border-color:rgba(255,92,92,.3)}
.tico{font-size:15px}

/* ── EMPTY ── */
.empty{text-align:center;padding:60px 20px}
.empty-icon{font-size:48px;margin-bottom:16px}
.empty h3{font-size:18px;font-weight:700;margin-bottom:8px}
.empty p{font-family:'DM Mono',monospace;font-size:13px;color:var(--muted)}

/* ── RESPONSIVE ── */
@media(max-width:700px){
  .sidebar{display:none}
  .modal-body{grid-template-columns:1fr}
  .frow{grid-template-columns:1fr}
  .main{padding:16px}
  .stats-row{grid-template-columns:1fr 1fr}
}
/* ── CHAT ── */
#chat-btn{position:fixed;bottom:28px;right:28px;z-index:200;width:52px;height:52px;background:var(--accent2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;border:none;box-shadow:0 4px 20px rgba(123,108,255,.4);transition:var(--t)}
#chat-btn:hover{transform:scale(1.1)}
#chat-badge{position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace}
#chat-window{position:fixed;bottom:90px;right:28px;z-index:199;width:340px;height:480px;background:var(--bg2);border:1px solid var(--border2);border-radius:16px;display:none;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.6)}
#chat-window.open{display:flex}
.chat-header{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.chat-header h3{font-size:14px;font-weight:700}
.chat-header-sub{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted)}
.chat-close{background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;padding:2px 6px}
.chat-worker-tabs{display:flex;gap:4px;padding:8px 12px;border-bottom:1px solid var(--border);overflow-x:auto;flex-shrink:0}
.chat-tab{font-family:'DM Mono',monospace;font-size:10px;padding:4px 10px;border-radius:20px;border:1px solid var(--border2);color:var(--muted);cursor:pointer;background:transparent;white-space:nowrap;transition:var(--t);flex-shrink:0}
.chat-tab.act{background:rgba(123,108,255,.15);border-color:rgba(123,108,255,.4);color:var(--accent2)}
.chat-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.chat-msg{max-width:80%;padding:9px 12px;border-radius:10px;font-family:'DM Mono',monospace;font-size:12px;line-height:1.5}
.chat-msg.mine{background:rgba(123,108,255,.2);align-self:flex-end;border-bottom-right-radius:2px}
.chat-msg.theirs{background:var(--bg3);align-self:flex-start;border-bottom-left-radius:2px}
.chat-msg-author{font-size:10px;color:var(--muted);margin-bottom:3px}
.chat-msg-time{font-size:10px;color:var(--muted2);margin-top:3px;text-align:right}
.chat-input-wrap{padding:10px 12px;border-top:1px solid var(--border);display:flex;gap:8px;flex-shrink:0}
.chat-input{flex:1;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:9px 12px;border-radius:var(--rs);font-family:'DM Mono',monospace;font-size:12px;outline:none;resize:none;height:36px;transition:border-color .2s}
.chat-input:focus{border-color:rgba(123,108,255,.5);height:70px}
.chat-send{background:var(--accent2);color:#fff;border:none;padding:0 14px;border-radius:var(--rs);font-size:16px;cursor:pointer;flex-shrink:0;height:36px}
@media(max-width:700px){#chat-window{width:calc(100vw - 40px);right:20px}}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="login-screen">
  <div class="login-box">
    <div class="login-logo">Nexora<span>Dev</span></div>
    <div class="login-sub">Secure Work Panel — Authorized Access Only</div>
    <label class="lbl">Username</label>
    <input class="inp" id="l-user" type="text" placeholder="Username" autocomplete="username" spellcheck="false">
    <label class="lbl">Password</label>
    <input class="inp" id="l-pass" type="password" placeholder="Password" autocomplete="current-password">
    <button class="btn-full" id="login-btn" onclick="doLogin()">
      <span id="login-btn-text">Login →</span>
      <span class="spinner" id="login-spinner" style="display:none"></span>
    </button>
    <div class="login-err" id="lerr"></div>
    <div class="login-attempts" id="l-attempts"></div>
  </div>
</div>

<!-- APP -->
<div id="app">
  <div class="topbar">
    <div class="topbar-logo">Nexora<span>Dev</span></div>
    <div class="topbar-right">
      <div class="topbar-user">
        <div class="user-avatar" id="top-avatar">?</div>
        <span id="top-name">—</span>
      </div>
      <button class="btn-sm-outline" onclick="doLogout()">Logout</button>
    </div>
  </div>

  <div class="layout">
    <div class="sidebar" id="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-title">Menu</div>
        <div id="owner-nav" style="display:none">
          <div class="nav-item act" onclick="goPage('dashboard')"><span class="nav-icon">📊</span>Dashboard</div>
          <div class="nav-item" onclick="goPage('tasks')"><span class="nav-icon">📋</span>All Tasks<span class="nav-badge" id="nb-tasks">0</span></div>
          <div class="nav-item" onclick="goPage('workers')"><span class="nav-icon">👥</span>Workers<span class="nav-badge" id="nb-workers">0</span></div>
          <div class="nav-item" onclick="goPage('tickets')"><span class="nav-icon">🎫</span>Tickets<span class="nav-badge red" id="nb-tickets">0</span></div>
          <div class="nav-item" onclick="goPage('leads')"><span class="nav-icon">🔥</span>Leads<span class="nav-badge red" id="nb-leads">0</span></div>
        </div>
        <div id="worker-nav" style="display:none">
          <div class="nav-item act" onclick="goPage('my-tasks')"><span class="nav-icon">📋</span>My Tasks<span class="nav-badge" id="nb-my">0</span></div>
          <div class="nav-item" onclick="goPage('my-done')"><span class="nav-icon">✅</span>Completed</div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="page act" id="page-dashboard">
        <div class="ph">
          <div class="ph-left"><h1>Dashboard</h1><p>Overview of all work</p></div>
          <button class="btn btn-accent" onclick="openCreate()">+ New Task</button>
        </div>
        <div class="stats-row" id="dash-stats"></div>
        <div class="msec-title" style="margin-bottom:16px">Recent Tasks</div>
        <div class="task-list" id="dash-recent"></div>
      </div>

      <div class="page" id="page-tasks">
        <div class="ph">
          <div class="ph-left"><h1>All Tasks</h1><p>Manage and assign all jobs</p></div>
          <button class="btn btn-accent" onclick="openCreate()">+ New Task</button>
        </div>
        <div class="task-filters">
          <button class="tf act" onclick="filterTasks(this,'')">All</button>
          <button class="tf" onclick="filterTasks(this,'new')">New</button>
          <button class="tf" onclick="filterTasks(this,'in-progress')">In Progress</button>
          <button class="tf" onclick="filterTasks(this,'review')">Review</button>
          <button class="tf" onclick="filterTasks(this,'done')">Done</button>
          <button class="tf" onclick="filterTasks(this,'blocked')">Blocked</button>
        </div>
        <div class="task-list" id="all-tasks-list"></div>
      </div>

      <div class="page" id="page-workers">
        <div class="ph">
          <div class="ph-left"><h1>Workers</h1><p>Manage your team</p></div>
          <button class="btn btn-accent" onclick="openAddWorker()">+ Add Worker</button>
        </div>
        <div class="workers-grid" id="workers-grid"></div>
      </div>

      <div class="page" id="page-tickets">
        <div class="ph">
          <div class="ph-left"><h1>Support Tickets</h1><p>Client messages — reply and they get email notifications</p></div>
        </div>
        <div class="task-filters">
          <button class="tf act" onclick="filterTickets(this,'')">All</button>
          <button class="tf" onclick="filterTickets(this,'open')">Open</button>
          <button class="tf" onclick="filterTickets(this,'replied')">Replied</button>
          <button class="tf" onclick="filterTickets(this,'closed')">Closed</button>
        </div>
        <div class="task-list" id="tickets-list"></div>
      </div>
        <div class="ph">
          <div class="ph-left"><h1>My Tasks</h1><p id="worker-greeting">Your assigned jobs</p></div>
        </div>
        <div class="task-list" id="my-tasks-list"></div>
      </div>

      <div class="page" id="page-my-done">
        <div class="ph"><div class="ph-left"><h1>Completed</h1><p>Jobs you've finished</p></div></div>
        <div class="task-list" id="my-done-list"></div>
      </div>

      <div class="page" id="page-leads">
        <div class="ph">
          <div class="ph-left"><h1>Leads</h1><p>Incoming client requests from your portfolio site</p></div>
        </div>
        <div class="task-list" id="leads-list"></div>
      </div>
    </div>
  </div>
</div>

<!-- TASK DETAIL MODAL -->
<div id="modal-overlay" onclick="closeModalBg(event)">
  <div class="modal">
    <div class="modal-header">
      <div class="mh-info">
        <h2 id="m-title">—</h2>
        <div class="mh-meta" id="m-meta"></div>
      </div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div>
        <div class="msec-title">Gig Info</div>
        <div class="detail-field"><div class="df-lbl">Client / Platform</div><div class="df-val" id="m-client">—</div></div>
        <div class="detail-field"><div class="df-lbl">Service Type</div><div class="df-val" id="m-service">—</div></div>
        <div class="detail-field"><div class="df-lbl">Deadline</div><div class="df-val" id="m-deadline">—</div></div>
        <div class="detail-field"><div class="df-lbl">Budget</div><div class="df-val" id="m-budget">—</div></div>
        <div class="detail-field">
          <div class="df-lbl">Assigned To</div>
          <div id="m-assigned-owner" style="display:none">
            <select class="status-sel" id="m-assign-sel" onchange="saveAssign()" style="margin-top:4px">
              <option value="">Unassigned</option>
            </select>
          </div>
          <div class="df-val" id="m-assigned">—</div>
        </div>
        <div class="detail-field" id="m-link-field" style="display:none">
          <div class="df-lbl">Reference Link</div>
          <a id="m-link" href="#" target="_blank" rel="noopener noreferrer" style="font-family:'DM Mono',monospace;font-size:13px;color:var(--accent)">Open Link ↗</a>
        </div>
        <div class="msec-title" style="margin-top:20px">Requirements</div>
        <div class="detail-box" id="m-desc">—</div>
      </div>
      <div>
        <div class="msec-title">Progress</div>
        <div class="fg">
          <div class="fl">Status</div>
          <select class="status-sel" id="m-status-sel" onchange="saveStatus()">
            <option value="new">🆕 New</option>
            <option value="in-progress">⚙️ In Progress</option>
            <option value="review">👁 Review</option>
            <option value="done">✅ Done</option>
            <option value="blocked">🚫 Blocked</option>
          </select>
        </div>
        <div class="fl">Progress %</div>
        <div class="prog-wrap">
          <input type="range" class="prog-slider" id="m-prog" min="0" max="100" value="0" oninput="progInput(this.value)" onchange="saveProg()">
          <span class="prog-val" id="m-prog-val">0%</span>
        </div>
        <div class="pbar" style="margin-top:10px"><div class="pfill" id="m-pbar" style="width:0%"></div></div>

        <div class="msec-title" style="margin-top:22px">Updates & Notes</div>
        <div class="notes-list" id="m-notes"></div>
        <div class="note-input-wrap">
          <textarea class="note-input" id="m-note-inp" placeholder="Add a note or update..."></textarea>
          <button class="btn btn-accent btn-sm" onclick="addNote()" style="height:40px;flex-shrink:0">Post</button>
        </div>
      </div>

      <div class="modal-full">
        <div class="msec-title">Attachments</div>
        <div class="attach-list" id="m-attach-list"></div>
        <div class="drop-zone" id="drop-zone" onclick="document.getElementById('file-inp').click()" ondragover="dOver(event)" ondragleave="dLeave()" ondrop="dDrop(event)">
          <p>📎 Click or <span>drag files</span> to attach</p>
          <p style="font-size:10px;margin-top:4px;color:var(--muted2)">Images, PDFs, ZIPs, code files — max 10MB each</p>
        </div>
        <input type="file" id="file-inp" multiple style="display:none" onchange="fileSelected(this)">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-red btn-sm" id="m-del-btn" onclick="deleteTask()" style="display:none">🗑 Delete</button>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Close</button>
    </div>
  </div>
</div>

<!-- CREATE TASK MODAL -->
<div id="create-overlay" onclick="closeCreateBg(event)">
  <div class="create-modal">
    <div class="cm-header">
      <h2>New Task</h2>
      <button class="modal-close" onclick="closeCreate()">×</button>
    </div>
    <div class="cm-body">
      <div class="fg"><label class="fl">Title *</label><input class="fi" id="c-title" placeholder="e.g. Build landing page for Ahmed"></div>
      <div class="frow">
        <div class="fg"><label class="fl">Client / Platform</label><input class="fi" id="c-client" placeholder="Fiverr / Direct"></div>
        <div class="fg"><label class="fl">Service Type</label>
          <select class="fsel" id="c-service">
            <option value="">Select...</option>
            <option>Landing Page</option><option>Telegram Bot</option><option>Backend API</option>
            <option>CS2 Tool</option><option>Crypto / Web3</option><option>VPS Deployment</option>
            <option>Web Scraper</option><option>Discord Bot</option><option>React App</option><option>Other</option>
          </select>
        </div>
      </div>
      <div class="frow">
        <div class="fg"><label class="fl">Assign To</label><select class="fsel" id="c-assign"><option value="">Unassigned</option></select></div>
        <div class="fg"><label class="fl">Priority</label>
          <select class="fsel" id="c-priority"><option value="med">🟡 Medium</option><option value="high">🔴 High</option><option value="low">🔵 Low</option></select>
        </div>
      </div>
      <div class="frow">
        <div class="fg"><label class="fl">Deadline</label><input class="fi" id="c-deadline" type="date"></div>
        <div class="fg"><label class="fl">Budget / Pay</label><input class="fi" id="c-budget" placeholder="e.g. $80"></div>
      </div>
      <div class="fg"><label class="fl">Full Requirements</label><textarea class="fta" id="c-desc" placeholder="Tech stack, design requirements, special instructions..."></textarea></div>
      <div class="fg"><label class="fl">Reference Link</label><input class="fi" id="c-link" placeholder="Fiverr gig link, design reference..."></div>
    </div>
    <div class="cm-footer">
      <button class="btn btn-outline btn-sm" onclick="closeCreate()">Cancel</button>
      <button class="btn btn-accent btn-sm" id="create-btn" onclick="createTask()">Create Task →</button>
    </div>
  </div>
</div>

<!-- ADD WORKER MODAL -->
<div id="worker-overlay" onclick="closeWorkerBg(event)">
  <div class="wm">
    <div class="wm-header"><h2>Add Worker</h2><button class="modal-close" onclick="closeWorker()">×</button></div>
    <div class="wm-body">
      <div class="fg"><label class="fl">Full Name</label><input class="fi" id="w-name" placeholder="e.g. Ali Hassan"></div>
      <div class="fg"><label class="fl">Username (for login)</label><input class="fi" id="w-user" placeholder="e.g. ali" autocomplete="off"></div>
      <div class="fg"><label class="fl">Password (min 8 chars)</label><input class="fi" id="w-pass" type="password" placeholder="Strong password"></div>
      <div class="fg"><label class="fl">Specialty / Role</label><input class="fi" id="w-role" placeholder="e.g. Frontend Dev, Bot Dev"></div>
    </div>
    <div class="wm-footer">
      <button class="btn btn-outline btn-sm" onclick="closeWorker()">Cancel</button>
      <button class="btn btn-accent btn-sm" id="add-worker-btn" onclick="addWorker()">Add Worker →</button>
    </div>
  </div>
</div>

<!-- TICKET MODAL -->
<div id="ticket-overlay" onclick="closeTicketBg(event)" style="position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.8);display:none;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto">
  <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:640px;margin:auto">
    <div style="padding:22px 28px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
      <div>
        <h2 style="font-size:18px;font-weight:800" id="tk-title">Ticket</h2>
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);margin-top:4px" id="tk-meta"></div>
      </div>
      <button class="modal-close" onclick="closeTicket()">×</button>
    </div>
    <div style="padding:22px 28px">
      <!-- Original message -->
      <div class="msec-title">Client Message</div>
      <div class="detail-box" id="tk-message" style="margin-bottom:20px"></div>
      <!-- Client info -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        <div class="detail-field"><div class="df-lbl">Name</div><div class="df-val" id="tk-name">—</div></div>
        <div class="detail-field"><div class="df-lbl">Email</div><div class="df-val" id="tk-email" style="font-family:'DM Mono',monospace;font-size:13px">—</div></div>
        <div class="detail-field"><div class="df-lbl">Service</div><div class="df-val" id="tk-service">—</div></div>
        <div class="detail-field"><div class="df-lbl">Budget</div><div class="df-val" id="tk-budget">—</div></div>
      </div>
      <!-- Reply history -->
      <div class="msec-title">Reply History</div>
      <div class="notes-list" id="tk-replies" style="margin-bottom:14px"></div>
      <!-- Reply form -->
      <div class="msec-title">Send Reply</div>
      <textarea class="fta" id="tk-reply-txt" placeholder="Type your reply to the client... They will receive it by email." style="margin-bottom:12px;min-height:120px"></textarea>
      <div style="display:flex;gap:10px;justify-content:space-between;align-items:center">
        <select class="fsel" id="tk-status-sel" style="max-width:160px">
          <option value="open">🟡 Open</option>
          <option value="replied">💬 Replied</option>
          <option value="closed">✅ Closed</option>
        </select>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" onclick="closeTicket()">Cancel</button>
          <button class="btn btn-accent btn-sm" id="tk-send-btn" onclick="sendReply()">Send Reply & Email →</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- CHAT BUTTON -->
<button id="chat-btn" onclick="toggleChat()">
  💬
  <span id="chat-badge" style="display:none">0</span>
</button>

<!-- CHAT WINDOW -->
<div id="chat-window">
  <div class="chat-header">
    <div>
      <h3 id="chat-title">Team Chat</h3>
      <div class="chat-header-sub" id="chat-sub">Direct messages</div>
    </div>
    <button class="chat-close" onclick="toggleChat()">×</button>
  </div>
  <div class="chat-worker-tabs" id="chat-tabs"></div>
  <div class="chat-messages" id="chat-messages">
    <div style="text-align:center;font-family:'DM Mono',monospace;font-size:12px;color:var(--muted2);padding:20px">Select a conversation</div>
  </div>
  <div class="chat-input-wrap">
    <textarea class="chat-input" id="chat-input" placeholder="Type a message..." onkeydown="chatKeydown(event)"></textarea>
    <button class="chat-send" onclick="sendChatMsg()">➤</button>
  </div>
</div>

<!-- TOAST -->
<div id="toast"><span class="tico">✓</span><span id="toast-msg">Done!</span></div>

<script>
// ══════════════════════════════════════════
// CONFIG — change to your server URL
// ══════════════════════════════════════════
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001/api'
  : '/api';

// ══════════════════════════════════════════
// TOKEN STORAGE (memory + sessionStorage only — NOT localStorage)
// ══════════════════════════════════════════
let accessToken  = sessionStorage.getItem('_at') || null;
let refreshToken = sessionStorage.getItem('_rt') || null;
let currentUser  = null;
let currentTaskId = null;
let taskFilter   = '';
let loginAttempts = 0;
let loginLocked  = false;

// ══════════════════════════════════════════
// API HELPER
// ══════════════════════════════════════════
async function api(method, path, body, isForm=false) {
  const headers = {};
  if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
  if (!isForm) headers['Content-Type'] = 'application/json';

  let res = await fetch(API + path, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined),
    credentials: 'same-origin'
  });

  // Try token refresh on 401
  if (res.status === 401 && refreshToken && path !== '/auth/login') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = 'Bearer ' + accessToken;
      res = await fetch(API + path, {
        method, headers,
        body: isForm ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'same-origin'
      });
    } else {
      doLogout();
      return null;
    }
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function tryRefresh() {
  try {
    const res = await fetch(API + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'same-origin'
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.accessToken;
    sessionStorage.setItem('_at', accessToken);
    return true;
  } catch { return false; }
}

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
async function doLogin() {
  if (loginLocked) return;
  const u = document.getElementById('l-user').value.trim();
  const p = document.getElementById('l-pass').value;
  const err = document.getElementById('lerr');
  const btn = document.getElementById('login-btn');
  const spinner = document.getElementById('login-spinner');
  const btnTxt = document.getElementById('login-btn-text');
  err.style.display = 'none';

  btn.disabled = true; spinner.style.display='inline-block'; btnTxt.textContent='Logging in...';

  try {
    const data = await api('POST', '/auth/login', { username: u, password: p });
    accessToken  = data.accessToken;
    refreshToken = data.refreshToken;
    sessionStorage.setItem('_at', accessToken);
    sessionStorage.setItem('_rt', refreshToken);
    currentUser  = data.user;
    loginAttempts = 0;
    document.getElementById('l-attempts').textContent = '';
    startApp();
  } catch (e) {
    loginAttempts++;
    const remaining = Math.max(0, 5 - loginAttempts);
    err.textContent = e.message.includes('429') || e.message.includes('many')
      ? '⛔ Too many attempts. Wait 15 minutes.'
      : `❌ Invalid credentials. ${remaining} attempts remaining.`;
    err.style.display = 'block';
    if (loginAttempts >= 5) {
      loginLocked = true;
      btn.disabled = true;
      document.getElementById('l-attempts').textContent = '⏳ Locked for 15 minutes.';
      setTimeout(() => { loginLocked=false; loginAttempts=0; btn.disabled=false; document.getElementById('l-attempts').textContent=''; }, 15*60*1000);
    }
  } finally {
    if (!loginLocked) btn.disabled = false;
    spinner.style.display = 'none';
    btnTxt.textContent = 'Login →';
  }
}

async function doLogout() {
  try { await api('POST', '/auth/logout', { refreshToken }); } catch {}
  accessToken = refreshToken = currentUser = null;
  sessionStorage.clear();
  document.getElementById('app').classList.remove('show');
  document.getElementById('login-screen').classList.remove('gone');
  document.getElementById('l-user').value='';
  document.getElementById('l-pass').value='';
  closeModal(); closeCreate(); closeWorker();
}

// Auto-restore session on page load
(async function init() {
  if (!accessToken) return;
  try {
    const data = await api('GET', '/auth/me');
    if (data?.user) { currentUser = data.user; startApp(); }
    else { sessionStorage.clear(); accessToken=null; refreshToken=null; }
  } catch { sessionStorage.clear(); accessToken=null; refreshToken=null; }
})();

// ══════════════════════════════════════════
// APP START
// ══════════════════════════════════════════
function startApp() {
  document.getElementById('login-screen').classList.add('gone');
  document.getElementById('app').classList.add('show');
  document.getElementById('top-name').textContent = currentUser.name;
  document.getElementById('top-avatar').textContent = currentUser.name[0].toUpperCase();
  if (currentUser.role === 'owner') {
    document.getElementById('owner-nav').style.display = 'block';
    document.getElementById('worker-nav').style.display = 'none';
    goPage('dashboard');
  } else {
    document.getElementById('owner-nav').style.display = 'none';
    document.getElementById('worker-nav').style.display = 'block';
    goPage('my-tasks');
  }
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
function goPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('act'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('act'));
  document.getElementById('page-'+id).classList.add('act');
  document.querySelectorAll('.nav-item').forEach(n=>{
    if(n.getAttribute('onclick')?.includes("'"+id+"'")) n.classList.add('act');
  });
  if(id==='dashboard') renderDashboard();
  if(id==='tasks')     renderAllTasks();
  if(id==='workers')   renderWorkers();
  if(id==='my-tasks')  renderMyTasks(false);
  if(id==='my-done')   renderMyTasks(true);
  if(id==='tickets')   renderTickets();
  if(id==='leads')     renderLeads();
}

function loading(elId) {
  document.getElementById(elId).innerHTML = `<div class="loading-state"><span class="spinner"></span>Loading...</div>`;
}

// ══════════════════════════════════════════
// RENDER HELPERS
// ══════════════════════════════════════════
function statusBadge(s) {
  const map={new:'b-new',  'in-progress':'b-inprog', review:'b-review', done:'b-done', blocked:'b-blocked'};
  const txt={new:'🆕 New', 'in-progress':'⚙️ In Progress', review:'👁 Review', done:'✅ Done', blocked:'🚫 Blocked'};
  return `<span class="badge ${map[s]||'b-new'}">${txt[s]||s}</span>`;
}
function priBadge(p) {
  if(p==='high') return '<span class="badge b-high">🔴 High</span>';
  if(p==='low')  return '<span class="badge b-low">🔵 Low</span>';
  return '<span class="badge b-med">🟡 Med</span>';
}
function fmtDate(d) {
  if(!d) return '—';
  return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
}
function escHtml(s) {
  if(!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function taskCardHtml(t) {
  const pc = {high:'ph',med:'pm',low:'pl'}[t.priority||'med'];
  const p = t.progress||0;
  return `
  <div class="task-card ${pc}" onclick="openTask('${escHtml(t.id)}')">
    <div class="tc-top">
      <div class="tc-title">${escHtml(t.title)}</div>
      <div class="tc-badges">${statusBadge(t.status||'new')}${priBadge(t.priority||'med')}</div>
    </div>
    <div class="tc-info">
      <div class="tc-meta">👤 ${escHtml(t.assigned_name||'Unassigned')}</div>
      ${t.client_name?`<div class="tc-meta">🏷 ${escHtml(t.client_name)}</div>`:''}
      ${t.service_type?`<div class="tc-meta">⚙️ ${escHtml(t.service_type)}</div>`:''}
      ${t.deadline?`<div class="tc-meta">📅 ${fmtDate(t.deadline)}</div>`:''}
      ${t.budget?`<div class="tc-meta">💰 ${escHtml(t.budget)}</div>`:''}
      ${t.note_count>0?`<div class="tc-meta">💬 ${t.note_count}</div>`:''}
      ${t.attachment_count>0?`<div class="tc-meta">📎 ${t.attachment_count}</div>`:''}
    </div>
    <div class="tc-progress">
      <div class="plbl"><span>Progress</span><span>${p}%</span></div>
      <div class="pbar"><div class="pfill" style="width:${p}%"></div></div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════
async function renderDashboard() {
  try {
    const [stats, tasks] = await Promise.all([
      api('GET','/stats'),
      api('GET','/tasks')
    ]);
    const s = stats.tasks;
    document.getElementById('dash-stats').innerHTML = `
      <div class="stat-card"><span class="stat-num" style="color:var(--accent)">${s.total}</span><span class="stat-lbl">Total Tasks</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--yellow)">${s.in_progress}</span><span class="stat-lbl">In Progress</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--accent)">${s.done}</span><span class="stat-lbl">Completed</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--red)">${s.blocked}</span><span class="stat-lbl">Blocked</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--blue)">${stats.workers}</span><span class="stat-lbl">Workers</span></div>
    `;
    const recent = tasks.slice(0,5);
    const el = document.getElementById('dash-recent');
    el.innerHTML = recent.length ? recent.map(taskCardHtml).join('') : `<div class="empty"><div class="empty-icon">📋</div><h3>No tasks yet</h3><p>Create your first task</p></div>`;
    if(document.getElementById('nb-tasks')) document.getElementById('nb-tasks').textContent = tasks.filter(t=>t.status!=='done').length;
    if(document.getElementById('nb-workers')) document.getElementById('nb-workers').textContent = stats.workers;
  } catch(e) { toast(e.message,'err'); }
}

// ══════════════════════════════════════════
// ALL TASKS
// ══════════════════════════════════════════
function filterTasks(btn, f) {
  document.querySelectorAll('.tf').forEach(b=>b.classList.remove('act'));
  btn.classList.add('act');
  taskFilter = f;
  renderAllTasks();
}
async function renderAllTasks() {
  loading('all-tasks-list');
  try {
    const url = taskFilter ? `/tasks?status=${taskFilter}` : '/tasks';
    const tasks = await api('GET', url);
    const el = document.getElementById('all-tasks-list');
    el.innerHTML = tasks.length ? tasks.map(taskCardHtml).join('') : `<div class="empty"><div class="empty-icon">📋</div><h3>No tasks</h3><p>Create a new task or change the filter</p></div>`;
  } catch(e) { toast(e.message,'err'); }
}

// ══════════════════════════════════════════
// WORKERS
// ══════════════════════════════════════════
async function renderWorkers() {
  loading('workers-grid');
  try {
    const workers = await api('GET', '/users');
    const el = document.getElementById('workers-grid');
    if (!workers.length) { el.innerHTML=`<div class="empty"><div class="empty-icon">👥</div><h3>No workers yet</h3><p>Add your first team member</p></div>`; return; }
    el.innerHTML = workers.map(w=>`
      <div class="worker-card">
        <div class="wc-top">
          <div class="wc-avatar" style="background:${escHtml(w.color||'#7b6cff')}">${w.name[0]}</div>
          <div><div class="wc-name">${escHtml(w.name)}</div><div class="wc-role">${escHtml(w.specialty||'Developer')}</div></div>
        </div>
        <div class="wc-stats">
          <div class="wcs"><span class="wcs-n" style="color:var(--accent)">${w.total_tasks}</span><span class="wcs-l">Total</span></div>
          <div class="wcs"><span class="wcs-n" style="color:var(--yellow)">${w.active_tasks}</span><span class="wcs-l">Active</span></div>
          <div class="wcs"><span class="wcs-n" style="color:var(--accent)">${w.done_tasks}</span><span class="wcs-l">Done</span></div>
        </div>
        <div class="wc-actions">
          <button class="btn btn-outline btn-sm" style="flex:1" onclick="filterByWorker('${escHtml(w.id)}','${escHtml(w.name)}')">View Tasks</button>
          <button class="btn btn-red btn-sm" onclick="removeWorker('${escHtml(w.id)}')">🗑</button>
        </div>
      </div>`).join('');
    document.getElementById('nb-workers').textContent = workers.length;
  } catch(e) { toast(e.message,'err'); }
}

function filterByWorker(id, name) {
  goPage('tasks');
}

async function removeWorker(id) {
  if (!confirm('Deactivate this worker? They will lose access immediately.')) return;
  try {
    await api('DELETE', '/users/'+id);
    renderWorkers();
    toast('Worker deactivated');
  } catch(e) { toast(e.message,'err'); }
}

// ══════════════════════════════════════════
// MY TASKS (WORKER)
// ══════════════════════════════════════════
async function renderMyTasks(done=false) {
  const elId = done ? 'my-done-list' : 'my-tasks-list';
  loading(elId);
  try {
    const tasks = await api('GET', '/tasks' + (done ? '?status=done' : ''));
    if (!done) {
      const active = tasks.filter(t=>t.status!=='done');
      document.getElementById('worker-greeting').textContent = `Hello ${currentUser.name} — ${active.length} active task${active.length!==1?'s':''}`;
      if(document.getElementById('nb-my')) document.getElementById('nb-my').textContent = active.length;
      document.getElementById(elId).innerHTML = active.length ? active.map(taskCardHtml).join('') : `<div class="empty"><div class="empty-icon">🎉</div><h3>All clear!</h3><p>No active tasks assigned to you</p></div>`;
    } else {
      const done_tasks = tasks.filter(t=>t.status==='done');
      document.getElementById(elId).innerHTML = done_tasks.length ? done_tasks.map(taskCardHtml).join('') : `<div class="empty"><div class="empty-icon">📭</div><h3>No completed tasks yet</h3><p>Nothing finished yet</p></div>`;
    }
  } catch(e) { toast(e.message,'err'); }
}

// ══════════════════════════════════════════
// TASK DETAIL MODAL
// ══════════════════════════════════════════
async function openTask(id) {
  currentTaskId = id;
  document.getElementById('m-title').textContent = 'Loading...';
  document.getElementById('modal-overlay').classList.add('show');
  try {
    const t = await api('GET', '/tasks/'+id);
    document.getElementById('m-title').textContent = t.title;
    document.getElementById('m-client').textContent = t.client_name || '—';
    document.getElementById('m-service').textContent = t.service_type || '—';
    document.getElementById('m-deadline').textContent = fmtDate(t.deadline);
    document.getElementById('m-budget').textContent = t.budget || '—';
    document.getElementById('m-assigned').textContent = t.assigned_name || 'Unassigned';
    // Show reassign dropdown for owner
    if (currentUser.role === 'owner') {
      document.getElementById('m-assigned-owner').style.display = 'block';
      document.getElementById('m-assigned').style.display = 'none';
      try {
        const workers = await api('GET', '/users');
        const sel = document.getElementById('m-assign-sel');
        sel.innerHTML = '<option value="">Unassigned</option>' + workers.map(w=>`<option value="${escHtml(w.id)}">${escHtml(w.name)}</option>`).join('');
        sel.value = t.assigned_to || '';
      } catch {}
    } else {
      document.getElementById('m-assigned-owner').style.display = 'none';
      document.getElementById('m-assigned').style.display = 'block';
    }
    document.getElementById('m-desc').textContent = t.description || 'No requirements provided.';
    document.getElementById('m-meta').innerHTML = statusBadge(t.status||'new') + priBadge(t.priority||'med');
    if (t.reference_link) {
      document.getElementById('m-link-field').style.display='block';
      document.getElementById('m-link').href = t.reference_link;
    } else {
      document.getElementById('m-link-field').style.display='none';
    }
    document.getElementById('m-status-sel').value = t.status||'new';
    const prog = t.progress||0;
    document.getElementById('m-prog').value = prog;
    document.getElementById('m-prog-val').textContent = prog+'%';
    document.getElementById('m-pbar').style.width = prog+'%';
    document.getElementById('m-del-btn').style.display = currentUser.role==='owner'?'inline-flex':'none';
    renderNotes(t.notes||[]);
    renderAttachments(t.attachments||[]);
    document.getElementById('m-note-inp').value='';
  } catch(e) { toast(e.message,'err'); closeModal(); }
}

function closeModalBg(e) { if(e.target===document.getElementById('modal-overlay')) closeModal(); }
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  currentTaskId = null;
  refreshPage();
}

async function saveAssign() {
  if(!currentTaskId) return;
  const val = document.getElementById('m-assign-sel').value;
  try {
    await api('PATCH','/tasks/'+currentTaskId,{assigned_to: val||null});
    toast('Worker assigned');
  } catch(e) { toast(e.message,'err'); }
}

async function saveStatus() {
  if(!currentTaskId) return;
  try {
    await api('PATCH','/tasks/'+currentTaskId,{status:document.getElementById('m-status-sel').value});
    toast('Status updated');
  } catch(e) { toast(e.message,'err'); }
}

function progInput(v) {
  document.getElementById('m-prog-val').textContent=v+'%';
  document.getElementById('m-pbar').style.width=v+'%';
}
async function saveProg() {
  if(!currentTaskId) return;
  try {
    await api('PATCH','/tasks/'+currentTaskId,{progress:parseInt(document.getElementById('m-prog').value)});
    toast('Progress saved');
  } catch(e) { toast(e.message,'err'); }
}

function renderNotes(notes) {
  const el = document.getElementById('m-notes');
  el.innerHTML = notes.length
    ? notes.map(n=>`<div class="note-item"><div class="note-meta"><span class="note-author">${escHtml(n.author_name)}</span><span class="note-time">${new Date(n.created_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><div class="note-text">${escHtml(n.content)}</div></div>`).join('')
    : `<div style="font-family:'DM Mono',monospace;font-size:12px;color:var(--muted2);padding:6px 0">No notes yet.</div>`;
  el.scrollTop = el.scrollHeight;
}

async function addNote() {
  const inp = document.getElementById('m-note-inp');
  const content = inp.value.trim();
  if(!content || !currentTaskId) return;
  try {
    const note = await api('POST','/notes/'+currentTaskId,{content});
    const el = document.getElementById('m-notes');
    el.innerHTML += `<div class="note-item"><div class="note-meta"><span class="note-author">${escHtml(note.author_name)}</span><span class="note-time">Just now</span></div><div class="note-text">${escHtml(note.content)}</div></div>`;
    el.scrollTop = el.scrollHeight;
    inp.value='';
    toast('Note added');
  } catch(e) { toast(e.message,'err'); }
}
document.getElementById('m-note-inp').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();addNote();}});

function fIcon(name) {
  if(/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name)) return '🖼';
  if(/\.pdf$/i.test(name)) return '📄';
  if(/\.(zip|rar|7z)$/i.test(name)) return '📦';
  if(/\.(js|ts|py|php|html|css|json)$/i.test(name)) return '💻';
  return '📎';
}
function fmtSize(b) { return b<1024*1024 ? (b/1024).toFixed(1)+' KB' : (b/1024/1024).toFixed(1)+' MB'; }

function renderAttachments(atts) {
  const el = document.getElementById('m-attach-list');
  el.innerHTML = atts.map(a=>`
    <div class="attach-item">
      <span class="attach-icon">${fIcon(a.original_name)}</span>
      <span class="attach-name" onclick="downloadFile('${escHtml(a.id)}','${escHtml(a.original_name)}')">${escHtml(a.original_name)}</span>
      <span class="attach-size">${fmtSize(a.file_size)}</span>
      ${currentUser.role==='owner'?`<button class="attach-del" onclick="deleteAttach('${escHtml(a.id)}')">✕</button>`:''}
    </div>`).join('');
}

async function downloadFile(id, name) {
  try {
    const res = await fetch(`${API}/attachments/download/${id}`, { headers:{'Authorization':'Bearer '+accessToken} });
    if(!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=name; a.click();
    URL.revokeObjectURL(url);
  } catch(e) { toast(e.message,'err'); }
}

function dOver(e) { e.preventDefault(); document.getElementById('drop-zone').classList.add('drag'); }
function dLeave()  { document.getElementById('drop-zone').classList.remove('drag'); }
function dDrop(e)  { e.preventDefault(); dLeave(); uploadFiles(Array.from(e.dataTransfer.files)); }
function fileSelected(inp) { uploadFiles(Array.from(inp.files)); inp.value=''; }

async function uploadFiles(files) {
  if(!currentTaskId||!files.length) return;
  const fd = new FormData();
  files.forEach(f=>fd.append('files',f));
  try {
    const saved = await api('POST','/attachments/'+currentTaskId,fd,true);
    const el = document.getElementById('m-attach-list');
    el.innerHTML += saved.map(a=>`
      <div class="attach-item">
        <span class="attach-icon">${fIcon(a.original_name)}</span>
        <span class="attach-name" onclick="downloadFile('${escHtml(a.id)}','${escHtml(a.original_name)}')">${escHtml(a.original_name)}</span>
        <span class="attach-size">${fmtSize(a.file_size)}</span>
        ${currentUser.role==='owner'?`<button class="attach-del" onclick="deleteAttach('${escHtml(a.id)}')">✕</button>`:''}
      </div>`).join('');
    toast(`📎 ${saved.length} file${saved.length>1?'s':''} attached`);
  } catch(e) { toast(e.message,'err'); }
}

async function deleteAttach(id) {
  try {
    await api('DELETE','/attachments/'+id);
    const el = document.getElementById('m-attach-list');
    // Re-render from server
    const t = await api('GET','/tasks/'+currentTaskId);
    renderAttachments(t.attachments||[]);
    toast('Attachment removed');
  } catch(e) { toast(e.message,'err'); }
}

async function deleteTask() {
  if(!confirm('Permanently delete this task?')) return;
  try {
    await api('DELETE','/tasks/'+currentTaskId);
    closeModal();
    toast('Task deleted');
  } catch(e) { toast(e.message,'err'); }
}

// ══════════════════════════════════════════
// CREATE TASK
// ══════════════════════════════════════════
async function openCreate() {
  // Populate worker list
  try {
    const workers = await api('GET','/users');
    const sel = document.getElementById('c-assign');
    sel.innerHTML = '<option value="">Unassigned</option>' + workers.map(w=>`<option value="${escHtml(w.id)}">${escHtml(w.name)}</option>`).join('');
  } catch {}
  document.getElementById('create-overlay').classList.add('show');
  document.getElementById('c-title').focus();
}
function closeCreateBg(e) { if(e.target===document.getElementById('create-overlay')) closeCreate(); }
function closeCreate() { document.getElementById('create-overlay').classList.remove('show'); }

async function createTask() {
  const title = document.getElementById('c-title').value.trim();
  if(!title) { toast('Title is required','err'); return; }
  const btn = document.getElementById('create-btn');
  btn.disabled = true; btn.textContent = 'Creating...';
  try {
    const body = {
      title,
      client_name:   document.getElementById('c-client').value.trim()||undefined,
      service_type:  document.getElementById('c-service').value||undefined,
      assigned_to:   document.getElementById('c-assign').value||undefined,
      priority:      document.getElementById('c-priority').value,
      deadline:      document.getElementById('c-deadline').value||undefined,
      budget:        document.getElementById('c-budget').value.trim()||undefined,
      description:   document.getElementById('c-desc').value.trim()||undefined,
      reference_link:document.getElementById('c-link').value.trim()||undefined,
    };
    Object.keys(body).forEach(k=>body[k]===undefined&&delete body[k]);
    await api('POST','/tasks',body);
    closeCreate();
    ['c-title','c-client','c-budget','c-desc','c-link','c-deadline'].forEach(id=>document.getElementById(id).value='');
    refreshPage();
    toast('✅ Task created!');
  } catch(e) { toast(e.message,'err'); }
  finally { btn.disabled=false; btn.textContent='Create Task →'; }
}

// ══════════════════════════════════════════
// ADD WORKER
// ══════════════════════════════════════════
function openAddWorker() { document.getElementById('worker-overlay').classList.add('show'); document.getElementById('w-name').focus(); }
function closeWorkerBg(e) { if(e.target===document.getElementById('worker-overlay')) closeWorker(); }
function closeWorker() { document.getElementById('worker-overlay').classList.remove('show'); }

async function addWorker() {
  const name = document.getElementById('w-name').value.trim();
  const user = document.getElementById('w-user').value.trim().toLowerCase();
  const pass = document.getElementById('w-pass').value;
  const role = document.getElementById('w-role').value.trim();
  if(!name||!user||!pass) { toast('Name, username & password required','err'); return; }
  if(pass.length<8) { toast('Password must be at least 8 characters','err'); return; }
  const btn = document.getElementById('add-worker-btn');
  btn.disabled=true; btn.textContent='Adding...';
  try {
    await api('POST','/users',{username:user,password:pass,name,specialty:role||undefined,color:['#7b6cff','#ff6b9d','#ffd166','#5cb8ff','#00f0a0'][Math.floor(Math.random()*5)]});
    closeWorker();
    ['w-name','w-user','w-pass','w-role'].forEach(id=>document.getElementById(id).value='');
    renderWorkers();
    toast('👤 Worker added!');
  } catch(e) { toast(e.message,'err'); }
  finally { btn.disabled=false; btn.textContent='Add Worker →'; }
}

// ══════════════════════════════════════════
// TICKETS
// ══════════════════════════════════════════
let currentTicketId = null;
let ticketFilter = '';

function filterTickets(btn, f) {
  document.querySelectorAll('.tf').forEach(b=>b.classList.remove('act'));
  btn.classList.add('act');
  ticketFilter = f;
  renderTickets();
}

async function renderTickets() {
  loading('tickets-list');
  try {
    const url = ticketFilter ? `/leads?status=${ticketFilter}` : '/leads';
    const tickets = await api('GET', url);
    const open = tickets.filter(t=>t.status==='open').length;
    if(document.getElementById('nb-tickets')) document.getElementById('nb-tickets').textContent = open;
    const el = document.getElementById('tickets-list');
    if (!tickets.length) {
      el.innerHTML = `<div class="empty"><div class="empty-icon">🎫</div><h3>No tickets yet</h3><p>When clients submit your contact form they appear here</p></div>`;
      return;
    }
    const smap = {open:'b-inprog',replied:'b-review',closed:'b-done'};
    const stxt = {open:'🟡 Open',replied:'💬 Replied',closed:'✅ Closed'};
    el.innerHTML = tickets.map(t=>`
      <div class="task-card pm" onclick="openTicket('${escHtml(t.id)}')">
        <div class="tc-top">
          <div class="tc-title">${escHtml(t.name)} <span style="font-weight:400;color:var(--muted);font-size:13px">— ${escHtml(t.email)}</span></div>
          <div class="tc-badges"><span class="badge ${smap[t.status]||'b-new'}">${stxt[t.status]||t.status}</span></div>
        </div>
        <div class="tc-info">
          ${t.service?`<div class="tc-meta">⚙️ ${escHtml(t.service)}</div>`:''}
          ${t.budget?`<div class="tc-meta">💰 ${escHtml(t.budget)}</div>`:''}
          <div class="tc-meta">📅 ${new Date(t.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <div class="detail-box" style="margin-top:10px;font-size:12px;max-height:60px;overflow:hidden">${escHtml(t.message)}</div>
      </div>`).join('');
  } catch(e) { toast(e.message,'err'); }
}

async function openTicket(id) {
  currentTicketId = id;
  document.getElementById('ticket-overlay').style.display = 'flex';
  try {
    const t = await api('GET', '/leads/'+id);
    document.getElementById('tk-title').textContent = `Ticket from ${t.name}`;
    document.getElementById('tk-meta').textContent = new Date(t.created_at).toLocaleString('en-GB');
    document.getElementById('tk-message').textContent = t.message;
    document.getElementById('tk-name').textContent = t.name;
    document.getElementById('tk-email').textContent = t.email;
    document.getElementById('tk-service').textContent = t.service||'—';
    document.getElementById('tk-budget').textContent = t.budget||'—';
    document.getElementById('tk-status-sel').value = t.status||'open';
    // Show replies
    const replies = t.replies||[];
    const el = document.getElementById('tk-replies');
    el.innerHTML = replies.length ? replies.map(r=>`
      <div class="note-item">
        <div class="note-meta">
          <span class="note-author">${escHtml(r.author)}</span>
          <span class="note-time">${r.time}</span>
        </div>
        <div class="note-text">${escHtml(r.content)}</div>
      </div>`).join('') : `<div style="font-family:'DM Mono',monospace;font-size:12px;color:var(--muted2);padding:6px 0">No replies yet.</div>`;
    document.getElementById('tk-reply-txt').value = '';
  } catch(e) { toast(e.message,'err'); }
}

function closeTicketBg(e) { if(e.target===document.getElementById('ticket-overlay')) closeTicket(); }
function closeTicket() {
  document.getElementById('ticket-overlay').style.display = 'none';
  currentTicketId = null;
  renderTickets();
}

async function sendReply() {
  const content = document.getElementById('tk-reply-txt').value.trim();
  if (!content) { toast('Write a reply first','err'); return; }
  const btn = document.getElementById('tk-send-btn');
  const status = document.getElementById('tk-status-sel').value;
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    await api('POST', '/tickets/'+currentTicketId+'/reply', { content, status });
    toast('✅ Reply sent — client notified by email');
    closeTicket();
  } catch(e) { toast(e.message,'err'); }
  finally { btn.disabled=false; btn.innerHTML='Send Reply & Email →'; }
}

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
let toastTimer;
function toast(msg,type='ok') {
  const el=document.getElementById('toast');
  el.className = type==='err'?'err show':'show';
  el.querySelector('.tico').textContent = type==='err'?'⚠️':'✓';
  document.getElementById('toast-msg').textContent=msg;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),3500);
}

// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
function refreshPage() {
  const a = document.querySelector('.page.act');
  if(!a) return;
  const id = a.id.replace('page-','');
  if(id==='dashboard') renderDashboard();
  if(id==='tasks')     renderAllTasks();
  if(id==='workers')   renderWorkers();
  if(id==='my-tasks')  renderMyTasks(false);
  if(id==='my-done')   renderMyTasks(true);
  if(id==='leads')     renderLeads();
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();closeCreate();closeWorker();}
});

// Auto token refresh every 7 hours
setInterval(async ()=>{
  if(refreshToken) await tryRefresh();
}, 7*60*60*1000);

// ══════════════════════════════════════════
// CHAT SYSTEM
// ══════════════════════════════════════════
let chatOpen=false, chatTarget=null, chatPollTimer=null, lastMsgCount=0;

function toggleChat(){
  chatOpen=!chatOpen;
  document.getElementById('chat-window').classList.toggle('open',chatOpen);
  if(chatOpen){initChat();startChatPoll();}
  else stopChatPoll();
}

async function initChat(){
  const tabs=document.getElementById('chat-tabs');
  if(currentUser.role==='owner'){
    try{
      const workers=await api('GET','/users');
      tabs.innerHTML=workers.map(w=>`<button class="chat-tab" onclick="selectChatTarget('${escHtml(w.id)}','${escHtml(w.name)}')">${escHtml(w.name)}</button>`).join('');
      if(!chatTarget&&workers.length)selectChatTarget(workers[0].id,workers[0].name);
      else if(chatTarget)loadMessages();
    }catch{}
  }else{
    tabs.innerHTML=`<button class="chat-tab act">Owner</button>`;
    selectChatTarget('owner','Owner');
  }
}

function selectChatTarget(id,name){
  chatTarget=id;
  document.getElementById('chat-sub').textContent=`Chat with ${name}`;
  document.querySelectorAll('.chat-tab').forEach(t=>{t.classList.remove('act');if(t.textContent===name)t.classList.add('act');});
  loadMessages();
}

async function loadMessages(){
  if(!chatTarget)return;
  try{
    const msgs=await api('GET',`/chat/${chatTarget}`);
    const el=document.getElementById('chat-messages');
    if(!msgs||!msgs.length){el.innerHTML=`<div style="text-align:center;font-family:'DM Mono',monospace;font-size:12px;color:var(--muted2);padding:20px">No messages yet. Say hello! 👋</div>`;return;}
    const wasBottom=el.scrollHeight-el.scrollTop-el.clientHeight<80;
    el.innerHTML=msgs.map(m=>{
      const mine=(currentUser.role==='owner'&&m.sender_role==='owner')||(currentUser.role==='worker'&&m.sender_id===currentUser.id);
      return `<div class="chat-msg ${mine?'mine':'theirs'}">${!mine?`<div class="chat-msg-author">${escHtml(m.sender_name)}</div>`:''}${escHtml(m.content)}<div class="chat-msg-time">${new Date(m.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div></div>`;
    }).join('');
    if(wasBottom||lastMsgCount!==msgs.length)el.scrollTop=el.scrollHeight;
    lastMsgCount=msgs.length;
  }catch{}
}

async function sendChatMsg(){
  const inp=document.getElementById('chat-input');
  const content=inp.value.trim();
  if(!content||!chatTarget)return;
  inp.value='';inp.style.height='36px';
  try{await api('POST',`/chat/${chatTarget}`,{content});loadMessages();}
  catch(e){toast(e.message,'err');}
}

function chatKeydown(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChatMsg();}}
function startChatPoll(){stopChatPoll();chatPollTimer=setInterval(()=>{if(chatTarget)loadMessages();},3000);}
function stopChatPoll(){if(chatPollTimer)clearInterval(chatPollTimer);}

// Poll unread count every 10s
setInterval(async()=>{
  if(!currentUser||chatOpen)return;
  try{const r=await api('GET','/chat/unread');if(!r)return;const b=document.getElementById('chat-badge');b.style.display=r.count>0?'flex':'none';b.textContent=r.count;}catch{}
},10000);

// ══════════════════════════════════════════
// LEADS
// ══════════════════════════════════════════
async function renderLeads() {
  loading('leads-list');
  try {
    const leads = await api('GET', '/leads');
    const el = document.getElementById('leads-list');
    const newLeads = leads.filter(l => l.status === 'new');
    if(document.getElementById('nb-leads')) document.getElementById('nb-leads').textContent = newLeads.length;
    if (!leads.length) {
      el.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><h3>No leads yet</h3><p>When clients fill your contact form they appear here</p></div>`;
      return;
    }
    const statusBadgeL = s => {
      const map = {new:'b-new',contacted:'b-inprog',converted:'b-done',closed:'b-blocked'};
      const txt = {new:'🔥 New',contacted:'📞 Contacted',converted:'✅ Converted',closed:'🚫 Closed'};
      return `<span class="badge ${map[s]||'b-new'}">${txt[s]||s}</span>`;
    };
    el.innerHTML = leads.map(l => `
      <div class="task-card pm">
        <div class="tc-top">
          <div class="tc-title">${escHtml(l.name)}</div>
          <div class="tc-badges">${statusBadgeL(l.status||'new')}</div>
        </div>
        <div class="tc-info">
          <div class="tc-meta">📧 ${escHtml(l.email)}</div>
          ${l.service?`<div class="tc-meta">⚙️ ${escHtml(l.service)}</div>`:''}
          ${l.budget?`<div class="tc-meta">💰 ${escHtml(l.budget)}</div>`:''}
          <div class="tc-meta">📅 ${new Date(l.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <div class="detail-box" style="margin-top:12px;font-size:12px">${escHtml(l.message)}</div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-accent btn-sm" onclick="convertLeadToTask('${escHtml(l.id)}','${escHtml(l.name)}','${escHtml(l.email)}','${escHtml(l.service||'')}','${escHtml(l.budget||'')}')">Convert to Task →</button>
          <button class="btn btn-outline btn-sm" onclick="updateLeadStatus('${escHtml(l.id)}','contacted')">Mark Contacted</button>
          <button class="btn btn-outline btn-sm" onclick="updateLeadStatus('${escHtml(l.id)}','closed')">Close</button>
        </div>
      </div>`).join('');
  } catch(e) { toast(e.message,'err'); }
}

async function updateLeadStatus(id, status) {
  try {
    await api('PATCH', '/leads/'+id, { status });
    renderLeads();
    toast('Lead updated');
  } catch(e) { toast(e.message,'err'); }
}

async function convertLeadToTask(id, name, email, service, budget) {
  try {
    await api('POST', '/tasks', {
      title: `Client: ${name}`,
      client_name: `${name} (${email})`,
      service_type: service || undefined,
      budget: budget || undefined,
      priority: 'high',
      status: 'new'
    });
    await api('PATCH', '/leads/'+id, { status: 'converted' });
    goPage('tasks');
    toast('✅ Lead converted to task!');
  } catch(e) { toast(e.message,'err'); }
}

</script>
</body>
</html>
