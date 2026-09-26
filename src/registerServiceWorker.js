export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const register = () => navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(error => {
    console.warn('Service worker registration failed', error);
  });
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
