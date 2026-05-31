export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface FileItem {
  id: string
  name: string
  path: string
  content: string
  language: string
  isActive: boolean
}

export interface Project {
  id: string
  name: string
  files: FileItem[]
}
