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

  const buildJsonLD = () => {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    if (scripts.length === 0) {
      return '<p class="small">No se encontraron datos JSON-LD en esta página.</p>';
    }
    let html = `<p class="small">Se encontraron ${scripts.length} script(s) JSON-LD:</p>`;
    scripts.forEach((script, i) => {
      try {
        const json = JSON.parse(script.textContent);
        const formatted = JSON.stringify(json, null, 2);
        html += `<div style="margin-top:12px"><strong>Script ${i+1}:</strong><pre style="background:#f5f5f5;padding:8px;border-radius:4px;overflow:auto;max-height:300px;font-size:12px">${escapeHtml(formatted)}</pre></div>`;
      } catch(e) {
        html += `<div style="margin-top:12px"><strong>Script ${i+1}:</strong> <span class="bad">Error al parsear JSON</span></div>`;
      }
    });
    return html;
  };

  const buildHreflang = () => {
    const links = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
    if (links.length === 0) {
      return '<p class="small">No se encontraron enlaces hreflang en esta página.</p>';
    }
    let html = `<table class="dse-table"><thead><tr><th>Hreflang</th><th>URL</th></tr></thead><tbody>`;
    links.forEach(link => {
      html += `<tr><td>${escapeHtml(link.getAttribute('hreflang'))}</td><td>${escapeHtml(link.href)}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildHeadings = () => {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    if (headings.length === 0) {
      return '<p class="small">No se encontraron encabezados en esta página.</p>';
    }
    let html = `<table class="dse-table"><thead><tr><th>Tag</th><th>Texto</th></tr></thead><tbody>`;
    headings.forEach(h => {
      html += `<tr><td><strong>${h.tagName}</strong></td><td>${escapeHtml(h.innerText.substring(0, 100))}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildImages = () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    if (imgs.length === 0) {
      return '<p class="small">No se encontraron imágenes en esta página.</p>';
    }
    let html = `<p class="small">Total de imágenes: ${imgs.length}</p>`;
    html += `<table class="dse-table"><thead><tr><th>Src</th><th>Alt</th><th>Estado</th></tr></thead><tbody>`;
    imgs.forEach(img => {
      const alt = img.alt || '';
      const status = alt ? '<span class="ok">OK</span>' : '<span class="bad">Sin ALT</span>';
      html += `<tr><td>${escapeHtml(img.src.substring(0, 50))}...</td><td>${escapeHtml(alt.substring(0, 50))}</td><td>${status}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildLinks = () => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    if (links.length === 0) {
      return '<p class="small">No se encontraron enlaces en esta página.</p>';
    }
    const internal = links.filter(a => a.hostname === location.hostname).length;
    const external = links.length - internal;
    let html = `<div class="kv"><div class="k">Total de enlaces</div><div class="v">${links.length}</div></div>`;
    html += `<div class="kv"><div class="k">Enlaces internos</div><div class="v">${internal}</div></div>`;
    html += `<div class="kv"><div class="k">Enlaces externos</div><div class="v">${external}</div></div>`;
    html += `<table class="dse-table" style="margin-top:12px"><thead><tr><th>Texto</th><th>URL</th><th>Tipo</th></tr></thead><tbody>`;
    links.slice(0, 50).forEach(a => {
      const type = a.hostname === location.hostname ? 'Interno' : 'Externo';
      html += `<tr><td>${escapeHtml(a.innerText.substring(0, 40))}</td><td>${escapeHtml(a.href.substring(0, 60))}...</td><td>${type}</td></tr>`;
    });
    if (links.length > 50) {
      html += `<tr><td colspan="3" class="small">Mostrando 50 de ${links.length} enlaces</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
  };

  
  document.getElementById('overviewContent').innerHTML = buildOverview();
  document.getElementById('jsonldContent').innerHTML = buildJsonLD();
  document.getElementById('hreflangContent').innerHTML = buildHreflang();
  document.getElementById('headingsContent').innerHTML = buildHeadings();
  document.getElementById('imagesContent').innerHTML = buildImages();
  document.getElementById('linksContent').innerHTML = buildLinks();
})();
