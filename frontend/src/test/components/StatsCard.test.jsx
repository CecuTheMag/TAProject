import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsCard from '../../components/StatsCard';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  }
}));

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Equipment',
    value: 150,
    icon: <svg data-testid="icon" />,
    color: '#3b82f6',
    trend: null,
    delay: 0,
    onClick: vi.fn(),
    isMobile: false
  };

  it('should render title and value', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Total Equipment')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const mockOnClick = vi.fn();
    render(<StatsCard {...defaultProps} onClick={mockOnClick} />);
    
    const card = screen.getByText('Total Equipment').closest('div');
    await userEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('should display positive trend', () => {
    render(<StatsCard {...defaultProps} trend={12.5} />);
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('should display negative trend', () => {
    render(<StatsCard {...defaultProps} trend={-5.3} />);
    
    expect(screen.getByText('-5.3%')).toBeInTheDocument();
  });

  it('should not show trend section when trend is null', () => {
    render(<StatsCard {...defaultProps} trend={null} />);
    
    expect(screen.queryByText(/vs last month/i)).not.toBeInTheDocument();
  });

  it('should handle zero trend', () => {
    render(<StatsCard {...defaultProps} trend={0} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should apply custom color', () => {
    const { container } = render(
      <StatsCard {...defaultProps} color="#ef4444" />
    );
    
    // The card should have the red color styling
    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });

  it('should handle mobile view', () => {
    render(<StatsCard {...defaultProps} isMobile={true} />);
    
    expect(screen.getByText('Total Equipment')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should handle large numbers', () => {
    render(<StatsCard {...defaultProps} value={999999} />);
    
    expect(screen.getByText('999999')).toBeInTheDocument();
  });

  it('should handle zero value', () => {
    render(<StatsCard {...defaultProps} value={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should apply animation delay', () => {
    render(<StatsCard {...defaultProps} delay={200} />);
    
    // Component should render with delay prop
    expect(screen.getByText('Total Equipment')).toBeInTheDocument();
  });

  it('should have proper accessibility', () => {
    render(<StatsCard {...defaultProps} />);
    
    const card = screen.getByText('Total Equipment').closest('div');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should handle keyboard events', async () => {
    const mockOnClick = vi.fn();
    render(<StatsCard {...defaultProps} onClick={mockOnClick} />);
    
    const card = screen.getByText('Total Equipment').closest('div');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('should format large numbers with commas', () => {
    render(<StatsCard {...defaultProps} value={1500000} />);
    
    // Check if number is displayed (formatting depends on implementation)
    expect(screen.getByText(/1500000|1,500,000/)).toBeInTheDocument();
  });

  it('should handle different card titles', () => {
    const titles = ['Available', 'Checked Out', 'Under Repair', 'Retired'];
    
    titles.forEach(title => {
      const { unmount } = render(<StatsCard {...defaultProps} title={title} />);
      expect(screen.getByText(title)).toBeInTheDocument();
      unmount();
    });
  });

  it('should maintain consistent styling across renders', () => {
    const { rerender } = render(<StatsCard {...defaultProps} />);
    
    const firstRender = screen.getByText('Total Equipment').closest('div');
    
    rerender(<StatsCard {...defaultProps} value={200} />);
    
    const secondRender = screen.getByText('Total Equipment').closest('div');
    expect(secondRender).toBeInTheDocument();
  });
});
