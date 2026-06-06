import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface AutoTranslateProps {
  children: React.ReactNode;
  /** Keep inline tags or translate full block */
  mode?: 'block' | 'inline'; 
}

// Global translation batcher to combine requests, prevent parallel spam, and load in under a second
class TranslationBatcher {
  private queue: Array<{
    text: string;
    lang: string;
    resolve: (val: string) => void;
    reject: (err: any) => void;
  }> = [];

  private timer: NodeJS.Timeout | null = null;

  public add(text: string, lang: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ text, lang, resolve, reject });
      this.schedule();
    });
  }

  private schedule() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flush();
    }, 40); // 40ms debounce is perfect for grouping all mounts in a single render tick
  }

  private async flush() {
    const itemsToProcess = [...this.queue];
    this.queue = [];

    if (itemsToProcess.length === 0) return;

    // Group items by target language
    const groups: Record<string, typeof itemsToProcess> = {};
    for (const item of itemsToProcess) {
      if (!groups[item.lang]) groups[item.lang] = [];
      groups[item.lang].push(item);
    }

    // Process each language group
    for (const [lang, items] of Object.entries(groups)) {
      // De-duplicate texts to save bandwidth and API tokens
      const uniqueTexts = Array.from(new Set(items.map(i => i.text)));
      
      try {
        const res = await fetch('/api/gemini/translate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: uniqueTexts, targetLanguage: lang })
        });

        if (res.ok) {
          const data = await res.json();
          const translations: Record<string, string> = data.translations || {};
          
          // Resolve all items in this group
          for (const item of items) {
            const translated = translations[item.text] || item.text;
            item.resolve(translated);
          }
        } else {
          throw new Error(`Batch request failed with status ${res.status}`);
        }
      } catch (err) {
        console.error(`🌐 [AutoTranslateBatcher] Failed to translate batch for lang ${lang}:`, err);
        // Fallback to original text for all failed items
        for (const item of items) {
          item.resolve(item.text);
        }
      }
    }
  }
}

const batcherInstance = new TranslationBatcher();

export const AutoTranslate: React.FC<AutoTranslateProps> = ({ children, mode = 'inline' }) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  // Safely extract text from node
  const getTextFromChildren = (node: React.ReactNode): string => {
    if (!node) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextFromChildren).join('');
    if (React.isValidElement(node)) {
      return getTextFromChildren((node.props as any)?.children);
    }
    return '';
  };

  const textVal = getTextFromChildren(children).trim();

  useEffect(() => {
    const lang = (i18n.language || 'en').split('-')[0].toLowerCase();
    
    // For English, show base text on-the-fly with 0ms loading
    if (lang === 'en') {
      setTranslatedText(null);
      return;
    }

    if (!textVal) {
      setTranslatedText(null);
      return;
    }

    // Fast storage cache check to make page reload instantaneous
    const cacheKey = `tr_${lang}_${textVal}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    let active = true;
    
    // Use the batcher instead of individual fetch. It automatically aggregates.
    batcherInstance.add(textVal, lang)
      .then((translated) => {
        if (active) {
          setTranslatedText(translated);
          try {
            localStorage.setItem(cacheKey, translated);
          } catch (_) {}
        }
      })
      .catch((err) => {
        console.error("🌐 [AutoTranslate] Failed fetching from batcher:", err);
      });

    return () => {
      active = false;
    };
  }, [textVal, i18n.language]);

  // NEVER DO SKELETON OR PULSE RENDER SHIFTS while translating! 
  // It causes visual "shaking" and "cracking" on load. 
  // We simply render the base text (children) while the translation loads in the background.
  if (translatedText) {
    if (mode === 'inline') {
      return <>{translatedText}</>;
    }
    return <div className="whitespace-pre-line">{translatedText}</div>;
  }

  return <>{children}</>;
};

export default AutoTranslate;
