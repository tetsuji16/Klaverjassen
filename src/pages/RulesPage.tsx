import { useMemo, useState } from "react";

const rows = [
  ["J · Boer", "1位 · 20", "5位 · 2"], ["9 · Negen", "2位 · 14", "6位 · 0"], ["A · Aas", "3位 · 11", "1位 · 11"], ["10 · Tien", "4位 · 10", "2位 · 10"],
  ["K · Heer", "5位 · 4", "3位 · 4"], ["Q · Vrouw", "6位 · 3", "4位 · 3"], ["8 · Acht", "7位 · 0", "7位 · 0"], ["7 · Zeven", "8位 · 0", "8位 · 0"],
];

const glossary = [
  ["slag", "プレイ", "トリック。4人が1枚ずつ出した4枚のまとまり。"],
  ["troef", "プレイ", "切り札。ほかのスートに勝ち、Jと9の順位・点数が上がる。"],
  ["kleur bekennen", "合法手", "フォロー。リードされたスートを持っていれば同じスートを出す義務。"],
  ["introeven", "合法手", "フォローできないとき、切り札を出してトリックを取ること。"],
  ["overtroeven", "合法手", "場の切り札より強い切り札を出すこと。可能なら必須になる。"],
  ["ondertroeven", "合法手", "場の切り札より弱い切り札を出すこと。Amsterdam式では出せる場面が限られる。"],
  ["maat", "チーム", "向かいに座るパートナー。"],
  ["spelen", "宣言", "スートを切り札に選び、そのディールの契約側になること。"],
  ["passen", "宣言", "切り札を選ばず、判断を次の人へ回すこと。"],
  ["spelende partij", "チーム", "切り札を選んだ人とパートナーからなる契約側。"],
  ["tegenpartij", "チーム", "切り札を選ばなかった守備側。契約側のnatを狙う。"],
  ["roem", "得点", "1トリック内の連続札や同ランク4枚などによるボーナス。"],
  ["stuk", "得点", "切り札のKとQが同じトリックに出たときのroem 20点。"],
  ["nat", "得点", "契約側のカード点＋roemが守備側以下になった契約失敗。同点もnat。"],
  ["pit", "得点", "契約側が8トリックすべてを取ること。このアプリでは100点追加。"],
  ["boer", "カード", "J（ジャック）。切り札では最強で20点。"],
  ["nel", "カード", "9。切り札では2番目に強く14点。"],
] as const;

