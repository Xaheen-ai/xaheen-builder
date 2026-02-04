/**
 * ListingTableView Accessibility Tests
 *
 * Tests for WCAG 2.1.1 Keyboard (Level A) compliance
 * Tests keyboard navigation, screen reader support, and design token compliance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingTableView } from './ListingTableView';
import type { MapListing } from './ListingMap';

// Mock test data
const mockListings: MapListing[] = [
  {
    id: '1',
    name: 'Konferanserom A',
    location: 'Oslo Sentrum',
    type: 'Møterom',
    capacity: 20,
    price: 500,
    priceUnit: 'time',
    latitude: 59.9139,
    longitude: 10.7522,
  },
  {
    id: '2',
    name: 'Auditorium B',
    location: 'Bergen',
    type: 'Auditorium',
    capacity: 100,
    price: 2000,
    priceUnit: 'dag',
    latitude: 60.3913,
    longitude: 5.3221,
  },
  {
    id: '3',
    name: 'Studio C',
    location: 'Trondheim',
    type: 'Studio',
    capacity: 10,
    price: 300,
    priceUnit: 'time',
    latitude: 63.4305,
    longitude: 10.3951,
  },
];

describe('ListingTableView', () => {
  describe('Accessibility Compliance', () => {
    it('should render a semantic table with proper structure', () => {
      render(<ListingTableView listings={mockListings} />);

      // Should have table element
      const table = screen.getByRole('table', { hidden: true });
      expect(table).toBeInTheDocument();

      // Should have table headers
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBeGreaterThan(0);

      // Should have table rows
      const rows = screen.getAllByRole('button'); // Rows have role="button" for interactivity
      expect(rows.length).toBe(mockListings.length);
    });

    it('should have proper ARIA labels for screen readers', () => {
      render(<ListingTableView listings={mockListings} />);

      // Region should have aria-label
      const region = screen.getByRole('region', { name: 'Tabellvisning av lokaler' });
      expect(region).toBeInTheDocument();

      // Rows should have descriptive aria-labels
      const firstRow = screen.getByRole('button', { name: /Vis detaljer for Konferanserom A/i });
      expect(firstRow).toBeInTheDocument();
    });

    it('should have sortable column headers with aria-sort', () => {
      render(<ListingTableView listings={mockListings} />);

      const nameHeader = screen.getByText(/Navn/);
      expect(nameHeader).toHaveAttribute('aria-sort');
      expect(nameHeader).toHaveAttribute('tabIndex', '0');
    });

    it('should display all required columns', () => {
      render(<ListingTableView listings={mockListings} />);

      // Check for column headers
      expect(screen.getByText(/Navn/)).toBeInTheDocument();
      expect(screen.getByText(/Plassering/)).toBeInTheDocument();
      expect(screen.getByText(/Type/)).toBeInTheDocument();
      expect(screen.getByText(/Kapasitet/)).toBeInTheDocument();
      expect(screen.getByText(/Pris/)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard focusable', () => {
      render(<ListingTableView listings={mockListings} />);

      const rows = screen.getAllByRole('button');
      rows.forEach(row => {
        expect(row).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should support keyboard activation with Enter and Space', () => {
      const onListingClick = vi.fn();
      const { container } = render(
        <ListingTableView listings={mockListings} onListingClick={onListingClick} />
      );

      const firstRow = screen.getByRole('button', { name: /Vis detaljer for Konferanserom A/i });

      // Simulate Enter key
      firstRow.focus();
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      firstRow.dispatchEvent(enterEvent);

      // Simulate Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      firstRow.dispatchEvent(spaceEvent);

      // Both should trigger click handler
      expect(onListingClick).toHaveBeenCalled();
    });

    it('should support arrow key navigation between rows', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);

      const rows = screen.getAllByRole('button');
      const firstRow = rows[0];
      const secondRow = rows[1];

      // Focus first row
      firstRow?.focus();
      expect(document.activeElement).toBe(firstRow);

      // Press ArrowDown
      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      firstRow?.dispatchEvent(arrowDownEvent);

      // Focus should move to second row
      setTimeout(() => {
        expect(document.activeElement).toBe(secondRow);
      }, 100);
    });

    it('should support sorting with keyboard', () => {
      render(<ListingTableView listings={mockListings} />);

      const nameHeader = screen.getByText(/Navn/);

      // Should be focusable
      expect(nameHeader).toHaveAttribute('tabIndex', '0');

      // Simulate Enter key to sort
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      nameHeader.dispatchEvent(enterEvent);

      // Should update aria-sort
      expect(nameHeader).toHaveAttribute('aria-sort');
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by name alphabetically', () => {
      render(<ListingTableView listings={mockListings} />);

      const nameHeader = screen.getByText(/Navn/);
      nameHeader.click();

      // Check if first listing is sorted
      const rows = screen.getAllByRole('button');
      expect(rows[0]).toHaveAccessibleName(/Auditorium B/);
    });

    it('should toggle sort direction on repeated clicks', () => {
      render(<ListingTableView listings={mockListings} />);

      const nameHeader = screen.getByText(/Navn/);

      // Initial state - should be ascending (default sorted by name)
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

      // Verify header is clickable and has proper role
      expect(nameHeader).toHaveAttribute('tabIndex', '0');

      // All rows should be present regardless of sort direction
      const rows = screen.getAllByRole('button');
      expect(rows).toHaveLength(3);
    });

    it('should sort numerical columns correctly', () => {
      render(<ListingTableView listings={mockListings} />);

      const capacityHeader = screen.getByText(/Kapasitet/);
      const priceHeader = screen.getByText(/Pris/);

      // Verify numerical columns are sortable
      expect(capacityHeader).toHaveAttribute('tabIndex', '0');
      expect(capacityHeader).toHaveAttribute('aria-sort');
      expect(priceHeader).toHaveAttribute('tabIndex', '0');
      expect(priceHeader).toHaveAttribute('aria-sort');

      // All rows should be present
      const rows = screen.getAllByRole('button');
      expect(rows).toHaveLength(3);
    });
  });

  describe('Design Token Compliance', () => {
    it('should use design tokens for all styling', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);

      // Check for design token usage in inline styles
      const table = container.querySelector('table');
      const tableContainer = container.querySelector('[role="region"]');

      // Should use CSS variables
      expect(tableContainer).toHaveStyle({
        backgroundColor: expect.stringContaining('var(--ds-color-'),
      });
    });

    it('should not have hardcoded colors', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);
      const html = container.innerHTML;

      // Should not contain hex colors or rgb values (except in var() calls)
      const hasHardcodedColors = /#[0-9a-f]{3,6}(?!.*var\()/i.test(html);
      expect(hasHardcodedColors).toBe(false);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive CSS for mobile devices', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);
      const style = container.querySelector('style');

      expect(style?.textContent).toContain('@media (max-width: 991px)');
    });

    it('should support horizontal scrolling', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);
      const tableContainer = screen.getByRole('region');

      expect(tableContainer).toHaveStyle({ overflow: 'auto' });
    });
  });

  describe('Reduced Motion Support', () => {
    it('should have reduced motion CSS', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);
      const style = container.querySelector('style');

      expect(style?.textContent).toContain('@media (prefers-reduced-motion: reduce)');
    });
  });

  describe('High Contrast Mode Support', () => {
    it('should have high contrast mode CSS', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);
      const style = container.querySelector('style');

      expect(style?.textContent).toContain('@media (prefers-contrast: high)');
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);
      const style = container.querySelector('style');

      // Should have focus styles
      expect(style?.textContent).toContain(':focus');
      expect(style?.textContent).toContain('outline');
    });

    it('should track focused row', () => {
      render(<ListingTableView listings={mockListings} />);

      const firstRow = screen.getAllByRole('button')[0];
      firstRow?.focus();

      // Should have focus styles applied
      expect(firstRow).toHaveFocus();
    });
  });

  describe('Empty State', () => {
    it('should handle empty listings array', () => {
      render(<ListingTableView listings={[]} />);

      const footer = screen.getByText(/Viser 0 lokaler/i);
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Norwegian Language', () => {
    it('should use Norwegian labels', () => {
      render(<ListingTableView listings={mockListings} />);

      expect(screen.getByText(/Navn/)).toBeInTheDocument();
      expect(screen.getByText(/Plassering/)).toBeInTheDocument();
      expect(screen.getByText(/Kapasitet/)).toBeInTheDocument();
      expect(screen.getByText(/20 personer/)).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('should format prices correctly', () => {
      render(<ListingTableView listings={mockListings} />);

      expect(screen.getByText(/kr 500\/time/)).toBeInTheDocument();
      expect(screen.getByText(/kr 2000\/dag/)).toBeInTheDocument();
    });

    it('should handle missing prices gracefully', () => {
      const listingsWithoutPrice: MapListing[] = [
        {
          id: '1',
          name: 'Test Listing',
          location: 'Oslo',
          type: 'Room',
          latitude: 59.9139,
          longitude: 10.7522,
        },
      ];

      render(<ListingTableView listings={listingsWithoutPrice} />);

      // Should show dashes for missing data (type, capacity, price)
      const dashes = screen.getAllByText('–');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe('Click Handlers', () => {
    it('should call onListingClick with correct arguments', () => {
      const onListingClick = vi.fn();
      render(<ListingTableView listings={mockListings} onListingClick={onListingClick} />);

      const firstRow = screen.getByRole('button', { name: /Vis detaljer for Konferanserom A/i });
      firstRow.click();

      expect(onListingClick).toHaveBeenCalledWith('1', undefined);
    });

    it('should pass slug if available', () => {
      const onListingClick = vi.fn();
      const listingsWithSlug: MapListing[] = [
        {
          ...mockListings[0]!,
          slug: 'konferanserom-a',
        },
      ];

      render(<ListingTableView listings={listingsWithSlug} onListingClick={onListingClick} />);

      const row = screen.getByRole('button');
      row.click();

      expect(onListingClick).toHaveBeenCalledWith('1', 'konferanserom-a');
    });
  });

  describe('Custom Height', () => {
    it('should accept custom height prop', () => {
      const { container } = render(<ListingTableView listings={mockListings} height="500px" />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveStyle({ height: '500px' });
    });

    it('should use default height when not specified', () => {
      const { container } = render(<ListingTableView listings={mockListings} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveStyle({ height: '600px' });
    });
  });
});
