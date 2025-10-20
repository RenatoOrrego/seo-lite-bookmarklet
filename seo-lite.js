(async function(){
if(document.getElementById('dseButton'))return;
const style=document.createElement('style');
style.textContent=`
#dseButton{position:fixed;top:10px;right:0;z-index:999999999!important;width:40px;height:40px;background:#1a73e8;border:none;border-radius:6px 0 0 6px;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.22);font-weight:bold}
#dsePanel{position:fixed;top:10px;right:56px;width:820px;max-height:78vh;overflow:auto;background:#fff;border-radius:12px;padding:0;box-shadow:0 14px 40px rgba(0,0,0,.32);font-family:Inter,Arial,sans-serif;font-size:13px;color:#222;display:none;z-index:999999999!important}
.dse-tabs{display:flex;border-bottom:1px solid #e6e6e6;background:#fafafa;border-radius:12px 12px 0 0}
.dse-tab{flex:1;padding:10px;text-align:center;cursor:pointer;font-weight:600;border-right:1px solid #eee}
.dse-tab:last-child{border-right:none}
.dse-tab.active{background:#fff;border-bottom:3px solid #1a73e8}
.dse-content{padding:12px 16px;display:none}
.dse-content.active{display:block}
.dse-table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
.dse-table th,.dse-table td{border:1px solid #eee;padding:6px 8px;text-align:left}
.dse-table th{background:#f6f8fb;font-weight:700}
.kv{display:flex;gap:8px;align-items:flex-start;margin:6px 0}
.kv .k{width:180px;font-weight:700;color:#333}
.kv .v{flex:1;color:#111}
.small{font-size:12px;color:#666}
.bad{color:#c62828;font-weight:700}
.ok{color:#1b5e20;font-weight:700}
.warn{color:#856404;font-weight:700}
.json-key{color:#d73a49;font-weight:600}
.json-string{color:#032f62}
.json-bracket{color:#444;font-weight:700}
.json-indent{margin-left:12px;margin-bottom:2px}
`;
document.head.appendChild(style);
const btn=document.createElement('button');
btn.id='dseButton';
btn.title='Detailed SEO (bookmark)';
btn.textContent='SEO';
document.body.appendChild(btn);
const panel=document.createElement('div');
panel.id='dsePanel';
panel.innerHTML=`
<div class="dse-tabs">
  <div class="dse-tab active" data-tab="overviewTab">Overview</div>
  <div class="dse-tab" data-tab="jsonldTab">JSON-LD</div>
  <div class="dse-tab" data-tab="hreflangTab">Hreflang</div>
  <div class="dse-tab" data-tab="headingsTab">Headings</div>
  <div class="dse-tab" data-tab="imagesTab">Images</div>
  <div class="dse-tab" data-tab="linksTab">Links</div>
</div>
<div class="dse-content active" id="overviewTab"><h3>Overview</h3><div id="overviewContent">Cargando...</div></div>
<div class="dse-content" id="jsonldTab"><h3>Schema.org JSON-LD</h3><div id="jsonldContent">Cargando...</div></div>
<div class="dse-content" id="hreflangTab"><h3>Hreflang</h3><div id="hreflangContent">Cargando...</div></div>
<div class="dse-content" id="headingsTab"><h3>Headings</h3><div id="headingsContent">Cargando...</div></div>
<div class="dse-content" id="imagesTab"><h3>Images</h3><div id="imagesContent">Cargando...</div></div>
<div class="dse-content" id="linksTab"><h3>Links</h3><div id="linksContent">Cargando...</div></div>
`;
document.body.appendChild(panel);
btn.onclick=()=>{panel.style.display=panel.style.display==='none'?'block':'none'};
panel.querySelectorAll('.dse-tab').forEach(tab=>{
  tab.onclick=()=>{
    panel.querySelectorAll('.dse-tab').forEach(t=>t.classList.remove('active'));
    panel.querySelectorAll('.dse-content').forEach(c=>c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  };
});
function escapeHtml(t){return (t||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function isSpecialKey(k){return['@context','@type','@graph','@id','@value'].includes(k)}
function renderJSON(v, indent=0){
  const indentPx=indent*12;
  if(v===null) return '<span class="json-key">null</span>';
  if(typeof v==='boolean') return '<span class="json-key">'+v+'</span>';
  if(typeof v==='number') return '<span class="json-key">'+v+'</span>';
  if(typeof v==='string') return '<span class="json-string">"'+escapeHtml(v)+'"</span>';
  if(Array.isArray(v)){
    if(v.length===0) return '<span class="json-bracket">[ ]</span>';
    let items=v.map(x=>'<div class="json-indent" style="margin-left:'+(indentPx+12)+'px">'+renderJSON(x,indent+1)+'</div>').join('');
    return '<span class="json-bracket">[</span>'+items+'<span class="json-bracket" style="margin-left:'+indentPx+'px">]</span>';
  }
  if(typeof v==='object'){
    const keys=Object.keys(v);
    if(keys.length===0) return '<span class="json-bracket">{ }</span>';
    let items=keys.map(k=>{const cls=isSpecialKey(k)?'json-key':'json-key';return '<div class="json-indent" style="margin-left:'+(indentPx+12)+'px"><span class="'+cls+'">"'+escapeHtml(k)+'"</span>: '+renderJSON(v[k],indent+1)+'</div>'}).join('');
    return '<span class="json-bracket">{</span>'+items+'<span class="json-bracket" style="margin-left:'+indentPx+'px">}</span>';
  }
  return '';
}
function getMeta(name){const m=document.querySelector('meta[name="'+name+'"], meta[property="'+name+'"]'); return m?m.getAttribute('content')||'':''}
function getAllMetaBySelector(sel){return Array.from(document.querySelectorAll(sel)).map(m=>({name:m.getAttribute('name')||m.getAttribute('property')||m.getAttribute('http-equiv')||'', content:m.getAttribute('content')||''}))}
function getCanonical(){const c=document.querySelector('link[rel="canonical"]'); return c?c.href:''}
function getCharset(){const ch=document.querySelector('meta[charset]'); if(ch)return ch.getAttribute('charset'); const m=document.querySelector('meta[http-equiv="Content-Type"]'); if(m){const s=m.getAttribute('content'); const match=s&&s.match(/charset=([^;]+)/i); return match?match[1]:''} return ''}
function getLang(){return document.documentElement.lang||document.querySelector('meta[name="language"]')?.getAttribute('content')||''}
function getViewport(){const v=document.querySelector('meta[name="viewport"]'); return v?v.getAttribute('content'):''}
function wordsCount(){const t=document.body.innerText||''; return t.trim().split(/\s+/).filter(Boolean).length}
function charsCount(){return (document.body.innerText||'').length}
function collectHeadings(){const hs=[];for(let i=1;i<=6;i++){Array.from(document.getElementsByTagName('h'+i)).forEach(h=>hs.push({tag:'H'+i, text:h.innerText.trim(), id:h.id||''}))}return hs}
function collectImages(){return Array.from(document.images).map(img=>({src:img.currentSrc||img.src, alt:img.alt||'', width:img.naturalWidth, height:img.naturalHeight}))}
function collectLinks(){return Array.from(document.querySelectorAll('a[href]')).map(a=>({href:a.href, text:a.innerText.trim(), rel:a.rel||'', target:a.target||''}))}
function getSchemaJsonLd(){const scripts=Array.from(document.querySelectorAll('script[type="application/ld+json"]')); if(scripts.length===0) return null; return scripts.map(s=>{try{return JSON.parse(s.textContent)}catch(e){return {error:'Error: '+e.message, raw:s.textContent.slice(0,200)+'...'}})}
}
async function checkStatus(url){
  try{
    const res = await fetch(url, { method:'HEAD', mode:'no-cors' });
    if(res.status===0) return '⚠️ CORS';
    return res.status===200 ? '200' : '❌ '+res.status;
  }catch(e){ return 'Error' }
}
async function checkBackRef(url,current){
  try{
    const res = await fetch(url);
    if(!res.ok) return '❌ No';
    const html = await res.text();
    return html.indexOf(`href="${current}"`)!==-1 || html.indexOf(`href='${current}'`)!==-1 ? '✅ Sí' : '❌ No';
  }catch(e){ return '⚠️ CORS' }
}
async function buildOverview(){
  const title=document.title||'';
  const metaDesc=getMeta('description')||getMeta('og:description')||'';
  const canonical=getCanonical();
  const robots=getMeta('robots')||'';
  const ogTitle=getMeta('og:title')||'';
  const ogType=getMeta('og:type')||'';
  const ogImage=getMeta('og:image')||'';
  const twitter=getMeta('twitter:card')||'';
  const charset=getCharset();
  const lang=getLang();
  const viewport=getViewport();
  const wc=wordsCount();
  const cc=charsCount();
  let html='';
  html+=`<div class="kv"><div class="k">Title</div><div class="v">${escapeHtml(title)}</div></div>`;
  html+=`<div class="kv"><div class="k">Meta description</div><div class="v">${escapeHtml(metaDesc)}</div></div>`;
  html+=`<div class="kv"><div class="k">Canonical</div><div class="v">${escapeHtml(canonical)}</div></div>`;
  html+=`<div class="kv"><div class="k">Meta robots</div><div class="v">${escapeHtml(robots)}</div></div>`;
  html+=`<div class="kv"><div class="k">Open Graph</div><div class="v"><strong>og:title:</strong> ${escapeHtml(ogTitle)}<br><strong>og:type:</strong> ${escapeHtml(ogType)}<br><strong>og:image:</strong> ${escapeHtml(ogImage)}</div></div>`;
  html+=`<div class="kv"><div class="k">Twitter</div><div class="v">${escapeHtml(twitter)}</div></div>`;
  html+=`<div class="kv"><div class="k">Charset</div><div class="v">${escapeHtml(charset)}</div></div>`;
  html+=`<div class="kv"><div class="k">Lang</div><div class="v">${escapeHtml(lang)}</div></div>`;
  html+=`<div class="kv"><div class="k">Viewport</div><div class="v">${escapeHtml(viewport)}</div></div>`;
  html+=`<div class="kv"><div class="k">Words / Characters</div><div class="v">${wc} palabras · ${cc} caracteres</div></div>`;
  return html;
}
async function buildJSONLD(){
  const data=getSchemaJsonLd();
  if(!data) return '<p>No se encontraron scripts JSON-LD.</p>';
  return data.map(d=>renderJSON(d)).join('<hr style="margin:8px 0">');
}
async function buildHreflang(){
  const links=Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
  if(links.length===0) return '<p>No se encontraron etiquetas hreflang.</p>';
  let html='<table class="dse-table"><thead><tr><th>hreflang</th><th>URL</th><th>Status</th><th>Back Ref</th></tr></thead><tbody>';
  for(const link of links){
    const lang=link.getAttribute('hreflang');
    const href=link.getAttribute('href');
    const status=await checkStatus(href);
    const backRef=await checkBackRef(href, location.href);
    const statusClass = status==='200' ? 'ok' : status.includes('CORS') ? 'warn' : 'bad';
    const backClass = backRef.includes('Sí') ? 'ok' : 'bad';
    html+=`<tr><td>${escapeHtml(lang)}</td><td><a href="${href}" target="_blank">${escapeHtml(href)}</a></td><td class="${statusClass}">${escapeHtml(status)}</td><td class="${backClass}">${escapeHtml(backRef)}</td></tr>`;
  }
  html+='</tbody></table>';
  return html;
}
async function buildHeadings(){
  const hs=collectHeadings();
  if(hs.length===0) return '<p>No se encontraron headings.</p>';
  let html='<table class="dse-table"><thead><tr><th>Tag</th><th>Texto</th><th>ID</th></tr></thead><tbody>';
  hs.forEach(h=>{html+=`<tr><td>${h.tag}</td><td>${escapeHtml(h.text)}</td><td>${escapeHtml(h.id)}</td></tr>`});
  html+='</tbody></table>';
  return html;
}
async function buildImages(){
  const imgs=collectImages();
  if(imgs.length===0) return '<p>No hay imágenes.</p>';
  let missingAlt=imgs.filter(i=>!i.alt).length;
  let html=`<div class="small">Imágenes totales: ${imgs.length} · Sin alt: <span class="${missingAlt?\'bad\':\'ok\'}">${missingAlt}</span></div>`;
  html+='<table class="dse-table"><thead><tr><th>Src</th><th>Alt</th><th>Size</th></tr></thead><tbody>';
  imgs.forEach(i=>{html+=`<tr><td><a href="${i.src}" target="_blank">${escapeHtml(i.src)}</a></td><td>${escapeHtml(i.alt)}</td><td>${i.width}×${i.height}</td></tr>`});
  html+='</tbody></table>';
  return html;
}
async function buildLinks(){
  const links=collectLinks();
  if(links.length===0) return '<p>No hay enlaces.</p>';
  const total=links.length;
  const external=links.filter(l=>{try{const u=new URL(l.href); return u.hostname!==location.hostname}catch(e){return false}}).length;
  let html=`<div class="small">Enlaces totales: ${total} · Externos: ${external}</div>`;
  html+='<table class="dse-table"><thead><tr><th>Href</th><th>Texto</th><th>Rel</th><th>Target</th></tr></thead><tbody>';
  links.slice(0,300).forEach(l=>{html+=`<tr><td><a href="${l.href}" target="_blank">${escapeHtml(l.href)}</a></td><td>${escapeHtml(l.text)}</td><td>${escapeHtml(l.rel)}</td><td>${escapeHtml(l.target)}</td></tr>`});
  if(links.length>300) html+=`<tr><td colspan="4" class="small">Se muestran primeros 300 enlaces...</td></tr>`;
  html+='</tbody></table>';
  return html;
}
document.getElementById('overviewContent').innerHTML='Cargando...';
document.getElementById('jsonldContent').innerHTML='Cargando...';
document.getElementById('hreflangContent').innerHTML='Cargando...';
document.getElementById('headingsContent').innerHTML='Cargando...';
document.getElementById('imagesContent').innerHTML='Cargando...';
document.getElementById('linksContent').innerHTML='Cargando...';
document.getElementById('overviewContent').innerHTML=await buildOverview();
document.getElementById('jsonldContent').innerHTML=await buildJSONLD();
document.getElementById('hreflangContent').innerHTML=await buildHreflang();
document.getElementById('headingsContent').innerHTML=await buildHeadings();
document.getElementById('imagesContent').innerHTML=await buildImages();
document.getElementById('linksContent').innerHTML=await buildLinks();
})();
