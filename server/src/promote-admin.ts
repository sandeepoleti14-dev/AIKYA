import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: 'server/.env' });
const email = process.argv[2]?.trim().toLowerCase();
const mongoUri = process.env.MONGODB_URI;

if (!email || !mongoUri) {
  console.error('Usage: npm run server:promote-admin -- user@example.com (with MONGODB_URI configured)');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  const result = await mongoose.connection.collection('users').updateOne(
    { email },
    { $set: { role: 'admin' } },
  );
  if (result.matchedCount === 0) {
    throw new Error('No account with that email exists. Register the account before promoting it.');
  }
  console.info('Administrator role assigned.');
} catch (error) {
  console.error('Unable to assign administrator role.', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
