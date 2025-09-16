import { SignInForm } from './form.tsx';
import { metadata } from './metadata.ts';

export { metadata };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="border-foreground/10 flex w-full flex-col rounded-2xl border px-8 py-5 md:w-96">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <SignInForm />
        <div className="flex items-center justify-center gap-2">
          <small>¿No tienes una cuenta? Consulta a los administradores.</small>
        </div>
      </div>
    </div>
  );
}
