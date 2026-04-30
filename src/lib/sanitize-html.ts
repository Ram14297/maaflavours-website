// src/lib/sanitize-html.ts
// Maa Flavours — Server-side HTML sanitiser for admin-authored content.
//
// Used for:
//   - Product descriptions (admin-authored)
//   - Blog post body blocks (admin-authored)
//
// We accept only a small, formatting-oriented allowlist of tags and attrs.
// Anything not in the allowlist is stripped — not escaped — so harmless tags
// like <script>, <style>, <iframe>, <object>, <embed>, <link>, <meta>, plus
// inline event handlers (on*=) and `javascript:` / `data:text/html` URLs are
// removed.
//
// This is intentionally conservative. If a richer allowlist is needed,
// switch to `isomorphic-dompurify` and configure it with the same allowlist.

const ALLOWED_TAGS = new Set([
  "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "small", "sub", "sup", "mark",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "span", "div",
]);

const ALLOWED_ATTRS_BY_TAG: Record<string, Set<string>> = {
  a:   new Set(["href", "title", "rel", "target"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
};

const GLOBAL_ALLOWED_ATTRS = new Set<string>([
  // We don't allow class/style by default — admin content shouldn't break
  // the site's styling. Add to this set if a need arises.
]);

const URL_ATTRS = new Set(["href", "src"]);

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("javascript:")) return false;
  if (trimmed.startsWith("data:") && !trimmed.startsWith("data:image/")) return false;
  if (trimmed.startsWith("vbscript:")) return false;
  return true;
}

/**
 * Sanitise admin-authored HTML for safe rendering with
 * `dangerouslySetInnerHTML`. Server-side only — uses a regex tokeniser, no
 * DOM dependency, so it runs in Edge runtimes too.
 *
 * Strips:
 *   - any tag not in ALLOWED_TAGS (and its full open/close)
 *   - any attribute not in ALLOWED_ATTRS_BY_TAG / GLOBAL_ALLOWED_ATTRS
 *   - on* event-handler attributes
 *   - URLs starting with javascript: / data:text/html / vbscript:
 *   - the contents of <script>/<style>/<iframe>/<object>/<embed>
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";

  // 1. Drop <script>, <style>, <iframe>, <object>, <embed> AND their inner
  //    text wholesale — leaving the inner text would be confusing in admin
  //    content (and a script's text content is the dangerous part).
  let html = input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/<link[\s\S]*?>/gi, "")
    .replace(/<meta[\s\S]*?>/gi, "")
    .replace(/<base[\s\S]*?>/gi, "");

  // 2. Walk every tag and rewrite it.
  //    Pattern matches: </tag>, <tag>, <tag attrs>, <tag attrs/>
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_match, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    // Closing tag — no attrs allowed
    if (_match.startsWith("</")) return `</${tag}>`;

    // Strip event handlers and rebuild attributes from a strict allowlist
    const allowed = ALLOWED_ATTRS_BY_TAG[tag] || new Set<string>();
    const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]*))/g;
    let cleanAttrs = "";
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(rawAttrs)) !== null) {
      const attrName  = m[1].toLowerCase();
      const attrValue = m[3] ?? m[4] ?? m[5] ?? "";

      // Block all on* event handlers
      if (attrName.startsWith("on")) continue;
      // Block xmlns and namespace tricks
      if (attrName.startsWith("xmlns")) continue;
      // Block formaction / srcdoc
      if (attrName === "formaction" || attrName === "srcdoc") continue;

      if (!allowed.has(attrName) && !GLOBAL_ALLOWED_ATTRS.has(attrName)) continue;

      if (URL_ATTRS.has(attrName) && !isSafeUrl(attrValue)) continue;

      // Special-case: <a target="_blank"> → force rel="noopener noreferrer"
      // is added below after the loop.

      const escaped = attrValue
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
      cleanAttrs += ` ${attrName}="${escaped}"`;
    }

    // Force rel="noopener noreferrer" on any <a target=...>
    if (tag === "a" && /\btarget=/i.test(cleanAttrs) && !/\brel=/i.test(cleanAttrs)) {
      cleanAttrs += ` rel="noopener noreferrer"`;
    }

    // Self-closing for void elements
    if (tag === "br" || tag === "hr" || tag === "img") {
      return `<${tag}${cleanAttrs} />`;
    }
    return `<${tag}${cleanAttrs}>`;
  });
}
