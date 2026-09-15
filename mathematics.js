/**
 * 全域數學遊戲入口網腳本 mathematics.js
 */

/**
 * 載入主入口頁面 (根目錄 index.html)
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
                    htmlContent += `
                        <a href="./${topic.folder}/index.html" class="nav-card">
                            <div class="nav-info">
                                <h3>${topic.title}</h3>
                                <span class="en-sub">${topic.enTitle}</span>
                                <p>${topic.desc}</p>
                            </div>
                            <div class="nav-arrow">進入 ➔</div>
                        </a>
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
            console.error('無載入 JSON 設定檔：', error);
        });
}

/**
 * 載入子單元入口頁面 (例如 /factorFactorizationAndFractions/index.html)
 * @param {string} currentFolder - 當前資料夾名稱
 */
function loadSubPortal(currentFolder) {
    fetch('../topics.json')
        .then(response => response.json())
        .then(data => {
            let matchedTitle = '';
            
            // 尋找對應 folder 的中文名稱
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
                    titleEl.innerText = `📐 ${matchedTitle}`;
                }
                document.title = `${matchedTitle} - 數學遊戲`;
            }
        })
        .catch(error => {
            console.error('無載入 JSON 設定檔：', error);
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