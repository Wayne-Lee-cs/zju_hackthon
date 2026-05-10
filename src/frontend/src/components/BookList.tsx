import { useState, useEffect } from 'react'
import { Table, Button, message } from 'antd'
import { getBooks, buildKG } from '../api/client'

export default function BookList() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    try {
      await buildKG(bookId)
      message.success('知识图谱构建完成')
      loadBooks()
    } catch (error) {
      message.error('构建失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '教材名称', dataIndex: 'title', key: 'title' },
    { title: '文件名', dataIndex: 'filename', key: 'filename' },
    { title: '总字数', dataIndex: 'total_chars', key: 'total_chars' },
    { title: '章节数', dataIndex: 'chapters', key: 'chapters' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button onClick={() => handleBuildKG(record.textbook_id)} loading={loading}>
          构建图谱
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>教材列表</h2>
      <Table dataSource={books} columns={columns} rowKey="textbook_id" />
    </div>
  )
}
