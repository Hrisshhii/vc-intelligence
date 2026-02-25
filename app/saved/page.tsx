/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  filters: {
    stage?: string;
    industry?: string;
    location?: string;
  };
  createdAt: string;
};

export default function SavedPage() {
  const [saved,setSaved]=useState<SavedSearch[]>([]);
  const router=useRouter();

  useEffect(()=>{
    const stored=localStorage.getItem("vc-saved-searches");
    if(stored) setSaved(JSON.parse(stored));
  },[]);

  function deleteSearch(id:string){
    const updated=saved.filter(s=>s.id!==id);
    setSaved(updated);
    localStorage.setItem("vc-saved-searches",JSON.stringify(updated));
  }

  function runSearch(search:SavedSearch){
    const params=new URLSearchParams();

    if(search.query) params.set("q",search.query);
    if(search.filters.stage) params.set("stage",search.filters.stage);
    if (search.filters.industry) params.set("industry",search.filters.industry);
    if (search.filters.location) params.set("location", search.filters.location);
    router.push(`/companies?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Saved Search</h1>
      {saved.length===0 && (
        <p className="text-sm text-muted-foreground">No saved searches yet.</p>
      )}

      <div className="space-y-4">
        {saved.map(search=>(
          <div key={search.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 className="font-medium">{search.name}</h2>
              <p className="text-xs text-muted-foreground">
                {search.query||"No keyword"}•{" "}
                {search.filters.stage||"Any stage"}•{" "}
                {search.filters.industry||"Any industry"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="cursor-pointer" onClick={()=>runSearch(search)}>Run</Button>
              <Button size="sm" className="cursor-pointer" variant="destructive" onClick={() => deleteSearch(search.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}