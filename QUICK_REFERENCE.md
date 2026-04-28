# Quick Reference Guide - Code Audit

**Keep this handy during implementation. Reference the detailed documents for full explanations.**

---

## 📋 Critical Issues Checklist

### Week 1 Tasks (Critical Fixes)

- [ ] **Issue #1: Connection Management**
  - Files: `server/db/connectionManager.cjs` (new), `server/db/index.cjs` (update)
  - Key: Create ConnectionManager class with proper pooling
  - Status: _____

- [ ] **Issue #2: Retry Logic**
  - Files: `server/db/retry.cjs` (new), `server/dal.cjs` (update)
  - Key: `withRetry()` wrapper with exponential backoff
  - Status: _____

- [ ] **Issue #3: Logging**
  - Files: `server/logging/logger.cjs` (new)
  - Key: Structured JSON logging with timestamps
  - Status: _____

- [ ] **Issue #4: Health Check**
  - Files: `server/db/healthCheck.cjs` (new), `server/server.cjs` (update)
  - Key: Add `/api/health/detailed` endpoint
  - Status: _____

- [ ] **Issue #5: Error Handling**
  - Files: `server/errors/AppError.cjs` (new), `server/errors/errorHandler.cjs` (new)
  - Key: Custom error classes and error middleware
  - Status: _____

- [ ] **Issue #6: Password Hashing**
  - Files: `server/server.cjs` (update registration endpoint)
  - Key: Change from SHA256 to bcrypt (10 rounds)
  - Status: _____

---

## 🔧 Implementation Workflow

### Phase 1 (Week 1) - 35 hours
```
Day 1-2: Connection Management
  - Create connectionManager.cjs
  - Create healthCheck.cjs
  - Update db/index.cjs
  - Add health endpoints

Day 3-4: Retry Logic & Error Handling
  - Create retry.cjs
  - Create error classes
  - Create error handler middleware
  - Update dal.cjs for retry wrappers

Day 5: Security & Logging
  - Fix password hashing in registration
  - Create structured logger
  - Add request logging middleware
```

### Phase 2 (Week 2) - 25 hours
```
Day 1-2: Comprehensive Logging
  - Structured logger with levels
  - Query logging
  - Request/response logging

Day 3-4: Metrics & Monitoring
  - Connection pool metrics
  - Query performance tracking
  - Add metrics endpoint

Day 5: Dashboard
  - Create health status page
  - Visualize connection pool
  - Track recent errors
```

### Phase 3 (Week 3) - 30 hours
```
Day 1-2: Unit Tests
  - Connection tests
  - Retry logic tests
  - Error handling tests

Day 3-4: Integration Tests
  - Auth flow tests
  - Webhook tests
  - Transaction tests

Day 5: Load Tests
  - Connection pool stress test
  - Concurrent user simulation
  - Memory leak detection
```

### Phase 4 (Week 4) - 20 hours
```
Day 1-2: Query Optimization
  - Optimize dashboard stats
  - Add missing indexes
  - Implement pagination

Day 3-4: Input Validation
  - Create validation middleware
  - Add rules per endpoint
  - Email & length validation

Day 5: Documentation
  - Troubleshooting guide
  - Monitoring dashboard guide
  - Update deployment procedures
```

### Phase 5 (Week 5) - 15 hours
```
Day 1-2: Transaction Support
  - Create transaction wrapper
  - Update invoice + subscription operations
  - Test rollback scenarios

Day 3-4: Socket.IO Improvements
  - Add DB connectivity checks to heartbeat
  - Implement reconnection backoff
  - Add socket event logging

Day 5: Disaster Recovery
  - Document backup strategy
  - Create recovery procedures
  - Test recovery with dummy data
```

---

## 🚀 Key Commands

### Before Starting
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Create new branch
git checkout -b feature/database-remediation

# Install any new dependencies
npm install
```

### During Development
```bash
# Run specific test file
npm test -- server/__tests__/db/connection.test.js

# Run with watch
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Start server
npm run dev

