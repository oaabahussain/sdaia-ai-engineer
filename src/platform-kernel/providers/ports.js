function assertMethod(provider,name,label){if(!provider||typeof provider[name]!=='function')throw new Error(`${label} provider must implement ${name}()`);return provider}
export const assertGeneratorProvider=p=>assertMethod(p,'generate','Generator');
export const assertCriticProvider=p=>assertMethod(p,'critique','Critic');
export const assertEvidenceProvider=p=>assertMethod(p,'checkEvidence','Evidence');
export const assertEmbeddingProvider=p=>assertMethod(p,'embed','Embedding');
export const assertTranslationProvider=p=>assertMethod(p,'checkEquivalence','Translation');
