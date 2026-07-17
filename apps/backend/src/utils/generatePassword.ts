import { randomInt } from 'crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function pick(chars: string): string {
  return chars[randomInt(chars.length)];
}

// Senha temporária gerada pelo sistema (criação de admin/porteiro pelo superadmin/admin, ou
// redefinição direta) — garante ao menos um caractere de cada classe pra nunca cair fora dos
// requisitos de senha do Supabase Auth.
export function generateTempPassword(length = 12): string {
  const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: Math.max(length - required.length, 0) }, () => pick(ALL));
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
