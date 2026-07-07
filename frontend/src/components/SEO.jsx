import { useEffect } from "react";

/**
 * Sets document title, meta description, canonical, and injects JSON-LD.
 * Cleans up on unmount so pages don't leak previous JSON-LD.
 */
export default function SEO({ title, description, canonical, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", description);
    }
    if (canonical) {
      let l = document.querySelector('link[rel="canonical"]');
      if (!l) { l = document.createElement("link"); l.setAttribute("rel", "canonical"); document.head.appendChild(l); }
      l.setAttribute("href", canonical);
    }
    let script;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      script.setAttribute("data-seo", "page");
      document.head.appendChild(script);
    }
    return () => { if (script) script.remove(); };
  }, [title, description, canonical, JSON.stringify(jsonLd)]);
  return null;
}
