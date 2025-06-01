/**
 * Everything Sidebar 7ree 主界面JavaScript逻辑
 * 负责搜索、收藏、设置等功能的前端交互
 */

// 基本调试输出
console.log('[Everything-7ree] sidebar_main_7ree.js 开始加载');

// 等待DOM加载完成后再执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Everything-7ree] DOM 加载完成，开始初始化');
    
    // 检查调试函数是否可用
    if (typeof webviewDebugLog === 'function') {
        console.log('[Everything-7ree] webviewDebugLog 函数可用');
        webviewDebugLog('Init', '开始初始化主界面');
    } else {
        console.log('[Everything-7ree] webviewDebugLog 函数不可用');
    }
    
    // 获取DOM元素
    const searchTab = document.getElementById('search-tab');
    const collectionTab = document.getElementById('collection-tab');
    const settingsButton = document.getElementById('settings-button');
    const searchContainer = document.getElementById('search-container');
    const collectionContainer = document.getElementById('collection-container');
    const settingsContainer = document.getElementById('settings-container');
    
    // 搜索相关元素（由SearchHandler_7ree模块管理）
    
    // 收藏相关变量（由CollectionManager_7ree模块管理）
    
    // 初始化模块实例
    let dragHandler_7ree = null;
    let folderManager_7ree = null;
    let iconUtils_7ree = null;
    let pathUtils_7ree = null;
    let searchHandler_7ree = null;
    let collectionManager_7ree = null;
    let settingsManager_7ree = null;
    let contextMenuHandler_7ree = null;

    // 初始化WebView通信
    const vscode = acquireVsCodeApi();
    
    // 初始化模块
    if (window.IconUtils_7ree) {
        iconUtils_7ree = new window.IconUtils_7ree();
        webviewDebugLog('Init', 'IconUtils_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'IconUtils_7ree 模块未找到');
    }
    
    if (window.PathUtils_7ree) {
        pathUtils_7ree = new window.PathUtils_7ree(vscode);
        webviewDebugLog('Init', 'PathUtils_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'PathUtils_7ree 模块未找到');
    }
    
    if (window.DragHandler_7ree) {
        dragHandler_7ree = new window.DragHandler_7ree(vscode);
        webviewDebugLog('Init', 'DragHandler_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'DragHandler_7ree 模块未找到');
    }
    if (window.FolderManager_7ree) {
        folderManager_7ree = new window.FolderManager_7ree(vscode);
        folderManager_7ree.initializeFolderManager_7ree();
        webviewDebugLog('Init', 'FolderManager_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'FolderManager_7ree 模块未找到');
    }
    if (window.ContextMenuHandler_7ree) {
        contextMenuHandler_7ree = new window.ContextMenuHandler_7ree(vscode);
        contextMenuHandler_7ree.initialize_7ree(folderManager_7ree);
        webviewDebugLog('Init', 'ContextMenuHandler_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'ContextMenuHandler_7ree 模块未找到');
    }
    if (window.SearchHandler_7ree) {
        searchHandler_7ree = new window.SearchHandler_7ree(vscode, iconUtils_7ree, pathUtils_7ree, contextMenuHandler_7ree);
        searchHandler_7ree.initializeSearchHandler_7ree();
        webviewDebugLog('Init', 'SearchHandler_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'SearchHandler_7ree 模块未找到');
    }
    if (window.CollectionManager_7ree) {
        collectionManager_7ree = new window.CollectionManager_7ree(vscode, iconUtils_7ree, folderManager_7ree, dragHandler_7ree, pathUtils_7ree, contextMenuHandler_7ree);
        collectionManager_7ree.initializeCollectionManager_7ree();
        webviewDebugLog('Init', 'CollectionManager_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'CollectionManager_7ree 模块未找到');
    }
    if (window.SettingsManager_7ree) {
        settingsManager_7ree = new window.SettingsManager_7ree(vscode);
        settingsManager_7ree.initializeSettingsManager_7ree();
        webviewDebugLog('Init', 'SettingsManager_7ree 模块已初始化');
    } else {
        webviewDebugLog('Error', 'SettingsManager_7ree 模块未找到');
    }
    
    // 所有模块初始化完成后的日志
    webviewDebugLog('Init', '所有模块初始化完成');
    
    // 输出调试信息到控制台
    webviewDebugLog('Init', 'WebView界面已加载');
    
    // 发送初始化消息
    vscode.postMessage({
        command: 'init',
        text: 'WebView已初始化'
    });
    webviewDebugLog('Init', '已发送初始化消息到扩展');
    
    // ==================== 标签页切换功能 ====================
    
    // 切换到搜索标签页
    searchTab.addEventListener('click', () => {
        searchTab.classList.add('active');
        collectionTab.classList.remove('active');
        searchContainer.style.display = 'block';
        collectionContainer.style.display = 'none';
        settingsContainer.style.display = 'none';
    });

    // 切换到收藏标签页
    collectionTab.addEventListener('click', () => {
        collectionTab.classList.add('active');
        searchTab.classList.remove('active');
        collectionContainer.style.display = 'block';
        searchContainer.style.display = 'none';
        settingsContainer.style.display = 'none';
        
        // 请求收藏数据
        if (collectionManager_7ree) {
            collectionManager_7ree.refreshCollections_7ree();
        } else {
            // 备用方案
            vscode.postMessage({
                command: 'getCollections'
            });
        }
    });

    // 切换设置面板
    settingsButton.addEventListener('click', () => {
        if (settingsContainer.style.display === 'none' || !settingsContainer.style.display) {
            settingsContainer.style.display = 'block';
            searchContainer.style.display = 'none';
            collectionContainer.style.display = 'none';
            // 移除标签页的激活状态
            searchTab.classList.remove('active');
            collectionTab.classList.remove('active');
            // 请求当前设置数据
            vscode.postMessage({
                command: 'getSettings'
            });
        } else {
            if (settingsManager_7ree) {
                settingsManager_7ree.handleCloseSettings_7ree();
            } else {
                // 备用方案
                settingsContainer.style.display = 'none';
                searchContainer.style.display = 'block';
                searchTab.classList.add('active');
            }
        }
    });

    // ==================== 搜索功能（由SearchHandler_7ree模块管理）====================

    // ==================== 设置功能（由SettingsManager_7ree模块管理）====================

    // ==================== 收藏功能（由CollectionManager_7ree模块管理）====================

    // ==================== 消息处理 ====================

    // 接收来自扩展的消息
    window.addEventListener('message', event => {
        const message = event.data;
        webviewDebugLog('Message', '收到扩展消息', message);
        
        // 处理不同类型的消息
        if (message.command) {
            switch (message.command) {
                case 'debug':
                    webviewDebugLog('Debug', message.text);
                    break;
                case 'searchResults':
                    webviewDebugLog('SidebarMain', '收到 searchResults 命令', message.results);
                    if (searchHandler_7ree) {
                        webviewDebugLog('SidebarMain', 'searchHandler_7ree 实例存在，调用 renderSearchResults_7ree');
                        searchHandler_7ree.renderSearchResults_7ree(message.results);
                    } else {
                        webviewDebugLog('Error', 'searchHandler_7ree 实例不存在，无法渲染搜索结果');
                    }
                    break;
                case 'searchError':
                    if (searchHandler_7ree) {
                        searchHandler_7ree.showSearchError_7ree(message.error);
                    }
                    break;
                case 'highlightFile':
                    if (searchHandler_7ree) {
                        searchHandler_7ree.highlightFile_7ree(message.filePath);
                    }
                    break;
                case 'fileAddedToCollection':
                    if (collectionManager_7ree) {
                        collectionManager_7ree.showFileAddedToCollectionNotice_7ree(message.success);
                    }
                    break;
                case 'settingsData':
                    if (settingsManager_7ree) {
                        settingsManager_7ree.handleSettingsData_7ree(message.settings);
                    }
                    break;
                case 'settingsSaved':
                    if (settingsManager_7ree) {
                        settingsManager_7ree.handleSettingsSaved_7ree(message);
                    }
                    break;
                case 'testConnectionResult':
                    if (settingsManager_7ree) {
                        settingsManager_7ree.handleTestConnectionResult_7ree(message);
                    }
                    break;
                case 'workspacePath':
                    if (pathUtils_7ree) {
                        pathUtils_7ree.setWorkspacePath_7ree(message.workspacePath);
                        webviewDebugLog('PathUtils', '工作区路径已设置: ' + message.workspacePath);
                    }
                    break;
                case 'searchScopeChanged':
                    if (pathUtils_7ree) {
                        pathUtils_7ree.setSearchScope_7ree(message.searchScope);
                        webviewDebugLog('PathUtils', '搜索范围已更新: ' + message.searchScope);
                    }
                    break;
                case 'collectionsData':
                    if (collectionManager_7ree) {
                        collectionManager_7ree.setCollectionsData_7ree(message.collections);
                    }
                    break;
                case 'collectionTreeData':
                    if (collectionManager_7ree) {
                        collectionManager_7ree.renderCollectionTree_7ree(message.treeData);
                    }
                    break;
                case 'addToFavorites_7ree':
                    // 处理从文件管理器右键菜单添加收藏的请求
                    if (collectionManager_7ree) {
                        collectionManager_7ree.handleAddToFavoritesFromExplorer_7ree(message);
                    } else {
                        webviewDebugLog('Error', 'CollectionManager_7ree 未初始化，无法添加收藏');
                    }
                    break;
                case 'searchWithText_7ree':
                    // 处理从编辑器右键菜单发起的搜索请求
                    if (searchHandler_7ree) {
                        searchHandler_7ree.handleSearchWithText_7ree(message.searchText);
                    } else {
                        webviewDebugLog('Error', 'SearchHandler_7ree 未初始化，无法执行搜索');
                    }
                    break;
                case 'folderCreated':
                case 'itemAddedToCollection':
                case 'itemRemovedFromCollection':
                case 'itemMoved':
                case 'itemRenamed':
                case 'itemReordered_7ree':
                    // 刷新收藏列表
                    if (collectionManager_7ree) {
                        collectionManager_7ree.refreshCollections_7ree();
                    } else {
                        // 备用方案
                        vscode.postMessage({
                            command: 'getCollections'
                        });
                    }
                    break;
                default:
                    webviewDebugLog('Message', '未处理的消息类型', message.command);
            }
        }
    });

    // ==================== 初始化 ====================
    
    // 初始化tooltip功能
    initializeTooltips_7ree();
    
    // 搜索框聚焦由SearchHandler_7ree模块处理
    
    // ==================== Tooltip功能 ====================
    
    /**
     * 初始化tooltip功能
     */
    function initializeTooltips_7ree() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip_7ree);
            element.addEventListener('mouseleave', hideTooltip_7ree);
        });
    }
    
    /**
     * 显示tooltip
     * @param {Event} event 鼠标事件
     */
    function showTooltip_7ree(event) {
        const element = event.currentTarget;
        const tooltipText = element.getAttribute('data-tooltip');
        
        if (!tooltipText) return;
        
        // 获取元素位置
        const rect = element.getBoundingClientRect();
        
        // 创建tooltip元素
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip-7ree';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);
        
        // 计算tooltip位置
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        const top = rect.top - tooltipRect.height - 8;
        
        // 检查右边界，如果超出则调整位置
        const windowWidth = window.innerWidth;
        if (left + tooltipRect.width > windowWidth - 8) {
            left = windowWidth - tooltipRect.width - 8;
        }
        
        // 设置位置
        tooltip.style.left = Math.max(8, left) + 'px';
        tooltip.style.top = Math.max(8, top) + 'px';
        
        // 显示tooltip
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
        
        // 保存引用以便清理
        element._tooltip = tooltip;
    }
    
    /**
     * 隐藏tooltip
     * @param {Event} event 鼠标事件
     */
    function hideTooltip_7ree(event) {
        const element = event.currentTarget;
        const tooltip = element._tooltip;
        
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 200);
            element._tooltip = null;
        }
    }
    
}); 