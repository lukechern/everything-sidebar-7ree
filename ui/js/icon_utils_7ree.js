/**
 * Everything Sidebar 7ree 图标工具模块
 * 提供统一的文件类型图标获取功能，使用Unicode字符
 */

class IconUtils_7ree {
    /**
     * 构造函数
     */
    constructor() {
        // 文件扩展名到Unicode图标的映射
        this.iconMap = {
            // JavaScript/TypeScript
            'js': '🟨',
            'jsx': '⚛️', 
            'ts': '🔷',
            'tsx': '⚛️',
            'mjs': '🟨',
            'vue': '💚',
            
            // Web相关
            'html': '🌐',
            'htm': '🌐',
            'css': '🎨',
            'scss': '🎨',
            'sass': '🎨',
            'less': '🎨',
            'stylus': '🎨',
            'phtml': '🐘',
            'twig': '🌿',
            'blade': '⚔️',
            'ejs': '📄',
            'handlebars': '📄',
            'hbs': '📄',
            
            // 数据格式
            'json': '📋',
            'xml': '📋',
            'yaml': '📋',
            'yml': '📋',
            'toml': '📋',
            'ini': '📋',
            
            // 文档
            'md': '📝',
            'markdown': '📝',
            'txt': '📄',
            'log': '📄',
            'readme': '📖',
            'license': '⚖️',
            'changelog': '📝',
            
            // 编程语言
            'py': '🐍',
            'java': '☕',
            'c': '🔵',
            'cpp': '🔵',
            'cxx': '🔵',
            'cc': '🔵',
            'h': '🔵',
            'hpp': '🔵',
            'cs': '🟣',
            'php': '🐘',
            'rb': '💎',
            'go': '🐹',
            'rs': '🦀',
            'swift': '🧡',
            'kt': '🟠',
            'scala': '🔴',
            'dart': '🎯',
            'r': '📊',
            'matlab': '📊',
            'm': '🔧',
            
            // Shell脚本
            'sh': '💻',
            'bash': '💻',
            'zsh': '💻',
            'fish': '💻',
            'ps1': '💻',
            'bat': '💻',
            'cmd': '💻',
            
            // 配置文件
            'config': '⚙️',
            'conf': '⚙️',
            'cfg': '⚙️',
            'env': '⚙️',
            'properties': '⚙️',
            'gitignore': '⚙️',
            'gitattributes': '⚙️',
            'editorconfig': '⚙️',
            'eslintrc': '⚙️',
            'prettierrc': '⚙️',
            
            // 包管理文件
            'package': '📦',
            'lock': '🔒',
            'yarn': '📦',
            'npm': '📦',
            'composer': '📦',
            'requirements': '📦',
            'pipfile': '📦',
            'gemfile': '💎',
            'cargo': '📦',
            
            // 图片
            'png': '🖼️',
            'jpg': '📸',
            'jpeg': '📸',
            'gif': '🎞️',
            'bmp': '🖼️',
            'svg': '🎨',
            'webp': '🖼️',
            'ico': '🔳',
            'icon': '🔳',
            'tiff': '🖼️',
            'tif': '🖼️',
            'raw': '📸',
            'cr2': '📸',
            'nef': '📸',
            'dng': '📸',
            'psd': '🎨',
            'ai': '🎨',
            'eps': '🎨',
            'sketch': '🎨',
            
            // 音频
            'mp3': '🎵',
            'wav': '🎵',
            'flac': '🎵',
            'aac': '🎵',
            'ogg': '🎵',
            'm4a': '🎵',
            'wma': '🎵',
            'opus': '🎵',
            'midi': '🎼',
            'mid': '🎼',
            
            // 视频
            'mp4': '🎬',
            'avi': '🎬',
            'mkv': '🎬',
            'mov': '🎬',
            'wmv': '🎬',
            'flv': '🎬',
            'webm': '🎬',
            'm4v': '🎬',
            '3gp': '📱',
            'ts': '📺',
            
            // 压缩文件
            'zip': '🗜️',
            'rar': '🗜️',
            '7z': '🗜️',
            'tar': '🗜️',
            'gz': '🗜️',
            'bz2': '🗜️',
            'xz': '🗜️',
            
            // 文档
            'pdf': '📕',
            'doc': '📄',
            'docx': '📄',
            'xls': '📊',
            'xlsx': '📊',
            'ppt': '📊',
            'pptx': '📊',
            'odt': '📄',
            'ods': '📊',
            'odp': '📊',
            'rtf': '📄',
            
            // 数据库
            'sql': '🗄️',
            'db': '🗄️',
            'sqlite': '🗄️',
            'sqlite3': '🗄️',
            'mdb': '🗄️',
            
            // 字体
            'ttf': '🔤',
            'otf': '🔤',
            'woff': '🔤',
            'woff2': '🔤',
            'eot': '🔤',
            
            // 可执行文件
            'exe': '⚙️',
            'dll': '⚙️',
            'so': '⚙️',
            'dylib': '⚙️',
            'bin': '⚙️',
            'app': '⚙️',
            'deb': '📦',
            'rpm': '📦',
            'dmg': '💿',
            'msi': '📦',
            
            // 证书和密钥
            'pem': '🔑',
            'crt': '🔑',
            'cer': '🔑',
            'key': '🔑',
            'p12': '🔑',
            'pfx': '🔑',
            
            // 其他
            'iso': '💿',
            'img': '💿',
            'vdi': '💿',
            'vmdk': '💿'
        };
        
        // 特殊文件名映射（不依赖扩展名）
        this.specialFileMap = {
            'dockerfile': '🐳',
            'makefile': '🔨',
            'readme': '📖',
            'license': '⚖️',
            'changelog': '📝',
            'contributing': '👥',
            'authors': '👥',
            'contributors': '👥',
            'package.json': '📦',
            'package-lock.json': '🔒',
            'yarn.lock': '🔒',
            'composer.json': '📦',
            'composer.lock': '🔒',
            'requirements.txt': '📦',
            'pipfile': '📦',
            'pipfile.lock': '🔒',
            'gemfile': '💎',
            'gemfile.lock': '🔒',
            'cargo.toml': '📦',
            'cargo.lock': '🔒',
            '.gitignore': '⚙️',
            '.gitattributes': '⚙️',
            '.editorconfig': '⚙️',
            '.eslintrc': '⚙️',
            '.prettierrc': '⚙️',
            '.babelrc': '⚙️',
            'tsconfig.json': '⚙️',
            'webpack.config.js': '⚙️',
            'rollup.config.js': '⚙️',
            'vite.config.js': '⚙️'
        };
    }

