import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { getMergedKG } from '../api/client'

export default function KnowledgeGraph() {
  const [option, setOption] = useState<any>(null)

  useEffect(() => {
    loadGraph()
  }, [])

  const loadGraph = async () => {
    try {
      const data = await getMergedKG()
      const categories = [
        { name: '核心概念' },
        { name: '定理' },
        { name: '方法' },
        { name: '现象' },
      ]

      setOption({
        tooltip: {},
        legend: { data: categories.map(c => c.name) },
        series: [{
          type: 'graph',
          layout: 'force',
          data: (data.nodes || []).map((n: any) => {
            const idx = categories.findIndex(c => c.name === n.category)
            return {
              id: n.id,
              name: n.name,
              category: idx === -1 ? 0 : idx,
              symbolSize: 20 + (n.frequency || 1) * 5,
              value: n.definition,
            }
          }),
          links: (data.relations || []).map((r: any) => ({
            source: r.source,
            target: r.target,
            label: { show: true, formatter: r.relation_type },
          })),
          categories,
          roam: true,
          label: { show: true },
          force: { repulsion: 200 },
        }],
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>知识图谱</h2>
      {option ? (
        <ReactECharts option={option} style={{ height: 600 }} />
      ) : (
        <p>暂无数据，请先上传教材并构建图谱</p>
      )}
    </div>
  )
}
