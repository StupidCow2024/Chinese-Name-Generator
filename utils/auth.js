import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function generateToken(apiKey) {
    try {
        // 解析 API Key
        const [id, secret] = apiKey.split('.');
        
        // 当前时间戳（秒）
        const timestamp = Math.floor(Date.now() / 1000);
        
        // 准备 JWT payload
        const payload = {
            api_key: id,
            exp: timestamp + 3600,  // 1小时后过期
            timestamp: timestamp
        };

        // 使用 HMAC-SHA256 生成签名
        const token = jwt.sign(payload, secret, { 
            algorithm: 'HS256',
            header: {
                alg: 'HS256',
                sign_type: 'SIGN'
            }
        });

        console.log('Generated token payload:', payload);
        return token;

    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Failed to generate authentication token');
    }
} 