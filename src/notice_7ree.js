/**
 * Everything Sidebar 7ree 通知模块
 * 负责状态栏消息显示
 */

const vscode = require('vscode');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * 通知管理类
 */
class NoticeManager {
    /**
     * 构造函数
     */
    constructor() {
        this.statusBarItem = null;
        debugLog_7ree('Notice', '模块加载完成');
    }

    /**
     * 初始化通知
     * @param {vscode.ExtensionContext} context 插件上下文
     */
    initialize(context) {
        // 创建状态栏项
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'everything-sidebar-7ree.showSidebar';
        this.statusBarItem.tooltip = 'Everything Sidebar 7ree';
        
        // 添加到订阅列表
        context.subscriptions.push(this.statusBarItem);
        
        // 显示默认状态
        this.setDefaultStatus();
        
        debugLog_7ree('Notice', '通知已初始化');
    }

    /**
     * 设置默认状态
     */
    setDefaultStatus() {
        this.statusBarItem.text = '$(search) Everything';
        this.statusBarItem.show();
    }

    /**
     * 显示信息消息
     * @param {string} message 消息内容
     * @param {number} timeout 超时时间（毫秒），默认3000ms
     */
    showInfo(message, timeout = 3000) {
        this.showStatus(`$(info) ${message}`, timeout);
        debugLog_7ree('Notice', `信息: ${message}`);
    }

    /**
     * 显示错误消息
     * @param {string} message 消息内容
     * @param {number} timeout 超时时间（毫秒），默认5000ms
     */
    showError(message, timeout = 5000) {
        this.showStatus(`$(error) ${message}`, timeout);
        debugLog_7ree('Notice', `错误: ${message}`);
    }

    /**
     * 显示警告消息
     * @param {string} message 消息内容
     * @param {number} timeout 超时时间（毫秒），默认4000ms
     */
    showWarning(message, timeout = 4000) {
        this.showStatus(`$(warning) ${message}`, timeout);
        debugLog_7ree('Notice', `警告: ${message}`);
    }

    /**
     * 显示成功消息
     * @param {string} message 消息内容
     * @param {number} timeout 超时时间（毫秒），默认3000ms
     */
    showSuccess(message, timeout = 3000) {
        this.showStatus(`$(check) ${message}`, timeout);
        debugLog_7ree('Notice', `成功: ${message}`);
    }

    /**
     * 显示加载中消息
     * @param {string} message 消息内容
     */
    showLoading(message) {
        this.statusBarItem.text = `$(sync~spin) ${message}`;
        this.statusBarItem.show();
        debugLog_7ree('Notice', `加载中: ${message}`);
    }

    /**
     * 显示状态消息
     * @param {string} text 状态文本
     * @param {number} timeout 超时时间（毫秒），如果为0则不自动恢复
     */
    showStatus(text, timeout = 0) {
        this.statusBarItem.text = text;
        this.statusBarItem.show();
        
        // 如果设置了超时时间，则在超时后恢复默认状态
        if (timeout > 0) {
            setTimeout(() => {
                this.setDefaultStatus();
            }, timeout);
        }
    }

    /**
     * 在VS Code通知中显示消息
     * @param {string} message 消息内容
     * @param {'info'|'warning'|'error'} type 消息类型
     */
    showNotification(message, type = 'info') {
        switch (type) {
            case 'info':
                vscode.window.showInformationMessage(`Everything Sidebar: ${message}`);
                break;
            case 'warning':
                vscode.window.showWarningMessage(`Everything Sidebar: ${message}`);
                break;
            case 'error':
                vscode.window.showErrorMessage(`Everything Sidebar: ${message}`);
                break;
        }
        
        debugLog_7ree('Notice', `通知(${type}): ${message}`);
    }
}

module.exports = NoticeManager;