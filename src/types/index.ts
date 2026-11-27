export interface Figure {
  id: string
  venue: string
  year: number
  title: string
  authors: string[]
  pattern: string
  image: string
  paper: string
  pdf_source: string
  score: number
  w: number
  h: number
}

export interface SearchResult extends Figure {
  relevanceScore: number
}

export interface ApiConfig {
  provider: 'custom' | 'openai' | 'anthropic'
  baseUrl: string
  apiKey: string
  parseModel: string
  generateModel: string
  reconstructModel: string
  imageModel: string
  imageApiKey: string
}
