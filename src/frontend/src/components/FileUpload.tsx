import { useState } from 'react'
import { Upload, Button, message } from 'antd'
import type { UploadFile } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
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
    <div style={{ padding: 24 }}>
      <h2>教材上传</h2>
      <p>支持 PDF、DOCX、MD、TXT 格式</p>
      <Upload.Dragger
        multiple
        beforeUpload={() => false}
        fileList={fileList}
        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
      </Upload.Dragger>
      <Button
        type="primary"
        onClick={handleUpload}
        loading={loading}
        style={{ marginTop: 16 }}
      >
        开始上传
      </Button>
    </div>
  )
}
