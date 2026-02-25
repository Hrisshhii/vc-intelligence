/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type List = {
  id: string;
  name: string;
  companies: string[];
  createdAt: string;
};

export default function ListPage(){
  const [lists,setLists]=useState<List[]>([]);
  const [name, setName] = useState("");

  useEffect(()=>{
    const stored=localStorage.getItem("vc-lists");
    if(stored) setLists(JSON.parse(stored));
  },[]);

  function saveLists(updated:List[]){
    setLists(updated);
    localStorage.setItem("vc-lists",JSON.stringify(updated));
  }

  function createList(){
    if(!name.trim()) return;
    const newList:List={
      id:crypto.randomUUID(),
      name,
      companies:[],
      createdAt:new Date().toISOString(),
    };
    saveLists([newList,...lists]);
    setName("");
  }

  function deleteList(id:string){
    const updated=lists.filter(l=>l.id!==id);
    saveLists(updated);
  }

  function exportJSON(list:List){
    const blob=new Blob([JSON.stringify(list,null,2)],{
      type:"application/json",
    });
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`${list.name}.json`;
    a.click();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Lists</h1>

      <div className="flex gap-2">
        <Input placeholder="New list name..." value={name} onChange={e=>setName(e.target.value)}/>
        <Button onClick={createList} className="cursor-pointer">Create</Button>
      </div>

      {lists.length===0 && (
        <p className="text-sm text-muted-foreground">No lists created yet.</p>
      )}

      <div className="space-y-4">
        {lists.map(list=>(
          <div key={list.id} className="border rounded-lg p-4 flex justify-between items center">
            <div>
              <h2 className="font-medium">{list.name}</h2>
              <p className="text-xs text-muted-foreground">
                {list.companies.length} companies
              </p>
            </div>

            <div className="flex gap-2">
              <Link href={`/lists/${list.id}`}>
                <Button variant="outline" className="cursor-pointer" size="sm">Open</Button>
              </Link>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={()=>exportJSON(list)}>Export</Button>
              <Button size="sm" variant="destructive" className="cursor-pointer" onClick={()=>deleteList(list.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}