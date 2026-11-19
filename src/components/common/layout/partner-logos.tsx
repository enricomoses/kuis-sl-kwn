import Image from 'next/image';
import { Fragment } from 'react';
import { PARTNER_INSTITUTIONS } from '@/constants/app.constant';
import { cn } from '@/utils';

interface PartnerLogosProps {
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    groupGap: 'gap-2.5',
    dividerHeight: 'h-6',
    linkModifier: 'partner-logo-link--sm',
    circleSizes: '36px',
    wideSizes: '92px',
    circleClass: 'h-9 w-9 rounded-full',
    wideClass: 'h-9 w-auto',
  },
  md: {
    groupGap: 'gap-4',
    dividerHeight: 'h-7',
    linkModifier: '',
    circleSizes: '44px',
    wideSizes: '112px',
    circleClass: 'h-10 w-10 rounded-full sm:h-11 sm:w-11',
    wideClass: 'h-10 w-auto sm:h-11',
  },
} as const;

export function PartnerLogos({ size = 'md', className }: PartnerLogosProps) {
  const cfg = SIZE_CONFIG[size];

  return (
    <div
      role="group"
      aria-label="Institusi penyelenggara"
      className={cn(
        'flex flex-wrap items-center justify-center',
        cfg.groupGap,
        className,
      )}
    >
      {PARTNER_INSTITUTIONS.map((partner, index) => (
        <Fragment key={partner.id}>
          {index > 0 ? (
            <span
              aria-hidden="true"
              className={cn(
                'w-px shrink-0 bg-[var(--color-navy-faint)]',
                cfg.dividerHeight,
              )}
            />
          ) : null}

          <a
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Kunjungi situs web ${partner.name}`}
            className={cn('partner-logo-link', cfg.linkModifier)}
          >
            <Image
              src={partner.logoSrc}
              alt={`Logo ${partner.name}`}
              width={partner.logoWidth}
              height={partner.logoHeight}
              sizes={partner.isCircular ? cfg.circleSizes : cfg.wideSizes}
              loading="eager"
              className={cn(
                'block object-contain',
                partner.isCircular ? cfg.circleClass : cfg.wideClass,
              )}
            />
            <span className="sr-only"> (buka di tab baru)</span>
          </a>
        </Fragment>
      ))}
    </div>
  );
}
