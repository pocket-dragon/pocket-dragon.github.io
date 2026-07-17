import { useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { pocketDragon, promoGames, PromoGame } from '../rules/game-rules';
import { isOfflineCopy } from '../logic/runtimeEnv';
import { PdButton } from './PdButton';

interface CollapsibleSectionProps {
  title: string;
  imageUrl: string;
  testId: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, imageUrl, testId, children }: CollapsibleSectionProps) {
  return (
    <details className="collapsible-section clearfix" data-testid={testId}>
      <summary className="collapsible-toggle">
        <h2>Promo Rules: {title}</h2>
      </summary>
      <div className="collapsible-content">
        <img src={imageUrl} alt={title} className="promo" />
        {children}
      </div>
    </details>
  );
}

function RulesMarkdown({ text }: { text: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkBreaks, remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {text}
    </Markdown>
  );
}

// Map game titles to testid names
const promoTestIds: Record<string, string> = {
  'Anachrony': 'promo-anachrony',
  'Trickerion': 'promo-trickerion',
  'Petrichor': 'promo-petrichor',
  'Days of Ire': 'promo-daysOfIre',
  'Nights of Fire': 'promo-nightsOfFire',
  '[redacted]': 'promo-redacted',
  'Microfilms': 'promo-microfilms',
  'Dice Settlers': 'promo-diceSettlers',
  'Kitchen Rush': 'promo-kitchenRush',
  'Tash-Kalar': 'promo-tashKalar',
};

// The offline-download callout sits just above the "Components" heading, so
// the rules markdown is rendered in two halves around it. If the heading is
// ever renamed the split degrades gracefully: the callout renders first,
// followed by the full rules text.
// Match the heading only as a whole line so an inline mention or a deeper
// heading (e.g. `### Components`) in the externally-owned rules text can't
// mis-split the document.
const COMPONENTS_HEADING = /^## Components$/m;
const headingMatch = pocketDragon.match(COMPONENTS_HEADING);
const headingAt = headingMatch?.index ?? -1;
const rulesIntro = headingAt === -1 ? '' : pocketDragon.slice(0, headingAt);
const rulesBody = headingAt === -1 ? pocketDragon : pocketDragon.slice(headingAt);

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <aside
      id="rules-dialog"
      data-testid="rules-dialog"
      className={`mdc-dialog ${isOpen ? 'mdc-dialog--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-dialog-title"
    >
      <div className="mdc-dialog__surface rules-surface">
        <header className="mdc-dialog__header">
          <h1 id="rules-dialog-title" className="mdc-dialog__header__title">Rules</h1>
        </header>
        <section className="mdc-dialog__body dialog-body">
          <div data-testid="rules-content">
            <RulesMarkdown text={rulesIntro} />

            {!isOfflineCopy() && (
              <p className="offline-download">
                Want to keep the app forever?{' '}
                <a
                  data-testid="offline-download-link"
                  href="https://github.com/pocket-dragon/pocket-dragon.github.io/releases/latest/download/pocket-dragon.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download the offline version
                </a>{' '}
                — a single file you can open in any browser, no internet needed.
              </p>
            )}

            <RulesMarkdown text={rulesBody} />

            {promoGames.map((game: PromoGame) => (
              <CollapsibleSection
                key={game.title}
                title={game.title}
                imageUrl={game.imageUrl}
                testId={promoTestIds[game.title] || `promo-${game.title.toLowerCase()}`}
              >
                <RulesMarkdown text={game.content} />
              </CollapsibleSection>
            ))}
          </div>
        </section>
        <footer className="mdc-dialog__footer">
          <PdButton
            data-testid="rules-close"
            label="Close"
            primary
            className="mdc-dialog__footer__button--accept"
            onClick={onClose}
          />
        </footer>
      </div>
      <div className="mdc-dialog__backdrop" onClick={onClose} />
    </aside>
  );
}
