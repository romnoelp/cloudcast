'use client';

import React, { useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { sendPdfTextToAI } from './actions';
import { useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

interface FileData {
  file_name: string;
  file_path: string;
}

const PdfViewerClient = ({ selectedFile }: { selectedFile: FileData }) => {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isSendingToAI, startSendingToAI] = useTransition();
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setAiResponse(null);
    setAiError(null);
  }, [selectedFile]);

  const sendTextToAIServer = useCallback(async (text: string) => {
    startSendingToAI(async () => {
      setAiResponse(null);
      setAiError(null);

      try {
        const result = await sendPdfTextToAI(text);
        if (result?.success && result.data) {
          console.log("✅ AI Server Response:", result.data);
          setAiResponse(result.data?.result || "No response text available");
        } else {
          setAiError(result?.error || 'Failed to get a valid AI response.');
        }
      } catch (err) {
        console.error('❌ Error sending to AI:', err);
        setAiError('An error occurred while sending data to AI.');
      }
    });
  }, []);

  useEffect(() => {
    const extractTextFromPdf = async () => {
      if (!selectedFile?.file_path) {
        setPdfError('No file selected or file path missing.');
        return;
      }

      setLoadingPdf(true);
      setPdfError(null);

      try {
        const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-files/${selectedFile.file_path}`;
        const response = await fetch(pdfUrl);

        if (!response.ok) {
          setPdfError(`Failed to fetch PDF: ${response.status}`);
          return;
        }

        const pdfArrayBuffer = await response.arrayBuffer();
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/static/workers/pdf.worker.min.js`;

        const pdf = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item): item is TextItem => 'str' in item)
            .map(item => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        if (!fullText.trim()) {
          setPdfError('PDF text is empty.');
        } else {
          sendTextToAIServer(fullText);
        }
      } catch (error) {
        console.error('❌ Error extracting PDF:', error);
        setPdfError('Failed to extract text from PDF.');
      } finally {
        setLoadingPdf(false);
      }
    };

    extractTextFromPdf();
  }, [selectedFile, sendTextToAIServer]);

  return (
    <div className="p-4 space-y-4">
      {loadingPdf && <p className="text-blue-500">📄 Loading PDF content...</p>}
      {pdfError && <p className="text-red-500">❌ {pdfError}</p>}

      <AnimatePresence>
        {isSendingToAI && !aiResponse && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <Skeleton className="h-6 bg-gradient-to-r from-blue-500 via-teal-400 to-purple-600 rounded" />
            <Skeleton className="h-6 bg-gradient-to-r from-blue-500 via-teal-400 to-purple-600 rounded" />
          </motion.div>
        )}
      </AnimatePresence>

      {aiError && <p className="text-red-500">⚠️ AI Error: {aiError}</p>}

      {aiResponse && (
        <p className="text-default text-justify whitespace-pre-line leading-relaxed">
          {aiResponse}
        </p>
      )}

      {!loadingPdf && !aiResponse && !aiError && !isSendingToAI && (
        <p className="text-gray-500">🕵️ No data yet. Select a PDF to analyze.</p>
      )}
    </div>
  );
};

export default PdfViewerClient;