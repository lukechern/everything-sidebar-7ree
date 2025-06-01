/**
 * Everything Sidebar 7ree 插件主入口文件
 * 负责注册命令、创建侧边栏视图、加载WebView等基础功能
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// 引入调试模块
const { debugLog_7ree, setDebugEnabled, getDebugEnabled } = require('./src/debug_7ree');

// 引入其他模块
const WebViewManager = require('./src/webview_7ree');
const SettingManager = require('./src/setting_7ree');
const TestManager = require('./src/test_7ree');
const ApiManager = require('./src/api_7ree');
const SearchListManager = require('./src/search_list_7ree');
const SearchFileManager = require('./src/search_file_7ree');
const CollectionTreeManager = require('./src/collection_tree_7ree');
const CollectionItemManager = require('./src/collection_item_7ree');
const NoticeManager = require('./src/notice_7ree');
const { getWebviewResourceUris_7ree } = require('./src/webview_util_7ree');

/**
 * 插件激活时执行的函数
 * @param {vscode.ExtensionContext} context 插件上下文
 */
function activate(context) {
    // 初始化调试模块
    debugLog_7ree('Extension', 'Everything Sidebar 7ree 插件已激活');
    debugLog_7ree('Debug', '调试模块加载完成');
    
    // 初始化设置管理器
    const settingManager = new SettingManager(context);
    
    // 初始化API管理器
    const apiManager = new ApiManager(settingManager);
    
    // 初始化通知管理器
    const noticeManager = new NoticeManager();
    noticeManager.initialize(context);
    
    // 初始化各个模块
    debugLog_7ree('WebView', 'WebView管理模块加载完成');
    debugLog_7ree('Setting', '设置管理模块加载完成');
    debugLog_7ree('Test', '测试管理模块加载完成');
    debugLog_7ree('Api', 'API管理模块加载完成');
    debugLog_7ree('SearchList', '搜索列表管理模块加载完成');
    debugLog_7ree('SearchFile', '搜索文件管理模块加载完成');
    debugLog_7ree('CollectionTree', '收藏树管理模块加载完成');
    debugLog_7ree('CollectionItem', '收藏项管理模块加载完成');
    debugLog_7ree('Notice', '通知管理模块加载完成');

    // 注册显示侧边栏命令
    const showSidebarCommand = vscode.commands.registerCommand('everything-sidebar-7ree.showSidebar', () => {
        vscode.commands.executeCommand('workbench.view.extension.everything-sidebar-7ree');
    });
    context.subscriptions.push(showSidebarCommand);

    // 创建侧边栏WebView视图提供者
    const provider = new EverythingSidebarViewProvider(context.extensionUri, settingManager, apiManager, context, noticeManager);
    
    // 预初始化收藏管理器，以便在WebView未初始化时也能处理收藏添加
    provider.preInitializeCollectionManager_7ree();

    // 注册添加到收藏夹命令
    const addToFavoritesCommand = vscode.commands.registerCommand('everything-sidebar-7ree.addToFavorites', async (uri) => {
        try {
            debugLog_7ree('Extension', '[addToFavorites] 收到添加收藏请求', uri);
            
            if (!uri) {
                vscode.window.showErrorMessage('无法获取文件路径');
                return;
            }

            const filePath = uri.fsPath;
            const fileName = path.basename(filePath);
            const isDirectory = fs.statSync(filePath).isDirectory();
            
            debugLog_7ree('Extension', '[addToFavorites] 文件信息', {
                filePath: filePath,
                fileName: fileName,
                isDirectory: isDirectory
            });

            // 检查WebView是否已初始化
            if (provider.webviewView && provider.webviewView.webview) {
                // WebView已初始化，直接发送消息
                provider.webviewView.webview.postMessage({
                    command: 'addToFavorites_7ree',
                    filePath: filePath,
                    fileName: fileName,
                    isDirectory: isDirectory
                });
                
                debugLog_7ree('Extension', '[addToFavorites] 已发送添加收藏消息到WebView');
                vscode.window.showInformationMessage(`已添加 "${fileName}" 到收藏夹`);
            } else {
                // WebView未初始化，直接通过后端处理收藏添加
                debugLog_7ree('Extension', '[addToFavorites] WebView未初始化，直接通过后端处理');
                
                try {
                    // 直接调用收藏管理器添加收藏
                    if (provider.collectionItemManager) {
                        await provider.collectionItemManager.addToCollection({
                            filePath: filePath,
                            fileName: fileName,
                            isDirectory: isDirectory
                        });
                        
                        vscode.window.showInformationMessage(`已添加 "${fileName}" 到收藏夹`);
                        debugLog_7ree('Extension', '[addToFavorites] 通过后端成功添加收藏');
                    } else {
                        // 如果收藏管理器也未初始化，则缓存请求
                        provider.addPendingFavoriteRequest_7ree({
                            filePath: filePath,
                            fileName: fileName,
                            isDirectory: isDirectory
                        });
                        
                        vscode.window.showInformationMessage(`已添加 "${fileName}" 到收藏夹（后台处理中）`);
                        debugLog_7ree('Extension', '[addToFavorites] 收藏管理器未初始化，已缓存请求');
                    }
                } catch (error) {
                    debugLog_7ree('Extension', '[addToFavorites] 后端处理失败，缓存请求', error);
                    
                    // 后端处理失败，缓存请求
                    provider.addPendingFavoriteRequest_7ree({
                        filePath: filePath,
                        fileName: fileName,
                        isDirectory: isDirectory
                    });
                    
                    vscode.window.showInformationMessage(`已添加 "${fileName}" 到收藏夹（后台处理中）`);
                }
            }
        } catch (error) {
            debugLog_7ree('Extension', '[addToFavorites] 添加收藏失败', error);
            vscode.window.showErrorMessage(`添加收藏失败: ${error.message}`);
        }
    });
    context.subscriptions.push(addToFavoritesCommand);

    // 注册用Everything搜索命令
    const searchWithEverythingCommand = vscode.commands.registerCommand('everything-sidebar-7ree.searchWithEverything', async () => {
        try {
            debugLog_7ree('Extension', '[searchWithEverything] 收到搜索请求');
            
            // 获取当前活动编辑器
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('没有活动的编辑器');
                return;
            }

            // 获取选中的文本
            const selection = activeEditor.selection;
            const selectedText = activeEditor.document.getText(selection);
            
            if (!selectedText || selectedText.trim() === '') {
                vscode.window.showErrorMessage('请先选择要搜索的文本');
                return;
            }

            debugLog_7ree('Extension', '[searchWithEverything] 选中的文本', selectedText);

            // 打开Everything侧边栏
            await vscode.commands.executeCommand('workbench.view.extension.everything-sidebar-7ree');

            // 发送搜索请求到WebView
            if (provider.webviewView && provider.webviewView.webview) {
                provider.webviewView.webview.postMessage({
                    command: 'searchWithText_7ree',
                    searchText: selectedText.trim()
                });
                
                debugLog_7ree('Extension', '[searchWithEverything] 已发送搜索请求到WebView');
                vscode.window.showInformationMessage(`正在搜索: "${selectedText.trim()}"`);
            } else {
                // WebView未初始化，缓存搜索请求
                debugLog_7ree('Extension', '[searchWithEverything] WebView未初始化，缓存搜索请求');
                
                provider.addPendingSearchRequest_7ree(selectedText.trim());
                vscode.window.showInformationMessage(`正在打开Everything侧边栏并搜索: "${selectedText.trim()}"`);
            }
        } catch (error) {
            debugLog_7ree('Extension', '[searchWithEverything] 搜索失败', error);
            vscode.window.showErrorMessage(`搜索失败: ${error.message}`);
        }
    });
    context.subscriptions.push(searchWithEverythingCommand);
    
    // 注册WebView视图提供者
    const view = vscode.window.registerWebviewViewProvider(
        'everythingSidebar7ree',
        provider,
        {
            webviewOptions: { retainContextWhenHidden: true }
        }
    );
    context.subscriptions.push(view);
}

