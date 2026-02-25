"use client";

import { useLocale } from "next-intl";
import { Mail, MapPin, Phone, Send, Clock, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ContactInfoData } from "@/types/api";

interface ContactClientProps {
  contactData: ContactInfoData;
}

export default function ContactClient({ contactData }: ContactClientProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const container = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  useGSAP(() => {
    gsap.from(".slide-up", {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out"
    });
  }, { scope: container });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const res = await fetch(`/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.message?.status === 'success') {
        setSubmitStatus({ 
          type: 'success', 
          message: isRTL ? data.message.messageAr || "تم إرسال رسالتك بنجاح!" : data.message.message || "Your message has been sent successfully!" 
        });
        setFormData({ name: "", phone: "", subject: "", message: "" }); // Clear form
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: isRTL ? data.message?.messageAr || "حدث خطأ أثناء الإرسال." : data.message?.message || "An error occurred while sending." 
        });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus({ 
        type: 'error', 
        message: isRTL ? "حدث خطأ في الاتصال بالخادم." : "A network error occurred." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main ref={container} className="relative">
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-80px)]">
        
        {/* Left Column: Contact Info */}
        <div className="relative bg-[#1a658d] px-6 py-16 lg:px-16 lg:py-24 text-white overflow-hidden">
           {/* Abstract Bg */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-30" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#b9292f] blur-3xl opacity-20" />
           </div>

           <div className="relative z-10 h-full flex flex-col justify-center max-w-lg mx-auto lg:mx-0">
              <span className="slide-up mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold tracking-wider text-blue-300 backdrop-blur-md">
                 {isRTL ? "تواصل معنا" : "Contact Us"}
              </span>
              <h1 className="slide-up mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                 {isRTL ? "نحن هنا لمساعدتك" : "We're here to help"}
              </h1>
              <p className="slide-up mb-12 text-lg text-slate-300 leading-relaxed">
                 {isRTL 
                   ? "سواء كان لديك استفسار حول خدماتنا، أو تحتاج إلى مساعدة في الوصول لنتائجك، فريقنا متاح للإجابة على جميع تساؤلاتك."
                   : "Whether you have a question about our services, or need help accessing your results, our team is ready to answer all your questions."
                 }
              </p>

              <div className="space-y-8">
                 {/* Address */}
                 <div className="slide-up flex items-start gap-4">
                    <div className="rounded-lg bg-white/10 p-3 text-blue-400">
                       <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-semibold text-white mb-1">{isRTL ? "المقر الرئيسي" : "Headquarters"}</h3>
                       <div className="text-slate-400 w-full flex items-center">
                          {(isRTL ? contactData.addressAr : contactData.address) || (
                            <div className="h-4 w-3/4 rounded bg-white/20 animate-pulse mt-1" />
                          )}
                       </div>
                       <a href="#" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                          {isRTL ? "احصل على الاتجاهات" : "Get Directions"}
                          <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                       </a>
                    </div>
                 </div>

                 {/* Phone */}
                 <div className="slide-up flex items-start gap-4">
                    <div className="rounded-lg bg-white/10 p-3 text-green-400">
                       <Phone className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-semibold text-white mb-1">{isRTL ? "اتصل بنا" : "Call Us"}</h3>
                       {(contactData.phones && contactData.phones.length > 0) ? (
                         contactData.phones.map((phone, idx) => (
                           <p key={idx} className="text-slate-400 font-mono" dir="ltr">{phone}</p>
                         ))
                       ) : (
                         <div className="h-4 w-32 rounded bg-white/20 animate-pulse mt-1" />
                       )}
                    </div>
                 </div>

                 {/* Email */}
                 <div className="slide-up flex items-start gap-4">
                    <div className="rounded-lg bg-white/10 p-3 text-purple-400">
                       <Mail className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-semibold text-white mb-1">{isRTL ? "البريد الإلكتروني" : "Email Us"}</h3>
                       <div className="text-slate-400 w-full flex items-center">
                         {contactData.email || <div className="h-4 w-40 rounded bg-white/20 animate-pulse mt-1" />}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Working Hours Timeline */}
              <div className="slide-up mt-12 pt-8 border-t border-white/10">
                 <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
                    <Clock className="h-5 w-5 text-[#b9292f]" />
                    {isRTL ? "ساعات العمل" : "Working Hours"}
                 </h3>
                 <div className="space-y-3">
                    {(contactData.workingHours && contactData.workingHours.length > 0) ? contactData.workingHours.map((wh, idx) => (
                      <div key={idx} className={`flex justify-between ${wh.isEmergency ? 'font-semibold text-[#b9292f]' : 'text-slate-300'}`}>
                         <span>{isRTL ? wh.daysAr : wh.days}</span>
                         <span>{wh.hours}</span>
                      </div>
                    )) : (
                       <div className="flex flex-col gap-3 mt-2 w-full">
                         <div className="flex justify-between w-full">
                           <div className="h-4 w-24 rounded bg-white/20 animate-pulse" />
                           <div className="h-4 w-32 rounded bg-white/20 animate-pulse" />
                         </div>
                         <div className="flex justify-between w-full mt-1">
                           <div className="h-4 w-20 rounded bg-white/20 animate-pulse" />
                           <div className="h-4 w-24 rounded bg-white/20 animate-pulse" />
                         </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="px-6 py-16 lg:px-16 lg:py-24 flex items-center bg-slate-50 dark:bg-slate-950">
           <div className="w-full max-w-lg mx-auto">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                 
                 {submitStatus.type && (
                   <div className={`p-4 rounded-lg mb-6 ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                     {submitStatus.message}
                   </div>
                 )}

                 <div className="grid gap-6 md:grid-cols-2">
                    <div className="slide-up relative">
                       <input 
                          type="text" 
                          id="name" 
                          value={formData.name}
                          onChange={handleChange}
                          className="peer block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#1a658d] focus:ring-1 focus:ring-[#1a658d] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500" 
                          placeholder=" "
                          required
                       />
                       <label htmlFor="name" className={`absolute top-3 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-slate-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[#1a658d] dark:text-slate-400 dark:peer-focus:text-blue-500 ${isRTL ? "right-4 peer-focus:right-4" : "left-4 peer-focus:left-4"}`}>
                          {isRTL ? "الاسم الكامل" : "Full Name"}
                       </label>
                    </div>
                    <div className="slide-up relative">
                       <input 
                          type="tel" 
                          id="phone" 
                          value={formData.phone}
                          onChange={handleChange}
                          className="peer block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#1a658d] focus:ring-1 focus:ring-[#1a658d] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500" 
                          placeholder=" "
                          required
                       />
                       <label htmlFor="phone" className={`absolute top-3 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-slate-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[#1a658d] dark:text-slate-400 dark:peer-focus:text-blue-500 ${isRTL ? "right-4 peer-focus:right-4" : "left-4 peer-focus:left-4"}`}>
                          {isRTL ? "رقم الهاتف" : "Phone Number"}
                       </label>
                    </div>
                 </div>

                 <div className="slide-up relative">
                    <input 
                       type="text" 
                       id="subject" 
                       value={formData.subject}
                       onChange={handleChange}
                       className="peer block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#1a658d] focus:ring-1 focus:ring-[#1a658d] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500" 
                       placeholder=" "
                       required
                    />
                    <label htmlFor="subject" className={`absolute top-3 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-slate-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[#1a658d] dark:text-slate-400 dark:peer-focus:text-blue-500 ${isRTL ? "right-4 peer-focus:right-4" : "left-4 peer-focus:left-4"}`}>
                       {isRTL ? "الموضوع" : "Subject"}
                    </label>
                 </div>

                 <div className="slide-up relative">
                    <textarea 
                       id="message" 
                       value={formData.message}
                       onChange={handleChange}
                       rows={4}
                       className="peer block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#1a658d] focus:ring-1 focus:ring-[#1a658d] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500" 
                       placeholder=" "
                       required
                    ></textarea>
                    <label htmlFor="message" className={`absolute top-3 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-slate-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[#1a658d] dark:text-slate-400 dark:peer-focus:text-blue-500 ${isRTL ? "right-4 peer-focus:right-4" : "left-4 peer-focus:left-4"}`}>
                       {isRTL ? "رسالتك" : "Your Message"}
                    </label>
                 </div>

                 <div className="slide-up pt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a658d] px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:bg-[#155275] hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                       {isSubmitting ? (isRTL ? "جاري الإرسال..." : "Sending...") : (isRTL ? "إرسال الرسالة" : "Send Message")}
                       {!isSubmitting && <Send className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${isRTL ? "rotate-180" : ""}`} />}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </main>
  );
}
