"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Clock, AlertCircle, Filter } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import clsx from 'clsx';
import { Container } from '@/components/ui/Container';
import AlternativeNavbar from '@/components/nav/AlternativeNavbar';
import { NewLabFooter } from '@/components/footer/NewLabFooter';
import { TestCategoryData, TestItemData } from '@/types/api';

gsap.registerPlugin(ScrollTrigger);

interface TestDirectoryClientProps {
  initialCategories: TestCategoryData[];
  initialTests: TestItemData[];
}

export default function TestDirectoryClient({ initialCategories, initialTests }: TestDirectoryClientProps) {
  const t = useTranslations('testDirectory');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Filter tests based on search and category
  const filteredTests = useMemo(() => {
    return initialTests.filter(test => {
      // @ts-ignore - Handle Frappe snake_case dynamically
      const catId = test.categoryId || test.category_id || test.category || '';
      // @ts-ignore
      const tName = test.name || test.test_name || '';
      // @ts-ignore
      const tNameAr = test.nameAr || test.name_ar || test.test_name_ar || '';
      // @ts-ignore
      const tCode = test.code || test.test_code || test.item_code || '';

      const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        tName.toLowerCase().includes(searchLower) ||
        tNameAr.includes(searchQuery) ||
        tCode.toLowerCase().includes(searchLower);
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, initialTests]);
  
  // GSAP entrance animation with ScrollTrigger
  useEffect(() => {
    if (!gridRef.current || cardsRef.current.length === 0) return;
    
    const cards = cardsRef.current.filter(Boolean);
    
    const ctx = gsap.context(() => {
      gsap.set(cards, { autoAlpha: 0, y: 30 });
      
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out'
          });
        },
        once: true
      });
    }, gridRef);
    
    return () => ctx.revert();
  }, [filteredTests]);
  
  // GSAP filter transition animation
  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory || isAnimating) return;
    
    setIsAnimating(true);
    const cards = cardsRef.current.filter(Boolean);
    
    gsap.to(cards, {
      autoAlpha: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedCategory(category);
        setTimeout(() => {
          const newCards = cardsRef.current.filter(Boolean);
          gsap.fromTo(newCards,
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.06,
              ease: 'power2.out',
              onComplete: () => setIsAnimating(false)
            }
          );
        }, 50);
      }
    });
  };
  
  return (
    <>
      <AlternativeNavbar />
      <main className="min-h-screen bg-white dark:bg-[#1a658d]">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-32 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,101,141,0.08),transparent_50%)]" />
        
        <Container>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mb-12 text-lg text-slate-600 dark:text-slate-300 md:text-xl">
              {t('subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="relative mx-auto max-w-2xl">
              <div className="absolute inset-y-0 flex items-center px-4" style={{ [isRTL ? 'right' : 'left']: 0 }}>
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  'w-full rounded-2xl border-2 border-slate-200 bg-white px-14 py-4 text-lg text-slate-900 placeholder-slate-400 shadow-lg transition-all duration-300',
                  'focus:border-[#1a658d] focus:outline-none focus:ring-4 focus:ring-[#1a658d]/10',
                  'dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500',
                  isRTL ? 'text-right' : 'text-left'
                )}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
        </Container>
      </section>
      
      {/* Category Filters */}
      <section className="sticky top-14 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-700 dark:bg-[#1a658d]/80">
        <Container>
          <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
            <Filter className="h-5 w-5 flex-shrink-0 text-slate-400" />
            <div className={clsx('flex gap-2', isRTL && 'flex-row')}>
              {initialCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  disabled={isAnimating}
                  className={clsx(
                    'flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300',
                    selectedCategory === category.id
                      ? 'bg-[#1a658d] text-white shadow-lg shadow-[#1a658d]/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                    isAnimating && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {isRTL ? category.nameAr : category.name}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>
      
      {/* Test Grid */}
      <section className="py-16">
        <Container>
          {filteredTests.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
              <p className="text-xl text-slate-500 dark:text-slate-400">{t('noResults')}</p>
            </div>
          ) : (
            <>
              <p className="mb-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('showingResults', { count: filteredTests.length })}
              </p>
              
              <div
                ref={gridRef}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredTests.map((test, index) => (
                  <div
                    key={test.id}
                    ref={(el) => { cardsRef.current[index] = el; }}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  >
                    {/* Test Header */}
                    <div className="mb-4">
                      <h3 className="mb-1 text-xl font-bold text-[#1a658d] dark:text-[#4a9fd8]">
                        {/* @ts-ignore */}
                        {isRTL ? (test.nameAr || test.name_ar || test.test_name_ar || '') : (test.name || test.test_name || '')}
                      </h3>
                      {/* @ts-ignore */}
                      <p className="text-sm text-slate-500 dark:text-slate-400">{test.code || test.item_code || test.test_code || ''}</p>
                    </div>
                    
                    {/* Description */}
                    <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                      {/* @ts-ignore */}
                      {isRTL ? (test.descriptionAr || test.description_ar || '') : (test.description || test.description_en || '')}
                    </p>
                    
                    {/* Badges */}
                    <div className={clsx('mb-4 flex flex-wrap gap-2', isRTL && 'flex-row-reverse')}>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <Clock className="h-3 w-3" />
                        {/* @ts-ignore */}
                        {isRTL ? (test.turnaroundTimeAr || test.turnaround_time_ar || '') : (test.turnaroundTime || test.turnaround_time || '')}
                      </span>
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                          // @ts-ignore
                          (test.requiresFasting || test.requires_fasting)
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        )}
                      >
                        <AlertCircle className="h-3 w-3" />
                        {/* @ts-ignore */}
                        {t((test.requiresFasting || test.requires_fasting) ? 'badges.fasting' : 'badges.noFasting')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Container>
      </section>
    </main>
  
    <NewLabFooter />
    </>
  );
}
