// Env setup that MUST run before the database pool is created.
// Deliberately has zero imports — static imports are hoisted, so putting
// these assignments in a module that imports nothing guarantees they run
// before any other module (including db.js) evaluates.
//
// dotenv (loaded by src/index.js in app-level tests) never overrides
// existing env vars, so these values win there too.
process.env.DB_NAME = "mctaba_shop_test";
process.env.NODE_ENV = "test";
process.env.PAYSTACK_SECRET_KEY = "sk_test_dummy_for_tests";
process.env.ADMIN_API_TOKEN = "test-admin-token";
// Empty (not deleted) so dotenv cannot re-populate them from server/.env —
// whatsapp.service.getClient() then throws before any network call.
process.env.TWILIO_ACCOUNT_SID = "";
process.env.TWILIO_AUTH_TOKEN = "";
