(async function() {
  if (document.getElementById('dseButton')) return; 

  
  const style = document.createElement('style');
  style.textContent = `
    #dseButton {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 999999999 !important;
      width: 48px; height: 48px;
      border: none; border-radius: 50%;
      background: #1a73e8;
      color: #fff;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      box-shadow: 0 6px 18px rgba(0,0,0,.25);
      transition: box-shadow .2s, transform .2s;
    }
    #dseButton:hover {
      box-shadow: 0 10px 26px rgba(0,0,0,.35);
      transform: scale(1.05);
    }
    #dseButton:active { cursor: grabbing; }

    #dsePanel {
      position: fixed;
      top: 80px; right: 80px;
      width: 820px;
      max-height: 78vh;
      overflow: auto;
      background: #fff;
      border-radius: 12px;
      padding: 0;
      box-shadow: 0 14px 40px rgba(0,0,0,.32);
      font-family: Inter, Arial, sans-serif;
      font-size: 13px;
      color: #222;
      display: none;
      z-index: 999999999 !important;
    }

    .dse-tabs { display:flex; border-bottom:1px solid #e6e6e6; background:#fafafa; border-radius:12px 12px 0 0 }
    .dse-tab { flex:1; padding:10px; text-align:center; cursor:pointer; font-weight:600; border-right:1px solid #eee }
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
  `;
  document.head.appendChild(style);

  
  const btn = document.createElement('button');
  btn.id = 'dseButton';
  btn.title = 'Abrir SEO Panel';
  btn.innerHTML = '🔍';
  document.body.appendChild(btn);

  
  const panel = document.createElement('div');
  panel.id = 'dsePanel';
  panel.innerHTML = `
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


  btn.onclick = () => {
    panel.style.display = panel.style.display === 'none' || !panel.style.display ? 'block' : 'none';
  };

  
  panel.querySelectorAll('.dse-tab').forEach(tab=>{
    tab.onclick=()=>{
      panel.querySelectorAll('.dse-tab').forEach(t=>t.classList.remove('active'));
      panel.querySelectorAll('.dse-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    };
  });

 
  let offsetX, offsetY, dragging = false;
  btn.addEventListener('mousedown', e => {
    dragging = true;
    offsetX = e.clientX - btn.getBoundingClientRect().left;
    offsetY = e.clientY - btn.getBoundingClientRect().top;
    btn.style.transition = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    btn.style.left = `${e.clientX - offsetX}px`;
    btn.style.top = `${e.clientY - offsetY}px`;
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';
    btn.style.position = 'fixed';
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    btn.style.transition = '';
  });

  
  const escapeHtml = t => (t||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  const buildOverview = () => {
    const getMeta = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content || '';
    const overview = {
      title: document.title,
      description: getMeta('description'),
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      lang: document.documentElement.lang,
      words: (document.body.innerText||'').trim().split(/\s+/).filter(Boolean).length
    };
    return `
      <div class="kv"><div class="k">Title</div><div class="v">${escapeHtml(overview.title)}</div></div>
      <div class="kv"><div class="k">Description</div><div class="v">${escapeHtml(overview.description)}</div></div>
      <div class="kv"><div class="k">Canonical</div><div class="v">${escapeHtml(overview.canonical)}</div></div>
      <div class="kv"><div class="k">Lang</div><div class="v">${escapeHtml(overview.lang)}</div></div>
      <div class="kv"><div class="k">Word count</div><div class="v">${overview.words}</div></div>
    `;
  };

  document.getElementById('overviewContent').innerHTML = buildOverview();
})();
