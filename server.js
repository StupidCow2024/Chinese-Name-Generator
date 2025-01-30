import express from 'express';
import cors from 'cors';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateToken } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// 检查环境变量加载
console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    API_KEY_LOADED: !!process.env.ZHIPU_API_KEY,
    API_KEY_VALUE: process.env.ZHIPU_API_KEY
});

const app = express();

// 配置 CORS - 必须在其他中间件之前
const corsOptions = {
    origin: true, // 允许所有来源
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// 应用 CORS 中间件
app.use(cors(corsOptions));

// 设置请求大小限制
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 启用更详细的请求日志
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// 添加静态文件服务
app.use(express.static('.'));

// 智谱AI GLM-4 flash API配置
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const API_KEY = process.env.ZHIPU_API_KEY;

// API 请求配置
const API_CONFIG = {
    timeout: 120000, // 2分钟超时
    maxRetries: 3,   // 最大重试次数
    retryDelay: 1000 // 重试间隔（毫秒）
};

if (!API_KEY) {
    console.error('Error: ZHIPU_API_KEY not found in environment variables');
    process.exit(1);
}

// 添加重试函数
async function retryRequest(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.log(`Attempt ${i + 1} failed:`, error.message);
            lastError = error;
            
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

// 处理 OPTIONS 请求
app.options('*', cors(corsOptions));

// 添加健康检查端点
app.get('/health', cors(corsOptions), (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 处理中文名生成请求
app.post('/api/generate-name', cors(corsOptions), async (req, res) => {
    const requestStart = Date.now();
    const { englishName, gender } = req.body;

    console.log('Received name generation request');
    console.log('Request details:', { englishName, gender });

    if (!englishName) {
        return res.status(400).json({
            error: 'Missing required parameter: englishName'
        });
    }

    try {
        const messages = [
            {
                role: "system",
                content: `你是一个专业的中文起名专家，精通中英文发音对照和音译规则。你的任务是为外国人生成中文名字。
                
                要求：
                1. 必须严格按照英文名的发音特点进行音译，保持声音的相似性
                2. 每个字都要选用常见、易写、寓意好的汉字
                3. 需要考虑性别特征，选用合适的字
                4. 生成3个不同的名字方案
                5. 提供完整的解释，包括发音、含义等
                
                音译规则：
                1. 优先选择与英文音节发音相近的汉字
                2. 对于辅音，要尽可能匹配相似的声母
                3. 对于元音，要选择相近的韵母
                4. 声调要和谐，避免生硬
                
                输出格式要求：
                返回一个数组，包含3个名字对象，每个对象包含：
                1. chineseName: 中文名字
                2. pinyin: 拼音
                3. pronunciation_tips: 发音要点和英文名的对应关系
                4. meaning: { overall, cultural, personality }
                5. characters: 每个字的详细信息数组
                6. modern_context: 现代语境下的含义`
            },
            {
                role: "user",
                content: `请为英文名 "${englishName}" 生成中文名。性别偏好：${gender}。
                要特别注意：
                1. 名字发音要尽可能接近英文名
                2. 字义要积极向上
                3. 要易写易记
                4. 要符合中国文化特色`
            }
        ];

        // 生成 JWT Token
        console.log('Generating JWT token...');
        const token = generateToken(API_KEY);
        console.log('Token generated successfully');

        const axiosConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: API_CONFIG.timeout,
            maxContentLength: 50 * 1024 * 1024,
            maxBodyLength: 50 * 1024 * 1024,
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            }
        };

        const requestData = {
            model: "glm-4-flash",
            messages: messages,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            max_tokens: 2000
        };

        console.log('Sending request to Zhipu AI...');
        
        // 使用重试机制发送请求
        const response = await retryRequest(
            async () => await axios.post(API_URL, requestData, axiosConfig),
            API_CONFIG.maxRetries,
            API_CONFIG.retryDelay
        );

        console.log('Received response from Zhipu AI');
        console.log('Response status:', response.status);
        console.log('Response time:', Date.now() - requestStart, 'ms');

        if (response.status !== 200) {
            console.error('API error response:', response.data);
            return res.status(response.status).json({
                error: 'API request failed',
                details: response.data?.error || 'Unexpected API response'
            });
        }

        if (!response.data?.choices?.[0]?.message?.content) {
            console.error('Invalid API response structure');
            return res.status(500).json({
                error: 'Invalid API response',
                details: 'The AI service returned an unexpected response format'
            });
        }

        let nameData;
        try {
            // 预处理 AI 响应，移除 Markdown 格式
            let content = response.data.choices[0].message.content;
            // 移除 Markdown 代码块标记
            content = content.replace(/```json\n|\n```/g, '');
            nameData = JSON.parse(content);
            console.log('Successfully parsed name data');
        } catch (parseError) {
            console.error('Failed to parse AI response:', {
                error: parseError,
                content: response.data.choices[0].message.content
            });
            return res.status(500).json({
                error: 'Failed to parse AI response',
                details: 'The AI service returned invalid JSON data'
            });
        }

        if (!Array.isArray(nameData) || nameData.length === 0) {
            console.error('Invalid name data format:', nameData);
            return res.status(500).json({
                error: 'Invalid name data format',
                details: 'The AI service returned an invalid data structure'
            });
        }

        console.log('Sending successful response to client');
        return res.json(nameData);

    } catch (error) {
        const errorResponse = {
            error: error.code === 'ECONNABORTED' ? 'Request timeout' : 'Internal server error',
            details: error.message,
            timestamp: new Date().toISOString(),
            requestDuration: Date.now() - requestStart
        };

        console.error('API Error:', {
            ...errorResponse,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });

        // 根据错误类型设置状态码
        const statusCode = error.code === 'ECONNABORTED' ? 504 : 
                         error.response?.status || 500;

        return res.status(statusCode).json(errorResponse);
    }
});

const PORT = process.env.PORT || 3000;

// 添加错误处理
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

try {
    const server = app.listen(PORT, () => {
        console.log('=================================');
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`API endpoint: http://localhost:${PORT}/api/generate-name`);
        console.log('=================================');
    });

    // 设置服务器超时
    server.timeout = 120000; // 120秒
    server.keepAliveTimeout = 120000;
    server.headersTimeout = 120000;

} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
} 