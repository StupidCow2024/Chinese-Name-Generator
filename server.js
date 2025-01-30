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
    console.log('Received name generation request');
    const requestStart = Date.now();
    
    try {
        const { englishName, gender } = req.body;
        
        console.log('Request details:', { englishName, gender });
        console.log('Using API key:', API_KEY);
        
        if (!englishName || !gender) {
            console.log('Missing required fields');
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Both englishName and gender are required'
            });
        }

        const prompt = `作为一位专业的中文姓名翻译专家，你需要为英文名 "${englishName}" (性别倾向: ${gender}) 创建三个独特的中文名字。每个名字都应该体现深厚的文化内涵和个性化特点。

命名原则：
1. 姓氏选择：
   - 选择不同的常见中国姓氏（如：李、王、张等）
   - 考虑姓氏的历史渊源和文化意义
   - 避免生僻或不常见的姓氏

2. 发音要求：
   - 名字的发音要尽可能接近英文名的音节
   - 确保声调搭配和谐，避免生硬的音节组合
   - 整体读音要朗朗上口，易于记忆

3. 字义考量：
   - 根据性别倾向选择合适的字
   - 男性：选用阳刚、气势、才华等内涵的字
   - 女性：选用优雅、灵秀、智慧等内涵的字
   - 中性：选用德行、智慧、自然等通用内涵的字

4. 文化内涵：
   - 每个字都要有深厚的文化底蕴
   - 可以引用诗词典故或历史典故
   - 体现传统文化中的美好寓意
   - 注重字义之间的和谐统一

5. 现代适用性：
   - 避免过于古板或过时的用字
   - 符合现代审美和价值观
   - 便于在国际交往中使用
   - 适合在当代社会使用

请严格按照以下JSON格式返回三个名字的数组，确保每个名字都独特且符合上述要求：
[
    {
        "chineseName": "完整的中文名字",
        "pinyin": "标准汉语拼音（包含声调）",
        "meaning": {
            "overall": "名字的整体含义和寓意",
            "cultural": "相关的文化内涵和典故出处",
            "personality": "暗含的性格特质和期望"
        },
        "characters": [
            {
                "character": "姓氏",
                "pinyin": "姓氏的拼音",
                "meaning": "姓氏的来源和历史意义",
                "usage": "在中国的使用频率和代表性"
            },
            {
                "character": "名字第一个字",
                "pinyin": "第一个字的拼音",
                "meaning": "字义解释",
                "cultural_reference": "相关的文化典故",
                "personality_trait": "暗含的性格特质"
            },
            {
                "character": "名字第二个字",
                "pinyin": "第二个字的拼音",
                "meaning": "字义解释",
                "cultural_reference": "相关的文化典故",
                "personality_trait": "暗含的性格特质"
            }
        ],
        "pronunciation_tips": "关于读音的特别说明和技巧",
        "modern_context": "在现代社会中使用这个名字的优势和特点"
    }
]`;

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
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
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
            nameData = JSON.parse(response.data.choices[0].message.content);
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