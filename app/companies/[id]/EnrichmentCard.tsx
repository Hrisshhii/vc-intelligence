"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { scoreCompany } from "@/lib/scoring";
import type { Enrichment } from "./page";

type Props = {
  enrichment: Enrichment | null;
  loading: boolean;
  error: string;
  onEnrich: () => void;
  cachedEnrichment: Enrichment | null;
  hasRequested: boolean;
  onLoadCached: () => void;
  storedThesis: string;
  industry: string;
};

export function EnrichmentCard({
  enrichment,
  loading,
  error,
  onEnrich,
  cachedEnrichment,
  hasRequested,
  onLoadCached,
  storedThesis,
  industry,
}: Props) {

  const scoreResult =
    storedThesis && enrichment
      ? scoreCompany(storedThesis, enrichment, industry)
      : null;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">AI Enrichment</h2>

          <div className="flex gap-2">
            <Button onClick={onEnrich} disabled={loading}>
              {loading ? "Enriching..." : enrichment ? "Re-enrich" : "Enrich"}
            </Button>

            {cachedEnrichment && !hasRequested && (
              <Button variant="outline" onClick={onLoadCached}>
                View Previous
              </Button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {loading && (
          <p className="text-sm text-muted-foreground">
            Fetching and analyzing website...
          </p>
        )}

        {enrichment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-base leading-relaxed">
                {enrichment.summary}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">What They Do</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {enrichment.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {enrichment.keywords.map((k, i) => (
                  <Badge key={i} variant="outline">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Derived Signals</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {enrichment.signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Sources</h3>
              <ul className="text-sm space-y-1">
                {enrichment.sources.map((src, i) => (
                  <li key={i}>
                    <Link href={src} target="_blank" className="underline">
                      {src}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Enriched on {new Date(enrichment.timestamp).toLocaleString()}
            </p>
          </motion.div>
        )}

        {scoreResult && (
          <div className="mt-6 border-t pt-6">
            <h3 className="font-medium mb-2">
              Fund Thesis Alignment (Explainable)
            </h3>

            <div className="text-3xl font-semibold">
              {scoreResult.score}
            </div>

            <div className="mt-2 space-y-1">
              {scoreResult.reasons.map((r, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  • {r}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}