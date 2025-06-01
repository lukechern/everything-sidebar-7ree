/**
 * Everything Sidebar 7ree 配置管理模块
 * 负责处理插件配置的读取、保存和更新
 */

const vscode = require('vscode');
const { debugLog_7ree } = require('./debug_7ree');

/**
 * 配置管理类
 */
class SettingManager {
    /**
     * 构造函数
     * @param {vscode.ExtensionContext} context 插件上下文
     */
    constructor(context) {
        this.context = context;
        this.globalState = context.globalState;
        
        // 默认配置
        this.defaultSettings = {
            port: 8080,                // Everything HTTP服务器端口
            searchScope: 'computer',   // 搜索范围：computer(我的电脑)、workspace(本项目目录)、files(仅文件)、folders(仅文件夹)
            maxResults: 20,            // 最大搜索结果数量
            debugMode: true            // 调试模式
        };
        
        // 初始化配置
        this.settings = this.loadSettings();
        
        debugLog_7ree('Setting', '模块加载完成');
    }

    /**
     * 加载配置
     * @returns {Object} 配置对象
     */
    loadSettings() {
        const savedSettings = this.globalState.get('everythingSidebar7reeSettings');
        let settings = { ...this.defaultSettings };
        
        if (savedSettings) {
            settings = { ...settings, ...savedSettings };
            debugLog_7ree('Setting', '已加载保存的配置');
        } else {
            debugLog_7ree('Setting', '使用默认配置');
        }
        
        return settings;
    }

    /**
     * 保存配置
     * @returns {Promise<void>}
     */
    async saveSettings() {
        await this.globalState.update('everythingSidebar7reeSettings', this.settings);
        debugLog_7ree('Setting', '配置已保存');
    }

    /**
     * 获取配置值
     * @param {string} key 配置键名
     * @returns {any} 配置值
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * 更新配置值
     * @param {string} key 配置键名
     * @param {any} value 配置值
     * @returns {Promise<void>}
     */
    async updateSetting(key, value) {
        if (this.settings[key] !== value) {
            this.settings[key] = value;
            await this.saveSettings();
            debugLog_7ree('Setting', `配置已更新: ${key} = ${value}`);
        }
    }

    /**
     * 重置配置为默认值
     * @returns {Promise<void>}
     */
    async resetSettings() {
        this.settings = { ...this.defaultSettings };
        await this.saveSettings();
        debugLog_7ree('Setting', '配置已重置为默认值');
    }

    /**
     * 获取所有配置
     * @returns {Object} 所有配置
     */
    getAllSettings() {
        return { ...this.settings };
    }
}

module.exports = SettingManager;