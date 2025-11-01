// backend/llm-booking-service/utils/intentParser.js
export function parseIntent(message) {
  const lower = (message || "").toLowerCase().trim();
  if (!lower) return { intent: "unknown", event: null, quantity: null };

  // "show events" intent
  if (lower.includes("show") && lower.includes("event"))
    return { intent: "show", event: null, quantity: null };

  // "book" intent – supports number words and digits
  const bookRe =
    /book\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(?:tickets?|ticket)?\s*for\s+(.+)$/i;
  const m = lower.match(bookRe);
  if (m) {
    let qtyRaw = m[1] ? m[1].toLowerCase() : "1";
    const wordToNum = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
    };
    const quantity = wordToNum[qtyRaw] || parseInt(qtyRaw, 10) || 1;
    const ev = (m[2] || "").trim();
    return { intent: "book", event: ev, quantity };
  }

  // "confirm" intent
  if (/^yes\b.*\bbook\b/.test(lower))
    return { intent: "confirm", event: null, quantity: null };

  // greeting intent
  if (/^(hi|hello|hey)\b/.test(lower))
    return { intent: "greet", event: null, quantity: null };

  // fallback
  return { intent: "unknown", event: null, quantity: null };
}