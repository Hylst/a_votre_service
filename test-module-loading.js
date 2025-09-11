// test-module-loading.js - Browser console script to test module loading
// Run this in the browser console to check if modules are loading

console.log('=== MODULE LOADING TEST ===');

// Check if React is available
console.log('React available:', typeof React !== 'undefined');

// Check if the page has loaded
console.log('Document ready state:', document.readyState);

// Check if we're on the right page
console.log('Current URL:', window.location.href);
console.log('Is AI Coach page:', window.location.href.includes('ai-coach'));

// Check if any React components are mounted
const reactRoots = document.querySelectorAll('[data-reactroot], #root');
console.log('React root elements found:', reactRoots.length);

// Check for any error messages in the DOM
const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
console.log('Error elements found:', errorElements.length);

// Check localStorage
console.log('localStorage keys:', Object.keys(localStorage));
console.log('llm_providers in localStorage:', localStorage.getItem('llm_providers'));
console.log('llm_api_keys in localStorage:', localStorage.getItem('llm_api_keys'));

// Try to manually trigger a console log to see if it works
console.log('🧪 [TEST] Manual console log - this should appear');
console.info('🧪 [TEST] Manual console info - this should appear');
console.warn('🧪 [TEST] Manual console warn - this should appear');
console.error('🧪 [TEST] Manual console error - this should appear');

console.log('=== END MODULE LOADING TEST ===');

// Instructions
console.log('\n📋 INSTRUCTIONS:');
console.log('1. Navigate to http://localhost:5173/tools/career/ai-coach');
console.log('2. Look for useLLMManager logs starting with 📦 or 🚀');
console.log('3. If no logs appear, there might be an import or compilation issue');
console.log('4. Check the Network tab for any failed module loads');