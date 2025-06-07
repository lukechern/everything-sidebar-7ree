/**
 * Everything Sidebar 7ree 搜索列表模块
 * 负责渲染搜索结果列表和处理用户交互
 */

const vscode = require('vscode');
const path = require('path');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * 搜索列表管理类
 */
class SearchListManager {
    /**
     * 构造函数
     * @param {Object} webviewManager WebView管理器实例
     * @param {Object} apiManager API管理器实例
     */
    constructor(webviewManager, apiManager) {
        this.webviewManager = webviewManager;
        this.apiManager = apiManager;
        this.lastSearchKeyword = '';
        this.searchTimeout = null;
        this.searchDelay = 300; // 搜索延迟，避免频繁请求
        this.currentResults = [];
        
        debugLog_7ree('SearchList', '模块加载完成');
    }

    /**
     * 初始化搜索列表
     */
    initialize() {
        // 注册WebView消息处理
        this.registerMessageHandlers();
        debugLog_7ree('SearchList', '搜索列表已初始化');
    }

    /**
     * 注册WebView消息处理函数
     */
    registerMessageHandlers() {
        // 扩展WebViewManager的消息处理
        const originalHandleMessage = this.webviewManager.handleMessage.bind(this.webviewManager);
        
        this.webviewManager.handleMessage = (message) => {
            debugLog_7ree('SearchList', '[SearchListManager] Received message', message);
            let handled = false;
            switch (message.command) {
                case 'search':
                    debugLog_7ree('SearchList', '[SearchListManager] Handling search', message);
                    this.handleSearch(message.keyword);
                    handled = true;
                    break;
                case 'openFile':
                    debugLog_7ree('SearchList', '[SearchListManager] Handling openFile', message);
                    this.handleOpenFile(message.filePath);
                    handled = true;
                    break;
                case 'openFileBeside':
                    debugLog_7ree('SearchList', '[SearchListManager] Handling openFileBeside', message);
                    this.handleOpenFileBeside_7ree(message.filePath);
                    handled = true;
                    break;
                case 'addToCollection':
                    debugLog_7ree('SearchList', '[SearchListManager] Handling addToCollection', message);
                    this.handleAddToCollection(message.filePath);
                    handled = true;
                    break;
                case 'copyPath':
                    debugLog_7ree('SearchList', '[SearchListManager] Handling copyPath', message);
                    this.handleCopyPath(message.filePath);
                    handled = true;
                    break;
                case 'revealInExplorer':
                    debugLog_7ree('SearchList', '[SearchListManager] Handling revealInExplorer', message);
                    this.handleRevealInExplorer(message.filePath);
                    handled = true;
                    break;
            }
            
            if (!handled) {
                debugLog_7ree('SearchList', '[SearchListManager] Message not handled, passing to original handler for:', message.command);
                originalHandleMessage(message);
            } else {
                debugLog_7ree('SearchList', '[SearchListManager] Message handled:', message.command);
            }
        };
        
        debugLog_7ree('SearchList', '已注册WebView消息处理函数');
    }

    /**
     * 处理搜索请求
     * @param {string} keyword 搜索关键词
     */
    handleSearch(keyword) {
        // 保存最后搜索关键词
        this.lastSearchKeyword = keyword;
        
        // 清除之前的搜索超时
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // 如果关键词为空，清空搜索结果
        if (!keyword || !keyword.trim()) {
            this.updateSearchResults([]);
            return;
        }
        
        // 设置搜索延迟，避免频繁请求
        this.searchTimeout = setTimeout(() => {
            this.performSearch(keyword.trim());
        }, this.searchDelay);
    }

