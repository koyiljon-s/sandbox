/**
 * Splits text into letters for the hover animations in globals.css.
 * Put "flip" or "wave" on a parent element; this renders the letters.
 * Screen readers get the plain text once, not letter by letter.
 */
export function AnimatedLetters({ text, effect }: { text: string; effect: "flip" | "wave" }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span
            key={i}
            className={effect === "flip" ? "flip-letter" : "wave-letter"}
            style={{ animationDelay: `${i * (effect === "flip" ? 25 : 30)}ms` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </>
  );
}