/**
 * 侧边栏WebView视图提供者类
 */
class EverythingSidebarViewProvider {
    /**
     * 构造函数
     * @param {vscode.Uri} extensionUri 插件URI
     * @param {Object} settingManager 设置管理器
     * @param {Object} apiManager API管理器
     * @param {vscode.ExtensionContext} context 插件上下文
     * @param {Object} noticeManager 通知管理器
     */
    constructor(extensionUri, settingManager, apiManager, context, noticeManager) {
        this.extensionUri = extensionUri;
        this.settingManager = settingManager;
        this.apiManager = apiManager;
        this.context = context;
        this.noticeManager = noticeManager;
        this.webviewManager = null;
        this.searchListManager = null;
        this.searchFileManager = null;
        this.collectionTreeManager = null;
        this.collectionItemManager = null;
        this._messageListener_7ree = null;
        this._lastProcessedMessages_7ree = new Map();
        this._messageDedupeWindow_7ree = 1000;
        this._pendingFavoriteRequests_7ree = []; // 待处理的收藏请求
        this._pendingSearchRequests_7ree = []; // 待处理的搜索请求
        this._currentStatusBarMessage = null; // 当前状态栏消息
    }

    /**
     * 解析WebView
     * @param {vscode.WebviewView} webviewView WebView视图
     */
    resolveWebviewView(webviewView) {
        debugLog_7ree('Extension', '[EverythingSidebarViewProvider] resolveWebviewView CALLED');
        this.webviewView = webviewView;

        // 设置WebView选项
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        // 创建WebView管理器
        this.webviewManager = new WebViewManager({ extensionUri: this.extensionUri });
        this.webviewManager.initialize(webviewView);
        
        // 创建搜索文件管理器（最底层）
        this.searchFileManager = new SearchFileManager(this.webviewManager);
        this.searchFileManager.initialize();
        
        // 创建搜索列表管理器
        this.searchListManager = new SearchListManager(this.webviewManager, this.apiManager);
        this.searchListManager.initialize();
        
                    // 创建或更新收藏管理器
            if (!this.collectionTreeManager) {
                this.collectionTreeManager = new CollectionTreeManager(this.webviewManager);
                this.collectionTreeManager.initialize();
            } else {
                // 更新已存在的收藏树管理器的WebView引用
                this.collectionTreeManager.webviewManager = this.webviewManager;
                this.collectionTreeManager.registerMessageHandlers();
            }
            
            if (!this.collectionItemManager) {
                this.collectionItemManager = new CollectionItemManager(this.webviewManager, this.collectionTreeManager, this.noticeManager);
                this.collectionItemManager.initialize(this.context);
            } else {
                // 更新已存在的收藏项管理器的WebView引用
                this.collectionItemManager.webviewManager = this.webviewManager;
                this.collectionItemManager.noticeManager = this.noticeManager;
                this.collectionItemManager.registerMessageHandlers();
            }

        // 加载HTML内容
        webviewView.webview.html = this._getHtmlContent(webviewView.webview);

        // 设置主消息处理器
        this._setupMainMessageHandler(webviewView);
        
        // 处理待处理的收藏请求
        this._processPendingFavoriteRequests_7ree();
        
        // 处理待处理的搜索请求
        this._processPendingSearchRequests_7ree();
    }
    
