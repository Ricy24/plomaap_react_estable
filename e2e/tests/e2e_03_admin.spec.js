import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test.describe('E2E-03 flujo de administrador', () => {
  test.skip(!email || !password, 'Defina E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD')

  test('E2E-03 inicio de sesión de administrador y panel', async ({ page }) => {
    await page.goto('/admin')

    await page.locator('input[name="email"]').fill(email)
    await page.locator('input[name="password"]').fill(password)
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/admin\/panel$/)
    await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Usuarios' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Citas' })).toBeVisible()
  })
})
