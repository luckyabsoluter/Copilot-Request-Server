import * as vscode from 'vscode';
import express from 'express';
import { Request, Response } from 'express';

export function activate(context: vscode.ExtensionContext) {
  const app = express();
  app.use(express.json());

  // Copilot Chat 뷰 열기
  vscode.commands.executeCommand('github.copilot.chat.openChat')
    .catch(err => console.error('Chat open failed:', err));

  // /prompt 엔드포인트
  app.post('/prompt', async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).send({ error: 'Invalid prompt' });
    }
    try {
      await vscode.commands.executeCommand(
        'github.copilot.chat.sendMessage',
        prompt
      );
      res.send({ status: 'sent' });
    } catch (e) {
      console.error(e);
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
