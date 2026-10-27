import { expect, test } from '@playwright/test'

const email = process.env.E2E_CLIENT_EMAIL
const password = process.env.E2E_CLIENT_PASSWORD

test.describe('E2E-01 flujo de cliente', () => {
  test.skip(!email || !password, 'Defina E2E_CLIENT_EMAIL y E2E_CLIENT_PASSWORD')

  test('E2E-01 inicio de sesión de cliente y dashboard', async ({ page }) => {
    await page.goto('/ingresar/cliente')

    await page.locator('input[name="email"]').fill(email)
    await page.locator('input[name="password"]').fill(password)
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/cliente$/)
    await expect(page.getByRole('heading', { name: /Hola,/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Agendar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mis citas' })).toBeVisible()
  })
})