    /**
     * 获取文件图标
     * @param {string} fileName 文件名
     * @param {boolean} isDirectory 是否为目录
     * @returns {string} 图标HTML
     */
    getFileIcon_7ree(fileName, isDirectory = false) {
        if (isDirectory) {
            return `<span class="file-icon" title="文件夹">📁</span>`;
        }
        
        // 转换为小写进行匹配
        const lowerFileName = fileName.toLowerCase();
        
        // 首先检查特殊文件名
        if (this.specialFileMap[lowerFileName]) {
            const icon = this.specialFileMap[lowerFileName];
            return `<span class="file-icon" title="${fileName}">${icon}</span>`;
        }
        
        // 获取文件扩展名
        const ext = this.getFileExtension_7ree(fileName).toLowerCase();
        
        // 根据扩展名获取图标
        const icon = this.iconMap[ext] || '📄';
        return `<span class="file-icon" title="${fileName}">${icon}</span>`;
    }

    /**
     * 获取文件扩展名
     * @param {string} fileName 文件名
     * @returns {string} 扩展名（不包含点）
     */
    getFileExtension_7ree(fileName) {
        const lastDot = fileName.lastIndexOf('.');
        if (lastDot === -1 || lastDot === 0) return '';
        return fileName.substring(lastDot + 1);
    }

    /**
     * 添加自定义图标映射
     * @param {string} extension 文件扩展名
     * @param {string} icon Unicode图标字符
     */
    addCustomIcon_7ree(extension, icon) {
        this.iconMap[extension.toLowerCase()] = icon;
    }

    /**
     * 添加特殊文件名映射
     * @param {string} fileName 文件名
     * @param {string} icon Unicode图标字符
     */
    addSpecialFileIcon_7ree(fileName, icon) {
        this.specialFileMap[fileName.toLowerCase()] = icon;
    }

    /**
     * 获取所有支持的文件类型
     * @returns {Array} 支持的文件扩展名列表
     */
    getSupportedExtensions_7ree() {
        return Object.keys(this.iconMap);
    }

    /**
     * 获取所有特殊文件名
     * @returns {Array} 特殊文件名列表
     */
    getSpecialFileNames_7ree() {
        return Object.keys(this.specialFileMap);
    }

    /**
     * 获取默认文件图标（引用外部SVG图标）
     * @param {string} fileName 文件名
     * @param {boolean} isDirectory 是否为目录
     * @returns {string} 图标HTML
     */
    getDefaultFileIcon_7ree(fileName, isDirectory) {
        // 根据文件类型返回不同的图标
        if (isDirectory) {
            return `<img src="{{folderIconUri}}" width="12" height="12" alt="Folder" />`;
        }
        
        // 默认文件图标
        return `<img src="{{fileIconUri}}" width="12" height="12" alt="File" />`;
    }
}

// 导出模块
window.IconUtils_7ree = IconUtils_7ree; 