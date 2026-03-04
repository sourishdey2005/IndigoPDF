"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage(props: { params: Promise<any>; searchParams: Promise<any> }) {
  // Await promises in Client Component to prevent Next.js 15 enumeration warnings
  use(props.params);
  use(props.searchParams);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-headline">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Your privacy is our priority. We process everything in your browser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <ShieldCheck className="text-primary mb-4" size={32} />
            <h3 className="font-bold mb-2">No Server Uploads</h3>
            <p className="text-sm text-muted-foreground">Unlike other tools, IndigoPDF processes your files locally. Your sensitive data never touches our servers.</p>
          </div>
          <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10">
            <Lock className="text-secondary mb-4" size={32} />
            <h3 className="font-bold mb-2">Secure Processing</h3>
            <p className="text-sm text-muted-foreground">We use advanced browser technology to perform processing inside your local sandbox.</p>
          </div>
          <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10">
            <EyeOff className="text-accent mb-4" size={32} />
            <h3 className="font-bold mb-2">No Data Logging</h3>
            <p className="text-sm text-muted-foreground">We do not track, store, or analyze your document content. Your files are deleted from memory instantly.</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We do not collect any personal information or document data. We may use anonymous analytics to improve site performance, but this never includes file names or content.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. How We Process Files</h2>
            <p>All document processing and digital manipulations—including but not limited to merging, splitting, and compression—are executed exclusively within the user's local computing environment. Our service architecture ensures that no raw document data is transmitted to or stored on external server infrastructure.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
