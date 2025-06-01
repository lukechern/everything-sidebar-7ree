/**
 * Everything Sidebar 7ree 收藏树模块
 * 负责收藏文件树渲染逻辑
 */

const vscode = require('vscode');
const path = require('path');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * 收藏树管理类
 */
class CollectionTreeManager {
    /**
     * 构造函数
     * @param {Object} webviewManager WebView管理器实例
     */
    constructor(webviewManager) {
        this.webviewManager = webviewManager;
        this.collections = []; // 收藏项目列表
        
        debugLog_7ree('CollectionTree', '模块加载完成');
    }

    /**
     * 初始化收藏树
     */
    initialize() {
        // 注册WebView消息处理
        this.registerMessageHandlers();
        
        debugLog_7ree('CollectionTree', '收藏树已初始化');
    }

    /**
     * 注册WebView消息处理函数
     */
    registerMessageHandlers() {
        // 如果WebView管理器不存在，跳过注册
        if (!this.webviewManager) {
            debugLog_7ree('CollectionTree', '[CollectionTreeManager] WebView管理器不存在，跳过消息处理注册');
            return;
        }
        
        // 在WebViewManager中添加消息处理
        const originalHandleMessage = this.webviewManager.handleMessage.bind(this.webviewManager);
        
        this.webviewManager.handleMessage = (message) => {
            debugLog_7ree('CollectionTree', '[CollectionTreeManager] Received message', message);
            let handled = false;
            switch (message.command) {
                case 'getCollections':
                    debugLog_7ree('CollectionTree', '[CollectionTreeManager] Handling getCollections', message);
                    this.sendCollections();
                    handled = true;
                    break;
                case 'renderCollectionTree':
                    debugLog_7ree('CollectionTree', '[CollectionTreeManager] Handling renderCollectionTree', message);
                    this.renderCollectionTree();
                    handled = true;
                    break;
            }
            
            if (!handled) {
                debugLog_7ree('CollectionTree', '[CollectionTreeManager] Message not handled, passing to original handler for:', message.command);
                originalHandleMessage(message);
            } else {
                debugLog_7ree('CollectionTree', '[CollectionTreeManager] Message handled:', message.command);
            }
        };
        
        debugLog_7ree('CollectionTree', '已注册WebView消息处理函数');
    }

    /**
     * 加载收藏数据
     * @param {Array} collections 收藏数据数组
     */
    loadCollections(collections) {
        this.collections = collections || [];
        debugLog_7ree('CollectionTree', `已加载${this.collections.length}个收藏项`);
    }

    /**
     * 发送收藏数据到WebView
     */
    sendCollections() {
        // 如果WebView管理器不存在，跳过发送
        if (!this.webviewManager) {
            debugLog_7ree('CollectionTree', '[sendCollections] WebView管理器不存在，跳过发送');
            return;
        }
        
        // 发送原始收藏数据
        this.webviewManager.postMessage({
            command: 'collectionsData',
            collections: this.collections
        });
        
        // 同时渲染收藏树
        this.renderCollectionTree();
        
        debugLog_7ree('CollectionTree', '已发送收藏数据到WebView');
    }

    /**
     * 渲染收藏树
     */
    renderCollectionTree() {
        // 构建树形结构
        const treeData = this.buildCollectionTree();
        
        // 如果WebView管理器不存在，跳过发送
        if (!this.webviewManager) {
            debugLog_7ree('CollectionTree', '[renderCollectionTree] WebView管理器不存在，跳过渲染');
            return;
        }
        
        // 发送树形数据到WebView
        debugLog_7ree('CollectionTree', '[CollectionTreeManager] Sending collectionTreeData to WebView, treeData length:', treeData.length);
        this.webviewManager.postMessage({
            command: 'collectionTreeData',
            treeData: treeData
        });
        
        debugLog_7ree('CollectionTree', '已渲染收藏树');
    }

    /**
     * 构建收藏树形结构
     * @returns {Array} 树形结构数据
     */
    buildCollectionTree() {
        // 创建根节点映射
        const rootNodes = {};
        const rootItems = [];
        
        // 第一遍：先处理所有文件夹，建立文件夹节点
        this.collections.forEach(item => {
            if (item.type === 'folder') {
                rootNodes[item.id] = {
                    id: item.id,
                    label: item.name,
                    type: 'folder',
                    children: []
                };
            }
        });
        
        // 第二遍：按照数组顺序处理所有项目，建立父子关系
        this.collections.forEach(item => {
            // 如果有父文件夹ID
            if (item.parentId) {
                // 确保父节点存在
                if (!rootNodes[item.parentId]) {
                    debugLog_7ree('CollectionTree', `警告：找不到父文件夹 ${item.parentId}，项目 ${item.id} 将被移动到根目录`);
                    // 将项目移动到根目录
                    item.parentId = null;
                } else {
                    // 将项目添加到父节点的子节点列表
                    if (item.type === 'folder') {
                        // 如果是文件夹，添加已存在的节点
                        rootNodes[item.parentId].children.push(rootNodes[item.id]);
                    } else {
                        // 如果是文件，创建文件节点
                        rootNodes[item.parentId].children.push({
                            id: item.id,
                            label: item.name || path.basename(item.path),
                            path: item.path,
                            type: item.type || 'file'
                        });
                    }
                }
            }
            
            // 如果是根节点（没有父ID）
            if (!item.parentId) {
                if (item.type === 'folder') {
                    // 如果是文件夹，添加已存在的节点
                    rootItems.push(rootNodes[item.id]);
                } else {
                    // 如果是文件，直接添加到根列表
                    rootItems.push({
                        id: item.id,
                        label: item.name || path.basename(item.path),
                        path: item.path,
                        type: item.type || 'file'
                    });
                }
            }
        });
        
        // 注意：移除了自动排序逻辑，保持用户拖放的顺序
        // 用户通过拖放操作已经设置了期望的顺序，我们应该保持这个顺序
        
        return rootItems;
    }
}

module.exports = CollectionTreeManager;