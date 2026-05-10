import { useState, useEffect } from 'react'
import { Table, Button, message, Tag } from 'antd'
import { getDecisions, triggerMerge } from '../api/client'

export default function MergePanel() {
  const [decisions, setDecisions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDecisions()
  }, [])

  const loadDecisions = async () => {
    try {
      const data = await getDecisions()
      setDecisions(data.decisions || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleMerge = async () => {
    setLoading(true)
    try {
      await triggerMerge()
      message.success('整合完成')
      loadDecisions()
    } catch (error) {
      message.error('整合失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '决策ID', dataIndex: 'decision_id', key: 'decision_id' },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={action === 'merge' ? 'blue' : action === 'keep' ? 'green' : 'red'}>
          {action}
        </Tag>
      ),
    },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (val: number) => `${(val * 100).toFixed(0)}%`,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>整合决策</h2>
      <Button onClick={handleMerge} loading={loading} style={{ marginBottom: 16 }}>
        触发整合
      </Button>
      <Table dataSource={decisions} columns={columns} rowKey="decision_id" />
    </div>
  )
}
