// utils/r2Loader.ts
export default function r2Loader({ src, width, quality }: { src: string, width?: number, quality?: number }) {
  // 1. إذا كان الرابط هو الرابط الخاص (المغلق)
  const privateHost = "3cb73da2669637aaf8ec61edce1d29aa.r2.cloudflarestorage.com/newlab-storage";
  const publicHost = "pub-0934a1d749124b68b6fc5e4428ccc952.r2.dev"; // ضع رابطك العام هنا

  const encodePath = (path: string) =>
    path
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");

  if (src.includes(privateHost)) {
    // استبدال الرابط الخاص بالعام مع ترميز المسافات حتى لا ينكسر srcset في المتصفح
    const cleanSrc = encodePath(src.replace(`https://${privateHost}/`, ""));
    return `https://${publicHost}/${cleanSrc}?w=${width || 800}&q=${quality || 75}`;
  }

  // 2. إذا كان الرابط محلياً (يبدأ بـ /files)
  if (src.startsWith('/files/')) {
    const cleanSrc = encodePath(src.replace('/files/', ""));
    return `https://${publicHost}/${cleanSrc}?w=${width || 800}&q=${quality || 75}`;
  }

  // في حال كان رابطاً آخر (مثل صور خارجية) ارجعه كما هو مع ترميز أي مسافات
  return src.includes(" ") ? src.replace(/ /g, "%20") : src;
}