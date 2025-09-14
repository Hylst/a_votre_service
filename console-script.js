// Copy and paste this script into the browser console (F12) on http://localhost:5185/
// This will create a test user in localStorage for testing the profile modal

const testUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://via.placeholder.com/40',
  createdAt: new Date().toISOString()
};

localStorage.setItem('currentUser', JSON.stringify(testUser));
console.log('✅ Test user created in localStorage:', testUser);
console.log('🔄 Now refresh the page to see the user loaded by AuthContext');

// To verify the user was set:
console.log('📋 Current user in localStorage:', JSON.parse(localStorage.getItem('currentUser')));