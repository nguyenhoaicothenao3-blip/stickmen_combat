import React, { useEffect, useRef } from 'react';
import { CHARACTER_LIST, CharacterDef, CharacterId } from '../engine/characters';
import { renderNotebookPaperToCanvas } from '../engine/sketchDraw';
import { FighterSide } from '../engine/stickFigure';

interface CharacterCardProps {
  character: CharacterDef;
  activeSide: FighterSide;
  onSelect: (characterId: CharacterId, cardRect: DOMRect) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  activeSide,
  onSelect,
}) => {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isBlue = activeSide === 'left';
  const inkColor = isBlue ? '#1E3A8A' : '#991B1B';
  const accentColor = isBlue ? '#2563EB' : '#DC2626';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 164;
    const height = 112;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const paper = renderNotebookPaperToCanvas(width, height, dpr);

    let rafId = 0;
    const drawFrame = (now: number) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(paper.canvas, 0, 0);
        ctx.scale(dpr, dpr);

        const boilTick = Math.floor(now / 135);
        const tSec = now / 1000;
        character.drawPortrait(
          ctx,
          width * 0.54,
          height * 0.44,
          0.95,
          inkColor,
          accentColor,
          boilTick,
          tSec,
        );
        ctx.restore();
      }
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [accentColor, character, inkColor]);

  const handleClick = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    onSelect(character.id, rect);
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      className={`group pointer-events-auto relative flex w-[198px] shrink-0 cursor-pointer flex-col items-stretch rounded-xl border-2 bg-[#FDF8EB]/96 p-3 text-left shadow-sm transition-transform duration-150 hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-[214px] ${
        isBlue
          ? 'border-[#1E3A8A]/85 hover:border-[#2563EB] focus-visible:outline-blue-700'
          : 'border-[#991B1B]/85 hover:border-[#DC2626] focus-visible:outline-red-700'
      }`}
    >
      {/* Card corner index + role text (no pill badges) */}
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span
          className={`font-hand text-lg leading-none font-bold whitespace-nowrap ${
            isBlue ? 'text-[#1E3A8A]' : 'text-[#991B1B]'
          }`}
        >
          {character.name}
        </span>
        <span className="text-[11px] font-medium whitespace-nowrap text-slate-500">
          {character.subtitle}
        </span>
      </div>

      {/* Animated ruled-paper portrait frame */}
      <div className="mb-2.5 overflow-hidden rounded-lg border border-slate-400/50 bg-[#FAF2DD]">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="block h-[112px] w-full"
        />
      </div>

      {/* Short description */}
      <p className="mb-2 line-clamp-2 min-h-[2.25rem] text-xs leading-snug text-slate-700">
        {character.description}
      </p>

      {/* Clean unboxed stats row with middot separators */}
      <div className="mb-2.5 text-[11px] font-medium whitespace-nowrap text-slate-600 tabular-nums">
        {character.statTags.join(' · ')}
      </div>

      {/* Action footer inside card */}
      <div
        className={`mt-auto border-t border-slate-300/65 pt-2 text-center font-hand text-base font-bold whitespace-nowrap transition-colors ${
          isBlue
            ? 'text-[#1E3A8A] group-hover:text-[#2563EB]'
            : 'text-[#991B1B] group-hover:text-[#DC2626]'
        }`}
      >
        {isBlue ? 'Thả vào Bên Xanh' : 'Thả vào Bên Đỏ'}
      </div>
    </button>
  );
};

interface CharacterSelectOverlayProps {
  isVisible: boolean;
  selectingSide: FighterSide;
  pickedCharacters: {
    left: CharacterId;
    right: CharacterId;
  };
  sessionPicked: {
    left: boolean;
    right: boolean;
  };
  onChangeSide: (side: FighterSide) => void;
  onSelectCharacter: (characterId: CharacterId, cardRect: DOMRect) => void;
  onClose: () => void;
}

export const CharacterSelectOverlay: React.FC<CharacterSelectOverlayProps> = ({
  isVisible,
  selectingSide,
  pickedCharacters,
  sessionPicked,
  onChangeSide,
  onSelectCharacter,
  onClose,
}) => {
  if (!isVisible) return null;

  const leftName = CHARACTER_LIST.find((c) => c.id === pickedCharacters.left)?.name ?? 'Thường';
  const rightName = CHARACTER_LIST.find((c) => c.id === pickedCharacters.right)?.name ?? 'Thường';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-3 py-14"
      role="dialog"
      aria-modal="false"
      aria-label="Chọn nhân vật"
    >
      {/* Sequential Blue / Red turn header */}
      <div className="pointer-events-auto mb-3 flex flex-col items-center gap-1.5 rounded-xl border border-slate-500/45 bg-[#FDF8EB]/95 px-3.5 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onChangeSide('left')}
            className={`inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 font-hand text-base whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
              selectingSide === 'left'
                ? 'border-[#2563EB] bg-blue-50/95 font-bold text-[#1E3A8A]'
                : 'border-slate-300/75 bg-[#FAF2DD]/75 text-slate-600 hover:border-slate-500'
            }`}
          >
            <span>1. Bên Xanh</span>
            <span className="font-sans text-xs font-medium opacity-80">
              {sessionPicked.left ? `· ${leftName}` : `· ${leftName}`}
            </span>
          </button>

          <span className="font-hand text-sm text-slate-400" aria-hidden="true">
            vs
          </span>

          <button
            type="button"
            onClick={() => onChangeSide('right')}
            className={`inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 font-hand text-base whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 ${
              selectingSide === 'right'
                ? 'border-[#DC2626] bg-red-50/95 font-bold text-[#991B1B]'
                : 'border-slate-300/75 bg-[#FAF2DD]/75 text-slate-600 hover:border-slate-500'
            }`}
          >
            <span>2. Bên Đỏ</span>
            <span className="font-sans text-xs font-medium opacity-80">
              {sessionPicked.right ? `· ${rightName}` : `· ${rightName}`}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chọn nhân vật"
            className="inline-flex min-h-[40px] cursor-pointer items-center rounded-lg border border-slate-400/65 bg-[#FAF2DD]/85 px-2.5 py-1.5 font-hand text-sm font-semibold whitespace-nowrap text-slate-700 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-[#FDF8EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Đóng
          </button>
        </div>

        <p className="text-xs font-medium text-slate-600">
          {selectingSide === 'left'
            ? 'Chọn thẻ bài bên dưới cho Bên Xanh'
            : 'Chọn thẻ bài bên dưới cho Bên Đỏ'}
        </p>
      </div>

      {/* Centered horizontal row of character cards (scrollable when more characters are added) */}
      <div className="pointer-events-auto flex w-full max-w-6xl items-stretch justify-start overflow-x-auto px-2 py-2">
        <div className="mx-auto flex flex-row items-stretch gap-4">
          {CHARACTER_LIST.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              activeSide={selectingSide}
              onSelect={onSelectCharacter}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
