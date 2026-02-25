
import OpenAI from "openai";

export async function POST(req: Request){
  try{
    const {url}=await req.json();

    if (!url){
      return Response.json({error:"Missing URL"},{status:400})
    }
    const res=await fetch(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 (compatible; VC-Intelligence/1.0)"
      }
    });
    if(!res.ok){
      return Response.json(
        {error:"Failed to fetch website content"},{status:400}
      )
    }
    const html=await res.text();

    const text=html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0,8000)

    const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY,});

    const completion=await openai.chat.completions.create({
      model:"gpt-4o-mini",
      messages:[
        {
          role:"system",
          content:"You are an AI analyst extracting structured company intelligence."
        },
        {
          role:"user",
          content:`
          Extract the following from the website text:
          1. Summary (1-2 sentences)
          2. What they do (3-6 bullet points)
          3. 5-10 keywords
          4. 2-4 derived signals (e.g. careers page exists, blog present, docs, changelog)

          Return JSON only in this format:
          {
            "summary": "",
            "bullets": [],
            "keywords": [],
            "signals": []
          }

          Website text:
          ${text}
          `
        }
      ],
      temperature:0.2
    });

    const content=completion.choices[0].message.content || "{}";
    let parsed
    try{
      const cleaned = content?.replace(/```json|```/g, "").trim() || "{}"
      parsed=JSON.parse(cleaned)
    }catch{
      return Response.json({error:"AI response parsing failed"},{status:500})
    }
    return Response.json({
      ...parsed,
      sources:[url],
      timestamp:new Date().toISOString()
    })
  }catch(err){
    console.error(err);
    return Response.json({error:"Enrichment failed"},{status:500})
  }
}