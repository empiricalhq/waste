'use client';

import { gsap } from 'gsap';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { VideoPlayer } from '@/components/shared/video-player';
import { marketingTheme } from '@/config/marketing';

export function BlurryHero() {
  const [showVideo, setShowVideo] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showVideo) {
      gsap.set(modalRef.current, { scale: 0.8, opacity: 0 });
      gsap.set(backdropRef.current, { opacity: 0 });

      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
      gsap.to(modalRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });

      setTimeout(() => {
        const video = videoPlayerRef.current?.querySelector('video');
        if (video) {
          video.play().catch(() => {
            // Autoplay might be blocked by browser.
          });
        }
      }, 400);
    }
  }, [showVideo]);

  const closeModal = () => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, { scale: 0.8, opacity: 0, duration: 0.2 });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => setShowVideo(false),
      });
    }
  };

  return (
    <div
      className="flex items-center justify-center px-6 py-20 relative"
      style={{
        paddingTop: marketingTheme.layout.navHeight,
        minHeight: 'calc(100vh)',
      }}
    >
      <div className="text-center relative z-10" style={{ maxWidth: marketingTheme.layout.contentMaxWidth }}>
        <h1
          className={`${marketingTheme.title.fontSize} ${marketingTheme.title.fontWeight} ${marketingTheme.title.lineHeight} ${marketingTheme.title.tracking} ${marketingTheme.title.textColor} mb-6`}
        >
          <span className="blur-word">Donde</span> <span className="blur-word">los datos</span>{' '}
          <span className="blur-word">terminan</span>
        </h1>

        <p className="text-[20px] md:text-[24px] text-gray-600 leading-[1.5] mb-12">
          El sistema de residuos de Lima mueve 3.8 millones de toneladas al año. Nadie sabe dónde están los camiones.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/blog/what-we-were-cooking"
            className="inline-block text-[15px] bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Leer el artículo
          </Link>
          <button
            onClick={() => setShowVideo(true)}
            className="inline-block text-[15px] bg-white text-gray-900 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Ver el video
          </button>
        </div>
      </div>

      {showVideo && (
        <>
          <div ref={backdropRef} className="fixed inset-0 bg-black/50 z-50" onClick={closeModal} />
          <div ref={modalRef} className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ver el Video</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                  ×
                </button>
              </div>
              <div className="p-4">
                <div ref={videoPlayerRef}>
                  <VideoPlayer src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/low.mp4" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
