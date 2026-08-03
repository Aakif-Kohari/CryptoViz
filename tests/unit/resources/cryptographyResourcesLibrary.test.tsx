import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { resources, categories, difficulties } from '@/lib/resources';
import ResourceCard from '@/components/resources/ResourceCard';
import FilterBar from '@/components/resources/FilterBar';
import SearchBar from '@/components/resources/SearchBar';

describe('Cryptography Resources Library (Issue #475)', () => {
  it('contains entries across all required resource categories', () => {
    expect(resources.length).toBeGreaterThanOrEqual(30);

    const categorySet = new Set(resources.map((r) => r.category));
    expect(categorySet.has('Book')).toBe(true);
    expect(categorySet.has('Research Paper')).toBe(true);
    expect(categorySet.has('RFC')).toBe(true);
    expect(categorySet.has('NIST')).toBe(true);
    expect(categorySet.has('Repository')).toBe(true);
    expect(categorySet.has('Learning Site')).toBe(true);
    expect(categorySet.has('Video')).toBe(true);
  });

  it('renders ResourceCard correctly with external links and tags', () => {
    const sampleResource = resources[0];
    render(<ResourceCard resource={sampleResource} />);

    expect(screen.getByText(sampleResource.title)).toBeInTheDocument();
    expect(screen.getByText(sampleResource.author)).toBeInTheDocument();
    expect(screen.getByText(sampleResource.category)).toBeInTheDocument();
    expect(screen.getByText(sampleResource.difficulty)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: `Open resource: ${sampleResource.title}` });
    expect(link).toHaveAttribute('href', sampleResource.url);
    expect(link).toHaveAttribute('target', '_blank');
  });

 it('renders FilterBar with search, category, difficulty, and topic controls', () => {
  let search = '';
  let category = 'All';
  let difficulty = 'All';
  let topic = 'All';

  const topics = [
    'AES',
    'RSA',
    'Hashing',
    'ECC',
  ];

  render(
    <FilterBar
      search={search}
      setSearch={(val) => (search = val)}
      category={category}
      setCategory={(val) => (category = val)}
      difficulty={difficulty}
      setDifficulty={(val) => (difficulty = val)}
      topic={topic}
      setTopic={(val) => (topic = val)}
      topics={topics}
    />
  );

  it('updates topic filter when a topic is selected', () => {
  let topic = 'All';

  render(
    <FilterBar
      search=""
      setSearch={() => {}}
      category="All"
      setCategory={() => {}}
      difficulty="All"
      setDifficulty={() => {}}
      topic={topic}
      setTopic={(val) => {
        topic = val;
      }}
      topics={['AES', 'RSA']}
    />
  );

  fireEvent.change(screen.getByLabelText('Filter by topic'), {
    target: { value: 'AES' },
  });

  expect(topic).toBe('AES');
});

  expect(screen.getByPlaceholderText(/Search books/i)).toBeInTheDocument();
  expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
  expect(screen.getByLabelText('Filter by difficulty')).toBeInTheDocument();
  expect(screen.getByLabelText('Filter by topic')).toBeInTheDocument();
});
  it('renders SearchBar grid and empty state when resources are empty', () => {
    const { rerender } = render(<SearchBar resources={resources.slice(0, 3)} />);
    expect(screen.getByText(resources[0].title)).toBeInTheDocument();

    rerender(<SearchBar resources={[]} onClear={() => {}} />);
    expect(screen.getByText('No resources found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear all filters/i })).toBeInTheDocument();
  });
});
