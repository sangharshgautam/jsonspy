import React, { useState, useEffect } from 'react';
import { DocumentTab, ThemeMode, ViewMode } from './types/jsonspy';
import { SAMPLE_DATASETS } from './utils/sampleData';
import { smartFixJSON } from './utils/smartFix';
import { openJsonFile, saveJsonFile } from './utils/fileSystem';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TextView } from './components/TextView';
import { GridView } from './components/GridView';
import { SchemaView } from './components/SchemaView';
import { QueryWorkbench } from './components/QueryWorkbench';
import { GeneratorModal } from './components/GeneratorModal';
import { StatusBar } from './components/StatusBar';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('jsonspy_theme');
    return (saved as ThemeMode) || 'dark';
  });

  // Sync theme class with <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('jsonspy_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initial workspace tabs setup
  const [tabs, setTabs] = useState<DocumentTab[]>([
    {
      id: 'tab_order_1',
      title: 'order.json',
      content: SAMPLE_DATASETS.order.content,
      isDirty: false,
      selectedView: 'text',
      schemaContent: SAMPLE_DATASETS.schema.content,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab_order_1');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = (updates: Partial<DocumentTab>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === activeTabId ? { ...tab, ...updates } : tab))
    );
  };

  const handleContentChange = (newContent: string) => {
    updateActiveTab({ content: newContent, isDirty: true });
  };

  const handleAddTab = () => {
    const newId = `tab_${Date.now()}`;
    const newTab: DocumentTab = {
      id: newId,
      title: `document_${tabs.length + 1}.json`,
      content: '{\n  "title": "New JSON Document",\n  "created": "' + new Date().toISOString() + '"\n}',
      isDirty: true,
      selectedView: 'text',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (idToClose: string) => {
    if (tabs.length <= 1) return;
    const nextTabs = tabs.filter((t) => t.id !== idToClose);
    setTabs(nextTabs);
    if (activeTabId === idToClose) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  const handleOpenFile = async () => {
    const res = await openJsonFile();
    if (res) {
      const newId = `tab_${Date.now()}`;
      const newTab: DocumentTab = {
        id: newId,
        title: res.name,
        content: res.content,
        filePath: res.path,
        isDirty: false,
        selectedView: 'text',
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newId);
    }
  };

  const handleSaveFile = async () => {
    if (!activeTab) return;
    const path = await saveJsonFile(activeTab.content, activeTab.filePath, activeTab.title);
    if (path || activeTab.content) {
      updateActiveTab({
        isDirty: false,
        filePath: path || activeTab.filePath,
        title: path ? path.split(/[/\\]/).pop() || activeTab.title : activeTab.title,
      });
    }
  };

  const handlePrettify = () => {
    if (!activeTab) return;
    try {
      const parsed = JSON.parse(activeTab.content);
      const formatted = JSON.stringify(parsed, null, 2);
      handleContentChange(formatted);
    } catch (e) {
      const report = smartFixJSON(activeTab.content);
      if (report.isValidJson) {
        handleContentChange(report.repairedText);
      }
    }
  };

  const handleSmartFix = () => {
    if (!activeTab) return;
    const report = smartFixJSON(activeTab.content);
    if (report.isValidJson) {
      handleContentChange(report.repairedText);
    }
  };

  const handleSelectSamplePreset = (presetKey: string) => {
    const preset = SAMPLE_DATASETS[presetKey];
    if (preset) {
      const newId = `tab_${Date.now()}`;
      const newTab: DocumentTab = {
        id: newId,
        title: preset.filename,
        content: preset.content,
        isDirty: false,
        selectedView: 'text',
        schemaContent: presetKey === 'order' ? SAMPLE_DATASETS.schema.content : undefined,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newId);
    }
  };

  const handleAttachSchema = (schemaStr: string) => {
    updateActiveTab({ schemaContent: schemaStr });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handlePrettify();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        updateActiveTab({ selectedView: 'query' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* App Header */}
      <Header
        tabs={tabs}
        activeTabId={activeTabId}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectTab={setActiveTabId}
        onAddTab={handleAddTab}
        onCloseTab={handleCloseTab}
        onSelectView={(v) => updateActiveTab({ selectedView: v })}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onPrettify={handlePrettify}
        onSmartFix={handleSmartFix}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onSelectSamplePreset={handleSelectSamplePreset}
      />

      {/* Main Workspace with Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          content={activeTab.content}
          schemaContent={activeTab.schemaContent}
          onAttachSchema={handleAttachSchema}
          onSelectSamplePreset={handleSelectSamplePreset}
        />

        <main className="flex-1 h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
          {activeTab.selectedView === 'text' && (
            <TextView
              content={activeTab.content}
              onChange={handleContentChange}
              schemaContent={activeTab.schemaContent}
              onApplySmartFix={(repaired) => handleContentChange(repaired)}
              theme={theme}
            />
          )}

          {activeTab.selectedView === 'grid' && (
            <GridView content={activeTab.content} onChange={handleContentChange} />
          )}

          {activeTab.selectedView === 'schema' && (
            <SchemaView content={activeTab.content} onChange={handleContentChange} theme={theme} />
          )}

          {activeTab.selectedView === 'query' && (
            <QueryWorkbench content={activeTab.content} theme={theme} />
          )}
        </main>
      </div>

      {/* App Status Bar */}
      <StatusBar
        filePath={activeTab.filePath}
        viewMode={activeTab.selectedView}
        charCount={activeTab.content.length}
        lineCount={activeTab.content.split('\n').length}
      />

      {/* Code & Schema Generator Modal */}
      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        rawJson={activeTab.content}
        theme={theme}
      />
    </div>
  );
};
