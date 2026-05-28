"use client";
import { Suspense } from "react";
import BlogShell from "@/components/blog/BlogShell";

function Skel() { return <div className="max-w-3xl mx-auto px-4 py-12"><div className="h-96 rounded-xl bg-page-warm animate-shimmer" /></div>; }

export default function BlogPage() {
  return <Suspense fallback={<Skel />}><BlogShell /></Suspense>;
}
