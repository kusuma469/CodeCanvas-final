import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot,} from "lexical";
import { jsPDF } from "jspdf";
import { FileDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from "react";
export function PdfDownload() {
  const [editor] = useLexicalComposerContext();
  const [isLoading, setIsLoading] = useState(false);
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Get editor content
      const editorState = editor.getEditorState();
      const content = editorState.read(() => {
        return $getRoot().getTextContent();
      });
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set font
      doc.setFont("helvetica");
      
      // Add title
      doc.setFontSize(24);
      doc.text("Document", 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add content
      doc.setFontSize(12);
      doc.setTextColor(0);
      
      // Split content into lines and add to PDF
      const lines = doc.splitTextToSize(content, doc.internal.pageSize.width - 40);
      doc.text(lines, 20, 40);
      // Save the PDF
      doc.save(`document-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <FileDown className={isLoading ? 'animate-pulse' : ''} size={20} />
      {isLoading ? 'Generating PDF...' : 'Download PDF'}
    </Button>
  );
}