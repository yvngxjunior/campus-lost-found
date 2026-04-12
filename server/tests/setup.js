// Global setup — runs once before all test suites
const { execSync } = require('child_process');

module.exports = async () => {
  // Point to the test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://user:password@localhost:5432/campus_lost_found_test';
  process.env.JWT_SECRET   = 'test_jwt_secret_do_not_use_in_prod';
  process.env.NODE_ENV     = 'test';
  process.env.PORT         = '4000';
};
