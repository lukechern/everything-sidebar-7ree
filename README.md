# Everything Sidebar 7ree 🚀

一个让你的 VSCode 拥有超级搜索能力的扩展！再也不用在文件夹里疯狂翻找文件了 🎯

A VSCode extension that gives your editor superpowers for file searching! No more crazy folder digging madness 🎯

---

## 🌟 功能特色 Features

### 🔍 闪电搜索
基于 Everything 的超快文件搜索，比你眨眼还快！支持实时搜索，输入即搜索，告别等待焦虑症 ⚡

**Lightning Fast Search**  
Everything-powered file search that's faster than your blink! Real-time search as you type, say goodbye to waiting anxiety ⚡

### 📁 智能收藏系统
收藏你的常用文件和文件夹，支持自定义分类和别名。再也不会忘记那个藏得很深的重要文件在哪里了 💾

**Smart Favorites System**  
Bookmark your frequently used files and folders with custom categories and aliases. Never lose track of that deeply buried important file again 💾

### 🎨 现代化界面
精美的 UI 设计，完美融入 VSCode 主题。看起来就像原生功能一样自然 ✨

**Modern Interface**  
Beautiful UI design that seamlessly integrates with VSCode themes. Looks so native you'll think it's built-in ✨

### ⌨️ 快捷键支持
全面的键盘快捷键支持，让你的双手从鼠标中解放出来。Enter 确认，Esc 取消，就是这么简单 🎹

**Keyboard Shortcuts**  
Comprehensive keyboard shortcut support to free your hands from the mouse. Enter to confirm, Esc to cancel, it's that simple 🎹

---

## 📦 安装方法 Installation

### 方法一：VSCode 扩展市场（推荐）
1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "Everything Sidebar 7ree"
4. 点击安装，然后你就可以开始享受丝滑的搜索体验了！🎉

**Method 1: VSCode Marketplace (Recommended)**
1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions panel
3. Search for "Everything Sidebar 7ree"
4. Click Install, then start enjoying the smooth search experience! 🎉

