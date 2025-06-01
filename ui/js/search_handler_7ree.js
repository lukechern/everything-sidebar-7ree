/**
 * Everything Sidebar 7ree 搜索处理模块
 * 负责搜索功能的前端交互和结果渲染
 */

class SearchHandler_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     * @param {Object} iconUtils 图标工具实例
     * @param {Object} pathUtils 路径工具实例
     * @param {Object} contextMenuHandler 上下文菜单处理实例（可选）
     */
    constructor(vscode, iconUtils, pathUtils, contextMenuHandler = null) {
        this.vscode = vscode;
        this.iconUtils = iconUtils;
        this.pathUtils = pathUtils;
        this.contextMenuHandler = contextMenuHandler;
        this.searchTimeout = null;
        this.searchDelay = 300; // 搜索延迟，避免频繁请求
        this.currentRightClickedItem = null;
    }

    /**
     * 初始化搜索功能
     */
    initializeSearchHandler_7ree() {
        // 获取DOM元素
        this.searchInput = document.getElementById('search-input');
        this.clearButton = document.getElementById('clear-button');
        this.externalSearchButton = document.getElementById('external-search-button');
        this.searchResults = document.getElementById('search-results');
        this.contextMenu = document.getElementById('context-menu');
        
        // 绑定事件监听器
        this.bindEventListeners_7ree();
        
        // 初始化时聚焦搜索框
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners_7ree() {
        // 监听搜索输入
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.handleSearchInput_7ree();
            });
        }

        // 清除按钮点击事件
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearSearch_7ree();
            });
        }

        // 外部搜索按钮点击事件
        if (this.externalSearchButton) {
            this.externalSearchButton.addEventListener('click', () => {
                this.handleExternalSearch_7ree();
            });
        }

        // 绑定上下文菜单事件
        this.bindContextMenuEvents_7ree();
    }

    /**
     * 绑定上下文菜单事件
     */
    bindContextMenuEvents_7ree() {
        // 上下文菜单项点击事件
        const menuAddToCollection = document.getElementById('menu-add-to-collection');
        if (menuAddToCollection) {
            menuAddToCollection.addEventListener('click', () => {
                this.handleMenuAddToCollection_7ree();
            });
        }

        const menuCopyPath = document.getElementById('menu-copy-path');
        if (menuCopyPath) {
            menuCopyPath.addEventListener('click', () => {
                this.handleMenuCopyPath_7ree();
            });
        }

        const menuRevealInExplorer = document.getElementById('menu-reveal-in-explorer');
        if (menuRevealInExplorer) {
            menuRevealInExplorer.addEventListener('click', () => {
                this.handleMenuRevealInExplorer_7ree();
            });
        }
    }

    /**
     * 处理搜索输入
     */
    handleSearchInput_7ree() {
        const keyword = this.searchInput.value.trim();
        
        // 清除之前的搜索超时
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // 如果关键词为空，清空搜索结果
        if (!keyword) {
            this.searchResults.innerHTML = '<div class="no-results">请输入关键词进行搜索</div>';
            return;
        }
        
        // 显示加载中
        this.searchResults.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div>搜索中...</div>
            </div>
        `;
        
        // 设置搜索延迟，避免频繁请求
        this.searchTimeout = setTimeout(() => {
            // 发送搜索请求到扩展
            this.vscode.postMessage({
                command: 'search',
                keyword: keyword
            });
        }, this.searchDelay);
    }

    /**
     * 清除搜索
     */
    clearSearch_7ree() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchResults.innerHTML = '<div class="no-results">请输入关键词进行搜索</div>';
            this.searchInput.focus();
        }
    }

    /**
     * 渲染搜索结果
     * @param {Array} results 搜索结果数组
     */
    renderSearchResults_7ree(results) {
        webviewDebugLog('SearchHandler', 'renderSearchResults_7ree 调用开始', results);

        if (!this.searchResults) {
            webviewDebugLog('Error', 'SearchHandler: searchResults DOM 元素未找到!');
            return;
        }

        if (!results) {
            webviewDebugLog('SearchHandler', 'renderSearchResults_7ree: results 为空，显示无匹配');
            this.searchResults.innerHTML = '<div class="no-results">未找到匹配的文件 (results 为 null/undefined)</div>';
            return;
        }
        
        if (results.length === 0) {
            webviewDebugLog('SearchHandler', 'renderSearchResults_7ree: results 长度为0，显示无匹配');
            this.searchResults.innerHTML = '<div class="no-results">未找到匹配的文件 (长度为0)</div>';
            return;
        }
        
        let html = '';
        webviewDebugLog('SearchHandler', 'renderSearchResults_7ree: 开始生成结果HTML');
        
        results.forEach((result, index) => {
            const fileName = result.name || this.getFileNameFromPath_7ree(result.path);
            const filePath = result.path;
            const isDirectory = result.type === 'directory';
            
            webviewDebugLog('SearchHandler', `Processing result ${index}:`, result);

            let iconHtml = this.iconUtils ? 
                this.iconUtils.getFileIcon_7ree(fileName, isDirectory) : 
                this.iconUtils.getDefaultFileIcon_7ree(fileName, isDirectory);
            
            const optimizedPath = this.pathUtils ? 
                this.pathUtils.optimizePath_7ree(filePath) : 
                filePath;
            
            html += `
                <div class="result-item" data-path="${filePath}" data-is-directory="${isDirectory}">
                    <div class="result-icon">${iconHtml}</div>
                    <div>
                        <div class="result-name">${fileName}</div>
                        <div class="result-path" data-full-path="${filePath}">${optimizedPath}</div>
                    </div>
                </div>
            `;
        });
        
        webviewDebugLog('SearchHandler', 'renderSearchResults_7ree: HTML 生成完毕', html);
        this.searchResults.innerHTML = html;
        webviewDebugLog('SearchHandler', 'renderSearchResults_7ree: searchResults.innerHTML 已更新');
        
        // 添加点击事件
        this.addResultItemEvents_7ree();
        
        // 为路径元素添加hover提示
        this.addPathTooltips_7ree();
        webviewDebugLog('SearchHandler', 'renderSearchResults_7ree 调用结束');
    }

    /**
     * 为搜索结果项添加事件监听器
     */
    addResultItemEvents_7ree() {
        const resultItems = this.searchResults.querySelectorAll('.result-item');
        resultItems.forEach(item => {
            // 左键点击打开文件
            item.addEventListener('click', () => {
                const filePath = item.getAttribute('data-path');
                this.vscode.postMessage({
                    command: 'openFile',
                    filePath: filePath
                });
            });
            
            // 右键点击显示上下文菜单
            item.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                
                // 使用上下文菜单处理器（如果可用）
                if (this.contextMenuHandler) {
                    this.contextMenuHandler.showSearchContextMenu_7ree(event, item);
                } else {
                    // 使用旧的方法（兼容性处理）
                    this.showContextMenu_7ree(event, item);
                }
            });
        });
    }

    /**
     * 显示上下文菜单
     * @param {Event} event 鼠标事件
     * @param {HTMLElement} item 文件项元素
     */
    showContextMenu_7ree(event, item) {
        // 清除所有选中状态
        this.clearAllContextMenuSelection_7ree();
        
        // 保存当前右键点击的项
        this.currentRightClickedItem = item;
        
        // 为当前项添加选中状态
        item.classList.add('context-menu-selected');
        
        if (this.contextMenu) {
            // 设置菜单位置
            this.contextMenu.style.left = `${event.pageX}px`;
            this.contextMenu.style.top = `${event.pageY}px`;
            this.contextMenu.style.display = 'block';
            
            // 点击其他区域关闭菜单
            document.addEventListener('click', this.closeContextMenu_7ree.bind(this));
        }
    }

    /**
     * 关闭上下文菜单
     */
    closeContextMenu_7ree() {
        if (this.contextMenu) {
            this.contextMenu.style.display = 'none';
            document.removeEventListener('click', this.closeContextMenu_7ree.bind(this));
        }
        
        // 清除选中状态
        this.clearAllContextMenuSelection_7ree();
    }

    /**
     * 处理菜单添加到收藏
     */
    handleMenuAddToCollection_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            this.vscode.postMessage({
                command: 'addToCollection',
                filePath: filePath
            });
        }
    }

    /**
     * 处理菜单复制路径
     */
    handleMenuCopyPath_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            this.vscode.postMessage({
                command: 'copyPath',
                filePath: filePath
            });
        }
    }

    /**
     * 处理菜单打开路径
     */
    handleMenuRevealInExplorer_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            this.vscode.postMessage({
                command: 'revealInExplorer',
                filePath: filePath
            });
        }
    }

    /**
     * 高亮当前文件
     * @param {string} filePath 文件路径
     */
    highlightFile_7ree(filePath) {
        // 移除所有高亮
        const allItems = this.searchResults.querySelectorAll('.result-item');
        allItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加高亮到匹配的项
        allItems.forEach(item => {
            if (item.getAttribute('data-path') === filePath) {
                item.classList.add('active');
                // 滚动到可见区域
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    /**
     * 显示搜索错误
     * @param {string} error 错误信息
     */
    showSearchError_7ree(error) {
        if (this.searchResults) {
            this.searchResults.innerHTML = `<div class="no-results">搜索出错: ${error}</div>`;
        }
    }

    /**
     * 从路径中获取文件名
     * @param {string} filePath 文件路径
     * @returns {string} 文件名
     */
    getFileNameFromPath_7ree(filePath) {
        return filePath.split(/[\\\/]/).pop();
    }

    /**
     * 获取搜索输入框的值
     * @returns {string} 搜索关键词
     */
    getSearchKeyword_7ree() {
        return this.searchInput ? this.searchInput.value.trim() : '';
    }

    /**
     * 设置搜索输入框的值
     * @param {string} keyword 搜索关键词
     */
    setSearchKeyword_7ree(keyword) {
        if (this.searchInput) {
            this.searchInput.value = keyword;
        }
    }

    /**
     * 获取当前右键点击的项目
     * @returns {HTMLElement|null} 当前右键点击的项目元素
     */
    getCurrentRightClickedItem_7ree() {
        return this.currentRightClickedItem;
    }

    /**
     * 设置搜索延迟时间
     * @param {number} delay 延迟时间（毫秒）
     */
    setSearchDelay_7ree(delay) {
        this.searchDelay = delay;
    }

    /**
     * 获取搜索延迟时间
     * @returns {number} 延迟时间（毫秒）
     */
    getSearchDelay_7ree() {
        return this.searchDelay;
    }

    /**
     * 为路径元素添加hover提示
     */
    addPathTooltips_7ree() {
        if (!this.pathUtils) return;
        
        const pathElements = this.searchResults.querySelectorAll('.result-path');
        pathElements.forEach(element => {
            const fullPath = element.getAttribute('data-full-path');
            if (fullPath) {
                this.pathUtils.addPathTooltip_7ree(element, fullPath);
            }
        });
    }

    /**
     * 处理从编辑器右键菜单发起的搜索请求
     * @param {string} searchText 要搜索的文本
     */
    handleSearchWithText_7ree(searchText) {
        if (!searchText || searchText.trim() === '') {
            return;
        }

        // 切换到搜索标签页
        const searchTab = document.getElementById('search-tab');
        const collectionTab = document.getElementById('collection-tab');
        const searchContainer = document.getElementById('search-container');
        const collectionContainer = document.getElementById('collection-container');
        const settingsContainer = document.getElementById('settings-container');

        if (searchTab && collectionTab && searchContainer && collectionContainer) {
            searchTab.classList.add('active');
            collectionTab.classList.remove('active');
            searchContainer.style.display = 'block';
            collectionContainer.style.display = 'none';
            if (settingsContainer) {
                settingsContainer.style.display = 'none';
            }
        }

        // 设置搜索框内容
        if (this.searchInput) {
            this.searchInput.value = searchText.trim();
            this.searchInput.focus();
        }

        // 立即执行搜索
        this.performSearch_7ree(searchText.trim());
    }

    /**
     * 执行搜索（内部方法）
     * @param {string} keyword 搜索关键词
     */
    performSearch_7ree(keyword) {
        if (!keyword) {
            return;
        }

        // 清除之前的搜索超时
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // 显示加载中
        this.searchResults.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div>搜索中...</div>
            </div>
        `;

        // 发送搜索请求到扩展
        this.vscode.postMessage({
            command: 'search',
            keyword: keyword
        });
    }

    /**
     * 处理外部搜索按钮点击
     */
    handleExternalSearch_7ree() {
        const keyword = this.getSearchKeyword_7ree();
        
        if (!keyword) {
            // 如果没有搜索关键词，直接打开Everything程序
            this.vscode.postMessage({
                command: 'openExternalEverything_7ree'
            });
            return;
        }

        // 发送外部搜索请求到扩展
        this.vscode.postMessage({
            command: 'searchInExternalEverything_7ree',
            keyword: keyword
        });
    }

    /**
     * 清除所有右键菜单选中状态
     */
    clearAllContextMenuSelection_7ree() {
        // 清除搜索结果中的选中状态
        const selectedItems = this.searchResults.querySelectorAll('.context-menu-selected');
        selectedItems.forEach(item => {
            item.classList.remove('context-menu-selected');
        });
    }
}

// 导出模块
window.SearchHandler_7ree = SearchHandler_7ree; 