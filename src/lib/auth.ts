import crypto from 'crypto';
import type { DatabaseSchema } from '@/types';
import { appendAuditLog, readDatabase, writeDatabase } from './db';

const DEFAULT_ADMIN_EMAIL = 'admin@cuadraimperialloy.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123*';
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'cuadra-imperial-loy-secure-admin-secret-2026';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const effectiveSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, effectiveSalt, 64).toString('hex');
  return { hash, salt: effectiveSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

export function checkAdminCredentials(
  email: string,
  pass: string,
  db?: DatabaseSchema
): { ok: boolean; email?: string; error?: string } {
  const currentDb = db || readDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  // If DB has custom credentials configured
  if (currentDb.adminAuth && currentDb.adminAuth.passwordHash) {
    if (normalizedEmail !== currentDb.adminAuth.email.toLowerCase()) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }
    const valid = verifyPassword(
      pass,
      currentDb.adminAuth.passwordHash,
      currentDb.adminAuth.salt
    );
    if (!valid) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }
    return { ok: true, email: currentDb.adminAuth.email };
  }

  // Fallback to default credentials: admin@cuadraimperialloy.com / Admin123*
  if (
    normalizedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() &&
    pass === DEFAULT_ADMIN_PASSWORD
  ) {
    return { ok: true, email: DEFAULT_ADMIN_EMAIL };
  }

  return { ok: false, error: 'Correo o contraseña incorrectos.' };
}

export function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  db?: DatabaseSchema
): { ok: boolean; error?: string } {
  const currentDb = db || readDatabase();

  const currentEmail = currentDb.adminAuth?.email || DEFAULT_ADMIN_EMAIL;
  const authCheck = checkAdminCredentials(currentEmail, currentPassword, currentDb);
  if (!authCheck.ok) {
    return { ok: false, error: 'La contraseña actual no es correcta.' };
  }

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' };
  }

  const { hash, salt } = hashPassword(newPassword);
  currentDb.adminAuth = {
    email: currentEmail,
    passwordHash: hash,
    salt,
    updatedAt: new Date().toISOString(),
  };

  appendAuditLog(currentDb, {
    actor: 'Administrador',
    role: 'admin',
    action: 'CHANGE_PASSWORD',
    entityType: 'settings',
    entityId: 'adminAuth',
    summary: 'Se actualizó la contraseña de acceso al panel administrativo.',
  });

  writeDatabase(currentDb);
  return { ok: true };
}

export function createSessionToken(email: string): string {
  const payload = `${email}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): boolean {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const [email, timestampStr, signature] = raw.split(':');
    if (!email || !timestampStr || !signature) return false;

    const payload = `${email}:${timestampStr}`;
    const expected = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    if (signature !== expected) return false;

    // Token expires in 14 days
    const age = Date.now() - parseInt(timestampStr, 10);
    return age < 14 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

