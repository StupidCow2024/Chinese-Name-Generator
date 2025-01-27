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

const app = express();
app.use(express.json());
app.use(cors());

// 添加静态文件服务
app.use(express.static('.'));

// 智谱AI GLM-4 flash API配置
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const API_KEY = process.env.ZHIPU_API_KEY;

if (!API_KEY) {
    console.error('Error: ZHIPU_API_KEY not found in environment variables');
    process.exit(1);
}

// 添加健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 处理中文名生成请求
app.post('/api/generate-name', async (req, res) => {
    try {
        const { englishName, gender } = req.body;
        
        console.log('Received request:', { englishName, gender });
        
        if (!englishName || !gender) {
            console.log('Missing required fields');
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Both englishName and gender are required'
            });
        }

        const prompt = `你现在是一位专业的中文姓名翻译专家，精通中英文化和文字文化。请为英文名 "${englishName}" (性别倾向: ${gender}) 创建三个不同的中文名字。

要求：
1. 姓氏要选择不同的常见中国姓氏
2. 名字要尽可能在发音上接近英文名
3. 字的选择要考虑性别倾向，体现文化内涵
4. 名字要富有诗意和美好寓意
5. 需要解释每个字的出处、含义和文化背景

请严格按照以下JSON格式返回三个名字的数组，不要包含任何其他内容：
[
    {
        "chineseName": "第一个中文名字",
        "pinyin": "完整中文名字的拼音",
        "meaning": "名字的整体含义和寓意",
        "culturalReference": "名字的文化内涵和典故出处",
        "characters": [
            {
                "character": "姓氏",
                "meaning": "姓氏的来源和含义"
            },
            {
                "character": "名字第一个字",
                "meaning": "第一个字的含义和选择原因"
            },
            {
                "character": "名字第二个字",
                "meaning": "第二个字的含义和选择原因"
            }
        ]
    },
    {
        // 第二个名字的相同结构
    },
    {
        // 第三个名字的相同结构
    }
]`;

        try {
            // 生成 JWT Token
            const token = generateToken(API_KEY);
            console.log('Generated JWT token');

            // 发送请求到智谱AI
            console.log('Sending request to Zhipu AI...');
            const response = await axios.post(API_URL, {
                model: "glm-4-flash",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                top_p: 0.9,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Received response from Zhipu AI');
            console.log('Response status:', response.status);
            console.log('Response data:', JSON.stringify(response.data, null, 2));

            const nameData = JSON.parse(response.data.choices[0].message.content);
            console.log('Parsed name data:', nameData);
            
            return res.json(nameData);

        } catch (error) {
            console.error('API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            
            if (error.response?.status === 401) {
                return res.status(401).json({
                    error: 'Authentication failed',
                    details: 'Failed to authenticate with the AI service'
                });
            }

            if (error.response?.data) {
                return res.status(500).json({
                    error: 'API request failed',
                    details: error.response.data
                });
            }
            
            return res.status(500).json({
                error: 'Internal server error',
                details: error.message || 'Unknown error occurred'
            });
        }

    } catch (error) {
        console.error('Server Error:', {
            message: error.message,
            stack: error.stack
        });
        
        return res.status(500).json({
            error: 'Server error',
            details: error.message
        });
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

try {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check available at http://localhost:${PORT}/health`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
} 