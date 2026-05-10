import { useState } from 'react'
import { Layout as AntLayout, Menu } from 'antd'
import {
  UploadOutlined,
  BookOutlined,
  BranchesOutlined,
  CompressOutlined,
  MessageOutlined,
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
    { key: 'chat', icon: <MessageOutlined />, label: 'RAG问答' },
    { key: 'teacher', icon: <MessageOutlined />, label: '教师对话' },
  ]

  const contentMap: Record<string, JSX.Element> = {
    upload: <FileUpload />,
    books: <BookList />,
    kg: <KnowledgeGraph />,
    merge: <div><MergePanel /><CompressStats /></div>,
    chat: <ChatPanel type="rag" />,
    teacher: <ChatPanel type="teacher" />,
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>
          知识整合智能体
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Content style={{ padding: 24 }}>
        {contentMap[selectedKey]}
      </Content>
    </AntLayout>
  )
}
