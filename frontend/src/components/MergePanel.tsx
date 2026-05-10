import { useState, useEffect } from 'react'
import { Table, Button, message, Tag, Empty } from 'antd'
import { MergeCellsOutlined, CheckCircleOutlined } from '@ant-design/icons'
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

  const actionColors: Record<string, { bg: string; color: string; label: string }> = {
    merge: { bg: 'rgba(218, 119, 86, 0.1)', color: '#DA7756', label: '合并' },
    keep: { bg: 'rgba(90, 158, 111, 0.1)', color: '#5A9E6F', label: '保留' },
    remove: { bg: 'rgba(196, 77, 77, 0.1)', color: '#C44D4D', label: '移除' },
  }

  const columns = [
    {
      title: '决策 ID',
      dataIndex: 'decision_id',
      key: 'decision_id',
      width: 100,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-tertiary)' }}>
          {text}
        </span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action: string) => {
        const config = actionColors[action] || actionColors.keep
        return (
          <Tag style={{
            background: config.bg,
            color: config.color,
            border: 'none',
            fontWeight: 500,
          }}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => (
        <span style={{
          fontFamily: 'var(--font-serif)',
          color: 'var(--text-secondary)',
          fontSize: 14,
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 90,
      render: (val: number) => (
        <span style={{
          fontWeight: 500,
          color: val >= 0.8 ? 'var(--accent-primary)' : 'var(--text-secondary)',
        }}>
          {(val * 100).toFixed(0)}%
        </span>
      ),
    },
  ]

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
      }}>
        <div>
          <h2 style={{ marginBottom: 8, borderBottom: 'none', paddingBottom: 0 }}>整合决策</h2>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 15,
            fontFamily: 'var(--font-serif)',
          }}>
            跨教材知识点整合的决策记录
          </div>
        </div>
        <Button
          type="primary"
          icon={<MergeCellsOutlined />}
          onClick={handleMerge}
          loading={loading}
        >
          触发整合
        </Button>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 8,
        border: '1px solid var(--border-secondary)',
        overflow: 'hidden',
      }}>
        <Table
          dataSource={decisions}
          columns={columns}
          rowKey="decision_id"
          locale={{
            emptyText: (
              <Empty
                description="暂无整合决策，请先上传多本教材并触发整合"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={decisions.length > 10 ? { pageSize: 10 } : false}
        />
      </div>
    </div>
  )
}
