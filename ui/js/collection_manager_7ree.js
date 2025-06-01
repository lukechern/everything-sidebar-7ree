/**
 * Everything Sidebar 7ree 收藏管理模块
 * 负责收藏功能的前端交互和树形结构渲染
 */

class CollectionManager_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     * @param {Object} iconUtils 图标工具实例
     * @param {Object} folderManager 文件夹管理实例
     * @param {Object} dragHandler 拖拽处理实例
     * @param {Object} pathUtils 路径工具实例
     * @param {Object} contextMenuHandler 上下文菜单处理实例（可选）
     */
    constructor(vscode, iconUtils, folderManager, dragHandler, pathUtils, contextMenuHandler = null) {
        this.vscode = vscode;
        this.iconUtils = iconUtils;
        this.folderManager = folderManager;
        this.dragHandler = dragHandler;
        this.pathUtils = pathUtils;
        this.contextMenuHandler = contextMenuHandler;
        this.collectionsData = [];
        
        // 初始化收藏树管理模块
        this.collectionTreeManager_7ree = new CollectionTree_7ree(vscode, iconUtils, pathUtils);
    }

    /**
     * 初始化收藏管理功能
     */
    initializeCollectionManager_7ree() {
        // 获取DOM元素
        this.collectionTree = document.getElementById('collection-tree');
        this.collectionContextMenu = document.getElementById('collection-context-menu');
        this.folderContextMenu = document.getElementById('folder-context-menu');
        
        // 初始化收藏树管理模块
        this.collectionTreeManager_7ree.initializeCollectionTree_7ree(this.collectionTree);
        
        // 绑定事件监听器
        this.bindEventListeners_7ree();
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners_7ree() {
        // 刷新收藏按钮点击事件
        const refreshButton = document.getElementById('refresh-collection-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshCollections_7ree();
            });
        }

        // 收起全部文件夹按钮点击事件
        const collapseAllButton = document.getElementById('collapse-all-button');
        if (collapseAllButton) {
            collapseAllButton.addEventListener('click', () => {
                this.collectionTreeManager_7ree.collapseAllFolders_7ree();
            });
        }

        // 绑定收藏文件上下文菜单事件
        this.bindCollectionContextMenuEvents_7ree();
    }

    /**
     * 绑定收藏文件上下文菜单事件
     * @deprecated 已迁移到ContextMenuHandler_7ree
     */
    bindCollectionContextMenuEvents_7ree() {
        // 菜单项事件已经由ContextMenuHandler_7ree处理
        if (typeof webviewDebugLog === 'function') {
            webviewDebugLog('CollectionManager', '菜单事件已由ContextMenuHandler_7ree处理');
        }
    }

    /**
     * 刷新收藏列表
     */
    refreshCollections_7ree() {
        // 获取最新的收藏数据
        this.vscode.postMessage({
            command: 'getCollections'
        });
        // 数据返回后，将由 message listener 调用 renderCollectionTree_7ree, 
        // 而 renderCollectionTree_7ree 内部会调用 collectionTreeManager_7ree.refreshCollectionTree_7ree
        // 或者，如果希望立即刷新（可能基于旧数据），则需要调整逻辑
        // 暂时保持原样，依赖 getCollections 的回调来触发渲染和刷新
    }

    /**
     * 渲染收藏树
     * @param {Array} treeData 树形数据
     */
    renderCollectionTree_7ree(treeData) {
        this.collectionsData = treeData; // 保存一份数据副本
        this.collectionTreeManager_7ree.renderCollectionTree_7ree(treeData);
        
        // 事件监听现在由 CollectionTree_7ree 内部处理，但右键菜单的绑定仍在此处
        this.addCollectionContextMenuEventListeners_7ree(); 
    }

    /**
     * 添加收藏树右键菜单事件监听 (注意：不是树本身的点击事件)
     */
    addCollectionContextMenuEventListeners_7ree() {
        const treeItems = this.collectionTree.querySelectorAll('.tree-item');
        treeItems.forEach(item => {
            // 右键点击显示上下文菜单
            item.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                const type = item.getAttribute('data-type');
                
                // 使用上下文菜单处理器（如果可用）
                if (this.contextMenuHandler) {
                    if (type === 'folder') {
                        this.contextMenuHandler.showFolderContextMenu_7ree(event, item);
                    } else {
                        this.contextMenuHandler.showCollectionFileContextMenu_7ree(event, item);
                    }
                } else {
                    webviewDebugLog('CollectionManager', '上下文菜单处理器未初始化', '请检查context_menu_handler_7ree.js是否正确加载');
                }
            });
        });

        // 使用拖拽处理模块初始化拖拽功能
        if (this.dragHandler) {
            this.dragHandler.initializeDragHandlers_7ree(this.collectionTree);
        }
    }

    /**
     * 设置收藏数据
     * @param {Array} data 收藏数据
     */
    setCollectionsData_7ree(data) {
        this.collectionsData = data;
        this.collectionTreeManager_7ree.setCollectionsData_7ree(data); // 同时更新TreeManager中的数据
    }

    /**
     * 获取收藏数据
     * @returns {Array} 收藏数据
     */
    getCollectionsData_7ree() {
        return this.collectionsData;
    }

    /**
     * 显示文件添加到收藏的提示
     * @param {boolean} success 是否成功
     */
    showFileAddedToCollectionNotice_7ree(success) {
        if (success) {
            // 显示临时提示
            const tempNotice = document.createElement('div');
            tempNotice.className = 'no-results';
            tempNotice.style.backgroundColor = 'var(--vscode-notificationToast-background)';
            tempNotice.style.color = 'var(--vscode-notificationToast-foreground)';
            tempNotice.style.padding = '8px';
            tempNotice.style.borderRadius = '3px';
            tempNotice.style.marginTop = '10px';
            tempNotice.style.position = 'absolute';
            tempNotice.style.bottom = '20px';
            tempNotice.style.left = '50%';
            tempNotice.style.transform = 'translateX(-50%)';
            tempNotice.style.zIndex = '1000';
            tempNotice.textContent = '已添加到收藏';
            
            document.body.appendChild(tempNotice);
            
            setTimeout(() => {
                if (document.body.contains(tempNotice)) {
                    document.body.removeChild(tempNotice);
                }
            }, 2000);
        }
    }

    /**
     * 切换到收藏标签页并刷新收藏列表
     */
    handleAddToFavoritesFromExplorer_7ree(message) {
        if (typeof webviewDebugLog === 'function') {
            webviewDebugLog('Collection', '处理从文件管理器添加收藏请求', message);
        }
        
        if (!message.filePath) {
            if (typeof webviewDebugLog === 'function') {
                webviewDebugLog('Error', '文件路径为空，无法添加收藏');
            }
            return;
        }

        // 发送添加收藏请求到后端
        this.vscode.postMessage({
            command: 'addToCollection',
            filePath: message.filePath,
            fileName: message.fileName,
            isDirectory: message.isDirectory,
            source: 'explorer' // 标识来源为文件管理器
        });

        // 显示添加成功的临时提示
        this.showAddToFavoritesNotice_7ree(message.fileName);

        // 切换到收藏标签页并刷新收藏列表
        this.switchToCollectionTab_7ree();
        
        // 延迟刷新收藏列表，确保后端处理完成
        setTimeout(() => {
            this.refreshCollections_7ree(); 
        }, 500);
    }

    /**
     * 显示添加到收藏的临时提示
     * @param {string} fileName 文件名
     */
    showAddToFavoritesNotice_7ree(fileName) {
        // 创建临时提示元素
        const tempNotice = document.createElement('div');
        tempNotice.className = 'add-to-favorites-notice';
        tempNotice.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--vscode-notificationToast-background);
            color: var(--vscode-notificationToast-foreground);
            border: 1px solid var(--vscode-notificationToast-border);
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-size: 13px;
            max-width: 300px;
            text-align: center;
            animation: slideInUp 0.3s ease-out;
        `;
        
        tempNotice.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a.5.5 0 0 1 .5.5v6h6a.5.5 0 0 1 0 1h-6v6a.5.5 0 0 1-1 0v-6h-6a.5.5 0 0 1 0-1h6v-6A.5.5 0 0 1 8 1z"/>
                </svg>
                <span>已添加 "${fileName}" 到收藏夹</span>
            </div>
        `;
        
        // 添加动画样式
        if (!document.getElementById('add-to-favorites-animation-style')) {
            const style = document.createElement('style');
            style.id = 'add-to-favorites-animation-style';
            style.textContent = `
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(tempNotice);
        
        // 3秒后自动移除提示
        setTimeout(() => {
            if (document.body.contains(tempNotice)) {
                tempNotice.style.animation = 'slideInUp 0.3s ease-out reverse';
                setTimeout(() => {
                    if (document.body.contains(tempNotice)) {
                        document.body.removeChild(tempNotice);
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * 切换到收藏标签页
     */
    switchToCollectionTab_7ree() {
        const searchTab = document.getElementById('search-tab');
        const collectionTab = document.getElementById('collection-tab');
        const searchContainer = document.getElementById('search-container');
        const collectionContainer = document.getElementById('collection-container');
        const settingsContainer = document.getElementById('settings-container');
        
        if (searchTab && collectionTab && searchContainer && collectionContainer && settingsContainer) {
            // 切换标签页状态
            searchTab.classList.remove('active');
            collectionTab.classList.add('active');
            
            // 切换容器显示状态
            searchContainer.style.display = 'none';
            collectionContainer.style.display = 'block';
            settingsContainer.style.display = 'none';
            
            if (typeof webviewDebugLog === 'function') {
                webviewDebugLog('Collection', '已切换到收藏标签页');
            }
        }
    }
}

// 导出模块
window.CollectionManager_7ree = CollectionManager_7ree; 