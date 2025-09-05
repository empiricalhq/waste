import { type Metadata } from "next";
import SignInForm from "./form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="border-foreground/10 flex w-full flex-col rounded-2xl border px-8 py-5 md:w-96">
        <h1>Iniciar Sesión</h1>
        <SignInForm />
        <div className="flex items-center justify-center gap-2">
          <small>¿No tienes una cuenta? Consulta a los administradores.</small>
        </div>
      </div>
    </div>
  );
}
