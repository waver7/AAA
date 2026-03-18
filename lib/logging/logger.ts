export type LogLevel = 'info' | 'warn' | 'error';

export function log(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
  const payload = {
    level,
    message,
    context,
    timestamp: new Date().toISOString()
  };

  // Structured JSON logs for compatibility with cloud log pipelines.
  console.log(JSON.stringify(payload));
}
