const vscode = require('vscode');
const path = require('path');

/**
 * 批量获取 WebView 资源的 webviewUri 映射
 * @param {vscode.Webview} webview WebView 实例
 * @param {vscode.Uri} extensionUri 插件根 URI
 * @param {string} pageType 页面类型 ('sidebar', 'search', 'setting', 'collection')
 * @returns {Object} 变量名到 webviewUri 的映射
 */
function getWebviewResourceUris_7ree(webview, extensionUri, pageType = 'sidebar') {
    // 根据页面类型定义不同的资源列表
    const resourceMap = {
        sidebar: [
            { name: 'baseCssUri', relativePath: 'ui/css/base_7ree.css' },
            { name: 'sidebarCssUri', relativePath: 'ui/css/sidebar_7ree.css' },
            { name: 'collectionCssUri', relativePath: 'ui/css/collection_7ree.css' },
            { name: 'searchCssUri', relativePath: 'ui/css/search_7ree.css' },
            { name: 'webviewDebugLogUri', relativePath: 'ui/js/webview_debug_7ree.js' },
            { name: 'iconUtilsJsUri', relativePath: 'ui/js/icon_utils_7ree.js' },
            { name: 'pathUtilsJsUri', relativePath: 'ui/js/path_utils_7ree.js' },
            { name: 'dragHandlerJsUri', relativePath: 'ui/js/drag_handler_7ree.js' },
            { name: 'folderManagerJsUri', relativePath: 'ui/js/folder_manager_7ree.js' },
            { name: 'collectionTreeJsUri', relativePath: 'ui/js/collection_tree_7ree.js' },
            { name: 'searchHandlerJsUri', relativePath: 'ui/js/search_handler_7ree.js' },
            { name: 'collectionManagerJsUri', relativePath: 'ui/js/collection_manager_7ree.js' },
            { name: 'settingsManagerJsUri', relativePath: 'ui/js/settings_manager_7ree.js' },
            { name: 'sidebarMainJsUri', relativePath: 'ui/js/sidebar_main_7ree.js' },
            { name: 'folderIconUri', relativePath: 'ui/icons/folder_icon_7ree.svg' },
            { name: 'fileIconUri', relativePath: 'ui/icons/file_icon_7ree.svg' },
            { name: 'settingsIconUri', relativePath: 'ui/icons/settings.svg' },
            { name: 'searchIconUri', relativePath: 'ui/icons/search.svg' },
            { name: 'manualAddIconUri', relativePath: 'ui/icons/manual-add_7ree.svg' },
            { name: 'folderAddIconUri', relativePath: 'ui/icons/folder-add.svg' },
            { name: 'refreshIconUri', relativePath: 'ui/icons/refresh.svg' },
            { name: 'collapseAllIconUri', relativePath: 'ui/icons/collapse-all.svg' },
            { name: 'contextMenuHandlerJsUri', relativePath: 'ui/js/context_menu_handler_7ree.js' }
        ],
        search: [
            { name: 'baseCssUri', relativePath: 'ui/css/base_7ree.css' },
            { name: 'searchCssUri', relativePath: 'ui/css/search_7ree.css' }
        ],
        setting: [
            { name: 'baseCssUri', relativePath: 'ui/css/base_7ree.css' }
        ],
        collection: [
            { name: 'baseCssUri', relativePath: 'ui/css/base_7ree.css' },
            { name: 'collectionCssUri', relativePath: 'ui/css/collection_7ree.css' }
        ]
    };
    
    // 获取对应页面类型的资源列表，如果类型不存在则使用 sidebar 作为默认值
    const resourceList = resourceMap[pageType] || resourceMap['sidebar'];
    
    // 批量转换为 webviewUri
    const uriMap = {};
    for (const res of resourceList) {
        try {
            const absPath = vscode.Uri.joinPath(extensionUri, ...res.relativePath.split('/'));
            uriMap[res.name] = webview.asWebviewUri(absPath);
            console.log(`[webview_util_7ree] 成功生成URI: ${res.name} = ${uriMap[res.name]}`);
        } catch (error) {
            console.error(`[webview_util_7ree] 生成URI失败: ${res.name}, 路径: ${res.relativePath}`, error);
        }
    }
    return uriMap;
}

module.exports = {
    getWebviewResourceUris_7ree
}; 