import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BookCard } from '@/components/books/BookCard'

const mockBook = {
  id: 'test-id',
  title: '道德经',
  author: '老子',
  category: '道',
  description: '万经之王',
  cover_url: null,
  file_url: 'test.epub',
  published_at: null,
  is_public: true,
  view_count: 100,
  created_at: '2026-01-01',
}

describe('BookCard', () => {
  it('renders book title and author', () => {
    render(<BookCard book={mockBook} />)
    expect(screen.getByText('道德经')).toBeTruthy()
    expect(screen.getByText('老子')).toBeTruthy()
  })

  it('renders category badge', () => {
    render(<BookCard book={mockBook} />)
    expect(screen.getByText('道')).toBeTruthy()
  })
})
