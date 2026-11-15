import * as vscode from 'vscode';
import { JsonSpyEditorProvider } from './JsonSpyEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  // Register the Custom Text Editor Provider for JSON files
  context.subscriptions.push(JsonSpyEditorProvider.register(context));

  // Command 1: Open a new scratchpad in JSONSpy
  context.subscriptions.push(
    vscode.commands.registerCommand('jsonspy.open', async () => {
      const defaultContent = '{\n  "title": "New JSON Document",\n  "created": "' + new Date().toISOString() + '"\n}';
      const doc = await vscode.workspace.openTextDocument({
        language: 'json',
        content: defaultContent,
      });
      await vscode.commands.executeCommand('vscode.openWith', doc.uri, JsonSpyEditorProvider.viewType);
    })
  );

  // Command 2: Open active file or selected explorer file in JSONSpy
  context.subscriptions.push(
    vscode.commands.registerCommand('jsonspy.openCurrentFile', async (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (!targetUri) {
        vscode.window.showWarningMessage('No active JSON file to open with JSONSpy.');
        return;
      }
      await vscode.commands.executeCommand('vscode.openWith', targetUri, JsonSpyEditorProvider.viewType);
    })
  );
}

export function deactivate() {}
