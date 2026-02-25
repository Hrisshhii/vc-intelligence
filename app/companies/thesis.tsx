import { Badge } from "@/components/ui/badge";
import { Enrichment } from "./[id]/page";
import { motion } from "framer-motion"


export function ThesisScore({thesisKeyword,enrichment}:{thesisKeyword:string[];enrichment:Enrichment;}){
  const combinedText=(enrichment.summary+" "+enrichment.bullets.join(" ")+" "+enrichment.keywords.join(" ")).toLowerCase();
  const matched=thesisKeyword.filter(keyword=>combinedText.includes(keyword.toLowerCase()));

  const score=matched.length;
  const total=thesisKeyword.length;
  const percentage=total===0 ? 0 : Math.round((score/total)*100);

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-semibold">
          {score}/{total}
        </div>
        <Badge variant={percentage>50?"default":"outline"}>
          {percentage}% Match
        </Badge>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Matched Signals</h4>
        {matched.length>0?(
          <div className="flex flex-wrap gap-2">
            {matched.map(m=>(
              <Badge key={m}>{m}</Badge>
            ))}
          </div>
        ):(
          <p className="text-sm text-muted-foreground">
            No thesis keywords matched.
          </p>
        )}
      </div>
    </motion.div>
  );
}