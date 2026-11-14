import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function IndexRedirectPage() {
  const headersList = await headers();
  const acceptLang = headersList.get('accept-language') || '';
  const prefersEnglish =
    acceptLang.toLowerCase().startsWith('en') ||
    (!acceptLang.toLowerCase().includes('es') &&
      acceptLang.toLowerCase().includes('en'));

  redirect(prefersEnglish ? '/en' : '/es');
}

