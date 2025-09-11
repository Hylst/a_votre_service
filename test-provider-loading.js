// Test script to manually trigger provider loading and debug
// Run this in the browser console on the AI Coach page

console.log('=== MANUAL PROVIDER LOADING TEST ===');

// First, clear existing localStorage to test fallback
console.log('Clearing existing localStorage...');
localStorage.removeItem('llm_providers');
localStorage.removeItem('llm_api_keys');

// Check if the useLLMManager hook is available
if (window.React) {
  console.log('React is available');
  
  // Try to find the reload button and click it
  const reloadButton = document.querySelector('button[title*="reload"], button:contains("Reload")');
  if (reloadButton) {
    console.log('Found reload button, clicking...');
    reloadButton.click();
  } else {
    console.log('Reload button not found, looking for debug buttons...');
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, i) => {
      console.log(`Button ${i}:`, btn.textContent);
    });
  }
} else {
  console.log('React not available in window');
}

// Check localStorage after potential reload
setTimeout(() => {
  console.log('\n=== AFTER RELOAD CHECK ===');
  console.log('llm_providers:', localStorage.getItem('llm_providers'));
  console.log('llm_api_keys:', localStorage.getItem('llm_api_keys'));
}, 2000);

console.log('\n📝 Instructions:');
console.log('1. Look for debug buttons on the page');
console.log('2. Click "Reload from LocalStorage" button');
console.log('3. Watch console for useLLMManager debug logs');
console.log('4. Check if providers are loaded after 2 seconds');