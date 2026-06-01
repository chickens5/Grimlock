export function requireLocalAdmin(req, res, next) {
  const requiredToken = process.env.LOCAL_ADMIN_TOKEN;

  // Local-first behavior:
  // - If LOCAL_ADMIN_TOKEN is not set, write routes stay open so the app works
  //   immediately in a private development environment.
  // - If LOCAL_ADMIN_TOKEN is set, every write request must send the same value
  //   in the x-local-admin-token header.
  // - This is an admin convenience gate, not end-user authentication.
  if (!requiredToken) {
    next();
    return;
  }

  const providedToken = req.get('x-local-admin-token');
  if (providedToken && providedToken === requiredToken) {
    next();
    return;
  }

  res.status(401).json({ message: 'Unauthorized. Provide x-local-admin-token.' });
}
