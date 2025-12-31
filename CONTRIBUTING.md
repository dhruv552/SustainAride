# Contributing to SustainAride

First off, thank you for considering contributing to SustainAride! 🌱

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear title**
- **Provide detailed description**
- **Explain why this would be useful**
- **Include mockups** (if applicable)

### 🔧 Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/SustainAride.git
cd SustainAride

# Install dependencies
npm install

# Setup environment
cp .env.example server/config.env
# Edit server/config.env with your credentials

# Start development servers
npm run dev:all
```

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for frontend code
- Use ESLint configuration provided
- Follow functional programming principles
- Add JSDoc comments for functions

### Naming Conventions
- **Components**: PascalCase (e.g., `RideBooking.tsx`)
- **Functions**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Files**: kebab-case for utilities (e.g., `api-client.ts`)

### Code Style
```typescript
// ✅ Good
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    throw error;
  }
};

// ❌ Bad
async function fetchUserData(userId) {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
}
```

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

Examples:
```bash
feat: Add real-time ride tracking
fix: Resolve coupon validation bug
docs: Update API documentation
refactor: Improve database connection handling
```

## Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- RideBooking.test.tsx

# Run with coverage
npm run test:coverage
```

### Writing Tests
```typescript
describe('CouponService', () => {
  it('should validate active coupon', async () => {
    const result = await validateCoupon('GreenStart10', userId);
    expect(result.isValid).toBe(true);
  });

  it('should reject expired coupon', async () => {
    const result = await validateCoupon('EXPIRED', userId);
    expect(result.isValid).toBe(false);
  });
});
```

## Documentation

- Update README.md for new features
- Add JSDoc comments for public functions
- Update API documentation in README
- Include screenshots for UI changes

## Project Structure

```
src/
├── components/     # React components
├── api/           # API service layer
├── contexts/      # React contexts
├── lib/           # Utility functions
├── types/         # TypeScript types
└── stories/       # Storybook stories

server/
├── controllers/   # Request handlers
├── models/        # Database models
├── routes/        # API routes
├── middlewares/   # Express middlewares
└── utils/         # Helper functions
```

## Adding New Features

### Backend API Endpoint
1. Create controller in `server/controllers/`
2. Define route in `server/routes/`
3. Add validation middleware
4. Update API documentation

### Frontend Component
1. Create component in `src/components/`
2. Add TypeScript types
3. Create Storybook story
4. Integrate with API service

## Review Process

All submissions require review. We look for:

- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation updates
- ✅ No breaking changes
- ✅ Performance considerations

## Need Help?

- 📖 Read the [README.md](./README.md)
- 🔒 Check [SECURITY.md](./SECURITY.md)
- 🚀 Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- 💬 Open a GitHub Discussion
- 📧 Email: dhruvagrawal013@example.com

## Recognition

Contributors will be added to the README.md contributors section.

---

Thank you for contributing to a greener future! 🌍💚
