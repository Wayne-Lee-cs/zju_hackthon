import { useState } from 'react'
import { Layout as AntLayout, Menu } from 'antd'
import {
  UploadOutlined,
  BookOutlined,
  BranchesOutlined,
  CompressOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import FileUpload from './FileUpload'
import BookList from './BookList'
import KnowledgeGraph from './KnowledgeGraph'
import MergePanel from './MergePanel'
import CompressStats from './CompressStats'
import ChatPanel from './ChatPanel'

const { Sider, Content } = AntLayout

export default function Layout() {
  const [selectedKey, setSelectedKey] = useState('upload')

  const menuItems = [
    { key: 'upload', icon: <UploadOutlined />, label: '教材上传' },
    { key: 'books', icon: <BookOutlined />, label: '教材列表' },
    { key: 'kg', icon: <BranchesOutlined />, label: '知识图谱' },
    { key: 'merge', icon: <CompressOutlined />, label: '整合压缩' },
    { key: 'chat', icon: <QuestionCircleOutlined />, label: 'RAG 问答' },
    { key: 'teacher', icon: <MessageOutlined />, label: '教师对话' },
  ]

  const contentMap: Record<string, React.ReactElement> = {
    upload: <FileUpload />,
    books: <BookList />,
    kg: <KnowledgeGraph />,
    merge: <div><MergePanel /><CompressStats /></div>,
    chat: <ChatPanel type="rag" />,
    teacher: <ChatPanel type="teacher" />,
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        theme="light"
        style={{
          borderRight: '1px solid var(--border-primary)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          borderBottom: '1px solid var(--border-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #DA7756 0%, #E8937A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
            }}>
              知
            </div>
            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}>
                知识整合
              </div>
              <div style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.02em',
              }}>
                Knowledge Agent
              </div>
            </div>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          style={{
            borderRight: 'none',
            padding: '8px 0',
          }}
        />
      </Sider>
      <AntLayout style={{ marginLeft: 220 }}>
        <Content style={{
          padding: '32px 48px',
          minHeight: '100vh',
        }}>
          <div className="fade-in" style={{ maxWidth: 1200 }}>
            {contentMap[selectedKey]}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
