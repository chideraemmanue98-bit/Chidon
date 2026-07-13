import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCleanFeatureLabel(label: string): string {
  if (!label) return '';
  
  // 1. Remove prefixes like ( Feature.), (Feature.), Feature., Feature:, features., etc.
  let cleaned = label;
  
  // Regex to match things like "( Feature.)", "[Feature.]", "features.", "Feature.", "Feature:", "(Feature)" at the start
  cleaned = cleaned.replace(/^[\s\(\[\{]*feature[s]?[\s\.\:\-\)\]\}]*/i, '');
  
  // Remove stray dot at start if any left
  cleaned = cleaned.replace(/^\s*\.\s*/, '');
  
  // 2. If it's a fallback translation key like "features.content-ideas.label"
  if (cleaned.toLowerCase().includes('.label') || cleaned.toLowerCase().includes('features.')) {
    const parts = cleaned.split('.');
    // Find the segment representing the feature id (usually second to last, before 'label')
    const mainPart = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    cleaned = mainPart
      .split(/[\-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Remove trailing .label or similar if any remains
  cleaned = cleaned.replace(/\.label$/i, '');
  
  // Trim and capitalize the first letter of each word to be clean
  cleaned = cleaned.trim();
  
  return cleaned || label;
}
