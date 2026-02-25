/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { companies } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type List = {
  id: string;
  name: string;
  companies: string[];
  createdAt: string;
};

export default function ListDetailPage(){
  const params=useParams();
  const [list,setList]=useState<List|null>(null);

  useEffect(()=>{
    const stored=localStorage.getItem("vc-lists");
    if (!stored) return;

    const parsed:List[]=JSON.parse(stored);
    const found=parsed.find(l=>l.id===String(params.id));
    if(found) setList(found);
  },[params.id]);

  function removeCompany(companyId: string){
    if(!list) return;
    const updatedList={...list,
      companies:list.companies.filter(id=>id!==companyId),
    };

    const stored=JSON.parse(localStorage.getItem("vc-lists")||"[]");
    const updated=stored.map((l:List)=>l.id===list.id?updatedList:l);
    localStorage.setItem("vc-lists",JSON.stringify(updated));
    setList(updatedList);
  }

  if(!list) return <div>List not found</div>;

  const listCompanies=companies.filter(c=>list.companies.includes(c.id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{list.name}</h1>

      {listCompanies.length===0 && (
        <p className="text-sm text-muted-foreground">No companies in this list.</p>
      )}

      <div className="space-y-4">
        {listCompanies.map(company=>(
          <div key={company.id} className="border rounded-lg p-4 flex justify-between items-center">
            <Link href={`/companies/${company.id}`} className="font-medium hover:underline">{company.name}</Link>
            <Button size="sm" variant="destructive" onClick={()=>removeCompany(company.id)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
}