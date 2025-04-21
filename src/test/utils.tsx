import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { VendorProvider } from '@/context/VendorContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function render(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <EventProvider>
              <VendorProvider>
                <BrowserRouter>
                  {children}
                </BrowserRouter>
              </VendorProvider>
            </EventProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render }; 