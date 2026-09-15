/**
 * 全域數學遊戲入口網腳本 mathematics.js
 */

/**
 * 載入主入口頁面 (根目錄 \mathematics\index.html) -> 點擊單元轉址至 sub_portal.html?folder=...
 */
function loadMainPortal() {
    fetch('topics.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('portal-content');
            if (!container) return;

            let htmlContent = '';
            data.forEach(group => {
                htmlContent += `
                    <div class="category-group">
                        <h2 class="category-title">${group.category}</h2>
                        <div class="grid-container">
                `;

                group.topics.forEach(topic => {
                    // 指向根目錄下的共用 sub_portal.html，並帶上 folder 參數
                    const targetUrl = `./sub_portal.html?folder=${topic.folder}`;
                    htmlContent += `
                        <div class="nav-card">
                            <a href="${targetUrl}" class="nav-info-link">
                                <div class="nav-info">
                                    <h3>${topic.title}</h3>
                                    <span class="en-sub hidden">${topic.enTitle}</span>
                                    <p>${topic.desc}</p>
                                </div>
                            </a>
                            <div class="nav-actions">
                                <!-- 首頁不放置 QR Code 按鈕，僅保留進入按鈕 -->
                                <a href="${targetUrl}" class="nav-arrow">進入 ➔</a>
                            </div>
                        </div>
                    `;
                });

                htmlContent += `
                        </div>
                    </div>
                    <br>
                `;
            });

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error('無法載入 topics.json 設定檔：', error);
        });
}

/**
 * 自動讀取 URL 中的 folder 參數，並動態載入對應單元的標題與 games.json (用於根目錄 sub_portal.html)
 */
function autoLoadSubPortal() {
    // 1. 從 URL 查詢參數中取得 folder (例如: sub_portal.html?folder=factorFactorizationAndFractions)
    const urlParams = new URLSearchParams(window.location.search);
    const folder = urlParams.get('folder');

    if (!folder) {
        console.error('未指定單元 folder 參數');
        return;
    }

    // 2. 讀取 topics.json 設定對應單元的中文標題
    fetch('topics.json')
        .then(response => response.json())
        .then(data => {
            let matchedTitle = '';
            for (const group of data) {
                const found = group.topics.find(t => t.folder === folder);
                if (found) {
                    matchedTitle = found.title;
                    break;
                }
            }
            if (matchedTitle) {
                const titleEl = document.getElementById('page-title');
                if (titleEl) titleEl.innerText = matchedTitle;
                document.title = `${matchedTitle} - 數學遊戲入口`;
            }
        })
        .catch(err => console.error('讀取 topics.json 失敗:', err));

    // 3. 讀取指定單元資料夾下的 games.json 渲染卡片
    fetch(`./${folder}/games.json`)
        .then(response => {
            if (!response.ok) throw new Error('找不到 games.json');
            return response.json();
        })
        .then(games => {
            const container = document.getElementById('games-container');
            if (!container) return;

            let htmlContent = '';
            games.forEach(game => {
                // 拼接遊戲目標網址 (相對路徑)
                const gameUrl = `./${folder}/${game.url}`;

                htmlContent += `
                    <div class="nav-card">
                        <a href="${gameUrl}" class="nav-info-link">
                            <div class="nav-info">
                                <h2>${game.title}</h2>
                                <p>${game.desc}</p>
                            </div>
                        </a>
                        <div class="nav-actions">
                            <button class="qr-btn" onclick="showQRCodeModal('${gameUrl}', '${game.title}')" title="顯示 QR Code">
                                <i class="qr-icon"></i>
                                <span>QR</span>
                            </button>
                            <a href="${gameUrl}" class="nav-arrow">${game.actionText || '進入 ➔'}</a>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = htmlContent;
        })
        .catch(err => console.error('載入 games.json 失敗:', err));
}

/**
 * 載入子單元名稱工具函式 (相容舊版直接呼叫)
 * @param {string} currentFolder - 當前資料夾名稱
 */
function loadSubPortal(currentFolder) {
    fetch('../topics.json')
        .then(response => response.json())
        .then(data => {
            let matchedTitle = '';
            for (const group of data) {
                const found = group.topics.find(t => t.folder === currentFolder);
                if (found) {
                    matchedTitle = found.title;
                    break;
                }
            }
            
            if (matchedTitle) {
                const titleEl = document.getElementById('page-title');
                if (titleEl) {
                    titleEl.innerText = `${matchedTitle}`;
                }
                document.title = `${matchedTitle}`;
            }
        })
        .catch(error => {
            console.error('無法載入 topics.json 設定檔：', error);
        });
}

// 判斷質數
function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

/* ==========================================
   全域 QR Code 工具模組
   ========================================== */

/**
 * 在指定 DOM 元素生成 QR Code
 * @param {HTMLElement|string} element - 目標 DOM 元素或其 ID
 * @param {string} url - 網址（相對路徑將自動轉換為絕對路徑）
 * @param {object} options - QRCode 自訂參數 (寬、高、顏色等)
 */
function generateQRCode(element, url, options = {}) {
    const targetEl = typeof element === 'string' ? document.getElementById(element) : element;
    if (!targetEl) return;

    // 清空舊內容
    targetEl.innerHTML = '';

    // 將相對路徑轉換為完整網址
    const absoluteUrl = new URL(url, window.location.href).href;

    const defaultOptions = {
        text: absoluteUrl,
        width: 200,
        height: 200,
        colorDark: "#2C3E50",
        colorLight: "#ffffff",
        correctLevel: typeof QRCode !== 'undefined' ? QRCode.CorrectLevel.H : 2
    };

    if (typeof QRCode !== 'undefined') {
        new QRCode(targetEl, { ...defaultOptions, ...options });
    } else {
        console.error('未找到 QRCode.js 函式庫，請確認頁面是否有引入 QRCode CDN。');
    }
}

/**
 * 彈出 QR Code Modal 供使用者掃瞄 (純圖示，不列出網址文字)
 * @param {string} url - 連結目標網址
 * @param {string} title - Modal 標題名稱
 */
function showQRCodeModal(url, title = '掃描 QR Code 開始遊戲') {
    let modalOverlay = document.getElementById('global-qr-modal');

    // 若 Modal HTML 元素不存在，則自動在 body 內動態建立
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'global-qr-modal';
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content qr-modal-content">
                <button class="modal-close-btn" onclick="closeQRCodeModal()">✕</button>
                <h3 id="qr-modal-title" style="margin-bottom: 15px; color: #2C3E50;"></h3>
                <div id="qr-modal-code" style="display: flex; justify-content: center; margin: 15px 0;"></div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // 點擊 Modal 外部陰影區域可關閉視窗
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeQRCodeModal();
        });
    }

    const titleEl = document.getElementById('qr-modal-title');
    const qrContainer = document.getElementById('qr-modal-code');

    const absoluteUrl = new URL(url, window.location.href).href;
    if (titleEl) titleEl.innerText = title;

    // 繪製 QR Code
    generateQRCode(qrContainer, absoluteUrl, { width: 200, height: 200 });

    modalOverlay.classList.remove('hidden');
    modalOverlay.style.display = 'flex';
}

/**
 * 關閉 QR Code Modal
 */
function closeQRCodeModal() {
    const modalOverlay = document.getElementById('global-qr-modal');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}