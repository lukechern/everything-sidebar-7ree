/**
 * Everything Sidebar 7ree 路径工具模块
 * 负责路径的智能显示和优化
 */

class PathUtils_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     */
    constructor(vscode) {
        this.vscode = vscode;
        this.workspacePath = null;
        this.currentSearchScope = 'computer';
        
        // 初始化工作区路径
        this.initializeWorkspacePath_7ree();
        
        // 初始化拖动状态监听
        this.initializeDragStateListener_7ree();
    }

    /**
     * 初始化工作区路径
     */
    initializeWorkspacePath_7ree() {
        // 请求当前工作区路径
        this.vscode.postMessage({
            command: 'getWorkspacePath'
        });
    }

    /**
     * 设置工作区路径
     * @param {string} workspacePath 工作区路径
     */
    setWorkspacePath_7ree(workspacePath) {
        this.workspacePath = workspacePath;
    }

    /**
     * 设置当前搜索范围
     * @param {string} searchScope 搜索范围 ('computer' 或 'workspace')
     */
    setSearchScope_7ree(searchScope) {
        this.currentSearchScope = searchScope;
    }

    /**
     * 优化路径显示
     * @param {string} fullPath 完整路径
     * @returns {string} 优化后的路径
     */
    optimizePath_7ree(fullPath) {
        if (!fullPath) return '';

        // 统一显示：如果有工作区路径，优先显示相对路径
        if (this.workspacePath) {
            const relativePath = this.getRelativePathFromWorkspace_7ree(fullPath);
            // 如果成功获取到相对路径（以 ./ 开头），则使用相对路径
            if (relativePath.startsWith('./')) {
                return relativePath;
            }
        }
        
        // 如果不在工作区内或没有工作区路径，显示截断的完整路径
        return this.getTruncatedPath_7ree(fullPath);
    }

    /**
     * 获取相对于工作区的路径
     * @param {string} fullPath 完整路径
     * @returns {string} 相对路径
     */
    getRelativePathFromWorkspace_7ree(fullPath) {
        if (!this.workspacePath || !fullPath) return fullPath;

        // 标准化路径分隔符
        const normalizedWorkspace = this.normalizePath_7ree(this.workspacePath);
        const normalizedFull = this.normalizePath_7ree(fullPath);

        // 检查是否在工作区内
        if (normalizedFull.startsWith(normalizedWorkspace)) {
            // 获取相对路径
            let relativePath = normalizedFull.substring(normalizedWorkspace.length);
            
            // 移除开头的路径分隔符
            if (relativePath.startsWith('/') || relativePath.startsWith('\\')) {
                relativePath = relativePath.substring(1);
            }
            
            // 如果相对路径为空，说明就是工作区根目录
            if (!relativePath) {
                return './';
            }
            
            // 添加 ./ 前缀表示相对路径
            return './' + relativePath.replace(/\\/g, '/');
        }

        // 如果不在工作区内，返回截断的完整路径
        return this.getTruncatedPath_7ree(fullPath);
    }

    /**
     * 获取截断的路径（从后往前显示尽可能多的路径）
     * @param {string} fullPath 完整路径
     * @param {number} maxLength 最大长度
     * @returns {string} 截断后的路径
     */
    getTruncatedPath_7ree(fullPath, maxLength = 60) {
        if (!fullPath || fullPath.length <= maxLength) {
            return fullPath;
        }

        // 分割路径
        const pathParts = fullPath.split(/[\\\/]/);
        
        // 如果只有一个部分，直接截断
        if (pathParts.length <= 1) {
            return '...' + fullPath.substring(fullPath.length - maxLength + 3);
        }

        // 从后往前组合路径，直到超过最大长度
        let result = pathParts[pathParts.length - 1]; // 文件名
        let currentLength = result.length;

        for (let i = pathParts.length - 2; i >= 0; i--) {
            const part = pathParts[i];
            const newLength = currentLength + part.length + 1; // +1 for separator
            
            if (newLength > maxLength - 3) { // -3 for "..."
                result = '...' + '/' + result;
                break;
            }
            
            result = part + '/' + result;
            currentLength = newLength;
        }

        return result;
    }

    /**
     * 标准化路径分隔符
     * @param {string} path 路径
     * @returns {string} 标准化后的路径
     */
    normalizePath_7ree(path) {
        if (!path) return '';
        
        // 统一使用正斜杠，并确保以斜杠结尾（对于目录）
        let normalized = path.replace(/\\/g, '/');
        
        // 移除重复的斜杠
        normalized = normalized.replace(/\/+/g, '/');
        
        // 确保目录路径以斜杠结尾
        if (!normalized.endsWith('/') && !this.isFilePath_7ree(normalized)) {
            normalized += '/';
        }
        
        return normalized;
    }

    /**
     * 判断是否为文件路径（有扩展名）
     * @param {string} path 路径
     * @returns {boolean} 是否为文件路径
     */
    isFilePath_7ree(path) {
        if (!path) return false;
        
        const lastPart = path.split(/[\\\/]/).pop();
        return lastPart && lastPart.includes('.');
    }

    /**
     * 创建路径提示元素（改为状态栏显示）
     * @param {HTMLElement} element 目标元素
     * @param {string} fullPath 完整路径
     */
    addPathTooltip_7ree(element, fullPath) {
        if (!element || !fullPath) return;

        // 鼠标进入事件 - 在状态栏显示路径
        const showStatusBarPath = (event) => {
            // 检查是否有右键菜单显示
            const contextMenus = document.querySelectorAll('.context-menu');
            let hasVisibleMenu = false;
            contextMenus.forEach(menu => {
                if (menu.style.display === 'block') {
                    hasVisibleMenu = true;
                }
            });

            // 如果有右键菜单显示，不显示提示
            if (hasVisibleMenu) return;

            // 检查是否有元素正在被拖动
            const draggingElements = document.querySelectorAll('.dragging');
            if (draggingElements.length > 0) return;

            // 检查是否有拖放操作正在进行
            const dragOverElements = document.querySelectorAll('.drag-over');
            if (dragOverElements.length > 0) return;

            // 检查当前元素或其父元素是否正在被拖动
            let currentElement = element;
            while (currentElement) {
                if (currentElement.classList && currentElement.classList.contains('dragging')) {
                    return;
                }
                if (currentElement.getAttribute && currentElement.getAttribute('draggable') === 'true') {
                    // 检查是否正在拖动状态
                    if (currentElement.style.opacity === '0.5' || currentElement.classList.contains('dragging')) {
                        return;
                    }
                }
                currentElement = currentElement.parentElement;
            }

            // 发送消息到VS Code状态栏显示路径
            if (this.vscode) {
                this.vscode.postMessage({
                    command: 'showStatusBarMessage',
                    message: fullPath,
                    timeout: 0 // 0表示不自动隐藏
                });
            }
        };

        // 鼠标离开事件 - 清除状态栏显示
        const hideStatusBarPath = () => {
            if (this.vscode) {
                this.vscode.postMessage({
                    command: 'hideStatusBarMessage'
                });
            }
        };

        // 绑定事件
        element.addEventListener('mouseenter', showStatusBarPath);
        element.addEventListener('mouseleave', hideStatusBarPath);

        // 存储清理函数
        element._pathTooltipCleanup_7ree = () => {
            element.removeEventListener('mouseenter', showStatusBarPath);
            element.removeEventListener('mouseleave', hideStatusBarPath);
        };
    }

    /**
     * 移除路径提示
     * @param {HTMLElement} element 目标元素
     */
    removePathTooltip_7ree(element) {
        if (element && element._pathTooltipCleanup_7ree) {
            element._pathTooltipCleanup_7ree();
            delete element._pathTooltipCleanup_7ree;
        }
    }

    /**
     * 为元素添加优化的路径显示
     * @param {HTMLElement} pathElement 路径显示元素
     * @param {string} fullPath 完整路径
     */
    setupOptimizedPath_7ree(pathElement, fullPath) {
        if (!pathElement || !fullPath) return;

        // 设置优化后的路径文本
        const optimizedPath = this.optimizePath_7ree(fullPath);
        pathElement.textContent = optimizedPath;

        // 添加提示
        this.addPathTooltip_7ree(pathElement, fullPath);

        // 添加样式类
        pathElement.classList.add('optimized-path-7ree');
    }

    /**
     * 批量处理路径元素
     * @param {NodeList|Array} pathElements 路径元素列表
     * @param {Function} getFullPath 获取完整路径的函数
     */
    batchOptimizePaths_7ree(pathElements, getFullPath) {
        pathElements.forEach(element => {
            const fullPath = getFullPath(element);
            if (fullPath) {
                this.setupOptimizedPath_7ree(element, fullPath);
            }
        });
    }

    /**
     * 初始化拖动状态监听器
     */
    initializeDragStateListener_7ree() {
        // 监听全局拖动开始事件
        document.addEventListener('dragstart', () => {
            this.hideAllTooltips_7ree();
        });
        
        // 监听全局拖动结束事件
        document.addEventListener('dragend', () => {
            // 拖动结束后稍微延迟，确保拖动状态完全清除
            setTimeout(() => {
                this.hideAllTooltips_7ree();
            }, 100);
        });
    }

    /**
     * 隐藏所有路径提示
     */
    hideAllTooltips_7ree() {
        const tooltips = document.querySelectorAll('.path-tooltip-7ree');
        tooltips.forEach(tooltip => {
            tooltip.style.opacity = '0';
        });
    }
}

// 导出模块
window.PathUtils_7ree = PathUtils_7ree; 