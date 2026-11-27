export type Locale = "en" | "ru" | "kk" | "zh" | "es";

export const SUPPORTED_LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "EN", native: "English" },
  { code: "ru", label: "RU", native: "Русский" },
  { code: "kk", label: "KK", native: "Қазақша" },
  { code: "zh", label: "ZH", native: "中文" },
  { code: "es", label: "ES", native: "Español" },
];

export interface Dictionary {
  brand: {
    name: string;
    tagline: string;
    proBadge: string;
  };
  hero: {
    h1: string;
    subheadline: string;
    urlPlaceholder: string;
    primaryCta: string;
    viewportTag: string;
    pendingPipelineNotice: string;
    invalidUrlError: string;
  };
  benefits: {
    title: string;
    description: string;
  }[];
  samples: {
    heading: string;
    subheading: string;
    openAuditCta: string;
    scoreLabel: string;
    topIssueLabel: string;
  };
  auditView: {
    backHome: string;
    tabPins: string;
    tabRewrite: string;
    scoreOutOf: string;
    categoriesTitle: string;
    issuesTitle: string;
    filterAll: string;
    filterCritical: string;
    filterWarning: string;
    filterTip: string;
    problemLabel: string;
    impactLabel: string;
    fixLabel: string;
    copyFix: string;
    copied: string;
    beforeLabel: string;
    afterLabel: string;
    headlineLabel: string;
    subheadlineLabel: string;
    ctaLabel: string;
    whyConvertsTitle: string;
    missingFactFallback: string;
    noOriginalText: string;
    proBannerTitle: string;
    proBannerBody: string;
  };
  categories: Record<
    "value" | "action" | "hierarchy" | "proof" | "friction" | "legibility",
    string
  >;
  severities: Record<"critical" | "warning" | "tip", string>;
  footer: string;
}

