import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { requestContextStorage } from '../storage/request-context.storage';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  formatMessage(
    logLevel: string,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string,
  ): string {
    const context = requestContextStorage.getStore();
    const requestId = context?.requestId ? `[${context.requestId}] ` : '';
    
    return super.formatMessage(
      logLevel,
      `${requestId}${message}`,
      pidMessage,
      formattedLogLevel,
      contextMessage,
      timestampDiff,
    );
  }
}
