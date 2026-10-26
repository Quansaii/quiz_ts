const Entities = new Map<string, string>([
  ['&quot;', '"'],
  ['&#039;', "'"],
  ['&#x27;', "'"],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&eacute;', 'é'],
  ['&Eacute;', 'É'],
  ['&rsquo;', '’'],
  ['&lsquo;', '‘'],
  ['&ldquo;', '“'],
  ['&rdquo;', '”'],
  ['&prime;', '′'],
  ['&Prime;', '″'],
  ['&deg;', '°'],
  ['&minus;', '−'],
  ['&shy;', '­'],
  ['&hellip;', '…'],
  ['&ndash;', '–'],
  ['&lrm;', '‎'],
  ['&uuml;', 'ü'],
  ['&Uuml;', 'Ü'],
  ['&ouml;', 'ö'],
  ['&auml;', 'ä'],
  ['&euml;', 'ë'],
  ['&ccedil;', 'ç'],
  ['&egrave;', 'è'],
  ['&aacute;', 'á'],
  ['&iacute;', 'í'],
  ['&uacute;', 'ú'],
  ['&ocirc;', 'ô'],
  ['&eth;', 'ð'],
  ['&pi;', 'π'],
  ['&Tau;', 'Τ'],
  ['&Psi;', 'Ψ'],
  ['&Phi;', 'Φ'],
  ['&amp;', '&']
])

export function decodeHtml(html:string):string{
  return html.replace(
    /&(?:#([0-9]+)|#[xX]([0-9a-fA-F]+)|[A-Za-z][A-Za-z0-9]*);/g,
    (match, decimal, hex) => {
      if (decimal !== undefined || hex !== undefined) {
        const code = decimal !== undefined ? parseInt(decimal, 10) : parseInt(hex, 16);
        return code <= 0x10ffff ? String.fromCodePoint(code) : match;
      }
      return Entities.get(match) ?? match;
    }
  );
}