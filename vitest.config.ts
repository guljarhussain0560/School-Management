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
        'components/admin/hooks/**/*.ts',
        'components/operations/**/*.ts',
        'components/academic/curriculum/**/*.ts',
        'components/academic/hooks/**/*.ts',
        'components/financial/hooks/**/*.ts',
        'components/transport/hooks/**/*.ts',
        'components/student/hooks/**/*.ts',
        'components/school/hooks/**/*.ts',
        'components/views/hooks/**/*.ts'
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
        'lib/pdf-receipt.ts',
        'lib/salary-slip-pdf.ts',
        'lib/auth.ts'
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 60,
        functions: 50,
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
