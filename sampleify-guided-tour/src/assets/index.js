import logo from './sampleify-logo.png';

// Vite resolves image imports to a URL string; Next.js resolves them to
// { src, width, height }. Normalise once so components work in both.
export const logoSrc = typeof logo === 'string' ? logo : logo?.src ?? '';
