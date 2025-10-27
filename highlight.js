(function(){
    var palabra = "NutriAdvance";
    var regex = new RegExp(palabra, "gi");
    function highlight(root){
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        var nodes = [];
        var encontrado = false;
        while(walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(function(n){
            var t = n.nodeValue;
            if(regex.test(t)){
                encontrado = true;
                var span = document.createElement("span");
                span.innerHTML = t.replace(regex, function(m){ return '<mark style="background:yellow;color:black;">'+m+'</mark>'; });
                n.parentNode.replaceChild(span, n);
            }
        });
        return encontrado;
    }
    var alerted = false;
    function runOnce(){
        var found = highlight(document.body);
        if(!found && !alerted){
            alerted = true;
            try{ alert("No se encontró la palabra 'NutriAdvance' en esta página."); }catch(e){}
        }
    }
    runOnce();
    var mo = new MutationObserver(function(m){ runOnce(); });
    mo.observe(document.body, { childList:true, subtree:true });
})();
