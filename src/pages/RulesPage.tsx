const rows = [
  ["J · Boer", "20", "2"], ["9 · Negen", "14", "0"], ["A · Aas", "11", "11"], ["10 · Tien", "10", "10"],
  ["K · Heer", "4", "4"], ["Q · Vrouw", "3", "3"], ["8 · Acht", "0", "0"], ["7 · Zeven", "0", "0"],
];

export default function RulesPage() {
  return <div className="page rules-page">
    <div className="section-heading"><div><p className="eyebrow">AMSTERDAM REGELS</p><h1>ルール辞典</h1><p className="intro">プレイ中に迷ったら、ここへ戻って確認できます。</p></div><div className="rule-stamp">32<small>KAARTEN</small></div></div>
    <div className="rules-layout"><nav className="rule-nav" aria-label="ルール目次"><a href="#rank">カードの順位</a><a href="#play">カードの出し方</a><a href="#roem">ローム</a><a href="#score">得点</a><a href="#words">用語</a></nav><div className="rule-content">
      <section id="rank"><p className="eyebrow">01 · RANGORDE</p><h2>カードの順位と点数</h2><p>切り札（troef）だけJと9が特別に強く、高得点です。</p><div className="rank-table"><div className="table-head"><span>カード</span><span>切り札</span><span>通常</span></div>{rows.map((row) => <div key={row[0]}><b>{row[0]}</b><strong>{row[1]}</strong><span>{row[2]}</span></div>)}</div><p className="caption">通常の強さは A › 10 › K › Q › J › 9 › 8 › 7</p></section>
      <section id="play"><p className="eyebrow">02 · SPELEN</p><h2>カードの出し方</h2><ol className="rule-steps"><li><b>フォロー</b><span>リードされたスートを持っていれば必ず出します。</span></li><li><b>トランプ</b><span>フォローできず相手が勝っていれば、可能なら切り札を出します。</span></li><li><b>オーバートランプ</b><span>相手の切り札より強い切り札を出せるなら必須です。</span></li><li><b>パートナー例外</b><span>味方が勝っていれば、原則として切り札を温存できます。</span></li></ol></section>
      <section id="roem"><p className="eyebrow">03 · ROEM</p><h2>場にできるボーナス</h2><div className="bonus-grid"><div><b>20</b><span>同一スートの連続3枚</span></div><div><b>50</b><span>同一スートの連続4枚</span></div><div><b>100</b><span>同一ランク4枚</span></div><div><b>20</b><span>切り札K＋Q（stuk）</span></div></div><p>このサイトではトリック確定時に自動判定します。</p></section>
      <section id="score"><p className="eyebrow">04 · SCORE</p><h2>natとpit</h2><div className="definition"><b>nat</b><p>切り札を決めたチームが相手の合計点を上回れなかった状態。契約側は0点になります。</p></div><div className="definition"><b>pit</b><p>契約側が8トリックすべてを取った状態。100点のボーナスです。</p></div></section>
      <section id="words"><p className="eyebrow">05 · WOORDEN</p><h2>オランダ語の用語</h2><dl className="words"><div><dt>slag</dt><dd>トリック。4人が1枚ずつ出したまとまり。</dd></div><div><dt>troef</dt><dd>切り札。</dd></div><div><dt>spelen / passen</dt><dd>切り札を決めてプレイする／パスする。</dd></div><div><dt>maat</dt><dd>パートナー。</dd></div><div><dt>roem</dt><dd>カードの組み合わせによるボーナス。</dd></div></dl></section>
    </div></div>
  </div>;
}
