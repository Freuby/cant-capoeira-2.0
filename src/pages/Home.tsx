import React from 'react';
import { Settings, Trash2, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { SongCard } from '../components/SongCard';
import { CATEGORY_COLORS, SongCategory } from '../types';
import { ImportModal } from '../components/ImportModal';

const CategorySection: React.FC<{
  title: string;
  category: SongCategory;
  color: string;
}> = ({ title, category, color }) => {
  const { songs } = useSongs();
  const categorySongs = songs.filter(song => song.category === category);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color }}>
          {title}
        </h2>
        <span className="text-sm text-gray-500">
          {categorySongs.length} chants
        </span>
      </div>
      <div className="space-y-4">
        {categorySongs.map(song => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
};

export const Home = () => {
  const { selectedSongs, deleteSelectedSongs, clearSelection, songs, importSongs } = useSongs();
  const [showImportModal, setShowImportModal] = React.useState(false);

  const handleDeleteSelected = () => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${selectedSongs.size} chant(s) ?`)) {
      deleteSelectedSongs();
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['title', 'category', 'mnemonic', 'lyrics', 'mediaLink'].join(','),
      ...songs.map(song => [
        `"${song.title.replace(/"/g, '""')}"`,
        song.category,
        `"${(song.mnemonic || '').replace(/"/g, '""')}"`,
        `"${(song.lyrics || '').replace(/"/g, '""')}"`,
        `"${(song.mediaLink || '').replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chants-capoeira.csv';
    link.click();
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chants de Capoeira</h1>
        <div className="flex space-x-2">
          {selectedSongs.size > 0 && (
            <>
              <button
                onClick={handleDeleteSelected}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 size={24} />
              </button>
              <button
                onClick={clearSelection}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                Annuler
              </button>
            </>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Importer des chants (CSV)"
          >
            <Upload size={24} className="text-gray-600" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Exporter les chants (CSV)"
          >
            <Download size={24} className="text-gray-600" />
          </button>
          <Link
            to="/settings"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings size={24} className="text-gray-600" />
          </Link>
        </div>
      </div>

      <CategorySection
        title="Angola"
        category="angola"
        color={CATEGORY_COLORS.angola}
      />
      <CategorySection
        title="São Bento Pequeno"
        category="saoBentoPequeno"
        color={CATEGORY_COLORS.saoBentoPequeno}
      />
      <CategorySection
        title="São Bento Grande"
        category="saoBentoGrande"
        color={CATEGORY_COLORS.saoBentoGrande}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={importSongs}
      />
    </div>
  );
};