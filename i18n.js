/**
 * Internationalization (i18n) Module
 * Clockify to GitLab /spend Copier & Syncer
 *
 * Supported languages:
 *  - en: English (LTR)
 *  - de: Deutsch / German (LTR)
 *  - fr: Français / French (LTR)
 *  - zh: 简体中文 / Chinese (LTR)
 *  - ar: العربية / Arabic (RTL)
 *  - fa: فارسی / Persian (RTL)
 *  - ru: Русский / Russian (LTR)
 *  - hi: हिन्दी / Hindi (LTR)
 *  - es: Español / Spanish (LTR)
 *  - tr: Türkçe / Turkish (LTR)
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.I18N = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LANGUAGES = {
    en: { name: 'English', dir: 'ltr', flag: '🇺🇸' },
    de: { name: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
    fr: { name: 'Français', dir: 'ltr', flag: '🇫🇷' },
    zh: { name: '简体中文', dir: 'ltr', flag: '🇨🇳' },
    ar: { name: 'العربية', dir: 'rtl', flag: '🇸🇦' },
    fa: { name: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
    ru: { name: 'Русский', dir: 'ltr', flag: '🇷🇺' },
    hi: { name: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
    es: { name: 'Español', dir: 'ltr', flag: '🇪🇸' },
    tr: { name: 'Türkçe', dir: 'ltr', flag: '🇹🇷' }
  };

  const TRANSLATIONS = {
    // ------------------------------------------------------------------------
    // ENGLISH
    // ------------------------------------------------------------------------
    en: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'Directly sync Clockify time to GitLab',
      activeStatus: 'Active',
      selectLanguage: 'Language',

      // Server & Auth
      serverSection: 'Server & Authentication',
      serverHostLabel: 'GitLab Server URL:',
      serverHostHint: 'Your GitLab domain (e.g. https://gitlab.com)',
      tokenLabel: 'Personal Access Token:',
      tokenHint: "Token with 'api' scope (from GitLab Settings -> Access Tokens)",
      saveBtn: 'Save Settings',
      testBtn: 'Test Connection',

      // Time Format
      timeFormatSection: 'Time Format',
      includeSecondsLabel: 'Include seconds',
      includeSecondsHint: 'e.g. 1h 51m 11s instead of 1h 51m',
      roundMinutesLabel: 'Round minutes',
      roundMinutesHint: 'When seconds are excluded (rounds up at >= 30s)',

      // Preview & Footer
      previewSection: 'Command Preview',
      footerHint: 'You can also predefine settings directly in config.js',

      // Status messages
      settingsSaved: 'Settings saved successfully.',
      testingConn: 'Checking connection...',
      connSuccess: 'Connected: Welcome {name} (@{username})',
      connAuthError: 'Authentication error ({status}): check token & URL.',
      connError: 'Connection error: {error}',
      noHost: 'GitLab server URL is required.',
      noToken: 'Personal Access Token is required.',
      noProjectPathOrIssue: 'GitLab project path or Issue ID not found.',
      alreadyRecordedInIssue: 'This time ({dur}) for {date} is already recorded in this issue.',
      successfullySyncedToIssue: 'Successfully recorded in GitLab Issue #{iid}!',

      // Content Script Tooltips & Buttons
      copyTooltip: 'Copy GitLab /spend command to clipboard',
      copiedTooltip: 'Command copied to clipboard!',
      syncDirectTooltip: 'Directly sync to GitLab Issue #{iid} (API)',
      syncNoLinkTooltip: 'Sync to GitLab (Requires Issue link in description)',
      alreadyExistsTooltip: 'Already recorded in Issue #{iid}',
      successRecordedTooltip: 'Successfully recorded in Issue #{iid}',
      syncDayBtn: 'Sync Day',
      syncDayTooltip: 'Sync all entries of this day to GitLab (auto-checks for duplicates)',
      totalClickableTooltip: 'Click to sync all entries of this day to GitLab',

      // Toasts
      toastCopied: 'Command copied to clipboard:',
      toastSyncing: 'Checking and recording in GitLab...',
      toastNoWorker: 'No response from extension background worker.',
      toastAlreadyExists: 'Already recorded in Issue #{iid}.',
      toastSuccess: 'Successfully recorded in Issue #{iid}!',
      toastFailed: 'GitLab sync failed: {err}',
      toastCommError: 'Extension communication error: {err}',
      toastDaySyncDone: 'Day sync completed ({date})',
      toastTasksSynced: '{count} entries synced',
      toastTasksAlready: '{count} entries already recorded',
      toastTasksNoLink: '{count} entries without GitLab link',
      toastTasksFailed: '{count} entries failed',
      toastNoTasks: 'No entries to sync.',
      toastTotalDuration: 'Total time: {dur}',
      toastProgress: 'Syncing... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // PERSIAN (فارسی) - RTL
    // ------------------------------------------------------------------------
    fa: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'ثبت مستقیم زمان Clockify در گیت‌لب',
      activeStatus: 'فعال',
      selectLanguage: 'زبان',

      // Server & Auth
      serverSection: 'مشخصات سرور و احراز هویت',
      serverHostLabel: 'آدرس سرور گیت‌لب:',
      serverHostHint: 'دامنه سرور گیت‌لب شما (مانند https://gitlab.com)',
      tokenLabel: 'Personal Access Token:',
      tokenHint: 'توکن با دسترسی api (از Settings گیت‌لب -> Access Tokens)',
      saveBtn: 'ذخیره تنظیمات',
      testBtn: 'تست اتصال',

      // Time Format
      timeFormatSection: 'فرمت زمان',
      includeSecondsLabel: 'شامل ثانیه',
      includeSecondsHint: 'مثلاً 1h 51m 11s به جای 1h 51m',
      roundMinutesLabel: 'گرد کردن دقیقه',
      roundMinutesHint: 'در صورت حذف ثانیه (۳۰ ثانیه به بالا گرد شود)',

      // Preview & Footer
      previewSection: 'پیش‌نمایش خروجی کامند',
      footerHint: 'همچنین می‌توانید مقادیر را مستقیماً در config.js تنظیم نمایید.',

      // Status messages
      settingsSaved: 'تنظیمات با موفقیت ذخیره شد.',
      testingConn: 'در حال بررسی اتصال...',
      connSuccess: 'اتصال موفق: خوش آمدید {name} (@{username})',
      connAuthError: 'خطای احراز هویت ({status}): لطفاً توکن و آدرس را بررسی کنید.',
      connError: 'خطا در اتصال به سرور: {error}',
      noHost: 'آدرس سرور گیت‌لب وارد نشده است.',
      noToken: 'توکن دسترسی شخصی (PAT) وارد نشده است.',
      noProjectPathOrIssue: 'اطلاعات پروژه یا Issue گیت‌لب یافت نشد.',
      alreadyRecordedInIssue: 'این زمان ({dur}) برای تاریخ {date} قبلاً در این Issue ثبت شده است.',
      successfullySyncedToIssue: 'با موفقیت در Issue #{iid} گیت‌لب ثبت شد!',

      // Content Script Tooltips & Buttons
      copyTooltip: 'کپی دستور /spend گیت‌لب در کلیپ‌بورد',
      copiedTooltip: 'دستور در کلیپ‌بورد کپی شد!',
      syncDirectTooltip: 'ثبت مستقیم در Issue #{iid} گیت‌لب (API)',
      syncNoLinkTooltip: 'ثبت در گیت‌لب (نیازمند لینک Issue در توضیحات)',
      alreadyExistsTooltip: 'قبلاً در Issue #{iid} ثبت شده است',
      successRecordedTooltip: 'با موفقیت در Issue #{iid} ثبت شد',
      syncDayBtn: 'همگام‌سازی روز',
      syncDayTooltip: 'همگام‌سازی تمامی تسک‌های تکی این روز با گیت‌لب (بررسی خودکار و ثبت)',
      totalClickableTooltip: 'کلیک برای همگام‌سازی تمامی تسک‌های این روز با گیت‌لب',

      // Toasts
      toastCopied: 'دستور در کلیپ‌بورد کپی شد:',
      toastSyncing: 'در حال بررسی و ثبت تسک در گیت‌لب...',
      toastNoWorker: 'عدم پاسخ از سرویس ورکر افزونه.',
      toastAlreadyExists: 'قبلاً در Issue #{iid} ثبت شده است.',
      toastSuccess: 'با موفقیت در Issue #{iid} ثبت شد!',
      toastFailed: 'خطا در ثبت گیت‌لب: {err}',
      toastCommError: 'خطای ارتباط با افزونه: {err}',
      toastDaySyncDone: 'همگام‌سازی روز ({date}) پایان یافت',
      toastTasksSynced: '{count} تسک ثبت شد',
      toastTasksAlready: '{count} تسک قبلاً ثبت شده بود',
      toastTasksNoLink: '{count} آیتم بدون لینک گیت‌لب',
      toastTasksFailed: '{count} تسک با خطا مواجه شد',
      toastNoTasks: 'هیچ تسکی ثبت نشد.',
      toastTotalDuration: 'مجموع زمان: {dur}',
      toastProgress: 'در حال ثبت... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // GERMAN (Deutsch)
    // ------------------------------------------------------------------------
    de: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'Clockify-Zeiteinträge direkt mit GitLab synchronisieren',
      activeStatus: 'Aktiv',
      selectLanguage: 'Sprache',

      serverSection: 'Server & Authentifizierung',
      serverHostLabel: 'GitLab Server-URL:',
      serverHostHint: 'Domain Ihrer GitLab-Instanz (z. B. https://gitlab.com)',
      tokenLabel: 'Personal Access Token:',
      tokenHint: "Token mit 'api'-Berechtigung (aus GitLab-Einstellungen -> Access Tokens)",
      saveBtn: 'Einstellungen speichern',
      testBtn: 'Verbindung testen',

      timeFormatSection: 'Zeitformat',
      includeSecondsLabel: 'Sekunden einbeziehen',
      includeSecondsHint: 'z. B. 1h 51m 11s anstelle von 1h 51m',
      roundMinutesLabel: 'Minuten runden',
      roundMinutesHint: 'Wenn Sekunden weggelassen werden (ab 30s aufrunden)',

      previewSection: 'Befehlsvorschau',
      footerHint: 'Einstellungen können auch direkt in config.js definiert werden',

      settingsSaved: 'Einstellungen erfolgreich gespeichert.',
      testingConn: 'Verbindung wird geprüft...',
      connSuccess: 'Erfolgreich verbunden: Willkommen {name} (@{username})',
      connAuthError: 'Authentifizierungsfehler ({status}): Token & URL prüfen.',
      connError: 'Verbindungsfehler: {error}',
      noHost: 'GitLab Server-URL erforderlich.',
      noToken: 'Personal Access Token erforderlich.',
      noProjectPathOrIssue: 'GitLab Projektpfad oder Issue-ID nicht gefunden.',
      alreadyRecordedInIssue: 'Diese Zeit ({dur}) für {date} wurde bereits in diesem Issue erfasst.',
      successfullySyncedToIssue: 'Erfolgreich in GitLab Issue #{iid} erfasst!',

      copyTooltip: 'GitLab /spend Befehl in die Zwischenablage kopieren',
      copiedTooltip: 'In die Zwischenablage kopiert!',
      syncDirectTooltip: 'Direkt mit GitLab Issue #{iid} synchronisieren (API)',
      syncNoLinkTooltip: 'Mit GitLab synchronisieren (Issue-Link in Beschreibung erforderlich)',
      alreadyExistsTooltip: 'Bereits in Issue #{iid} erfasst',
      successRecordedTooltip: 'Erfolgreich in Issue #{iid} erfasst',
      syncDayBtn: 'Tag synchronisieren',
      syncDayTooltip: 'Alle Einträge dieses Tages mit GitLab synchronisieren',
      totalClickableTooltip: 'Klicken, um alle Einträge dieses Tages zu synchronisieren',

      toastCopied: 'Befehl in Zwischenablage kopiert:',
      toastSyncing: 'Eintrag wird in GitLab geprüft und erfasst...',
      toastNoWorker: 'Keine Antwort vom Hintergrunddienst der Erweiterung.',
      toastAlreadyExists: 'Bereits in Issue #{iid} erfasst.',
      toastSuccess: 'Erfolgreich in Issue #{iid} erfasst!',
      toastFailed: 'Fehler beim Erfassen in GitLab: {err}',
      toastCommError: 'Erweiterungsfehler: {err}',
      toastDaySyncDone: 'Tages-Synchronisierung abgeschlossen ({date})',
      toastTasksSynced: '{count} Einträge synchronisiert',
      toastTasksAlready: '{count} Einträge existierten bereits',
      toastTasksNoLink: '{count} Einträge ohne GitLab-Link',
      toastTasksFailed: '{count} Einträge fehlgeschlagen',
      toastNoTasks: 'Keine Einträge erfasst.',
      toastTotalDuration: 'Gesamtdauer: {dur}',
      toastProgress: 'Wird synchronisiert... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // FRENCH (Français)
    // ------------------------------------------------------------------------
    fr: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'Synchroniser les entrées Clockify directement avec GitLab',
      activeStatus: 'Actif',
      selectLanguage: 'Langue',

      serverSection: 'Serveur et Authentification',
      serverHostLabel: 'URL du serveur GitLab :',
      serverHostHint: 'Domaine de votre instance GitLab (ex. https://gitlab.com)',
      tokenLabel: "Jeton d'accès personnel (PAT) :",
      tokenHint: "Jeton avec portée 'api' (depuis Paramètres GitLab -> Access Tokens)",
      saveBtn: 'Enregistrer les paramètres',
      testBtn: 'Tester la connexion',

      timeFormatSection: "Format de l'heure",
      includeSecondsLabel: 'Inclure les secondes',
      includeSecondsHint: 'ex. 1h 51m 11s au lieu de 1h 51m',
      roundMinutesLabel: 'Arrondir les minutes',
      roundMinutesHint: 'Quand les secondes sont omises (arrondi si >= 30s)',

      previewSection: 'Aperçu de la commande',
      footerHint: 'Vous pouvez également prédéfinir les paramètres dans config.js',

      settingsSaved: 'Paramètres enregistrés avec succès.',
      testingConn: 'Vérification de la connexion...',
      connSuccess: 'Connexion réussie : Bienvenue {name} (@{username})',
      connAuthError: "Erreur d'authentification ({status}) : vérifiez le jeton et l'URL.",
      connError: 'Erreur de connexion : {error}',
      noHost: "L'URL du serveur GitLab est requise.",
      noToken: "Le jeton d'accès personnel est requis.",
      noProjectPathOrIssue: 'Chemin du projet ou ID du ticket introuvable.',
      alreadyRecordedInIssue: 'Ce temps ({dur}) pour le {date} est déjà enregistré dans ce ticket.',
      successfullySyncedToIssue: 'Enregistré avec succès dans le ticket GitLab #{iid} !',

      copyTooltip: 'Copier la commande GitLab /spend dans le presse-papiers',
      copiedTooltip: 'Copié dans le presse-papiers !',
      syncDirectTooltip: 'Synchroniser directement avec le ticket GitLab #{iid} (API)',
      syncNoLinkTooltip: 'Synchroniser avec GitLab (Lien de ticket requis dans la description)',
      alreadyExistsTooltip: 'Déjà enregistré dans le ticket #{iid}',
      successRecordedTooltip: 'Enregistré avec succès dans le ticket #{iid}',
      syncDayBtn: 'Synchroniser le jour',
      syncDayTooltip: 'Synchroniser toutes les entrées de ce jour avec GitLab',
      totalClickableTooltip: 'Cliquer pour synchroniser toutes les entrées de ce jour',

      toastCopied: 'Commande copiée dans le presse-papiers :',
      toastSyncing: 'Vérification et enregistrement dans GitLab...',
      toastNoWorker: "Aucune réponse du service worker de l'extension.",
      toastAlreadyExists: 'Déjà enregistré dans le ticket #{iid}.',
      toastSuccess: 'Enregistré avec succès dans le ticket #{iid} !',
      toastFailed: "Échec de l'enregistrement dans GitLab : {err}",
      toastCommError: 'Erreur extension : {err}',
      toastDaySyncDone: 'Synchronisation du jour terminée ({date})',
      toastTasksSynced: '{count} tâches synchronisées',
      toastTasksAlready: '{count} tâches déjà enregistrées',
      toastTasksNoLink: '{count} éléments sans lien GitLab',
      toastTasksFailed: '{count} tâches échouées',
      toastNoTasks: 'Aucune tâche enregistrée.',
      toastTotalDuration: 'Durée totale : {dur}',
      toastProgress: 'Synchronisation... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // CHINESE (简体中文)
    // ------------------------------------------------------------------------
    zh: {
      appName: 'GitLab /spend Sync',
      appSubtitle: '直接将 Clockify 工时同步至 GitLab',
      activeStatus: '运行中',
      selectLanguage: '界面语言',

      serverSection: '服务器与身份验证',
      serverHostLabel: 'GitLab 服务器地址：',
      serverHostHint: '您的 GitLab 域名（如 https://gitlab.com）',
      tokenLabel: '个人访问令牌 (Personal Access Token)：',
      tokenHint: "需具备 'api' 权限的 Token（来自 GitLab 设置 -> Access Tokens）",
      saveBtn: '保存设置',
      testBtn: '测试连接',

      timeFormatSection: '时间格式',
      includeSecondsLabel: '包含秒数',
      includeSecondsHint: '例如 1h 51m 11s 代替 1h 51m',
      roundMinutesLabel: '分钟四舍五入',
      roundMinutesHint: '省略秒数时生效（>= 30 秒向上进位）',

      previewSection: '命令预览',
      footerHint: '也可以直接在 config.js 中预设配置',

      settingsSaved: '设置已成功保存。',
      testingConn: '正在测试连接...',
      connSuccess: '连接成功：欢迎 {name} (@{username})',
      connAuthError: '身份验证失败 ({status})：请检查 Token 和服务器地址。',
      connError: '连接出错：{error}',
      noHost: '请输入 GitLab 服务器地址。',
      noToken: '请输入个人访问令牌 (Token)。',
      noProjectPathOrIssue: '未找到 GitLab 项目路径或 Issue ID。',
      alreadyRecordedInIssue: '该日期 {date} 的工时 ({dur}) 已在该 Issue 中记录。',
      successfullySyncedToIssue: '已成功记录到 GitLab Issue #{iid}！',

      copyTooltip: '复制 GitLab /spend 命令到剪贴板',
      copiedTooltip: '命令已复制到剪贴板！',
      syncDirectTooltip: '直接同步到 GitLab Issue #{iid} (API)',
      syncNoLinkTooltip: '同步到 GitLab（描述中需包含 Issue 链接）',
      alreadyExistsTooltip: '已记录在 Issue #{iid} 中',
      successRecordedTooltip: '已成功记录到 Issue #{iid}',
      syncDayBtn: '同步整天',
      syncDayTooltip: '自动检查并将当天的所有工时记录同步至 GitLab',
      totalClickableTooltip: '点击同步当天的所有工时记录',

      toastCopied: '命令已复制到剪贴板：',
      toastSyncing: '正在向 GitLab 检查并记录工时...',
      toastNoWorker: '扩展后台服务无响应。',
      toastAlreadyExists: '已在 Issue #{iid} 中记录。',
      toastSuccess: '已成功记录到 Issue #{iid}！',
      toastFailed: 'GitLab 记录失败：{err}',
      toastCommError: '扩展通信错误：{err}',
      toastDaySyncDone: '当天工时同步完成 ({date})',
      toastTasksSynced: '{count} 条工时已成功同步',
      toastTasksAlready: '{count} 条工时之前已存在',
      toastTasksNoLink: '{count} 条缺少 GitLab 链接',
      toastTasksFailed: '{count} 条同步失败',
      toastNoTasks: '未记录任何工时。',
      toastTotalDuration: '总时长：{dur}',
      toastProgress: '正在同步... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // ARABIC (العربية) - RTL
    // ------------------------------------------------------------------------
    ar: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'مزامنة وقت Clockify مباشرةً مع GitLab',
      activeStatus: 'نشط',
      selectLanguage: 'اللغة',

      serverSection: 'إعدادات الخادم والمصادقة',
      serverHostLabel: 'عنوان خادم GitLab:',
      serverHostHint: 'نطاق خادم GitLab الخاص بك (مثل https://gitlab.com)',
      tokenLabel: 'رمز الوصول الشخصي (Token):',
      tokenHint: "رمز بصلاحية 'api' (من إعدادات GitLab -> Access Tokens)",
      saveBtn: 'حفظ الإعدادات',
      testBtn: 'اختبار الاتصال',

      timeFormatSection: 'تنسيق الوقت',
      includeSecondsLabel: 'تضمين الثواني',
      includeSecondsHint: 'مثال 1h 51m 11s بدلاً من 1h 51m',
      roundMinutesLabel: 'تقريب الدقائق',
      roundMinutesHint: 'عند استبعاد الثواني (تقريب للأعلى إذا كانت >= 30 ثانية)',

      previewSection: 'معاينة الأمر',
      footerHint: 'يمكنك أيضاً ضبط الإعدادات مسبقاً في ملف config.js',

      settingsSaved: 'تم حفظ الإعدادات بنجاح.',
      testingConn: 'جارٍ اختبار الاتصال...',
      connSuccess: 'تم الاتصال بنجاح: مرحباً {name} (@{username})',
      connAuthError: 'خطأ في المصادقة ({status}): يرجى التحقق من الرمز والعنوان.',
      connError: 'خطأ في الاتصال: {error}',
      noHost: 'عنوان خادم GitLab مطلوب.',
      noToken: 'رمز الوصول الشخصي مطلوب.',
      noProjectPathOrIssue: 'لم يتم العثور على مسار المشروع أو رقم الـ Issue.',
      alreadyRecordedInIssue: 'هذا الوقت ({dur}) لتاريخ {date} مسجل مسبقاً في هذا الـ Issue.',
      successfullySyncedToIssue: 'تم التسجيل بنجاح في Issue #{iid} على GitLab!',

      copyTooltip: 'نسخ أمر /spend الخاص بـ GitLab إلى الحافظة',
      copiedTooltip: 'تم النسخ إلى الحافظة!',
      syncDirectTooltip: 'تسجيل مباشر في Issue #{iid} على GitLab (API)',
      syncNoLinkTooltip: 'مزامنة مع GitLab (يتطلب رابط Issue في الوصف)',
      alreadyExistsTooltip: 'تم تسجيله مسبقاً في Issue #{iid}',
      successRecordedTooltip: 'تم التسجيل بنجاح في Issue #{iid}',
      syncDayBtn: 'مزامنة اليوم',
      syncDayTooltip: 'مزامنة جميع مهام هذا اليوم مع GitLab (فحص تلقائي وتسجيل)',
      totalClickableTooltip: 'انقر لمزامنة جميع مهام هذا اليوم مع GitLab',

      toastCopied: 'تم نسخ الأمر إلى الحافظة:',
      toastSyncing: 'جارٍ الفحص والتسجيل في GitLab...',
      toastNoWorker: 'لا توجد استجابة من خلفية الإضافة.',
      toastAlreadyExists: 'تم تسجيله مسبقاً في Issue #{iid}.',
      toastSuccess: 'تم التسجيل بنجاح في Issue #{iid}!',
      toastFailed: 'فشل التسجيل في GitLab: {err}',
      toastCommError: 'خطأ في اتصال الإضافة: {err}',
      toastDaySyncDone: 'اكتملت مزامنة اليوم ({date})',
      toastTasksSynced: 'تم تسجيل {count} مهمة',
      toastTasksAlready: '{count} مهمة مسجلة مسبقاً',
      toastTasksNoLink: '{count} عنصر بدون رابط GitLab',
      toastTasksFailed: 'فشل تسجيل {count} مهمة',
      toastNoTasks: 'لم يتم تسجيل أي مهمة.',
      toastTotalDuration: 'إجمالي الوقت: {dur}',
      toastProgress: 'جارٍ التسجيل... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // RUSSIAN (Русский)
    // ------------------------------------------------------------------------
    ru: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'Синхронизация времени Clockify напрямую с GitLab',
      activeStatus: 'Активно',
      selectLanguage: 'Язык',

      serverSection: 'Сервер и авторизация',
      serverHostLabel: 'URL сервера GitLab:',
      serverHostHint: 'Домен вашего инстанса GitLab (напр. https://gitlab.com)',
      tokenLabel: 'Personal Access Token:',
      tokenHint: "Токен с правами 'api' (в GitLab: Settings -> Access Tokens)",
      saveBtn: 'Сохранить настройки',
      testBtn: 'Проверить подключение',

      timeFormatSection: 'Формат времени',
      includeSecondsLabel: 'Включать секунды',
      includeSecondsHint: 'напр. 1h 51m 11s вместо 1h 51m',
      roundMinutesLabel: 'Округлять минуты',
      roundMinutesHint: 'Если секунды отключены (округление при >= 30 сек)',

      previewSection: 'Предпросмотр команды',
      footerHint: 'Настройки также можно задать в config.js',

      settingsSaved: 'Настройки успешно сохранены.',
      testingConn: 'Проверка подключения...',
      connSuccess: 'Подключение успешно: Добро пожаловать, {name} (@{username})',
      connAuthError: 'Ошибка авторизации ({status}): проверьте токен и URL.',
      connError: 'Ошибка подключения: {error}',
      noHost: 'Укажите URL сервера GitLab.',
      noToken: 'Укажите Personal Access Token.',
      noProjectPathOrIssue: 'Путь к проекту или номер Issue не найдены.',
      alreadyRecordedInIssue: 'Время ({dur}) на дату {date} уже записано в этот Issue.',
      successfullySyncedToIssue: 'Успешно записано в GitLab Issue #{iid}!',

      copyTooltip: 'Скопировать команду GitLab /spend в буфер обмена',
      copiedTooltip: 'Скопировано в буфер обмена!',
      syncDirectTooltip: 'Синхронизировать напрямую с GitLab Issue #{iid} (API)',
      syncNoLinkTooltip: 'Синхронизировать с GitLab (требуется ссылка на Issue в описании)',
      alreadyExistsTooltip: 'Уже записано в Issue #{iid}',
      successRecordedTooltip: 'Успешно записано в Issue #{iid}',
      syncDayBtn: 'Синхронизировать день',
      syncDayTooltip: 'Синхронизировать все записи за этот день с GitLab',
      totalClickableTooltip: 'Нажмите для синхронизации всех записей за этот день',

      toastCopied: 'Команда скопирована в буфер обмена:',
      toastSyncing: 'Проверка и запись в GitLab...',
      toastNoWorker: 'Нет ответа от фонового процесса расширения.',
      toastAlreadyExists: 'Уже записано в Issue #{iid}.',
      toastSuccess: 'Успешно записано в Issue #{iid}!',
      toastFailed: 'Ошибка записи в GitLab: {err}',
      toastCommError: 'Ошибка расширения: {err}',
      toastDaySyncDone: 'Синхронизация за день завершена ({date})',
      toastTasksSynced: 'Синхронизировано записей: {count}',
      toastTasksAlready: 'Уже существовало записей: {count}',
      toastTasksNoLink: 'Записей без ссылки на GitLab: {count}',
      toastTasksFailed: 'Ошибок синхронизации: {count}',
      toastNoTasks: 'Записи не найдены.',
      toastTotalDuration: 'Общее время: {dur}',
      toastProgress: 'Синхронизация... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // HINDI (हिन्दी)
    // ------------------------------------------------------------------------
    hi: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'Clockify समय को सीधे GitLab में सिंक करें',
      activeStatus: 'सक्रिय',
      selectLanguage: 'भाषा',

      serverSection: 'सर्वर और प्रमाणीकरण',
      serverHostLabel: 'GitLab सर्वर URL:',
      serverHostHint: 'आपका GitLab डोमेन (उदा. https://gitlab.com)',
      tokenLabel: 'Personal Access Token:',
      tokenHint: "'api' स्कोप वाला टोकन (GitLab Settings -> Access Tokens से)",
      saveBtn: 'सेटिंग्स सहेजें',
      testBtn: 'कनेक्शन जांचें',

      timeFormatSection: 'समय प्रारूप',
      includeSecondsLabel: 'सेकंड शामिल करें',
      includeSecondsHint: 'उदा. 1h 51m के बजाय 1h 51m 11s',
      roundMinutesLabel: 'मिनट राउंड करें',
      roundMinutesHint: 'यदि सेकंड छोड़ दिए गए हों (>= 30s होने पर राउंड अप)',

      previewSection: 'कमांड पूर्वावलोकन',
      footerHint: 'आप config.js में भी सेटिंग्स पहले से कॉन्फ़िगर कर सकते हैं',

      settingsSaved: 'सेटिंग्स सफलतापूर्वक सहेजी गईं।',
      testingConn: 'कनेक्शन की जांच हो रही है...',
      connSuccess: 'सफलतापूर्वक कनेक्ट हुआ: स्वागत है {name} (@{username})',
      connAuthError: 'प्रमाणीकरण त्रुटि ({status}): टोकन और URL जांचें।',
      connError: 'कनेक्शन त्रुटि: {error}',
      noHost: 'GitLab सर्वर URL आवश्यक है।',
      noToken: 'Personal Access Token आवश्यक है।',
      noProjectPathOrIssue: 'GitLab प्रोजेक्ट पाथ या Issue ID नहीं मिला।',
      alreadyRecordedInIssue: 'तारीख {date} के लिए यह समय ({dur}) इस Issue में पहले से दर्ज है।',
      successfullySyncedToIssue: 'GitLab Issue #{iid} में सफलतापूर्वक दर्ज हुआ!',

      copyTooltip: 'GitLab /spend कमांड क्लिपबोर्ड पर कॉपी करें',
      copiedTooltip: 'क्लिपबोर्ड पर कॉपी हो गया!',
      syncDirectTooltip: 'सीधे GitLab Issue #{iid} में सिंक करें (API)',
      syncNoLinkTooltip: 'GitLab में सिंक करें (विवरण में Issue लिंक आवश्यक है)',
      alreadyExistsTooltip: 'Issue #{iid} में पहले से दर्ज है',
      successRecordedTooltip: 'Issue #{iid} में सफलतापूर्वक दर्ज किया गया',
      syncDayBtn: 'दिन सिंक करें',
      syncDayTooltip: 'इस दिन की सभी प्रविष्टियों को GitLab के साथ सिंक करें',
      totalClickableTooltip: 'इस दिन की सभी प्रविष्टियों को सिंक करने के लिए क्लिक करें',

      toastCopied: 'कमांड क्लिपबोर्ड पर कॉपी किया गया:',
      toastSyncing: 'GitLab में जांच और दर्ज किया जा रहा है...',
      toastNoWorker: 'एक्सटेंशन बैकग्राउंड वर्कर से कोई प्रतिक्रिया नहीं।',
      toastAlreadyExists: 'Issue #{iid} में पहले से मौजूद है।',
      toastSuccess: 'Issue #{iid} में सफलतापूर्वक दर्ज हुआ!',
      toastFailed: 'GitLab में दर्ज करने में विफल: {err}',
      toastCommError: 'एक्सटेंशन संचार त्रुटि: {err}',
      toastDaySyncDone: 'दिन का सिंक पूरा हुआ ({date})',
      toastTasksSynced: '{count} टास्क सिंक हुए',
      toastTasksAlready: '{count} टास्क पहले से दर्ज थे',
      toastTasksNoLink: '{count} आइटम बिना GitLab लिंक के',
      toastTasksFailed: '{count} टास्क विफल रहे',
      toastNoTasks: 'कोई प्रविष्टि दर्ज नहीं हुई।',
      toastTotalDuration: 'कुल अवधि: {dur}',
      toastProgress: 'सिंक हो रहा है... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // SPANISH (Español)
    // ------------------------------------------------------------------------
    es: {
      appName: 'GitLab /spend Sync',
      appSubtitle: 'Sincroniza el tiempo de Clockify directamente en GitLab',
      activeStatus: 'Activo',
      selectLanguage: 'Idioma',

      serverSection: 'Servidor y Autenticación',
      serverHostLabel: 'URL del servidor GitLab:',
      serverHostHint: 'Dominio de tu instancia de GitLab (ej. https://gitlab.com)',
      tokenLabel: 'Token de acceso personal (PAT):',
      tokenHint: "Token con alcance 'api' (desde Ajustes de GitLab -> Access Tokens)",
      saveBtn: 'Guardar configuración',
      testBtn: 'Probar conexión',

      timeFormatSection: 'Formato de hora',
      includeSecondsLabel: 'Incluir segundos',
      includeSecondsHint: 'ej. 1h 51m 11s en lugar de 1h 51m',
      roundMinutesLabel: 'Redondear minutos',
      roundMinutesHint: 'Cuando se omiten segundos (redondea si >= 30s)',

      previewSection: 'Vista previa del comando',
      footerHint: 'También puedes predefinir valores en config.js',

      settingsSaved: 'Configuración guardada con éxito.',
      testingConn: 'Comprobando conexión...',
      connSuccess: 'Conexión exitosa: Bienvenido {name} (@{username})',
      connAuthError: 'Error de autenticación ({status}): verifica el token y la URL.',
      connError: 'Error de conexión: {error}',
      noHost: 'La URL del servidor GitLab es obligatoria.',
      noToken: 'El token de acceso personal es obligatorio.',
      noProjectPathOrIssue: 'No se encontró la ruta del proyecto o el ID del Issue.',
      alreadyRecordedInIssue: 'Este tiempo ({dur}) para {date} ya está registrado en este Issue.',
      successfullySyncedToIssue: '¡Registrado con éxito en GitLab Issue #{iid}!',

      copyTooltip: 'Copiar comando /spend de GitLab al portapapeles',
      copiedTooltip: '¡Copiado al portapapeles!',
      syncDirectTooltip: 'Sincronizar directamente con GitLab Issue #{iid} (API)',
      syncNoLinkTooltip: 'Sincronizar con GitLab (requiere enlace de Issue en la descripción)',
      alreadyExistsTooltip: 'Ya registrado en Issue #{iid}',
      successRecordedTooltip: 'Registrado con éxito en Issue #{iid}',
      syncDayBtn: 'Sincronizar día',
      syncDayTooltip: 'Sincronizar todas las entradas de este día con GitLab',
      totalClickableTooltip: 'Clic para sincronizar todas las entradas de este día',

      toastCopied: 'Comando copiado al portapapeles:',
      toastSyncing: 'Comprobando y registrando entrada en GitLab...',
      toastNoWorker: 'Sin respuesta del servicio en segundo plano de la extensión.',
      toastAlreadyExists: 'Ya registrado en Issue #{iid}.',
      toastSuccess: '¡Registrado con éxito en Issue #{iid}!',
      toastFailed: 'Error al registrar en GitLab: {err}',
      toastCommError: 'Error de extensión: {err}',
      toastDaySyncDone: 'Sincronización del día completada ({date})',
      toastTasksSynced: '{count} tareas sincronizadas',
      toastTasksAlready: '{count} tareas ya registradas',
      toastTasksNoLink: '{count} elementos sin enlace de GitLab',
      toastTasksFailed: '{count} tareas fallidas',
      toastNoTasks: 'No se registraron tareas.',
      toastTotalDuration: 'Duración total: {dur}',
      toastProgress: 'Sincronizando... ({curr}/{total})'
    },

    // ------------------------------------------------------------------------
    // TURKISH (Türkçe)
    // ------------------------------------------------------------------------
    tr: {
      appName: 'GitLab /spend Sync',
      appSubtitle: "Clockify sürelerini doğrudan GitLab'a senkronize edin",
      activeStatus: 'Aktif',
      selectLanguage: 'Dil',

      serverSection: 'Sunucu ve Kimlik Doğrulama',
      serverHostLabel: "GitLab Sunucu URL'si:",
      serverHostHint: "GitLab sunucunuzun adresi (örn. https://gitlab.com)",
      tokenLabel: 'Personal Access Token:',
      tokenHint: "'api' kapsamına sahip token (GitLab Ayarlar -> Access Tokens)",
      saveBtn: 'Ayarları Kaydet',
      testBtn: 'Bağlantıyı Test Et',

      timeFormatSection: 'Zaman Formatı',
      includeSecondsLabel: 'Saniyeleri dahil et',
      includeSecondsHint: 'örn. 1h 51m yerine 1h 51m 11s',
      roundMinutesLabel: 'Dakikayı yuvarla',
      roundMinutesHint: 'Saniyeler çıkarıldığında (>= 30sn ise yukarı yuvarlar)',

      previewSection: 'Komut Önizlemesi',
      footerHint: 'Ayarları doğrudan config.js içinde de tanımlayabilirsiniz',

      settingsSaved: 'Ayarlar başarıyla kaydedildi.',
      testingConn: 'Bağlantı kontrol ediliyor...',
      connSuccess: 'Bağlantı başarılı: Hoş geldiniz {name} (@{username})',
      connAuthError: 'Kimlik doğrulama hatası ({status}): Token ve URL kontrol edin.',
      connError: 'Bağlantı hatası: {error}',
      noHost: "GitLab sunucu URL'si gereklidir.",
      noToken: 'Personal Access Token gereklidir.',
      noProjectPathOrIssue: 'GitLab proje yolu veya Issue ID bulunamadı.',
      alreadyRecordedInIssue: 'Bu süre ({dur}) {date} tarihi için bu Issue içine zaten kaydedilmiş.',
      successfullySyncedToIssue: "GitLab Issue #{iid} içine başarıyla kaydedildi!",

      copyTooltip: "GitLab /spend komutunu panoya kopyala",
      copiedTooltip: 'Panoya kopyalandı!',
      syncDirectTooltip: "Doğrudan GitLab Issue #{iid}'ye senkronize et (API)",
      syncNoLinkTooltip: "GitLab'a senkronize et (Açıklamada Issue bağlantısı gerekir)",
      alreadyExistsTooltip: 'Zaten Issue #{iid} içinde kayıtlı',
      successRecordedTooltip: 'Issue #{iid} içine başarıyla kaydedildi',
      syncDayBtn: 'Günü Senkronize Et',
      syncDayTooltip: 'Bu günün tüm kayıtlarını GitLab ile senkronize et',
      totalClickableTooltip: 'Bu günün tüm kayıtlarını senkronize etmek için tıklayın',

      toastCopied: 'Komut panoya kopyalandı:',
      toastSyncing: "GitLab kontrol ediliyor ve kaydediliyor...",
      toastNoWorker: 'Uzantı arka plan hizmetinden yanıt alınamadı.',
      toastAlreadyExists: 'Zaten Issue #{iid} içinde kayıtlı.',
      toastSuccess: 'Issue #{iid} içine başarıyla kaydedildi!',
      toastFailed: 'GitLab kaydı başarısız: {err}',
      toastCommError: 'Uzantı iletişim hatası: {err}',
      toastDaySyncDone: 'Gün senkronizasyonu tamamlandı ({date})',
      toastTasksSynced: '{count} görev senkronize edildi',
      toastTasksAlready: '{count} görev zaten mevcuttu',
      toastTasksNoLink: '{count} kayıt GitLab bağlantısı içermiyor',
      toastTasksFailed: '{count} görev başarısız oldu',
      toastNoTasks: 'Hiçbir kayıt işlenmedi.',
      toastTotalDuration: 'Toplam süre: {dur}',
      toastProgress: 'Senkronize ediliyor... ({curr}/{total})'
    }
  };

  /**
   * Translate a key with optional variable replacements
   */
  function t(key, lang = 'en', params = {}) {
    const langDict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    let text = langDict[key] || TRANSLATIONS['en'][key] || key;
    if (params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
    }
    return text;
  }

  /**
   * Get direction ('rtl' or 'ltr') for a language code
   */
  function getDir(lang = 'en') {
    return (LANGUAGES[lang] && LANGUAGES[lang].dir) ? LANGUAGES[lang].dir : 'ltr';
  }

  return {
    LANGUAGES,
    TRANSLATIONS,
    t,
    getDir
  };
});

