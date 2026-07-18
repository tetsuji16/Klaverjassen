export interface Lesson {
  id: number;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export const lessons: Lesson[] = [
  { id: 1, eyebrow: "はじめの一歩", title: "4人、2チーム、8トリック", summary: "向かい同士が味方。4枚の勝負を8回くり返します。", detail: "各プレイヤーは8枚を持ちます。1人がカードを出し、時計回りに全員が1枚ずつ出すまとまりがトリック（slag）です。", question: "あなたのパートナーはどの席？", choices: ["左隣", "向かい", "右隣"], answer: 1, explanation: "向かいの席同士がチームです。北と南、東と西が組みます。" },
  { id: 2, eyebrow: "カードの強さ", title: "切り札のJと9は特別", summary: "通常はAが最強。切り札だけJ、9が最上位です。", detail: "通常は A・10・K・Q・J・9・8・7。切り札は J・9・A・10・K・Q・8・7 の順です。", question: "切り札で最も強いカードは？", choices: ["A", "J", "9"], answer: 1, explanation: "切り札のJ（boer）は最強で20点。次が9で14点です。" },
  { id: 3, eyebrow: "色をそろえる", title: "同じスートをフォロー", summary: "リードされたスートを持っていれば必ず出します。", detail: "最初に出たカードのスートがリードです。強さに関係なく、手札に同じスートがあればそこから選びます。", question: "ハートがリード。手札にハート7があるとき、スペードAを出せる？", choices: ["出せる", "出せない"], answer: 1, explanation: "ハートを1枚でも持っているので、ハートをフォローする必要があります。" },
  { id: 4, eyebrow: "切り札", title: "相手をオーバートランプ", summary: "相手が切り札で勝っているなら、可能な限り上を出します。", detail: "リードをフォローできず、相手が切り札で勝っているときは、より強い切り札があれば必ず使います。", question: "相手の切り札9に対して勝てる切り札は？", choices: ["切り札A", "切り札J", "切り札10"], answer: 1, explanation: "切り札の順位はJ、9、A…なので、9を上回るのはJだけです。" },
  { id: 5, eyebrow: "Amsterdamの特徴", title: "味方が勝っていれば捨てられる", summary: "パートナーがトリックを取れそうなら、切り札を温存できます。", detail: "フォローできず味方が勝っている場合、原則として好きな非切り札を捨てられます。ただし切り札リードなどの制限は残ります。", question: "味方のAが勝っていて、リードを持っていない。切り札を必ず出す？", choices: ["必ず出す", "出さなくてよい"], answer: 1, explanation: "Amsterdam式では味方が勝っているなら、切り札を温存できます。" },
  { id: 6, eyebrow: "切り札を決める", title: "spelenかpassen", summary: "手札を見て切り札を選ぶか、次の人へ回します。", detail: "ディーラーの左から宣言します。全員がパスすると、最初の人が必ず切り札を選びます。", question: "全員がパスした後、切り札を選ぶのは？", choices: ["ディーラー", "ディーラーの左", "ランダム"], answer: 1, explanation: "最初に判断した、ディーラーの左隣が選びます。" },
  { id: 7, eyebrow: "ボーナス", title: "roemとstuk", summary: "トリックにできた並びや切り札K・Qで追加点。", detail: "同一スートの連続3枚は20点、4枚は50点。切り札のKとQが同じトリックにあればstukで20点です。", question: "切り札のKとQが同じトリックに出たボーナスは？", choices: ["10点", "20点", "50点"], answer: 1, explanation: "stukは20点です。このサイトでは自動判定します。" },
  { id: 8, eyebrow: "勝敗と得点", title: "natとpit", summary: "契約側は相手より多く取る必要があります。", detail: "契約側が相手を上回れないとnat。全8トリックを取ればpitで100点追加です。", question: "契約側と相手が同点なら？", choices: ["契約成功", "nat", "引き分け"], answer: 1, explanation: "契約側は必ず相手を上回る必要があります。同点もnatです。" },
  { id: 9, eyebrow: "一歩先の戦略", title: "既出カードを覚える", summary: "強い切り札が何枚残っているかを考えます。", detail: "Aや10は高得点です。相手の切り札が残る間は、むやみに高得点カードを出さない判断も重要です。", question: "相手がトリックを取りそうなとき、守りたいカードは？", choices: ["0点の7", "10点の10", "0点の8"], answer: 1, explanation: "10は10点。相手に取られないタイミングを選びましょう。" },
  { id: 10, eyebrow: "実戦の読み", title: "リードから計画する", summary: "切り札を減らすか、味方へ渡すかを考えます。", detail: "強い切り札が多ければ切り札をリードして相手の切り札を抜くのが有効です。味方の得意スートも意識します。", question: "切り札J・9・Aを持つときの有力なリードは？", choices: ["切り札J", "別スート7", "いつも同じ"], answer: 0, explanation: "最強のJから切り札を抜く計画が有力です。実戦では既出カードも考えます。" },
  { id: 11, eyebrow: "卒業演習", title: "ヒント付き短縮戦へ", summary: "4ディールを完走して、ルールを体で覚えます。", detail: "CPU初級と学習アシストを使い、推奨手の理由を読みながら短縮戦を遊びましょう。", question: "迷ったとき最初に確認することは？", choices: ["合法手", "累計点だけ", "カードの色だけ"], answer: 0, explanation: "まず合法手を確認し、その中から得点と次の展開を比べます。" },
];
