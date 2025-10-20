
(async function() {
  if (document.getElementById('dseButton')) return;
  console.log('[SEO Panel] Iniciando...');

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes buttonPulse {
      0%, 100% { box-shadow: 0 6px 18px rgba(0,0,0,.25); }
      50% { box-shadow: 0 6px 18px rgba(26,115,232,.4); }
    }

    .dse-content {
      padding: 12px 16px;
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .dse-content.active {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }
    .dse-content h3 {
      position: sticky;
      top: 0;
      background: #fff;
      padding: 8px 0;
      z-index: 1;
      border-bottom: 1px solid #eee;
    }

    #dsePanel {
      position: fixed;
      top: 80px; right: 80px;
      width: 820px;
      height: 600px;
      min-width: 400px;
      min-height: 300px;
      background: #fff;
      border-radius: 12px;
      padding: 0;
      box-shadow: 0 14px 40px rgba(0,0,0,.32);
      font-family: Inter, Arial, sans-serif;
      font-size: 13px;
      color: #222;
      display: none;
      z-index: 999999999 !important;
      resize: both;
      overflow: auto;
      border: 1px solid #ccc;
      animation: slideIn 0.4s ease-out;
      transition: box-shadow .3s ease;
    }

    #dseButton {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 999999999 !important;
      width: 48px; height: 48px;
      border: none; border-radius: 50%;
      background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
      color: #fff;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      box-shadow: 0 6px 18px rgba(0,0,0,.25);
      transition: box-shadow .3s ease, transform .3s ease;
      animation: slideIn 0.4s ease-out;
    }
    #dseButton:hover {
      box-shadow: 0 10px 26px rgba(0,0,0,.35);
      transform: scale(1.1) rotate(5deg);
    }
    #dseButton:active {
      cursor: grabbing;
      transform: scale(0.95);
    }
    #dseButton.active {
      animation: buttonPulse 2s infinite;
    }
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
    console.log('[SEO Panel] Panel toggled');
  };

  panel.querySelectorAll('.dse-tab').forEach(tab => {
    tab.onclick = () => {
      panel.querySelectorAll('.dse-tab').forEach(t => t.classList.remove('active'));
      panel.querySelectorAll('.dse-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
      console.log('[SEO Panel] Tab changed:', tab.dataset.tab);
    };
  });

  // Dragging logic
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

  const buildOverview = () => {
    const getMeta = n => {
      const meta = document.querySelector(`meta[name="${n}"],meta[property="${n}"]`);
      return meta ? meta.getAttribute('content') : '';
    };
    
    const title = document.title || 'Sin título';
    const description = getMeta('description');
    const canonical = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = canonical ? canonical.getAttribute('href') : '';
    const lang = document.documentElement.getAttribute('lang') || 'No especificado';
    const bodyText = document.body ? document.body.innerText : '';
    const words = bodyText.trim().split(/\s+/).filter(Boolean).length;
    
    return `
      <div class="kv"><div class="k">Title</div><div class="v">${escapeHtml(title)} <span class="small">(${title.length} caracteres)</span></div></div>
      <div class="kv"><div class="k">Description</div><div class="v">${description ? escapeHtml(description) + ` <span class="small">(${description.length} caracteres)</span>` : '<span class="warn">No definida</span>'}</div></div>
      <div class="kv"><div class="k">Canonical</div><div class="v">${canonicalUrl ? escapeHtml(canonicalUrl) : '<span class="warn">No definida</span>'}</div></div>
      <div class="kv"><div class="k">Lang</div><div class="v">${escapeHtml(lang)}</div></div>
      <div class="kv"><div class="k">Word count</div><div class="v">${words}</div></div>
    `;
  };

  const buildJsonLD = () => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    console.log(`[SEO Panel] JSON-LD scripts encontrados: ${scripts.length}`);
    
    if (scripts.length === 0) {
      return '<p class="small">No se encontraron datos JSON-LD en esta página.</p>';
    }
    
    let html = `<p class="small">Se encontraron ${scripts.length} script(s) JSON-LD:</p>`;
    scripts.forEach((script, i) => {
      try {
        const json = JSON.parse(script.textContent);
        const formatted = JSON.stringify(json, null, 2);
        html += `<div style="margin-top:12px"><strong>Script ${i+1} - @type: ${json['@type'] || 'N/A'}:</strong><pre style="background:#f5f5f5;padding:8px;border-radius:4px;overflow:auto;max-height:300px;font-size:11px;line-height:1.4">${escapeHtml(formatted)}</pre></div>`;
      } catch(e) {
        html += `<div style="margin-top:12px"><strong>Script ${i+1}:</strong> <span class="bad">Error al parsear JSON: ${escapeHtml(e.message)}</span></div>`;
      }
    });
    return html;
  };

  const buildHreflang = () => {
    const links = document.querySelectorAll('link[rel="alternate"][hreflang]');
    console.log(`[SEO Panel] Hreflang links encontrados: ${links.length}`);
    
    if (links.length === 0) {
      return '<p class="small">No se encontraron enlaces hreflang en esta página.</p>';
    }
    
    let html = `<p class="small">Total: ${links.length} enlaces hreflang</p>`;
    html += `<table class="dse-table"><thead><tr><th>Hreflang</th><th>URL</th></tr></thead><tbody>`;
    links.forEach(link => {
      const hreflang = link.getAttribute('hreflang');
      const href = link.getAttribute('href');
      html += `<tr><td><strong>${escapeHtml(hreflang)}</strong></td><td>${escapeHtml(href)}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildHeadings = () => {
    const headings = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    console.log(`[SEO Panel] Headings encontrados: ${headings.length}`);
    
    if (headings.length === 0) {
      return '<p class="small">No se encontraron encabezados en esta página.</p>';
    }
    
    const h1Count = document.querySelectorAll('h1').length;
    let html = `<p class="small">Total: ${headings.length} encabezados | H1: ${h1Count} ${h1Count !== 1 ? '<span class="warn">(recomendado: 1)</span>' : '<span class="ok">✓</span>'}</p>`;
    html += `<table class="dse-table"><thead><tr><th style="width:80px">Tag</th><th>Texto</th></tr></thead><tbody>`;
    headings.forEach(h => {
      const text = h.innerText.trim().substring(0, 100);
      html += `<tr><td><strong>${h.tagName}</strong></td><td>${escapeHtml(text)}${h.innerText.length > 100 ? '...' : ''}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const buildImages = () => {
    const imgs = document.querySelectorAll('img');
    console.log(`[SEO Panel] Imágenes encontradas: ${imgs.length}`);
    
    if (imgs.length === 0) {
      return '<p class="small">No se encontraron imágenes en esta página.</p>';
    }
    
    let withAlt = 0, withoutAlt = 0;
    imgs.forEach(img => {
      if (img.alt && img.alt.trim()) withAlt++;
      else withoutAlt++;
    });
    
    let html = `<div class="kv"><div class="k">Total de imágenes</div><div class="v">${imgs.length}</div></div>`;
    html += `<div class="kv"><div class="k">Con ALT</div><div class="v"><span class="ok">${withAlt}</span></div></div>`;
    html += `<div class="kv"><div class="k">Sin ALT</div><div class="v"><span class="${withoutAlt > 0 ? 'bad' : 'ok'}">${withoutAlt}</span></div></div>`;
    
    html += `<table class="dse-table" style="margin-top:12px"><thead><tr><th>Src</th><th>Alt</th><th>Estado</th></tr></thead><tbody>`;
    Array.from(imgs).slice(0, 50).forEach(img => {
      const src = img.getAttribute('src') || img.currentSrc || 'N/A';
      const alt = img.getAttribute('alt') || '';
      const status = alt.trim() ? '<span class="ok">✓ OK</span>' : '<span class="bad">✗ Sin ALT</span>';
      const srcShort = src.length > 50 ? src.substring(0, 50) + '...' : src;
      const altShort = alt.length > 50 ? alt.substring(0, 50) + '...' : alt;
      html += `<tr><td>${escapeHtml(srcShort)}</td><td>${escapeHtml(altShort)}</td><td>${status}</td></tr>`;
    });
    if (imgs.length > 50) {
      html += `<tr><td colspan="3" class="small">Mostrando 50 de ${imgs.length} imágenes</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
  };

  const buildLinks = () => {
    const links = document.querySelectorAll('a[href]');
    console.log(`[SEO Panel] Links encontrados: ${links.length}`);
    
    if (links.length === 0) {
      return '<p class="small">No se encontraron enlaces en esta página.</p>';
    }
    
    let internal = 0, external = 0;
    const hostname = window.location.hostname;
    
    Array.from(links).forEach(a => {
      try {
        const linkHostname = new URL(a.href, window.location.href).hostname;
        if (linkHostname === hostname) internal++;
        else external++;
      } catch(e) {
        // Enlaces malformados o relativos
        internal++;
      }
    });
    
    let html = `<div class="kv"><div class="k">Total de enlaces</div><div class="v">${links.length}</div></div>`;
    html += `<div class="kv"><div class="k">Enlaces internos</div><div class="v">${internal}</div></div>`;
    html += `<div class="kv"><div class="k">Enlaces externos</div><div class="v">${external}</div></div>`;
    
    html += `<table class="dse-table" style="margin-top:12px"><thead><tr><th>Texto</th><th>URL</th><th>Tipo</th></tr></thead><tbody>`;
    Array.from(links).slice(0, 50).forEach(a => {
      const text = a.innerText.trim() || a.textContent.trim() || '(sin texto)';
      const href = a.getAttribute('href');
      let type = 'Interno';
      try {
        const linkHostname = new URL(a.href, window.location.href).hostname;
        if (linkHostname !== hostname) type = 'Externo';
      } catch(e) {}
      
      const textShort = text.length > 40 ? text.substring(0, 40) + '...' : text;
      const hrefShort = href.length > 60 ? href.substring(0, 60) + '...' : href;
      html += `<tr><td>${escapeHtml(textShort)}</td><td>${escapeHtml(hrefShort)}</td><td>${type}</td></tr>`;
    });
    if (links.length > 50) {
      html += `<tr><td colspan="3" class="small">Mostrando 50 de ${links.length} enlaces</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
  };

  // Esperar a que el DOM esté completamente cargado
  const loadAllContent = () => {
    console.log('[SEO Panel] Cargando todo el contenido...');
    document.getElementById('overviewContent').innerHTML = safeExecute(buildOverview, 'Overview');
    document.getElementById('jsonldContent').innerHTML = safeExecute(buildJsonLD, 'JSON-LD');
    document.getElementById('hreflangContent').innerHTML = safeExecute(buildHreflang, 'Hreflang');
    document.getElementById('headingsContent').innerHTML = safeExecute(buildHeadings, 'Headings');
    document.getElementById('imagesContent').innerHTML = safeExecute(buildImages, 'Images');
    document.getElementById('linksContent').innerHTML = safeExecute(buildLinks, 'Links');
    console.log('[SEO Panel] Contenido cargado completamente');
  };

  // Cargar inmediatamente si el DOM ya está listo, o esperar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllContent);
  } else {
    loadAllContent();
  }

  console.log('[SEO Panel] Inicialización completa');
})();