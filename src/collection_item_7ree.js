/**
 * Everything Sidebar 7ree 收藏项目操作模块
 * 负责收藏操作、删除、收藏文件夹创建、移动等行为
 */

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * 收藏项目管理类
 */
class CollectionItemManager {
    /**
     * 构造函数
     * @param {Object} webviewManager WebView管理器实例
     * @param {Object} collectionTreeManager 收藏树管理器实例
     * @param {Object} noticeManager 通知管理器实例
     */
    constructor(webviewManager, collectionTreeManager, noticeManager) {
        this.webviewManager = webviewManager;
        this.collectionTreeManager = collectionTreeManager;
        this.noticeManager = noticeManager;
        this.collections = []; // 收藏项目列表
        this.collectionFile = null; // 收藏文件路径
        
        debugLog_7ree('CollectionItem', '模块加载完成');
    }

    /**
     * 初始化收藏项目操作
     * @param {vscode.ExtensionContext} context 插件上下文
     */
    initialize(context) {
        debugLog_7ree('CollectionItem', '[CollectionItemManager] INITIALIZING CollectionItemManager instance');
        // 设置收藏文件路径
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const vscodeDir = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
            this.collectionFile = path.join(vscodeDir, 'everything-sidebar-7ree-collection.json');
            
            // 确保.vscode目录存在
            if (!fs.existsSync(vscodeDir)) {
                fs.mkdirSync(vscodeDir, { recursive: true });
            }
        }
        
        // 加载收藏数据
        this.loadCollections();
        
        // 注册WebView消息处理
        this.registerMessageHandlers();
        
