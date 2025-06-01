/**
 * Everything Sidebar 7ree 拖拽处理模块
 * 负责收藏项目的拖拽排序和移动功能
 */

class DragHandler_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     */
    constructor(vscode) {
        this.vscode = vscode;
        this.containerEventsBound = false;
        this.draggedData = null; // 存储拖拽数据
    }

    /**
     * 初始化拖拽功能
     * @param {HTMLElement} collectionTree 收藏树容器元素
     */
    initializeDragHandlers_7ree(collectionTree) {
        // 为所有树项目添加拖拽事件监听器
        this.addDragEventListeners_7ree(collectionTree);
        
        // 为根容器添加拖拽事件监听器（只绑定一次）
        if (!this.containerEventsBound) {
            this.addContainerDragListeners_7ree(collectionTree);
            this.containerEventsBound = true;
        }
    }

    /**
     * 为树项目添加拖拽事件监听器
     * @param {HTMLElement} collectionTree 收藏树容器元素
     */
    addDragEventListeners_7ree(collectionTree) {
        const treeItems = collectionTree.querySelectorAll('.tree-item');
        
        treeItems.forEach((item, index) => {
            // 设置所有项目都可以拖拽
            item.draggable = true;
            
            // 移除之前的事件监听器（避免重复绑定）
            item.removeEventListener('dragstart', this.handleDragStart_7ree);
            item.removeEventListener('dragend', this.handleDragEnd_7ree);
            item.removeEventListener('dragover', this.handleDragOver_7ree);
            item.removeEventListener('dragleave', this.handleDragLeave_7ree);
            item.removeEventListener('drop', this.handleDrop_7ree);
            
            // 拖拽开始事件
            item.addEventListener('dragstart', (event) => {
                this.handleDragStart_7ree(event, item, index);
            });
            
            // 拖拽结束事件
            item.addEventListener('dragend', (event) => {
                this.handleDragEnd_7ree(event, item);
            });
            
            // 拖拽悬停事件
            item.addEventListener('dragover', (event) => {
                this.handleDragOver_7ree(event, item);
            });
            
            // 拖拽离开事件
            item.addEventListener('dragleave', (event) => {
                this.handleDragLeave_7ree(event, item);
            });
            
            // 拖拽放置事件
            item.addEventListener('drop', (event) => {
                this.handleDrop_7ree(event, item);
            });
        });
    }

    /**
     * 处理拖拽开始事件
     * @param {DragEvent} event 拖拽事件
     * @param {HTMLElement} item 拖拽的项目元素
     * @param {number} index 项目索引
     */
    handleDragStart_7ree(event, item, index) {
        const itemId = item.getAttribute('data-id');
        const itemType = item.getAttribute('data-type');
        
        // 存储拖拽数据
        this.draggedData = {
            id: itemId,
            type: itemType,
            sourceIndex: index
        };
        
        // 设置拖拽数据
        event.dataTransfer.setData('text/plain', itemId);
        event.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
        
        // 添加拖拽时的视觉反馈
        setTimeout(() => {
            item.style.opacity = '0.5';
        }, 0);
    }

    /**
     * 处理拖拽结束事件
     * @param {DragEvent} event 拖拽事件
     * @param {HTMLElement} item 拖拽的项目元素
     */
    handleDragEnd_7ree(event, item) {
        item.classList.remove('dragging');
        item.style.opacity = '';
        this.draggedData = null;
        
        // 清除所有拖拽相关的样式
        document.querySelectorAll('.drag-over, .drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        });
    }

    /**
     * 处理拖拽悬停事件
     * @param {DragEvent} event 拖拽事件
     * @param {HTMLElement} item 目标项目元素
     */
    handleDragOver_7ree(event, item) {
        event.preventDefault();
        event.stopPropagation();
        
        if (!this.draggedData) return;
        
        const currentItemId = item.getAttribute('data-id');
        
        // 不能拖拽到自己身上
        if (this.draggedData.id === currentItemId) return;
        
        const rect = item.getBoundingClientRect();
        const mouseY = event.clientY;
        const itemMiddle = rect.top + rect.height / 2;
        
        // 清除之前的样式
        item.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        
        const itemType = item.getAttribute('data-type');
        
        // 如果是文件夹，可以移动到文件夹内部或者在文件夹前后排序
        if (itemType === 'folder') {
            if (mouseY < rect.top + rect.height * 0.25) {
                // 在文件夹前面插入
                item.classList.add('drag-over-top');
                event.dataTransfer.dropEffect = 'move';
            } else if (mouseY > rect.top + rect.height * 0.75) {
                // 在文件夹后面插入
                item.classList.add('drag-over-bottom');
                event.dataTransfer.dropEffect = 'move';
            } else {
                // 移动到文件夹内部
                item.classList.add('drag-over');
                event.dataTransfer.dropEffect = 'move';
            }
        } else {
            // 如果是文件，只能在前后排序
            if (mouseY < itemMiddle) {
                item.classList.add('drag-over-top');
            } else {
                item.classList.add('drag-over-bottom');
            }
            event.dataTransfer.dropEffect = 'move';
        }
    }

    /**
     * 处理拖拽离开事件
     * @param {DragEvent} event 拖拽事件
     * @param {HTMLElement} item 目标项目元素
     */
    handleDragLeave_7ree(event, item) {
        // 只有当鼠标真正离开元素时才移除样式
        if (!item.contains(event.relatedTarget)) {
            item.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        }
    }

    /**
     * 处理拖拽放置事件
     * @param {DragEvent} event 拖拽事件
     * @param {HTMLElement} item 目标项目元素
     */
    handleDrop_7ree(event, item) {
        event.preventDefault();
        event.stopPropagation();
        
        if (!this.draggedData) return;
        
        const targetItemId = item.getAttribute('data-id');
        const targetItemType = item.getAttribute('data-type');
        
        // 清除样式
        item.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        
        // 不能拖拽到自己身上
        if (this.draggedData.id === targetItemId) return;
        
        const rect = item.getBoundingClientRect();
        const mouseY = event.clientY;
        
        if (targetItemType === 'folder') {
            if (mouseY < rect.top + rect.height * 0.25) {
                // 在文件夹前面插入
                this.sendReorderMessage_7ree(this.draggedData.id, targetItemId, 'before');
            } else if (mouseY > rect.top + rect.height * 0.75) {
                // 在文件夹后面插入
                this.sendReorderMessage_7ree(this.draggedData.id, targetItemId, 'after');
            } else {
                // 移动到文件夹内部
                this.sendMoveToFolderMessage_7ree(this.draggedData.id, targetItemId);
            }
        } else {
            // 文件排序
            const itemMiddle = rect.top + rect.height / 2;
            const position = mouseY < itemMiddle ? 'before' : 'after';
            this.sendReorderMessage_7ree(this.draggedData.id, targetItemId, position);
        }
    }

    /**
     * 为根容器添加拖拽事件监听器
     * @param {HTMLElement} collectionTree 收藏树容器元素
     */
    addContainerDragListeners_7ree(collectionTree) {
        // 为根容器添加拖拽事件监听器（移动到根目录）
        collectionTree.addEventListener('dragover', (event) => {
            // 只有当拖拽到空白区域时才允许放置
            if (event.target === collectionTree && this.draggedData) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            }
        });
        
        collectionTree.addEventListener('drop', (event) => {
            if (event.target === collectionTree && this.draggedData) {
                event.preventDefault();
                
                // 发送移动到根目录的请求
                this.sendMoveToFolderMessage_7ree(this.draggedData.id, null);
            }
        });
    }

    /**
     * 发送重新排序消息
     * @param {string} draggedId 被拖动的项目ID
     * @param {string} targetId 目标项目ID
     * @param {string} position 位置 ('before' 或 'after')
     */
    sendReorderMessage_7ree(draggedId, targetId, position) {
        this.vscode.postMessage({
            command: 'reorderCollectionItem_7ree',
            draggedId: draggedId,
            targetId: targetId,
            position: position
        });
    }

    /**
     * 发送移动到文件夹消息
     * @param {string} itemId 项目ID
     * @param {string} folderId 文件夹ID（null表示移动到根目录）
     */
    sendMoveToFolderMessage_7ree(itemId, folderId) {
        this.vscode.postMessage({
            command: 'moveToFolder',
            itemId: itemId,
            folderId: folderId
        });
    }
}

// 导出模块
window.DragHandler_7ree = DragHandler_7ree; 