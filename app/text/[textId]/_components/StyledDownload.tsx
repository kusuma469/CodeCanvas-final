import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isElementNode } from "lexical";
import { jsPDF } from "jspdf";
import { FileDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from "react";
export function StyledPdfDownload() {
  const [editor] = useLexicalComposerContext();
  const [isLoading, setIsLoading] = useState(false);
  const getFormattedContent = () => {
    return editor.getEditorState().read(() => {
      const root = $getRoot();
      let content = '';
      
      root.getChildren().forEach((node) => {
        if ($isElementNode(node)) {
          const type = node.getType();
          const text = node.getTextContent();
          
          switch (type) {
            case 'heading':
              content += `\n# ${text}\n`;
              break;
            case 'quote':
              content += `\n> ${text}\n`;
              break;
            case 'list':
              node.getChildren().forEach((item, index) => {
                content += `\n${index + 1}. ${item.getTextContent()}`;
              });
              content += '\n';
              break;
            default:
              content += `\n${text}\n`;
          }
        }
      });
      
      return content;
    });
  };
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const content = getFormattedContent();
      const doc = new jsPDF();
      // Set document properties
      doc.setProperties({
        title: 'Document',
        subject: 'Generated Document',
        author: 'Editor',
        keywords: 'document, pdf',
        creator: 'Editor'
      });
      // Add header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Document", 20, 20);
      // Add metadata
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
      // Add content with formatting
      doc.setFontSize(12);
      doc.setTextColor(0);
      // Process content
      const lines = content.split('\n');
      let y = 40;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      lines.forEach((line) => {
        // Check if we need a new page
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        // Format different types of content
        if (line.startsWith('#')) {
          // Heading
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text(line.substring(2), margin, y);
          y += lineHeight * 1.5;
        } else if (line.startsWith('>')) {
          // Quote
          doc.setFont("helvetica", "italic");
          doc.setFontSize(12);
          doc.setTextColor(100);
          doc.text(line.substring(2), margin + 10, y);
          y += lineHeight;
          doc.setTextColor(0);
        } else if (line.match(/^\d+\./)) {
          // List item
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          doc.text(line, margin + 5, y);
          y += lineHeight;
        } else if (line.trim()) {
          // Normal paragraph
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          const splitLine = doc.splitTextToSize(line, doc.internal.pageSize.width - (margin * 2));
          splitLine.forEach((subLine: string) => {
            if (y > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(subLine, margin, y);
            y += lineHeight;
          });
        }
      });
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
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