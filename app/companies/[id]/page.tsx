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

export default function CompanyProfilePage(){
  const router=useRouter();
  const params=useParams();
  const company=companies.find(c=>c.id===params.id);
  const [noteInput,setNoteInput]=useState("");
  const [notes,setNotes]=useState<Note[]>([]);

  useEffect(()=>{
    const saved=localStorage.getItem(`notes-${company?.id}`);
    if(!saved) return;
    try{
      const parsed=JSON.parse(saved);
      if(Array.isArray(parsed)){
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <h2 className="text-lg font-medium">AI Enrichment</h2>
          <Button className="cursor-pointer">Enrich</Button>
        </CardContent>
      </Card>

    </motion.div>
  );
}