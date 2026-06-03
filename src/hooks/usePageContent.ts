import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to fetch dynamic page content from the backend.
 * @param slug The page identifier (e.g., 'home', 'about', 'training')
 */
export function usePageContent(slug: string) {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    fetch(`${import.meta.env.VITE_API_BASE_URL}/pages/${slug}/?lang=${i18n.language}`, {
      signal: controller.signal
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch page content');
        return res.json();
      })
      .then((data) => {
        setContent(data.content || {});
      })
      .catch(() => setContent({})) // Fallback to empty if API fails
      .finally(() => setLoading(false));

    return () => clearTimeout(timeoutId);
  }, [slug, i18n.language]);

  return { content, loading };
}