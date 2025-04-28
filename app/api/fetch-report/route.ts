import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL не вказано" }, { status: 400 })
    }

    // Fetch the HTML content from the provided URL
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Помилка при отриманні даних: ${response.statusText}` },
        { status: response.status },
      )
    }

    const html = await response.text()

    return NextResponse.json({ html })
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json({ error: "Сталася помилка при отриманні звіту" }, { status: 500 })
  }
}
