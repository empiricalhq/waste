import Link from 'next/link';
import { AppStoreButton, GooglePlayButton } from '@/components/home/app-store-buttons';
import { BlurryHero } from '@/components/home/blurry-hero';
import { PageWrapper } from '@/components/shared/page-wrapper';

export default function HomePage() {
  return (
    <PageWrapper>
      <BlurryHero />

      <section className="py-20 px-6 bg-white">
        <div className="mx-auto" style={{ maxWidth: '1024px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-[#fafaf9] rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex justify-center mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Para ciudadanos</h3>
              <p className="text-[15px] leading-[1.7] text-gray-600 mb-4">
                Sigue la recolección de residuos en tiempo real. Aprende a separar correctamente. Reporta incidencias.
              </p>
              <Link href="/blog" className="text-[14px] text-gray-900 hover:text-gray-700 font-medium">
                Leer más →
              </Link>
            </div>

            <div className="text-center p-8 bg-[#fafaf9] rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex justify-center mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Para municipalidades</h3>
              <p className="text-[15px] leading-[1.7] text-gray-600 mb-4">
                Seguimiento de camiones en vivo. Gestión de choferes. Optimización de rutas con datos.
              </p>
              <Link href="/signin" className="text-[14px] text-gray-900 hover:text-gray-700 font-medium">
                Acceder al dashboard →
              </Link>
            </div>

            <div className="text-center p-8 bg-[#fafaf9] rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex justify-center mb-4">
                <span className="text-4xl">🌍</span>
              </div>
              <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Abierto y transparente</h3>
              <p className="text-[15px] leading-[1.7] text-gray-600 mb-4">
                Gratuito. Self-hosted. Código abierto. Construido para municipalidades de todos los tamaños.
              </p>
              <a
                href="https://github.com/empiricalhq/waste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-gray-900 hover:text-gray-700 font-medium"
              >
                Ver en GitHub →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#fafaf9]">
        <div className="mx-auto text-center" style={{ maxWidth: '640px' }}>
          <h2 className="text-[32px] md:text-[40px] font-semibold text-gray-900 mb-4 tracking-tight">
            Descarga la App
          </h2>
          <p className="text-[17px] leading-[1.7] text-gray-600 mb-8">
            Sigue la recolección de residuos en tiempo real. Disponible para iOS y Android.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <AppStoreButton size="md" href="#" />
            <GooglePlayButton size="md" href="#" />
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 text-center">
        <p className="text-[13px] text-gray-500">
          © 2025 Un proyecto de transparencia de datos por The Empirical Company
        </p>
      </footer>
    </PageWrapper>
  );
}
