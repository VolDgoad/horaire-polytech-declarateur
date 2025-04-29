
import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDashed,
  XCircle,
} from 'lucide-react';
import { Declaration } from '@/types';
import { statusTranslations } from '@/types/declaration';

interface DeclarationStatusProps {
  declaration: Declaration;
}

export function DeclarationStatus({ declaration }: DeclarationStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'validee':
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          color: 'bg-green-100 border-green-600',
          textColor: 'text-green-600',
        };
      case 'approuvee':
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-indigo-600" />,
          color: 'bg-indigo-100 border-indigo-600',
          textColor: 'text-indigo-600',
        };
      case 'verifiee':
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-blue-600" />,
          color: 'bg-blue-100 border-blue-600',
          textColor: 'text-blue-600',
        };
      case 'en_attente':
        return {
          icon: <Clock className="h-6 w-6 text-amber-600" />,
          color: 'bg-amber-100 border-amber-600',
          textColor: 'text-amber-600',
        };
      case 'refusee':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          color: 'bg-red-100 border-red-600',
          textColor: 'text-red-600',
        };
      default:
        return {
          icon: <CircleDashed className="h-6 w-6 text-gray-600" />,
          color: 'bg-gray-100 border-gray-600',
          textColor: 'text-gray-600',
        };
    }
  };

  const currentStatus = declaration.status;
  const statusConfig = getStatusConfig(currentStatus);

  // Define workflow steps
  const steps = [
    { key: 'en_attente', label: 'En attente' },
    { key: 'verifiee', label: 'Vérifiée' },
    { key: 'approuvee', label: 'Approuvée' },
    { key: 'validee', label: 'Validée' },
  ];

  // Determine current step index
  const currentStepIndex = (() => {
    if (currentStatus === 'refusee') {
      return -1; // Special case for rejected
    }
    return steps.findIndex(step => step.key === currentStatus);
  })();

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-md border ${statusConfig.color}`}>
        <div className="flex items-center">
          {statusConfig.icon}
          <div className="ml-3">
            <h3 className={`text-sm font-semibold ${statusConfig.textColor}`}>
              Statut: {statusTranslations[currentStatus]}
            </h3>
            {currentStatus === 'refusee' && declaration.rejectionReason && (
              <p className="text-sm text-red-700 mt-1">
                Motif: {declaration.rejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Workflow progress */}
      {currentStatus !== 'refusee' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Progression du traitement</h4>
          <div className="relative">
            {/* Progress bar */}
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="flex justify-between">
              {steps.map((step, index) => {
                let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
                
                if (index < currentStepIndex) {
                  status = 'completed';
                } else if (index === currentStepIndex) {
                  status = 'current';
                }

                return (
                  <div
                    key={step.key}
                    className={`flex flex-col items-center ${
                      index === 0 ? 'items-start' : index === steps.length - 1 ? 'items-end' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mb-2
                        ${status === 'completed' ? 'bg-blue-500 text-white' : 
                          status === 'current' ? 'bg-blue-100 border-2 border-blue-500' : 
                          'bg-gray-200'
                        }`}
                    >
                      {status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                      {status === 'current' && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                    <span className="text-xs text-gray-600">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rejected workflow */}
      {currentStatus === 'refusee' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">État du traitement</h4>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">
              La déclaration a été refusée. Vous pouvez la modifier ou la supprimer.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
