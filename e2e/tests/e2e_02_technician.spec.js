import { expect, test } from '@playwright/test'

const email = process.env.E2E_TECHNICIAN_EMAIL
const password = process.env.E2E_TECHNICIAN_PASSWORD

test.describe('E2E-02 flujo de técnico', () => {
  test.skip(!email || !password, 'Defina E2E_TECHNICIAN_EMAIL y E2E_TECHNICIAN_PASSWORD')

  test('E2E-02 inicio de sesión de técnico y agenda', async ({ page }) => {
    await page.goto('/ingresar/tecnico')

    await page.getByTestId('auth-email').fill(email)
    await page.getByTestId('auth-password').fill(password)
    await page.getByTestId('auth-submit').click()

    await expect(page).toHaveURL(/\/tecnico$/)
    await expect(page.getByTestId('technician-dashboard')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Hola,/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mis citas' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mi horario semanal' })).toBeVisible()
  })
})
