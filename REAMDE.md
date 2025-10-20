# SEO Lite Panel Bookmarklet

Una herramienta de análisis SEO sencilla y rápida inyectada en cualquier página.

## 🚀 Instalación (Método Recomendado)

La forma más fácil de instalar el panel es arrastrar el siguiente enlace a tu **Barra de Marcadores** (o Favoritos):

<a href="javascript:(async function(){if(document.getElementById('dseButton'))return;console.log('[SEO Panel] Iniciando...');const style=document.createElement('style');style.textContent=`#dseButton{/* ...código CSS minificado completo... */}`;document.head.appendChild(style);const btn=document.createElement('button');/* ...resto del código JavaScript minificado completo... */})();" 
   style="display: inline-block; padding: 10px 20px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-family: Arial, sans-serif;"
   title="SEO Panel - Arrastrar a la Barra de Marcadores">
   SEO Panel Lite 🔍 (Arrastrar y Soltar)
</a>

---

## 🛠️ Uso
1.  Visita cualquier página web.
2.  Haz clic en el marcador "SEO Panel Lite".
3.  El botón 🔍 aparecerá en la esquina superior derecha.

---

## 💻 Instalación Manual
Si la opción de arrastrar no funciona, añade un nuevo marcador y pega el siguiente código en el campo de URL:
```javascript
javascript:(async function(){if(document.getElementById('dseButton'))return;console.log('[SEO Panel] Iniciando...');const style=document.createElement('style');style.textContent=`#dseButton{/* ...código CSS minificado completo... */}`;document.head.appendChild(style);const btn=document.createElement('button');/* ...resto del código JavaScript minificado completo... */})();
