(async function() {
  
  if (document.getElementById('dseButton')) return;

  
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  
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

    .dse-tabs { display:flex; border-bottom:1px solid #e6e6e6; background:#fafafa; border-radius:12px 12px 0 0; position:sticky; top:0; z-index:10; }
    .dse-tab { flex:1; padding:12px 10px; text-align:center; cursor:pointer; font-weight:600; border-right:1px solid #eee; transition:all .2s; }
    .dse-tab:last-child{border-right:none}
    .dse-tab:hover{background:#f0f0f0}
    .dse-tab.active{background:#fff;border-bottom:3px solid #1a73e8;color:#1a73e8}
    .dse-content{padding:16px 20px;display:none;animation:fadeIn .3s}
    .dse-content.active{display:block}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .dse-table{width:100%;border-collapse:collapse;font-size:13px;margin-top:12px}
    .dse-table th,.dse-table td{border:1px solid #e6e6e6;padding:8px 10px;text-align:left}
    .dse-table th{background:#f6f8fb;font-weight:700;position:sticky;top:0}
    .dse-table tr:hover{background:#fafafa}
    .kv{display:flex;gap:12px;align-items:flex-start;margin:8px 0;padding:8px;border-radius:4px;background:#f9f9f9}
    .kv .k{min-width:160px;font-weight:700;color:#333}
    .kv .v{flex:1;color:#111;word-break:break-word}
    .small{font-size:12px;color:#666;margin:8px 0}
    .bad{color:#c62828;font-weight:700}
    .ok{color:#1b5e20;font-weight:700}
    .warn{color:#f57c00;font-weight:700}
    .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;margin-left:8px}
    .badge-success{background:#e8f5e9;color:#2e7d32}
    .badge-danger{background:#ffebee;color:#c62828}
    .badge-warning{background:#fff3e0;color:#e65100}
    h3{margin:0 0 16px 0;font-size:18px;color:#1a73e8;border-bottom:2px solid #e6e6e6;padding-bottom:8px}
    #dseCloseBtn{position:absolute;top:12px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#666;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .2s}
    #dseCloseBtn:hover{background:#f5f5f5;color:#333}
  `;
  document.head.appendChild(style);

  
  const btn = document.createElement('button');
  btn.id = 'dseButton';
  btn.title = 'Abrir SEO Analyzer';
  btn.innerHTML = '🔍';
  document.body.appendChild(btn);

  
  const panel = document.createElement('div');
  panel.id = 'dsePanel';
  panel.innerHTML = `
    <button id="dseCloseBtn" title="Cerrar">×</button>
    <div class="dse-tabs">
      <div class="dse-tab active" data-tab="overviewTab">📊 Overview</div>
      <div class="dse-tab" data-tab="jsonldTab">📋 JSON-LD</div>
      <div class="dse-tab" data-tab="hreflangTab">🌍 Hreflang</div>
      <div class="dse-tab" data-tab="headingsTab">📑 Headings</div>
      <div class="dse-tab" data-tab="imagesTab">🖼️ Images</div>
      <div class="dse-tab" data-tab="linksTab">🔗 Links</div>
    </div>
    <div class="dse-content active" id="overviewTab"><h3>Overview</h3><div id="overviewContent"></div></div>
    <div class="dse-content" id="jsonldTab"><h3>Schema.org JSON-LD</h3><div id="jsonldContent"></div></div>
    <div class="dse-content" id="hreflangTab"><h3>Hreflang Tags</h3><div id="hreflangContent"></div></div>
    <div class="dse-content" id="headingsTab"><h3>Heading Structure</h3><div id="headingsContent"></div></div>
    <div class="dse-content" id="imagesTab"><h3>Image Analysis</h3><div id="imagesContent"></div></div>
    <div class="dse-content" id="linksTab"><h3>Link Analysis</h3><div id="linksContent"></div></div>
  `;
  document.body.appendChild(panel);

  
  const togglePanel = () => {
    const isHidden = panel.style.display === 'none' || !panel.style.display;
    panel.style.display = isHidden ? 'block' : 'none';
    if (isHidden) analyzeAll();
  };

  btn.onclick = togglePanel;
  panel.querySelector('#dseCloseBtn').onclick = () => panel.style.display = 'none';

  
  panel.querySelectorAll('.dse-tab').forEach(tab => {
    tab.onclick = () => {
      panel.querySelectorAll('.dse-tab').forEach(t => t.classList.remove('active'));
      panel.querySelectorAll('.dse-content').forEach(c => c.classList.remove('active'));
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
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    btn.style.transition = '';
  });

  
  const escapeHtml = t => (t || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  const buildOverview = () => {
    const getMeta = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content || '';
    const title = document.title || '';
    const desc = getMeta('description');
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const lang = document.documentElement.lang || 'No especificado';
    const words = (document.body?.innerText || '').trim().split(/\s+/).filter(Boolean).length;
    
    const titleStatus = title.length >= 30 && title.length <= 60 ? 
      `<span class="ok">✓ Óptimo</span>` : 
      `<span class="warn">⚠ ${title.length < 30 ? 'Muy corto' : 'Muy largo'}</span>`;
    
    const descStatus = desc.length >= 120 && desc.length <= 160 ? 
      `<span class="ok">✓ Óptimo</span>` : 
      desc.length === 0 ? `<span class="bad">✗ Falta</span>` :
      `<span class="warn">⚠ ${desc.length < 120 ? 'Muy corto' : 'Muy largo'}</span>`;

    return `
      <div class="kv">
        <div class="k">Title (${title.length} chars)</div>
        <div class="v">${escapeHtml(title)} ${titleStatus}</div>
      </div>
      <div class="kv">
        <div class="k">Description (${desc.length} chars)</div>
        <div class="v">${escapeHtml(desc) || '<span class="bad">No definida</span>'} ${descStatus}</div>
      </div>
      <div class="kv">
        <div class="k">Canonical URL</div>
        <div class="v">${canonical ? escapeHtml(canonical) : '<span class="warn">No definida</span>'}</div>
      </div>
      <div class="kv">
        <div class="k">Language</div>
        <div class="v">${escapeHtml(lang)}</div>
      </div>
      <div class="kv">
        <div class="k">Word Count</div>
        <div class="v">${words.toLocaleString()} palabras</div>
      </div>
      <div class="kv">
        <div class="k">Robots</div>
        <div class="v">${escapeHtml(getMeta('robots') || 'Default (index, follow)')}</div>
      </div>
    `;
  };

  const buildJsonLD = () => {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    if (scripts.length === 0) {
      return '<p class="small">❌ No se encontraron datos estructurados JSON-LD en esta página.</p><p class="small">💡 <strong>Recomendación:</strong> Agrega datos estructurados para mejorar tu SEO.</p>';
    }
    let html = `<p class="small">✅ Se encontraron <strong>${scripts.length}</strong> script(s) JSON-LD:</p>`;
    scripts.forEach((script, i) => {
      try {
        const json = JSON.parse(script.textContent);
        const formatted = JSON.stringify(json, null, 2);
        const type = json['@type'] || 'Unknown';
        html += `<div style="margin-top:16px"><strong>Script ${i + 1}</strong> <span class="badge badge-success">${type}</span><pre style="background:#f5f5f5;padding:12px;border-radius:6px;overflow:auto;max-height:400px;font-size:11px;border:1px solid #e0e0e0">${escapeHtml(formatted)}</pre></div>`;
      } catch(e) {
        html += `<div style="margin-top:16px"><strong>Script ${i + 1}:</strong> <span class="badge badge-danger">Error al parsear JSON</span></div>`;
      }
    });
    return html;
  };

  const buildHreflang = () => {
    const links = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
    if (links.length === 0) {
      return '<p class="small">❌ No se encontraron etiquetas hreflang.</p><p class="small">💡 Si tu sitio es multiidioma, considera agregar hreflang tags.</p>';
    }
    let html = `<p class="small">✅ Se encontraron <strong>${links.length}</strong> enlaces hreflang:</p>`;
    html += `<table class="dse-table"><thead><tr><th>Hreflang</th><th>URL</th></tr></thead><tbody>`;
    links.forEach(link => {
      html += `<tr><td><strong>${escapeHtml(link.getAttribute('hreflang'))}</strong></td><td>${escapeHtml(link.href)}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildHeadings = () => {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    if (headings.length === 0) {
      return '<p class="small">❌ No se encontraron encabezados en esta página.</p>';
    }
    
    const h1Count = headings.filter(h => h.tagName === 'H1').length;
    const warning = h1Count !== 1 ? `<span class="badge badge-warning">⚠ ${h1Count === 0 ? 'Sin H1' : 'Múltiples H1'}</span>` : `<span class="badge badge-success">✓ 1 H1</span>`;
    
    let html = `<p class="small">Total de headings: <strong>${headings.length}</strong> ${warning}</p>`;
    html += `<table class="dse-table"><thead><tr><th style="width:80px">Tag</th><th>Texto</th></tr></thead><tbody>`;
    headings.forEach(h => {
      const indent = '&nbsp;'.repeat((parseInt(h.tagName[1]) - 1) * 4);
      html += `<tr><td><strong>${h.tagName}</strong></td><td>${indent}${escapeHtml(h.innerText.substring(0, 120))}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildImages = () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    if (imgs.length === 0) {
      return '<p class="small">❌ No se encontraron imágenes en esta página.</p>';
    }
    
    const withoutAlt = imgs.filter(img => !img.alt).length;
    const status = withoutAlt === 0 ? 
      `<span class="badge badge-success">✓ Todas tienen ALT</span>` : 
      `<span class="badge badge-danger">✗ ${withoutAlt} sin ALT</span>`;
    
    let html = `<p class="small">Total de imágenes: <strong>${imgs.length}</strong> ${status}</p>`;
    html += `<table class="dse-table"><thead><tr><th>Src</th><th>Alt</th><th>Estado</th></tr></thead><tbody>`;
    imgs.forEach(img => {
      const alt = img.alt || '';
      const statusCell = alt ? '<span class="ok">✓</span>' : '<span class="bad">✗ Sin ALT</span>';
      const srcShort = img.src.length > 60 ? img.src.substring(0, 60) + '...' : img.src;
      html += `<tr><td style="font-size:11px">${escapeHtml(srcShort)}</td><td>${escapeHtml(alt.substring(0, 80))}</td><td>${statusCell}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildLinks = () => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    if (links.length === 0) {
      return '<p class="small">❌ No se encontraron enlaces en esta página.</p>';
    }
    
    const internal = links.filter(a => a.hostname === location.hostname).length;
    const external = links.length - internal;
    const nofollow = links.filter(a => a.rel.includes('nofollow')).length;
    
    let html = `
      <div class="kv"><div class="k">Total de enlaces</div><div class="v">${links.length}</div></div>
      <div class="kv"><div class="k">Enlaces internos</div><div class="v">${internal} <span class="badge badge-success">${((internal/links.length)*100).toFixed(1)}%</span></div></div>
      <div class="kv"><div class="k">Enlaces externos</div><div class="v">${external} <span class="badge badge-success">${((external/links.length)*100).toFixed(1)}%</span></div></div>
      <div class="kv"><div class="k">Nofollow</div><div class="v">${nofollow}</div></div>
    `;
    
    html += `<table class="dse-table" style="margin-top:16px"><thead><tr><th>Texto</th><th>URL</th><th>Tipo</th></tr></thead><tbody>`;
    links.slice(0, 100).forEach(a => {
      const type = a.hostname === location.hostname ? 
        '<span class="badge badge-success">Interno</span>' : 
        '<span class="badge badge-warning">Externo</span>';
      const text = a.innerText.substring(0, 50) || '<em>Sin texto</em>';
      const urlShort = a.href.length > 70 ? a.href.substring(0, 70) + '...' : a.href;
      html += `<tr><td>${escapeHtml(text)}</td><td style="font-size:11px">${escapeHtml(urlShort)}</td><td>${type}</td></tr>`;
    });
    if (links.length > 100) {
      html += `<tr><td colspan="3" class="small" style="text-align:center;background:#f9f9f9">Mostrando 100 de ${links.length} enlaces totales</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
  };

  
  const analyzeAll = () => {
    try {
      document.getElementById('overviewContent').innerHTML = buildOverview();
      document.getElementById('jsonldContent').innerHTML = buildJsonLD();
      document.getElementById('hreflangContent').innerHTML = buildHreflang();
      document.getElementById('headingsContent').innerHTML = buildHeadings();
      document.getElementById('imagesContent').innerHTML = buildImages();
      document.getElementById('linksContent').innerHTML = buildLinks();
    } catch(error) {
      console.error('Error al analizar:', error);
    }
  };

  
  analyzeAll();

  console.log('✅ SEO Analyzer cargado correctamente');
})();
