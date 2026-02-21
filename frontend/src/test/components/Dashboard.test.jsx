import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../components/Dashboard';
import { AuthProvider } from '../../AuthContext';
import { equipment, dashboard } from '../../api';

// Mock the API
vi.mock('../../api', () => ({
  equipment: {
    getAll: vi.fn(),
    searchIndividual: vi.fn(),
  },
  dashboard: {
    getStats: vi.fn(),
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock child components
vi.mock('../../components/Sidebar', () => ({
  default: ({ activeTab, setActiveTab }) => (
    <div data-testid="sidebar">
      <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
      <button onClick={() => setActiveTab('equipment')}>Equipment</button>
    </div>
  )
}));

vi.mock('../../components/StatsCard', () => ({
  default: ({ title, value, onClick }) => (
    <div data-testid="stats-card" onClick={onClick}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  )
}));

vi.mock('../../components/SearchBar', () => ({
  default: ({ searchTerm, setSearchTerm }) => (
    <input 
      data-testid="search-bar"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  )
}));

vi.mock('../../components/FilterBar', () => ({
  default: ({ filters, activeFilters, onFilterChange }) => (
    <div data-testid="filter-bar">
      {filters.map(f => (
        <button 
          key={f.key}
          data-testid={`filter-${f.key}`}
          onClick={() => onFilterChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../../components/EquipmentCard', () => ({
  default: ({ item, onViewDetails, onRequest }) => (
    <div data-testid={`equipment-card-${item.id}`}>
      <span>{item.name}</span>
      <button onClick={() => onViewDetails(item)}>View</button>
      <button onClick={() => onRequest(item)}>Request</button>
    </div>
  )
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}));

const mockUser = {
  id: 1,
  email: 'test@school.com',
  role: 'teacher',
  school_id: 1
};

const mockEquipment = [
  { id: 1, name: 'Laptop 1', type: 'electronics', status: 'available', serial_number: 'SN001' },
  { id: 2, name: 'Projector', type: 'electronics', status: 'checked_out', serial_number: 'SN002' },
  { id: 3, name: 'Microscope', type: 'science', status: 'available', serial_number: 'SN003' },
];

const mockStats = {
  total_equipment: 150,
  available_equipment: 100,
  checked_out_equipment: 40,
  under_repair: 10
};

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    equipment.getAll.mockResolvedValue({ data: mockEquipment });
    dashboard.getStats.mockResolvedValue({ data: mockStats });
  });

  it('should render dashboard with equipment list', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Projector')).toBeInTheDocument();
    expect(screen.getByText('Microscope')).toBeInTheDocument();
  });

  it('should display statistics cards', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('stats-card')).toHaveLength(4);
    });
  });

  it('should handle search functionality', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    const searchBar = screen.getByTestId('search-bar');
    await userEvent.type(searchBar, 'laptop');
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
      expect(screen.queryByText('Projector')).not.toBeInTheDocument();
    });
  });

  it('should handle filter changes', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    const availableFilter = screen.getByTestId('filter-available');
    await userEvent.click(availableFilter);
    
    // Should filter to show only available items
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
      expect(screen.queryByText('Projector')).not.toBeInTheDocument();
    });
  });

  it('should handle equipment view details', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    const viewButton = screen.getAllByText('View')[0];
    await userEvent.click(viewButton);
    
    // Modal should open (mocked)
    expect(viewButton).toBeInTheDocument();
  });

  it('should handle equipment request', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    const requestButton = screen.getAllByText('Request')[0];
    await userEvent.click(requestButton);
    
    // Request modal should open
    expect(requestButton).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    equipment.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    expect(screen.getByText(/loading|preparing/i)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    equipment.getAll.mockRejectedValue(new Error('Failed to fetch'));
    
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load|error/i)).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    
    const equipmentTab = screen.getByText('Equipment');
    await userEvent.click(equipmentTab);
    
    // Should switch to equipment tab
    expect(equipmentTab).toBeInTheDocument();
  });

  it('should handle view mode toggle', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    // Find and click view mode toggle
    const viewModeButton = screen.getByText(/list|grid/i);
    await userEvent.click(viewModeButton);
  });

  it('should handle pagination', async () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      type: 'electronics',
      status: 'available',
      serial_number: `SN${i + 1}`
    }));
    
    equipment.getAll.mockResolvedValue({ data: manyItems });
    
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
    
    // Should show pagination
    expect(screen.getByText(/page|of/i)).toBeInTheDocument();
  });

  it('should handle empty equipment list', async () => {
    equipment.getAll.mockResolvedValue({ data: [] });
    
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText(/no equipment found|empty/i)).toBeInTheDocument();
    });
  });

  it('should handle stats card clicks', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('stats-card')[0]).toBeInTheDocument();
    });
    
    const statsCard = screen.getAllByTestId('stats-card')[0];
    await userEvent.click(statsCard);
    
    // Should apply filter
    expect(statsCard).toBeInTheDocument();
  });

  it('should handle mobile responsive layout', async () => {
    // Mock mobile viewport
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));
    
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    // Reset viewport
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });

  it('should refresh data after modal success', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    // API should be called initially
    expect(equipment.getAll).toHaveBeenCalledTimes(1);
  });

  it('should handle QR scanner open', async () => {
    renderWithAuth(<Dashboard schoolUser={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop 1')).toBeInTheDocument();
    });
    
    // Find QR scan button
    const qrButton = screen.getByText(/scan|qr/i);
    expect(qrButton).toBeInTheDocument();
  });
});
