function getTokenFromRequest(req) {
  // Observation endpoints accept the same token from a custom header or a
  // Bearer token so scripts, curl, and future tooling can all use the route.
  const headerToken = req.get('x-observation-token') || req.get('x-local-admin-token');
  if (headerToken) return headerToken;

  const auth = req.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }

  return '';
}

export function requireObservationAccess(req, res, next) {
  const method = req.method.toUpperCase();
  const isRead = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

  // Token policy:
  // - OBSERVATION_READ_TOKEN is optional and only enforced when secure reads are
  //   explicitly enabled.
  // - OBSERVATION_WRITE_TOKEN is the preferred write key for observations.
  // - LOCAL_ADMIN_TOKEN remains a fallback so one local token can unlock the app
  //   during development without building a full auth system.
  const readToken = process.env.OBSERVATION_READ_TOKEN || '';
  const writeToken = process.env.OBSERVATION_WRITE_TOKEN || process.env.LOCAL_ADMIN_TOKEN || '';
  const secureReads = process.env.OBSERVATION_SECURE_READS === 'true';
  const isProd = process.env.NODE_ENV === 'production';

  const providedToken = getTokenFromRequest(req);

  if (isRead) {
    const shouldRequireReadToken = secureReads && Boolean(readToken);
    if (!shouldRequireReadToken) {
      next();
      return;
    }

    if (providedToken && providedToken === readToken) {
      next();
      return;
    }

    res.status(401).json({ message: 'Unauthorized. Provide x-observation-token or Bearer token.' });
    return;
  }

  if (!writeToken) {
    if (isProd) {
      // Fail closed in production if nobody configured a write secret.
      res.status(503).json({ message: 'Observation write token is not configured on this deployment.' });
      return;
    }

    // In local development, the route remains usable even before secrets are set.
    next();
    return;
  }

  if (providedToken && providedToken === writeToken) {
    next();
    return;
  }

  res.status(401).json({ message: 'Unauthorized. Observation write token required.' });
}
