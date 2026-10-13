/**
 * CRLF and lone CR to LF, as the HTML parser does before a browser hashes an inline script.
 * The bootstrap is normalised once when read, so the inlined text and its CSP hash agree on any
 * checkout (fjord-foundation ADR-0002, review 2026-10-02 F-17).
 */
export const normaliseNewlines = (text: string) => text.replace(/\r\n?/g, '\n');
