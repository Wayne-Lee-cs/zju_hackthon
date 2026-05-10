import { useState, useEffect } from 'react'
import { Card, Progress, Button, message, Statistic, Row, Col, Empty } from 'antd'
import { CompressOutlined } from '@ant-design/icons'
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
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
      }}>
        <div>
          <h2 style={{ marginBottom: 8, borderBottom: 'none', paddingBottom: 0 }}>压缩统计</h2>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 15,
            fontFamily: 'var(--font-serif)',
          }}>
            精华版内容的压缩效果
          </div>
        </div>
        <Button
          type="primary"
          icon={<CompressOutlined />}
          onClick={handleCompress}
          loading={loading}
        >
          触发压缩
        </Button>
      </div>

      {stats ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 8,
          border: '1px solid var(--border-secondary)',
          padding: 32,
        }}>
          <Row gutter={32}>
            <Col span={8}>
              <div style={{
                padding: '20px 0',
                borderBottom: '1px solid var(--border-secondary)',
              }}>
                <div style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  marginBottom: 8,
                }}>
                  原始字数
                </div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {stats.original_chars.toLocaleString('zh-CN')}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{
                padding: '20px 0',
                borderBottom: '1px solid var(--border-secondary)',
              }}>
                <div style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  marginBottom: 8,
                }}>
                  压缩后字数
                </div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {stats.compressed_chars.toLocaleString('zh-CN')}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{
                padding: '20px 0',
                borderBottom: '1px solid var(--border-secondary)',
              }}>
                <div style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  marginBottom: 8,
                }}>
                  压缩效果
                </div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: compressionRatio > 30 ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {stats.ratio <= 1 ? `${compressionRatio}%` : 'N/A'}
                </div>
              </div>
            </Col>
          </Row>

          <div style={{ marginTop: 32 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                压缩进度
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                目标: ≤30%
              </span>
            </div>
            <Progress
              percent={compressionRatio}
              status={stats.ratio > 1 ? 'exception' : 'active'}
              showInfo={false}
              strokeColor={stats.ratio <= 0.3 ? '#5A9E6F' : '#DA7756'}
              trailColor="var(--border-secondary)"
            />
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 8,
          border: '1px solid var(--border-secondary)',
          padding: '60px 0',
        }}>
          <Empty
            description="暂无压缩数据，请先触发压缩"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </div>
  )
}
