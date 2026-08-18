import React from 'react';
import type { Diagnostic, RemediationOption } from '@/lib/utils/cryptoDiagnostics';

interface CryptoDiagnosticBannerProps {
  error: string | null;
  diagnostic?: Diagnostic | null;
  onApplyFix?: (remediation: RemediationOption) => void;
}

export const CryptoDiagnosticBanner: React.FC<CryptoDiagnosticBannerProps> = ({
  error,
  diagnostic,
  onApplyFix
}) => {
  if (!error) return null;

  return (
    <div 
      className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm mb-4" 
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-red-800 font-semibold">Calculation Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
        
        {/* Render your advanced diagnostic hints and remediations */}
        {diagnostic && (
          <div className="mt-2 bg-white/60 p-3 rounded border border-red-100">
            <p className="text-red-900 text-sm font-medium mb-2">Diagnostic Hint:</p>
            <p className="text-red-700 text-sm mb-3">{diagnostic.explanation}</p>
            
            {diagnostic.suggestedRemediation.length > 0 && onApplyFix && (
              <div className="flex flex-wrap gap-2">
                {diagnostic.suggestedRemediation.map((fix, idx) => (
                  <button
                    key={idx}
                    onClick={() => onApplyFix(fix)}
                    title={fix.description}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded border border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Apply fix: ${fix.label}`}
                  >
                    {fix.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