# Check health
curl http://localhost:3001/api/health

# Check detailed metrics
curl http://localhost:3001/api/health/detailed
```

### Before Merging
```bash
# Run full test suite
npm test

# Run load tests
npm test -- load/

# Generate coverage report
npm test -- --coverage --coverage.reporter=html

# Check code quality
npm run lint
```

### Deployment
```bash
# Stage test
git push origin feature/database-remediation

# Create pull request
# Wait for CI/CD tests to pass

# Merge to main
# Deploy to staging
# Run smoke tests
# Deploy to production
# Monitor health check
```

---

## 📊 Success Criteria

### Phase 1 (Week 1)
- [x] All new modules initialize without errors
- [x] Health check endpoint returns proper status
- [x] Connection manager metrics accessible
- [x] Retry logic handles transient errors
- [x] Error types properly thrown and caught
- [x] Password hashing uses bcrypt

**Must Pass:** 1000-query stress test with 0 pool exhaustion errors

### Phase 2 (Week 2)
- [x] All database operations logged with timestamps
- [x] Query execution times tracked
- [x] Connection pool status visible
- [x] Error rate tracking working
- [x] Health metrics endpoint responds in <500ms

**Must Pass:** Logger handles 1000 messages/second without errors

### Phase 3 (Week 3)
- [x] Unit test coverage >90% for DB layer
- [x] Integration tests all passing
- [x] Load test: 1000 concurrent queries complete in <30s
- [x] P95 query time <200ms
- [x] No memory leaks detected

**Must Pass:** All test suites with >85% coverage

### Phase 4 (Week 4)
- [x] Dashboard stats query <500ms
- [x] No N+1 query patterns detected
- [x] Input validation working on all endpoints
- [x] Documentation complete and accurate

**Must Pass:** Documentation review by team

### Phase 5 (Week 5)
- [x] Transactions atomic (all-or-nothing)
- [x] Socket connections stable under load
- [x] Backup/restore process tested
- [x] Recovery procedures documented

**Must Pass:** Recovery test in <5 minutes

---

## 🔍 Monitoring Endpoints

After implementation, use these endpoints to monitor:

```bash
# Basic health check
GET /api/health
# Returns: { healthy: true/false, checks: {...}, metrics: {...} }

# Detailed health information
GET /api/health/detailed
# Returns: All checks with durations and diagnostics

# Metrics and monitoring
GET /api/health/metrics
# Returns: Connection pool stats, memory, CPU, uptime

