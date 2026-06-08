import { useState, useRef, useCallback } from "react";
const API = "https://resume-analyzer-five-rho.vercel.app";

const palette = {
  bg: "#0A0A0A",
  surface: "#111111",
  card: "#171717",
  border: "#262626",

  accent: "#60A5FA",      // soft glowing blue
  accentGlow: "#60A5FA30",
  accentDark: "#3B82F6",

  green: "#34D399",
  amber: "#FBBF24",
  red: "#F87171",

  text: "#FAFAFA",
  muted: "#A3A3A3",
  subtle: "#737373",
};


const styles = {
  app: {
    minHeight: "100vh",
    background: palette.bg,
    color: palette.text,
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "0",
  },
  header: {
    borderBottom: `1px solid ${palette.border}`,
    padding: "1.25rem 2rem",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: palette.surface,
  },
  headerIcon: {
    width: 36,
    height: 36,
    background: `linear-gradient(135deg, ${palette.accent}, ${palette.accentDark})`,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.3px",
  },
  headerSub: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 1,
  },
  main: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "2.5rem 1.5rem",
  },
  tabs: {
    display: "flex",
    gap: 4,
    background: palette.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: "2rem",
    border: `1px solid ${palette.border}`,
  },
  tab: (active) => ({
    flex: 1,
    padding: "8px 16px",
    borderRadius: 9,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    background: active ? palette.accent : "transparent",
    color: active ? "#fff" : palette.muted,
    transition: "all 0.15s",
  }),
  dropzone: (drag) => ({
    border: `2px dashed ${drag ? palette.accent : palette.border}`,
    borderRadius: 16,
    padding: "3rem 2rem",
    textAlign: "center",
    cursor: "pointer",
    background: drag ? palette.accentGlow : palette.card,
    transition: "all 0.2s",
    marginBottom: "1.5rem",
  }),
  card: {
    background: palette.card,
    border: `1px solid ${palette.border}`,
    borderRadius: 16,
    padding: "1.5rem",
    marginBottom: "1.25rem",
  },
  scoreRing: {
    width: 120,
    height: 120,
    margin: "0 auto 1.5rem",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
    marginTop: "1rem",
  },
  metricCard: (color) => ({
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: 12,
    padding: "12px 14px",
    borderLeft: `3px solid ${color}`,
  }),
  metricLabel: {
    fontSize: 11,
    color: palette.muted,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.subtle,
    marginBottom: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  listItem: (type) => ({
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    fontSize: 14,
    lineHeight: 1.5,
    color: palette.text,
    padding: "10px 12px",
    borderRadius: 8,
    background: type === "good"
      ? "#10B98112"
      : type === "bad"
      ? "#EF444412"
      : "#3B82F612",
  }),
  dot: (type) => ({
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: type === "good" ? palette.green : type === "bad" ? palette.red : palette.accent,
    marginTop: 5,
    flexShrink: 0,
  }),
  btn: (variant = "primary", disabled = false) => ({
    padding: "10px 20px",
    borderRadius: 10,
    border: variant === "secondary" ? `1px solid ${palette.border}` : "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 500,
    background: disabled
      ? palette.border
      : variant === "primary"
      ? palette.accent
      : "transparent",
    color: disabled ? palette.muted : "#fff",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: 6,
  }),
  questionCard: {
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: 12,
    padding: "1rem 1.25rem",
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    color: palette.text,
    fontSize: 13,
    padding: "10px 12px",
    resize: "vertical",
    minHeight: 90,
    marginTop: 8,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  badge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: color + "22",
    color: color,
    border: `1px solid ${color}44`,
  }),
};

