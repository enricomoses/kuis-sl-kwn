interface PartnerInstitution {
  readonly id: string;
  readonly name: string;
  readonly href: string;
  readonly logoSrc: string;
  readonly logoWidth: number;
  readonly logoHeight: number;
  readonly isCircular: boolean;
}

export const PARTNER_INSTITUTIONS: readonly PartnerInstitution[] = [
  {
    id: 'smp-petra-3',
    name: 'SMP Kristen Petra 3 Surabaya',
    href: 'https://smp3.pppkpetra.sch.id/',
    logoSrc: '/images/logo-smp-petra.png',
    logoWidth: 345,
    logoHeight: 346,
    isCircular: true,
  },
  {
    id: 'uk-petra',
    name: 'Petra Christian University',
    href: 'https://petra.ac.id/',
    logoSrc: '/images/logo-ukp.png',
    logoWidth: 539,
    logoHeight: 215,
    isCircular: false,
  },
] as const;

export const APP_INFO = {
  TITLE: 'Kuis Keberagaman & Antiintoleransi',
  SUBTITLE_1: 'SMP Kristen Petra 3 Surabaya',
  SUBTITLE_2: 'Petra Christian University',
  DESCRIPTION:
    'Kuis kelas realtime tentang keberagaman dan antiintoleransi untuk SMP Kristen Petra 3 Surabaya bersama Petra Christian University.',
  DEFAULT_LOCAL_URL: 'http://localhost:3000',
} as const;
