import { type ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#fa8c16',
    colorError: '#ff4d4f',
    borderRadius: 6,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      primaryShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
    },
    Card: {
      borderRadiusLG: 8,
      boxShadowTertiary:
        '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },
    Modal: {
      borderRadiusLG: 8,
    },
  },
};
