// theme/themeConfig.ts
import type { ThemeConfig } from 'antd';
import colors from './color.constant';

// ant design theme config
const theme: ThemeConfig = {
  token: {
    fontFamily: 'Inter',
    fontSize: 16,
    colorPrimary: colors.primary,
  },
  components: {
    Button: {
      colorPrimary: colors.primary,
    },
  },
};

export default theme;
