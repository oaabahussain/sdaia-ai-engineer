// One fail-closed learner-principal policy for source intake and public K5 export.
// NFKC is used ONLY for comparison: the original pseudonym is never rewritten.
const hidden = /[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u;
const phone = /^\p{Nd}{7,}$/u;
const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
function looksLikeIPv6(value) {
  const unwrapped=value.startsWith('[')&&value.endsWith(']')?value.slice(1,-1):value;
  const host=unwrapped.replace(/%[a-zA-Z0-9_.~-]+$/,'');
  if(!host.includes(':'))return false;
  try { new URL('http://['+host+']/'); return true; }
  catch { return false; }
}
export function isOpaqueK5LearnerId(value) {
  if(typeof value!=='string'||!value||value!==value.trim())return false;
  if(hidden.test(value))return false;
  // Unicode compatibility forms include fullwidth digits, @, dots, colons,
  // and plus signs. Their visual PII must not cross either K5 boundary.
  // Canonicalize phone-style dash separators ONLY for comparison, never for the stored ID.
  // U+2212 MINUS SIGN and U+2043 HYPHEN BULLET are common non-Pd visual dashes.
  const normalized=value.normalize('NFKC').replace(/[\p{Pd}\u2212\u2043]/gu,'-');
  if(!normalized||normalized!==normalized.trim()||hidden.test(normalized))return false;
  // Compare digits after removing Unicode punctuation, spacing and symbols;
  // never rewrite the actual pseudonym or infer a learner identity from it.
  const phoneCandidate=normalized.replace(/[\p{P}\p{S}\p{Z}\s]/gu,'');
  if(normalized.includes('@')||phone.test(phoneCandidate)||ipv4.test(normalized)||looksLikeIPv6(normalized))return false;
  return true;
}
