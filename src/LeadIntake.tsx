import React, { useState, useRef } from 'react';
import { Upload, FileImage, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { cn } from './lib/utils';
import { GoogleGenAI, Type } from '@google/genai';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

interface LeadIntakeProps {
  onImportComplete: () => void;
  userPlatoons: string[];
}

export const LeadIntake: React.FC<LeadIntakeProps> = ({ onImportComplete, userPlatoons }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedLeads, setParsedLeads] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'text/csv'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Invalid file type. Please upload an image or CSV spreadsheet.');
      return;
    }
    setFile(selectedFile);
    setParsedLeads([]);
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const isImage = file.type.startsWith('image/');
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          const base64Data = result.split(',')[1];

          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
              parts: [
                {
                  text: 'Extract lead information from this file. Return a JSON array of objects. Each object should have: firstName, lastName, email, phone, age, education, interest, mos, source, message. If a field is missing, leave it empty. Try to guess the first and last name if only a full name is provided.'
                },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: file.type || 'text/csv'
                  }
                }
              ]
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    firstName: { type: Type.STRING },
                    lastName: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    age: { type: Type.STRING },
                    education: { type: Type.STRING },
                    interest: { type: Type.STRING },
                    mos: { type: Type.STRING },
                    source: { type: Type.STRING },
                    message: { type: Type.STRING }
                  }
                }
              }
            }
          });

          const jsonStr = response.text?.trim() || '[]';
          const leads = JSON.parse(jsonStr);
          setParsedLeads(leads);
        } catch (err: any) {
          console.error('Error parsing file:', err);
          setError(err.message || 'Failed to parse file. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file.');
      setIsProcessing(false);
    }
  };

  const importLeads = async () => {
    if (parsedLeads.length === 0) return;
    setIsProcessing(true);
    try {
      const recruiterName = auth.currentUser?.displayName || 'Unknown';
      const platoon = userPlatoons[0] || 'Unassigned';
      
      const promises = parsedLeads.map(lead => {
        return addDoc(collection(db, 'leads'), {
          ...lead,
          timestamp: new Date().toISOString(),
          status: 'New',
          recruiterId: auth.currentUser?.uid,
          recruiterName,
          platoon,
          interactions: [{ element: 'Lead Sheet Upload', timestamp: new Date().toISOString(), type: 'view' }]
        });
      });
      
      await Promise.all(promises);
      setParsedLeads([]);
      setFile(null);
      onImportComplete();
    } catch (err: any) {
      console.error('Error importing leads:', err);
      setError('Failed to import leads. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-army-gold">Lead Intake</h2>
        <p className="text-zinc-400 text-sm">Upload a picture of a lead sheet or a spreadsheet to automatically extract and import leads.</p>
      </div>

      {!file && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-all",
            isDragging ? "border-army-gold bg-army-gold/10" : "border-zinc-800 bg-zinc-900/50 hover:border-army-gold/50 hover:bg-zinc-900"
          )}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} 
            className="hidden" 
            accept="image/*,.csv,.xlsx,.xls"
          />
          <div className="flex gap-4 mb-4 text-zinc-500">
            <FileImage className="w-12 h-12" />
            <FileSpreadsheet className="w-12 h-12" />
          </div>
          <p className="text-lg font-black uppercase text-white mb-2">Drag & Drop File Here</p>
          <p className="text-sm text-zinc-500">or click to browse</p>
          <p className="text-xs text-zinc-600 mt-4">Supports Images (JPG, PNG) and Spreadsheets (CSV)</p>
        </div>
      )}

      {file && parsedLeads.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-army-gold/10 rounded-full flex items-center justify-center text-army-gold">
            {file.type.startsWith('image/') ? <FileImage className="w-8 h-8" /> : <FileSpreadsheet className="w-8 h-8" />}
          </div>
          <div>
            <p className="font-black text-white">{file.name}</p>
            <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          
          {error && (
            <div className="bg-red-950/50 text-red-400 p-3 rounded text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-4 w-full max-w-xs">
            <button 
              onClick={() => { setFile(null); setError(null); }}
              className="flex-1 py-2 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-xs font-black uppercase"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              onClick={processFile}
              className="flex-1 py-2 bg-army-gold text-army-black hover:bg-yellow-400 transition-colors text-xs font-black uppercase flex items-center justify-center gap-2"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process File'}
            </button>
          </div>
        </div>
      )}

      {parsedLeads.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-black uppercase text-neon-green flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Successfully Parsed {parsedLeads.length} Leads
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Review the extracted data before importing.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setParsedLeads([]); setFile(null); }}
                className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-xs font-black uppercase"
                disabled={isProcessing}
              >
                Discard
              </button>
              <button 
                onClick={importLeads}
                className="px-6 py-2 bg-neon-green text-black hover:bg-green-400 transition-colors text-xs font-black uppercase flex items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import Leads'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-800 rounded-lg">
            <table className="w-full text-left text-[10px] uppercase">
              <thead className="bg-zinc-900 text-zinc-500 font-black border-b border-zinc-800">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Age/Ed</th>
                  <th className="p-3">Interest/MOS</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Message</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 bg-zinc-950">
                {parsedLeads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-3 font-black text-white">{lead.firstName} {lead.lastName}</td>
                    <td className="p-3 text-zinc-400">
                      <div>{lead.email}</div>
                      <div>{lead.phone}</div>
                    </td>
                    <td className="p-3 text-zinc-400">
                      <div>{lead.age}</div>
                      <div>{lead.education}</div>
                    </td>
                    <td className="p-3 text-army-gold">
                      <div>{lead.interest}</div>
                      <div>{lead.mos}</div>
                    </td>
                    <td className="p-3 text-zinc-500">{lead.source}</td>
                    <td className="p-3 text-zinc-500 truncate max-w-[150px]" title={lead.message}>{lead.message}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => setParsedLeads(prev => prev.filter((_, i) => i !== idx))}
                        className="text-zinc-600 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
