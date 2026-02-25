/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import {useParams} from "next/navigation";
import { companies } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { ArrowLeft, Globe, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link";
import { motion,AnimatePresence } from "framer-motion"

type Note={
  id:string;
  content:string;
  createdAt:string;
}

type Enrichment={
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
  const company=companies.find(c=>c.id===params.id);
  const [noteInput,setNoteInput]=useState("");
  const [notes,setNotes]=useState<Note[]>([]);

  const [enrichment,setEnrichment]=useState<Enrichment | null>(null);
  const [cachedEnrichment, setCachedEnrichment] = useState<Enrichment | null>(null);
  const [hasRequested, setHasRequested] = useState(false)
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    const saved=localStorage.getItem(`notes-${company?.id}`);
    if(!saved) return;
    try{
      const parsed=JSON.parse(saved);
      if(Array.isArray(parsed)){
        setNotes(parsed);
      }
    }catch(err){
      console.warn("Invalid notes data in localStorage. Resetting.",err);
      localStorage.removeItem(`notes-${company?.id}`)
    }
  },[company?.id]);

  function handleAddNote(){
    if(!noteInput.trim()) return;
    const newNote={
      id:crypto.randomUUID(),
      content:noteInput,
      createdAt:new Date().toISOString(),
    }

    const updated=[newNote,...notes];
    setNotes(updated);
    localStorage.setItem(`notes-${company?.id}`,JSON.stringify(updated));
    setNoteInput("");
  }

  function handleDelete(id:string){
    const updated=notes.filter((n)=>n.id!==id);
    setNotes(updated);
    localStorage.setItem(`notes-${company?.id}`,JSON.stringify(updated));
  }

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
    }catch(err){
      setError("Enrichment failed. Please try again.")
    }finally{
      setLoading(false);
    }
  }

  if(!company){
    return <div>Company not found</div>
  }

  return (
    <motion.div className="space-y-8" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.25}}>
      <Button variant="ghost" size="sm" onClick={()=>router.back()} className="w-fit text-muted-foreground cursor-pointer">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Companies
      </Button>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <img src={`https://www.google.com/s2/favicons?domain=${company.website}&sz=64`} alt={company.name} className="w-8 h-8 rounded-md mr-3"/>
            <h1 className="text-3xl font-semibold tracking-tight">
              {company.name}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{company.stage}</Badge>
            <span>•</span>
            <span>{company.industry}</span>
            <span>•</span>
            <span>{company.location}</span>
          </div>
        </div>
        <Button asChild variant="secondary" className="cursor-pointer">
          <Link href={company.website} target="_blank">
            <div className="flex justify-center items-center gap-2">
              <Globe size={5}/>
              <span>Visit Website</span>
            </div>
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Overview</h2>
          <p className="text-sm text-muted-foreground">
            This section will display enrich summary once available.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Notes</h2>
          <Textarea placeholder="Add internal notes..." value={noteInput} onChange={e=>setNoteInput(e.target.value)}/>
          <Button onClick={handleAddNote} className="cursor-pointer">Add Notes</Button>

          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              No internal notes yet.
            </p>
          )}

          <div className="space-y-3 mt-4">
            <AnimatePresence>
              {notes.map((note)=>(
                <motion.div key={note.id} 
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}
                  className="border rounded-md p-3 bg-muted/30 flex justify-between items-center hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm">{note.content}</p>
                    <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="cursor-pointer" onClick={()=>handleDelete(note.id)}>
                    <Trash2/>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">AI Enrichment</h2>

            <div className="flex gap-2">
              <Button onClick={handleEnrich} disabled={loading} className="cursor-pointer">{loading?"Enriching...":enrichment?"Re-enrich":"Enrich"}</Button>
              {cachedEnrichment && !hasRequested && (
                <Button variant="outline" onClick={()=>{
                  setEnrichment(cachedEnrichment);
                  setHasRequested(true);
                }}>View Previous</Button>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {loading && (
            <p className="text-sm text-muted-foreground">Fetching and analyzing website...</p>
          )}

          {enrichment && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.35}} className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{enrichment.summary}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">What They Do</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {enrichment.bullets.map((b,i)=>(
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {enrichment.keywords.map((k,i)=>(
                    <Badge key={i} variant="outline">{k}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Derived Signals</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {enrichment.signals.map((s,i)=>(
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Sources</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {enrichment.sources.map((src,i)=>(
                    <li key={i}>
                      <Link href={src} target="_blank" className="underline">{src}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                Enriched on {new Date(enrichment.timestamp).toLocaleString()}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

    </motion.div>
  );
}