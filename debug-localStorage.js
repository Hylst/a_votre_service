// Script de debug pour vérifier le localStorage
console.log('=== DEBUG LOCALSTORAGE ===');

// Vérifier les clés API LLM
const llmProviders = localStorage.getItem('llm_providers');
console.log('llm_providers dans localStorage:', llmProviders);

if (llmProviders) {
  try {
    const parsed = JSON.parse(llmProviders);
    console.log('Providers parsés:', parsed);
    console.log('Nombre de providers:', parsed.length);
    
    parsed.forEach((provider, index) => {
      console.log(`Provider ${index + 1}:`);
      console.log('  - ID:', provider.id);
      console.log('  - Provider:', provider.provider);
      console.log('  - API Key:', provider.api_key ? `${provider.api_key.substring(0, 10)}...` : 'null');
      console.log('  - Is Default:', provider.is_default);
      console.log('  - Selected Model:', provider.selected_model);
    });
    
    const defaultProvider = parsed.find(p => p.is_default);
    console.log('Default provider trouvé:', defaultProvider ? `${defaultProvider.provider} (${defaultProvider.selected_model})` : 'aucun');
  } catch (error) {
    console.error('Erreur parsing localStorage:', error);
  }
} else {
  console.log('Aucune donnée llm_providers dans localStorage');
}

// Vérifier toutes les clés du localStorage
console.log('\n=== TOUTES LES CLÉS LOCALSTORAGE ===');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value ? value.substring(0, 100) + (value.length > 100 ? '...' : '') : 'null');
}

console.log('=== FIN DEBUG ===');