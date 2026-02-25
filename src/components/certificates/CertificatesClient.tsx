"use client";

import { useTranslations, useLocale } from "next-intl";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import { Award, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CertificateData } from "@/types/api";
import Pagination from "@/components/ui/Pagination";

interface CertificatesClientProps {
  initialCertificates: CertificateData[];
}

export default function CertificatesClient({ initialCertificates }: CertificatesClientProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const container = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(initialCertificates.length / itemsPerPage);

  // Get current posts
  const indexOfLastPost = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
  const currentPosts = initialCertificates.slice(indexOfFirstPost, indexOfLastPost);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useGSAP(() => {
    gsap.fromTo(".certificate-card", 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" }
    );
  }, { scope: container, dependencies: [currentPage] });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation values based on mouse position
    const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AlternativeNavbar />
      
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1a658d] py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/grid-pattern.svg')" }} />
        <div className="relative z-10 px-6">
          <Award className="mx-auto mb-4 h-12 w-12 text-[#b9292f]" />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {isRTL ? "اعتماداتنا وشهادات الجودة" : "Accreditations & Awards"}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            {isRTL 
              ? "نلتزم بأعلى معايير الجودة العالمية لضمان دقة النتائج وسلامة المرضى."
              : "We are committed to the highest international quality standards to ensure result accuracy and patient safety."
            }
          </p>
        </div>
      </div>

      <main ref={container} className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentPosts.map((cert) => (
            <div 
              key={cert.id} 
              className="certificate-card group relative bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg transition-shadow hover:shadow-2xl"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Glass Frame Border Effect */}
              <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                {/* Fallback for now since images are placeholders */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300">
                   <Award className="h-16 w-16 opacity-20" />
                </div>

                <Image
                  src={cert.image}
                  alt={isRTL ? cert.titleAr : cert.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  // Use dummy image if file not found
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600";
                  }}
                />

                {/* Overlay with Zoom Icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <div className="rounded-full bg-white/20 p-3 text-white backdrop-blur-md">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center transform translate-z-10" style={{ transform: "translateZ(20px)" }}>
                <span className="mb-2 inline-block rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-300">
                  {cert.year}
                </span>
                <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                  {isRTL ? cert.titleAr : cert.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isRTL ? cert.issuerAr : cert.issuer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>

      <NewLabFooter />
    </div>
  );
}
