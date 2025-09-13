import { cookies } from 'next/headers';

export default async function ChoferesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('better-auth.session_token');
  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch('http://localhost:4000/api/admin/trucks', {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `${token.name}=${token?.value}`,
    },
  });
  console.log('Response:', await response.json());

  return (
    <div>
      <main>
        <h1 className="text-2xl font-bold">Gestión de choferes</h1>
        <p className="text-muted-foreground">
          Administra los choferes de la flota
        </p>
      </main>
    </div>
  );
}
