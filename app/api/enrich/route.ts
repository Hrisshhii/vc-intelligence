import he from "he";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json(
        { error: "Missing URL" },
        { status: 400 }
      );
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VC-Intelligence/1.0)"
      }
    });

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch website content" },
        { status: 400 }
      );
    }

    const html = await res.text();

    // ----------------------------
    // Extract Title
    // ----------------------------
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1] : "No title found";
    const cleanTitle = he.decode(rawTitle.trim());

    // ----------------------------
    // Extract Meta Description
    // ----------------------------
    const descMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i
    );

    const rawDescription = descMatch
      ? descMatch[1]
      : "No description available";

    const cleanDescription = he.decode(rawDescription.trim());

    // ----------------------------
    // Fallback Summary
    // ----------------------------
    const ogMatch = html.match(
      /<meta property=["']og:description["'] content=["'](.*?)["']/i
    );

    const ogDescription=ogMatch ? ogMatch[1]:null;

    let summary = cleanDescription;

    // Prefer OG description
    if (ogDescription){
      summary=he.decode(ogDescription.trim());
    }

    // If still useless, extract first meaningful paragraph
    if (!summary || summary==="No description available"){
      const paragraphMatch=html.match(/<p>(.*?)<\/p>/i);

      if(paragraphMatch){
        summary=he.decode(paragraphMatch[1]).replace(/\s+/g, " ").trim();
      }
    }

    // Clean navigation junk
    summary=summary.replace(/Skip to main content/gi, "").replace(/Skip to footer/gi, "").replace(/Home\s*\\/gi, "").replace(/\s+/g, " ").trim();

    // Final fallback
    if (!summary || summary.length<40) {
      summary=`${cleanTitle} is a technology company with an active public web presence.`
    }

    // ----------------------------
    // Signals Detection
    // ----------------------------
    const lowerHtml = html.toLowerCase();
    const signals: string[] = [];

    if (lowerHtml.includes("/careers") || lowerHtml.includes("join our team")) {
      signals.push("Careers page detected");
    }

    if (lowerHtml.includes("/blog")) {
      signals.push("Blog present");
    }

    if (lowerHtml.includes("/docs") || lowerHtml.includes("api")) {
      signals.push("Developer tooling detected");
    }

    if (lowerHtml.includes("/changelog")) {
      signals.push("Changelog detected");
    }

    if (lowerHtml.includes("enterprise")) {
      signals.push("Enterprise positioning language detected");
    }

    if (lowerHtml.includes("pricing")) {
      signals.push("Pricing page available");
    }

    if (!signals.length) {
      signals.push("No major structural signals detected");
    }

    // ----------------------------
    // Keyword Extraction
    // ----------------------------
    const stopwords = [
      "about", "their", "which", "while",
      "there", "where", "these", "those",
      "platform", "website"
    ];

    const keywords = (cleanTitle + " " + summary)
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter(
        (w) => w.length > 4 && !stopwords.includes(w)
      )
      .slice(0, 8);

    // ----------------------------
    // Response
    // ----------------------------
    return Response.json({
      summary,
      bullets: [
        `Website Title: ${cleanTitle}`,
        "Primary homepage description extracted",
        "Public web signals analyzed"
      ],
      keywords,
      signals,
      sources: [url],
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Enrichment failed" },
      { status: 500 }
    );
  }
}