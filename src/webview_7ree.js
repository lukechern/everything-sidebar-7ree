/**
 * Everything Sidebar 7ree WebView模块
 * 负责处理WebView的创建、通信和资源管理
 */

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { debugLog_7ree } = require('./debug_7ree');
const { getWebviewResourceUris_7ree } = require('./webview_util_7ree');

/**
 * WebView管理类
 */
class WebViewManager {
    /**
     * 构造函数
     * @param {vscode.ExtensionContext} context 插件上下文
     */
    constructor(context) {
        this.context = context;
        this.extensionUri = context.extensionUri;
        this.webviewView = null;
        debugLog_7ree('WebView', '模块加载完成');
    }

    /**
     * 初始化WebView
     * @param {vscode.WebviewView} webviewView WebView视图
     */
    initialize(webviewView) {
        this.webviewView = webviewView;
        
        // 设置WebView选项
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        // 加载HTML内容
        this.updateHtml();

        // 注释掉：处理WebView消息 - 这个监听器会与EverythingSidebarViewProvider中的监听器冲突
        // webviewView.webview.onDidReceiveMessage(message => {
        //     this.handleMessage(message);
        // });

        debugLog_7ree('WebView', 'WebView已初始化');
    }

    /**
     * 更新WebView HTML内容
     * @param {string} pageType 页面类型 ('sidebar', 'search', 'setting', 'collection')
     * @param {string} htmlFileName HTML文件名 (如 'sidebar_7ree.html', 'search_7ree.html' 等)
     */
    updateHtml(pageType = 'sidebar', htmlFileName = 'sidebar_7ree.html') {
        if (!this.webviewView) return;

        const webview = this.webviewView.webview;
        
        // 获取资源路径和 webviewUri 映射
        const uris_7ree = getWebviewResourceUris_7ree(webview, this.extensionUri, pageType);

        // 获取 HTML 文件路径
        const htmlFilePath_7ree = vscode.Uri.joinPath(this.extensionUri, 'ui', htmlFileName);
        
        let htmlContent;
        try {
            htmlContent = fs.readFileSync(htmlFilePath_7ree.fsPath, 'utf8');
            debugLog_7ree('WebView', `成功加载${htmlFileName}文件`);
        } catch (error) {
            debugLog_7ree('WebView', `加载${htmlFileName}文件失败`, error);
            // 使用备用HTML内容
            webview.html = this.getFallbackHtml(webview);
            return;
        }
        
        // 替换模板变量
        for (const [key, value] of Object.entries(uris_7ree)) {
            htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        
        // 设置WebView HTML内容
        webview.html = htmlContent;
        debugLog_7ree('WebView', 'HTML内容已更新');
    }

    /**
     * 获取备用HTML内容
     * @param {vscode.Webview} webview WebView实例
     * @returns {string} 备用HTML内容
     */
    getFallbackHtml(webview) {
        const baseCssPath = vscode.Uri.joinPath(this.extensionUri, 'ui', 'base_7ree.css');
        const baseCssUri = webview.asWebviewUri(baseCssPath);

        return `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Everything Sidebar</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        background-color: var(--vscode-sideBar-background);
                        color: var(--vscode-sideBar-foreground);
                        padding: 10px;
                    }
                </style>
            </head>
            <body>
                <h3>Everything Sidebar 7ree</h3>
                <p>加载界面失败，请检查插件文件是否完整。</p>
            </body>
            </html>
        `;
    }

    /**
     * 处理WebView消息
     * @param {any} message 消息对象
     */
    handleMessage(message) {
        debugLog_7ree('WebView', '收到WebView消息', message);

        switch (message.command) {
            case 'init':
                debugLog_7ree('WebView', 'WebView初始化消息', message.text);
                break;
            case 'getSettings':
                debugLog_7ree('WebView', '请求获取设置');
                // 这个消息会被上层处理
                break;
            case 'saveSettings':
                debugLog_7ree('WebView', '请求保存设置', message.settings);
                // 这个消息会被上层处理
                break;
            case 'testConnection':
                debugLog_7ree('WebView', '请求测试连接', message.port);
                // 这个消息会被上层处理
                break;
            // 后续添加更多消息处理
            default:
                debugLog_7ree('WebView', '未知WebView消息类型', message.command);
        }
    }

    /**
     * 向WebView发送消息
     * @param {any} message 消息对象
     */
    postMessage(message) {
        if (!this.webviewView) return;

        this.webviewView.webview.postMessage(message);
        debugLog_7ree('WebView', '向WebView发送消息', message);
    }
}

module.exports = WebViewManager;