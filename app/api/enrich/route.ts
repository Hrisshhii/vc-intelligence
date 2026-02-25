export async function POST(req:Request) {
  try {
    const {url}=await req.json()

    if (!url){
      return Response.json({error:"Missing URL"},{status:400})
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":"Mozilla/5.0 (compatible; VC-Intelligence/1.0)"
      }
    })

    if (!res.ok) {
      return Response.json(
        {error:"Failed to fetch website content"},{status:400}
      )
    }

    const html = await res.text()

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : "No title found"

    // Extract meta description
    const descMatch=html.match(
      /<meta name="description" content="(.*?)"/i
    )
    const description=descMatch ? descMatch[1] : "No description available"

    const signals: string[] = []

    if (html.includes("/careers")) {
      signals.push("Careers page detected")
    }

    if (html.includes("/blog")) {
      signals.push("Blog present")
    }

    if (html.includes("/docs")) {
      signals.push("Documentation available")
    }

    if (html.includes("/changelog")) {
      signals.push("Changelog detected")
    }

    // Generate keywords from title + description
    const keywords=(title+" "+description).split(" ").filter((w)=>w.length>4).slice(0, 8)

    return Response.json({
      summary: description,
      bullets: [
        `Website Title: ${title}`,
        `Primary description extracted from homepage`,
        `Public website analyzed successfully`
      ],
      keywords,
      signals,
      sources: [url],
      timestamp: new Date().toISOString()
    })

  } catch(err){
    console.error(err)
    return Response.json(
      {error:"Enrichment failed"},{status:500}
    )
  }
}