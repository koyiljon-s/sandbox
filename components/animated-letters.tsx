/**
 * Splits text into letters for the hover flip in globals.css.
 * Put "flip" on a parent element; this renders the letters.
 * Screen readers get the plain text once, not letter by letter.
 */
export function AnimatedLetters({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span
            key={i}
            className="flip-letter"
            style={{ animationDelay: `${i * 25}ms` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </>
  );
}
