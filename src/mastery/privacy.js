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
// Parse URL/authority wrappers only for privacy comparison. Never rewrite IDs.
function containsIpHost(value) {
  // Malformed/out-of-range ports invalidate WHATWG URLs but must not conceal
  // a syntactically valid bracketed IPv6 host from privacy screening.
  // Match arbitrary URL slash/backslash runs, including WHATWG special schemes.
  const authority=/^(?:(?:[a-z][a-z0-9+.-]*:)?[\\/]*)?\[([^\]]+)\](?::[^/?#\\]*)?(?:[/?#].*)?$/i.exec(value);
  if(authority&&looksLikeIPv6(authority[1]))return true;
  let url;
  try {
    if (/^(?:https?|wss?|ftp):/i.test(value) || /^[a-z][a-z0-9+.-]*:\/\//i.test(value)) url=new URL(value);
    else if (value.startsWith('//')) url=new URL('http:'+value);
    else if (/^\[[^\]]+\]:\d{1,5}$/.test(value) || /^(?:\d{1,3}\.){3}\d{1,3}:\d{1,5}$/.test(value)) url=new URL('http://'+value);
    else return false;
  } catch { return false; }
  return ipv4.test(url.hostname)||looksLikeIPv6(url.hostname);
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
  // Compare digits after removing Unicode punctuation, symbols, marks and spacing;
  // never rewrite the actual pseudonym or infer a learner identity from it.
  const phoneCandidate=normalized.replace(/[\p{P}\p{S}\p{Z}\p{M}\s]/gu,'');
  // Nd digits occupy contiguous decimal runs of 10 (sometimes several
  // consecutive sets). Convert only the comparison value; preserve the ID.
  const isDecimal=char=>/\p{Nd}/u.test(char);
  const ipCandidate=normalized.normalize('NFD').replace(/\p{Nd}/gu,char=>{
    const cp=char.codePointAt(0);
    let start=cp;
    while(start>0&&isDecimal(String.fromCodePoint(start-1)))start--;
    return String((cp-start)%10);
  }).replace(/\p{M}/gu,'');
  if(normalized.includes('@')||phone.test(phoneCandidate)||ipv4.test(ipCandidate)||looksLikeIPv6(ipCandidate)||containsIpHost(ipCandidate))return false;
  return true;
}
