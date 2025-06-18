// components/logo.test.tsx
import { render, screen } from '@testing-library/react';

import { Logo } from './logo';

describe('Logo', () => {
  it('renders the logo with correct alt text', () => {
    render(<Logo />);
    const logoElement = screen.getByText('Terse');
    const cmsElement = screen.getByText('CMS');
    expect(logoElement).toBeInTheDocument();
    expect(cmsElement).toBeInTheDocument();
  });
});
