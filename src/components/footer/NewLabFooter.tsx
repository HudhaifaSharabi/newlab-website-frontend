"use client";

import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function NewLabFooter() {
  const tFooter = useTranslations("footer");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <footer className="bg-[#020617] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <div className="mb-6 relative h-12 w-40">
              <Image 
                src="/logo.png" 
                alt="New Lab Logo" 
                fill 
                className="object-contain invert brightness-0" // Making it white for dark footer
              />
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-400">
              {tFooter("mission")}
            </p>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              {tFooter("patientServices")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/tests`} className="transition-colors hover:text-[#1a658d] flex items-center gap-2 group">
                  <ArrowRight className={`h-3 w-3 text-[#1a658d] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 ${isRTL ? "rotate-180" : ""}`} />
                  {tFooter("links.testDirectory")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/book`} className="transition-colors hover:text-[#1a658d] flex items-center gap-2 group">
                   <ArrowRight className={`h-3 w-3 text-[#1a658d] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 ${isRTL ? "rotate-180" : ""}`} />
                  {tFooter("links.bookTest")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company / Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              {isRTL ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/about-us`} className="transition-colors hover:text-[#1a658d] flex items-center gap-2 group">
                   <ArrowRight className={`h-3 w-3 text-[#1a658d] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 ${isRTL ? "rotate-180" : ""}`} />
                  {tFooter("links.about")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/certificates`} className="transition-colors hover:text-[#1a658d] flex items-center gap-2 group">
                   <ArrowRight className={`h-3 w-3 text-[#1a658d] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 ${isRTL ? "rotate-180" : ""}`} />
                  {tFooter("links.certificates")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/equipment`} className="transition-colors hover:text-[#1a658d] flex items-center gap-2 group">
                   <ArrowRight className={`h-3 w-3 text-[#1a658d] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 ${isRTL ? "rotate-180" : ""}`} />
                  {tFooter("links.equipment")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              {tFooter("contactUs")}
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                 <a href="tel:776054631" className="flex items-start gap-2 hover:text-[#1a658d] transition-colors">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1a658d]" />
                    <span dir="ltr">776054631 - 772037009</span>
                 </a>
              </li>
              <li>
                 <a href="mailto:info@newlabspecialized.com" className="flex items-start gap-2 hover:text-[#1a658d] transition-colors break-all">
                    <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1a658d]" />
                    <span>info@newlabspecialized.com</span>
                 </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1a658d]" />
                <div className="flex flex-col gap-2">
                  <span>{isRTL ? "1- المركز الرئيسي: صنعاء - جولة عصر، بالقرب من شركة يمن موبايل (عمارة نيو لاب - الدور الثاني)" : "1- Main Branch: Sana'a - Asr Intersection, Near Yemen Mobile Co. (New Lab Building - 2nd Floor)"}</span>
                  <span>{isRTL ? "2- فرع حده : بعد جولة ريماس باتجاه جوله المصباحي عماره قهوش" : "2- Haddah Branch: After Remas Intersection towards Al-Misbahi Intersection, Qahwosh Building"}</span>
                  <span>{isRTL ? "3- فرع دارس : فوق مدينة سباء للتصوير جوار حلويات الامراء" : "3- Daris Branch: Above Saba Photography City, Next to Al-Omaraa Sweets"}</span>
                  <span>{isRTL ? "4- مدينة عمران: عمران جولة النصر (جولة النافورة سابقاً)" : "4- Amran City: Amran, Al-Nasr Intersection (formerly Al-Nafurah Intersection)"}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-slate-800 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            {tFooter("rights")}
          </p>

          {/* Social Media */}
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/newlabspecializedlabs" target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-800 p-2 transition-colors hover:bg-[#1a658d]" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/newlab_specializedlabs" target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-800 p-2 transition-colors hover:bg-[#1a658d]" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://wa.me/967776054631" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-[#25D366]" aria-label="WhatsApp">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
