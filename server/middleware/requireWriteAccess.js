import { requireLocalAdmin } from './localAdminAuth.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function requireWriteAccess(req, res, next) {
  if (!WRITE_METHODS.has(req.method)) {
    next();
    return;
  }

  requireLocalAdmin(req, res, next);
}