export default function RulesPage() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized ? glossary.filter((entry) => entry.join(" ").toLocaleLowerCase().includes(normalized)) : glossary;
  }, [query]);

  return <div className="page rules-page">
    <div className="section-heading"><div><p className="eyebrow">AMSTERDAM REGELS</p><h1>ルール辞典</h1><p className="intro">基本から例外、得点計算まで。プレイ中の「このカードは出せる？」をすぐ確認できます。</p></div><div className="rule-stamp">32<small>KAARTEN</small></div></div>
    <div className="quick-rule" aria-labelledby="quick-title"><div><p className="eyebrow">QUICK CHECK</p><h2 id="quick-title">カードを出す前の4問</h2></div><ol><li><b>1</b><span>リードと同じスートがある？<small>ある → そのスートを出す</small></span></li><li><b>2</b><span>なければ、今は相手が勝っている？<small>はい → 切り札を確認</small></span></li><li><b>3</b><span>切り札で上回れる？<small>はい → 必ず上の切り札</small></span></li><li><b>4</b><span>味方が勝っている？<small>はい → 原則、捨て札を選べる</small></span></li></ol></div>
    <div className="rules-layout"><nav className="rule-nav" aria-label="ルール目次"><a href="#flow">ゲームの流れ</a><a href="#rank">順位と点数</a><a href="#play">合法手</a><a href="#cases">場面別</a><a href="#roem">roem</a><a href="#score">得点計算</a><a href="#strategy">実戦の基本</a><a href="#words">用語検索</a></nav><div className="rule-content">
      <section id="flow"><p className="eyebrow">01 · SPELVERLOOP</p><h2>ゲームの流れ</h2><div className="flow-grid"><div><b>1</b><h3>配る</h3><p>32枚を4人へ8枚ずつ。向かい同士がチームです。</p></div><div><b>2</b><h3>宣言</h3><p>ディーラーの左から、spelenかpassenを選びます。</p></div><div><b>3</b><h3>8トリック</h3><p>ディーラーの左が最初にリード。以後は直前の勝者から。</p></div><div><b>4</b><h3>精算</h3><p>カード点、最終10点、roemを集計し、natとpitを判定します。</p></div></div><div className="rule-callout"><b>このアプリの対戦単位</b><p>短縮戦は4ディール、標準戦は16ディール。ディールごとにディーラーが時計回りに移ります。</p></div></section>
      <section id="rank"><p className="eyebrow">02 · RANGORDE</p><h2>カードの順位と点数</h2><p>切り札（troef）だけJと9が特別です。「順位」と「点数」は別なので両方を確認しましょう。</p><div className="rank-table"><div className="table-head"><span>カード</span><span>切り札</span><span>通常</span></div>{rows.map((row) => <div key={row[0]}><b>{row[0]}</b><strong>{row[1]}</strong><span>{row[2]}</span></div>)}</div><div className="rule-callout"><b>基本点は162点</b><p>カード点は全部で152点。最後のトリックに10点が加わります。roemは別枠です。</p></div></section>
      <section id="play"><p className="eyebrow">03 · SPELEN</p><h2>合法手の優先順位</h2><ol className="rule-steps"><li><b>フォロー</b><span>リードされたスートがあれば必ず出します。切り札を温存したいかどうかは関係ありません。</span></li><li><b>切り札を出す</b><span>フォローできず相手が勝っていれば、切り札がある限り切ります。</span></li><li><b>オーバートランプ</b><span>相手の切り札より強い切り札を出せるなら、その中から出します。</span></li><li><b>無理な下切りを避ける</b><span>相手の切り札を上回れず、非切り札を持つなら、その非切り札を捨てられます。</span></li><li><b>パートナー例外</b><span>味方が勝っていてフォローできないなら、原則として切り札を温存し、好きな非切り札を捨てられます。</span></li></ol><p className="fine-print">切り札がリードされた場合も、最初のルールはフォローです。場の切り札を上回れる切り札があれば上を出します。</p></section>
      <section id="cases"><p className="eyebrow">04 · VOORBEELDEN</p><h2>迷いやすい場面</h2><div className="case-list"><article><div className="case-cards">♥A <i>→</i> ?</div><h3>♥を持っている</h3><p>♥7しかなくても♥を出します。切り札や別スートのAは出せません。</p><strong>結論：フォロー</strong></article><article><div className="case-cards">♥A <i>→</i> ♣?</div><h3>♥なし・相手が勝っている</h3><p>♣が切り札で手札にあるなら、♣を出して切ります。</p><strong>結論：トランプ必須</strong></article><article><div className="case-cards">♣9 <i>→</i> ♣J</div><h3>相手の切り札9が勝っている</h3><p>手札に切り札Jがあれば必ずJ。切り札Aでは9に勝てません。</p><strong>結論：オーバートランプ</strong></article><article><div className="case-cards">maat ♥A <i>→</i> ♠7</div><h3>味方が勝っている</h3><p>リードスートがなく、場を味方が取れそうなら、非切り札を捨てられます。</p><strong>結論：切り札を温存可</strong></article></div></section>
      <section id="roem"><p className="eyebrow">05 · ROEM</p><h2>場にできるボーナス</h2><div className="bonus-grid"><div><b>20</b><span>同一スートの連続3枚</span></div><div><b>50</b><span>同一スートの連続4枚</span></div><div><b>100</b><span>同一ランク4枚</span></div><div><b>200</b><span>Jの4枚組</span></div><div><b>20</b><span>切り札K＋Q（stuk）</span></div></div><p>並び順は7–8–9–10–J–Q–K–Aです。ボーナスはそのトリックを取ったチームに入り、このサイトではトリック確定時に自動判定します。</p></section>
      <section id="score"><p className="eyebrow">06 · SCORE</p><h2>ディールの得点計算</h2><div className="score-formula"><div><small>カード点</small><b>152</b></div><i>＋</i><div><small>最終トリック</small><b>10</b></div><i>＋</i><div><small>roem</small><b>可変</b></div></div><div className="definition"><b>成功</b><p>契約側の「カード点＋roem」が守備側を上回れば、各チームが獲得した点をそのまま得ます。</p></div><div className="definition"><b>nat</b><p>契約側が守備側以下なら契約失敗。契約側は0点、守備側は162点＋両チームの全roemを得ます。同点もnatです。</p></div><div className="definition"><b>pit</b><p>契約に成功し、契約側が8トリックすべてを取ると100点追加です。</p></div><div className="worked-example"><p className="eyebrow">CALCULATION EXAMPLE</p><h3>契約側 78＋roem 20 ／ 守備側 84</h3><p>98対84で契約成功。得点は契約側98点、守備側84点です。roem込みで比較するのがポイントです。</p></div></section>
      <section id="strategy"><p className="eyebrow">07 · TACTIEK</p><h2>実戦の基本</h2><div className="strategy-grid"><article><b>01</b><h3>切り札を数える</h3><p>全部で8枚。自分の手札と既出分を引き、未確認枚数を追います。</p></article><article><b>02</b><h3>Jと9を追う</h3><p>上位2枚の所在が分かると、Aや10を安全に使いやすくなります。</p></article><article><b>03</b><h3>Aと10を守る</h3><p>相手が切れそうなスートへ高得点札を急いで出さないようにします。</p></article><article><b>04</b><h3>味方へ点を渡す</h3><p>味方が勝つトリックに、フォロー不要なら10などを乗せる判断も有効です。</p></article></div></section>
      <section id="words"><p className="eyebrow">08 · WOORDENBOEK</p><h2>オランダ語の用語検索</h2><label className="rule-search"><span>用語または説明を検索</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例：nat、切り札、フォロー" /></label><p className="search-count" role="status">{matches.length}件の用語</p><dl className="words">{matches.map(([term, category, description]) => <div key={term}><dt>{term}<small>{category}</small></dt><dd>{description}</dd></div>)}</dl>{matches.length === 0 && <div className="empty-rule-search"><b>該当する用語がありません</b><p>表記を短くするか、「得点」「切り札」などで検索してください。</p></div>}</section>
    </div></div>
  </div>;
}
