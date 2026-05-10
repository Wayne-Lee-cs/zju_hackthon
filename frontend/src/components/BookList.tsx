import { useState, useEffect } from 'react'
import { Table, Button, message, Tag, Empty } from 'antd'
import { BookOutlined, BuildOutlined } from '@ant-design/icons'
import { getBooks, buildKG } from '../api/client'

export default function BookList() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      const data = await getBooks()
      setBooks(data.books || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleBuildKG = async (bookId: string) => {
    setLoading(bookId)
    try {
      await buildKG(bookId)
      message.success('知识图谱构建完成')
      loadBooks()
    } catch (error) {
      message.error('构建失败')
    } finally {
      setLoading(null)
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN')
  }

  const columns = [
    {
      title: '教材名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOutlined style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      render: (text: string) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{text}</span>
      ),
    },
    {
      title: '总字数',
      dataIndex: 'total_chars',
      key: 'total_chars',
      render: (num: number) => formatNumber(num),
    },
    {
      title: '章节',
      dataIndex: 'chapters',
      key: 'chapters',
      render: (num: number) => (
        <Tag style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          {num} 章
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Button
          icon={<BuildOutlined />}
          onClick={() => handleBuildKG(record.textbook_id)}
          loading={loading === record.textbook_id}
          size="small"
        >
          构建图谱
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2>教材列表</h2>
      <div style={{
        marginBottom: 24,
        color: 'var(--text-secondary)',
        fontSize: 15,
        fontFamily: 'var(--font-serif)',
      }}>
        已上传的教材文件及其解析状态
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 8,
        border: '1px solid var(--border-secondary)',
        overflow: 'hidden',
      }}>
        <Table
          dataSource={books}
          columns={columns}
          rowKey="textbook_id"
          locale={{
            emptyText: (
              <Empty
                description="暂无教材，请先上传文件"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={false}
        />
      </div>
    </div>
  )
}
