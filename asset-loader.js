(function() {
    // 💡 取得當下時間戳記，確保每次載入都是最新檔案（強制無快取）
    const VERSION = new Date().getTime();

    // 判斷當前頁面是在「根目錄」還是「子目錄」
    // 如果路徑中包含斜線 (例如 /factor.../index.html)，則往上找上一層 ../
    const pathDepth = window.location.pathname.split('/').filter(Boolean).length;
    const isSubFolder = pathDepth > 1; // 視你的專案目錄結構調整，通常子目錄需要 ../
    const basePath = isSubFolder ? '../' : './';

    // 1. 動態注入 mathematics.css
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${basePath}mathematics.css?v=${VERSION}`;
    document.head.appendChild(link);

    // 2. 動態注入 mathematics.js
    const script = document.createElement('script');
    script.src = `${basePath}mathematics.js?v=${VERSION}`;
    script.async = false; // 確保按順序載入
    document.head.appendChild(script);
})();