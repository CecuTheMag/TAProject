import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EquipmentCard from '../../components/EquipmentCard';
import { I18nProvider } from '../../translations';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  }
}));

const mockItem = {
  id: 1,
  name: 'Test Laptop',
  type: 'electronics',
  serial_number: 'SN123456',
  status: 'available',
  condition: 'excellent',
  purchase_date: '2023-01-01',
  description: 'A test laptop for students',
  location: 'Room 101',
  documents: []
};

const renderWithI18n = (component) => {
  return render(
    <I18nProvider>
      {component}
    </I18nProvider>
  );
};

describe('EquipmentCard', () => {
  const mockOnViewDetails = vi.fn();
  const mockOnRequest = vi.fn();

  it('should render equipment information correctly', () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    expect(screen.getByText('Test Laptop')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('SN123456')).toBeInTheDocument();
    expect(screen.getByText('available')).toBeInTheDocument();
  });

  it('should show different status colors', () => {
    const checkedOutItem = { ...mockItem, status: 'checked_out' };
    const { rerender } = renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    // Check available status styling
    expect(screen.getByText('available')).toBeInTheDocument();

    rerender(
      <I18nProvider>
        <EquipmentCard
          item={checkedOutItem}
          onViewDetails={mockOnViewDetails}
          onRequest={mockOnRequest}
          user={{ role: 'student' }}
        />
      </I18nProvider>
    );

    expect(screen.getByText('checked_out')).toBeInTheDocument();
  });

  it('should call onViewDetails when view button is clicked', async () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    const viewButton = screen.getByText(/view details|view/i);
    await userEvent.click(viewButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockItem);
  });

  it('should show request button for available items', () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    expect(screen.getByText(/request/i)).toBeInTheDocument();
  });

  it('should not show request button for checked out items', () => {
    const checkedOutItem = { ...mockItem, status: 'checked_out' };
    renderWithI18n(
      <EquipmentCard
        item={checkedOutItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    expect(screen.queryByText(/request/i)).not.toBeInTheDocument();
  });

  it('should call onRequest when request button is clicked', async () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    const requestButton = screen.getByText(/request/i);
    await userEvent.click(requestButton);

    expect(mockOnRequest).toHaveBeenCalledWith(mockItem);
  });

  it('should show condition badge', () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    expect(screen.getByText('excellent')).toBeInTheDocument();
  });

  it('should handle mobile view', () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
        isMobile={true}
      />
    );

    expect(screen.getByText('Test Laptop')).toBeInTheDocument();
  });

  it('should display QR code if available', () => {
    const itemWithQR = { ...mockItem, qr_code: 'base64qrstring' };
    renderWithI18n(
      <EquipmentCard
        item={itemWithQR}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    const qrImage = screen.getByAltText(/qr code/i);
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', 'base64qrstring');
  });

  it('should show document count if documents exist', () => {
    const itemWithDocs = { 
      ...mockItem, 
      documents: [{ id: 1 }, { id: 2 }] 
    };
    renderWithI18n(
      <EquipmentCard
        item={itemWithDocs}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should handle different user roles', () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'admin' }}
      />
    );

    // Admin should see all buttons
    expect(screen.getByText(/view/i)).toBeInTheDocument();
    expect(screen.getByText(/request/i)).toBeInTheDocument();
  });

  it('should display location information', () => {
    renderWithI18n(
      <EquipmentCard
        item={mockItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    expect(screen.getByText('Room 101')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalItem = {
      id: 1,
      name: 'Minimal Item',
      type: 'other',
      serial_number: 'SN001',
      status: 'available'
    };
    
    renderWithI18n(
      <EquipmentCard
        item={minimalItem}
        onViewDetails={mockOnViewDetails}
        onRequest={mockOnRequest}
        user={{ role: 'student' }}
      />
    );

    expect(screen.getByText('Minimal Item')).toBeInTheDocument();
    expect(screen.getByText('SN001')).toBeInTheDocument();
  });
});
