<template>
  <footer class="status-bar">
    <div class="status-left">
      <span class="status-item">
        <span class="icon">📁</span>
        {{ activeFile ? activeFile.name : '无打开的文件' }}
      </span>
      <span v-if="activeFile" class="status-item">
        {{ activeFile.language }}
      </span>
    </div>
    <div class="status-right">
      <span class="status-item">UTF-8</span>
      <span class="status-item">Spaces: 2</span>
      <span class="status-item">Go to Line</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'
import { computed } from 'vue'

const editorStore = useEditorStore()
const { files } = storeToRefs(editorStore)

const activeFile = computed(() => files.value.find(f => f.isActive))
</script>

<style scoped>
.status-bar {
  height: 25px;
  background: #007acc;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  user-select: none;
}

.status-left, .status-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0 4px;
}

.status-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.icon {
  font-size: 14px;
}
</style>
