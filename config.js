/**
 * ====================================================================
 * ⚙️ GITLAB CONFIGURATION / تنظیمات گیت‌لب
 * 
 * You can configure your GitLab host and Personal Access Token here,
 * or manage them securely via the extension popup UI.
 * 
 * می‌توانید آدرس سرور و توکن شخصی خود را در متغیرهای زیر وارد کنید،
 * یا از طریق منوی پاپ‌آپ افزونه آن را ذخیره و مدیریت نمایید.
 * ====================================================================
 */

const GITLAB_CONFIG = {
  // GitLab server domain / آدرس سرور گیت‌لب
  defaultHost: 'https://gitlab.com',

  // Personal Access Token with 'api' scope / توکن شخصی با دسترسی api
  // Generate at: User Settings -> Access Tokens -> Add new token -> Scope: 'api'
  defaultToken: '',

  // Default interface language / زبان پیش‌فرض افزونه (e.g. 'en', 'fa', 'de', 'fr', 'zh', 'ar', 'ru', 'hi', 'es', 'tr')
  language: 'en',

  // Time format settings / تنظیمات فرمت زمان
  includeSeconds: true,
  roundMinutes: false,
  customCommand: '/spend'
};

// Export for Node/Service Worker environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GITLAB_CONFIG;
}
