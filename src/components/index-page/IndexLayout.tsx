import type { ThemeType } from '@/types/family.types';

interface IndexLayoutProps {
  currentTheme: ThemeType;
  themeClasses: {
    background: string;
    baseFont: string;
  };
  children: React.ReactNode;
}

export function IndexLayout({
  currentTheme,
  themeClasses,
  children,
}: IndexLayoutProps) {
  return (
    <div
      className={`min-h-screen ${themeClasses.background} ${themeClasses.baseFont} transition-all duration-700 ease-in-out ${
        currentTheme === 'mono' ? 'theme-mono' : ''
      } ${currentTheme === '1' ? 'theme-1' : ''}`}
    >
      {children}
    </div>
  );
}