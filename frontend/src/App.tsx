import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Layout from './components/Layout'
import './styles/global.css'

const anthropicTheme = {
  token: {
    colorPrimary: '#DA7756',
    colorBgBase: '#FAF9F6',
    colorTextBase: '#2D2B2A',
    colorBorder: '#E5E3DF',
    borderRadius: 6,
    boxShadow: 'none',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    colorLink: '#DA7756',
    colorSuccess: '#5A9E6F',
    colorWarning: '#D4A843',
    colorError: '#C44D4D',
    colorTextSecondary: '#7D7A77',
    colorTextTertiary: '#A8A5A0',
  },
  components: {
    Layout: {
      bodyBg: '#FAF9F6',
      headerBg: '#FAF9F6',
      siderBg: '#F0EEEA',
    },
    Button: {
      controlHeight: 36,
      borderRadius: 6,
      fontWeight: 500,
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      borderRadius: 8,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#E5E3DF',
      itemSelectedColor: '#2D2B2A',
      itemHoverBg: '#E8E6E1',
      itemColor: '#7D7A77',
    },
    Input: {
      controlHeight: 36,
      borderRadius: 6,
      colorBgContainer: '#FFFFFF',
    },
    Table: {
      colorBgContainer: '#FFFFFF',
      headerBg: '#F5F4F1',
      borderColor: '#E5E3DF',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Tabs: {
      itemColor: '#7D7A77',
      itemSelectedColor: '#2D2B2A',
      inkBarColor: '#DA7756',
    },
    Message: {
      contentBg: '#FFFFFF',
    },
  },
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={anthropicTheme}>
      <Layout />
    </ConfigProvider>
  )
}

export default App
