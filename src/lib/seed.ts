import rawDatabase from '@/data/database.json';
import type { DatabaseSchema } from '@/types';

/**
 * Fuente única de verdad unificada con database.json (Sección 2.4 y 10.17).
 * Elimina cualquier discrepancia entre seed.ts y database.json.
 */
export const initialSeedData: DatabaseSchema = rawDatabase as unknown as DatabaseSchema;

export default initialSeedData;