### 方法二：从 VSIX 文件安装
1. 下载 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P`
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的文件，安装完成！🛠️

**Method 2: Install from VSIX**
1. Download the `.vsix` file
2. Press `Ctrl+Shift+P` in VSCode
3. Type "Extensions: Install from VSIX"
4. Select the downloaded file, installation complete! 🛠️

---

## 🚀 使用说明 Usage Guide

### 1. 首次设置
安装扩展后，你需要先配置 Everything HTTP 服务器：

**Initial Setup**  
After installing the extension, you need to configure Everything HTTP server first:

1. 📥 下载并安装 [Everything](https://www.voidtools.com/)
2. ⚙️ 打开 Everything → 工具 → 选项 → HTTP 服务器
3. ✅ 勾选"启动 HTTP 服务器"
4. 🔧 设置端口（默认 8080）
5. 💾 保存设置

1. 📥 Download and install [Everything](https://www.voidtools.com/)
2. ⚙️ Open Everything → Tools → Options → HTTP Server
3. ✅ Check "Enable HTTP Server"
4. 🔧 Set port (default 8080)
5. 💾 Save settings

### 2. 基本使用
打开 VSCode 侧边栏，你会看到一个全新的 Everything Sidebar 面板，包含两个超实用的标签页：

**Basic Usage**  
Open VSCode sidebar and you'll see a brand new Everything Sidebar panel with two super useful tabs:

#### 🔍 搜索标签页
- 输入关键词即可实时搜索文件
- 双击文件直接打开
- 右键菜单提供更多操作选项
- 点击外部搜索按钮在 Everything 中查看完整结果

**Search Tab**
- Type keywords for real-time file search
- Double-click files to open directly
- Right-click menu provides more operation options
- Click external search button to view full results in Everything

#### 📁 收藏标签页
- 创建自定义文件夹分类你的收藏
- 拖拽文件到文件夹中进行整理
- 重命名文件别名，让文件名更有意义
- 支持文件夹展开/折叠状态记忆

**Favorites Tab**
- Create custom folders to categorize your bookmarks
- Drag files to folders for organization
- Rename file aliases to make filenames more meaningful
- Support folder expand/collapse state memory

### 3. 快捷键一览 Keyboard Shortcuts

| 功能 Function | 快捷键 Shortcut | 说明 Description |
|---------------|----------------|------------------|
| 确认操作 | `Enter` | 在所有对话框中确认操作 |
| 取消操作 | `Esc` | 在所有对话框中取消操作 |
| 清空搜索 | `Ctrl+K` | 清空搜索输入框 |

---

## ⚙️ 配置选项 Configuration

在设置页面中，你可以调整以下选项来获得最佳体验：

**In the settings page, you can adjust the following options for the best experience:**

- 🌐 **服务器端口 Server Port**: Everything HTTP 服务器端口号
- 🎯 **搜索范围 Search Scope**: 选择搜索整个电脑还是仅当前项目
- 📊 **最大结果数 Max Results**: 控制搜索结果显示数量（建议 20-100）

---

## 🛠️ 故障排除 Troubleshooting

### 搜索不工作？别慌！
1. 🔍 确认 Everything 软件已运行
2. 🌐 检查 HTTP 服务器是否启用
3. 🔌 测试连接是否正常
4. 🔄 重启 VSCode 试试

**Search not working? Don't panic!**
1. 🔍 Ensure Everything software is running
2. 🌐 Check if HTTP server is enabled
3. 🔌 Test if connection is normal
4. 🔄 Try restarting VSCode

### 搜索结果为空？
- 📂 检查搜索范围设置
- 🔄 尝试更新 Everything 数据库
- 🎯 使用更简单的关键词

**Empty search results?**
- 📂 Check search scope settings
- 🔄 Try updating Everything database
- 🎯 Use simpler keywords

---

## 🎯 开发计划 Roadmap

- [ ] 🌈 更多主题支持
- [ ] 🔄 同步收藏到云端
- [ ] 🎨 自定义图标和颜色
- [ ] 📱 移动端适配（开个玩笑 😄）

**Roadmap**
- [ ] 🌈 More theme support
- [ ] 🔄 Sync favorites to cloud
- [ ] 🎨 Custom icons and colors
- [ ] 📱 Mobile adaptation (just kidding 😄)

---

## 🤝 贡献指南 Contributing

欢迎各路大神贡献代码！不管是修复 bug、添加新功能还是改进文档，我们都超级欢迎 🎉

**Welcome all coding heroes to contribute! Whether it's fixing bugs, adding new features, or improving documentation, we're super welcoming 🎉**

1. 🍴 Fork 这个项目
2. 🌿 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 推送到分支 (`git push origin feature/AmazingFeature`)
5. 🔄 开启一个 Pull Request

1. 🍴 Fork the project
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔄 Open a Pull Request

---

## 📄 许可协议 License

本项目采用 MIT 许可协议 - 详见 [LICENSE](LICENSE) 文件。简单来说就是：随便用，别怪我们 😊

**This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Simply put: use it freely, don't blame us 😊**

---

## 🙏 致谢 Acknowledgments

特别感谢以下项目和贡献者：

**Special thanks to the following projects and contributors:**

- 🔍 **Everything**: 这个神奇的搜索工具让一切成为可能
- 💻 **VSCode Team**: 提供了如此优秀的编辑器平台
- 🎨 **所有测试用户**: 你们的反馈让产品变得更好
- ☕ **咖啡**: 没有咖啡就没有代码（最重要的依赖）

- 🔍 **Everything**: The amazing search tool that makes everything possible
- 💻 **VSCode Team**: For providing such an excellent editor platform
- 🎨 **All beta testers**: Your feedback makes the product better
- ☕ **Coffee**: No coffee, no code (the most important dependency)

---

## 📞 联系我们 Contact

遇到问题或有建议？我们很乐意听到你的声音！

**Got issues or suggestions? We'd love to hear from you!**

- 🐛 **Bug 报告**: 请在 GitHub Issues 中提交
- 💡 **功能建议**: 也请在 GitHub Issues 中告诉我们


- 🐛 **Bug Reports**: Please submit in GitHub Issues
- 💡 **Feature Requests**: Also tell us in GitHub Issues


---

## ⭐ 如果你喜欢这个项目 If You Like This Project

请给我们一个星星！这对我们意义重大，也能帮助更多人发现这个有用的工具 🌟

**Please give us a star! It means a lot to us and helps more people discover this useful tool 🌟**

**记住：好的工具让工作更高效，而高效的工作让生活更美好！享受编码的乐趣吧！🎉**

**Remember: Good tools make work more efficient, and efficient work makes life better! Enjoy the joy of coding! 🎉** 