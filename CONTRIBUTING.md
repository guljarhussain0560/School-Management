# Contributing to School Management System

Thank you for your interest in contributing! This document outlines our development process, standards, and workflow.

---

## 🛠️ Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/guljarhussain0560/School-Management.git
   cd School-Management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Update .env with local database credentials
   ```

4. **Initialize database**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

---

## 📐 Code Style & Conventions

- **TypeScript**: Strict typing required. Avoid `any` types wherever possible.
- **Component Architecture**: Keep components under 400 LOC. Extract state logic into custom hooks (`hooks/` or component-level `hooks/`) and modular subcomponents.
- **Validation**: All API routes must validate input with [Zod](https://zod.dev/) schemas under `lib/validation/`.
- **Logging**: Use `logger` from `lib/logger.ts` instead of `console.log` or `console.error`.
- **Error Handling**: Use `withApiHandler` or standard `apiSuccess` / `apiError` response utilities from `lib/api-handler.ts`.

---

## 🧪 Testing Standards

Every bug fix or new feature must include accompanying automated tests:
- **Component tests**: Place in `__tests__` alongside the component. Test rendering, user interactions, and state updates.
- **API tests**: Place under `app/api/**/__tests__/route.test.ts`. Mock Prisma queries and authentication sessions.
- **Unit tests**: Place under `lib/**/__tests__/*.test.ts`.

Before submitting a Pull Request, verify that all checks pass:
```bash
npm run validate
```

---

## 🔄 Pull Request Workflow

1. Create a feature branch: `git checkout -b feat/your-feature-name` or `fix/issue-description`
2. Make small, focused commits adhering to [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add student report card generation`
   - `fix: resolve fee calculation rounding issue`
   - `test: cover markAllPresent in AttendanceManagement`
   - `refactor: extract useFeeCollection hook`
3. Push to your branch and open a Pull Request.
4. Ensure all CI checks (Lint, Typecheck, Test, Audit, Build) pass green.
