import { CIPHER_REGISTRY, type CipherDefinition } from '../cipher/registry'
import { GLOSSARY_TERMS } from '../glossary/glossaryData'
import type { GlossaryTerm } from '../glossary/types'
import { docCategories, type DocCategory } from '../../app/docs/data'
import { CRYPTOGRAPHY_VIDEOS, type CryptoVideo } from '../resources/cryptographyVideoLibrary'

export type SearchResultCategory = 'visualizers' | 'documentation' | 'glossary' | 'resources'

export interface SearchResult {
  id: string
  category: SearchResultCategory
  title: string
  description: string
  url: string
  metadata?: {
    type?: string
    tags?: string[]
    difficulty?: string
  }
}

export interface SearchIndex {
  visualizers: SearchResult[]
  documentation: SearchResult[]
  glossary: SearchResult[]
  resources: SearchResult[]
}

// Index visualizers
function indexVisualizers(): SearchResult[] {
  return CIPHER_REGISTRY.map((cipher: CipherDefinition) => ({
    id: cipher.id,
    category: 'visualizers' as const,
    title: cipher.name,
    description: cipher.description,
    url: `/visualizer/${cipher.id}/`,
    metadata: {
      type: cipher.category,
      tags: [cipher.securityStatus],
    },
  }))
}

// Index documentation
function indexDocumentation(): SearchResult[] {
  return docCategories.map((doc: DocCategory) => ({
    id: doc.title.toLowerCase().replace(/\s+/g, '-'),
    category: 'documentation' as const,
    title: doc.title,
    description: doc.description,
    url: '/docs',
    metadata: {
      type: doc.type,
    },
  }))
}

// Index glossary
function indexGlossary(): SearchResult[] {
  return GLOSSARY_TERMS.map((term: GlossaryTerm) => ({
    id: term.id,
    category: 'glossary' as const,
    title: term.term,
    description: term.summary,
    url: '/glossary',
    metadata: {
      tags: [...(term.aliases || []), ...term.tags],
    },
  }))
}

// Index resources
function indexResources(): SearchResult[] {
  return CRYPTOGRAPHY_VIDEOS.map((video: CryptoVideo) => ({
    id: video.id,
    category: 'resources' as const,
    title: video.title,
    description: video.description,
    url: '/resources/video-library',
    metadata: {
      type: video.topic,
      tags: video.tags,
      difficulty: video.difficulty,
    },
  }))
}

// Build complete search index
export function buildSearchIndex(): SearchIndex {
  return {
    visualizers: indexVisualizers(),
    documentation: indexDocumentation(),
    glossary: indexGlossary(),
    resources: indexResources(),
  }
}

// Search function with fuzzy matching
export function searchGlobal(query: string, index: SearchIndex = buildSearchIndex()): SearchResult[] {
  const searchQuery = query.toLowerCase().trim()
  
  if (!searchQuery) {
    return []
  }

  const allResults: SearchResult[] = [
    ...index.visualizers,
    ...index.documentation,
    ...index.glossary,
    ...index.resources,
  ]

  // Score-based search
  const scoredResults = allResults.map(result => {
    let score = 0
    const titleLower = result.title.toLowerCase()
    const descriptionLower = result.description.toLowerCase()
    const tags = result.metadata?.tags?.map(t => t.toLowerCase()) || []
    const type = result.metadata?.type?.toLowerCase() || ''

    // Exact title match gets highest score
    if (titleLower === searchQuery) {
      score += 100
    }
    // Title starts with query
    else if (titleLower.startsWith(searchQuery)) {
      score += 80
    }
    // Title contains query
    else if (titleLower.includes(searchQuery)) {
      score += 60
    }
    // Description contains query
    else if (descriptionLower.includes(searchQuery)) {
      score += 40
    }
    // Tags contain query
    else if (tags.some(tag => tag.includes(searchQuery))) {
      score += 30
    }
    // Type contains query
    else if (type.includes(searchQuery)) {
      score += 20
    }

    // Word boundary matching
    const words = searchQuery.split(/\s+/)
    words.forEach(word => {
      if (titleLower.includes(word)) score += 10
      if (descriptionLower.includes(word)) score += 5
    })

    return { result, score }
  })

  // Filter out zero-score results and sort by score
  return scoredResults
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ result }) => result)
    .slice(0, 20) // Limit to top 20 results
}

// Get category label
export function getCategoryLabel(category: SearchResultCategory): string {
  const labels: Record<SearchResultCategory, string> = {
    visualizers: 'Visualizers',
    documentation: 'Documentation',
    glossary: 'Glossary',
    resources: 'Resources',
  }
  return labels[category]
}

// Group results by category
export function groupResultsByCategory(results: SearchResult[]): Record<SearchResultCategory, SearchResult[]> {
  const grouped: Record<SearchResultCategory, SearchResult[]> = {
    visualizers: [],
    documentation: [],
    glossary: [],
    resources: [],
  }

  results.forEach(result => {
    grouped[result.category].push(result)
  })

  return grouped
}