    /**
     * 检查消息是否为重复消息
     * @param {Object} message 消息对象
     * @returns {boolean} 是否为重复消息
     */
    _isDuplicateMessage_7ree(message) {
        const now = Date.now();
        
        // 对于 createCollectionFolder 消息，使用命令和名称作为key，忽略其他可能变化的字段
        let messageKey;
        if (message.command === 'createCollectionFolder') {
            messageKey = `createCollectionFolder:${message.name}`;
            // 对于创建文件夹操作，使用更短的去重窗口（500毫秒）
            const dedupeWindow = 500;
            const lastProcessedTime = this._lastProcessedMessages_7ree.get(messageKey);
            
            if (lastProcessedTime && (now - lastProcessedTime) < dedupeWindow) {
                debugLog_7ree('Extension', '[EverythingSidebarViewProvider] Duplicate createCollectionFolder message detected and ignored:', message);
                return true;
            }
            
            this._lastProcessedMessages_7ree.set(messageKey, now);
            debugLog_7ree('Extension', '[EverythingSidebarViewProvider] Processing createCollectionFolder message:', message);
            return false;
        } else {
            // 对于其他消息，使用完整的JSON作为key
            messageKey = JSON.stringify(message);
            const lastProcessedTime = this._lastProcessedMessages_7ree.get(messageKey);
            
            if (lastProcessedTime && (now - lastProcessedTime) < this._messageDedupeWindow_7ree) {
                debugLog_7ree('Extension', '[EverythingSidebarViewProvider] Duplicate message detected and ignored:', message);
                return true;
            }
            
            this._lastProcessedMessages_7ree.set(messageKey, now);
        }
        
        // 清理过期的消息记录
        for (const [key, time] of this._lastProcessedMessages_7ree.entries()) {
            if (now - time > this._messageDedupeWindow_7ree) {
                this._lastProcessedMessages_7ree.delete(key);
            }
        }
        
        return false;
    }

