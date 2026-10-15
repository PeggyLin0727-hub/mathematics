/**
 * 全域數學遊戲入口網腳本 mathematics.js
 */

let globalTopicsData = [];

/**
 * 初始化入口網頁，載入 topics.json
 */
function initPortal() {
    fetch('topics.json')
        .then(response => response.json())
        .then(data => {
            globalTopicsData = data;
            renderMainPortal();
        })
        .catch(error => {
            console.error('無法載入 topics.json 設定檔：', error);
        });
}

/**
 * 渲染主目錄視圖 (七上 ~ 九下)
 */
function renderMainPortal() {
    const container = document.getElementById('portal-content');
    if (!container) return;

    let htmlContent = '';
    globalTopicsData.forEach(group => {
        // 如果該年級尚無單元，可選擇暫時隱藏或顯示未開放
        if (!group.topics || group.topics.length === 0) return;

        htmlContent += `
            <div class="category-group">
                <h2 class="category-title">${group.category}</h2>
                <div class="grid-container">
        `;

        group.topics.forEach(topic => {
            htmlContent += `
                <div class="nav-card" onclick="showSubView('${topic.id}')" style="cursor: pointer;">
                    <div class="nav-info-link">
                        <div class="nav-info">
                            <h3>${topic.title}</h3>
                            <p>${topic.desc}</p>
                        </div>
                    </div>
                    <div class="nav-actions">
                        <span class="nav-arrow">進入 ➔</span>
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
}

/**
 * 切換至單元內部的遊戲列表頁面 (不跳頁)
 * @param {string} topicId - 主題的 ID (例如: 'prime-factorization')
 */
function showSubView(topicId) {
    let matchedTopic = null;

    // 尋找目標單元
    for (const group of globalTopicsData) {
        const found = group.topics.find(t => t.id === topicId);
        if (found) {
            matchedTopic = found;
            break;
        }
    }

    if (!matchedTopic) return;

    // 更新標題
    document.getElementById('portal-main-title').innerText = `${matchedTopic.title}`;

    // 渲染遊戲卡片
    const gamesContainer = document.getElementById('games-container');
    let gamesHtml = '';

    if (matchedTopic.games && matchedTopic.games.length > 0) {
        matchedTopic.games.forEach(game => {
            const hasRandom = !!game.randomUrl;

            gamesHtml += `
                <div class="nav-card" style="position: relative;" data-fixed-url="${game.url}" data-random-url="${game.randomUrl || ''}">
                    ${hasRandom ? `
                        <!-- 右上角版本切換按鈕 -->
                        <div class="card-version-switch">
                            <button class="version-btn fixed active" onclick="switchCardVersion(this, 'fixed')">固定</button>
                            <button class="version-btn random" onclick="switchCardVersion(this, 'random')">隨機</button>
                        </div>
                    ` : ''}

                    <a href="${game.url}" class="nav-info-link game-main-link">
                        <div class="nav-info">
                            <h2>${game.title}</h2>
                            <p>${game.desc}</p>
                        </div>
                    </a>
                    <div class="nav-actions">
                        <button class="qr-btn game-qr-btn" onclick="showQRCodeModal(this.closest('.nav-card').querySelector('.game-main-link').href, '${game.title}')" title="顯示 QR Code">
                            <i class="qr-icon"></i>
                            <span>QR</span>
                        </button>
                        <a href="${game.url}" class="nav-arrow game-action-link">${game.actionText || '進入 ➔'}</a>
                    </div>
                </div>
            `;
        });
    } else {
        gamesHtml = `<p style="color: #fff; text-align: center; padding: 20px;">尚無互動遊戲，敬請期待！</p>`;
    }

    gamesContainer.innerHTML = gamesHtml;

    // 切換 DOM 顯示/隱藏
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('sub-view').classList.remove('hidden');
}

/**
 * 返回主選單視圖
 */
function showMainView() {
    document.getElementById('portal-main-title').innerText = '國中數學互動學習館';

    document.getElementById('sub-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
}

/**
 * 切換單張卡片的版本（固定 / 隨機），並同步更新標題連結、QR Code 與下方按鈕
 * @param {HTMLElement} btnEl - 被點擊的按鈕
 * @param {string} type - 'fixed' 或 'random'
 */
function switchCardVersion(btnEl, type) {
    const card = btnEl.closest('.nav-card');
    const fixedUrl = card.getAttribute('data-fixed-url');
    const randomUrl = card.getAttribute('data-random-url');
    const targetUrl = (type === 'fixed') ? fixedUrl : randomUrl;

    // 1. 切換按鈕的 active 狀態樣式
    const buttons = card.querySelectorAll('.version-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');

    // 2. 同步更新上方主標題連結
    const mainLink = card.querySelector('.game-main-link');
    if (mainLink) mainLink.href = targetUrl;

    // 3. 同步更新右下角「開啟解密 ➔」連結
    const actionLink = card.querySelector('.game-action-link');
    if (actionLink) actionLink.href = targetUrl;
}

/* ==========================================
   全域 QR Code 工具模組
   ========================================== */

function generateQRCode(element, url, options = {}) {
    const targetEl = typeof element === 'string' ? document.getElementById(element) : element;
    if (!targetEl) return;

    targetEl.innerHTML = '';
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
    }
}

function showQRCodeModal(url, title = '掃描 QR Code 開始遊戲') {
    let modalOverlay = document.getElementById('global-qr-modal');

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

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeQRCodeModal();
        });
    }

    const titleEl = document.getElementById('qr-modal-title');
    const qrContainer = document.getElementById('qr-modal-code');

    if (titleEl) titleEl.innerText = title;
    generateQRCode(qrContainer, url, { width: 200, height: 200 });

    modalOverlay.classList.remove('hidden');
    modalOverlay.style.display = 'flex';
}

function closeQRCodeModal() {
    const modalOverlay = document.getElementById('global-qr-modal');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}