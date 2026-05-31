import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)

  const addMessage = (role: Message['role'], content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now()
    }
    messages.value.push(message)
  }

  const sendMessage = async (content: string) => {
    addMessage('user', content)
    isLoading.value = true

    try {
      // 模拟 AI 响应
      await new Promise(resolve => setTimeout(resolve, 1000))
      addMessage('assistant', '这是一个模拟的 AI 响应。请集成实际的 AI API。')
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    isLoading,
    addMessage,
    sendMessage,
    clearMessages
  }
})
