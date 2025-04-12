'use client';

import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface FileData {
  file_name: string;
  file_path: string;
}

const PdfViewerClient: React.FC<{ selectedFile: FileData }> = ({ selectedFile }) => {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const extractTextFromPdf = async () => {
      if (!selectedFile || !selectedFile.file_path) {
        console.log("extractTextFromPdf: selectedFile or file_path is missing.");
        setPdfText(null);
        setPdfError(null);
        return;
      }

      setLoadingPdf(true);
      setPdfError(null);

      console.log("Selected File:", selectedFile); 

      try {
        console.log("extractTextFromPdf: Fetching PDF with URL:", `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-files/${selectedFile.file_path}`); // Check URL

        const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-files/${selectedFile.file_path}`;
        const response = await fetch(pdfUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching PDF: ${response.status} - ${errorText}`);
          setPdfError(`Failed to fetch PDF: ${response.status}`);
          setLoadingPdf(false);
          return;
        }

        const pdfArrayBuffer = await response.arrayBuffer();
        console.log("extractTextFromPdf: PDF ArrayBuffer received (length:", pdfArrayBuffer.byteLength, ")"); // Check if data is received

        pdfjsLib.GlobalWorkerOptions.workerSrc = `/static/workers/pdf.worker.min.js`;
        console.log("extractTextFromPdf: Worker source set to:", pdfjsLib.GlobalWorkerOptions.workerSrc); // Check worker path

        const pdf = await pdfjsLib.getDocument(pdfArrayBuffer).promise;
        console.log("extractTextFromPdf: PDF document loaded successfully (number of pages:", pdf.numPages, ")"); // Check PDF load

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter(item => 'str' in item)
            .map(item => (item as { str: string }).str)
            .join(' ');
          fullText += pageText + '\n'; 
          console.log(`extractTextFromPdf: Processed page ${i}`); 
        }

        setPdfText(fullText);
        setLoadingPdf(false);
        console.log("extractTextFromPdf: Text extraction complete."); 
      } catch (error) {
        console.error('extractTextFromPdf: Error parsing PDF (Client):', error);
        setPdfText(null);
        setPdfError('Error extracting text from PDF.');
        setLoadingPdf(false);
      }
    };

    extractTextFromPdf();
  }, [selectedFile]);

  return (
    <div>
      {loadingPdf ? (
        <div>Loading PDF content...</div>
      ) : pdfError ? (
        <div className="text-red-500">{pdfError}</div>
      ) : pdfText ? (
        <pre className="text-sm whitespace-pre-wrap break-words">{pdfText}</pre>
      ) : (
        <div>No PDF content to display.</div>
      )}
    </div>
  );
};

export default PdfViewerClient;