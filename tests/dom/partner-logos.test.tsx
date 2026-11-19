import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PartnerLogos } from '@/components/common/layout/partner-logos';

describe('PartnerLogos', () => {
  it('renders clickable SMP Petra 3 and Petra Christian University logos with secure external links', () => {
    render(<PartnerLogos />);

    const smpLink = screen.getByRole('link', {
      name: /Logo SMP Kristen Petra 3 Surabaya/i,
    });
    expect(smpLink).toHaveAttribute('href', 'https://smp3.pppkpetra.sch.id/');
    expect(smpLink).toHaveAttribute('target', '_blank');
    expect(smpLink).toHaveAttribute('rel', 'noopener noreferrer');

    const ukpLink = screen.getByRole('link', {
      name: /Logo Petra Christian University/i,
    });
    expect(ukpLink).toHaveAttribute('href', 'https://petra.ac.id/');
    expect(ukpLink).toHaveAttribute('target', '_blank');
    expect(ukpLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
