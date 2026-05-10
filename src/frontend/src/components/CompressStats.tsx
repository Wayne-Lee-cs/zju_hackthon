import { useState, useEffect } from 'react'
import { Card, Progress, Button, message, Statistic, Row, Col } from 'antd'
import { getCompressStats, triggerCompress } from '../api/client'

export default function CompressStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getCompressStats()
      setStats(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCompress = async () => {
    setLoading(true)
    try {
      await triggerCompress()
      message.success('压缩完成')
      loadStats()
    } catch (error) {
      message.error('压缩失败')
    } finally {
      setLoading(false)
    }
  }

  const compressionRatio = stats ? Math.max(0, Math.min(100, Math.round((1 - stats.ratio) * 100))) : 0

  return (
    <div style={{ padding: 24 }}>
      <h2>压缩统计</h2>
      <Button onClick={handleCompress} loading={loading} style={{ marginBottom: 16 }}>
        触发压缩
      </Button>
      {stats && (
        <Card>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="原始字数" value={stats.original_chars} />
            </Col>
            <Col span={8}>
              <Statistic title="压缩后字数" value={stats.compressed_chars} />
            </Col>
            <Col span={8}>
              <Statistic
                title="压缩比"
                value={stats.ratio <= 1 ? ((1 - stats.ratio) * 100).toFixed(1) : 'N/A'}
                suffix="%"
              />
            </Col>
          </Row>
          <Progress
            percent={compressionRatio}
            status={stats.ratio > 1 ? 'exception' : 'active'}
            format={() => stats.ratio <= 1
              ? `已压缩 ${compressionRatio}%`
              : '内容膨胀'
            }
            style={{ marginTop: 16 }}
          />
        </Card>
      )}
    </div>
  )
}
