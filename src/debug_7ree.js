/**
 * Everything Sidebar 7ree 调试模块
 * 提供全局统一的调试输出功能，支持控制调试开关、输出所属功能模块、信息类型、信息详情
 */

// 调试开关，可通过配置文件或命令行参数控制
let isDebugEnabled = true;

/**
 * 调试日志输出函数
 * @param {string} module 模块名称
 * @param {string} message 日志消息
 * @param {any} data 附加数据（可选）
 */
function debugLog_7ree(module, message, data = null) {
    if (!isDebugEnabled) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}][Everything-7ree][${module}]`;
    
    if (data) {
        console.log(`${prefix} ${message}`, data);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

/**
 * 设置调试开关状态
 * @param {boolean} enabled 是否启用调试
 */
function setDebugEnabled(enabled) {
    isDebugEnabled = enabled;
    debugLog_7ree('Debug', `调试模式已${enabled ? '启用' : '禁用'}`);
}

/**
 * 获取当前调试开关状态
 * @returns {boolean} 调试开关状态
 */
function getDebugEnabled() {
    return isDebugEnabled;
}

// 导出模块函数
module.exports = {
    debugLog_7ree,
    setDebugEnabled,
    getDebugEnabled
};