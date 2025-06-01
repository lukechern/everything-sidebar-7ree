/**
 * Everything Sidebar 7ree 设置管理模块
 * 负责设置功能的前端交互和配置管理
 */

class SettingsManager_7ree {
    /**
     * 构造函数
     * @param {Object} vscode VS Code API对象
     */
    constructor(vscode) {
        this.vscode = vscode;
        
        // 默认设置
        this.defaultSettings = {
            port: 8080,
            searchScope: 'workspace',
            maxResults: 20,
            debugMode: true
        };
        
        // 当前设置
        this.currentSettings = { ...this.defaultSettings };
    }

    /**
     * 初始化设置管理功能
     */
    initializeSettingsManager_7ree() {
        // 获取DOM元素
        this.portInput = document.getElementById('port');
        this.searchScopeSelect = document.getElementById('search-scope');
        this.maxResultsInput = document.getElementById('max-results');
        
        this.testConnectionButton = document.getElementById('test-connection');
        this.testResultDiv = document.getElementById('test-result');
        this.resetSettingsButton = document.getElementById('reset-settings');
        this.saveSettingsButton = document.getElementById('save-settings');
        this.closeSettingsButton = document.getElementById('close-settings');
        this.settingsStatusDiv = document.getElementById('settings-status');
        this.helpIcon = document.getElementById('help-icon');
        this.helpTooltip = document.getElementById('help-tooltip');
        
        // 绑定事件监听器
        this.bindEventListeners_7ree();
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners_7ree() {
        // 测试连接按钮点击事件
        if (this.testConnectionButton) {
            this.testConnectionButton.addEventListener('click', () => {
                this.handleTestConnection_7ree();
            });
        }

        // 重置设置按钮点击事件
        if (this.resetSettingsButton) {
            this.resetSettingsButton.addEventListener('click', () => {
                this.handleResetSettings_7ree();
            });
        }

        // 保存设置按钮点击事件
        if (this.saveSettingsButton) {
            this.saveSettingsButton.addEventListener('click', () => {
                this.handleSaveSettings_7ree();
            });
        }

        // 关闭设置按钮点击事件
        if (this.closeSettingsButton) {
            this.closeSettingsButton.addEventListener('click', () => {
                this.handleCloseSettings_7ree();
            });
        }

        // 帮助图标hover事件
        if (this.helpIcon && this.helpTooltip) {
            this.helpIcon.addEventListener('mouseenter', () => {
                this.helpTooltip.classList.add('show');
            });

            this.helpIcon.addEventListener('mouseleave', () => {
                this.helpTooltip.classList.remove('show');
            });
        }

        // 点击其他地方关闭帮助提示
        document.addEventListener('click', (event) => {
            if (this.helpIcon && this.helpTooltip && 
                !this.helpIcon.contains(event.target) && 
                !this.helpTooltip.contains(event.target)) {
                this.helpTooltip.classList.remove('show');
            }
        });

        // 键盘事件处理
        this.bindKeyboardEvents_7ree();
    }

    /**
     * 绑定键盘事件
     */
    bindKeyboardEvents_7ree() {
        // 为输入框添加键盘事件
        const inputElements = [this.portInput, this.maxResultsInput];
        
        inputElements.forEach(input => {
            if (input) {
                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        this.handleSaveSettings_7ree();
                    } else if (event.key === 'Escape') {
                        event.preventDefault();
                        this.handleCloseSettings_7ree();
                    }
                });
            }
        });

        // 为下拉框添加键盘事件
        if (this.searchScopeSelect) {
            this.searchScopeSelect.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.handleSaveSettings_7ree();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    this.handleCloseSettings_7ree();
                }
            });
        }

        // 全局键盘事件处理（当设置页面显示时）
        document.addEventListener('keydown', (event) => {
            const settingsContainer = document.getElementById('settings-container');
            
            // 只有当设置页面显示时才处理快捷键
            if (settingsContainer && settingsContainer.style.display !== 'none' && 
                getComputedStyle(settingsContainer).display !== 'none') {
                
                if (event.key === 'Escape') {
                    // 如果当前焦点在输入框上，不处理全局ESC
                    if (document.activeElement && 
                        (document.activeElement.tagName === 'INPUT' || 
                         document.activeElement.tagName === 'SELECT')) {
                        return;
                    }
                    event.preventDefault();
                    this.handleCloseSettings_7ree();
                } else if (event.key === 'Enter') {
                    // Enter键始终触发保存设置，无论焦点在哪里
                    event.preventDefault();
                    this.handleSaveSettings_7ree();
                }
            }
        });
    }

    /**
     * 处理测试连接
     */
    handleTestConnection_7ree() {
        const port = parseInt(this.portInput.value, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
            this.showTestResult_7ree('端口号无效，请输入1-65535之间的数字', true);
            return;
        }
        
        // 显示测试中状态
        this.showTestResult_7ree('正在测试连接...', false);
        
        // 发送测试连接请求
        this.vscode.postMessage({
            command: 'testConnection',
            port: port
        });
    }

    /**
     * 处理重置设置
     */
    handleResetSettings_7ree() {
        this.populateSettingsForm_7ree(this.defaultSettings);
        this.showSettingsStatus_7ree('设置已重置为默认值');
    }

    /**
     * 处理保存设置
     */
    handleSaveSettings_7ree() {
        const newSettings = this.getSettingsFromForm_7ree();
        
        // 验证设置
        const validationError = this.validateSettings_7ree(newSettings);
        if (validationError) {
            this.showSettingsStatus_7ree(validationError, true);
            return;
        }
        
        // 发送保存设置请求
        this.vscode.postMessage({
            command: 'saveSettings',
            settings: newSettings
        });
    }

    /**
     * 处理关闭设置
     */
    handleCloseSettings_7ree() {
        const settingsContainer = document.getElementById('settings-container');
        const searchContainer = document.getElementById('search-container');
        const searchTab = document.getElementById('search-tab');
        
        if (settingsContainer && searchContainer && searchTab) {
            settingsContainer.style.display = 'none';
            searchContainer.style.display = 'block';
            searchTab.classList.add('active');
        }
    }

    /**
     * 填充设置表单
     * @param {Object} settings 设置对象
     */
    populateSettingsForm_7ree(settings) {
        if (this.portInput) {
            this.portInput.value = settings.port;
        }
        if (this.searchScopeSelect) {
            this.searchScopeSelect.value = settings.searchScope;
        }
        if (this.maxResultsInput) {
            this.maxResultsInput.value = settings.maxResults;
        }
    }

    /**
     * 从表单获取设置
     * @returns {Object} 设置对象
     */
    getSettingsFromForm_7ree() {
        return {
            port: parseInt(this.portInput ? this.portInput.value : this.defaultSettings.port, 10),
            searchScope: this.searchScopeSelect ? this.searchScopeSelect.value : this.defaultSettings.searchScope,
            maxResults: parseInt(this.maxResultsInput ? this.maxResultsInput.value : this.defaultSettings.maxResults, 10),
        };
    }

    /**
     * 验证设置
     * @param {Object} settings 设置对象
     * @returns {string|null} 验证错误信息，null表示验证通过
     */
    validateSettings_7ree(settings) {
        if (isNaN(settings.port) || settings.port < 1 || settings.port > 65535) {
            return '端口号必须是1-65535之间的数字';
        }
        
        if (isNaN(settings.maxResults) || settings.maxResults < 1 || settings.maxResults > 1000) {
            return '最大结果数必须是1-1000之间的数字';
        }
        
        return null; // 验证通过
    }

    /**
     * 显示设置状态消息
     * @param {string} message 消息内容
     * @param {boolean} isError 是否为错误消息
     */
    showSettingsStatus_7ree(message, isError = false) {
        if (this.settingsStatusDiv) {
            this.settingsStatusDiv.textContent = message;
            this.settingsStatusDiv.className = 'settings-status ' + (isError ? 'error' : 'success');
            this.settingsStatusDiv.style.display = 'block';
            
            // 5秒后自动隐藏
            setTimeout(() => {
                this.settingsStatusDiv.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * 显示测试结果
     * @param {string} message 测试结果消息
     * @param {boolean} isError 是否为错误
     */
    showTestResult_7ree(message, isError = false) {
        if (this.testResultDiv) {
            this.testResultDiv.textContent = message;
            this.testResultDiv.className = 'test-result' + (isError ? ' error' : ' success');
            this.testResultDiv.style.display = 'block';
        }
    }

    /**
     * 处理测试连接结果
     * @param {Object} result 测试结果
     */
    handleTestConnectionResult_7ree(result) {
        if (result.success) {
            this.showTestResult_7ree('连接成功！Everything HTTP 服务器运行正常。', false);
        } else {
            this.showTestResult_7ree(`连接失败: ${result.error || '无法连接到 Everything HTTP 服务器'}`, true);
        }
    }

    /**
     * 处理设置数据
     * @param {Object} settings 设置数据
     */
    handleSettingsData_7ree(settings) {
        this.currentSettings = settings;
        this.populateSettingsForm_7ree(this.currentSettings);
    }

    /**
     * 处理设置保存结果
     * @param {Object} result 保存结果
     */
    handleSettingsSaved_7ree(result) {
        this.showSettingsStatus_7ree('设置已保存');
        this.currentSettings = result.settings;
    }

    /**
     * 获取当前设置
     * @returns {Object} 当前设置对象
     */
    getCurrentSettings_7ree() {
        return this.currentSettings;
    }

    /**
     * 设置当前设置
     * @param {Object} settings 设置对象
     */
    setCurrentSettings_7ree(settings) {
        this.currentSettings = settings;
    }

    /**
     * 获取默认设置
     * @returns {Object} 默认设置对象
     */
    getDefaultSettings_7ree() {
        return this.defaultSettings;
    }

    /**
     * 重置为默认设置
     */
    resetToDefaultSettings_7ree() {
        this.currentSettings = { ...this.defaultSettings };
        this.populateSettingsForm_7ree(this.currentSettings);
    }

    /**
     * 检查设置是否有效
     * @param {Object} settings 要检查的设置
     * @returns {boolean} 设置是否有效
     */
    isSettingsValid_7ree(settings) {
        return this.validateSettings_7ree(settings) === null;
    }

    /**
     * 获取设置表单的当前值
     * @returns {Object} 表单中的设置值
     */
    getCurrentFormValues_7ree() {
        return this.getSettingsFromForm_7ree();
    }

    /**
     * 检查表单是否有未保存的更改
     * @returns {boolean} 是否有未保存的更改
     */
    hasUnsavedChanges_7ree() {
        const formValues = this.getSettingsFromForm_7ree();
        return JSON.stringify(formValues) !== JSON.stringify(this.currentSettings);
    }

    /**
     * 显示或隐藏帮助提示
     * @param {boolean} show 是否显示
     */
    toggleHelpTooltip_7ree(show) {
        if (this.helpTooltip) {
            if (show) {
                this.helpTooltip.classList.add('show');
            } else {
                this.helpTooltip.classList.remove('show');
            }
        }
    }

    /**
     * 清除所有状态消息
     */
    clearAllMessages_7ree() {
        if (this.settingsStatusDiv) {
            this.settingsStatusDiv.style.display = 'none';
        }
        if (this.testResultDiv) {
            this.testResultDiv.style.display = 'none';
        }
    }
}

// 导出模块
window.SettingsManager_7ree = SettingsManager_7ree; 