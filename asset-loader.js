(function() {
    const VERSION = new Date().getTime();

    const pathDepth = window.location.pathname.split('/').filter(Boolean).length;
    const isSubFolder = pathDepth > 1; 
    const basePath = isSubFolder ? '../' : './';

    // 1. 動態注入 mathematics.css
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${basePath}mathematics.css?v=${VERSION}`;
    document.head.appendChild(link);

    // 2. 動態注入 mathematics.js 並監聽載入完成事件
    const script = document.createElement('script');
    script.src = `${basePath}mathematics.js?v=${VERSION}`;
    
    // 💡 關鍵修正：當 mathematics.js 真的下載完畢後，觸發全域自訂事件
    script.onload = () => {
        window.dispatchEvent(new Event('mathematicsLoaded'));
    };
    
    document.head.appendChild(script);
})();
