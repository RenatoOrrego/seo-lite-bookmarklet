(function(){

  function extractCurrentPageSchemas() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    if (scripts.length === 0) {
      return '<p style="color:#f59e0b;padding:10px;">❌ No se encontró schema JSON-LD en esta página.</p>';
    }
    
    let schemas = Array.from(scripts).map((script, i) => {
      try {
        const obj = JSON.parse(script.textContent);
        const schemaType = obj['@type'] || obj.type || 'Unknown';
        return `
          <div style="margin-bottom:15px;">
            <div style="background:#0a84ff;color:#fff;padding:6px 10px;border-radius:4px 4px 0 0;font-weight:bold;">
              Schema ${i + 1}: ${schemaType}
            </div>
            <pre style="background:#1a1a1a;color:#10b981;padding:12px;margin:0;white-space:pre-wrap;word-wrap:break-word;border-radius:0 0 4px 4px;max-height:350px;overflow:auto;font-size:12px;border:1px solid #333;">${JSON.stringify(obj, null, 2)}</pre>
          </div>`;
      } catch(e) {
        return `<pre style="background:#1a1a1a;color:#ef4444;padding:10px;border-radius:4px;margin-bottom:10px;">❌ Error parseando Schema ${i + 1}: ${e.message}</pre>`;
      }
    }).join('');
    
    return `<div style="color:#10b981;font-weight:bold;margin-bottom:10px;">✅ ${scripts.length} schema(s) encontrado(s)</div>${schemas}`;
  }


  async function fetchSchema(url) {
    const proxies = [
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];


    const fetchWithTimeout = (url, timeout = 8000) => {
      return Promise.race([
        fetch(url, { 
          method: 'GET',
          headers: { 'Accept': 'text/html' }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
    };


    const attempts = proxies.map(async (proxyUrl) => {
      try {
        const res = await fetchWithTimeout(proxyUrl);
        if (!res.ok) throw new Error('HTTP error');
        const html = await res.text();
        return { success: true, html };
      } catch(e) {
        return { success: false, error: e.message };
      }
    });


    try {
      const results = await Promise.all(attempts);
      const successful = results.find(r => r.success);
      
      if (!successful) {
        return `<p style="color:#ef4444;padding:10px;">⚠️ Todos los proxies fallaron o timeout (8s)<br><br>💡 <strong>Solución:</strong> Abre la URL en tu navegador y usa "📄 Página Actual"</p>`;
      }

      const html = successful.html;
      const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      
      if (!matches || matches.length === 0) {
        return '<p style="color:#f59e0b;padding:10px;">❌ No se encontró schema JSON-LD en esta URL.</p>';
      }
      
      let schemas = matches.map((m, idx) => {
        const json = m.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        try {
          const obj = JSON.parse(json);
          const schemaType = obj['@type'] || obj.type || 'Unknown';
          return `
            <div style="margin-bottom:15px;">
              <div style="background:#0a84ff;color:#fff;padding:6px 10px;border-radius:4px 4px 0 0;font-weight:bold;">
                Schema ${idx + 1}: ${schemaType}
              </div>
              <pre style="background:#1a1a1a;color:#10b981;padding:12px;margin:0;white-space:pre-wrap;word-wrap:break-word;border-radius:0 0 4px 4px;max-height:350px;overflow:auto;font-size:12px;border:1px solid #333;">${JSON.stringify(obj, null, 2)}</pre>
            </div>`;
        } catch(e) {
          return `<pre style="background:#1a1a1a;color:#ef4444;padding:10px;border-radius:4px;margin-bottom:10px;">❌ Error parseando Schema ${idx + 1}: ${e.message}</pre>`;
        }
      }).join('');
      
      return `<div style="color:#10b981;font-weight:bold;margin-bottom:10px;">✅ ${matches.length} schema(s) encontrado(s)</div>${schemas}`;
      
    } catch(e) {
      return `<p style="color:#ef4444;padding:10px;">⚠️ Error: ${e.message}</p>`;
    }
  }

  const existing = document.getElementById('schemas-popup');
  if(existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'schemas-popup';
  popup.style.cssText = `
    position:fixed;
    top:20px;
    right:20px;
    width:480px;
    max-height:90vh;
    z-index:999999;
    background:#1e1e1e;
    color:#fff;
    padding:0;
    border-radius:12px;
    box-shadow:0 8px 32px rgba(0,0,0,0.6);
    overflow:hidden;
    font-family:'Monaco','Menlo','Consolas',monospace;
    display:flex;
    flex-direction:column;
  `;

  popup.innerHTML = `
    <div style="background:#0a84ff;padding:15px;display:flex;justify-content:space-between;align-items:center;border-radius:12px 12px 0 0;">
      <h3 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
        🧩 Schema Viewer
      </h3>
      <button id="closeSchemas" style="background:rgba(255,255,255,0.2);color:#fff;border:none;border-radius:6px;cursor:pointer;width:28px;height:28px;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">✖</button>
    </div>
    
    <div style="padding:15px;flex:1;overflow:auto;">
      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <button id="currentPageBtn" style="flex:1;padding:10px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:13px;transition:all 0.2s;">
          📄 Página Actual
        </button>
        <button id="toggleMode" style="flex:1;padding:10px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:13px;transition:all 0.2s;">
          🌐 Modo URLs
        </button>
      </div>

      <div id="urlMode" style="display:none;">
        <textarea id="urlList" style="width:100%;height:90px;margin-bottom:10px;background:#111;color:#10b981;border:1px solid #333;border-radius:6px;padding:10px;font-family:inherit;font-size:12px;resize:vertical;" placeholder="Pega tus URLs aquí (una por línea)&#10;&#10;Ejemplo:&#10;https://ejemplo.com/pagina1&#10;https://ejemplo.com/pagina2&#10;&#10;⚠️ Nota: Puede fallar por CORS"></textarea>
        
        <button id="getSchemas" style="width:100%;padding:12px;background:#0a84ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;transition:all 0.2s;">
          🚀 Obtener Schemas
        </button>
      </div>
      
      <div id="results" style="margin-top:15px;"></div>
    </div>
  `;

  document.body.appendChild(popup);

  const closeBtn = document.getElementById('closeSchemas');
  const currentPageBtn = document.getElementById('currentPageBtn');
  const toggleModeBtn = document.getElementById('toggleMode');
  const urlMode = document.getElementById('urlMode');
  const getBtn = document.getElementById('getSchemas');
  const resultsDiv = document.getElementById('results');

  closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.3)';
  closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
  closeBtn.onclick = () => popup.remove();

  // Botón para analizar página actual
  currentPageBtn.onclick = () => {
    resultsDiv.innerHTML = '<div style="background:#0f0f0f;padding:15px;border-radius:8px;">' + extractCurrentPageSchemas() + '</div>';
  };


  let showingUrlMode = false;
  toggleModeBtn.onclick = () => {
    showingUrlMode = !showingUrlMode;
    urlMode.style.display = showingUrlMode ? 'block' : 'none';
    toggleModeBtn.innerHTML = showingUrlMode ? '📄 Modo Actual' : '🌐 Modo URLs';
    resultsDiv.innerHTML = '';
  };

  getBtn.onmouseover = () => getBtn.style.background = '#0066cc';
  getBtn.onmouseout = () => getBtn.style.background = '#0a84ff';
  
  getBtn.onclick = async () => {
    const urlsRaw = document.getElementById('urlList').value;
    const urls = urlsRaw.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    
    resultsDiv.innerHTML = '';
    
    if(urls.length === 0) {
      resultsDiv.innerHTML = '<p style="color:#f59e0b;text-align:center;padding:20px;">⚠️ Por favor ingresa al menos una URL.</p>';
      return;
    }

    getBtn.disabled = true;
    getBtn.innerHTML = '⏳ Procesando...';
    getBtn.style.opacity = '0.6';

   
    const accordions = urls.map(url => {
      const accordion = document.createElement('div');
      accordion.style.cssText = 'margin-bottom:12px;border:1px solid #333;border-radius:8px;overflow:hidden;';
      
      accordion.innerHTML = `
        <button class="accordion-btn" style="width:100%;text-align:left;background:#2a2a2a;color:#0a84ff;padding:12px 15px;border:none;cursor:pointer;font-weight:bold;font-size:13px;display:flex;align-items:center;gap:8px;transition:all 0.2s;">
          <span style="transition:transform 0.2s;">▶</span>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${url}</span>
          <span class="status" style="font-size:11px;color:#6b7280;">⏳</span>
        </button>
        <div class="schemaContent" style="display:none;background:#0f0f0f;padding:15px;max-height:500px;overflow:auto;"></div>
      `;
      
      resultsDiv.appendChild(accordion);

      const btn = accordion.querySelector('.accordion-btn');
      const content = accordion.querySelector('.schemaContent');
      const arrow = btn.querySelector('span');
      const status = accordion.querySelector('.status');

      btn.onmouseover = () => btn.style.background = '#333';
      btn.onmouseout = () => btn.style.background = '#2a2a2a';
      
      btn.onclick = () => {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        arrow.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
      };

      content.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;">⏳ Cargando (máx 8s)...</p>';
      
      return { url, content, status };
    });

  
    await Promise.all(accordions.map(async ({ url, content, status }) => {
      const startTime = Date.now();
      const schemaHTML = await fetchSchema(url);
      const loadTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      content.innerHTML = schemaHTML;
      
      if (schemaHTML.includes('✅')) {
        status.innerHTML = `✅ ${loadTime}s`;
        status.style.color = '#10b981';
      } else {
        status.innerHTML = '❌';
        status.style.color = '#ef4444';
      }
    }));

    getBtn.disabled = false;
    getBtn.innerHTML = '🚀 Obtener Schemas';
    getBtn.style.opacity = '1';
  };


  currentPageBtn.click();
})();
