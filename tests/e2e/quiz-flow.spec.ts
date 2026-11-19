import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page'];

function scanAccessibility(page: Page) {
  return new AxeBuilder({ page: page as unknown as AxePage }).analyze();
}

test.describe('Kuis Keberagaman & Antiintoleransi E2E', () => {
  test('beranda menampilkan judul, logo institusi, input nama, dan lolos axe a11y', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: 'Kuis Keberagaman & Antiintoleransi',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Logo SMP Kristen Petra 3 Surabaya/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Logo Petra Christian University/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder('Masukkan namamu')).toBeVisible();

    const accessibilityScan = await scanAccessibility(page);
    expect(accessibilityScan.violations).toEqual([]);
  });

  test('halaman login admin lolos axe a11y', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(
      page.getByRole('heading', { name: 'Masuk sebagai Admin' }),
    ).toBeVisible();

    const accessibilityScan = await scanAccessibility(page);
    expect(accessibilityScan.violations).toEqual([]);
  });

  test('skenario penuh 1 admin + 3 pemain, refresh & offline recovery (membutuhkan env E2E admin)', async ({
    browser,
  }) => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL;
    const adminPassword = process.env.E2E_ADMIN_PASSWORD;
    test.skip(
      !adminEmail || !adminPassword,
      'Set E2E_ADMIN_EMAIL & E2E_ADMIN_PASSWORD untuk menjalankan E2E penuh dengan Supabase aktif.',
    );

    const adminContext = await browser.newContext();
    const p1Context = await browser.newContext();
    const p2Context = await browser.newContext();
    const p3Context = await browser.newContext();

    try {
      const adminPage = await adminContext.newPage();
      await adminPage.goto('/admin/login');
      await adminPage.getByLabel(/Email/i).fill(adminEmail ?? '');
      await adminPage.getByLabel(/Kata Sandi/i).fill(adminPassword ?? '');
      await adminPage.getByRole('button', { name: /Masuk/i }).click();
      await adminPage.waitForURL('**/admin');

      await adminPage.getByRole('button', { name: /Buat Sesi/i }).click();
      await expect(adminPage.getByText('RUANG TUNGGU AKTIF')).toBeVisible();

      const players = [
        { page: await p1Context.newPage(), name: 'Budi' },
        { page: await p2Context.newPage(), name: 'Sinta' },
        { page: await p3Context.newPage(), name: 'Raka' },
      ];

      for (const player of players) {
        await player.page.goto('/');
        await player.page.getByPlaceholder('Masukkan namamu').fill(player.name);
        await player.page.getByRole('button', { name: /Gabung/i }).click();
        await player.page.waitForURL('**/play');
      }

      await expect(adminPage.getByText('Daftar Pemain (3)')).toBeVisible();
      await adminPage.getByRole('button', { name: /Mulai Kuis/i }).click();

      // Tunggu countdown 3 detik selesai dan soal pertama aktif
      await expect(
        players[0].page.getByRole('group', { name: 'Pilihan jawaban' }),
      ).toBeVisible({ timeout: 10_000 });

      // Simulasikan refresh pemain 1 & offline/online pemain 2
      await players[0].page.reload();
      await expect(
        players[0].page.getByRole('group', { name: 'Pilihan jawaban' }),
      ).toBeVisible();

      await p2Context.setOffline(true);
      await p2Context.setOffline(false);

      // Semua pemain memilih jawaban
      for (const player of players) {
        const firstOption = player.page
          .getByRole('group', { name: 'Pilihan jawaban' })
          .getByRole('button')
          .first();
        await firstOption.click();
      }

      // Soal otomatis pindah ke fase reveal saat semua pemain sudah menjawab
      await expect(adminPage.getByText('Pembahasan (Reveal)')).toBeVisible({
        timeout: 10_000,
      });
    } finally {
      await adminContext.close();
      await p1Context.close();
      await p2Context.close();
      await p3Context.close();
    }
  });
});