    /**
     * 设置主消息处理器
     * @param {vscode.WebviewView} webviewView WebView视图
     */
    _setupMainMessageHandler(webviewView) {
        debugLog_7ree('Extension', '[EverythingSidebarViewProvider] _setupMainMessageHandler CALLED');

        // 新增：移除任何已存在的监听器
        if (this._messageListener_7ree) {
            debugLog_7ree('Extension', '[EverythingSidebarViewProvider] Disposing of previous message listener_7ree.');
            this._messageListener_7ree.dispose();
            this._messageListener_7ree = null;
        }

        // 保存原始的WebView管理器处理函数
        const originalWebViewHandler = this.webviewManager.handleMessage.bind(this.webviewManager);
        
        // 覆盖WebView管理器的处理函数，添加主扩展的消息处理
        this.webviewManager.handleMessage = async (message) => {
            debugLog_7ree('WebView', '[EXTENSION] Received WebView message in main handler', message);
            
            // 先处理主扩展级别的消息
            let handled = false;
            switch (message.command) {
                case 'init':
                    debugLog_7ree('WebView', 'WebView初始化完成');
                    
                    // 发送调试消息回WebView
                    webviewView.webview.postMessage({
                        command: 'debug',
                        text: '扩展与WebView通信测试成功'
                    });
                    debugLog_7ree('WebView', '已发送调试消息到WebView');
                    
                    // 发送当前工作区路径
                    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                        webviewView.webview.postMessage({
                            command: 'workspacePath',
                            workspacePath: workspacePath
                        });
                        debugLog_7ree('WebView', '已发送工作区路径到WebView: ' + workspacePath);
                    }
                    
                    // 发送当前搜索范围
                    const currentSearchScope = this.settingManager.getSetting('searchScope');
                    webviewView.webview.postMessage({
                        command: 'searchScopeChanged',
                        searchScope: currentSearchScope
                    });
                    debugLog_7ree('WebView', '已发送搜索范围到WebView: ' + currentSearchScope);
                    
                    handled = true;
                    break;
                    
                case 'getWorkspacePath':
                    // 获取当前工作区路径并发送到WebView
                    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                        webviewView.webview.postMessage({
                            command: 'workspacePath',
                            workspacePath: workspacePath
                        });
                        debugLog_7ree('WebView', '已发送工作区路径到WebView: ' + workspacePath);
                    } else {
                        webviewView.webview.postMessage({
                            command: 'workspacePath',
                            workspacePath: null
                        });
                        debugLog_7ree('WebView', '没有打开的工作区');
                    }
                    handled = true;
                    break;
                    
                case 'getSettings':
                    // 获取当前设置并发送到WebView
                    const currentSettings = this.settingManager.getAllSettings();
                    webviewView.webview.postMessage({
                        command: 'settingsData',
                        settings: currentSettings
                    });
                    debugLog_7ree('Setting', '已发送设置数据到WebView', currentSettings);
                    handled = true;
                    break;
                    
                case 'saveSettings':
                    try {
                        // 保存设置
                        const newSettings = message.settings;
                        const oldSearchScope = this.settingManager.getSetting('searchScope');
                        
                        for (const [key, value] of Object.entries(newSettings)) {
                            await this.settingManager.updateSetting(key, value);
                        }
                        
                        // 发送保存成功消息
                        webviewView.webview.postMessage({
                            command: 'settingsSaved',
                            settings: newSettings
                        });
                        debugLog_7ree('Setting', '设置保存成功', newSettings);
                        
                        // 如果搜索范围发生变化，通知前端
                        if (newSettings.searchScope && newSettings.searchScope !== oldSearchScope) {
                            webviewView.webview.postMessage({
                                command: 'searchScopeChanged',
                                searchScope: newSettings.searchScope
                            });
                            debugLog_7ree('WebView', '搜索范围已更新: ' + newSettings.searchScope);
                        }
                    } catch (error) {
                        debugLog_7ree('Setting', '设置保存失败', error);
                        webviewView.webview.postMessage({
                            command: 'settingsError',
                            error: error.message
                        });
                    }
                    handled = true;
                    break;
                    
                case 'testConnection':
                    try {
                        // 测试连接
                        const success = await this.apiManager.testConnection(message.port);
                        webviewView.webview.postMessage({
                            command: 'testConnectionResult',
                            success: true
                        });
                        debugLog_7ree('API', '连接测试成功');
                    } catch (error) {
                        webviewView.webview.postMessage({
                            command: 'testConnectionResult',
                            success: false,
                            error: error.message
                        });
                        debugLog_7ree('API', '连接测试失败', error);
                    }
                    handled = true;
                    break;
                    
                case 'openExternalEverything_7ree':
                    try {
                        // 打开外部Everything程序
                        this._openExternalEverything_7ree();
                        debugLog_7ree('Extension', '已打开外部Everything程序');
                    } catch (error) {
                        debugLog_7ree('Extension', '打开外部Everything程序失败', error);
                        vscode.window.showErrorMessage(`打开Everything程序失败: ${error.message}`);
                    }
                    handled = true;
                    break;
                    
                case 'searchInExternalEverything_7ree':
                    try {
                        // 在外部Everything程序中搜索
                        this._searchInExternalEverything_7ree(message.keyword);
                        debugLog_7ree('Extension', '已在外部Everything程序中搜索: ' + message.keyword);
                    } catch (error) {
                        debugLog_7ree('Extension', '在外部Everything程序中搜索失败', error);
                        vscode.window.showErrorMessage(`在Everything程序中搜索失败: ${error.message}`);
                    }
                    handled = true;
                    break;
                    
                case 'showStatusBarMessage':
                    try {
                        // 在状态栏显示消息
                        const timeout = message.timeout || 5000;
                        if (timeout === 0) {
                            // 持续显示，不自动隐藏
                            this._currentStatusBarMessage = vscode.window.setStatusBarMessage(message.message);
                        } else {
                            // 自动隐藏
                            vscode.window.setStatusBarMessage(message.message, timeout);
                        }
                        debugLog_7ree('Extension', '已在状态栏显示消息: ' + message.message);
                    } catch (error) {
                        debugLog_7ree('Extension', '状态栏显示消息失败', error);
                    }
                    handled = true;
                    break;
                    
                case 'hideStatusBarMessage':
                    try {
                        // 隐藏状态栏消息
                        if (this._currentStatusBarMessage) {
                            this._currentStatusBarMessage.dispose();
                            this._currentStatusBarMessage = null;
                        }
                        debugLog_7ree('Extension', '已隐藏状态栏消息');
                    } catch (error) {
                        debugLog_7ree('Extension', '隐藏状态栏消息失败', error);
                    }
                    handled = true;
                    break;
            }
            
