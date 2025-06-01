/**
 * Everything Sidebar 7ree 收藏树管理模块
 * 负责收藏树的渲染、状态管理、文件夹开合状态记录和还原
 */

class CollectionTree_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     * @param {Object} iconUtils 图标工具实例
     * @param {Object} pathUtils 路径工具实例
     */
    constructor(vscode, iconUtils, pathUtils) {
        this.vscode = vscode;
        this.iconUtils = iconUtils;
        this.pathUtils = pathUtils;
        this.collectionTree = null;
        this.collectionsData = [];
        
        // 文件夹状态管理 - 记录每个文件夹的开合状态
        this.folderStates_7ree = new Map(); // 存储文件夹ID -> 展开状态的映射
        this.stateStorageKey_7ree = 'everythingSidebar_folderStates_7ree';
        
        // 初始化时加载保存的状态
        this.loadFolderStates_7ree();
    }

    /**
     * 初始化收藏树管理
     * @param {HTMLElement} treeElement 树形容器元素
     */
    initializeCollectionTree_7ree(treeElement) {
        this.collectionTree = treeElement;
    }

    /**
     * 渲染收藏树
     * @param {Array} treeData 树形数据
     */
    renderCollectionTree_7ree(treeData) {
        if (!treeData || treeData.length === 0) {
            this.collectionTree.innerHTML = '<div class="empty-collection">暂无收藏项目</div>';
            return;
        }
        
        let html = '';
        
        // 递归生成树形结构HTML
        const generateTreeHtml = (items, level = 0) => {
            let result = '';
            
            items.forEach(item => {
                const isFolder = item.type === 'folder';
                const hasChildren = isFolder && item.children && item.children.length > 0;
                
                // 图标逻辑调整：
                // - 收藏文件夹（type=folder）不显示图标，因为已经有+/-状态图标
                // - 收藏的文件夹项目（isDirectory=true）显示文件夹图标
                // - 收藏的文件项目根据完整路径显示文件图标
                let iconHtml = '';
                if (item.type === 'folder') {
                    // 收藏文件夹不显示图标
                    iconHtml = '';
                } else if (item.isDirectory) {
                    // 收藏的文件夹项目显示文件夹图标
                    iconHtml = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 3H7.71l-2-2H1.5l-.5.5v11l.5.5h13l.5-.5v-9l-.5-.5zM14 13H2V4h5.71l2 2H14v7z"/></svg>';
                } else {
                    // 收藏的文件项目根据完整路径显示文件图标（使用路径而不是别名）
                    const fileNameFromPath = item.path ? item.path.split(/[\\\/]/).pop() : item.label;
                    iconHtml = this.iconUtils ? 
                        this.iconUtils.getFileIcon_7ree(fileNameFromPath, false) : 
                        this.iconUtils.getDefaultFileIcon_7ree(fileNameFromPath, false);
                }
                
                // 获取文件夹的展开状态（优先使用保存的状态，否则使用默认状态）
                const savedState = this.folderStates_7ree.get(item.id);
                const isExpanded = savedState !== undefined ? savedState : (hasChildren ? true : false);
                
                // 折叠/展开图标 - 使用方框+/-图标
                let toggleHtml = '';
                if (item.type === 'folder') {
                    // 收藏文件夹始终显示图标
                    toggleHtml = hasChildren ? 
                        `<span class="folder-toggle" data-icon="${isExpanded ? 'collapse' : 'expand'}" data-expanded="${isExpanded}" data-folder-id="${item.id}"></span>` : 
                        `<span class="folder-toggle" data-icon="collapse" data-expanded="false" data-folder-id="${item.id}"></span>`;
                } else {
                    // 非文件夹项目不显示占位符，以便与文件夹对齐
                    toggleHtml = '';
                }
                
                result += `
                    <div class="tree-item${isFolder ? ' tree-folder' : ''}" 
                        data-id="${item.id}" 
                        data-type="${item.type}" 
                        ${item.path ? `data-path="${item.path}"` : ''}
                        ${isFolder ? 'data-folder="true"' : ''}
                        ${item.path ? `data-full-path="${item.path}"` : ''}>
                        ${toggleHtml}
                        ${iconHtml ? `<div class="tree-icon">${iconHtml}</div>` : ''}
                        <div class="tree-item-content">
                            <div class="tree-item-name">${item.label}</div>
                        </div>
                    </div>
                `;
                
                // 如果是文件夹且有子项，递归生成子项HTML
                if (hasChildren) {
                    const childrenDisplay = isExpanded ? 'block' : 'none';
                    result += `<div class="tree-children" style="display: ${childrenDisplay};">${generateTreeHtml(item.children, level + 1)}</div>`;
                }
            });
            
            return result;
        };
        
        html = generateTreeHtml(treeData);
        this.collectionTree.innerHTML = html;
        
        // 添加事件监听
        this.addCollectionTreeEventListeners_7ree();
        
        // 初始化文件夹切换图标
        this.initializeFolderToggleIcons_7ree();
        
        // 为路径元素添加hover提示
        this.addCollectionPathTooltips_7ree();
    }

    /**
     * 添加收藏树形结构事件监听
     */
    addCollectionTreeEventListeners_7ree() {
        // 文件项点击事件
        const treeItems = this.collectionTree.querySelectorAll('.tree-item');
        treeItems.forEach((item, index) => {
            // 左键点击
            item.addEventListener('click', (event) => {
                // 如果点击的是折叠/展开图标或其内部SVG，则切换子项显示状态
                const clickedElement = event.target;
                const toggleIcon = clickedElement.classList.contains('folder-toggle') ? 
                    clickedElement : 
                    clickedElement.closest('.folder-toggle');
                
                if (toggleIcon) {
                    this.toggleFolderExpansion_7ree(item, toggleIcon);
                    return;
                }
                
                // 如果点击的是文件夹整行，也切换展开状态
                const isFolder = item.getAttribute('data-folder') === 'true';
                if (isFolder) {
                    const folderToggleIcon = item.querySelector('.folder-toggle');
                    if (folderToggleIcon) {
                        this.toggleFolderExpansion_7ree(item, folderToggleIcon);
                    }
                    return;
                }
                
                // 如果是文件，则打开文件
                const filePath = item.getAttribute('data-path');
                if (filePath) {
                    this.vscode.postMessage({
                        command: 'openFile',
                        filePath: filePath
                    });
                }
            });
        });
    }

    /**
     * 切换文件夹展开/收起状态
     * @param {HTMLElement} folderItem 文件夹项元素
     * @param {HTMLElement} toggleIcon 切换图标元素
     */
    toggleFolderExpansion_7ree(folderItem, toggleIcon) {
        const childrenContainer = folderItem.nextElementSibling;
        if (childrenContainer && childrenContainer.classList.contains('tree-children')) {
            const isExpanded = toggleIcon.getAttribute('data-expanded') === 'true';
            const folderId = toggleIcon.getAttribute('data-folder-id');
            
            if (isExpanded) {
                // 收起文件夹
                childrenContainer.style.display = 'none';
                toggleIcon.setAttribute('data-icon', 'expand');
                toggleIcon.alt = '展开';
                toggleIcon.setAttribute('data-expanded', 'false');
                
                // 保存状态
                if (folderId) {
                    this.folderStates_7ree.set(folderId, false);
                }
            } else {
                // 展开文件夹
                childrenContainer.style.display = 'block';
                toggleIcon.setAttribute('data-icon', 'collapse');
                toggleIcon.alt = '收起';
                toggleIcon.setAttribute('data-expanded', 'true');
                
                // 保存状态
                if (folderId) {
                    this.folderStates_7ree.set(folderId, true);
                }
            }
            
            // 更新图标源
            this.updateToggleIconSrc_7ree(toggleIcon);
            
            // 保存状态到本地存储
            this.saveFolderStates_7ree();
            
            if (typeof webviewDebugLog === 'function') {
                webviewDebugLog('CollectionTree', `文件夹 ${folderId} 状态切换为: ${!isExpanded}`);
            }
        }
    }

    /**
     * 收起所有文件夹
     */
    collapseAllFolders_7ree() {
        const allToggleIcons = this.collectionTree.querySelectorAll('.folder-toggle');
        allToggleIcons.forEach(toggleIcon => {
            const folderItem = toggleIcon.closest('.tree-item');
            if (folderItem) {
                const childrenContainer = folderItem.nextElementSibling;
                if (childrenContainer && childrenContainer.classList.contains('tree-children')) {
                    const folderId = toggleIcon.getAttribute('data-folder-id');
                    
                    // 收起文件夹
                    childrenContainer.style.display = 'none';
                    toggleIcon.setAttribute('data-icon', 'expand');
                    toggleIcon.alt = '展开';
                    toggleIcon.setAttribute('data-expanded', 'false');
                    
                    // 保存状态
                    if (folderId) {
                        this.folderStates_7ree.set(folderId, false);
                    }
                    
                    // 更新图标源
                    this.updateToggleIconSrc_7ree(toggleIcon);
                }
            }
        });
        
        // 保存状态到本地存储
        this.saveFolderStates_7ree();
        
        if (typeof webviewDebugLog === 'function') {
            webviewDebugLog('CollectionTree', '已收起所有文件夹');
        }
    }

    /**
     * 初始化文件夹切换图标
     */
    initializeFolderToggleIcons_7ree() {
        const allToggleIcons = this.collectionTree.querySelectorAll('.folder-toggle');
        allToggleIcons.forEach(toggleIcon => {
            this.updateToggleIconSrc_7ree(toggleIcon);
        });
    }

    /**
     * 更新切换图标的源地址
     * @param {HTMLElement} toggleIcon 切换图标元素
     */
    updateToggleIconSrc_7ree(toggleIcon) {
        const iconType = toggleIcon.getAttribute('data-icon');
        if (iconType === 'expand') {
            // 使用展开图标（方框+号）
            toggleIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1" fill="none"/>
                <path d="M4 6h4M6 4v4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
            </svg>`;
        } else if (iconType === 'collapse') {
            // 使用收起图标（方框-号）
            toggleIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1" fill="none"/>
                <path d="M4 6h4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
            </svg>`;
        }
    }

    /**
     * 为收藏项目添加路径hover提示
     */
    addCollectionPathTooltips_7ree() {
        if (!this.pathUtils) return;
        
        // 为有路径的收藏项目添加hover提示
        const treeItems = this.collectionTree.querySelectorAll('.tree-item[data-full-path]');
        treeItems.forEach(element => {
            const fullPath = element.getAttribute('data-full-path');
            if (fullPath) {
                this.pathUtils.addPathTooltip_7ree(element, fullPath);
            }
        });
    }

    /**
     * 保存文件夹开合状态到本地存储
     */
    saveFolderStates_7ree() {
        try {
            const statesObject = Object.fromEntries(this.folderStates_7ree);
            localStorage.setItem(this.stateStorageKey_7ree, JSON.stringify(statesObject));
            
            if (typeof webviewDebugLog === 'function') {
                webviewDebugLog('CollectionTree', '文件夹状态已保存', statesObject);
            }
        } catch (error) {
            if (typeof webviewDebugLog === 'function') {
                webviewDebugLog('Error', '保存文件夹状态失败:', error);
            }
        }
    }

    /**
     * 从本地存储加载文件夹开合状态
     */
    loadFolderStates_7ree() {
        try {
            const savedStates = localStorage.getItem(this.stateStorageKey_7ree);
            if (savedStates) {
                const statesObject = JSON.parse(savedStates);
                this.folderStates_7ree = new Map(Object.entries(statesObject));
                
                if (typeof webviewDebugLog === 'function') {
                    webviewDebugLog('CollectionTree', '文件夹状态已加载', statesObject);
                }
            }
        } catch (error) {
            if (typeof webviewDebugLog === 'function') {
                webviewDebugLog('Error', '加载文件夹状态失败:', error);
            }
            // 如果加载失败，使用空的状态映射
            this.folderStates_7ree = new Map();
        }
    }

    /**
     * 清除所有保存的文件夹状态（用于重置）
     */
    clearFolderStates_7ree() {
        this.folderStates_7ree.clear();
        localStorage.removeItem(this.stateStorageKey_7ree);
        
        if (typeof webviewDebugLog === 'function') {
            webviewDebugLog('CollectionTree', '文件夹状态已清除');
        }
    }

    /**
     * 刷新收藏树并保持文件夹状态
     * @param {Array} treeData 新的树形数据
     */
    refreshCollectionTree_7ree(treeData) {
        // 保存当前的数据
        this.collectionsData = treeData;
        
        // 重新渲染树形结构（会自动应用保存的状态）
        this.renderCollectionTree_7ree(treeData);
        
        if (typeof webviewDebugLog === 'function') {
            webviewDebugLog('CollectionTree', '收藏树已刷新，文件夹状态已保持');
        }
    }

    /**
     * 设置收藏数据
     * @param {Array} data 收藏数据
     */
    setCollectionsData_7ree(data) {
        this.collectionsData = data;
    }

    /**
     * 获取收藏数据
     * @returns {Array} 收藏数据
     */
    getCollectionsData_7ree() {
        return this.collectionsData;
    }

    /**
     * 获取文件夹状态映射（用于调试）
     * @returns {Map} 文件夹状态映射
     */
    getFolderStates_7ree() {
        return this.folderStates_7ree;
    }
}

// 导出模块
window.CollectionTree_7ree = CollectionTree_7ree; 