        debugLog_7ree('CollectionItem', '收藏项目操作已初始化');
    }

    /**
     * 注册WebView消息处理函数
     */
    registerMessageHandlers() {
        debugLog_7ree('CollectionItem', '[CollectionItemManager] REGISTERING message handlers');
        
        // 如果WebView管理器不存在，跳过注册
        if (!this.webviewManager) {
            debugLog_7ree('CollectionItem', '[CollectionItemManager] WebView管理器不存在，跳过消息处理注册');
            return;
        }
        
        // 在WebViewManager中添加消息处理
        const originalHandleMessage = this.webviewManager.handleMessage.bind(this.webviewManager);
        
        this.webviewManager.handleMessage = (message) => {
            debugLog_7ree('CollectionItem', '[CollectionItemManager] Received message', message);
            let handled = false;
            switch (message.command) {
                case 'addToCollection':
                    debugLog_7ree('CollectionItem', '[CollectionItemManager] Handling addToCollection', message);
                    this.addItem(message.filePath, message.name);
                    handled = true;
                    break;
                case 'removeFromCollection':
                    debugLog_7ree('CollectionItem', '[CollectionItemManager] Handling removeFromCollection', message);
                    this.removeItem(message.id);
                    handled = true;
                    break;
                case 'createCollectionFolder':
                    debugLog_7ree('CollectionItem', '[CollectionItemManager] Handling createCollectionFolder', message);
                    this.createFolder(message.name);
                    handled = true;
                    break;
                case 'moveToFolder':
                    debugLog_7ree('CollectionItem', '[CollectionItemManager] Handling moveToFolder', message);
                    this.moveToFolder(message.itemId, message.folderId);
                    handled = true;
                    break;
                case 'renameCollectionItem':
                    debugLog_7ree('CollectionItem', '[CollectionItemManager] Handling renameCollectionItem', message);
                    this.renameItem(message.id, message.newName);
                    handled = true;
                    break;
                case 'renameCollectionFolder':
                    debugLog_7ree('CollectionItem', '[CollectionItemManager] Handling renameCollectionFolder', message);
                    this.renameItem(message.id, message.newName);
                    handled = true;
                    break;
                case 'reorderCollectionItem_7ree':
                    debugLog_7ree('CollectionItem', '[CollectionItemManager] Handling reorderCollectionItem_7ree', message);
                    this.reorderItem(message.draggedId, message.targetId, message.position);
                    handled = true;
                    break;
            }
            
            if (!handled) {
                debugLog_7ree('CollectionItem', '[CollectionItemManager] Message not handled, passing to original handler for:', message.command);
                originalHandleMessage(message);
            } else {
                debugLog_7ree('CollectionItem', '[CollectionItemManager] Message handled:', message.command);
            }
        };
        
        debugLog_7ree('CollectionItem', '已注册WebView消息处理函数');
    }

    /**
     * 添加项目到收藏（公共方法，可直接调用）
     * @param {Object} options 添加选项
     * @param {string} options.filePath 文件路径
     * @param {string} options.fileName 文件名
     * @param {boolean} options.isDirectory 是否为目录
     */
    async addToCollection(options) {
        try {
            const { filePath, fileName, isDirectory } = options;
            debugLog_7ree('CollectionItem', '[addToCollection] 直接添加收藏', options);
            
            // 调用内部添加方法
            this.addItem(filePath, fileName);
            
            debugLog_7ree('CollectionItem', '[addToCollection] 收藏添加成功');
            return true;
        } catch (error) {
            debugLog_7ree('CollectionItem', '[addToCollection] 收藏添加失败', error);
            throw error;
        }
    }

    /**
     * 加载收藏数据
     */
    loadCollections() {
        try {
            debugLog_7ree('CollectionItem', '[CollectionItemManager] Attempting to load collections from:', this.collectionFile);
            if (this.collectionFile && fs.existsSync(this.collectionFile)) {
                const data = fs.readFileSync(this.collectionFile, 'utf8');
                this.collections = JSON.parse(data);
                
                // 新增：清理重复项目
                this._removeDuplicates_7ree();
                
                // 更新收藏树管理器中的数据
                if (this.collectionTreeManager) {
                    this.collectionTreeManager.loadCollections(this.collections);
                }
                
                debugLog_7ree('CollectionItem', `已加载${this.collections.length}个收藏项`);
            } else {
                this.collections = [];
                debugLog_7ree('CollectionItem', '没有找到收藏文件，使用空收藏列表');
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '加载收藏数据失败', error);
            this.collections = [];
        }
    }

    /**
     * 移除重复的收藏项目
     * @private
     */
    _removeDuplicates_7ree() {
        const originalLength = this.collections.length;
        const seen = new Set();
        const uniqueCollections = [];
        
        for (const item of this.collections) {
            // 对于文件夹，使用名称和类型作为唯一标识
            // 对于文件，使用路径作为唯一标识
            const key = item.type === 'folder' 
                ? `folder:${item.name}:${item.parentId || 'root'}`
                : `file:${item.path}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                uniqueCollections.push(item);
            } else {
                debugLog_7ree('CollectionItem', '[CollectionItemManager] Removing duplicate item:', item);
            }
        }
        
        if (uniqueCollections.length !== originalLength) {
            this.collections = uniqueCollections;
            debugLog_7ree('CollectionItem', `[CollectionItemManager] Removed ${originalLength - uniqueCollections.length} duplicate items`);
            // 保存清理后的数据
            this._saveCollectionsWithoutNotification_7ree();
        }
    }

    /**
     * 保存收藏数据（不触发通知和渲染）
     * @private
     */
    _saveCollectionsWithoutNotification_7ree() {
        try {
            if (this.collectionFile) {
                const data = JSON.stringify(this.collections, null, 2);
                fs.writeFileSync(this.collectionFile, data, 'utf8');
                debugLog_7ree('CollectionItem', '[CollectionItemManager] Collections saved without notification');
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '保存收藏数据失败', error);
        }
    }

    /**
     * 保存收藏数据
     */
    saveCollections() {
        try {
            debugLog_7ree('CollectionItem', '[CollectionItemManager] Attempting to save collections to:', this.collectionFile);
            if (this.collectionFile) {
                const data = JSON.stringify(this.collections, null, 2);
                fs.writeFileSync(this.collectionFile, data, 'utf8');
                
                // 更新收藏树管理器中的数据
                if (this.collectionTreeManager) {
                    this.collectionTreeManager.loadCollections(this.collections);
                    
                    // 通知WebView更新（如果WebView存在）
                    this.collectionTreeManager.renderCollectionTree();
                }
                
                debugLog_7ree('CollectionItem', '收藏数据已保存');
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '保存收藏数据失败', error);
            vscode.window.showErrorMessage(`保存收藏失败: ${error.message}`);
        }
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    }

    /**
     * 添加项目到收藏
     * @param {string} filePath 文件路径
     * @param {string} name 显示名称（可选）
     */
    addItem(filePath, name) {
        try {
            // 检查是否已经存在
            const existingItem = this.collections.find(item => item.path === filePath);
            if (existingItem) {
                debugLog_7ree('CollectionItem', `文件已在收藏中: ${filePath}`);
                return;
            }
            
            // 创建新收藏项
            const newItem = {
                id: this.generateId(),
                path: filePath,
                name: name || path.basename(filePath),
                type: 'file',
                addedAt: new Date().toISOString()
            };
            
            // 添加到收藏列表
            this.collections.push(newItem);
            
            // 保存收藏
            this.saveCollections();
            
            debugLog_7ree('CollectionItem', `已添加文件到收藏: ${filePath}`);
            
            // 显示状态栏通知
            if (this.noticeManager) {
                this.noticeManager.showSuccess(`已添加 "${newItem.name}" 到收藏`);
            }
            
            // 通知WebView（如果WebView管理器存在）
            if (this.webviewManager) {
                this.webviewManager.postMessage({
                    command: 'itemAddedToCollection',
                    item: newItem
                });
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '添加收藏失败', error);
            vscode.window.showErrorMessage(`添加收藏失败: ${error.message}`);
        }
    }

    /**
     * 移除收藏项目
     * @param {string} id 项目ID
     */
    removeItem(id) {
        try {
            // 查找项目索引
            const index = this.collections.findIndex(item => item.id === id);
            if (index === -1) {
                debugLog_7ree('CollectionItem', `未找到收藏项: ${id}`);
                return;
            }
            
            // 如果是文件夹，需要同时删除其中的项目
            const item = this.collections[index];
            if (item.type === 'folder') {
                // 移除所有属于该文件夹的项目
                this.collections = this.collections.filter(i => i.parentId !== id);
            }
            
            // 从收藏列表中移除
            this.collections.splice(index, 1);
            
            // 保存收藏
            this.saveCollections();
            
            debugLog_7ree('CollectionItem', `已移除收藏项目: ${id}`);
            
            // 显示状态栏通知
            if (this.noticeManager) {
                this.noticeManager.showSuccess(`已移除 "${item.name}" 从收藏`);
            }
            
            // 通知WebView（如果WebView管理器存在）
            if (this.webviewManager) {
                this.webviewManager.postMessage({
                    command: 'itemRemovedFromCollection',
                    id: id
                });
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '移除收藏失败', error);
            vscode.window.showErrorMessage(`移除收藏失败: ${error.message}`);
        }
    }

    /**
     * 创建收藏文件夹
     * @param {string} name 文件夹名称
     */
    createFolder(name) {
        try {
            // 创建新文件夹
            const newFolder = {
                id: this.generateId(),
                name: name,
                type: 'folder',
                addedAt: new Date().toISOString()
            };
            
            // 添加到收藏列表
            this.collections.push(newFolder);
            
            // 保存收藏
            debugLog_7ree('CollectionItem', '[CollectionItemManager] Before saveCollections in createFolder for:', newFolder.name);
            this.saveCollections();
            debugLog_7ree('CollectionItem', '[CollectionItemManager] After saveCollections in createFolder for:', newFolder.name);
            
            debugLog_7ree('CollectionItem', `已创建收藏文件夹: ${name}, ID: ${newFolder.id}`);
            
            // 显示状态栏通知
            if (this.noticeManager) {
                this.noticeManager.showSuccess(`已创建收藏文件夹 "${name}"`);
            }
            
            // 通知WebView（如果WebView管理器存在）
            if (this.webviewManager) {
                debugLog_7ree('CollectionItem', '[CollectionItemManager] Sending folderCreated to WebView for:', newFolder.id);
                this.webviewManager.postMessage({
                    command: 'folderCreated',
                    folder: newFolder
                });
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '创建收藏文件夹失败', error);
            vscode.window.showErrorMessage(`创建收藏文件夹失败: ${error.message}`);
        }
    }

    /**
     * 将项目移动到文件夹
     * @param {string} itemId 项目ID
     * @param {string} folderId 文件夹ID，如果为null则移动到根目录
     */
    moveToFolder(itemId, folderId) {
        try {
            // 查找项目
            const item = this.collections.find(i => i.id === itemId);
            if (!item) {
                debugLog_7ree('CollectionItem', `未找到收藏项: ${itemId}`);
                return;
            }
            
            // 如果指定了文件夹ID，确保文件夹存在
            if (folderId) {
                const folder = this.collections.find(i => i.id === folderId && i.type === 'folder');
                if (!folder) {
                    debugLog_7ree('CollectionItem', `未找到收藏文件夹: ${folderId}`);
                    return;
                }
            }
            
            // 更新项目的父文件夹ID
            item.parentId = folderId || null;
            
            // 保存收藏
            this.saveCollections();
            
            debugLog_7ree('CollectionItem', `已将项目 ${itemId} 移动到文件夹 ${folderId || '根目录'}`);
            
            // 通知WebView（如果WebView管理器存在）
            if (this.webviewManager) {
                this.webviewManager.postMessage({
                    command: 'itemMoved',
                    itemId: itemId,
                    folderId: folderId
                });
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '移动收藏项失败', error);
            vscode.window.showErrorMessage(`移动收藏项失败: ${error.message}`);
        }
    }

    /**
     * 重命名收藏项
     * @param {string} id 项目ID
     * @param {string} newName 新名称
     */
    renameItem(id, newName) {
        try {
            // 查找项目
            const item = this.collections.find(i => i.id === id);
            if (!item) {
                debugLog_7ree('CollectionItem', `未找到收藏项: ${id}`);
                return;
            }
            
            // 更新名称
            item.name = newName;
            
            // 保存收藏
            this.saveCollections();
            
            debugLog_7ree('CollectionItem', `已重命名收藏项 ${id} 为 ${newName}`);
            
            // 通知WebView（如果WebView管理器存在）
            if (this.webviewManager) {
                this.webviewManager.postMessage({
                    command: 'itemRenamed',
                    id: id,
                    newName: newName
                });
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '重命名收藏项失败', error);
            vscode.window.showErrorMessage(`重命名收藏项失败: ${error.message}`);
        }
    }

    /**
     * 重新排序收藏项
     * @param {string} draggedId 被拖动的项目ID
     * @param {string} targetId 目标项目ID
     * @param {string} position 插入位置 ('before' 或 'after')
     */
    reorderItem(draggedId, targetId, position) {
        try {
            // 查找项目
            const draggedItem = this.collections.find(i => i.id === draggedId);
            if (!draggedItem) {
                debugLog_7ree('CollectionItem', `未找到收藏项: ${draggedId}`);
                return;
            }
            
            // 查找目标项目
            const targetItem = this.collections.find(i => i.id === targetId);
            if (!targetItem) {
                debugLog_7ree('CollectionItem', `未找到目标收藏项: ${targetId}`);
                return;
            }
            
            // 如果拖动的项目和目标项目不在同一层级，先移动到目标层级
            if (draggedItem.parentId !== targetItem.parentId) {
                debugLog_7ree('CollectionItem', `跨层级拖放：将项目 ${draggedId} 从层级 ${draggedItem.parentId || 'root'} 移动到层级 ${targetItem.parentId || 'root'}`);
                // 更新被拖动项目的父级ID
                draggedItem.parentId = targetItem.parentId;
            }
            
            // 获取同一层级的所有项目
            const parentId = targetItem.parentId || null;
            const sameParentItems = this.collections.filter(item => 
                (item.parentId || null) === parentId
            );
            
            // 从同级项目中移除被拖动的项目
            const draggedIndex = sameParentItems.findIndex(item => item.id === draggedId);
            if (draggedIndex === -1) return;
            
            sameParentItems.splice(draggedIndex, 1);
            
            // 找到目标项目在同级项目中的新位置
            const targetIndex = sameParentItems.findIndex(item => item.id === targetId);
            if (targetIndex === -1) return;
            
            // 根据位置插入
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            sameParentItems.splice(insertIndex, 0, draggedItem);
            
            // 重新构建完整的收藏列表，保持正确的顺序
            // 简化逻辑：直接更新原数组中同级项目的顺序
            
            // 首先从原数组中移除所有同级项目
            this.collections = this.collections.filter(item => 
                (item.parentId || null) !== parentId
            );
            
            // 然后将重新排序的同级项目添加回去
            // 为了保持正确的位置，我们需要找到合适的插入点
            let insertPosition = 0;
            
            // 如果有其他层级的项目，找到合适的插入位置
            if (this.collections.length > 0) {
                // 简单策略：将同级项目插入到数组末尾
                // 这样可以确保排序生效，具体的显示顺序由buildCollectionTree处理
                insertPosition = this.collections.length;
            }
            
            // 在指定位置插入重新排序的同级项目
            this.collections.splice(insertPosition, 0, ...sameParentItems);
            
            // 保存收藏
            this.saveCollections();
            
            debugLog_7ree('CollectionItem', `已重新排序收藏项 ${draggedId} 到 ${targetId} 的 ${position}`);
            
            // 通知WebView（如果WebView管理器存在）
            if (this.webviewManager) {
                this.webviewManager.postMessage({
                    command: 'itemReordered_7ree',
                    draggedId: draggedId,
                    targetId: targetId,
                    position: position
                });
            }
        } catch (error) {
            debugLog_7ree('CollectionItem', '重新排序收藏项失败', error);
            vscode.window.showErrorMessage(`重新排序收藏项失败: ${error.message}`);
        }
    }
}

module.exports = CollectionItemManager;