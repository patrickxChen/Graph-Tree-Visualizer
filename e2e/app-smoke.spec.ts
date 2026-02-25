import { expect, test } from '@playwright/test'

test('loads AlgoLize UI with template and preset selectors', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'AlgoLize' })).toBeVisible()
  await expect(page.getByText('Algorithm Editor')).toBeVisible()
  await expect(page.getByText('Interactive Graph/Tree Canvas')).toBeVisible()

  await expect(page.getByLabel('Template')).toBeVisible()
  await expect(page.getByLabel('Preset')).toBeVisible()

  await page.getByLabel('Template').selectOption('bfs')
  await expect(page.getByLabel('Template')).toHaveValue('bfs')

  await page.getByLabel('Preset').selectOption('tree-balanced')
  await expect(page.getByLabel('Preset')).toHaveValue('tree-balanced')

  await expect(page.getByRole('button', { name: 'Execute' })).toBeVisible()
})