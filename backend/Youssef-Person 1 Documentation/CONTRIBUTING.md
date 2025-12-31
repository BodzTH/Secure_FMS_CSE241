# Contributing to Security Information System

## Team Members

### Person 1: User Management & Authentication ✅
- Status: Completed
- Responsible for: Authentication, JWT, User Management

### Person 2: File Upload & Storage
- Status: In Progress
- Responsible for: File upload, AES-256 encryption, Hash generation

### Person 3: File Download & Access Control
- Status: Pending
- Responsible for: File download, Access control, Integrity verification

---

## Getting Started

1. Clone the repository
2. Follow instructions in `SETUP.md`
3. Read your specific task section in `README.md`
4. Use the provided `authMiddleware` for authentication

---

## Code Standards

### General Rules:
- Write clean, readable code
- Add comments for complex logic
- Follow existing code structure
- Test your code before committing

### API Endpoints:
- Use RESTful conventions
- Return proper HTTP status codes
- Include error handling
- Validate all inputs

### Security:
- Never commit `.env` file
- Use parameterized queries
- Validate and sanitize inputs
- Use the provided authentication middleware

---

## Git Workflow

### Branch Naming:
- `person-2/file-upload` - For Person 2
- `person-3/file-download` - For Person 3
- `bugfix/description` - For bug fixes
- `feature/description` - For new features

### Commit Messages:
```
feat: Add file upload endpoint
fix: Fix token validation issue
docs: Update API documentation
```

---

## Testing

Before committing:
1. Test your endpoints using Thunder Client
2. Verify database changes
3. Check for errors in console
4. Test edge cases

---

## Need Help?

- Check `README.md` for full documentation
- Check `API-DOCS.md` for API details
- Check `SETUP.md` for setup issues
- Review existing code for examples

---

## Authentication Usage

All protected routes should use the middleware:

```javascript
const authMiddleware = require('./middleware/authMiddleware');

router.post('/your-route', authMiddleware, yourController);

// Access user info in controller:
const userId = req.user.userId;
```

---

**Happy Coding! 🚀**
