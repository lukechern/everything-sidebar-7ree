/**
 * Everything Sidebar 7ree 文件夹管理模块
 * 负责收藏文件夹的创建、重命名、删除等操作
 */

class FolderManager_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     */
    constructor(vscode) {
        this.vscode = vscode;
        this.currentRightClickedCollectionItem = null;
    }

    /**
     * 初始化文件夹管理功能
     */
    initializeFolderManager_7ree() {
        // 获取DOM元素
        this.createFolderDialog = document.getElementById('create-folder-dialog');
        this.folderNameInput = document.getElementById('folder-name-input');
        this.renameDialog = document.getElementById('rename-dialog');
        this.renameInput = document.getElementById('rename-input');
        this.folderContextMenu = document.getElementById('folder-context-menu');
        this.confirmDeleteDialog = document.getElementById('confirm-delete-dialog');
        this.deleteMessage = document.getElementById('delete-message');
        
        // 绑定事件监听器
        this.bindEventListeners_7ree();
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners_7ree() {
        // 创建文件夹按钮点击事件
        const createFolderButton = document.getElementById('create-folder-button');
        if (createFolderButton) {
            createFolderButton.addEventListener('click', () => {
                this.showCreateFolderDialog_7ree();
            });
        }

        // 确认创建文件夹
        const confirmCreateFolder = document.getElementById('confirm-create-folder');
        if (confirmCreateFolder) {
            confirmCreateFolder.addEventListener('click', () => {
                this.confirmCreateFolder_7ree();
            });
        }

        // 取消创建文件夹
        const cancelCreateFolder = document.getElementById('cancel-create-folder');
        if (cancelCreateFolder) {
            cancelCreateFolder.addEventListener('click', () => {
                this.cancelCreateFolder_7ree();
            });
        }

        // 确认重命名
        const confirmRename = document.getElementById('confirm-rename');
        if (confirmRename) {
            confirmRename.addEventListener('click', () => {
                this.confirmRename_7ree();
            });
        }

        // 重置重命名
        const resetRename = document.getElementById('reset-rename-7ree');
        if (resetRename) {
            resetRename.addEventListener('click', () => {
                this.resetRename_7ree();
            });
        }

        // 取消重命名
        const cancelRename = document.getElementById('cancel-rename');
        if (cancelRename) {
            cancelRename.addEventListener('click', () => {
                this.cancelRename_7ree();
            });
        }

        // 确认删除
        const confirmDelete = document.getElementById('confirm-delete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => {
                this.confirmDelete_7ree();
            });
        }

        // 取消删除
        const cancelDelete = document.getElementById('cancel-delete');
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => {
                this.cancelDelete_7ree();
            });
        }

        // 文件夹上下文菜单项点击事件
        // 注意：文件夹重命名菜单现在由ContextMenuHandler直接处理
        // 这里不再需要绑定事件，因为逻辑已移至context_menu_handler_7ree.js中

        const folderMenuRemove = document.getElementById('folder-menu-remove');
        if (folderMenuRemove) {
            folderMenuRemove.addEventListener('click', () => {
                this.removeFolder_7ree();
            });
        }

        // 键盘事件监听
        this.bindKeyboardEvents_7ree();
    }

    /**
     * 绑定键盘事件
     */
    bindKeyboardEvents_7ree() {
        // 创建文件夹对话框的键盘事件
        if (this.folderNameInput) {
            this.folderNameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.confirmCreateFolder_7ree();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    this.cancelCreateFolder_7ree();
                }
            });
        }

        // 重命名对话框的键盘事件
        if (this.renameInput) {
            this.renameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.confirmRename_7ree();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    this.cancelRename_7ree();
                }
            });
        }

        // 全局键盘事件处理
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // 优先处理重命名对话框
                if (this.renameDialog && this.renameDialog.style.display === 'flex') {
                    event.preventDefault();
                    this.cancelRename_7ree();
                    return;
                }
                
                // 处理创建文件夹对话框
                if (this.createFolderDialog && this.createFolderDialog.style.display === 'flex') {
                    event.preventDefault();
                    this.cancelCreateFolder_7ree();
                    return;
                }
                
                // 处理确认删除对话框
                if (this.confirmDeleteDialog && this.confirmDeleteDialog.style.display === 'flex') {
                    event.preventDefault();
                    this.cancelDelete_7ree();
                    return;
                }
            }
            
            // 处理Enter键
            if (event.key === 'Enter') {
                // 重命名对话框
                if (this.renameDialog && this.renameDialog.style.display === 'flex' && 
                    document.activeElement !== this.renameInput) {
                    event.preventDefault();
                    this.confirmRename_7ree();
                    return;
                }
                
                // 创建文件夹对话框
                if (this.createFolderDialog && this.createFolderDialog.style.display === 'flex' && 
                    document.activeElement !== this.folderNameInput) {
                    event.preventDefault();
                    this.confirmCreateFolder_7ree();
                    return;
                }
                
                // 确认删除对话框
                if (this.confirmDeleteDialog && this.confirmDeleteDialog.style.display === 'flex') {
                    event.preventDefault();
                    this.confirmDelete_7ree();
                    return;
                }
            }
        });
    }

    /**
     * 显示创建文件夹对话框
     */
    showCreateFolderDialog_7ree() {
        if (this.folderNameInput && this.createFolderDialog) {
            this.folderNameInput.value = '';
            this.createFolderDialog.style.display = 'flex';
            this.folderNameInput.focus();
        }
    }

    /**
     * 确认创建文件夹
     */
    confirmCreateFolder_7ree() {
        if (this.folderNameInput && this.createFolderDialog) {
            const folderName = this.folderNameInput.value.trim();
            if (folderName) {
                console.log('[UI] Sending createCollectionFolder message for folder:', folderName);
                this.vscode.postMessage({
                    command: 'createCollectionFolder',
                    name: folderName
                });
                this.createFolderDialog.style.display = 'none';
            } else {
                // 显示错误提示
                this.showValidationError_7ree(this.folderNameInput, '文件夹名称不能为空');
            }
        }
    }

    /**
     * 取消创建文件夹
     */
    cancelCreateFolder_7ree() {
        if (this.createFolderDialog) {
            this.createFolderDialog.style.display = 'none';
        }
    }

    /**
     * 确认重命名
     */
    confirmRename_7ree() {
        if (this.renameInput && this.renameDialog && this.currentRightClickedCollectionItem) {
            const newName = this.renameInput.value.trim();
            if (newName) {
                const id = this.currentRightClickedCollectionItem.getAttribute('data-id');
                const itemType = this.currentRightClickedCollectionItem.getAttribute('data-type');
                
                // 根据项目类型发送不同的命令
                if (itemType === 'folder') {
                    // 收藏分类文件夹重命名
                    this.vscode.postMessage({
                        command: 'renameCollectionFolder',
                        id: id,
                        newName: newName
                    });
                } else {
                    // 收藏文件修改别名
                    this.vscode.postMessage({
                        command: 'renameCollectionItem',
                        id: id,
                        newName: newName
                    });
                }
                
                this.renameDialog.style.display = 'none';
            } else {
                // 显示错误提示
                this.showValidationError_7ree(this.renameInput, '名称不能为空');
            }
        }
    }

    /**
     * 重置重命名输入框为文件原名
     */
    resetRename_7ree() {
        if (this.currentRightClickedCollectionItem && this.renameInput) {
            const itemType = this.currentRightClickedCollectionItem.getAttribute('data-type');
            
            // 如果是文件夹类型，重置功能不适用，因为文件夹名称是用户自定义的
            if (itemType === 'folder') {
                // 对于文件夹，可以显示提示信息或者什么都不做
                // 这里我们简单地清空输入框
                this.renameInput.value = '';
                this.renameInput.focus();
                return;
            }
            
            // 对于文件项目，从文件路径中提取原始文件名
            const filePath = this.currentRightClickedCollectionItem.getAttribute('data-path');
            if (filePath) {
                // 从文件路径中提取原始文件名
                const originalFileName = filePath.split(/[\\\/]/).pop();
                if (originalFileName) {
                    this.renameInput.value = originalFileName;
                    // 重新聚焦并选中所有文本
                    this.renameInput.focus();
                    this.renameInput.select();
                }
            }
        }
    }

    /**
     * 取消重命名
     */
    cancelRename_7ree() {
        if (this.renameDialog) {
            this.renameDialog.style.display = 'none';
        }
    }

    /**
     * 删除文件夹
     */
    removeFolder_7ree() {
        if (this.currentRightClickedCollectionItem) {
            const id = this.currentRightClickedCollectionItem.getAttribute('data-id');
            const name = this.currentRightClickedCollectionItem.querySelector('.tree-item-content > div').textContent;
            const itemType = this.currentRightClickedCollectionItem.getAttribute('data-type');
            
            // 设置确认对话框的消息
            if (this.deleteMessage) {
                if (itemType === 'folder') {
                    this.deleteMessage.textContent = `确定要删除文件夹 "${name}" 吗？\n\n注意：文件夹内的所有项目也会被删除。`;
                } else {
                    this.deleteMessage.textContent = `确定要移除收藏 "${name}" 吗？`;
                }
            }
            
            // 显示确认对话框
            if (this.confirmDeleteDialog) {
                this.confirmDeleteDialog.style.display = 'flex';
            }
        }
    }

    /**
     * 确认删除
     */
    confirmDelete_7ree() {
        if (this.currentRightClickedCollectionItem) {
            const id = this.currentRightClickedCollectionItem.getAttribute('data-id');
            
            // 发送删除消息
            this.vscode.postMessage({
                command: 'removeFromCollection',
                id: id
            });
            
            // 关闭对话框
            this.cancelDelete_7ree();
        }
    }

    /**
     * 取消删除
     */
    cancelDelete_7ree() {
        if (this.confirmDeleteDialog) {
            this.confirmDeleteDialog.style.display = 'none';
        }
    }

    /**
     * 显示文件夹上下文菜单
     * @param {Event} event 鼠标事件
     * @param {HTMLElement} item 文件夹项目元素
     */
    showFolderContextMenu_7ree(event, item) {
        // 保存当前右键点击的项
        this.currentRightClickedCollectionItem = item;
        
        if (this.folderContextMenu) {
            // 设置菜单位置
            this.folderContextMenu.style.left = `${event.pageX}px`;
            this.folderContextMenu.style.top = `${event.pageY}px`;
            this.folderContextMenu.style.display = 'block';
            
            // 点击其他区域关闭菜单
            document.addEventListener('click', this.closeFolderContextMenu_7ree.bind(this));
        }
    }

    /**
     * 关闭文件夹上下文菜单
     */
    closeFolderContextMenu_7ree() {
        if (this.folderContextMenu) {
            this.folderContextMenu.style.display = 'none';
            document.removeEventListener('click', this.closeFolderContextMenu_7ree.bind(this));
        }
        
        // 清除选中状态（通过调用收藏管理模块来清除）
        if (this.currentRightClickedCollectionItem) {
            this.currentRightClickedCollectionItem.classList.remove('context-menu-selected');
        }
    }

    /**
     * 显示验证错误提示
     * @param {HTMLElement} inputElement 输入框元素
     * @param {string} message 错误消息
     */
    showValidationError_7ree(inputElement, message) {
        // 添加错误样式
        inputElement.style.borderColor = 'var(--vscode-inputValidation-errorBorder)';
        inputElement.style.backgroundColor = 'var(--vscode-inputValidation-errorBackground)';
        
        // 显示错误提示
        let errorTip = inputElement.parentNode.querySelector('.validation-error-7ree');
        if (!errorTip) {
            errorTip = document.createElement('div');
            errorTip.className = 'validation-error-7ree';
            errorTip.style.color = 'var(--vscode-inputValidation-errorForeground)';
            errorTip.style.fontSize = '12px';
            errorTip.style.marginTop = '4px';
            inputElement.parentNode.appendChild(errorTip);
        }
        errorTip.textContent = message;
        
        // 聚焦输入框
        inputElement.focus();
        
        // 3秒后清除错误样式
        setTimeout(() => {
            this.clearValidationError_7ree(inputElement);
        }, 3000);
    }

    /**
     * 清除验证错误提示
     * @param {HTMLElement} inputElement 输入框元素
     */
    clearValidationError_7ree(inputElement) {
        // 恢复正常样式
        inputElement.style.borderColor = '';
        inputElement.style.backgroundColor = '';
        
        // 移除错误提示
        const errorTip = inputElement.parentNode.querySelector('.validation-error-7ree');
        if (errorTip) {
            errorTip.remove();
        }
    }

    /**
     * 验证文件夹名称
     * @param {string} name 文件夹名称
     * @returns {boolean} 是否有效
     */
    validateFolderName_7ree(name) {
        if (!name || name.trim().length === 0) {
            return false;
        }
        
        // 检查是否包含非法字符
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(name)) {
            return false;
        }
        
        // 检查长度限制
        if (name.length > 255) {
            return false;
        }
        
        return true;
    }

    /**
     * 获取当前右键点击的收藏项目
     * @returns {HTMLElement|null} 当前右键点击的项目元素
     */
    getCurrentRightClickedItem_7ree() {
        return this.currentRightClickedCollectionItem;
    }

    /**
     * 设置当前右键点击的收藏项目
     * @param {HTMLElement} item 项目元素
     */
    setCurrentRightClickedItem_7ree(item) {
        this.currentRightClickedCollectionItem = item;
    }
}

// 导出模块
window.FolderManager_7ree = FolderManager_7ree; 