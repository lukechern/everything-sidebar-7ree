/**
 * Everything Sidebar 7ree 上下文菜单处理模块
 * 负责处理收藏项目、文件夹和搜索结果的右键菜单功能
 */

class ContextMenuHandler_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     */
    constructor(vscode) {
        this.vscode = vscode;
        this.currentRightClickedItem = null;
        this.folderManager = null;
    }

    /**
     * 初始化上下文菜单处理器
     * @param {Object} folderManager 文件夹管理器实例（可选）
     */
    initialize_7ree(folderManager = null) {
        // 获取DOM元素
        this.collectionContextMenu = document.getElementById('collection-context-menu');
        this.folderContextMenu = document.getElementById('folder-context-menu');
        this.searchContextMenu = document.getElementById('context-menu');
        
        // 设置文件夹管理器引用
        this.folderManager = folderManager;
        
        // 绑定菜单项事件
        this.bindMenuEvents_7ree();
        
        if (typeof webviewDebugLog === 'function') {
            webviewDebugLog('ContextMenuHandler', '上下文菜单处理器已初始化', {
                folderManager: !!this.folderManager
            });
        }
    }

    /**
     * 绑定菜单项事件
     */
    bindMenuEvents_7ree() {
        // 收藏项目菜单
        if (this.collectionContextMenu) {
            const openBesideItem = document.getElementById('collection-menu-open-beside-7ree');
            if (openBesideItem) {
                openBesideItem.addEventListener('click', () => this.handleCollectionMenuOpenBeside_7ree());
            }
            
            const renameItem = document.getElementById('collection-menu-rename');
            if (renameItem) {
                renameItem.addEventListener('click', () => this.handleCollectionMenuRename_7ree());
            }
            
            const removeItem = document.getElementById('collection-menu-remove');
            if (removeItem) {
                removeItem.addEventListener('click', () => this.handleCollectionMenuRemove_7ree());
            }
            
            const copyPathItem = document.getElementById('collection-menu-copy-path');
            if (copyPathItem) {
                copyPathItem.addEventListener('click', () => this.handleCollectionMenuCopyPath_7ree());
            }
            
            const revealItem = document.getElementById('collection-menu-reveal-in-explorer');
            if (revealItem) {
                revealItem.addEventListener('click', () => this.handleCollectionMenuRevealInExplorer_7ree());
            }
        }
        
        // 文件夹菜单
        if (this.folderContextMenu) {
            const renameFolderItem = document.getElementById('folder-menu-rename');
            if (renameFolderItem) {
                renameFolderItem.addEventListener('click', () => this.handleFolderMenuRename_7ree());
            }
            
            const removeFolderItem = document.getElementById('folder-menu-remove');
            if (removeFolderItem) {
                removeFolderItem.addEventListener('click', () => this.handleFolderMenuRemove_7ree());
            }
        }
        
        // 搜索结果菜单
        if (this.searchContextMenu) {
            const openBesideSearchItem = document.getElementById('menu-open-beside-7ree');
            if (openBesideSearchItem) {
                openBesideSearchItem.addEventListener('click', () => this.handleSearchMenuOpenBeside_7ree());
            }
            
            const addToCollectionItem = document.getElementById('menu-add-to-collection');
            if (addToCollectionItem) {
                addToCollectionItem.addEventListener('click', () => this.handleSearchMenuAddToCollection_7ree());
            }
            
            const copySearchPathItem = document.getElementById('menu-copy-path');
            if (copySearchPathItem) {
                copySearchPathItem.addEventListener('click', () => this.handleSearchMenuCopyPath_7ree());
            }
            
            const revealSearchItem = document.getElementById('menu-reveal-in-explorer');
            if (revealSearchItem) {
                revealSearchItem.addEventListener('click', () => this.handleSearchMenuRevealInExplorer_7ree());
            }
        }
    }

    /**
     * 显示收藏文件上下文菜单
     * @param {Event} event 鼠标事件
     * @param {HTMLElement} item 文件项元素
     */
    showCollectionFileContextMenu_7ree(event, item) {
        // 清除所有选中状态
        this.clearAllContextMenuSelection_7ree();
        
        // 保存当前右键点击的项
        this.currentRightClickedItem = item;
        
        // 为当前项添加选中状态
        item.classList.add('context-menu-selected');
        
        if (this.collectionContextMenu) {
            // 设置菜单位置
            this.collectionContextMenu.style.left = `${event.pageX}px`;
            this.collectionContextMenu.style.top = `${event.pageY}px`;
            this.collectionContextMenu.style.display = 'block';
            
            // 点击其他区域关闭菜单
            document.addEventListener('click', this.closeCollectionContextMenu_7ree.bind(this));
        }
    }

    /**
     * 显示文件夹上下文菜单
     * @param {Event} event 鼠标事件
     * @param {HTMLElement} item 文件夹项元素
     */
    showFolderContextMenu_7ree(event, item) {
        // 清除所有选中状态
        this.clearAllContextMenuSelection_7ree();
        
        // 保存当前右键点击的项
        this.currentRightClickedItem = item;
        
        // 为当前项添加选中状态
        item.classList.add('context-menu-selected');
        
        // 使用文件夹管理模块显示上下文菜单（如果有）
        if (this.folderManager) {
            this.folderManager.setCurrentRightClickedItem_7ree(item);
            this.folderManager.showFolderContextMenu_7ree(event, item);
            return;
        }
        
        // 备用方案：直接显示菜单
        if (this.folderContextMenu) {
            this.folderContextMenu.style.left = `${event.pageX}px`;
            this.folderContextMenu.style.top = `${event.pageY}px`;
            this.folderContextMenu.style.display = 'block';
            
            // 点击其他区域关闭菜单
            document.addEventListener('click', this.closeFolderContextMenu_7ree.bind(this));
        }
    }

    /**
     * 显示搜索结果上下文菜单
     * @param {Event} event 鼠标事件
     * @param {HTMLElement} item 搜索结果项元素
     */
    showSearchContextMenu_7ree(event, item) {
        // 清除所有选中状态
        this.clearAllContextMenuSelection_7ree();
        
        // 保存当前右键点击的项
        this.currentRightClickedItem = item;
        
        // 为当前项添加选中状态
        item.classList.add('context-menu-selected');
        
        if (this.searchContextMenu) {
            // 设置菜单位置
            this.searchContextMenu.style.left = `${event.pageX}px`;
            this.searchContextMenu.style.top = `${event.pageY}px`;
            this.searchContextMenu.style.display = 'block';
            
            // 点击其他区域关闭菜单
            document.addEventListener('click', this.closeSearchContextMenu_7ree.bind(this));
        }
    }

    /**
     * 关闭收藏文件上下文菜单
     */
    closeCollectionContextMenu_7ree() {
        if (this.collectionContextMenu) {
            this.collectionContextMenu.style.display = 'none';
            document.removeEventListener('click', this.closeCollectionContextMenu_7ree.bind(this));
        }
        
        // 清除选中状态
        this.clearAllContextMenuSelection_7ree();
    }

    /**
     * 关闭文件夹上下文菜单
     */
    closeFolderContextMenu_7ree() {
        if (this.folderContextMenu) {
            this.folderContextMenu.style.display = 'none';
            document.removeEventListener('click', this.closeFolderContextMenu_7ree.bind(this));
        }
        
        // 清除选中状态
        this.clearAllContextMenuSelection_7ree();
    }

    /**
     * 关闭搜索结果上下文菜单
     */
    closeSearchContextMenu_7ree() {
        if (this.searchContextMenu) {
            this.searchContextMenu.style.display = 'none';
            document.removeEventListener('click', this.closeSearchContextMenu_7ree.bind(this));
        }
        
        // 清除选中状态
        this.clearAllContextMenuSelection_7ree();
    }

    /**
     * 处理收藏项目重命名菜单
     */
    handleCollectionMenuRename_7ree() {
        if (this.currentRightClickedItem) {
            // 如果有FolderManager实例，设置其当前右键点击项目
            if (this.folderManager) {
                this.folderManager.setCurrentRightClickedItem_7ree(this.currentRightClickedItem);
            }
            
            const name = this.currentRightClickedItem.querySelector('.tree-item-name').textContent;
            const renameInput = document.getElementById('rename-input');
            const renameDialog = document.getElementById('rename-dialog');
            const resetButton = document.getElementById('reset-rename-7ree');
            const dialogTitle = renameDialog.querySelector('.dialog-title');
            
            if (renameInput && renameDialog) {
                renameInput.value = name;
                renameDialog.style.display = 'flex';
                
                // 设置对话框标题为"修改别名"
                if (dialogTitle) {
                    dialogTitle.textContent = '修改别名';
                }
                
                // 对于收藏文件的修改别名，显示重置按钮
                if (resetButton) {
                    resetButton.style.display = 'inline-block';
                }
                
                renameInput.focus();
                renameInput.select(); // 选中所有文本以便用户直接编辑
            }
        }
    }

    /**
     * 处理收藏项目移除菜单
     */
    handleCollectionMenuRemove_7ree() {
        if (this.currentRightClickedItem) {
            // 如果有FolderManager实例，使用其删除功能
            if (this.folderManager) {
                // 设置FolderManager的当前右键点击项目
                this.folderManager.setCurrentRightClickedItem_7ree(this.currentRightClickedItem);
                
                // 使用FolderManager的删除功能（显示确认对话框）
                this.folderManager.removeFolder_7ree();
            } else {
                // 备用方案：直接发送删除请求
                const itemId = this.currentRightClickedItem.getAttribute('data-id');
                this.vscode.postMessage({
                    command: 'removeFromCollection',
                    itemId: itemId
                });
            }
        }
    }

    /**
     * 处理收藏项目复制路径菜单
     */
    handleCollectionMenuCopyPath_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            if (filePath) {
                this.vscode.postMessage({
                    command: 'copyPath',
                    filePath: filePath
                });
            }
        }
    }

    /**
     * 处理收藏项目打开路径菜单
     */
    handleCollectionMenuRevealInExplorer_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            if (filePath) {
                this.vscode.postMessage({
                    command: 'revealInExplorer',
                    filePath: filePath
                });
            }
        }
    }

    /**
     * 处理文件夹重命名菜单
     */
    handleFolderMenuRename_7ree() {
        if (this.currentRightClickedItem) {
            // 如果有FolderManager实例，设置其当前右键点击项目
            if (this.folderManager) {
                this.folderManager.setCurrentRightClickedItem_7ree(this.currentRightClickedItem);
            }
            
            const currentName = this.currentRightClickedItem.querySelector('.tree-item-name').textContent;
            const renameInput = document.getElementById('rename-input');
            const renameDialog = document.getElementById('rename-dialog');
            const resetButton = document.getElementById('reset-rename-7ree');
            const dialogTitle = renameDialog.querySelector('.dialog-title');
            
            if (renameInput && renameDialog) {
                renameInput.value = currentName;
                renameDialog.style.display = 'flex';
                
                // 设置对话框标题为"文件夹改名"
                if (dialogTitle) {
                    dialogTitle.textContent = '文件夹改名';
                }
                
                // 对于收藏分类文件夹的重命名，隐藏重置按钮
                if (resetButton) {
                    resetButton.style.display = 'none';
                }
                
                renameInput.focus();
                renameInput.select(); // 选中所有文本以便用户直接编辑
            }
        }
    }

    /**
     * 处理文件夹移除菜单
     */
    handleFolderMenuRemove_7ree() {
        if (this.currentRightClickedItem) {
            const folderId = this.currentRightClickedItem.getAttribute('data-id');
            
            // 发送移除请求到主线程
            this.vscode.postMessage({
                command: 'showDeleteFolderConfirmation',
                folderId: folderId
            });
        }
    }

    /**
     * 处理搜索结果添加到收藏菜单
     */
    handleSearchMenuAddToCollection_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            this.vscode.postMessage({
                command: 'addToCollection',
                filePath: filePath
            });
        }
    }

    /**
     * 处理搜索结果复制路径菜单
     */
    handleSearchMenuCopyPath_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            this.vscode.postMessage({
                command: 'copyPath',
                filePath: filePath
            });
        }
    }

    /**
     * 处理搜索结果打开路径菜单
     */
    handleSearchMenuRevealInExplorer_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            this.vscode.postMessage({
                command: 'revealInExplorer',
                filePath: filePath
            });
        }
    }

    /**
     * 清除所有上下文菜单选中状态
     */
    clearAllContextMenuSelection_7ree() {
        // 清除收藏项目中的选中状态
        const collectionSelectedItems = document.querySelectorAll('.tree-item.context-menu-selected');
        collectionSelectedItems.forEach(item => {
            item.classList.remove('context-menu-selected');
        });
        
        // 清除搜索结果中的选中状态
        const searchSelectedItems = document.querySelectorAll('.result-item.context-menu-selected');
        searchSelectedItems.forEach(item => {
            item.classList.remove('context-menu-selected');
        });
        
        // 重置当前选中项
        this.currentRightClickedItem = null;
    }

    /**
     * 获取当前右键点击的项目
     * @returns {HTMLElement|null} 当前右键点击的项目元素
     */
    getCurrentRightClickedItem_7ree() {
        return this.currentRightClickedItem;
    }

    /**
     * 设置当前右键点击的项目
     * @param {HTMLElement} item 项目元素
     */
    setCurrentRightClickedItem_7ree(item) {
        this.currentRightClickedItem = item;
    }

    /**
     * 处理收藏项目侧边打开菜单
     */
    handleCollectionMenuOpenBeside_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            if (filePath) {
                this.vscode.postMessage({
                    command: 'openFileBeside',
                    filePath: filePath
                });
                
                if (typeof webviewDebugLog === 'function') {
                    webviewDebugLog('ContextMenuHandler', '收藏项目侧边打开', {
                        filePath: filePath
                    });
                }
            }
        }
    }

    /**
     * 处理搜索结果侧边打开菜单
     */
    handleSearchMenuOpenBeside_7ree() {
        if (this.currentRightClickedItem) {
            const filePath = this.currentRightClickedItem.getAttribute('data-path');
            if (filePath) {
                this.vscode.postMessage({
                    command: 'openFileBeside',
                    filePath: filePath
                });
                
                if (typeof webviewDebugLog === 'function') {
                    webviewDebugLog('ContextMenuHandler', '搜索结果侧边打开', {
                        filePath: filePath
                    });
                }
            }
        }
    }
}

// 导出模块
window.ContextMenuHandler_7ree = ContextMenuHandler_7ree; 