function ScoreRing({ score }) {
  const r = 50;
  const cx = 60, cy = 60;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  const dash = pct * circumference;
  const color = score >= 70 ? palette.green : score >= 45 ? palette.amber : palette.red;
  const label = score >= 70 ? "Strong" : score >= 45 ? "Average" : "Weak";

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={palette.border} strokeWidth="8" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="22" fontWeight="700">
          {Math.round(score)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={palette.muted} fontSize="10">
          /100
        </text>
      </svg>
      <div style={{ ...styles.badge(color), margin: "0 auto" }}>{label}</div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="9" cy="9" r="7" fill="none" stroke={palette.border} strokeWidth="2.5" />
      <path d="M9 2 A7 7 0 0 1 16 9" fill="none" stroke={palette.accent} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState("analyze");
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [sugLoading, setSugLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [evals, setEvals] = useState({});
  const [evalLoading, setEvalLoading] = useState({});
  const fileRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") {
      setFile(f);
      setResult(null);
      setSuggestions(null);
      setQuestions(null);
    }
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setResult(null);
      setSuggestions(null);
      setQuestions(null);
    }
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/analyze`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "Server error");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (!result) return;
    setSugLoading(true);
    try {
      const res = await fetch(`${API}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: result.resume_text, score: result.score }),
      });
      setSuggestions(await res.json());
    } catch (e) {
      setSuggestions({ raw: "Failed to get suggestions." });
    } finally {
      setSugLoading(false);
    }
  };

  const getQuestions = async () => {
    if (!result) return;
    setQLoading(true);
    try {
      const res = await fetch(`${API}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: result.resume_text }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      setQuestions([]);
    } finally {
      setQLoading(false);
    }
  };

  const evalAnswer = async (idx) => {
    if (!answers[idx]?.trim()) return;
    setEvalLoading((p) => ({ ...p, [idx]: true }));
    try {
      const res = await fetch(`${API}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questions[idx], answer: answers[idx] }),
      });
      const data = await res.json();
      setEvals((p) => ({ ...p, [idx]: data }));
    } catch {
      setEvals((p) => ({ ...p, [idx]: { raw: "Error evaluating." } }));
    } finally {
      setEvalLoading((p) => ({ ...p, [idx]: false }));
    }
  };

  const features = result?.features || {};
  const score = result?.score;

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.3s ease; }
        button:hover:not(:disabled) { opacity: 0.88; }
        textarea:focus { border-color: ${palette.accent} !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${palette.border}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerIcon}>📄</div>
        <div>
          <div style={styles.headerTitle}>Resume Analyzer</div>
          <div style={styles.headerSub}>AI-powered scoring & interview prep</div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Tabs */}
        <div style={styles.tabs}>
          {["analyze", "suggestions", "interview"].map((t) => (
            <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "analyze" ? "📊 Analyze" : t === "suggestions" ? "💡 Suggestions" : "🎯 Interview Prep"}
            </button>
          ))}
        </div>

        {/* ANALYZE TAB */}
        {tab === "analyze" && (
          <div className="fade-in">
            {/* Drop Zone */}
            <div
              style={styles.dropzone(drag)}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf" hidden onChange={handleFile} />
              <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
                {file ? file.name : "Drop your resume here"}
              </div>
              <div style={{ fontSize: 12, color: palette.muted }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB · PDF` : "Click to browse · PDF only"}
              </div>
              {file && (
                <div style={{ marginTop: 12, ...styles.badge(palette.green) }}>✓ File ready</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={styles.btn("primary", !file || loading)}
                onClick={analyze}
                disabled={!file || loading}
              >
                {loading ? <Spinner /> : "⚡"} {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
              {file && (
                <button style={styles.btn("secondary")} onClick={() => { setFile(null); setResult(null); }}>
                  Clear
                </button>
              )}
            </div>

            {error && (
              <div style={{ ...styles.card, borderColor: palette.red + "44", marginTop: "1rem", color: palette.red, fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            {result && (
              <div className="fade-in" style={{ marginTop: "1.5rem" }}>
                {/* Score */}
                <div style={styles.card}>
                  <ScoreRing score={score} />
                  <div style={styles.metricGrid}>
                    {[
                      { label: "Projects", value: features.num_projects || 0, color: palette.accent },
                      { label: "Certifications", value: features.num_certifications || 0, color: palette.green },
                      { label: "Word Count", value: features.resume_word_length || 0, color: palette.amber },
                      { label: "LinkedIn", value: features.has_linkedin ? "✓" : "✗", color: features.has_linkedin ? palette.green : palette.red },
                      { label: "GitHub", value: features.has_github ? "✓" : "✗", color: features.has_github ? palette.green : palette.red },
                      { label: "Summary", value: features.has_summary_section ? "✓" : "✗", color: features.has_summary_section ? palette.green : palette.red },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={styles.metricCard(color)}>
                        <div style={styles.metricLabel}>{label}</div>
                        <div style={{ ...styles.metricValue, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    style={styles.btn("primary", sugLoading)}
                    onClick={() => { getSuggestions(); setTab("suggestions"); }}
                    disabled={sugLoading}
                  >
                    {sugLoading ? <Spinner /> : "💡"} Get Suggestions
                  </button>
                  <button
                    style={styles.btn("secondary", qLoading)}
                    onClick={() => { getQuestions(); setTab("interview"); }}
                    disabled={qLoading}
                  >
                    {qLoading ? <Spinner /> : "🎯"} Generate Questions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUGGESTIONS TAB */}
        {tab === "suggestions" && (
          <div className="fade-in">
            {!result && (
              <div style={{ ...styles.card, textAlign: "center", color: palette.muted, padding: "3rem" }}>
                Upload and analyze a resume first
              </div>
            )}
            {result && !suggestions && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <button style={styles.btn("primary", sugLoading)} onClick={getSuggestions} disabled={sugLoading}>
                  {sugLoading ? <Spinner /> : "💡"} {sugLoading ? "Generating..." : "Get AI Suggestions"}
                </button>
              </div>
            )}
            {suggestions && (
              <>
                {suggestions.strengths && (
                  <div style={styles.card}>
                    <div style={styles.sectionTitle}>✅ Strengths</div>
                    <ul style={styles.list}>
                      {suggestions.strengths.map((s, i) => (
                        <li key={i} style={styles.listItem("good")}>
                          <div style={styles.dot("good")} />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions.weaknesses && (
                  <div style={styles.card}>
                    <div style={styles.sectionTitle}>⚠️ Weaknesses</div>
                    <ul style={styles.list}>
                      {suggestions.weaknesses.map((s, i) => (
                        <li key={i} style={styles.listItem("bad")}>
                          <div style={styles.dot("bad")} />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions.improvements && (
                  <div style={styles.card}>
                    <div style={styles.sectionTitle}>🚀 Improvements</div>
                    <ul style={styles.list}>
                      {suggestions.improvements.map((s, i) => (
                        <li key={i} style={styles.listItem("info")}>
                          <div style={styles.dot("info")} />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions.missing_sections && (
                  <div style={styles.card}>
                    <div style={styles.sectionTitle}>📋 Missing Sections</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {suggestions.missing_sections.map((s, i) => (
                        <div key={i} style={styles.badge(palette.amber)}>{s}</div>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.final_recommendation && (
                  <div style={{ ...styles.card, borderColor: palette.accent + "44" }}>
                    <div style={styles.sectionTitle}>🏁 Final Recommendation</div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: palette.text }}>
                      {suggestions.final_recommendation}
                    </p>
                  </div>
                )}
                {suggestions.raw && (
                  <div style={styles.card}>
                    <p style={{ fontSize: 13, color: palette.subtle, whiteSpace: "pre-wrap" }}>{suggestions.raw}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* INTERVIEW TAB */}
        {tab === "interview" && (
          <div className="fade-in">
            {!result && (
              <div style={{ ...styles.card, textAlign: "center", color: palette.muted, padding: "3rem" }}>
                Upload and analyze a resume first
              </div>
            )}
            {result && !questions && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <button style={styles.btn("primary", qLoading)} onClick={getQuestions} disabled={qLoading}>
                  {qLoading ? <Spinner /> : "🎯"} {qLoading ? "Generating..." : "Generate Interview Questions"}
                </button>
              </div>
            )}
            {questions && questions.map((q, i) => (
              <div key={i} style={{ ...styles.questionCard, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: palette.subtle, marginBottom: 6 }}>
                  Question {i + 1}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{q}</p>
                <textarea
                  style={styles.textarea}
                  placeholder="Type your answer here..."
                  value={answers[i] || ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, [i]: e.target.value }))}
                />
                <div style={{ marginTop: 10 }}>
                  <button
                    style={styles.btn("primary", evalLoading[i] || !answers[i]?.trim())}
                    onClick={() => evalAnswer(i)}
                    disabled={evalLoading[i] || !answers[i]?.trim()}
                  >
                    {evalLoading[i] ? <Spinner /> : "⚡"} {evalLoading[i] ? "Evaluating..." : "Evaluate Answer"}
                  </button>
                </div>
                {evals[i] && (
                  <div style={{ marginTop: 12, background: palette.bg, borderRadius: 10, padding: "1rem" }} className="fade-in">
                    {evals[i].score != null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, color: palette.muted }}>Score:</span>
                        <span style={{
                          fontSize: 18, fontWeight: 700,
                          color: evals[i].score >= 7 ? palette.green : evals[i].score >= 5 ? palette.amber : palette.red
                        }}>
                          {evals[i].score}/10
                        </span>
                      </div>
                    )}
                    {evals[i].strengths?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: palette.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Strengths</div>
                        {evals[i].strengths.map((s, j) => (
                          <div key={j} style={{ fontSize: 13, color: palette.green, padding: "3px 0" }}>✓ {s}</div>
                        ))}
                      </div>
                    )}
                    {evals[i].weaknesses?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: palette.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Weaknesses</div>
                        {evals[i].weaknesses.map((s, j) => (
                          <div key={j} style={{ fontSize: 13, color: palette.red, padding: "3px 0" }}>✗ {s}</div>
                        ))}
                      </div>
                    )}
                    {evals[i].correct_answer && (
                      <div>
                        <div style={{ fontSize: 11, color: palette.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Model Answer</div>
                        <p style={{ fontSize: 13, color: palette.subtle, lineHeight: 1.6 }}>{evals[i].correct_answer}</p>
                      </div>
                    )}
                    {evals[i].raw && (
                      <p style={{ fontSize: 13, color: palette.subtle, whiteSpace: "pre-wrap" }}>{evals[i].raw}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
