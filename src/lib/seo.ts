import { useEffect } from 'react'
import { brand } from '@/config/brand'

// SEO dinâmico por rota: title/description/OG/canonical + JSON-LD opcional.
// (No preview in-app os meta tags não são rastreados; o build servido sim.)

interface SeoOpts { title?: string; description?: string; path?: string; jsonLd?: Record<string, unknown> }

export function useSeo({ title, description, path, jsonLd }: SeoOpts = {}) {
  useEffect(() => {
    document.title = title ? `${title} — ${brand.name}` : `${brand.name} — ${brand.tagline}`
    const setMeta = (selector: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector)
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    if (description) {
      setMeta('meta[name="description"]', description)
      setMeta('meta[property="og:description"]', description)
    }
    setMeta('meta[property="og:title"]', title ? `${title} — ${brand.name}` : `${brand.name} — ${brand.tagline}`)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = `${brand.url}${path ?? '/'}`

    let script = document.getElementById('ld-json') as HTMLScriptElement | null
    if (jsonLd) {
      if (!script) { script = document.createElement('script'); script.id = 'ld-json'; script.type = 'application/ld+json'; document.head.appendChild(script) }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) script.remove()
  }, [title, description, path, jsonLd])
}
