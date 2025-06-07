/**
 * Everything Sidebar 7ree 搜索文件操作模块
 * 负责文件点击打开、高亮、加收藏行为
 */

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * 搜索文件操作管理类
 */
class SearchFileManager {
    /**
     * 构造函数
     * @param {Object} webviewManager WebView管理器实例
     */
    constructor(webviewManager) {
        this.webviewManager = webviewManager;
        this.activeFilePath = null; // 当前活动文件路径
        
        debugLog_7ree('SearchFile', '模块加载完成');
    }

    /**
     * 初始化文件操作
     */
    initialize() {
        // 注册WebView消息处理
        this.registerMessageHandlers();
        
        // 监听编辑器变化，用于高亮当前文件
        this.registerEditorListeners();
        
        debugLog_7ree('SearchFile', '文件操作已初始化');
    }

    /**
     * 注册WebView消息处理函数
     */
    registerMessageHandlers() {
        // 在WebViewManager中添加消息处理
        const originalHandleMessage = this.webviewManager.handleMessage.bind(this.webviewManager);
        
        this.webviewManager.handleMessage = (message) => {
            debugLog_7ree('SearchFile', '[SearchFileManager] Received message', message);
            let handled = false;
            switch (message.command) {
                case 'openFile':
                    debugLog_7ree('SearchFile', '[SearchFileManager] Handling openFile', message);
                    this.openFile(message.filePath);
                    handled = true;
                    break;
                case 'openFileBeside':
                    debugLog_7ree('SearchFile', '[SearchFileManager] Handling openFileBeside', message);
                    this.openFileBeside_7ree(message.filePath);
                    handled = true;
                    break;
                case 'addToCollection':
                    debugLog_7ree('SearchFile', '[SearchFileManager] Handling addToCollection', message);
                    this.addToCollection(message.filePath);
                    handled = true;
                    break;
            }
            
            if (!handled) {
                debugLog_7ree('SearchFile', '[SearchFileManager] Message not handled, passing to original handler for:', message.command);
                originalHandleMessage(message);
            } else {
                debugLog_7ree('SearchFile', '[SearchFileManager] Message handled:', message.command);
            }
        };
        
        debugLog_7ree('SearchFile', '已注册WebView消息处理函数');
    }

    /**
     * 注册编辑器事件监听
     */
    registerEditorListeners() {
        // 监听活动编辑器变化
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                const filePath = editor.document.uri.fsPath;
                this.activeFilePath = filePath;
                this.highlightActiveFile();
            }
        });
        
        debugLog_7ree('SearchFile', '已注册编辑器事件监听');
    }

    /**
     * 打开文件
     * @param {string} filePath 文件路径
     */
    async openFile(filePath) {
        try {
            debugLog_7ree('SearchFile', `打开文件: ${filePath}`);
            
            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                throw new Error(`文件不存在: ${filePath}`);
            }
            
            // 判断是否是文件夹
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                // 如果是文件夹，则打开路径
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(filePath));
                return;
            }
            
            // 打开文本文档
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
            
            // 更新当前活动文件路径
            this.activeFilePath = filePath;
            this.highlightActiveFile();
        } catch (error) {
            debugLog_7ree('SearchFile', '打开文件失败', error);
            vscode.window.showErrorMessage(`无法打开文件: ${error.message}`);
        }
    }

    /**
     * 在侧边打开文件
     * @param {string} filePath 文件路径
     */
    async openFileBeside_7ree(filePath) {
        try {
            debugLog_7ree('SearchFile', `侧边打开文件: ${filePath}`);
            
            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                throw new Error(`文件不存在: ${filePath}`);
            }
            
            // 判断是否是文件夹
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                // 如果是文件夹，则打开路径
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(filePath));
                return;
            }
            
            // 在侧边打开文本文档
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
            
            debugLog_7ree('SearchFile', `成功在侧边打开文件: ${filePath}`);
        } catch (error) {
            debugLog_7ree('SearchFile', '侧边打开文件失败', error);
            vscode.window.showErrorMessage(`无法在侧边打开文件: ${error.message}`);
        }
    }

    /**
     * 高亮当前活动文件
     */
    highlightActiveFile() {
        if (this.activeFilePath) {
            // 发送高亮消息到WebView
            this.webviewManager.postMessage({
                command: 'highlightFile',
                filePath: this.activeFilePath
            });
            
            debugLog_7ree('SearchFile', `高亮文件: ${this.activeFilePath}`);
        }
    }

    /**
     * 添加文件到收藏列表
     * @param {string} filePath 文件路径
     */
    addToCollection(filePath) {
        // 通过WebView管理器转发到收藏项管理器
        this.webviewManager.handleMessage({
            command: 'addToCollection',
            filePath: filePath,
            name: path.basename(filePath)
        });
        
        debugLog_7ree('SearchFile', `添加文件到收藏: ${filePath}`);
    }
}

module.exports = SearchFileManager;