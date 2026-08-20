import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/**/*.ts',
        'components/admin/admissions/**/*.ts',
        'components/admin/employee/**/*.ts',
        'components/operations/**/*.ts',
        'components/academic/curriculum/**/*.ts'
      ],
      exclude: [
        'node_modules/',
        '.next/',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'lib/prisma.ts',
        'lib/email.ts',
        'lib/excel-utils.ts',
        'lib/pdf-receipt.ts',
        'lib/salary-slip-pdf.ts',
        'lib/auth.ts'
      ],
      thresholds: {
        lines: 60,
        statements: 60,
        branches: 60,
        functions: 60,
      }
    },
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
