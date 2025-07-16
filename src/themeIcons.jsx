import { Sun, Moon, Sunset, Waves } from 'lucide-react';

export const getThemeIcon = (themeName, size = 18) => {
  const iconProps = { size, style: { flexShrink: 0 } };
  
  switch (themeName) {
    case 'light':
      return <Sun {...iconProps} />;
    case 'dark':
      return <Moon {...iconProps} />;
    case 'sunset':
      return <Sunset {...iconProps} />;
    case 'ocean':
      return <Waves {...iconProps} />;
    default:
      return <Sun {...iconProps} />;
  }
};
