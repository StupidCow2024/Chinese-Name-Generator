import { generateChineseName } from './nameGenerator.js';

class ChineseNameGenerator {
    constructor() {
        this.englishNameInput = document.getElementById('englishName');
        this.genderSelect = document.getElementById('gender');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.loadingElement = document.getElementById('loading');
        this.resultsElement = document.getElementById('results');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.generateBtn.addEventListener('click', () => this.handleGenerate());
        this.clearBtn.addEventListener('click', () => this.handleClear());
        this.englishNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleGenerate();
            }
        });
    }

    async handleGenerate() {
        const englishName = this.englishNameInput.value.trim();
        const gender = this.genderSelect.value;

        if (!englishName) {
            this.showMessage('请输入英文名', 'error');
            return;
        }

        this.showLoading();

        try {
            const response = await this.generateChineseName(englishName, gender);
            this.displayResults(response);
        } catch (error) {
            console.error('Error in handleGenerate:', error);
            this.showMessage(error.message || '生成名字时出错，请稍后重试', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async generateChineseName(englishName, gender) {
        try {
            const response = await fetch('/api/generate-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ englishName, gender })
            });

            let errorMessage = '服务器响应错误';
            let responseText = '';

            try {
                responseText = await response.text();
                console.log('Server response:', responseText);
            } catch (e) {
                console.error('Error reading response:', e);
                throw new Error('无法读取服务器响应');
            }

            if (!response.ok) {
                console.error('Server error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: responseText
                });

                try {
                    const errorJson = JSON.parse(responseText);
                    if (response.status === 504) {
                        this.showMessage('生成名字需要较长时间，请耐心等待...', 'info');
                        return await this.generateChineseName(englishName, gender);
                    }
                    errorMessage = errorJson.error || errorJson.message || errorMessage;
                } catch (e) {
                    if (response.status === 405) {
                        errorMessage = '服务器不支持该请求方法';
                    }
                }

                throw new Error(errorMessage);
            }

            if (!responseText) {
                throw new Error('服务器返回空响应');
            }

            try {
                return JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError, 'Response text:', responseText);
                throw new Error('无法解析服务器响应');
            }
        } catch (error) {
            console.error('Error in generateChineseName:', error);
            throw error;
        }
    }

    handleClear() {
        this.englishNameInput.value = '';
        this.genderSelect.value = 'neutral';
        this.resultsElement.innerHTML = '';
    }

    showLoading() {
        this.loadingElement.style.display = 'flex';
        this.resultsElement.innerHTML = '';
    }

    hideLoading() {
        this.loadingElement.style.display = 'none';
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        messageElement.textContent = message;
        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    displayResults(names) {
        this.resultsElement.innerHTML = '';
        
        names.forEach((name, index) => {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            card.innerHTML = `
                <div class="result-header">
                    <div class="suggestion-number">推荐 ${index + 1}</div>
                    <h2 class="chinese-name">${name.chineseName}</h2>
                    <div class="pronunciation">${name.pinyin}</div>
                </div>

                <div class="meaning-section">
                    <h3>名字寓意</h3>
                    <p><strong>整体含义：</strong>${name.meaning.overall}</p>
                    <p><strong>文化内涵：</strong>${name.meaning.cultural}</p>
                    <p><strong>性格特质：</strong>${name.meaning.personality}</p>
                </div>

                <div class="characters-section">
                    <h3>字义详解</h3>
                    ${name.characters.map(char => `
                        <div class="char-details">
                            <h4>${char.character} (${char.pinyin})</h4>
                            <p><strong>含义：</strong>${char.meaning}</p>
                            ${char.cultural_reference ? `<p><strong>文化典故：</strong>${char.cultural_reference}</p>` : ''}
                            ${char.personality_trait ? `<p><strong>性格特质：</strong>${char.personality_trait}</p>` : ''}
                            ${char.usage ? `<p><strong>使用频率：</strong>${char.usage}</p>` : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="additional-info">
                    <h3>补充信息</h3>
                    <p><strong>发音技巧：</strong>${name.pronunciation_tips}</p>
                    <p><strong>现代意义：</strong>${name.modern_context}</p>
                </div>

                <button class="copy-btn" onclick="copyToClipboard('${name.chineseName}')">
                    复制名字
                </button>
            `;
            
            this.resultsElement.appendChild(card);
        });
    }
}

// 复制到剪贴板的功能
window.copyToClipboard = async function(text) {
    try {
        await navigator.clipboard.writeText(text);
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = '名字已复制到剪贴板';
        document.body.appendChild(messageElement);
        setTimeout(() => messageElement.remove(), 2000);
    } catch (err) {
        console.error('复制失败:', err);
        const messageElement = document.createElement('div');
        messageElement.className = 'error-message';
        messageElement.textContent = '复制失败，请手动复制';
        document.body.appendChild(messageElement);
        setTimeout(() => messageElement.remove(), 2000);
    }
};

// 初始化生成器
new ChineseNameGenerator(); 