export const DICTIONARIES: Record<Locale, Dictionary> = {
  en: {
    brand: {
      name: "FunnelLens",
      tagline: "1280×800 First-Screen CRO Auditor",
      proBadge: "Stripe Test Mode · Ready",
    },
    hero: {
      h1: "See where your landing page makes visitors guess.",
      subheadline:
        "Paste your URL. Get a first-screen audit with fixes pinned to the exact spots where your offer, proof, or next step could be clearer.",
      urlPlaceholder: "https://your-landing-page.com",
      primaryCta: "Audit my landing page",
      viewportTag: "1280 × 800 above-the-fold capture · 12 deterministic rules",
      pendingPipelineNotice:
        "URL passed SSRF & format validation. Live browser capture via Trigger.dev + Gemini Vision activates once environment keys are connected — explore the 3 full interactive audits below right now.",
      invalidUrlError: "Enter a valid public http(s) URL (local/private IPs are blocked).",
    },
    benefits: [
      {
        title: "See it in context.",
        description: "Click a pin to see what a visitor has to figure out.",
      },
      {
        title: "Know what to fix first.",
        description: "See which issues cost your page the most points.",
      },
      {
        title: "Get copy you can test.",
        description: "Compare your headline, subheadline, and CTA with a suggested rewrite.",
      },
    ],
    samples: {
      heading: "Explore a sample audit",
      subheading:
        "Inspect pinned DOM issues, point penalties, and grounded Before/After hero rewrites.",
      openAuditCta: "Open interactive audit",
      scoreLabel: "First-Screen Score",
      topIssueLabel: "Top penalty",
    },
    auditView: {
      backHome: "All audits",
      tabPins: "Pinned Audit",
      tabRewrite: "Hero Before / After",
      scoreOutOf: "/ 100",
      categoriesTitle: "6-Category Breakdown",
      issuesTitle: "Pinned Findings",
      filterAll: "All",
      filterCritical: "Critical (-14)",
      filterWarning: "Warning (-6..-10)",
      filterTip: "Tip (-4)",
      problemLabel: "What is happening",
      impactLabel: "Why visitors drop off",
      fixLabel: "Concrete fix",
      copyFix: "Copy fix",
      copied: "Copied",
      beforeLabel: "Before (Live capture)",
      afterLabel: "After (Grounded rewrite)",
      headlineLabel: "Headline (H1)",
      subheadlineLabel: "Subheadline",
      ctaLabel: "Primary CTA",
      whyConvertsTitle: "Why this rewrite is clearer",
      missingFactFallback: "Requires verified metric/context from the product team before inventing copy.",
      noOriginalText: "Not visible on first screen",
      proBannerTitle: "Next milestones (PR #4–#6)",
      proBannerBody:
        "Firebase Auth & Firestore saved audits, Trigger.dev Playwright live URL worker + Gemini Vision, and Stripe Test Mode Pro Mobile (390×844) audit.",
    },
    categories: {
      value: "Value",
      action: "Next Step",
      hierarchy: "Hierarchy",
      proof: "Proof",
      friction: "Friction",
      legibility: "Legibility",
    },
    severities: {
      critical: "Critical",
      warning: "Warning",
      tip: "Tip",
    },
    footer: "FunnelLens · Built with Next.js, TypeScript, Zod, Tailwind CSS & Vitest",
  },
  ru: {
    brand: {
      name: "FunnelLens",
      tagline: "CRO-аудит первого экрана 1280×800",
      proBadge: "Stripe Test Mode · Готово",
    },
    hero: {
      h1: "Узнайте, где лендинг заставляет посетителей гадать.",
      subheadline:
        "Вставьте URL — получите аудит первого экрана с пинами прямо поверх мест, где оффер, доказательства или следующий шаг недостаточно ясны.",
      urlPlaceholder: "https://your-landing-page.com",
      primaryCta: "Проверить мой лендинг",
      viewportTag: "Захват 1280 × 800 до прокрутки · 12 строгих правил",
      pendingPipelineNotice:
        "URL прошёл проверку безопасности (SSRF) и формата. Живой захват браузером через Trigger.dev + Gemini Vision включится после подключения ключей — а прямо сейчас откройте любой из 3 полных разборов ниже.",
      invalidUrlError: "Введите корректный публичный http(s) URL (локальные и частные IP запрещены).",
    },
    benefits: [
      {
        title: "Видно прямо в контексте.",
        description: "Нажмите на пин, чтобы понять, о чём приходится догадываться посетителю.",
      },
      {
        title: "Понятно, что чинить первым.",
        description: "Сразу видно, какие проблемы отнимают больше всего баллов.",
      },
      {
        title: "Готовый текст для A/B-теста.",
        description: "Сравните текущий заголовок, подзаголовок и CTA с предложенным вариантом.",
      },
    ],
    samples: {
      heading: "Изучите готовые разборы",
      subheading: "Кликайте по пинам на скриншоте, смотрите штрафы и переписанный первый экран.",
      openAuditCta: "Открыть интерактивный аудит",
      scoreLabel: "Оценка первого экрана",
      topIssueLabel: "Главный штраф",
    },
    auditView: {
      backHome: "Ко всем примерам",
      tabPins: "Разбор с пинами",
      tabRewrite: "Hero До / После",
      scoreOutOf: "/ 100",
      categoriesTitle: "Оценка по 6 категориям",
      issuesTitle: "Найденные проблемы",
      filterAll: "Все",
      filterCritical: "Критично (-14)",
      filterWarning: "Важно (-6..-10)",
      filterTip: "Совет (-4)",
      problemLabel: "Что происходит",
      impactLabel: "Почему уходят",
      fixLabel: "Конкретное исправление",
      copyFix: "Копировать",
      copied: "Скопировано",
      beforeLabel: "Было (в захвате)",
      afterLabel: "Стало (обоснованный рерайт)",
      headlineLabel: "Заголовок (H1)",
      subheadlineLabel: "Подзаголовок",
      ctaLabel: "Главная кнопка (CTA)",
      whyConvertsTitle: "Почему этот вариант яснее",
      missingFactFallback: "Нужен подтверждённый факт или метрика от команды — сервис не выдумывает цифры.",
      noOriginalText: "Отсутствует на первом экране",
      proBannerTitle: "Следующие этапы (PR #4–#6)",
      proBannerBody:
        "Firebase Auth и сохранение в Firestore, фоновый захват URL в Trigger.dev + Gemini Vision и мобильный аудит 390×844 через Stripe Test Mode.",
    },
    categories: {
      value: "Ценность",
      action: "Следующий шаг",
      hierarchy: "Приоритет",
      proof: "Доказательства",
      friction: "Трение",
      legibility: "Читаемость",
    },
    severities: {
      critical: "Критично",
      warning: "Важно",
      tip: "Совет",
    },
    footer: "FunnelLens · Next.js, TypeScript, Zod, Tailwind CSS и Vitest",
  },
  kk: {
    brand: {
      name: "FunnelLens",
      tagline: "1280×800 бірінші экран CRO аудиті",
      proBadge: "Stripe Test Mode · Дайын",
    },
    hero: {
      h1: "Лендинг келушіні қай жерде ойландырып қоятынын көріңіз.",
      subheadline:
        "URL енгізіңіз — ұсыныс, дәлел немесе келесі қадам түсініксіз тұстарға пин қойылған бірінші экран аудитін алыңыз.",
      urlPlaceholder: "https://your-landing-page.com",
      primaryCta: "Лендингті тексеру",
      viewportTag: "1280 × 800 бірінші экран · 12 нақты ереже",
      pendingPipelineNotice:
        "URL қауіпсіздік (SSRF) және формат тексерісінен өтті. Trigger.dev + Gemini Vision тікелей түсірілімі кілттер қосылған соң іске қосылады — қазір төмендегі 3 интерактивті мысалды ашып көріңіз.",
      invalidUrlError: "Жарамды жария http(s) URL енгізіңіз (жергілікті/жеке IP тыйым салынған).",
    },
    benefits: [
      {
        title: "Контексте көріңіз.",
        description: "Келуші нені болжауға мәжбүр екенін көру үшін пинді басыңыз.",
      },
      {
        title: "Алдымен нені түзету керегін біліңіз.",
        description: "Қай ақау ең көп балл шегеретінін бірден байқаңыз.",
      },
      {
        title: "Сынауға дайын мәтін алыңыз.",
        description: "Ағымдағы тақырып пен батырманы ұсынылған нұсқамен салыстырыңыз.",
      },
    ],
    samples: {
      heading: "Дайын аудит үлгілері",
      subheading: "Скриншоттағы пиндерді басып, айыппұлдар мен «Дейін / Кейін» нұсқасын қараңыз.",
      openAuditCta: "Интерактивті аудитті ашу",
      scoreLabel: "Бірінші экран бағасы",
      topIssueLabel: "Басты ескерту",
    },
    auditView: {
      backHome: "Барлық үлгілер",
      tabPins: "Пиндер картасы",
      tabRewrite: "Hero Дейін / Кейін",
      scoreOutOf: "/ 100",
      categoriesTitle: "6 санат бойынша баға",
      issuesTitle: "Табылған мәселелер",
      filterAll: "Барлығы",
      filterCritical: "Маңызды (-14)",
      filterWarning: "Ескерту (-6..-10)",
      filterTip: "Кеңес (-4)",
      problemLabel: "Мәселе неде",
      impactLabel: "Кету себебі",
      fixLabel: "Нақты шешім",
      copyFix: "Көшіру",
      copied: "Көшірілді",
      beforeLabel: "Дейін (Түсірілім)",
      afterLabel: "Кейін (Негізделген нұсқа)",
      headlineLabel: "Тақырып (H1)",
      subheadlineLabel: "Қосымша тақырып",
      ctaLabel: "Негізгі CTA",
      whyConvertsTitle: "Бұл нұсқа неге түсініктірек",
      missingFactFallback: "Нақты өлшем немесе факт қажет — сервис ойдан дерек қоспайды.",
      noOriginalText: "Бірінші экранда жоқ",
      proBannerTitle: "Келесі кезеңдер (PR #4–#6)",
      proBannerBody:
        "Firebase Auth пен Firestore сақтау, Trigger.dev Playwright + Gemini Vision және Stripe Test Mode арқылы мобильді аудит (390×844).",
    },
    categories: {
      value: "Құндылық",
      action: "Келесі қадам",
      hierarchy: "Басымдық",
      proof: "Дәлел",
      friction: "Кедергі",
      legibility: "Оқылымдылық",
    },
    severities: {
      critical: "Сыни",
      warning: "Ескерту",
      tip: "Кеңес",
    },
    footer: "FunnelLens · Next.js, TypeScript, Zod, Tailwind CSS және Vitest",
  },
  zh: {
    brand: {
      name: "FunnelLens",
      tagline: "1280×800 首屏转化率诊断工具",
      proBadge: "Stripe 测试模式 · 就绪",
    },
    hero: {
      h1: "一眼看出你的落地页在哪里让访客犯迷糊。",
      subheadline:
        "粘贴网址，即可获取首屏诊断报告：精准图钉直指价值主张、可信度或下一步行动不够清晰的区域。",
      urlPlaceholder: "https://your-landing-page.com",
      primaryCta: "诊断我的落地页",
      viewportTag: "1280 × 800 首屏捕获 · 12 项确定性规则",
      pendingPipelineNotice:
        "URL 已通过 SSRF 安全与格式校验。配置环境变量密钥后即可启用 Trigger.dev + Gemini Vision 实时网页截图诊断——现在可直接点击下方 3 个完整交互示例体验。",
      invalidUrlError: "请输入有效的公开 http(s) 网址（已拦截本地与内网 IP）。",
    },
    benefits: [
      {
        title: "结合页面上下文定位。",
        description: "点击图钉，立即了解访客卡在哪里。",
      },
      {
        title: "明确优先修复项。",
        description: "查看哪些问题扣除了最多分数。",
      },
      {
        title: "获得可测试的改写文案。",
        description: "将当前主标题、副标题和 CTA 与建议方案直观对比。",
      },
    ],
    samples: {
      heading: "体验示例诊断报告",
      subheading: "点击页面截图上的图钉，查看扣分详情与首屏前后文案对比。",
      openAuditCta: "打开交互式报告",
      scoreLabel: "首屏得分",
      topIssueLabel: "主要扣分项",
    },
    auditView: {
      backHome: "返回全部示例",
      tabPins: "图钉诊断",
      tabRewrite: "首屏前后对比",
      scoreOutOf: "/ 100",
      categoriesTitle: "6 大维度得分",
      issuesTitle: "标注问题清单",
      filterAll: "全部",
      filterCritical: "严重 (-14)",
      filterWarning: "警告 (-6..-10)",
      filterTip: "提示 (-4)",
      problemLabel: "现状问题",
      impactLabel: "流失原因",
      fixLabel: "具体修改建议",
      copyFix: "复制建议",
      copied: "已复制",
      beforeLabel: "修改前（页面原文）",
      afterLabel: "修改后（有据改写）",
      headlineLabel: "主标题 (H1)",
      subheadlineLabel: "副标题",
      ctaLabel: "主按钮 (CTA)",
      whyConvertsTitle: "为什么改写后更清晰",
      missingFactFallback: "需要团队补充真实数据或上下文事实，系统不编造数字。",
      noOriginalText: "首屏未显示",
      proBannerTitle: "后续里程碑 (PR #4–#6)",
      proBannerBody:
        "接入 Firebase 认证与持久化、Trigger.dev + Playwright + Gemini Vision 实时任务，以及 Stripe 测试模式移动端（390×844）诊断。",
    },
    categories: {
      value: "价值主张",
      action: "下一步行动",
      hierarchy: "视觉层级",
      proof: "可信度",
      friction: "操作阻力",
      legibility: "可读性",
    },
    severities: {
      critical: "严重",
      warning: "警告",
      tip: "提示",
    },
    footer: "FunnelLens · 基于 Next.js、TypeScript、Zod、Tailwind CSS 与 Vitest 构建",
  },
  es: {
    brand: {
      name: "FunnelLens",
      tagline: "Auditor CRO de primera pantalla 1280×800",
      proBadge: "Stripe Test Mode · Listo",
    },
    hero: {
      h1: "Mira dónde tu landing page hace adivinar al visitante.",
      subheadline:
        "Pega tu URL y obtén una auditoría de primera pantalla con pines sobre los puntos exactos donde tu oferta, prueba o siguiente paso puede ser más claro.",
      urlPlaceholder: "https://your-landing-page.com",
      primaryCta: "Auditar mi landing page",
      viewportTag: "Captura inicial 1280 × 800 · 12 reglas deterministas",
      pendingPipelineNotice:
        "La URL superó la validación SSRF y de formato. La captura en vivo con Trigger.dev + Gemini Vision se activa al conectar las claves de entorno; mientras tanto explora las 3 auditorías interactivas de abajo.",
      invalidUrlError: "Introduce una URL http(s) pública válida (las IP locales o privadas están bloqueadas).",
    },
    benefits: [
      {
        title: "Míralo en contexto.",
        description: "Haz clic en un pin para ver qué tiene que deducir el visitante.",
      },
      {
        title: "Sabe qué corregir primero.",
        description: "Identifica qué problemas restan más puntos a tu página.",
      },
      {
        title: "Obtén copy listo para probar.",
        description: "Compara tu titular, subtítulo y CTA con una reescritura sugerida.",
      },
    ],
    samples: {
      heading: "Explora una auditoría de ejemplo",
      subheading: "Inspecciona pines sobre el DOM, penalizaciones y reescrituras Antes/Después.",
      openAuditCta: "Abrir auditoría interactiva",
      scoreLabel: "Puntuación inicial",
      topIssueLabel: "Mayor penalización",
    },
    auditView: {
      backHome: "Todas las auditorías",
      tabPins: "Auditoría con pines",
      tabRewrite: "Hero Antes / Después",
      scoreOutOf: "/ 100",
      categoriesTitle: "Desglose en 6 categorías",
      issuesTitle: "Hallazgos con pin",
      filterAll: "Todos",
      filterCritical: "Crítico (-14)",
      filterWarning: "Aviso (-6..-10)",
      filterTip: "Consejo (-4)",
      problemLabel: "Qué ocurre",
      impactLabel: "Por qué abandonan",
      fixLabel: "Corrección concreta",
      copyFix: "Copiar",
      copied: "Copiado",
      beforeLabel: "Antes (Captura)",
      afterLabel: "Después (Reescritura fundamentada)",
      headlineLabel: "Titular (H1)",
      subheadlineLabel: "Subtítulo",
      ctaLabel: "CTA principal",
      whyConvertsTitle: "Por qué es más claro",
      missingFactFallback: "Requiere datos o contexto verificados del equipo antes de redactar copy.",
      noOriginalText: "No visible en primera pantalla",
      proBannerTitle: "Siguientes hitos (PR #4–#6)",
      proBannerBody:
        "Firebase Auth y Firestore para historial guardado, worker Trigger.dev + Gemini Vision y modo Pro móvil (390×844) con Stripe Test Mode.",
    },
    categories: {
      value: "Valor",
      action: "Siguiente paso",
      hierarchy: "Jerarquía",
      proof: "Prueba",
      friction: "Fricción",
      legibility: "Legibilidad",
    },
    severities: {
      critical: "Crítico",
      warning: "Aviso",
      tip: "Consejo",
    },
    footer: "FunnelLens · Construido con Next.js, TypeScript, Zod, Tailwind CSS y Vitest",
  },
};

export function resolveLocale(raw?: string | string[] | null): Locale {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val === "ru" || val === "kk" || val === "zh" || val === "es" || val === "en") {
    return val;
  }
  return "en";
}
