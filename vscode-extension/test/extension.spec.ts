import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('VS Code Extension - Manifest & Configuration', () => {
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  it('should have valid metadata and publisher configuration', () => {
    expect(pkg.name).toBe('jsonspy');
    expect(pkg.publisher).toBe('Sangharsh');
    expect(pkg.main).toBe('./dist/extension.js');
    expect(pkg.engines.vscode).toBeDefined();
  });

  it('should register custom editor for json, schema, and geojson formats', () => {
    expect(pkg.contributes.customEditors).toBeDefined();
    expect(pkg.contributes.customEditors.length).toBeGreaterThan(0);

    const customEditor = pkg.contributes.customEditors[0];
    expect(customEditor.viewType).toBe('jsonspy.workbench');
    expect(customEditor.displayName).toBe('JSONSpy Workbench');

    const patterns = customEditor.selector.map((s: any) => s.filenamePattern);
    expect(patterns).toContain('*.json');
    expect(patterns).toContain('*.schema.json');
    expect(patterns).toContain('*.geojson');
    expect(patterns).toContain('*.topojson');
  });

  it('should contribute expected workbench commands', () => {
    const commands = pkg.contributes.commands.map((c: any) => c.command);
    expect(commands).toContain('jsonspy.open');
    expect(commands).toContain('jsonspy.openCurrentFile');
  });

  it('should contribute editor and explorer context menus', () => {
    expect(pkg.contributes.menus['editor/title']).toBeDefined();
    expect(pkg.contributes.menus['explorer/context']).toBeDefined();
  });
});

describe('VS Code Extension - Runtime Provider & Commands', () => {
  let subscriptions: any[] = [];
  let registeredCommands: Map<string, Function> = new Map();
  let registeredProviders: Map<string, any> = new Map();
  let executedCommands: { command: string; args: any[] }[] = [];

  // Mock VS Code API
  const mockVscode: any = {
    ColorThemeKind: { Light: 1, Dark: 2, HighContrast: 3 },
    window: {
      activeColorTheme: { kind: 2 },
      registerCustomEditorProvider: vi.fn((viewType: string, provider: any) => {
        registeredProviders.set(viewType, provider);
        return { dispose: vi.fn() };
      }),
      showInformationMessage: vi.fn(),
      showWarningMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      onDidChangeActiveColorTheme: vi.fn(() => ({ dispose: vi.fn() })),
    },
    commands: {
      registerCommand: vi.fn((cmd: string, handler: Function) => {
        registeredCommands.set(cmd, handler);
        return { dispose: vi.fn() };
      }),
      executeCommand: vi.fn(async (cmd: string, ...args: any[]) => {
        executedCommands.push({ command: cmd, args });
      }),
    },
    workspace: {
      openTextDocument: vi.fn(async (options: any) => ({
        uri: { toString: () => 'untitled:Untitled-1', fsPath: 'Untitled-1' },
        getText: () => options.content || '',
        fileName: 'Untitled-1.json',
      })),
      onDidChangeTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
      applyEdit: vi.fn(async () => true),
    },
    Range: vi.fn((start: any, end: any) => ({ start, end })),
    WorkspaceEdit: vi.fn(() => ({
      replace: vi.fn(),
    })),
    Uri: {
      joinPath: vi.fn((base: any, ...parts: string[]) => ({
        fsPath: path.join(base?.fsPath || '', ...parts),
        toString: () => `vscode-resource://${parts.join('/')}`,
      })),
    },
  };

  beforeEach(() => {
    subscriptions = [];
    registeredCommands.clear();
    registeredProviders.clear();
    executedCommands = [];
    vi.clearAllMocks();
  });

  it('should register custom editor and commands on activation', async () => {
    vi.doMock('vscode', () => mockVscode);
    const { activate } = await import('../src/extension');

    const context: any = {
      subscriptions,
      extensionUri: { fsPath: path.resolve(__dirname, '..') },
    };

    activate(context);

    expect(mockVscode.window.registerCustomEditorProvider).toHaveBeenCalledWith(
      'jsonspy.workbench',
      expect.anything(),
      expect.anything()
    );
    expect(mockVscode.commands.registerCommand).toHaveBeenCalledWith('jsonspy.open', expect.any(Function));
    expect(mockVscode.commands.registerCommand).toHaveBeenCalledWith('jsonspy.openCurrentFile', expect.any(Function));
  });

  it('should execute jsonspy.open and launch custom editor for new scratchpad', async () => {
    vi.doMock('vscode', () => mockVscode);
    const { activate } = await import('../src/extension');

    const context: any = {
      subscriptions,
      extensionUri: { fsPath: path.resolve(__dirname, '..') },
    };

    activate(context);

    const openHandler = registeredCommands.get('jsonspy.open');
    expect(openHandler).toBeDefined();

    await openHandler!();

    expect(mockVscode.workspace.openTextDocument).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'json' })
    );
    expect(mockVscode.commands.executeCommand).toHaveBeenCalledWith(
      'vscode.openWith',
      expect.anything(),
      'jsonspy.workbench'
    );
  });

  it('should handle custom editor lifecycle and message dispatching', async () => {
    vi.doMock('vscode', () => mockVscode);
    const { JsonSpyEditorProvider } = await import('../src/JsonSpyEditorProvider');

    const context: any = {
      extensionUri: { fsPath: path.resolve(__dirname, '..') },
    };

    const provider = new JsonSpyEditorProvider(context);
    let messageListener: ((msg: any) => void) | null = null;
    let postedMessages: any[] = [];

    const mockWebview: any = {
      options: {},
      cspSource: 'vscode-webview:',
      asWebviewUri: vi.fn((uri: any) => uri.toString()),
      onDidReceiveMessage: vi.fn((cb: any) => {
        messageListener = cb;
        return { dispose: vi.fn() };
      }),
      postMessage: vi.fn(async (msg: any) => {
        postedMessages.push(msg);
      }),
    };

    const mockWebviewPanel: any = {
      webview: mockWebview,
      onDidDispose: vi.fn(() => ({ dispose: vi.fn() })),
    };

    const mockDocument: any = {
      uri: { toString: () => 'file:///path/to/test.json', fsPath: 'test.json' },
      fileName: 'test.json',
      getText: () => '{"version": "1.0.0"}',
      isDirty: false,
      save: vi.fn(async () => true),
      positionAt: vi.fn(() => ({ line: 0, character: 0 })),
    };

    await provider.resolveCustomTextEditor(mockDocument, mockWebviewPanel, {} as any);

    expect(mockWebview.options.enableScripts).toBe(true);

    // Simulate 'ready' message from the webview
    expect(messageListener).toBeDefined();
    await messageListener!({ type: 'ready' });

    expect(postedMessages.length).toBeGreaterThan(0);
    const updateMsg = postedMessages.find((m) => m.type === 'updateDocument');
    expect(updateMsg).toBeDefined();
    expect(updateMsg.name).toBe('test.json');
    expect(updateMsg.content).toBe('{"version": "1.0.0"}');
    expect(updateMsg.theme).toBe('dark');

    // Simulate 'save' message from the webview
    await messageListener!({ type: 'save' });
    expect(mockDocument.save).toHaveBeenCalled();
  });
});
