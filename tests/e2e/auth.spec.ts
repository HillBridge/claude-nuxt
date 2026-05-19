import { test, expect } from '@playwright/test'

test.describe('登录流程', () => {
  test('正确的账号密码应成功登录并跳转到 dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', '123456')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('仪表盘')).toBeVisible()
  })

  test('错误密码应显示错误提示', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.getByText('邮箱或密码错误')).toBeVisible()
  })

  test('未登录访问受保护页面应跳转到登录页', async ({ page }) => {
    await page.goto('/dashboard/users')
    await expect(page).toHaveURL(/\/login/)
  })
})
