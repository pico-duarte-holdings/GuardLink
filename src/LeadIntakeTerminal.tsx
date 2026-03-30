/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Camera, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle,
  Download, Edit, Trash2, X, Plus, Check, Eye, Search, RefreshCw,
  FileText, Zap, Table, ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebase';
import { addOrUpdateContact, normalizePhoneE164 } from './lib/brevo';
import { cn } from './lib/utils';
import * as XLSX from 'xlsx';

// --- Types ---
interface ScannedEntry {
  name: string;
  phone: string;
  email: string;
  confidence: number;
  edited?: boolean;
}

interface ImportBatch {
  id: string;
  source: 'AI_OCR' | 'BULK_PARSER';
  rows: number;
  avgConfidence: number;
  timestamp: string;
  status: 'pending' | 'imported' | 'partial';
}

interface LeadIntakeTerminalProps {
  team: any[];
  profileData: any;
  userPlatoons: string[];
  isCommander: boolean;
  userRole: string | null;
}

export const LeadIntakeTerminal: React.FC<LeadIntakeTerminalProps> = ({
  team, profileData, userPlatoons, isCommander, userRole,
}) => {
  // Scanner state
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<ScannedEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const scanInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Spreadsheet state
  const [spreadsheetRows, setSpreadsheetRows] = useState<ScannedEntry[]>([]);
  const [spreadsheetFileName, setSpreadsheetFileName] = useState('');
  const [isParsingSheet, setIsParsingSheet] = useState(false);
  const spreadsheetInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [assignRecruiter, setAssignRecruiter] = useState('');

  // Active sub-section
  const [activeSection, setActiveSection] = useState<'scanner' | 'spreadsheet' | 'history'>('scanner');

  // --- Gemini OCR ---
  const handleScanUpload = async (file: File) => {
    setScanError('');
    setScanResults([]);
    setIsScanning(true);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setScanImage(result);
          // Strip prefix for API
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) { setScanError('Gemini API key not configured'); setIsScanning(false); return; }

      const ai = new GoogleGenAI({ apiKey: apiKey as string });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: file.type || 'image/jpeg',
                data: base64,
              },
            },
            {
              text: `You are a precise data-extraction assistant. Analyze this sign-in sheet image carefully.

CRITICAL RULES - READ BEFORE EXTRACTING:
1. Count EVERY row/line on the sheet first. Do NOT skip any entry, even if the handwriting is messy or partially illegible.
2. Extract ALL entries — every single person who wrote on this sheet must appear in your output. Missing even one entry is unacceptable.
3. For each entry extract: full_name, phone_number, email (if visible).
4. If a field is hard to read, make your best guess and set a low confidence. Never skip a row because it is hard to read.
5. If only a name is visible with no phone or email, still include that row with empty strings for the missing fields.
6. Include header rows or example rows ONLY if they are clearly filled in by a real person, not pre-printed labels.

Return ONLY a JSON array with absolutely no markdown formatting, no backticks, no explanation:
[{ "name": "...", "phone": "...", "email": "...", "confidence": 0.0-1.0 }]

Confidence guide: 1.0 = perfectly clear, 0.7 = mostly legible, 0.4 = guessing, 0.1 = barely visible but a row exists.

Double-check: count the rows in your output and compare to the rows on the sheet. They MUST match.`,
            },
          ],
        }],
      });

      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Parse JSON from response - handle possible markdown code blocks
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        setScanError('Could not parse AI response. Try a clearer image.');
        setIsScanning(false);
        return;
      }

      const parsed: ScannedEntry[] = JSON.parse(jsonMatch[0]);
      setScanResults(parsed.map(e => ({ ...e, confidence: Math.min(1, Math.max(0, e.confidence || 0.5)) })));
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err?.message || 'Failed to process image');
    }
    setIsScanning(false);
  };

  // --- Spreadsheet parsing ---
  const handleSpreadsheetUpload = async (file: File) => {
    setIsParsingSheet(true);
    setSpreadsheetFileName(file.name);
    setSpreadsheetRows([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (json.length === 0) {
        setIsParsingSheet(false);
        return;
      }

      // Auto-detect columns
      const mapCol = (row: any, candidates: string[]): string => {
        for (const c of candidates) {
          for (const key of Object.keys(row)) {
            if (key.toLowerCase().replace(/[^a-z]/g, '').includes(c)) return String(row[key] || '');
          }
        }
        return '';
      };

      const rows: ScannedEntry[] = json.map(row => ({
        name: mapCol(row, ['name', 'fullname', 'firstname']) +
              (mapCol(row, ['lastname', 'lname']) ? ' ' + mapCol(row, ['lastname', 'lname']) : ''),
        phone: mapCol(row, ['phone', 'cell', 'mobile', 'tel']),
        email: mapCol(row, ['email', 'mail']),
        confidence: 1.0,
      })).filter(r => r.name.trim());

      setSpreadsheetRows(rows);
    } catch (err: any) {
      console.error('Parse error:', err);
    }
    setIsParsingSheet(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleSpreadsheetUpload(file);
    }
  }, []);

  // --- Download template ---
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['FirstName', 'LastName', 'Phone', 'Email', 'Source', 'Notes'],
      ['John', 'Doe', '555-123-4567', 'john@example.com', 'Career Fair', ''],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, 'GuardLink_Lead_Template.xlsx');
  };

  // --- Import to Firestore ---
  const importToFirestore = async (entries: ScannedEntry[], source: 'AI_OCR' | 'BULK_PARSER') => {
    if (!auth.currentUser || entries.length === 0) return;
    setIsImporting(true);

    const batchId = `batch_${Date.now()}`;
    const rName = `${profileData.rank} ${profileData.lastName}`.trim() || 'Recruiter';

    let targetUid = auth.currentUser.uid;
    let targetName = rName;
    let targetPlatoon = profileData.platoons?.[0] || 'HQ';

    if (assignRecruiter && (userRole === 'admin' || isCommander)) {
      const found = team.find(t => t.uid === assignRecruiter);
      if (found) {
        targetUid = found.uid;
        targetName = found.displayName || 'Recruiter';
        targetPlatoon = found.platoons?.[0] || 'HQ';
      }
    }

    let imported = 0;
    const failed: string[] = [];
    for (const entry of entries) {
      try {
        const nameParts = entry.name.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.slice(1).join(' ') || '';

        await addDoc(collection(db, 'leads'), {
          firstName, lastName,
          phone: entry.phone || '',
          email: entry.email || '',
          source: source === 'AI_OCR' ? 'Sign-In Sheet (AI)' : 'Spreadsheet Import',
          status: 'New',
          mos: 'TBD',
          timestamp: new Date().toISOString(),
          recruiterId: targetUid,
          recruiterName: targetName,
          platoon: targetPlatoon,
          importMethod: source,
          importBatchId: batchId,
          confidence: entry.confidence,
        });
        // Sync to Brevo (fire-and-forget)
        if (entry.email) {
          addOrUpdateContact({
            email: entry.email,
            firstName,
            lastName,
            phone: entry.phone ? normalizePhoneE164(entry.phone) : undefined,
          }).catch(() => {});
        }
        imported++;
      } catch (err: any) {
        console.error('Import error for entry:', entry, err);
        failed.push(`${entry.name || '(no name)'}: ${err?.message || err}`);
      }
    }

    const avgConf = entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length;
    setImportBatches(prev => [{
      id: batchId,
      source,
      rows: imported,
      avgConfidence: avgConf,
      timestamp: new Date().toISOString(),
      status: imported === entries.length ? 'imported' : 'partial',
    }, ...prev]);

    // Clear appropriate state
    if (source === 'AI_OCR') { setScanResults([]); setScanImage(null); }
    else { setSpreadsheetRows([]); setSpreadsheetFileName(''); }
    setAssignRecruiter('');
    setIsImporting(false);
    if (failed.length > 0) {
      alert(`Imported ${imported} of ${entries.length} leads.\n\nFailed entries:\n${failed.join('\n')}`);
    } else {
      alert(`Successfully imported all ${imported} leads!`);
    }
  };

  // --- Editable table row ---
  const updateEntry = (
    list: ScannedEntry[], setList: React.Dispatch<React.SetStateAction<ScannedEntry[]>>,
    index: number, field: keyof ScannedEntry, value: string
  ) => {
    const updated = [...list];
    (updated[index] as any)[field] = value;
    updated[index].edited = true;
    setList(updated);
  };

  const removeEntry = (
    list: ScannedEntry[], setList: React.Dispatch<React.SetStateAction<ScannedEntry[]>>,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  // --- Render editable preview table ---
  const renderPreviewTable = (entries: ScannedEntry[], setEntries: React.Dispatch<React.SetStateAction<ScannedEntry[]>>, source: 'AI_OCR' | 'BULK_PARSER') => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-army-gold">{entries.length} Records Detected</span>
          <span className={cn("text-[9px] font-mono font-black tracking-wider px-2 py-0.5 border",
            source === 'AI_OCR' ? "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10" : "text-neon-green border-neon-green/30 bg-neon-green/10"
          )}>{source}</span>
        </div>
        <div className="flex items-center gap-2">
          {(userRole === 'admin' || isCommander) && (
            <select value={assignRecruiter} onChange={e => setAssignRecruiter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 p-1.5 text-[10px] font-black uppercase text-white outline-none">
              <option value="">Assign to me</option>
              {team.map(t => <option key={t.uid} value={t.uid}>{t.displayName}</option>)}
            </select>
          )}
          <button onClick={() => importToFirestore(entries, source)} disabled={isImporting}
            className="px-4 py-2 bg-army-gold text-black text-[10px] font-black uppercase hover:bg-army-gold/90 disabled:opacity-50 flex items-center gap-1">
            {isImporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Import All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded">
        <table className="w-full text-left text-[10px] uppercase">
          <thead className="bg-zinc-900/80 text-zinc-500 font-black border-b border-zinc-800">
            <tr>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              {source === 'AI_OCR' && <th className="p-3 w-32">Confidence</th>}
              <th className="p-3 w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {entries.map((entry, i) => (
              <tr key={i} className={cn("hover:bg-white/5", entry.confidence < 0.6 && source === 'AI_OCR' && "bg-red-950/20")}>
                <td className="p-3 text-zinc-500 font-mono">{i + 1}</td>
                <td className="p-3">
                  <input value={entry.name} onChange={e => updateEntry(entries, setEntries, i, 'name', e.target.value)}
                    className="bg-transparent border-b border-zinc-700 focus:border-army-gold outline-none text-white w-full py-0.5" />
                </td>
                <td className="p-3">
                  <input value={entry.phone} onChange={e => updateEntry(entries, setEntries, i, 'phone', e.target.value)}
                    className="bg-transparent border-b border-zinc-700 focus:border-army-gold outline-none text-white w-full py-0.5" />
                </td>
                <td className="p-3">
                  <input value={entry.email} onChange={e => updateEntry(entries, setEntries, i, 'email', e.target.value)}
                    className="bg-transparent border-b border-zinc-700 focus:border-army-gold outline-none text-white w-full py-0.5" />
                </td>
                {source === 'AI_OCR' && (
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full",
                          entry.confidence >= 0.8 ? "bg-green-400" : entry.confidence >= 0.6 ? "bg-army-gold" : "bg-red-400"
                        )} style={{ width: `${entry.confidence * 100}%` }} />
                      </div>
                      <span className={cn("text-[9px] font-mono font-bold",
                        entry.confidence >= 0.8 ? "text-green-400" : entry.confidence >= 0.6 ? "text-army-gold" : "text-red-400"
                      )}>{Math.round(entry.confidence * 100)}%</span>
                    </div>
                  </td>
                )}
                <td className="p-3 text-right">
                  <button onClick={() => removeEntry(entries, setEntries, i)} className="p-1 text-zinc-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-1">// INTAKE_TERMINAL //</p>
          <h2 className="text-xl font-black text-army-gold uppercase tracking-tight">Lead Intake Terminal</h2>
        </div>
      </div>

      {/* Sub-section tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveSection('scanner')}
          className={cn("px-4 py-2 font-black uppercase text-[10px] tracking-widest border-2 flex items-center gap-2",
            activeSection === 'scanner' ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30" : "text-zinc-500 border-zinc-800 hover:border-zinc-600")}>
          <Camera className="w-3 h-3" /> AI Scanner
        </button>
        <button onClick={() => setActiveSection('spreadsheet')}
          className={cn("px-4 py-2 font-black uppercase text-[10px] tracking-widest border-2 flex items-center gap-2",
            activeSection === 'spreadsheet' ? "bg-neon-green/10 text-neon-green border-neon-green/30" : "text-zinc-500 border-zinc-800 hover:border-zinc-600")}>
          <FileSpreadsheet className="w-3 h-3" /> Spreadsheet
        </button>
        <button onClick={() => setActiveSection('history')}
          className={cn("px-4 py-2 font-black uppercase text-[10px] tracking-widest border-2 flex items-center gap-2",
            activeSection === 'history' ? "bg-army-gold/10 text-army-gold border-army-gold/30" : "text-zinc-500 border-zinc-800 hover:border-zinc-600")}>
          <Eye className="w-3 h-3" /> Recent Imports
        </button>
      </div>

      {/* === AI Scanner Section === */}
      {activeSection === 'scanner' && (
        <div className="hud-border bg-army-black/50 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <h3 className="text-sm font-black uppercase text-neon-cyan tracking-widest">[ AI_PROTOCOL ] Sign-In Sheet Scanner</h3>
          </div>

          {/* Upload area */}
          {!scanImage && scanResults.length === 0 && (
            <div className="border-2 border-dashed border-zinc-700 hover:border-neon-cyan/50 rounded-lg p-8 text-center transition-colors">
              <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
              <p className="text-sm text-zinc-400 mb-4">Upload a photo of a handwritten sign-in sheet</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input ref={scanInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleScanUpload(e.target.files[0]); }} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { if (e.target.files?.[0]) handleScanUpload(e.target.files[0]); }} />
                <button onClick={() => scanInputRef.current?.click()}
                  className="px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-black uppercase text-[10px] hover:bg-neon-cyan/20 flex items-center gap-2 justify-center">
                  <Upload className="w-4 h-4" /> Upload Image
                </button>
                <button onClick={() => cameraInputRef.current?.click()}
                  className="px-6 py-3 bg-army-gold/10 border border-army-gold/30 text-army-gold font-black uppercase text-[10px] hover:bg-army-gold/20 flex items-center gap-2 justify-center sm:inline-flex">
                  <Camera className="w-4 h-4" /> Take Photo
                </button>
              </div>
              <p className="text-[9px] text-zinc-600 mt-3 font-mono">Supports JPG, PNG, HEIC</p>
            </div>
          )}

          {/* Scanning indicator */}
          {isScanning && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-neon-cyan animate-spin mx-auto mb-4" />
              <p className="text-sm text-zinc-400 font-black uppercase">Processing with Gemini AI...</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">// EXTRACTING_HANDWRITTEN_DATA //</p>
            </div>
          )}

          {/* Error */}
          {scanError && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-3 mt-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-bold">Scan Error</p>
                <p className="text-xs text-red-300/70 mt-1">{scanError}</p>
              </div>
              <button onClick={() => { setScanError(''); setScanImage(null); }} className="ml-auto text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Preview image + results */}
          {scanImage && !isScanning && scanResults.length === 0 && !scanError && (
            <div className="text-center py-4">
              <img src={scanImage} alt="Uploaded sign-in sheet" className="max-h-48 mx-auto rounded-lg border border-zinc-700 mb-4" />
              <p className="text-zinc-500 text-sm">No entries detected. Try a clearer image.</p>
              <button onClick={() => { setScanImage(null); }} className="mt-2 px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase border border-zinc-700">Try Again</button>
            </div>
          )}

          {/* Scan results table */}
          {scanResults.length > 0 && (
            <div>
              {scanImage && (
                <div className="flex items-center gap-4 mb-4">
                  <img src={scanImage} alt="Scanned" className="h-20 rounded border border-zinc-700" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-neon-cyan">AI Extraction Complete</p>
                    <p className="text-[9px] text-zinc-500 font-mono">Review and correct entries below before importing</p>
                  </div>
                  <button onClick={() => { setScanResults([]); setScanImage(null); }} className="ml-auto px-3 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase border border-zinc-700 hover:text-white">
                    <RefreshCw className="w-3 h-3 inline mr-1" /> New Scan
                  </button>
                </div>
              )}
              {renderPreviewTable(scanResults, setScanResults, 'AI_OCR')}
            </div>
          )}
        </div>
      )}

      {/* === Spreadsheet Section === */}
      {activeSection === 'spreadsheet' && (
        <div className="hud-border bg-army-black/50 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-neon-green" />
              <h3 className="text-sm font-black uppercase text-neon-green tracking-widest">[ BULK_DATA_LOAD ] Spreadsheet Upload</h3>
            </div>
            <button onClick={downloadTemplate}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase hover:text-army-gold flex items-center gap-1">
              <Download className="w-3 h-3" /> Download Template
            </button>
          </div>

          {spreadsheetRows.length === 0 && !isParsingSheet && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragOver ? "border-neon-green/60 bg-neon-green/5" : "border-zinc-700 hover:border-neon-green/30"
              )}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
              <p className="text-sm text-zinc-400 mb-1">Drag & drop a CSV or XLSX file here</p>
              <p className="text-[10px] text-zinc-600 mb-4 font-mono">Or click to browse</p>
              <input ref={spreadsheetInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleSpreadsheetUpload(e.target.files[0]); }} />
              <button onClick={() => spreadsheetInputRef.current?.click()}
                className="px-6 py-3 bg-neon-green/10 border border-neon-green/30 text-neon-green font-black uppercase text-[10px] hover:bg-neon-green/20 flex items-center gap-2 mx-auto">
                <Upload className="w-4 h-4" /> Select File
              </button>
            </div>
          )}

          {isParsingSheet && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-neon-green animate-spin mx-auto mb-4" />
              <p className="text-sm text-zinc-400 font-black uppercase">Parsing {spreadsheetFileName}...</p>
            </div>
          )}

          {spreadsheetRows.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-4 h-4 text-neon-green" />
                <span className="text-[10px] font-black uppercase text-white">{spreadsheetFileName}</span>
                <button onClick={() => { setSpreadsheetRows([]); setSpreadsheetFileName(''); }}
                  className="ml-auto px-3 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase border border-zinc-700 hover:text-white">
                  <X className="w-3 h-3 inline mr-1" /> Clear
                </button>
              </div>
              {renderPreviewTable(spreadsheetRows, setSpreadsheetRows, 'BULK_PARSER')}
            </div>
          )}
        </div>
      )}

      {/* === Recent Imports Section === */}
      {activeSection === 'history' && (
        <div className="hud-border bg-army-black/50 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-army-gold" />
            <h3 className="text-sm font-black uppercase text-army-gold tracking-widest">Recent Scans & Imports</h3>
          </div>

          {importBatches.length === 0 ? (
            <div className="text-center py-8">
              <Table className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No imports yet this session. Use the AI Scanner or Spreadsheet upload to import leads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-800 rounded">
              <table className="w-full text-left text-[10px] uppercase">
                <thead className="bg-zinc-900/80 text-zinc-500 font-black border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Source Entity</th>
                    <th className="p-3">Protocol</th>
                    <th className="p-3">Data Volume</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {importBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-white/5">
                      <td className="p-3 font-mono text-zinc-400">{batch.id.slice(0, 16)}</td>
                      <td className="p-3">
                        <span className={cn("text-[9px] font-mono font-black tracking-wider px-2 py-0.5 border",
                          batch.source === 'AI_OCR' ? "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10" : "text-neon-green border-neon-green/30 bg-neon-green/10"
                        )}>{batch.source}</span>
                      </td>
                      <td className="p-3 text-white font-black">{batch.rows} rows</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full",
                              batch.avgConfidence >= 0.8 ? "bg-green-400" : batch.avgConfidence >= 0.6 ? "bg-army-gold" : "bg-red-400"
                            )} style={{ width: `${batch.avgConfidence * 100}%` }} />
                          </div>
                          <span className="text-[9px] font-mono">{Math.round(batch.avgConfidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-zinc-500 font-mono">{new Date(batch.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3">
                        <span className={cn("text-[9px] font-mono font-black px-2 py-0.5 border",
                          batch.status === 'imported' ? "text-green-400 border-green-500/30 bg-green-500/10" :
                          batch.status === 'partial' ? "text-army-gold border-army-gold/30 bg-army-gold/10" :
                          "text-zinc-400 border-zinc-600 bg-zinc-800"
                        )}>{batch.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
