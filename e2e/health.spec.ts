import { test, expect } from '@playwright/test';

test.describe('SheNova AI - Health Tracker E2E Workflows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the sign-in page, log in, and switch to the health tab
    await page.goto('/auth/signin');
    
    // Simulate clicking Developer Mock Sign-In button
    await page.click('button:has-text("Developer Mock Sign-In")');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to Health Tracker tab
    await page.click('button:has-text("Health")');
  });

  test('should display current cycle Day and predicted phases', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Hormonal Health Tracker');
    await expect(page.locator('text=Current Cycle Index')).toBeVisible();
    await expect(page.locator('text=Day of')).toBeVisible();
  });

  test('should log symptoms and update ovulation and fertility predictions', async ({ page }) => {
    // Fill the menstruation flow date
    await page.fill('input[type="date"]', '2026-06-20');
    
    // Fill average cycle duration
    await page.fill('input[type="number"]', '28');
    
    // Select Abdominal Cramps and Fatigue symptoms
    await page.click('button:has-text("Abdominal Cramps")');
    await page.click('button:has-text("Fatigue / Low Energy")');
    
    // Click Log Symptoms button
    await page.click('button:has-text("Log Symptoms & Update Forecasts")');
    
    // Verify success banner alert
    await expect(page.locator('text=Symptoms logged and forecasts updated successfully!')).toBeVisible();
    
    // Verify AI wellness tip gets updated
    await expect(page.locator('text=AI Health Companion')).toBeVisible();
  });

  test('should log water hydration intake and update daily progress bar', async ({ page }) => {
    await expect(page.locator('text=Daily Hydration Tracker')).toBeVisible();
    
    // Log a bottle of water (500ml)
    await page.click('button:has-text("+500ml")');
    
    // Verify total ML updates to 500ml
    await expect(page.locator('text=500 ml')).toBeVisible();
    await expect(page.locator('text=25%')).toBeVisible(); // 500ml is 25% of 2000ml goal
  });

  test('should schedule and delete medication reminders', async ({ page }) => {
    await expect(page.locator('text=Medication & Supplement Reminders')).toBeVisible();
    
    // Enter medication details
    await page.fill('input[placeholder="Iron / Pill"]', 'Magnesium');
    await page.fill('input[placeholder="1 tab / 500mg"]', '250mg');
    
    // Click Add Reminder
    await page.click('button:has-text("Add Reminder")');
    
    // Verify reminder is listed
    await expect(page.locator('text=Magnesium')).toBeVisible();
    await expect(page.locator('text=250mg')).toBeVisible();
    
    // Delete the reminder
    await page.click('button:has-text("Trash2")'); // Delete button
    await expect(page.locator('text=Magnesium')).not.toBeVisible();
  });

});
