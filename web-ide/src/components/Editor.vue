<template>
  <div class="editor-container">
    <div v-if="!activeFile" class="empty-state">
      <p>选择或创建一个文件开始编辑</p>
    </div>
    <div v-else class="editor-wrapper">
      <div class="editor-header">
        <span class="file-name">{{ activeFile.name }}</span>
      </div>
      <textarea
        v-model="content"
        @input="handleInput"
        class="code-editor"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const { activeFile } = storeToRefs(editorStore)
const { updateFileContent } = editorStore

const content = ref('')

watch(activeFile, (newFile) => {
  if (newFile) {
    content.value = newFile.content
  }
}, { immediate: true })

const handleInput = () => {
  if (activeFile.value) {
    updateFileContent(activeFile.value.id, content.value)
  }
}
</script>

<style scoped>
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 12px 16px;
  border-bottom: 1px solid #333;
  background: #252526;
}

.file-name {
  font-size: 13px;
  color: #ccc;
}

.code-editor {
  flex: 1;
  padding: 16px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  outline: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}
</style>
