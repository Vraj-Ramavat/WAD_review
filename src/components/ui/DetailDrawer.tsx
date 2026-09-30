import React from 'react';
import { X, Folder, FileCode, AlertTriangle, User, Code, GitCommit } from 'lucide-react';
import { useViewStore } from '../../store/useViewStore';
import { FeaturedRepo, FolderPlanet, FileItem } from '../../types';

interface DetailDrawerProps {
  repo: FeaturedRepo;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ repo }) => {
  const selectedPlanetId = useViewStore((state) => state.selectedPlanetId);
  const selectedFileId = useViewStore((state) => state.selectedFileId);
  const setSelectedPlanetId = useViewStore((state) => state.setSelectedPlanetId);
  const setSelectedFileId = useViewStore((state) => state.setSelectedFileId);
  const isChatOpen = useViewStore((state) => state.isChatOpen);

  let selectedFolder: FolderPlanet | undefined;
  let selectedFile: FileItem | undefined;

  if (selectedPlanetId) {
    selectedFolder = repo.folders.find((f) => f.id === selectedPlanetId);
  }

  if (selectedFileId) {
    for (const folder of repo.folders) {
      const found = folder.files.find((file) => file.id === selectedFileId);
      if (found) {
        selectedFile = found;
        selectedFolder = folder;
        break;
      }
    }
  }

  const isOpen = !!(selectedFolder || selectedFile);

  if (!isOpen) return null;

  return (
    <aside className={`solar-detail-drawer ui-interactive fixed z-40 p-5 rounded-md instrument-panel font-mono text-xs flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 ${isChatOpen ? 'solar-detail--chat-open' : ''}`} aria-label="Repository object details">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-brass/30">
          <div className="flex items-center gap-2 text-amber font-semibold">
            {selectedFile ? (
              <>
                <FileCode className="w-4 h-4 text-amber" />
                <span className="font-sans">File Moon Detail</span>
              </>
            ) : (
              <>
                <Folder className="w-4 h-4 text-brass" />
                <span className="font-sans">Folder Planet Detail</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPlanetId(null);
              setSelectedFileId(null);
            }}
            aria-label="Close detail drawer"
            className="p-1 text-slate hover:text-starwhite rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {selectedFile ? (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-slate uppercase block mb-1">File Path</span>
              <p className="text-starwhite bg-deepspace p-2 rounded border border-brass/30 font-mono text-[11px] break-all">
                {selectedFile.path}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-deepspace p-2.5 rounded border border-brass/20">
                <span className="text-[10px] text-slate block flex items-center gap-1">
                  <Code className="w-3 h-3 text-amber" /> Lines of Code
                </span>
                <span className="text-sm font-bold text-starwhite mt-1 block">
                  {selectedFile.loc.toLocaleString()}
                </span>
              </div>

              <div className="bg-deepspace p-2.5 rounded border border-brass/20">
                <span className="text-[10px] text-slate block flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-copper" /> Bug Risk Score
                </span>
                <span className="text-sm font-bold text-copper mt-1 block">
                  {(selectedFile.risk_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Risk bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate mb-1">
                <span>Risk Level</span>
                <span className="text-copper font-bold">
                  {selectedFile.risk_score > 0.6 ? 'High' : selectedFile.risk_score > 0.3 ? 'Moderate' : 'Low'}
                </span>
              </div>
              <div className="w-full h-2 bg-deepspace rounded-full overflow-hidden border border-brass/30">
                <div
                  className="h-full bg-gradient-to-r from-amber to-copper rounded-full transition-all duration-500"
                  style={{ width: `${selectedFile.risk_score * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-brass/20">
              <div className="flex items-center justify-between text-slate">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brass" /> Top Contributor:
                </span>
                <strong className="text-starwhite font-sans">{selectedFile.top_contributor}</strong>
              </div>

              <div className="flex items-center justify-between text-slate">
                <span className="flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-databhlue" /> Total Commits:
                </span>
                <strong className="text-starwhite">{selectedFile.commit_count}</strong>
              </div>

              <div className="flex items-center justify-between text-slate">
                <span>Parent Cluster:</span>
                <strong className="text-brass font-sans">{selectedFolder?.name}</strong>
              </div>
            </div>
          </div>
        ) : (
          selectedFolder && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate uppercase block mb-1">Folder Cluster</span>
                <p className="text-starwhite bg-deepspace p-2 rounded border border-brass/30 font-mono text-xs">
                  {selectedFolder.path}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-deepspace p-2.5 rounded border border-brass/20">
                  <span className="text-[10px] text-slate block">Total Folder LOC</span>
                  <span className="text-sm font-bold text-starwhite mt-1 block">
                    {selectedFolder.totalLoc.toLocaleString()}
                  </span>
                </div>

                <div className="bg-deepspace p-2.5 rounded border border-brass/20">
                  <span className="text-[10px] text-slate block">Aggregated Risk</span>
                  <span className="text-sm font-bold text-copper mt-1 block">
                    {(selectedFolder.aggregateRisk * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate uppercase block mb-2">Contained File Moons</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedFolder.files.map((file) => (
                    <button
                      type="button"
                      key={file.id}
                      onClick={() => {
                        setSelectedPlanetId(selectedFolder?.id ?? null);
                        setSelectedFileId(file.id);
                      }}
                      className={`w-full p-2 rounded border transition-colors cursor-pointer flex items-center justify-between text-left ${
                        selectedFileId === file.id
                          ? 'border-amber bg-amber/10 text-amber'
                          : 'border-brass/20 bg-deepspace/60 hover:border-amber/40 text-slate hover:text-starwhite'
                      }`}
                    >
                      <span className="truncate max-w-[160px] font-sans">{file.name}</span>
                      <span className="text-[10px] font-mono text-copper font-bold">
                        {(file.risk_score * 100).toFixed(0)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="pt-3 border-t border-brass/30 text-[10px] text-slate text-center">
        Click another planet/moon or reset camera to close detail inspect.
      </div>
    </aside>
  );
};