    /**
     * 执行搜索
     * @param {string} keyword 搜索关键词
     */
    async performSearch(keyword) {
        try {
            debugLog_7ree('SearchList', `执行搜索: ${keyword}`);
            
            // 获取搜索选项
            const searchOptions = {};
            
            // 如果是工作区搜索，添加工作区路径
            const searchScope = this.apiManager.settingManager.getSetting('searchScope');
            if (searchScope === 'workspace') {
                // 获取当前工作区路径
                const vscode = require('vscode');
                if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                    searchOptions.workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                    searchOptions.searchScope = 'workspace';
                }
            }
            
            // 调用API执行搜索
            const result = await this.apiManager.search(keyword, searchOptions);
            
            // 保存当前搜索结果
            this.currentResults = result.results || [];
            
            // 更新搜索结果
            this.updateSearchResults(this.currentResults);
            
        } catch (error) {
            debugLog_7ree('SearchList', '搜索失败', error);
            
            // 发送错误消息到WebView
            this.webviewManager.postMessage({
                command: 'searchError',
                error: error.message
            });
        }
    }

    /**
     * 更新搜索结果
     * @param {Array} results 搜索结果数组
     */
    updateSearchResults(results) {
        // 发送搜索结果到WebView
        this.webviewManager.postMessage({
            command: 'searchResults',
            results: results
        });
        
        debugLog_7ree('SearchList', `更新搜索结果: ${results.length}个结果`);
    }

    /**
     * 处理打开文件
     * @param {string} filePath 文件路径
     */
    async handleOpenFile(filePath) {
        try {
            debugLog_7ree('SearchList', `尝试打开文件: ${filePath}`);
            
            // 检查路径是否存在
            const uri = vscode.Uri.file(filePath);
            
            // 检查是否为目录
            let stat;
            try {
                stat = await vscode.workspace.fs.stat(uri);
            } catch (statError) {
                debugLog_7ree('SearchList', '文件不存在或无法访问', statError);
                vscode.window.showErrorMessage(`文件不存在或无法访问: ${filePath}`);
                return;
            }
            
            // 如果是目录，打开路径
            if (stat.type === vscode.FileType.Directory) {
                debugLog_7ree('SearchList', '这是一个目录，打开路径');
                await vscode.commands.executeCommand('revealFileInOS', uri);
                return;
            }
            
            // 如果是文件，尝试在 VS Code 主编辑器中打开
            debugLog_7ree('SearchList', '正在在主编辑器中打开文件...');
            
            try {
                // 尝试打开文本文档
                const document = await vscode.workspace.openTextDocument(uri);
                
                // 在主编辑器中打开，不使用预览模式
                await vscode.window.showTextDocument(document, {
                    preview: false, // 不使用预览模式
                    viewColumn: vscode.ViewColumn.Active, // 在当前活动的编辑器组中打开
                    preserveFocus: false // 聚焦到打开的文档
                });
                
                debugLog_7ree('SearchList', '文件在主编辑器中打开成功');
                
                // 高亮当前文件
                this.highlightFile(filePath);
                
            } catch (openError) {
                debugLog_7ree('SearchList', '无法作为文本文档打开，尝试使用默认程序', openError);
                
                // 如果无法作为文本文档打开，使用系统默认程序
                await vscode.env.openExternal(uri);
            }
            
        } catch (error) {
            debugLog_7ree('SearchList', '打开文件失败', error);
            vscode.window.showErrorMessage(`无法打开文件: ${error.message}`);
        }
    }

    /**
     * 处理在侧边打开文件
     * @param {string} filePath 文件路径
     */
    async handleOpenFileBeside_7ree(filePath) {
        try {
            debugLog_7ree('SearchList', `尝试在侧边打开文件: ${filePath}`);
            
            // 检查路径是否存在
            const uri = vscode.Uri.file(filePath);
            
            // 检查是否为目录
            let stat;
            try {
                stat = await vscode.workspace.fs.stat(uri);
            } catch (statError) {
                debugLog_7ree('SearchList', '文件不存在或无法访问', statError);
                vscode.window.showErrorMessage(`文件不存在或无法访问: ${filePath}`);
                return;
            }
            
            // 如果是目录，打开路径
            if (stat.type === vscode.FileType.Directory) {
                debugLog_7ree('SearchList', '这是一个目录，打开路径');
                await vscode.commands.executeCommand('revealFileInOS', uri);
                return;
            }
            
            // 如果是文件，尝试在侧边编辑器中打开
            debugLog_7ree('SearchList', '正在在侧边编辑器中打开文件...');
            
            try {
                // 尝试打开文本文档
                const document = await vscode.workspace.openTextDocument(uri);
                
                // 在侧边编辑器中打开
                await vscode.window.showTextDocument(document, {
                    preview: false, // 不使用预览模式
                    viewColumn: vscode.ViewColumn.Beside, // 在侧边编辑器组中打开
                    preserveFocus: false // 聚焦到打开的文档
                });
                
                debugLog_7ree('SearchList', '文件在侧边编辑器中打开成功');
                
            } catch (openError) {
                debugLog_7ree('SearchList', '无法作为文本文档在侧边打开，尝试使用默认程序', openError);
                
                // 如果无法作为文本文档打开，使用系统默认程序
                await vscode.env.openExternal(uri);
            }
            
        } catch (error) {
            debugLog_7ree('SearchList', '在侧边打开文件失败', error);
            vscode.window.showErrorMessage(`无法在侧边打开文件: ${error.message}`);
        }
    }

    /**
     * 处理添加到收藏
     * @param {string} filePath 文件路径
     */
    handleAddToCollection(filePath) {
        debugLog_7ree('SearchList', `添加到收藏: ${filePath}`);
        
        // 通过WebView管理器转发到收藏项管理器
        this.webviewManager.handleMessage({
            command: 'addToCollection',
            filePath: filePath,
            name: path.basename(filePath)
        });
    }

    /**
     * 处理复制路径
     * @param {string} filePath 文件路径
     */
    async handleCopyPath(filePath) {
        try {
            debugLog_7ree('SearchList', `复制完整文件路径: ${filePath}`);
            
            // 确保复制的是完整的文件路径
            const fullPath = path.resolve(filePath);
            
            // 复制到剪贴板
            await vscode.env.clipboard.writeText(fullPath);
            vscode.window.showInformationMessage(`路径已复制到剪贴板: ${path.basename(fullPath)}`);
            
            debugLog_7ree('SearchList', `已复制路径: ${fullPath}`);
            
        } catch (error) {
            debugLog_7ree('SearchList', '复制路径失败', error);
            vscode.window.showErrorMessage(`复制路径失败: ${error.message}`);
        }
    }

    /**
     * 处理打开路径
     * @param {string} filePath 文件路径
     */
    async handleRevealInExplorer(filePath) {
        try {
            debugLog_7ree('SearchList', `打开路径文件: ${filePath}`);
            
            // 确保使用完整路径
            const fullPath = path.resolve(filePath);
            const uri = vscode.Uri.file(fullPath);
            
            // 检查是否为文件
            let stat;
            try {
                stat = await vscode.workspace.fs.stat(uri);
            } catch (statError) {
                debugLog_7ree('SearchList', '文件不存在，无法打开路径', statError);
                vscode.window.showErrorMessage(`文件不存在: ${fullPath}`);
                return;
            }
            
            if (stat.type === vscode.FileType.Directory) {
                // 如果是目录，直接显示该目录
                debugLog_7ree('SearchList', '显示目录');
                await vscode.commands.executeCommand('revealFileInOS', uri);
            } else {
                // 如果是文件，显示文件所在的目录并选中该文件
                debugLog_7ree('SearchList', '显示文件所在目录并选中文件');
                await vscode.commands.executeCommand('revealFileInOS', uri);
            }
            
        } catch (error) {
            debugLog_7ree('SearchList', '打开路径失败', error);
            vscode.window.showErrorMessage(`无法打开路径: ${error.message}`);
        }
    }

    /**
     * 高亮指定文件
     * @param {string} filePath 文件路径
     */
    highlightFile(filePath) {
        this.webviewManager.postMessage({
            command: 'highlightFile',
            filePath: filePath
        });
    }

    /**
     * 重新执行最后一次搜索
     */
    refreshSearch() {
        if (this.lastSearchKeyword) {
            this.performSearch(this.lastSearchKeyword);
        }
    }

    /**
     * 获取当前搜索结果
     * @returns {Array} 当前搜索结果
     */
    getCurrentResults() {
        return this.currentResults;
    }

    /**
     * 清空搜索结果
     */
    clearResults() {
        this.currentResults = [];
        this.lastSearchKeyword = '';
        this.updateSearchResults([]);
    }
}

module.exports = SearchListManager;