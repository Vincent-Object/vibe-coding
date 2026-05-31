<template>
  <div class="chat-panel" :style="{ width: panelWidth + 'px' }">
    <div 
      class="resize-handle"
      @mousedown="startResize"
      title="拖拽调整宽度"
    ></div>
    <div class="chat-header">
      <h3>AI 助手</h3>
      <button @click="clearMessages" class="btn-clear" title="清空对话">🗑️</button>
    </div>
    <div class="messages-container" ref="messagesRef">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', `message-${message.role}`]"
      >
        <div class="message-header">
          <span class="message-role">{{ getRoleLabel(message.role) }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
      </div>
      <div v-if="isLoading" class="message message-assistant">
        <div class="message-header">
          <span class="message-role">AI 助手</span>
        </div>
        <div class="message-content loading">正在思考...</div>
      </div>
    </div>
    <div class="input-container">
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="handleSend"
        placeholder="输入消息... (Enter 发送)"
        class="chat-input"
      />
      <button
        @click="handleSend"
        :disabled="!inputText.trim() || isLoading"
        class="btn-send"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const { messages, isLoading } = storeToRefs(chatStore)
const { sendMessage, clearMessages } = chatStore

const inputText = ref('')
const messagesRef = ref<HTMLElement>()

// 拖拽调整宽度
const panelWidth = ref(350)
const minWidth = 250
const maxWidth = 700
const isResizing = ref(false)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  const startX = e.clientX
  const startWidth = panelWidth.value
  
  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return
    
    const deltaX = startX - e.clientX
    const newWidth = startWidth + deltaX
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      panelWidth.value = newWidth
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

const handleSend = async () => {
  if (!inputText.value.trim() || isLoading.value) return
  
  const text = inputText.value
  inputText.value = ''
  await sendMessage(text)
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    user: '你',
    assistant: 'AI 助手',
    system: '系统'
  }
  return labels[role] || role
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.chat-panel {
  min-width: 250px;
  max-width: 700px;
  background: #1e1e1e;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  position: relative;
}

.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
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

.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 14px;
  color: #ccc;
}

.btn-clear {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.message-role {
  font-weight: 600;
  color: #569cd6;
}

.message-user .message-role {
  color: #4ec9b0;
}

.message-time {
  color: #888;
}

.message-content {
  padding: 8px 12px;
  border-radius: 6px;
  background: #2d2d30;
  color: #d4d4d4;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-user .message-content {
  background: #264f78;
}

.message-content.loading {
  font-style: italic;
  color: #888;
}

.input-container {
  padding: 16px;
  border-top: 1px solid #333;
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  background: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 13px;
  resize: none;
  min-height: 60px;
  font-family: inherit;
}

.chat-input:focus {
  outline: none;
  border-color: #569cd6;
}

.btn-send {
  padding: 8px 16px;
  background: #0e639c;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.btn-send::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #0e639c;
  border-radius: 4px;
  z-index: -1;
  transition: background 0.2s;
}

.btn-send:hover:not(:disabled)::before {
  background: #1177bb;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
