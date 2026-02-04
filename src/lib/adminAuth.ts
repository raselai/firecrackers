import { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth, getAdminDb } from './firebaseAdmin';

export class AdminRouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AdminRouteError';
    this.status = status;
  }
}

function extractBearerToken(authorizationHeader: string | null): string {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new AdminRouteError(401, 'Unauthorized');
  }
  return authorizationHeader.slice(7).trim();
}

export async function requireAdminFromRequest(request: Request): Promise<DecodedIdToken> {
  const token = extractBearerToken(request.headers.get('authorization'));
  const decodedToken = await getAdminAuth().verifyIdToken(token);
  const adminProfile = await getAdminDb().collection('users').doc(decodedToken.uid).get();

  if (!adminProfile.exists) {
    throw new AdminRouteError(403, 'Forbidden');
  }

  const role = adminProfile.data()?.role;
  if (role !== 'admin') {
    throw new AdminRouteError(403, 'Forbidden');
  }

  return decodedToken;
}
