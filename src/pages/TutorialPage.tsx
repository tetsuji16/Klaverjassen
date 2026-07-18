import { useState } from "react";
import { Link } from "react-router-dom";
import type { TutorialProgress } from "../game/types";
import { lessons } from "../tutorial/lessons";

export default function TutorialPage({ progress, onProgress }: { progress: TutorialProgress; onProgress: (next: TutorialProgress) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const lesson = lessons.find((item) => item.id === selected);
  const check = () => {
    if (!lesson || choice === null) return;
    setChecked(true);
    const correct = choice === lesson.answer;
    onProgress({
      completed: correct ? Array.from(new Set([...progress.completed, lesson.id])) : progress.completed,
      attempts: { ...progress.attempts, [lesson.id]: (progress.attempts[lesson.id] || 0) + 1 },
    });
  };
  if (lesson) return <div className="page narrow lesson-page">
    <button className="back-button" onClick={() => { setSelected(null); setChoice(null); setChecked(false); }}>← レッスン一覧</button>
    <p className="eyebrow">LESSON {String(lesson.id).padStart(2, "0")} · {lesson.eyebrow}</p><h1>{lesson.title}</h1>
    <div className="lesson-visual"><span>{lesson.id === 2 ? "J  ›  9  ›  A" : lesson.id === 7 ? "K  +  Q" : "♣  ♦  ♥  ♠"}</span></div>
    <p className="lesson-summary">{lesson.summary}</p><p className="lesson-detail">{lesson.detail}</p>
    <section className="quiz"><p className="eyebrow">CHECK</p><h2>{lesson.question}</h2><div className="quiz-choices">
      {lesson.choices.map((answer, index) => <button key={answer} className={choice === index ? "selected" : ""} onClick={() => { setChoice(index); setChecked(false); }}><span>{String.fromCharCode(65 + index)}</span>{answer}</button>)}
    </div>
    {checked && <div role="status" className={`feedback ${choice === lesson.answer ? "correct" : "wrong"}`}><b>{choice === lesson.answer ? "正解です" : "もう一度考えてみましょう"}</b><p>{lesson.explanation}</p></div>}
    <button className="button primary wide" disabled={choice === null} onClick={check}>答えを確認</button></section>
    {progress.completed.includes(lesson.id) && lesson.id < lessons.length && <button className="button secondary wide" onClick={() => { setSelected(lesson.id + 1); setChoice(null); setChecked(false); }}>次のレッスンへ →</button>}
    {lesson.id === 11 && progress.completed.includes(11) && <Link to="/cpu" className="button primary wide">卒業演習を始める →</Link>}
  </div>;
  return <div className="page tutorial-page"><div className="section-heading"><div><p className="eyebrow">LEARN THE GAME</p><h1>11のステップで、<br />遊びながら覚える。</h1></div><div className="progress-ring"><b>{progress.completed.length}</b><span>/ {lessons.length}</span><small>完了</small></div></div>
    <div className="lesson-grid">{lessons.map((item) => <button key={item.id} className={`lesson-card ${progress.completed.includes(item.id) ? "done" : ""}`} onClick={() => setSelected(item.id)}><span className="lesson-num">{String(item.id).padStart(2, "0")}</span><div><small>{item.eyebrow}</small><h2>{item.title}</h2><p>{item.summary}</p></div><span className="lesson-arrow">{progress.completed.includes(item.id) ? "✓" : "→"}</span></button>)}</div>
  </div>;
}
