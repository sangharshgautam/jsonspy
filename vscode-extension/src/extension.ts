import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('jsonspy.openWorkbench', () => {
        const panel = vscode.window.createWebviewPanel(
            'jsonspyWorkbench',
            'JSONSpy Workbench',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        const mediaDir = path.join(context.extensionPath, 'media');
        const indexPath = path.join(mediaDir, 'index.html');

        if (fs.existsSync(indexPath)) {
            let htmlContent = fs.readFileSync(indexPath, 'utf-8');

            // Adjust asset paths to webview URIs
            htmlContent = htmlContent.replace(
                /(href|src)="([^"]+)"/g,
                (match, attr, assetPath) => {
                    if (assetPath.startsWith('http')) return match;
                    const diskPath = vscode.Uri.file(path.join(mediaDir, assetPath));
                    const webviewUri = panel.webview.asWebviewUri(diskPath);
                    return `${attr}="${webviewUri}"`;
                }
            );

            panel.webview.html = htmlContent;

            // Load active editor content if it's a JSON file
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'json') {
                const fileText = editor.document.getText();
                panel.webview.postMessage({ type: 'loadContent', content: fileText });
            }
        } else {
            panel.webview.html = `<html><body><h3>JSONSpy media assets not found. Please build the extension.</h3></body></html>`;
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