# Check database connectivity
curl http://localhost:3001/api/health/detailed | jq '.checks'
```

---

## ⚠️ Common Issues & Fixes

### Connection Pool Exhaustion
**Symptom:** "No connections available" error  
**Fix:** Check pool config in `connectionManager.cjs`
```javascript
max: 50, // Increase if needed
idleTimeoutMillis: 60000, // Adjust idle timeout
connectionTimeoutMillis: 5000, // Reduce wait time
```

### Retry Loop Timeout
**Symptom:** Requests hanging for 30+ seconds  
**Fix:** Check timeout settings
```javascript
statement_timeout: 30000, // 30 seconds
query_timeout: 30000, // 30 seconds
connectionTimeoutMillis: 5000, // 5 seconds
```

### Memory Leak in Tests
**Symptom:** Test suite slows down or crashes  
**Fix:** Ensure pool shutdown in afterAll
```javascript
afterAll(async () => {
  if (connectionManager) {
    await connectionManager.shutdown();
  }
});
```

### Logger Performance Impact
**Symptom:** Application slower with logging  
**Fix:** Use async logging and adjust level
```javascript
// Use higher level in production
const logger = new StructuredLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
});
```

### Test Timeout
**Symptom:** Tests timeout after 10 seconds  
**Fix:** Increase timeout in vitest.config.js
```javascript
export default defineConfig({
  test: {
    testTimeout: 30000, // 30 seconds
  },
});
```

---

## 📝 File Locations Reference

### Core Database
- `server/db/index.cjs` - Main export (UPDATE)
- `server/db/schema.cjs` - Table definitions (READ-ONLY)
- `server/db/migrate.cjs` - Migration runner (UPDATE)
- `server/db/connectionManager.cjs` - Connection pooling (NEW)
- `server/db/healthCheck.cjs` - Health checking (NEW)
- `server/db/retry.cjs` - Retry logic (NEW)
- `server/db/transactions.cjs` - Transaction support (NEW in Phase 5)

### Logging & Monitoring
- `server/logging/logger.cjs` - Structured logger (NEW)
- `server/logging/queryLogger.cjs` - Query logging (NEW)
- `server/routes/health.cjs` - Health endpoints (NEW)
- `server/metrics/metrics.cjs` - Metrics tracking (NEW)

### Error Handling
- `server/errors/AppError.cjs` - Error base class (NEW)
- `server/errors/errorHandler.cjs` - Error middleware (NEW)
- `server/errors/errorCodes.cjs` - Error code definitions (NEW)

### Data Access
- `server/dal.cjs` - Data access layer (UPDATE)

### Server & Routing
- `server/server.cjs` - Express app (UPDATE)
- `api/index.js` - Vercel serverless entry (UPDATE)

### Testing
- `server/__tests__/db/connection.test.js` (NEW)
- `server/__tests__/db/retry.test.js` (NEW)
- `server/__tests__/integration/auth.test.js` (NEW)
- `server/__tests__/load/connectionPool.test.js` (NEW)

---

## 🎯 Priority Order

### If Time is Limited, Implement In This Order:
1. **ConnectionManager** (Issue #1) - Most critical
2. **Retry Logic** (Issue #2) - Enables reliability
3. **Error Handling** (Issue #5) - Prevents silent failures
4. **Health Check** (Issue #4) - Enables monitoring
5. **Password Hashing** (Issue #8) - Security fix
6. **Structured Logging** (Issue #3) - Enables troubleshooting
7. **Connection Pool Optimization** (Issue #6) - Performance
8. **Tests** (Phase 3) - Validates everything
9. **Remaining issues** - Nice to have

---

## 📞 Quick Help Reference

**Q: How to test retry logic?**  
A: See TESTING_GUIDE.md, Section: Retry Logic Tests

**Q: Where to add new endpoints?**  
A: Add to `server/server.cjs`, add tests in `server/__tests__/integration/`

**Q: How to check current pool status?**  
A: Call `GET /api/health/metrics` after Phase 2

**Q: What if migration fails?**  
A: See IMPLEMENTATION_GUIDE.md Troubleshooting section

**Q: How to revert to production backup?**  
A: `psql $DATABASE_URL < backup.sql` (have IT validate first)

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All Phase 1 tests passing
- [ ] Health check endpoint working
- [ ] Connection pool metrics accessible
- [ ] Retry logic tested with 50+ concurrent requests
- [ ] Password hashing changed to bcrypt
- [ ] Error handler middleware active
- [ ] Structured logging working
- [ ] Load test: 500 concurrent queries, P95 <200ms
- [ ] No errors in test output (npm test)
- [ ] Code review completed by 2 team members
- [ ] Backup of production database created and tested
- [ ] Rollback plan documented and validated
- [ ] Team trained on new error codes
- [ ] Monitoring dashboard prepared
- [ ] Support team briefed on changes
- [ ] Deployment window scheduled during low traffic

---

## 📚 Related Documents

| Document | Purpose | Read Time |
|----------|---------|-----------|
| CODE_AUDIT_REPORT.md | Full technical audit with issues | 45 min |
| IMPLEMENTATION_GUIDE.md | Step-by-step code implementation | 60 min |
| TESTING_GUIDE.md | Complete test suite creation | 40 min |
| AUDIT_EXECUTIVE_SUMMARY.md | High-level overview and timeline | 15 min |
| QUICK_REFERENCE.md | This document - quick lookup | 10 min |

---

**Last Updated:** April 28, 2026  
**Status:** Ready for Implementation  
**Contact:** Your Development Lead
