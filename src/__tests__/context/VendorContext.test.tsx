import { render, screen, act } from '@testing-library/react';
import { VendorProvider, useVendors } from '@/context/VendorContext';
import { AuthProvider } from '@/context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child component to test the context
const TestComponent = () => {
  const { vendors, loading, fetchVendors, getVendor } = useVendors();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="vendors-count">{vendors.length}</div>
      <button 
        onClick={() => fetchVendors()}
      >
        Fetch Vendors
      </button>
      <button 
        onClick={() => getVendor('test-vendor-id')}
      >
        Get Vendor
      </button>
    </div>
  );
};

describe('VendorContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide vendor context', () => {
    render(
      <AuthProvider>
        <VendorProvider>
          <TestComponent />
        </VendorProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should fetch vendors', async () => {
    const mockVendors = [
      { id: '1', name: 'Vendor 1', type: 'catering' },
      { id: '2', name: 'Vendor 2', type: 'venue' }
    ];
    
    const mockGetDocs = vi.fn().mockResolvedValue({
      docs: mockVendors.map(vendor => ({
        id: vendor.id,
        data: () => vendor
      }))
    });
    
    vi.mocked(getDocs).mockImplementation(mockGetDocs);

    render(
      <AuthProvider>
        <VendorProvider>
          <TestComponent />
        </VendorProvider>
      </AuthProvider>
    );

    const fetchButton = screen.getByText('Fetch Vendors');
    await act(async () => {
      fetchButton.click();
    });

    expect(mockGetDocs).toHaveBeenCalled();
    expect(screen.getByTestId('vendors-count')).toHaveTextContent('2');
  });

  it('should get single vendor', async () => {
    const mockVendor = {
      id: 'test-vendor-id',
      name: 'Test Vendor',
      type: 'catering'
    };
    
    const mockGetDoc = vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => mockVendor
    });
    
    vi.mocked(getDoc).mockImplementation(mockGetDoc);

    render(
      <AuthProvider>
        <VendorProvider>
          <TestComponent />
        </VendorProvider>
      </AuthProvider>
    );

    const getVendorButton = screen.getByText('Get Vendor');
    await act(async () => {
      getVendorButton.click();
    });

    expect(mockGetDoc).toHaveBeenCalled();
  });
}); 