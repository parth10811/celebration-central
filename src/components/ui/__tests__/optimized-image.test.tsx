import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../optimized-image';

describe('OptimizedImage', () => {
  const mockSrc = 'https://example.com/image.jpg';
  const mockAlt = 'Test image';

  it('renders with loading state initially', () => {
    render(<OptimizedImage src={mockSrc} alt={mockAlt} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', mockSrc);
    expect(screen.getByRole('img')).toHaveAttribute('alt', mockAlt);
    expect(screen.getByRole('img')).toHaveClass('opacity-0');
  });

  it('shows image after loading', async () => {
    render(<OptimizedImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole('img');
    
    // Simulate image load
    img.dispatchEvent(new Event('load'));
    
    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });
  });

  it('shows fallback image on error', async () => {
    render(<OptimizedImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole('img');
    
    // Simulate image error
    img.dispatchEvent(new Event('error'));
    
    await waitFor(() => {
      expect(img).toHaveAttribute('src', 'https://placehold.co/600x400?text=Image+Not+Found');
    });
  });

  it('loads image eagerly when priority is true', () => {
    render(<OptimizedImage src={mockSrc} alt={mockAlt} priority />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
  });

  it('loads image lazily by default', () => {
    render(<OptimizedImage src={mockSrc} alt={mockAlt} />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });
}); 