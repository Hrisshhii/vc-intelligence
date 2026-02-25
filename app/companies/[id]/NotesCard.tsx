/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Note = {
  id: string;
  content: string;
  createdAt: string;
};

export function NotesCard({ companyId,textareaRef }: { companyId: string | number; textareaRef?: React.RefObject<HTMLTextAreaElement|null> }) {
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`notes-${companyId}`);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setNotes(parsed);
    } catch {
      localStorage.removeItem(`notes-${companyId}`);
    }
  }, [companyId]);

  function handleAddNote() {
    if (!noteInput.trim()) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: noteInput,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(`notes-${companyId}`, JSON.stringify(updated));
    setNoteInput("");
  }

  function handleDelete(id: string) {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`notes-${companyId}`, JSON.stringify(updated));
  }

  return (
    <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Notes</h2>
          <Textarea ref={textareaRef} placeholder="Add internal notes..." value={noteInput} onChange={e=>setNoteInput(e.target.value)}/>
          <Button onClick={handleAddNote} className="cursor-pointer">Add Notes</Button>

          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              No internal notes yet. Add insights, thesis alignment, or red flags.
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
  );
}