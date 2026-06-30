import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  DownloadCloud, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Lock,
  FileText
} from 'lucide-react';

export const PrivacyCenterView: React.FC = () => {
  // Consent States
  const [healthConsent, setHealthConsent] = useState(true);
  const [locationConsent, setLocationConsent] = useState(true);
  const [aiConsent, setAiConsent] = useState(false);

  // Export States
  const [exportFormat, setExportFormat] = useState('JSON');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'pending' | 'ready'>('idle');
  const [archiveUrl, setArchiveUrl] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConsentToggle = async (type: string, currentVal: boolean, setter: (val: boolean) => void) => {
    const nextVal = !currentVal;
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/consent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consentType: type,
          consented: nextVal,
        }),
      });

      if (response.ok) {
        setter(nextVal);
        setSuccessMessage(`Privacy settings for "${type}" updated successfully!`);
      } else {
        setErrorMessage('Failed to update consent registry.');
      }
    } catch (err) {
      setErrorMessage('Network error updating consent.');
    }
  };

  const handleRequestExport = async () => {
    setIsExporting(true);
    setSuccessMessage('');
    setErrorMessage('');
    setExportStatus('pending');

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: exportFormat }),
      });

      if (response.ok) {
        // Simulate S3 compilation delay of 3 seconds
        setTimeout(() => {
          setExportStatus('ready');
          setArchiveUrl('https://s3.amazonaws.com/shenova-evidence-vault/exports/shenova_privacy_archive.zip');
          setIsExporting(false);
          setSuccessMessage('Your data archive is ready for secure download.');
        }, 3000);
      } else {
        setErrorMessage('Failed to initialize data compile.');
        setExportStatus('idle');
        setIsExporting(false);
      }
    } catch (err) {
      setErrorMessage('Network error compiling archive.');
      setExportStatus('idle');
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    const doubleCheck = confirm(
      'WARNING: This action is irreversible. It will delete your profile, safety vault, tracking history, and AI recommendations immediately in accordance with GDPR Article 17 (Right to Erasure).'
    );
    if (doubleCheck) {
      alert('Account deletion request queued. Redirecting to auth gateways...');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary">Privacy Center</h1>
        <p className="text-text-secondary text-sm">Manage GDPR compliance, control third-party sharing, and compile data archives.</p>
      </div>

      {successMessage && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center font-semibold flex items-center justify-center gap-1.5 animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 text-xs bg-state-error/10 border border-state-error/20 text-state-error rounded-xl text-center font-semibold flex items-center justify-center gap-1.5">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GDPR Consent Panel */}
        <Card className="lg:col-span-2 border-primary-lavender/30">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-violet" />
              <span>Granular Privacy Consents</span>
            </CardTitle>
            <CardDescription className="text-xs">Toggle individual permissions for data storage and training models.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Consent 1: Health */}
            <div className="py-4 border-b border-bg-border/60">
              <Switch
                label="Hormonal Health Data Logging"
                description="Allows logging period dates and symptoms. Critical to compute calendar predictions and phases."
                checked={healthConsent}
                onChange={() => handleConsentToggle('health_data', healthConsent, setHealthConsent)}
              />
            </div>

            {/* Consent 2: Location */}
            <div className="py-4 border-b border-bg-border/60">
              <Switch
                label="Real-Time Location Streams"
                description="Allows telemetry streaming to Safety Hub servers during SOS and timers. Cleared when inactive."
                checked={locationConsent}
                onChange={() => handleConsentToggle('location_telemetry', locationConsent, setLocationConsent)}
              />
            </div>

            {/* Consent 3: AI Prompts */}
            <div className="py-4">
              <Switch
                label="AI Model Optimization Logs"
                description="Allows storing mood logs and chats to fine-tune local assistant vectors. Excludes identity tags."
                checked={aiConsent}
                onChange={() => handleConsentToggle('ai_training', aiConsent, setAiConsent)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Export & Erase Panel */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <DownloadCloud className="h-5 w-5 text-primary-violet" />
                <span>GDPR Portability Tool</span>
              </CardTitle>
              <CardDescription className="text-xs">Export your full database logs (GDPR Article 20).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase block mb-1.5">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-bg-border bg-white text-xs text-text-primary focus:border-primary-violet outline-none"
                >
                  <option value="JSON">JSON Schema</option>
                  <option value="CSV">CSV Format</option>
                </select>
              </div>

              {exportStatus === 'pending' && (
                <div className="p-3 bg-primary-violet/5 border border-primary-violet/10 rounded-xl text-center text-xs text-text-secondary animate-pulse">
                  Compiling evidence databases...
                </div>
              )}

              {exportStatus === 'ready' && (
                <a 
                  href={archiveUrl}
                  download
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <DownloadCloud className="h-4 w-4" />
                  <span>Download Archive (ZIP)</span>
                </a>
              )}

              {exportStatus === 'idle' && (
                <Button
                  onClick={handleRequestExport}
                  className="w-full bg-primary-violet hover:bg-primary-dark text-xs"
                >
                  Request Data Compilation
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Erasure */}
          <Card className="border-red-100 bg-red-50/10">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-state-error text-sm">
                <Trash2 className="h-4 w-4" />
                <span>Right to Erasure</span>
              </CardTitle>
              <CardDescription className="text-xs">Permanently delete your profile and logs (GDPR Article 17).</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                onClick={handleDeleteAccount}
                className="w-full text-xs font-bold text-state-error border border-state-error/20 bg-white hover:bg-red-50"
              >
                Delete My Account Permanently
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default PrivacyCenterView;
