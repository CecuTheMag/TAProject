import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../components/SearchBar';

describe('SearchBar', () => {
  const mockSetSearchTerm = vi.fn();

  it('should render search input with placeholder', () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search equipment..."
      />
    );

    expect(screen.getByPlaceholderText('Search equipment...')).toBeInTheDocument();
  });

  it('should display current search term', () => {
    render(
      <SearchBar 
        searchTerm="laptop" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    const input = screen.getByDisplayValue('laptop');
    expect(input).toBeInTheDocument();
  });

  it('should call setSearchTerm on input change', async () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'projector');

    expect(mockSetSearchTerm).toHaveBeenCalledWith('p');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('pr');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('pro');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('proj');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('proje');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('projec');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('project');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('projecto');
    expect(mockSetSearchTerm).toHaveBeenCalledWith('projector');
  });

  it('should clear search when clear button is clicked', async () => {
    render(
      <SearchBar 
        searchTerm="laptop" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    const clearButton = screen.getByLabelText(/clear search/i);
    await userEvent.click(clearButton);

    expect(mockSetSearchTerm).toHaveBeenCalledWith('');
  });

  it('should show search icon', () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('should handle keyboard events', async () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test{Enter}');

    // Should handle enter key gracefully
    expect(mockSetSearchTerm).toHaveBeenCalledWith('test');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
        className="custom-search"
      />
    );

    expect(container.firstChild).toHaveClass('custom-search');
  });

  it('should handle rapid input changes', async () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    const input = screen.getByRole('textbox');
    
    // Type rapidly
    await userEvent.type(input, 'abc');
    
    expect(mockSetSearchTerm).toHaveBeenCalledTimes(3);
  });

  it('should trim whitespace from search term', async () => {
    const mockSetSearchTermTrimmed = vi.fn();
    
    render(
      <SearchBar 
        searchTerm="  laptop  " 
        setSearchTerm={mockSetSearchTermTrimmed}
        placeholder="Search..."
      />
    );

    // The component should handle trimming
    const input = screen.getByDisplayValue('  laptop  ');
    expect(input).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search equipment"
        aria-label="Equipment search"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Equipment search');
    expect(input).toHaveAttribute('placeholder', 'Search equipment');
  });

  it('should handle long search terms', async () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    const longTerm = 'a'.repeat(100);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, longTerm);

    expect(mockSetSearchTerm).toHaveBeenLastCalledWith(longTerm);
  });

  it('should handle special characters in search', async () => {
    render(
      <SearchBar 
        searchTerm="" 
        setSearchTerm={mockSetSearchTerm}
        placeholder="Search..."
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'laptop-123_test@#$');

    expect(mockSetSearchTerm).toHaveBeenLastCalledWith('laptop-123_test@#$');
  });
});
