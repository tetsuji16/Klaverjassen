import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const home = location.pathname === "/";
  const game = location.pathname === "/game";
  return (
    <div className={`app-shell ${game ? "game-shell" : ""}`}>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="ホームへ">
          <span className="brand-mark" aria-hidden="true">♣</span>
          <span><strong>Klaverjassen</strong><small>Leer & Speel</small></span>
        </Link>
        <nav className="header-nav" aria-label="メインナビゲーション">
          {home ? <><Link to="/rules">ルール</Link><Link to="/settings">設定</Link></> : <Link className="header-link" to="/">ホーム</Link>}
        </nav>
      </header>
      <main>{children}</main>
      <footer><span>端末の中だけで遊べます</span><span>Amsterdam regels</span></footer>
    </div>
  );
}