            // 如果没有被处理，调用原始处理函数
            if (!handled) {
                debugLog_7ree('WebView', '[EXTENSION] Message not handled by main, passing to chained handler for:', message.command);
                originalWebViewHandler(message);
            } else {
                debugLog_7ree('WebView', '[EXTENSION] Message handled by main:', message.command);
            }
        };
        
        // 处理WebView消息
        this._messageListener_7ree = webviewView.webview.onDidReceiveMessage(message => {
            debugLog_7ree('WebView', '[EXTENSION] Raw message from webview.onDidReceiveMessage', message);
            debugLog_7ree('WebView', '[EXTENSION] Message timestamp:', new Date().toISOString());
            
            // 新增：检查是否为重复消息
            if (this._isDuplicateMessage_7ree(message)) {
                debugLog_7ree('WebView', '[EXTENSION] Message ignored due to deduplication');
                return; // 忽略重复消息
            }
            
            debugLog_7ree('WebView', '[EXTENSION] Message passed deduplication, forwarding to handler');
            // 委托给WebView管理器处理
            if (this.webviewManager) {
                this.webviewManager.handleMessage(message);
            }
        });
    }

    /**
     * 获取HTML内容
     * @param {vscode.Webview} webview WebView实例
     * @returns {string} HTML内容
     */
    _getHtmlContent(webview) {
        // 获取资源路径映射
        const uris_7ree = getWebviewResourceUris_7ree(webview, this.extensionUri, 'sidebar');

        // 获取sidebar_7ree.html路径
        const sidebarHtmlPath = vscode.Uri.joinPath(this.extensionUri, 'ui', 'sidebar_7ree.html');

        // 读取sidebar.html文件内容
        let htmlContent;
        try {
            htmlContent = fs.readFileSync(sidebarHtmlPath.fsPath, 'utf8');
            debugLog_7ree('WebView', '成功加载sidebar_7ree.html文件');
        } catch (error) {
            debugLog_7ree('WebView', '加载sidebar_7ree.html文件失败', error);
            // 加载失败时返回简单的HTML内容
            return `
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Everything Sidebar</title>
                </head>
                <body>
                    <h3>Everything Sidebar 7ree</h3>
                    <p>加载界面失败，请检查控制台日志。</p>
                    <script>
                        console.error('加载sidebar_7ree.html文件失败');
                    </script>
                </body>
                </html>
            `;
        }

        // 替换模板变量
        for (const [key, value] of Object.entries(uris_7ree)) {
            htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        return htmlContent;
    }

    /**
     * 添加待处理的收藏请求
     * @param {Object} request 收藏请求对象
     */
    addPendingFavoriteRequest_7ree(request) {
        this._pendingFavoriteRequests_7ree.push(request);
        debugLog_7ree('Extension', '[addPendingFavoriteRequest] 已添加待处理收藏请求', request);
    }

    /**
     * 添加待处理的搜索请求
     * @param {string} searchText 搜索文本
     */
    addPendingSearchRequest_7ree(searchText) {
        this._pendingSearchRequests_7ree.push(searchText);
        debugLog_7ree('Extension', '[addPendingSearchRequest] 已添加待处理搜索请求', searchText);
    }

    /**
     * 预初始化收藏管理器（不依赖WebView）
     */
    preInitializeCollectionManager_7ree() {
        try {
            debugLog_7ree('Extension', '[preInitializeCollectionManager] 开始预初始化收藏管理器');
            
            // 创建收藏树管理器
            this.collectionTreeManager = new CollectionTreeManager(null); // 传入null因为WebView还未初始化
            this.collectionTreeManager.initialize();
            
            // 创建收藏项管理器
            this.collectionItemManager = new CollectionItemManager(null, this.collectionTreeManager, this.noticeManager);
            this.collectionItemManager.initialize(this.context);
            
            debugLog_7ree('Extension', '[preInitializeCollectionManager] 收藏管理器预初始化完成');
        } catch (error) {
            debugLog_7ree('Extension', '[preInitializeCollectionManager] 预初始化失败', error);
        }
    }

    /**
     * 处理待处理的收藏请求
     */
    _processPendingFavoriteRequests_7ree() {
        if (this._pendingFavoriteRequests_7ree.length === 0) {
            return;
        }

        debugLog_7ree('Extension', '[processPendingFavoriteRequests] 开始处理待处理的收藏请求', {
            count: this._pendingFavoriteRequests_7ree.length
        });

        // 延迟处理，确保WebView完全初始化
        setTimeout(() => {
            if (this.webviewView && this.webviewView.webview) {
                // 处理所有待处理的请求
                this._pendingFavoriteRequests_7ree.forEach((request, index) => {
                    debugLog_7ree('Extension', `[processPendingFavoriteRequests] 处理第${index + 1}个请求`, request);
                    
                    this.webviewView.webview.postMessage({
                        command: 'addToFavorites_7ree',
                        filePath: request.filePath,
                        fileName: request.fileName,
                        isDirectory: request.isDirectory
                    });
                });

                // 清空待处理请求列表
                const processedCount = this._pendingFavoriteRequests_7ree.length;
                this._pendingFavoriteRequests_7ree = [];
                
                debugLog_7ree('Extension', `[processPendingFavoriteRequests] 已处理${processedCount}个待处理的收藏请求`);
                
                // 显示处理完成的提示
                if (processedCount === 1) {
                    vscode.window.showInformationMessage(`收藏添加完成`);
                } else {
                    vscode.window.showInformationMessage(`${processedCount}个收藏添加完成`);
                }
            } else {
                debugLog_7ree('Extension', '[processPendingFavoriteRequests] WebView仍未初始化，稍后重试');
                
                // 如果WebView仍未初始化，再次延迟处理
                setTimeout(() => {
                    this._processPendingFavoriteRequests_7ree();
                }, 1000);
            }
        }, 500); // 延迟500毫秒确保WebView完全初始化
    }

    /**
     * 处理待处理的搜索请求
     */
    _processPendingSearchRequests_7ree() {
        if (this._pendingSearchRequests_7ree.length === 0) {
            return;
        }

        debugLog_7ree('Extension', '[processPendingSearchRequests] 开始处理待处理的搜索请求', {
            count: this._pendingSearchRequests_7ree.length
        });

        // 延迟处理，确保WebView完全初始化
        setTimeout(() => {
            if (this.webviewView && this.webviewView.webview) {
                // 处理所有待处理的搜索请求（通常只有最后一个有效）
                const searchText = this._pendingSearchRequests_7ree[this._pendingSearchRequests_7ree.length - 1];
                
                debugLog_7ree('Extension', '[processPendingSearchRequests] 处理搜索请求', searchText);
                
                this.webviewView.webview.postMessage({
                    command: 'searchWithText_7ree',
                    searchText: searchText
                });

                // 清空待处理搜索请求列表
                const processedCount = this._pendingSearchRequests_7ree.length;
                this._pendingSearchRequests_7ree = [];
                
                debugLog_7ree('Extension', `[processPendingSearchRequests] 已处理${processedCount}个待处理的搜索请求`);
                
                // 显示处理完成的提示
                vscode.window.showInformationMessage(`正在搜索: "${searchText}"`);
            } else {
                debugLog_7ree('Extension', '[processPendingSearchRequests] WebView仍未初始化，稍后重试');
                
                // 如果WebView仍未初始化，再次延迟处理
                setTimeout(() => {
                    this._processPendingSearchRequests_7ree();
                }, 1000);
            }
        }, 500); // 延迟500毫秒确保WebView完全初始化
    }

    /**
     * 打开外部Everything程序
     */
    _openExternalEverything_7ree() {
        const { spawn } = require('child_process');
        
        try {
            // 尝试启动Everything程序
            // 常见的Everything程序路径
            const everythingPaths = [
                'C:\\Program Files\\Everything\\Everything.exe',
                'C:\\Program Files (x86)\\Everything\\Everything.exe',
                'Everything.exe' // 如果在PATH中
            ];
            
            let launched = false;
            for (const everythingPath of everythingPaths) {
                try {
                    spawn(everythingPath, [], { detached: true, stdio: 'ignore' });
                    launched = true;
                    debugLog_7ree('Extension', `成功启动Everything程序: ${everythingPath}`);
                    break;
                } catch (error) {
                    debugLog_7ree('Extension', `尝试启动Everything程序失败: ${everythingPath}`, error);
                }
            }
            
            if (!launched) {
                throw new Error('未找到Everything程序，请确保已安装Everything并添加到系统PATH中');
            }
        } catch (error) {
            debugLog_7ree('Extension', '启动Everything程序失败', error);
            throw error;
        }
    }

    /**
     * 在外部Everything程序中搜索
     * @param {string} keyword 搜索关键词
     */
    _searchInExternalEverything_7ree(keyword) {
        const { spawn } = require('child_process');
        
        try {
            // 尝试启动Everything程序并传递搜索关键词
            // Everything支持命令行参数 -s 来指定搜索关键词
            const everythingPaths = [
                'C:\\Program Files\\Everything\\Everything.exe',
                'C:\\Program Files (x86)\\Everything\\Everything.exe',
                'Everything.exe' // 如果在PATH中
            ];
            
            let launched = false;
            for (const everythingPath of everythingPaths) {
                try {
                    spawn(everythingPath, ['-s', keyword], { detached: true, stdio: 'ignore' });
                    launched = true;
                    debugLog_7ree('Extension', `成功在Everything程序中搜索: ${everythingPath} -s "${keyword}"`);
                    break;
                } catch (error) {
                    debugLog_7ree('Extension', `尝试在Everything程序中搜索失败: ${everythingPath}`, error);
                }
            }
            
            if (!launched) {
                throw new Error('未找到Everything程序，请确保已安装Everything并添加到系统PATH中');
            }
        } catch (error) {
            debugLog_7ree('Extension', '在Everything程序中搜索失败', error);
            throw error;
        }
    }
}

/**
 * 插件停用时执行的函数
 */
function deactivate() {
    debugLog_7ree('Extension', 'Everything Sidebar 7ree 插件已停用');
}

module.exports = {
    activate,
    deactivate
};