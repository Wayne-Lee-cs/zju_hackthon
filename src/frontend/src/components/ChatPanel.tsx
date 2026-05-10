import { useState } from 'react'
import { Input, Button, List, message } from 'antd'
import { queryRAG, teacherChat } from '../api/client'

interface Props {
  type: 'rag' | 'teacher'
}

export default function ChatPanel({ type }: Props) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      let response: string
      if (type === 'rag') {
        const result = await queryRAG(input)
        response = result.answer
      } else {
        const result = await teacherChat(input, 'default')
        response = result.reply
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      message.error('请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2>{type === 'rag' ? 'RAG问答' : '教师对话'}</h2>
      <List
        style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}
        dataSource={messages}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.role === 'user' ? '用户' : 'AI'}
              description={item.content}
            />
          </List.Item>
        )}
      />
      <Input.Search
        value={input}
        onChange={e => setInput(e.target.value)}
        onSearch={handleSend}
        enterButton="发送"
        loading={loading}
        placeholder="输入问题..."
      />
    </div>
  )
}
