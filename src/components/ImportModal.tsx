import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (songs: Array<{
    title: string;
    category: 'angola' | 'saoBentoPequeno' | 'saoBentoGrande';
    mnemonic?: string;
    lyrics?: string;
    mediaLink?: string;
  }>) => void;
}

const EXAMPLE_CSV = `title,category,mnemonic,lyrics,mediaLink
"Paranauê Paranauá",angola,"Para-na-uê","Paranauê, paranauê paraná\nParanauê, paranauê paraná",""
"Sim Sim Sim",saoBentoPequeno,"Sim sim non non","Sim sim sim, não não não\nSim sim sim, não não não",""
"Volta do Mundo",saoBentoGrande,"Vol-ta do mun-do","Volta do mundo, volta do mundo camará\nVolta do mundo, volta do mundo camará",""`;

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const headers = lines[0].toLowerCase().split(',');

      if (!headers.includes('title') || !headers.includes('category')) {
        throw new Error('Le fichier CSV doit contenir au moins les colonnes "title" et "category"');
      }

      const songs = lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        const song: any = {};

        headers.forEach((header, index) => {
          let value = values[index] || '';
          // Enlever les guillemets et déchapper les doubles guillemets
          value = value.replace(/^"|"$/g, '').replace(/""/g, '"');
          song[header.trim()] = value;
        });

        if (!['angola', 'saoBentoPequeno', 'saoBentoGrande'].includes(song.category)) {
          throw new Error(`Catégorie invalide: ${song.category}`);
        }

        return song;
      });

      onImport(songs);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'importation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Importer des chants</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4">
          Importez vos chants à partir d'un fichier CSV avec les colonnes suivantes :
          <code className="block bg-gray-50 p-2 rounded mt-2 text-sm">
            title,category,mnemonic,lyrics,mediaLink
          </code>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exemple de fichier CSV :
          </label>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
            {EXAMPLE_CSV}
          </pre>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
            Choisir un fichier CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};