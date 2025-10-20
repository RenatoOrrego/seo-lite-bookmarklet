(async function(){
  if(document.getElementById('seoLiteModal')) return;


  const overlay = document.createElement('div');
  overlay.style = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    z-index:999999998;backdrop-filter:blur(3px);
  `;


  const modal = document.createElement('div');
  modal.id = 'seoLiteModal';
  modal.style = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    width:900px;max-height:85vh;overflow:auto;
    background:#fff;border-radius:12px;box-shadow:0 12px 48px rgba(0,0,0,0.4);
    font-family:Inter,Arial,sans-serif;font-size:13px;color:#111;
    z-index:999999999;padding:20px;
  `;


  const close = document.createElement('button');
  close.textContent = '×';
  close.style = `
    position:absolute;top:10px;right:14px;border:none;
    background:none;font-size:24px;cursor:pointer;color:#444;
  `;
  close.onclick = ()=>{ overlay.remove(); modal.remove(); };

  modal.innerHTML = `
    <h2 style="margin-top:0">SEO Lite Report</h2>
    <div id="seoOverview">Cargando...</div>
  `;
  modal.appendChild(close);
  document.body.appendChild(overlay);
  document.body.appendChild(modal);


  const getMeta = name => {
    const el = document.querySelector('meta[name="'+name+'"],meta[property="'+name+'"]');
    return el ? el.content : '';
  };

  const info = {
    title: document.title,
    description: getMeta('description'),
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    lang: document.documentElement.lang || '',
    words: (document.body.innerText||'').trim().split(/\s+/).length
  };

  document.getElementById('seoOverview').innerHTML = `
    <p><b>Title:</b> ${info.title}</p>
    <p><b>Description:</b> ${info.description}</p>
    <p><b>Canonical:</b> ${info.canonical}</p>
    <p><b>Lang:</b> ${info.lang}</p>
    <p><b>Words:</b> ${info.words}</p>
  `;
})();
