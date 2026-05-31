<template>
  <div class="app">
    <header class="app-header">
      <div class="logo">
        <span class="logo-icon">🤖</span>
        <h1>AI IDE</h1>
      </div>
      <div class="header-actions">
        <button @click="openFileSearch" class="btn-search" title="搜索文件 (Ctrl+P)">
          🔍 搜索文件
        </button>
        <button @click="toggleSettings" class="btn-settings" title="设置">
          ⚙️ 设置
        </button>
        <span class="version">v0.1.0 MVP</span>
      </div>
    </header>
    <main class="app-main">
      <Sidebar />
      <Editor />
      <ChatPanel />
    </main>
    <StatusBar />
    <FileSearch ref="fileSearchRef" />
    
    <!-- 设置面板 -->
    <div v-if="showSettings" class="settings-overlay" @click="closeSettings">
      <div class="settings-panel" @click.stop>
        <div class="settings-header">
          <h2>设置</h2>
          <button @click="closeSettings" class="btn-close-settings">×</button>
        </div>
        <div class="settings-content">
          <div class="setting-group">
            <h3>编辑器设置</h3>
            <div class="setting-item">
              <label>字体大小</label>
              <select class="setting-select">
                <option value="12">12px</option>
                <option value="14" selected>14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
              </select>
            </div>
            <div class="setting-item">
              <label>主题</label>
              <select class="setting-select">
                <option value="dark" selected>深色主题</option>
                <option value="light">浅色主题</option>
              </select>
            </div>
            <div class="setting-item">
              <label>自动保存</label>
              <input type="checkbox" checked />
            </div>
          </div>
          
          <div class="setting-group">
            <h3>AI 助手设置</h3>
            <div class="setting-item">
              <label>模型</label>
              <select class="setting-select">
                <option value="gpt-4" selected>GPT-4</option>
                <option value="gpt-3.5">GPT-3.5</option>
              </select>
            </div>
            <div class="setting-item">
              <label>自动补全</label>
              <input type="checkbox" checked />
            </div>
          </div>
          
          <div class="setting-group">
            <h3>关于</h3>
            <div class="setting-item">
              <p class="about-text">AI IDE v0.1.0 MVP</p>
              <p class="about-text">基于 Vue 3 + TypeScript 构建</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Editor from '@/components/Editor.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import StatusBar from '@/components/StatusBar.vue'
import FileSearch from '@/components/FileSearch.vue'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const fileSearchRef = ref<InstanceType<typeof FileSearch>>()
const showSettings = ref(false)

const openFileSearch = () => {
  fileSearchRef.value?.openSearch()
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const closeSettings = () => {
  showSettings.value = false
}

onMounted(() => {
  // 初始化示例文件
  editorStore.addFile('example.js', '// 欢迎使用 AI IDE\n// 开始编写你的代码...\n\nfunction hello() {\n  console.log("Hello, AI IDE!");\n}\n\nhello();', 'javascript')
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
}

.app-header {
  height: 50px;
  background: #2d2d30;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
}

.logo h1 {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-search {
  background: #dc2626;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-search:hover {
  background: #ef4444;
}

.btn-settings {
  background: #5a5a5a;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-settings:hover {
  background: #6e6e6e;
}

.version {
  font-size: 12px;
  color: #888;
  padding: 4px 8px;
  background: #1e1e1e;
  border-radius: 4px;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4e4e4e;
}

/* 设置面板样式 */
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.settings-panel {
  background: #2d2d30;
  border: 1px solid #454545;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 16px 20px;
  border-bottom: 1px solid #454545;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.btn-close-settings {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-close-settings:hover {
  background: #454545;
  color: #fff;
}

.settings-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group h3 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #454545;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  color: #d4d4d4;
}

.setting-item label {
  font-size: 13px;
  color: #ccc;
}

.setting-select {
  background: #3e3e42;
  border: 1px solid #454545;
  color: #d4d4d4;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.setting-select:focus {
  border-color: #007acc;
}

.setting-item input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.about-text {
  font-size: 13px;
  color: #888;
  margin: 4px 0;
}
</style>