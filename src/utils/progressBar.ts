import { ProgressConfig } from '../types/index.js';

/**
 * Progress bar utility for console output
 */
export class ProgressBar {
  private readonly total: number;
  private current: number;
  private readonly prefix: string;
  private readonly suffix: string;
  private readonly length: number;
  private lastRender: number;
  private isActive: boolean;
  private readonly startTime: number;

  constructor(config: ProgressConfig) {
    this.total = config.total;
    this.current = 0;
    this.prefix = config.prefix || 'Progreso:';
    this.suffix = config.suffix || 'Completado';
    this.length = config.length || 30;
    this.lastRender = 0;
    this.isActive = false;
    this.startTime = Date.now();
    this.start();
  }

  private start(): void {
    this.isActive = true;
    this.update(0);
  }

  public update(current: number): void {
    const now = Date.now();
    if (
      now - this.lastRender < 100 &&
      current !== this.total &&
      current !== 0
    ) {
      return;
    }

    this.lastRender = now;
    this.current = current;
    process.stdout.write('\x1b[2K');

    const percent = (current / this.total) * 100;
    const filledLength = Math.round((this.length * current) / this.total);
    const bar =
      '■'.repeat(filledLength) + '□'.repeat(this.length - filledLength);

    const timeStr = this.calculateTimeRemaining(now, current);

    process.stdout.write(
      `\r${this.prefix} |${bar}| ${Math.floor(percent)}% ${
        this.suffix
      } ${current}/${this.total}${timeStr}`
    );

    if (current === this.total) {
      process.stdout.write('\n');
      this.isActive = false;
    }
  }

  private calculateTimeRemaining(now: number, current: number): string {
    const elapsedTime = now - this.startTime;
    const estimatedTotal =
      current > 0 ? (elapsedTime * this.total) / current : 0;
    const remainingTime = Math.max(0, estimatedTotal - elapsedTime);

    return remainingTime > 0 && current < this.total
      ? ` (${Math.round(remainingTime / 1000)}s restantes)`
      : '';
  }

  public complete(): void {
    if (this.isActive) {
      this.update(this.total);
    }
  }
}
