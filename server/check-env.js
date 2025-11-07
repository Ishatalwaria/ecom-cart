require('dotenv').config();

console.log('Checking environment variables:');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

// If JWT_SECRET is missing, show warning
if (!process.env.JWT_SECRET) {
  console.error('\n⚠️ WARNING: JWT_SECRET is not defined!');
  console.error('Authentication will fail without a JWT_SECRET.');
  console.error('Please create or update your .env file with:');
  console.error('JWT_SECRET=your_secret_key_here\n');
}

// If MONGO_URI is missing, show warning
if (!process.env.MONGO_URI) {
  console.error('\n⚠️ WARNING: MONGO_URI is not defined!');
  console.error('Database connection will fail without MONGO_URI.');
  console.error('Please create or update your .env file with:');
  console.error('MONGO_URI=mongodb://localhost:27017/ecommerce\n');
} 