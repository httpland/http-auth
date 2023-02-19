import {
  either,
  exact,
  group,
  namedCapture,
  oneOrMore,
  optional,
  sequence,
  zeroOrMore,
} from "./regex_compose.ts";

export const SP = /\x20/;
export const HTAB = /\t/;
export const DQUOTE = /\x22/;
export const VCHAR = /[\x21-\x7E]/;

/**
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#section-5.6.2
 * ```abnf
 * tchar = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *         / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *         / DIGIT / ALPHA
 *         ; any VCHAR, except delimiters
 * ```
 */
const tchar = /[A-Za-z0-9!#$%&'*+-.^_`|~]/;
/**
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#section-5.6.2
 *
 * ```abnf
 * token = 1*tchar
 * ```
 */
const token = oneOrMore(tchar);
/**
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#section-11.1
 */
const authScheme = token;
const token68 = /[A-Za-z0-9-._~+/]+=*/;
const OWS = /\s*/;
const BWS = OWS;
const obsText = /[\x80-\xFF]/;
const qdtext = either(HTAB, SP, /!/, /[\x23-\x5B]/, /[\x5D-\x7E]/, obsText);
const quotedPair = sequence(/\\/, group(either(HTAB, SP, VCHAR, obsText)));
const quotedString = sequence(
  DQUOTE,
  zeroOrMore(either(qdtext, quotedPair)),
  DQUOTE,
);
const authParam = sequence(
  token,
  BWS,
  /=/,
  BWS,
  group(either(token, quotedString)),
);

export const Regexp = exact(
  sequence(
    namedCapture("scheme", authScheme),
    optional(
      sequence(
        oneOrMore(SP),
        namedCapture(
          "token",
          group(
            either(
              token68,
              optional(
                sequence(
                  authParam,
                  zeroOrMore(sequence(OWS, /,/, OWS, authParam)),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);
