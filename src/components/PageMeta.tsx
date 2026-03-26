import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title: string
  description: string
  path?: string
  /** Specific og:image override. Defaults to the generic og-image. */
  image?: string
}

const BASE_URL = import.meta.env.VITE_BASE_URL ?? 'https://studyhub.kz'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export function PageMeta({ title, description, path = '', image = DEFAULT_IMAGE }: PageMetaProps) {
  const fullTitle = `${title} | StudyHub`
  const url = `${BASE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
