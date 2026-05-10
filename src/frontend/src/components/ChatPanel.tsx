import { useState, useRef, useEffect } from 'react'
import { Input, Button, message, Empty } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons'
import { queryRAG, teacherChat } from '../api/client'

interface Props {
  type: 'rag' | 'teacher'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPanel({ type }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      let response: string
      if (type === 'rag') {
        const result = await queryRAG(input)
        response = result.answer
      } else {
        const result = await teacherChat(input, 'session_' + Date.now())
        response = result.reply
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      message.error('请求失败')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <h2>{type === 'rag' ? 'RAG 问答' : '教师对话'}</h2>
      <div style={{
        marginBottom: 24,
        color: 'var(--text-secondary)',
        fontSize: 15,
        fontFamily: 'var(--font-serif)',
      }}>
        {type === 'rag'
          ? '基于教材内容的精准问答，所有回答均带引用来源'
          : '与 AI 助教对话，支持查询和修改整合决策'}
      </div>

      <div style={{
        flex: 1,
        background: 'var(--bg-card)',
        borderRadius: 8,
        border: '1px solid var(--border-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
        }}>
          {messages.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Empty
                description={
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {type === 'rag' ? '输入问题开始问答' : '输入消息开始对话'}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 24,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #DA7756 0%, #E8937A 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 15,
                    lineHeight: 1.7,
                    borderTopLeftRadius: msg.role === 'assistant' ? 4 : 12,
                    borderTopRightRadius: msg.role === 'user' ? 4 : 12,
                  }}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <UserOutlined style={{ color: 'var(--text-secondary)', fontSize: 14 }} />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-secondary)',
          background: 'var(--bg-primary)',
        }}>
          <div style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
          }}>
            <Input.TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={type === 'rag' ? '输入问题...' : '输入消息...'}
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                flex: 1,
                fontFamily: 'var(--font-serif)',
                fontSize: 15,
                resize: 'none',
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              disabled={!input.trim()}
              style={{ height: 40, width: 40, padding: 0 }}
            />
          </div>
          <div style={{
            marginTop: 8,
            fontSize: 12,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
          }}>
            按 Enter 发送，Shift + Enter 换行
          </div>
        </div>
      </div>
    </div>
  )
}
