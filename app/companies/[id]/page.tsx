
"use client";

import {useParams} from "next/navigation";
import { companies } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion,AnimatePresence } from "framer-motion";
import type { List } from "@/app/lists/page";
import { Input } from "@/components/ui/input";
import { ThesisScore } from "../thesis";
import { CompanyHeader } from "./CompanyHeader";
import { NotesCard } from "./NotesCard";
import { EnrichmentCard } from "./EnrichmentCard";


export type Enrichment={
  summary:string,
  bullets:string[],
  keywords: string[]
  signals: string[]
  sources: string[]
  timestamp: string
}

export default function CompanyProfilePage(){
  const router=useRouter();
  const params=useParams();
  const company=companies.find(c=>String(c.id)===String(params.id));

  const [enrichment,setEnrichment]=useState<Enrichment | null>(null);
  const [cachedEnrichment, setCachedEnrichment] = useState<Enrichment | null>(null);
  const [hasRequested, setHasRequested] = useState(false)
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const [lists,setLists]=useState<List[]>([]);
  const [selectedList,setSelectedList]=useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [thesisInput,setThesisInput]=useState("");
  const [thesisKeyword,setThesisKeyword]=useState<string[]>([]);

  const [storedThesis, setStoredThesis] = useState("");

  useEffect(()=>{
    const saved=localStorage.getItem("vc-thesis");
    if (saved) setStoredThesis(saved);
  },[]);

  useEffect(()=>{
    const stored=localStorage.getItem("vc-lists");
    if(stored) setLists(JSON.parse(stored));
  },[])

  useEffect(()=>{
    const saved=localStorage.getItem(`enrichment-${company?.id}`);
    if(!saved) return;

    try{
      const parsed=JSON.parse(saved);
      setCachedEnrichment(parsed);
    }catch{
      localStorage.removeItem(`enrichment-${company?.id}`)
    }
  },[company?.id])

  async function handleEnrich(){
    if(!company) return;

    setLoading(true);
    setError("");
    setHasRequested(true);

    try{
      const res=await fetch("/api/enrich",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({url:company.website}),
      })
      if(!res.ok){
        throw new Error("Failed to enrich");
      }
      const data=await res.json();

      setEnrichment(data);
      setCachedEnrichment(data);
      localStorage.setItem(`enrichment-${company.id}`,JSON.stringify(data))
    }catch{
      setError("Enrichment failed. Please try again.")
    }finally{
      setLoading(false);
    }
  }

  if(!company){
    return <div>Company not found</div>
  }
  const listsContainingCompany=lists.filter(l=>l.companies.includes(company.id));

  return (
    <motion.div className="space-y-8" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.25}}>
      <Button variant="ghost" size="sm" onClick={()=>router.back()} className="w-fit text-muted-foreground cursor-pointer">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Companies
      </Button>
      <CompanyHeader company={company}/>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Overview</h2>
          {enrichment ? (
            <motion.p initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {enrichment.summary}
            </motion.p>
          ):(
            <div className="text-sm text-muted-foreground flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                This section will display enrich summary once available.
              </p>
            </div>
            
          )}
        </CardContent>
      </Card>

      <NotesCard companyId={company.id}/>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Save to List</h2>
          {listsContainingCompany.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listsContainingCompany.map(list=>(
                <Badge key={list.id} variant="secondary">In: {list.name}</Badge>
              ))}
            </div>
          )}
          {lists.length ===0 && (
            <p className="text-sm text-muted-foreground">Create a list first</p>
          )}

          {lists.length>0 && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}} className="flex gap-2">
              <select value={selectedList} onChange={e=>setSelectedList(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="">Select list</option>
                {lists.map(list=>(
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>

              <Button className="cursor-pointer" onClick={()=>{
                if(!selectedList) return;

                const targetList = lists.find(l => l.id === selectedList);
                if (!targetList) return;

                if(targetList.companies.includes(company.id)){
                  setToast(`Already in ${targetList.name}`);
                  setTimeout(() => setToast(null), 2000);
                  return;
                }

                const updated=lists.map(l=>{
                  if(l.id===selectedList){
                    return {...l,
                      companies: [...l.companies, company.id],
                    };
                  }
                  return l;
                });
                localStorage.setItem("vc-lists", JSON.stringify(updated));
                setLists(updated);

                setToast(`Saved to ${targetList.name}`);
                setSelectedList("");
                setTimeout(() => setToast(null), 2000);
              }}>Save</Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} transition={{duration:0.2}}
          className="fixed bottom-6 right-6 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Thesis Match</h2>
          <div className="flex gap-2">
            <Input placeholder="Enter thesis keywords (e.g. AI, Enterprise, DevTools)" value={thesisInput} onChange={(e)=>setThesisInput(e.target.value)}/>
            <Button onClick={()=>{
              const keywords=thesisInput.split(",").map((k)=>k.trim()).filter(Boolean);
              setThesisKeyword(keywords);
            }}
            className="cursor-pointer"
            >Apply</Button>
          </div>

          {thesisKeyword.length>0 && enrichment && (
            <ThesisScore thesisKeyword={thesisKeyword} enrichment={enrichment}/>
          )}
        </CardContent>
      </Card>

      <EnrichmentCard enrichment={enrichment} loading={loading} error={error} onEnrich={handleEnrich} cachedEnrichment={cachedEnrichment} 
        hasRequested={hasRequested} storedThesis={storedThesis} industry={company.industry}
        onLoadCached={() => {
          setEnrichment(cachedEnrichment);
          setHasRequested(true);
        }}
      />

    </motion.div>
  );
}