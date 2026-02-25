"use client";

import {useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';
import clsx from 'clsx';
import {FlaskConical, Dna, Home} from 'lucide-react';
import {prefersReducedMotion} from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const services = [
  {
    title: 'General Analysis',
    copy: 'Baseline chemistry, hematology, and metabolic clarity delivered with traceable controls.',
    accent: 'Calibrated analyzers, rapid turnaround.',
    icon: FlaskConical
  },
  {
    title: 'Genetic Testing',
    copy: 'Targeted panels for oncology and rare disease, sequenced with microscopic precision.',
    accent: 'Deep reads, physician-ready interpretations.',
    icon: Dna
  },
  {
    title: 'Home Visit',
    copy: 'Mobile phlebotomy with cold-chain custody and remote reporting from your home.',
    accent: 'Nurses on-call, HIPAA-grade privacy.',
    icon: Home
  }
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 900px)', () => {
        const totalX = () => -(track.scrollWidth - section.clientWidth);
        const horizontal = gsap.to(track, {
          x: totalX,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${track.scrollWidth - section.clientWidth}`,
            scrub: 1,
            pin: true
          }
        });

        cardsRef.current.forEach((card) => {
          if (!card) return;
          const content = card.querySelector('[data-content]');
          ScrollTrigger.create({
            trigger: card,
            containerAnimation: horizontal,
            start: 'left center',
            end: 'right center',
            onUpdate: (self) => {
              const focus = gsap.utils.clamp(0, 1, 1 - Math.abs(0.5 - self.progress) * 2);
              gsap.to(card, {
                scale: 0.94 + focus * 0.12,
                borderColor: `rgba(0,240,255,${0.15 + focus * 0.5})`,
                backgroundColor: `rgba(255,255,255,${0.05 + focus * 0.06})`,
                duration: 0.2,
                overwrite: 'auto'
              });
              if (content) {
                gsap.to(content, {opacity: 0.65 + focus * 0.35, duration: 0.2, overwrite: 'auto'});
              }
            }
          });
        });
      });

      return () => mm.revert();
    },
    {scope: sectionRef}
  );

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(0,240,255,0.08),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(57,255,20,0.08),transparent_32%)] py-24 text-white sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 border-t border-b border-white/5" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-col gap-3 sm:mb-14">
          <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 backdrop-blur">
            Services Suite
          </span>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Precision that slides with you.</h2>
            <p className="mt-3 max-w-2xl text-white/70">
              Scroll down to glide horizontally across each microscope slide. The active service scales and comes into focus,
              guiding you to the right action.
            </p>
          </div>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-6 px-6 pb-6 sm:gap-10 sm:px-10">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={service.title}
              ref={(node) => {
                cardsRef.current[index] = node;
              }}
              className={clsx(
                'group relative min-h-[360px] min-w-[280px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition duration-200 sm:min-w-[420px]',
                'shadow-[0_30px_80px_-48px_rgba(0,0,0,0.8)]'
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(57,255,20,0.12),transparent_36%)] opacity-70" />
              <div data-content className="relative flex h-full flex-col justify-between gap-6 p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-200 shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">Slide {index + 1}</div>
                    <h3 className="text-2xl font-semibold">{service.title}</h3>
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-white/80">{service.copy}</p>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    {service.accent}
                  </span>
                  <span className="text-sm font-semibold text-cyan-200 group-hover:text-white transition">
                    Focus →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
