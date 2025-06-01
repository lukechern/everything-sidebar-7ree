/**
 * Everything Sidebar 7ree API模块
 * 负责与Everything HTTP服务器通信，发起搜索请求
 */

const http = require('http');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * API管理类
 */
class ApiManager {
    /**
     * 构造函数
     * @param {Object} settingManager 配置管理器实例
     */
    constructor(settingManager) {
        this.settingManager = settingManager;
        this.requestTimeout = 5000; // 5秒超时
        debugLog_7ree('API', '模块加载完成');
    }

    /**
     * 测试与Everything HTTP服务器的连接
     * @param {number} port 端口号
     * @returns {Promise<boolean>} 连接是否成功
     */
    testConnection(port = null) {
        return new Promise((resolve, reject) => {
            const testPort = port || this.settingManager.getSetting('port');
            const testUrl = `http://localhost:${testPort}/?search=test&json=1&count=1`;
            
            debugLog_7ree('API', `测试连接: ${testUrl}`);
            
            const req = http.get(testUrl, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            JSON.parse(data);
                            debugLog_7ree('API', '连接测试成功');
                            resolve(true);
                        } catch (error) {
                            debugLog_7ree('API', '连接测试失败: 响应不是有效JSON');
                            reject(new Error('服务器响应格式错误'));
                        }
                    } else {
                        debugLog_7ree('API', `连接测试失败: 状态码 ${res.statusCode}`);
                        reject(new Error(`HTTP错误: ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                debugLog_7ree('API', '连接测试失败', error);
                reject(error);
            });
            
            req.setTimeout(this.requestTimeout, () => {
                req.destroy();
                debugLog_7ree('API', '连接测试超时');
                reject(new Error('连接超时'));
            });
        });
    }

    /**
     * 执行搜索请求
     * @param {string} keyword 搜索关键词
     * @param {Object} options 搜索选项
     * @returns {Promise<Object>} 搜索结果
     */
    search(keyword, options = {}) {
        return new Promise((resolve, reject) => {
            if (!keyword || !keyword.trim()) {
                resolve({ results: [], totalResults: 0 });
                return;
            }
            
            // 获取配置
            const port = this.settingManager.getSetting('port');
            const maxResults = options.maxResults || this.settingManager.getSetting('maxResults');
            const searchScope = options.searchScope || this.settingManager.getSetting('searchScope');
            
            // 构建搜索查询字符串
            let searchQuery = keyword.trim();
            
            // 如果是工作区搜索，按照Everything API格式构建查询：目录路径 + 空格 + 关键词
            if (searchScope === 'workspace' && options.workspacePath) {
                // 确保工作区路径以反斜杠结尾
                let workspacePath = options.workspacePath;
                if (!workspacePath.endsWith('\\') && !workspacePath.endsWith('/')) {
                    workspacePath += '\\';
                }
                // 格式：目录路径 + 空格 + 关键词
                searchQuery = `${workspacePath} ${keyword.trim()}`;
                debugLog_7ree('API', `工作区搜索查询: ${searchQuery}`);
            }
            
            // 构建查询参数
            const params = new URLSearchParams();
            params.append('search', searchQuery);
            params.append('json', '1');
            params.append('count', maxResults.toString());
            params.append('path_column', '1');
            
            // 根据搜索范围添加过滤器（仅对非工作区搜索有效）
            if (searchScope === 'files') {
                params.append('file', '1');
            } else if (searchScope === 'folders') {
                params.append('folder', '1');
            }
            
            // 构建请求URL
            const requestUrl = `http://localhost:${port}/?${params.toString()}`;
            
            debugLog_7ree('API', `发起搜索请求: ${keyword}`);
            debugLog_7ree('API', `请求URL: ${requestUrl}`);
            
            // 发送HTTP请求
            const req = http.get(requestUrl, (res) => {
                let data = '';
                
                // 接收数据
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                // 数据接收完成
                res.on('end', () => {
                    // 检查响应状态码
                    if (res.statusCode !== 200) {
                        const error = new Error(`搜索请求失败: HTTP ${res.statusCode}`);
                        debugLog_7ree('API', error.message);
                        reject(error);
                        return;
                    }
                    
                    // 尝试解析JSON响应
                    try {
                        const result = JSON.parse(data);
                        
                        // 格式化搜索结果
                        const formattedResults = this.formatSearchResults(result);
                        
                        debugLog_7ree('API', `搜索成功，找到 ${formattedResults.length} 个结果`);
                        resolve({
                            results: formattedResults,
                            totalResults: result.totalResults || formattedResults.length,
                            keyword: keyword
                        });
                    } catch (error) {
                        debugLog_7ree('API', '搜索请求失败: 无效的JSON响应', error);
                        reject(new Error('服务器返回的不是有效的JSON数据'));
                    }
                });
            });
            
            req.on('error', (error) => {
                debugLog_7ree('API', '搜索请求失败', error);
                if (error.code === 'ECONNREFUSED') {
                    reject(new Error('无法连接到Everything HTTP服务器，请确保Everything已启动并开启HTTP服务器'));
                } else {
                    reject(error);
                }
            });
            
            req.setTimeout(this.requestTimeout, () => {
                req.destroy();
                debugLog_7ree('API', '搜索请求超时');
                reject(new Error('搜索请求超时'));
            });
        });
    }

    /**
     * 格式化搜索结果
     * @param {Object} rawResult Everything API返回的原始结果
     * @returns {Array} 格式化后的结果数组
     */
    formatSearchResults(rawResult) {
        if (!rawResult || !Array.isArray(rawResult.results)) {
            debugLog_7ree('API', '无效的搜索结果数据');
            return [];
        }
        
        debugLog_7ree('API', `开始格式化 ${rawResult.results.length} 个搜索结果`);
        
        return rawResult.results.map((item, index) => {
            const isDirectory = item.type === 'folder' || (item.attributes && (item.attributes & 0x10) !== 0);
            
            // 构建完整的文件路径
            let fullPath = item.path;
            const fileName = item.name;
            
            // 检查 Everything 返回的路径是否完整
            if (fileName && fullPath) {
                // 如果路径不以文件名结尾，说明需要组合路径和文件名
                if (!fullPath.endsWith(fileName)) {
                    // 确保路径分隔符正确
                    const separator = fullPath.includes('/') ? '/' : '\\';
                    if (!fullPath.endsWith(separator)) {
                        fullPath += separator;
                    }
                    fullPath += fileName;
                    debugLog_7ree('API', `组合完整路径: ${item.path} + ${fileName} = ${fullPath}`);
                }
            }
            
            // 确保路径是绝对路径
            if (fullPath && !this.isAbsolutePath(fullPath)) {
                debugLog_7ree('API', `检测到相对路径: ${fullPath}`);
                debugLog_7ree('API', `警告: 路径可能不完整: ${fullPath}`);
            }
            
            const result = {
                name: fileName || this.getFileNameFromPath(fullPath),
                path: fullPath,
                type: isDirectory ? 'directory' : 'file',
                size: item.size || 0,
                dateModified: item.date_modified || null,
                isDirectory: isDirectory
            };
            
            // 调试信息：记录前几个结果的详细信息
            if (index < 3) {
                debugLog_7ree('API', `结果 ${index + 1}:`, {
                    原始路径: item.path,
                    文件名: item.name,
                    完整路径: result.path,
                    类型: result.type,
                    是否目录: result.isDirectory
                });
            }
            
            return result;
        });
    }

    /**
     * 检查路径是否为绝对路径
     * @param {string} filePath 文件路径
     * @returns {boolean} 是否为绝对路径
     */
    isAbsolutePath(filePath) {
        if (!filePath) return false;
        
        // Windows 绝对路径：C:\ 或 \\server\share
        if (/^[A-Za-z]:\\/.test(filePath) || /^\\\\/.test(filePath)) {
            return true;
        }
        
        // Unix/Linux 绝对路径：/
        if (filePath.startsWith('/')) {
            return true;
        }
        
        return false;
    }

    /**
     * 从路径中提取文件名
     * @param {string} filePath 文件路径
     * @returns {string} 文件名
     */
    getFileNameFromPath(filePath) {
        if (!filePath) return '';
        return filePath.split(/[\\\/]/).pop() || filePath;
    }
}

module.exports = ApiManager;