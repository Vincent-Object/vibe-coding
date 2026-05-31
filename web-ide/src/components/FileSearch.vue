<template>
  <div v-if="isVisible" class="search-overlay" @click="closeSearch">
    <div class="search-container" @click.stop>
      <div class="search-header">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="搜索文件... (输入文件名)"
          class="search-input"
          @keydown.escape="closeSearch"
          @keydown.down.prevent="selectNext"
          @keydown.up.prevent="selectPrev"
          @keydown.enter="openSelected"
        />
        <button @click="closeSearch" class="btn-close-search">×</button>
      </div>
      <div class="search-results">
        <div
          v-for="(file, index) in filteredFiles"
          :key="file.id"
          :class="['search-item', { selected: index === selectedIndex }]"
          @click="openFile(file.id)"
          @mouseenter="selectedIndex = index"
        >
          <span class="file-icon">📄</span>
          <span class="file-name">{{ file.name }}</span>
        </div>
        <div v-if="filteredFiles.length === 0" class="no-results">
          没有找到匹配的文件
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const { files } = storeToRefs(editorStore)
const { setActiveFile } = editorStore

const isVisible = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement>()

const filteredFiles = computed(() => {
  if (!searchQuery.value) {
    return files.value
  }
  const query = searchQuery.value.toLowerCase()
  return files.value.filter(file => 
    file.name.toLowerCase().includes(query)
  )
})

watch(filteredFiles, () => {
  selectedIndex.value = 0
})

const openSearch = () => {
  isVisible.value = true
  searchQuery.value = ''
  selectedIndex.value = 0
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const closeSearch = () => {
  isVisible.value = false
  searchQuery.value = ''
}

const openFile = (fileId: string) => {
  setActiveFile(fileId)
  closeSearch()
}

const openSelected = () => {
  if (filteredFiles.value.length > 0) {
    openFile(filteredFiles.value[selectedIndex.value].id)
  }
}

const selectNext = () => {
  if (selectedIndex.value < filteredFiles.value.length - 1) {
    selectedIndex.value++
  }
}

const selectPrev = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

// 全局快捷键监听
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault()
    openSearch()
  } else if (e.key === 'Escape' && isVisible.value) {
    closeSearch()
  }
}

// 组件挂载时添加监听
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}

defineExpose({ openSearch })
</script>

<style scoped>
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  z-index: 1000;
}

.search-container {
  background: #2d2d30;
  border: 1px solid #454545;
  border-radius: 6px;
  width: 600px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #454545;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #d4d4d4;
  font-size: 15px;
  padding: 4px 8px;
}

.search-input::placeholder {
  color: #888;
}

.btn-close-search {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
}

.btn-close-search:hover {
  color: #fff;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #d4d4d4;
  transition: background 0.15s;
}

.search-item:hover,
.search-item.selected {
  background: #37373d;
}

.file-icon {
  font-size: 16px;
}

.file-name {
  font-size: 14px;
}

.no-results {
  padding: 24px;
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>
