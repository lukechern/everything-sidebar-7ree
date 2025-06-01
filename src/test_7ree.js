/**
 * Everything Sidebar 7ree 测试模块
 * 负责测试与Everything HTTP服务器的连通性
 */

const http = require('http');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * 测试管理类
 */
class TestManager {
    /**
     * 构造函数
     */
    constructor() {
        debugLog_7ree('Test', '模块加载完成');
    }

    /**
     * 测试与Everything HTTP服务器的连通性
     * @param {number} port 端口号
     * @returns {Promise<Object>} 测试结果对象
     */
    testConnection(port) {
        return new Promise((resolve) => {
            debugLog_7ree('Test', `开始测试连接: http://localhost:${port}`);
            
            // 构建测试URL
            const testUrl = `http://localhost:${port}/?search=test&json=1`;
            
            // 设置请求超时时间
            const timeout = 5000; // 5秒
            let isResolved = false;
            
            // 创建请求
            const req = http.get(testUrl, (res) => {
                let data = '';
                
                // 接收数据
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                // 数据接收完成
                res.on('end', () => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    // 检查响应状态码
                    if (res.statusCode !== 200) {
                        debugLog_7ree('Test', `连接测试失败: 状态码 ${res.statusCode}`);
                        resolve({
                            success: false,
                            message: `连接失败: 服务器返回状态码 ${res.statusCode}`,
                            data: null
                        });
                        return;
                    }
                    
                    // 尝试解析JSON响应
                    try {
                        const jsonData = JSON.parse(data);
                        debugLog_7ree('Test', '连接测试成功', jsonData);
                        resolve({
                            success: true,
                            message: '连接成功: Everything HTTP服务器正常运行',
                            data: jsonData
                        });
                    } catch (error) {
                        debugLog_7ree('Test', '连接测试失败: 无效的JSON响应', error);
                        resolve({
                            success: false,
                            message: '连接失败: 服务器返回的不是有效的JSON数据',
                            data: null
                        });
                    }
                });
            });
            
            // 处理请求错误
            req.on('error', (error) => {
                if (isResolved) return;
                isResolved = true;
                
                debugLog_7ree('Test', '连接测试失败', error);
                
                // 根据错误类型返回不同的错误消息
                let errorMessage = '连接失败: ';
                if (error.code === 'ECONNREFUSED') {
                    errorMessage += `无法连接到 http://localhost:${port}，请确认 Everything 已启动并开启了 HTTP 服务器`;
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += '连接超时';
                } else {
                    errorMessage += error.message;
                }
                
                resolve({
                    success: false,
                    message: errorMessage,
                    data: null
                });
            });
            
            // 设置请求超时
            req.setTimeout(timeout, () => {
                if (isResolved) return;
                isResolved = true;
                
                req.abort();
                debugLog_7ree('Test', '连接测试失败: 请求超时');
                resolve({
                    success: false,
                    message: `连接失败: 请求超时 (${timeout / 1000}秒)`,
                    data: null
                });
            });
        });
    }
}

module.exports = TestManager;