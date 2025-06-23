import * as vscode from 'vscode';
import express, { Request, Response } from 'express';

export function activate(context: vscode.ExtensionContext) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Copilot Chat 뷰 열기
  vscode.commands.executeCommand('github.copilot.chat.openChat')
    .then(undefined, err => {
      console.error('Chat open failed:', err);
      vscode.window.showErrorMessage('Failed to open Copilot Chat. Please ensure GitHub Copilot is installed and enabled.');
    });

  // /prompt 엔드포인트
  app.post('/prompt', async (req: Request, res: Response): Promise<void> => {
    const { prompt } = req.body || {};
    if (typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).send({ error: 'Invalid prompt' });
      return;
    }
    try {
      await vscode.commands.executeCommand(
        'workbench.action.chat.open',
        prompt
      );
      res.send({ status: 'sent' });
    } catch (e) {
      console.error(e);
      vscode.window.showErrorMessage(`Failed to receive prompt: ${String(e)}`);
      res.status(500).send({ error: String(e) });
    }
  });

  // 서버 시작
  const port = 4242;
  const server = app.listen(port, () => {
    vscode.window.showInformationMessage(`Copilot Agent Server listening on ${port}`);
  });

  // 비활성화 시 서버 종료
  context.subscriptions.push({ dispose: () => server.close() });
}

export function deactivate() {
  // 추가 정리 로직 필요 시 구현
}
