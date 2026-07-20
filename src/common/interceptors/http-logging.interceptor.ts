import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    let hasError = false;
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const operation = `${request.method} ${request.originalUrl}`;

    this.logger.log(`[START] ${operation}`);

    return next.handle().pipe(
      catchError((error: unknown) => {
        hasError = true;

        const statusCode = response.statusCode >= 400 ? response.statusCode : 500;
        const message =
          error instanceof Error ? error.message : 'Unexpected error occurred';

        this.logger.error(`[ERROR] ${operation} ${statusCode} - ${message}`);

        throw error;
      }),
      finalize(() => {
        const durationMs = Date.now() - start;
        const statusCode = response.statusCode;
        const resultLabel = hasError ? 'FAILED' : 'SUCCESS';
        this.logger.log(
          `[END] ${operation} ${statusCode} - ${resultLabel} - ${durationMs}ms`,
        );
      }),
    );
  }
}
