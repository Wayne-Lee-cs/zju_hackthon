import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { Empty, Tag } from 'antd'
import { BranchesOutlined } from '@ant-design/icons'
import { getMergedKG } from '../api/client'

export default function KnowledgeGraph() {
  const [option, setOption] = useState<any>(null)
  const [nodeCount, setNodeCount] = useState(0)
  const [linkCount, setLinkCount] = useState(0)

  useEffect(() => {
    loadGraph()
  }, [])

  const loadGraph = async () => {
    try {
      const data = await getMergedKG()
      const nodes = data.nodes || []
      const relations = data.relations || []
      setNodeCount(nodes.length)
      setLinkCount(relations.length)

      const categories = [
        { name: '核心概念', itemStyle: { color: '#DA7756' } },
        { name: '定理', itemStyle: { color: '#6B8E7B' } },
        { name: '方法', itemStyle: { color: '#7B8EB5' } },
        { name: '现象', itemStyle: { color: '#B5956B' } },
      ]

      setOption({
        backgroundColor: '#FAF9F6',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E3DF',
          textStyle: {
            color: '#2D2B2A',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
          },
          formatter: (params: any) => {
            if (params.dataType === 'node') {
              return `<div style="font-weight:500;margin-bottom:4px">${params.name}</div>
                      <div style="color:#7D7A77;font-size:12px">${params.value || ''}</div>`
            }
            return params.name
          },
        },
        legend: {
          data: categories.map(c => c.name),
          bottom: 16,
          textStyle: {
            color: '#7D7A77',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
          },
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 24,
        },
        series: [{
          type: 'graph',
          layout: 'force',
          data: nodes.map((n: any) => {
            const idx = categories.findIndex(c => c.name === n.category)
            return {
              id: n.id,
              name: n.name,
              category: idx === -1 ? 0 : idx,
              symbolSize: 16 + (n.frequency || 1) * 4,
              value: n.definition,
              itemStyle: {
                borderColor: '#FFFFFF',
                borderWidth: 2,
              },
              label: {
                show: true,
                position: 'bottom',
                fontSize: 11,
                color: '#7D7A77',
                fontFamily: 'Inter, sans-serif',
              },
            }
          }),
          links: relations.map((r: any) => ({
            source: r.source,
            target: r.target,
            lineStyle: {
              color: '#E5E3DF',
              width: 1,
              curveness: 0.1,
            },
          })),
          categories,
          roam: true,
          draggable: true,
          force: {
            repulsion: 300,
            edgeLength: [80, 160],
            gravity: 0.1,
          },
          emphasis: {
            focus: 'adjacency',
            itemStyle: {
              borderWidth: 3,
              borderColor: '#DA7756',
            },
            lineStyle: {
              width: 2,
              color: '#DA7756',
            },
          },
          scaleLimit: {
            min: 0.5,
            max: 3,
          },
        }],
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <h2>知识图谱</h2>
      <div style={{
        marginBottom: 24,
        color: 'var(--text-secondary)',
        fontSize: 15,
        fontFamily: 'var(--font-serif)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        可视化展示知识点之间的关联关系
        {nodeCount > 0 && (
          <span style={{ display: 'flex', gap: 8 }}>
            <Tag style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', margin: 0 }}>
              {nodeCount} 个节点
            </Tag>
            <Tag style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', margin: 0 }}>
              {linkCount} 条关系
            </Tag>
          </span>
        )}
      </div>

      {option ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 8,
          border: '1px solid var(--border-secondary)',
          overflow: 'hidden',
        }}>
          <ReactECharts
            option={option}
            style={{ height: 560 }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 8,
          border: '1px solid var(--border-secondary)',
          padding: '80px 0',
        }}>
          <Empty
            image={<BranchesOutlined style={{ fontSize: 48, color: 'var(--text-tertiary)' }} />}
            description="暂无数据，请先上传教材并构建图谱"
          />
        </div>
      )}
    </div>
  )
}
