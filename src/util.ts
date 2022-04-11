import terminalKit from 'terminal-kit';

const terminal = terminalKit.terminal;

export async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type LightStatus = 0 | 1 | 2;

export class SignalLight {
  status: LightStatus;
  message: string;

  constructor(message = '') {
    this.status = 0;
    this.message = message;
    this.render();
  }

  updateStatus(status: LightStatus, message: string = this.message): void {
    this.status = status;
    this.message = message;
    this.render();
  }

  private render(): void {
    const { status, message } = this;

    terminal.eraseLine();
    terminal.column(0);
    terminal('(');
    terminal('○'.repeat(status));
    if (status === 0) {
      terminal.brightRed('●');
    } else if (status === 1) {
      terminal.brightYellow('●');
    } else {
      terminal.brightGreen('●');
    }
    terminal('○'.repeat(2 - status));
    terminal(') ');
    terminal(message);
  }

  destroy(): void {
    terminal.nextLine(1);
  }
}
