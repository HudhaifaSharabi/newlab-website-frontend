export interface SeoMetadata {
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  keywords_en?: string;
  keywords_ar?: string;
  og_image?: string;
}

export interface LocalizedString {
  _en: string;
  _ar: string;
}

export interface CtaData {
  _en: string; // The button label
  _ar: string;
  url: string;
}

export interface HeroData {
  kicker_en: string;
  kicker_ar: string;
  title_en: string;
  title_ar: string;
  accent_en: string;
  accent_ar: string;
  description_en: string;
  description_ar: string;
  primaryCta_en: string;
  primaryCta_ar: string;
  primaryCtaUrl: string;
  secondaryCta_en: string;
  secondaryCta_ar: string;
  secondaryCtaUrl: string;
  statusIndicators_en: string[];
  statusIndicators_ar: string[];
  slideshowImages: string[];
}

export interface AboutCard {
  tag_en: string;
  tag_ar: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image: string;
  badges_en: string[];
  badges_ar: string[];
}

export interface AboutData {
  badge_en: string;
  badge_ar: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  cards: AboutCard[];
}

export interface WorkflowHighlight {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon: 'flask' | 'shield' | 'scope' | string;
}

export interface WorkflowImage {
  src: string;
  alt_en: string;
  alt_ar: string;
}

export interface WorkflowCta {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  buttonLabel_en: string;
  buttonLabel_ar: string;
  buttonUrl: string;
}

export interface WorkflowData {
  badge_en: string;
  badge_ar: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  coverImage: string;
  highlights: WorkflowHighlight[];
  qualityBullets_en: string[];
  qualityBullets_ar: string[];
  galleryImages: WorkflowImage[];
  cta: WorkflowCta;
}

export interface PackageItem {
  id: string;
  name_en: string;
  name_ar: string;
  price_en: string;
  price_ar: string;
  isFeatured: boolean;
  icon: 'activity' | 'sparkles' | 'heart' | string;
  features_en: string[];
  features_ar: string[];
}

export interface PackagesData {
  badge_en: string;
  badge_ar: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  items: PackageItem[];
}

export interface StatCounter {
  value: number;
  suffix: string;
  label_en: string;
  label_ar: string;
  color: 'blue' | 'red' | string;
}

export interface StatsData {
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  counters: StatCounter[];
}

export interface Partner {
  name_en: string;
  name_ar: string;
  logo: string;
}

export interface Branch {
  id: number;
  name_en: string;
  name_ar: string;
  address_en: string;
  address_ar: string;
  phone: string;
  lat: number;
  lng: number;
  isMain: boolean;
}

export interface LocationsData {
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  branches: Branch[];
}

export interface LandingPageResponse {
  message: {
    seo?: SeoMetadata;
    hero: HeroData;
    about: AboutData;
    workflow: WorkflowData;
    packages: PackagesData;
    stats: StatsData;
    partners: Partner[];
    locations: LocationsData;
  }
}

export interface TestCategoryData {
  id: string;
  name: string;
  nameAr: string;
}

export interface TestItemData {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  categoryId: string;
  turnaroundTime: string;
  turnaroundTimeAr: string;
  requiresFasting: boolean;
  description: string;
  descriptionAr: string;
}

export interface TestsPageResponse {
  message: {
    message: {
      seo?: SeoMetadata;
      categories: TestCategoryData[];
      tests: TestItemData[];
    }
  }
}

export interface EquipmentItemData {
  id: string;
  category: "chemistry" | "hematology" | "immunology" | "molecular" | string;
  image: string;
  accuracy: number;
  status: "online" | "maintenance" | "offline" | string;
  name: string;
  nameAr: string;
  manufacturer: string;
  manufacturerAr: string;
  speed: string;
  speedAr: string;
  description: string;
  descriptionAr: string;
  features: string[];
  featuresAr: string[];
  relatedTests: string[];
  relatedTestsAr: string[];
}

export interface EquipmentPageResponse {
  message: {
    message: {
      equipment: EquipmentItemData[];
    }
  }
}

export interface CertificateData {
  id: string;
  title: string;
  titleAr: string;
  issuer: string;
  issuerAr: string;
  year: string;
  image: string;
}

export interface CertificatesPageResponse {
  message: {
    message: {
      certificates: CertificateData[];
    }
  }
}

export interface NewsItemData {
  id: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  publishDate: string;
  readTime: string;
  readTimeAr: string;
  image?: string;
}

export interface NewsPageResponse {
  message: {
    message: {
      news: NewsItemData[];
    }
  }
}

export interface VideoItemData {
  id: string;
  title: string;
  titleAr: string;
  duration: string;
  durationAr: string;
  url: string;
}

export interface VideosPageResponse {
  message: {
    message: {
      videos: VideoItemData[];
    }
  }
}

export interface ArticleItemData {
  id: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  contentAr: string;
  image: string;
  author: string;
  authorAr: string;
  readTime: string;
  readTimeAr: string;
  category: string;
  categoryAr: string;
  date: string;
  isFeatured: boolean;
}

export interface ArticlesPageResponse {
  message: {
    message: {
      articles: ArticleItemData[];
    }
  }
}

export interface WorkingHourData {
  days: string;
  daysAr: string;
  hours: string;
  isEmergency?: boolean;
}

export interface ContactInfoData {
  address: string;
  addressAr: string;
  phones: string[];
  email: string;
  workingHours: WorkingHourData[];
}

export interface ContactPageResponse {
  message: {
    message: {
      seo?: SeoMetadata;
      contactInfo: ContactInfoData;
    }
  }
}

export interface AboutHeroData {
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  badge: string;
  badgeAr: string;
  image: string;
}

export interface AboutPillarData {
  id: string;
  title: string;
  titleAr: string;
}

export interface AboutStoryData {
  headline: string;
  headlineAr: string;
  subheadline: string;
  subheadlineAr: string;
  body: string;
  bodyAr: string;
  pillars: AboutPillarData[];
  image1: string;
  image2: string;
  image3: string;
}

export interface AboutValueData {
  id: "accuracy" | "integrity" | "care" | string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
}

export interface AboutValuesData {
  title: string;
  titleAr: string;
  items: AboutValueData[];
}

export interface AboutCtaData {
  title: string;
  titleAr: string;
  bookButton: string;
  bookButtonAr: string;
  bookLink: string;
  exploreButton: string;
  exploreButtonAr: string;
  exploreLink: string;
}

export interface AboutPageResponse {
  message: {
    status: string;
    data: {
      seo?: SeoMetadata;
      hero: AboutHeroData;
      story: AboutStoryData;
      values: AboutValuesData;
      cta: AboutCtaData;
    }
  }
}
