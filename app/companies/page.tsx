/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {useEffect, useMemo,useState} from "react";
import { companies,Company } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from "@/components/ui/table";
import { Card,CardContent } from "@/components/ui/card"
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { scoreCompany } from "@/lib/scoring";

const PAGE_SIZE=10;

export default function CompaniesPage() {
  const [search,setSearch]=useState("");
  const [stageFilter,setStageFilter]=useState("All");
  const [industryFilter, setIndustryFilter] = useState("All")
  const [sortField,setSortField]=useState<keyof Company>("name");
  const [sortAsc,setSortAsc]=useState(true);
  const [page,setPage]=useState(1);
  const [searchName, setSearchName] = useState("");
  const searchParams = useSearchParams();

  const [thesis,setThesis]=useState("");

  useEffect(()=>{
    const stored=localStorage.getItem("vc-thesis");
    if(stored) setThesis(stored);
  },[]);

  function saveThesis(){
    localStorage.setItem("vc-thesis",thesis);
  }

  useEffect(()=>{
    setPage(1)
  }, [search, stageFilter, industryFilter])

  const filtered=useMemo(()=>{
    let data=[...companies];
    if(search){
      data=data.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
    }
    if(stageFilter!=="All"){
      data=data.filter(c=>c.stage.toLowerCase()===stageFilter.toLowerCase());
    }
    if(industryFilter!=="All"){
      data=data.filter(c=>c.industry.toLowerCase()===industryFilter.toLowerCase())
    }
    if(thesis){
      data.sort((a, b)=>{
        const enrichmentA = JSON.parse(localStorage.getItem(`enrichment-${a.id}`) || "null");
        const enrichmentB = JSON.parse(localStorage.getItem(`enrichment-${b.id}`) || "null");
        const scoreA = scoreCompany(thesis, enrichmentA, a.industry).score;
        const scoreB = scoreCompany(thesis, enrichmentB, b.industry).score;

        return scoreB - scoreA;
      });
    }else{
        data.sort((a,b)=>{
        const valA=a[sortField];
        const valB=b[sortField];

        if(valA<valB) return sortAsc?-1:1;
        if (valA>valB) return sortAsc?1:-1;
        return 0;
      });
    }
    
    return data;
  },[search,stageFilter,sortField,sortAsc,industryFilter,thesis]);

  const totalPages=Math.ceil(filtered.length/PAGE_SIZE);
  const paginated=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

  function handleSort(field:keyof Company){
    if(field===sortField){
      setSortAsc(!sortAsc)
    }else{
      setSortField(field);
      setSortAsc(true);
    }
  }

  useEffect(()=>{
    const handleKey=(e:KeyboardEvent)=>{
      if(e.key==="/" && document.activeElement?.tagName!=="INPUT"){
        e.preventDefault();
        document.querySelector("input")?.focus()
      }
    }
    window.addEventListener("keydown",handleKey);
    return ()=>window.removeEventListener("keydown",handleKey);
  },[])

  const isFiltering=search!==""||stageFilter!="All"||industryFilter!=="All";

  function saveSearch(){
    if(!searchName.trim()) return;
    const existing=JSON.parse(localStorage.getItem("vc-saved-searches")||"[]");
    const newSearch={
      id:crypto.randomUUID(),
      name: searchName,
      query:search,
      filters:{
        stage:stageFilter!=="All"?stageFilter:"",
        industry:industryFilter!=="All"?industryFilter:"",
      },
      createdAt:new Date().toISOString(),
    };
    localStorage.setItem("vc-saved-searches",JSON.stringify([newSearch,...existing]));
    setSearchName("");
  };

  useEffect(()=>{
    const q=searchParams.get("q")||"";
    const stageParam=searchParams.get("stage")||"";
    const industryParam=searchParams.get("industry")||"";

    setSearch(q);
    setStageFilter(stageParam?stageParam:"All");
    setIndustryFilter(industryParam?industryParam:"All");
    setPage(1);
  },[searchParams]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3}} className="flex gap-4">
        <div className="relative w-full">
          <Input placeholder="Search companies..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-2">
          <Input value={thesis} onChange={(e) => setThesis(e.target.value)} placeholder="Fund thesis (e.g. AI infrastructure, enterprise SaaS...)"/>
          <Button onClick={saveThesis} className="cursor-pointer">Save Thesis</Button>
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm cursor-pointer"
        >
          <option value="All">All</option>
          <option>Growth</option>
          <option>Late</option>
        </select>
        <select value={industryFilter} onChange={e=>setIndustryFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm cursor-pointer">
          <option value="All">All Industries</option>
          <option>AI</option>
          <option>Fintech</option>
          <option>DevTools</option>
        </select>
      </motion.div>

      {thesis && (
        <p className="text-xs text-muted-foreground">
          Companies ranked by thesis alignment.
        </p>
      )}
      
      {isFiltering && filtered.length !== 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filtered.length} results</span>
        </div>
      )}

      <div className="flex gap-2">
        <Input placeholder="Save this search as..." value={searchName} onChange={e=>setSearchName(e.target.value)}/>
        <Button onClick={saveSearch}>Save Search</Button>
      </div>
      

      {filtered.length === 0?(
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No companies match your filters.
          </CardContent>
        </Card>
      ):(
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <motion.div key={search+stageFilter+industryFilter+sortField+sortAsc+page} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{duration:0.35}} className="max-h-[80%] overflow-auto">
            <Table>
              <TableHeader  className="bg-muted/90 sticky top-0 z-10">
                <TableRow>
                  <TableHead onClick={()=>handleSort("name")} className="p-2 text-[1.25rem] font-bold text-foreground tracking-wide uppercase cursor-pointer">Name {sortField==="name" && (sortAsc?"↑":"↓")}</TableHead>
                  <TableHead onClick={()=>handleSort("industry")} className="p-2 text-[1.25rem] font-bold text-foreground tracking-wide uppercase cursor-pointer">Industry {sortField==="industry" && (sortAsc?"↑":"↓")}</TableHead>
                  <TableHead className="p-2 text-[1.25rem] font-bold tracking-wide uppercase text-foreground">Stage</TableHead>
                  <TableHead className="p-2 text-[1.25rem] font-bold tracking-wide uppercase text-foreground">Location</TableHead>
                  <TableHead className="p-2 text-[1.25rem] font-bold tracking-wide uppercase text-foreground">SCORE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(company => {
                  const enrichment=JSON.parse(localStorage.getItem(`enrichment-${company.id}`)||"null");
                  const result=scoreCompany(thesis,enrichment,company.industry);

                  return (
                    <TableRow key={company.id} className="text-[1.15rem] hover:bg-muted/40 transition-colors border-b last:border-0">
                      <TableCell>
                        <Link href={`/companies/${company.id}`} className="font-medium hover:underline">
                          {company.name}
                        </Link>
                      </TableCell>

                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.stage}</TableCell>
                      <TableCell>{company.location}</TableCell>

                      <TableCell>
                        <span className={`font-semibold ${
                            result.score>70?"text-green-600"
                              :result.score>40?"text-yellow-600"
                              :"text-muted-foreground"
                          }`}
                        >
                          {thesis ? result.score : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </motion.div>
          
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button variant="outline" disabled={page===1} onClick={()=>setPage(p=>p-1)} className="cursor-pointer">Prev</Button>
        <span className="text-muted-foreground">Page {page} of {totalPages}</span>
        <Button variant="outline" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="cursor-pointer">Next</Button>
      </div>
    </div>
  );
}