import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class JsonSpyEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'jsonspy.workbench';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new JsonSpyEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      JsonSpyEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: true,
      }
    );
    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const webview = webviewPanel.webview;

    // Enable scripts and restrict resource roots to media directory
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
      ],
    };

    // Flag to avoid feedback loops when the webview triggers the text document change
    let isEditingFromWebview = false;

    // Set initial HTML content
    webview.html = this.getHtmlForWebview(webview);

    const getThemeMode = (): 'dark' | 'light' => {
      const kind = vscode.window.activeColorTheme.kind;
      return kind === vscode.ColorThemeKind.Dark || kind === vscode.ColorThemeKind.HighContrast
        ? 'dark'
        : 'light';
    };

    const sendDocumentToWebview = () => {
      const fileName = path.basename(document.fileName);
      webview.postMessage({
        type: 'updateDocument',
        content: document.getText(),
        name: fileName,
        path: document.fileName,
        isDirty: document.isDirty,
        theme: getThemeMode(),
      });
    };

    // Handle messages from the webview
    webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'ready':
          sendDocumentToWebview();
          break;

        case 'documentChanged':
          isEditingFromWebview = true;
          await this.updateTextDocument(document, message.content);
          isEditingFromWebview = false;
          break;

        case 'save':
          await document.save();
          break;

        case 'info':
          vscode.window.showInformationMessage(message.text);
          break;

        case 'error':
          vscode.window.showErrorMessage(message.text);
          break;
      }
    });

    // Listen for external changes to the document (e.g., undo/redo, external edit)
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        if (!isEditingFromWebview) {
          sendDocumentToWebview();
        }
      }
    });

    // Listen for theme changes in VS Code
    const changeThemeSubscription = vscode.window.onDidChangeActiveColorTheme(() => {
      webview.postMessage({
        type: 'themeChanged',
        theme: getThemeMode(),
      });
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      changeThemeSubscription.dispose();
    });
  }

  private async updateTextDocument(document: vscode.TextDocument, newContent: string) {
    if (document.getText() === newContent) {
      return;
    }
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );
    edit.replace(document.uri, fullRange, newContent);
    await vscode.workspace.applyEdit(edit);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const mediaUri = vscode.Uri.joinPath(this.context.extensionUri, 'media');
    const indexHtmlPath = path.join(mediaUri.fsPath, 'index.html');

    if (!fs.existsSync(indexHtmlPath)) {
      return `<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; padding: 24px; color: var(--vscode-foreground);">
    <h2>JSONSpy Webview Assets Not Found</h2>
    <p>Please run <code>npm run build:vscode</code> to bundle the frontend into <code>media/</code>.</p>
  </body>
</html>`;
    }

    let html = fs.readFileSync(indexHtmlPath, 'utf-8');

    // Convert absolute asset paths /assets/... to webview URIs
    html = html.replace(/(src|href)=["']\/assets\/([^"']+)["']/g, (_match, attr, fileName) => {
      const assetUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, 'assets', fileName));
      return `${attr}="${assetUri.toString()}"`;
    });

    // Also support any relative ./assets/...
    html = html.replace(/(src|href)=["']\.\/assets\/([^"']+)["']/g, (_match, attr, fileName) => {
      const assetUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, 'assets', fileName));
      return `${attr}="${assetUri.toString()}"`;
    });

    // Inject Webview CSP and Host Marker
    const cspSource = webview.cspSource;
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline' https://fonts.googleapis.com; script-src ${cspSource} 'unsafe-inline' 'unsafe-eval' https:; font-src ${cspSource} https://fonts.gstatic.com data:; img-src ${cspSource} data: https: blob:; connect-src ${cspSource} https: blob: data:;">`;

    // Inject __VSCODE_WEBVIEW__ indicator and acquireVsCodeApi bootstrap
    const vsCodeBootstrap = `
    <script>
      window.__VSCODE_WEBVIEW__ = true;
      if (typeof acquireVsCodeApi === 'function') {
        window.vscodeApi = acquireVsCodeApi();
      }
    </script>
    `;

    html = html.replace('<head>', `<head>\n    ${cspMeta}\n    ${vsCodeBootstrap}`);

    return html;
  }
}
