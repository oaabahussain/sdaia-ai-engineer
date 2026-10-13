// One fail-closed learner-principal policy for source intake and public K5 export.
// NFKC is used ONLY for comparison: the original pseudonym is never rewritten.
const hidden = /[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u;
const phone = /^\+?\p{Nd}[\p{Nd}\s().-]{6,}$/u;
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
  const normalized=value.normalize('NFKC');
  if(!normalized||normalized!==normalized.trim()||hidden.test(normalized))return false;
  if(normalized.includes('@')||phone.test(normalized)||ipv4.test(normalized)||looksLikeIPv6(normalized))return false;
  return true;
}
