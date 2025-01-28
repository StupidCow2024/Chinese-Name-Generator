import { generateChineseName } from './nameGenerator.js';

class ChineseNameGenerator {
    constructor() {
        this.initializeUI();
        this.attachEventListeners();
        // 将 copyToClipboard 绑定到 window 对象
        window.copyToClipboard = this.copyToClipboard.bind(this);
    }

    // 初始化UI元素引用
    initializeUI() {
        this.englishNameInput = document.getElementById('englishName');
        this.genderSelect = document.getElementById('gender');
        this.generateButton = document.getElementById('generateBtn');
        this.clearButton = document.getElementById('clearBtn');
        this.resultsContainer = document.getElementById('results');
        this.loadingSpinner = document.getElementById('loading');
    }

    // 添加事件监听器
    attachEventListeners() {
        // 生成按钮点击事件
        this.generateButton.addEventListener('click', () => this.handleGenerate());
        
        // 清除按钮点击事件
        this.clearButton.addEventListener('click', () => this.clearAll());
        
        // Enter键事件
        this.englishNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleGenerate();
            }
        });
    }

    // 处理生成名字的逻辑
    async handleGenerate() {
        const englishName = this.englishNameInput.value.trim();
        const gender = this.genderSelect.value;
        
        if (!englishName) {
            this.showError('Please enter your English name');
            return;
        }

        this.showLoading(true);
        
        try {
            const nameData = await this.generateChineseName(englishName, gender);
            this.displayResults(nameData);
        } catch (error) {
            this.showError(error.message);
            console.error('Error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 显示结果
    displayResults(nameData) {
        this.resultsContainer.innerHTML = '';
        
        nameData.forEach((name, index) => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="result-header">
                    <div class="suggestion-number">Option ${index + 1}</div>
                    <div class="chinese-name">${name.chineseName}</div>
                    <div class="pronunciation">${name.pinyin}</div>
                </div>
                <div class="meaning-section">
                    <h3>Name Meaning</h3>
                    <p>${name.meaning}</p>
                </div>
                <div class="cultural-section">
                    <h3>Cultural Reference</h3>
                    <p>${name.culturalReference}</p>
                </div>
                <div class="individual-chars">
                    ${name.characters.map(char => `
                        <div class="char-details">
                            <h4>${char.character}</h4>
                            <p>${char.meaning}</p>
                        </div>
                    `).join('')}
                </div>
                <button class="copy-btn" data-name="${name.chineseName}">
                    Copy Name
                </button>
            `;
            
            // 添加复制按钮的点击事件监听器
            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(copyBtn.dataset.name);
            });
            
            this.resultsContainer.appendChild(card);
        });

        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // 复制到剪贴板
    async copyToClipboard(text) {
        if (!text) return;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('Name copied to clipboard');
        } catch (err) {
            console.error('Copy failed:', err);
            // 使用备用复制方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showMessage('Name copied to clipboard');
            } catch (err) {
                this.showError('Failed to copy');
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    // 清除所有内容
    clearAll() {
        this.englishNameInput.value = '';
        this.genderSelect.value = 'neutral';
        this.resultsContainer.innerHTML = '';
        this.englishNameInput.focus();
    }

    // 显示/隐藏加载动画
    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'block' : 'none';
        this.generateButton.disabled = show;
    }

    // 显示错误信息
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.resultsContainer.innerHTML = '';
        this.resultsContainer.appendChild(errorDiv);
        
        setTimeout(() => {
            if (this.resultsContainer.contains(errorDiv)) {
                errorDiv.remove();
            }
        }, 3000);
    }

    // 显示提示信息
    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 2000);
    }

    async generateChineseName(englishName, gender) {
        try {
            console.log('Sending request to server...', { englishName, gender });
            
            const response = await fetch(`${window.location.origin}/api/generate-name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ englishName, gender })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Server error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                throw new Error(errorData?.details || errorData?.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response from server:', data);

            if (!Array.isArray(data) || data.length === 0) {
                console.error('Invalid response format:', data);
                throw new Error('Server returned invalid data format');
            }

            return data;

        } catch (error) {
            console.error('Error in generateChineseName:', error);
            throw error;
        }
    }
}

// 当页面加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.nameGenerator = new ChineseNameGenerator();
}); 