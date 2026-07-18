import { suitName, suitSymbol } from "../game/engine";
import type { Card } from "../game/types";

export default function CardView({ card, disabled, selected, compact, onClick, reason }: {
  card: Card;
  disabled?: boolean;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
  reason?: string;
}) {
  const red = card.suit === "hearts" || card.suit === "diamonds";
  const label = `${suitName(card.suit)}の${card.rank}${disabled && reason ? `。${reason}` : ""}`;
  const content = <>
    <span className="card-rank">{card.rank}</span>
    <span className="card-suit" aria-hidden="true">{suitSymbol(card.suit)}</span>
  </>;
  if (!onClick) return <div className={`playing-card ${red ? "red" : "black"} ${compact ? "compact" : ""}`} aria-label={label}>{content}</div>;
  return (
    <button
      type="button"
      className={`playing-card card-button ${red ? "red" : "black"} ${disabled ? "illegal" : "legal"} ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-label={label}
      aria-disabled={disabled}
      title={disabled ? reason : label}
    >{content}</button>
  );
}
