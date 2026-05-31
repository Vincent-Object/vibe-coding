<template>
  <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
    <div class="sidebar-header">
      <h3>文件浏览器</h3>
      <button @click="handleAddFile" class="btn-icon" title="新建文件">+</button>
    </div>
    <div class="file-list">
      <div
        v-for="file in files"
        :key="file.id"
        :class="['file-item', { active: file.isActive }]"
        @click="setActiveFile(file.id)"
      >
        <span class="file-icon">📄</span>
        <span class="file-name">{{ file.name }}</span>
        <button
          @click.stop="removeFile(file.id)"
          class="btn-close"
          title="关闭文件"
        >
          ×
        </button>
      </div>
    </div>
    <div 
      class="resize-handle"
      @mousedown="startResize"
      title="拖拽调整宽度"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const { files } = storeToRefs(editorStore)
const { addFile, setActiveFile, removeFile } = editorStore

const handleAddFile = () => {
  const fileName = prompt('请输入文件名:', 'untitled.js')
  if (fileName) {
    addFile(fileName)
  }
}

// 拖拽调整宽度
const sidebarWidth = ref(250)
const minWidth = 150
const maxWidth = 600
const isResizing = ref(false)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return
    
    const newWidth = e.clientX
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth
    }
  }
  
  const onMouseUp = () => {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.sidebar {
  min-width: 150px;
  max-width: 600px;
  background: #1e1e1e;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 14px;
  color: #ccc;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}

.btn-icon:hover {
  color: #fff;
}

.file-list {
  flex: 1;
  overflow-y: auto;
}

.file-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ccc;
  transition: background 0.2s;
}

.file-item:hover {
  background: #2a2a2a;
}

.file-item.active {
  background: #37373d;
  color: #fff;
}

.file-icon {
  font-size: 16px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-close {
  background: transparent;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .btn-close {
  opacity: 1;
}

.btn-close:hover {
  color: #fff;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;
  z-index: 10;
}

.resize-handle:hover {
  background: #007acc;
}

.resize-handle:active {
  background: #0098ff;
}
</style>
