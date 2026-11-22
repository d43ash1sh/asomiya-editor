import React from 'react';
import {
  Files,
  Search,
  LayoutGrid,
  Code2,
  BookOpen,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import type { ActivityTab } from '../../types';

interface ActivityBarProps {
  activeTab: ActivityTab;
  setActiveTab: (tab: ActivityTab) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  errorCount: number;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
  theme,
  toggleTheme,
  errorCount,
}) => {
  const handleTabClick = (tab: ActivityTab) => {
    if (activeTab === tab && isSidebarOpen) {
      toggleSidebar();
    } else {
      setActiveTab(tab);
      if (!isSidebarOpen) toggleSidebar();
    }
  };

  const topItems: { id: ActivityTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'explorer', label: 'Explorer (Ctrl+Shift+E)', icon: <Files size={22} /> },
    { id: 'search', label: 'Search (Ctrl+Shift+F)', icon: <Search size={22} /> },
    { id: 'templates', label: 'Examples & Algorithms', icon: <LayoutGrid size={22} /> },
    { id: 'python', label: 'Python Preview', icon: <Code2 size={22} /> },
    { id: 'docs', label: 'Language Docs & Cheatsheet', icon: <BookOpen size={22} /> },
  ];

  return (
    <div
      style={{
        width: 48,
        height: '100%',
        backgroundColor: 'var(--vscode-activity-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        userSelect: 'none',
        borderRight: '1px solid var(--vscode-border)',
        zIndex: 20,
      }}
    >
      {/* Top Icons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}>
        {/* Asomiya Logo */}
        <a
          href="https://asomiya.codes"
          target="_blank"
          rel="noreferrer"
          title="অসমীয়া (asomiya.codes)"
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            backgroundColor: 'var(--logo)',
            color: '#292524',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 17,
            fontFamily: 'var(--font-assamese)',
            textDecoration: 'none',
            marginBottom: 4,
            boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          }}
        >
          অ
        </a>
        {topItems.map((item) => {
          const isActive = isSidebarOpen && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              title={item.label}
              style={{
                width: 44,
                height: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: isActive ? 'var(--vscode-activity-active)' : 'var(--vscode-activity-inactive)',
                borderLeft: isActive ? '2px solid var(--vscode-activity-badge)' : '2px solid transparent',
                position: 'relative',
                transition: 'color 0.15s ease',
              }}
            >
              {item.icon}
              {item.id === 'explorer' && errorCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    backgroundColor: 'var(--vscode-error-red)',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: 14,
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {errorCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Icons: Theme toggle & Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{
            width: 44,
            height: 40,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--vscode-activity-inactive)',
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={() => handleTabClick('settings')}
          title="Settings"
          style={{
            width: 44,
            height: 40,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: isSidebarOpen && activeTab === 'settings'
              ? 'var(--vscode-activity-active)'
              : 'var(--vscode-activity-inactive)',
            borderLeft: isSidebarOpen && activeTab === 'settings'
              ? '2px solid var(--vscode-activity-badge)'
              : '2px solid transparent',
          }}
        >
          <Settings size={22} />
        </button>
      </div>
    </div>
  );
};
