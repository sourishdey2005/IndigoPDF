
"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-headline">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Simple, fair, and transparent rules for using IndigoPDF.</p>
        </div>

        <div className="bg-white border rounded-3xl p-8 md:p-12 shadow-sm space-y-8 text-slate-600">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="text-primary" size={24} />
              1. Acceptance of Terms
            </h2>
            <p>By using IndigoPDF, you agree to these terms. If you do not agree, please do not use the service. Our tools are provided "as-is" for your convenience.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Permitted Use</h2>
            <p>You may use IndigoPDF for personal or professional use. You are responsible for ensuring that your use of the service complies with all applicable laws and regulations regarding document handling and privacy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. No Warranties</h2>
            <p>While we strive for 100% accuracy, IndigoPDF does not guarantee that document conversions or manipulations will be error-free. We are not liable for any data loss or corruption resulting from the use of our tools.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Privacy Guarantee</h2>
            <p>As per our Privacy Policy, we guarantee that we do not store your files. However, you are responsible for maintaining the security of your own device while using our browser-based tools.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after such modifications constitutes your acceptance of the new terms.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
