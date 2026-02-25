/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import Link from "next/link";

type Props = {
  company: {
    id: string | number;
    name: string;
    website: string;
    stage: string;
    industry: string;
    location: string;
  };
};

export function CompanyHeader({ company }: Props) {

  return (
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
  );
}