import { useState } from 'react'
import { Upload, Button, message } from 'antd'
import type { UploadFile } from 'antd'
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons'
import { uploadFiles } from '../api/client'

export default function FileUpload() {
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择文件')
      return
    }
    setLoading(true)
    try {
      const files = fileList.map(f => f.originFileObj as File).filter(Boolean)
      const result = await uploadFiles(files)
      message.success(`成功上传 ${result.textbooks.length} 个教材`)
      setFileList([])
    } catch (error) {
      message.error('上传失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>教材上传</h2>
      <div style={{
        marginBottom: 32,
        color: 'var(--text-secondary)',
        fontSize: 15,
        fontFamily: 'var(--font-serif)',
        lineHeight: 1.7,
      }}>
        上传您的教材文件，系统将自动解析并构建知识图谱。
        <br />
        支持 PDF、DOCX、Markdown 和纯文本格式。
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 8,
        border: '1px solid var(--border-secondary)',
        padding: 32,
      }}>
        <Upload.Dragger
          multiple
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
          style={{
            background: 'var(--bg-primary)',
            border: '1px dashed var(--border-primary)',
            borderRadius: 6,
          }}
        >
          <div style={{ padding: '40px 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'rgba(218, 119, 86, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <FileTextOutlined style={{ fontSize: 24, color: 'var(--accent-primary)' }} />
            </div>
            <div style={{
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              点击或拖拽文件到此区域
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-tertiary)',
            }}>
              支持批量上传，每个文件最大 50MB
            </div>
          </div>
        </Upload.Dragger>

        {fileList.length > 0 && (
          <div style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid var(--border-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              已选择 {fileList.length} 个文件
            </span>
            <Button
              type="primary"
              onClick={handleUpload}
              loading={loading}
              style={{ minWidth: 120 }}
            >
              开始上传
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
