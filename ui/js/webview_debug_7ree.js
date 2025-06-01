/**
 * Everything Sidebar 7ree WebView 调试模块
 * 提供WebView前端统一的调试输出功能
 */

/**
 * WebView调试日志输出函数
 * @param {string} module 模块名称
 * @param {string} message 日志消息
 * @param {any} data 附加数据（可选）
 */
function webviewDebugLog(module, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}][Everything-7ree][WebView][${module}]`;
    
    if (data) {
        console.log(`${prefix} ${message}`, data);
    } else {
        console.log(`${prefix} ${message}`);
    }
}