// Debug script to manually setup Gemini provider in localStorage
// Run this in the browser console to add Gemini provider

console.log('=== GEMINI SETUP DEBUG ===');

// Check current localStorage content
console.log('Current localStorage keys:');
for(let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}:`, localStorage.getItem(key));
}

// Add Gemini provider manually
const geminiProvider = {
  id: `local-${Date.now()}`,
  provider: 'google',
  api_key: 'AIzaSyDSyFgKU1Y4J2soMMRQZMKFazQmci_Mq0k',
  is_default: true,
  selected_model: 'gemini-1.5-flash'
};

// Store in both formats for compatibility
localStorage.setItem('llm_providers', JSON.stringify([geminiProvider]));
localStorage.setItem('llm_api_keys', JSON.stringify({ google: 'AIzaSyDSyFgKU1Y4J2soMMRQZMKFazQmci_Mq0k' }));

console.log('✅ Gemini provider added to localStorage');
console.log('Provider:', geminiProvider);

// Verify storage
console.log('\n=== VERIFICATION ===');
console.log('llm_providers:', localStorage.getItem('llm_providers'));
console.log('llm_api_keys:', localStorage.getItem('llm_api_keys'));

console.log('\n🔄 Now reload the page or trigger provider reload in the debug panel');