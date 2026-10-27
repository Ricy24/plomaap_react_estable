import { expect, test } from '@playwright/test'

const email = process.env.E2E_CLIENT_EMAIL
const password = process.env.E2E_CLIENT_PASSWORD

test.describe('E2E-01 flujo de cliente', () => {
  test.skip(!email || !password, 'Defina E2E_CLIENT_EMAIL y E2E_CLIENT_PASSWORD')

  test('E2E-01 inicio de sesión de cliente y dashboard', async ({ page }) => {
    await page.goto('/ingresar/cliente')

    await page.getByTestId('auth-email').fill(email)
    await page.getByTestId('auth-password').fill(password)
    await page.getByTestId('auth-submit').click()

    await expect(page).toHaveURL(/\/cliente$/)
    await expect(page.getByTestId('client-dashboard')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Hola,/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Agendar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mis citas' })).toBeVisible()
  })
})
