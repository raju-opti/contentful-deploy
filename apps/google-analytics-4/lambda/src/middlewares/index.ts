import * as Sentry from '@sentry/node';
import { apiErrorHandler, apiErrorMapper } from './apiErrorHandler';
import { serviceAccountKeyProvider } from './serviceAccountKeyProvider';
import { verifySignedRequestMiddleware } from './verifySignedRequests';
import { setSentryContext } from './setSentryContext';
import { isApiError } from '../errors/apiError';

const Middleware = {
  setSentryContext: setSentryContext,
  verifiySignedRequests: verifySignedRequestMiddleware,
  serviceAccountKeyProvider: serviceAccountKeyProvider,
  sentryErrorHandler: Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      return !isApiError(error);
    },
  }),
  apiErrorMapper: apiErrorMapper,
  apiErrorHandler: apiErrorHandler,
};

export default Middleware;
