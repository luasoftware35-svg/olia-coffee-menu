const TOKEN = /(Olia|@oliacoffee\.co)/g

export function BrandText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((part) => part.length > 0)

  return (
    <>
      {parts.map((part, index) =>
        part === "Olia" || part === "@oliacoffee.co" ? (
          <span key={`${part}-${index}`} lang="en">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  )
}
