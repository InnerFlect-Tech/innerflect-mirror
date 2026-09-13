'use client';

import { useState } from 'react';
import { ArrowRight, BookOpen, FileText, Layers, Link2, Search } from 'lucide-react';
import type { KnowledgeObject } from '@/lib/model/knowledge';
import {
  exampleQuestion, knowledgeHealth, mapEdges, mapNodes, memoryUpgrades,
  recentLearnings, retrievalReasoning, retrievedSources,
} from '@/data/knowledge';
import { KnowledgeMap } from './KnowledgeMap';
import { KnowledgeTable } from './KnowledgeTable';
import { SurfaceSummary } from './SurfaceSummary';

const UPGRADE_ICON = [<FileText key="a" size={15} />, <Layers key="b" size={15} />, <Link2 key="c" size={15} />];

/**
 * Knowledge is the company's memory, connected to action — so the surface leads
 * with the map and with an answer, not with a file list. The table of objects
 * lives behind the Practical view, the same Visual/Practical grammar the
 * Company surface uses.
 */
export function KnowledgeSurface({ objects }: { objects: KnowledgeObject[] }) {
  const [view, setView] = useState<'visual' | 'practical'>('visual');
  const [question, setQuestion] = useState(exampleQuestion);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [allLearnings, setAllLearnings] = useState(false);
  const [proposed, setProposed] = useState<string[]>([]);
  const drifting = objects.filter((o) => o.drift).length;

  return (
    <div className="knowledge">
      <div className="knowledge-head">
        <div>
          <span className="context">Trusted knowledge objects</span>
          <h1>Knowledge</h1>
          <p>The company memory, connected to action.</p>
        </div>
        <fieldset className="segmented">
          <legend className="sr-only">Knowledge view</legend>
          <button type="button" aria-pressed={view === 'visual'} className={view === 'visual' ? 'active' : ''} onClick={() => setView('visual')}>Visual</button>
          <button type="button" aria-pressed={view === 'practical'} className={view === 'practical' ? 'active' : ''} onClick={() => setView('practical')}>Practical</button>
        </fieldset>
        <p className="knowledge-motto">From experience<br />to a smarter tomorrow.</p>
      </div>

      <SurfaceSummary
        stats={[
          { value: knowledgeHealth.items.toLocaleString(), label: 'Knowledge items' },
          { value: `${knowledgeHealth.retrievalConfidence}%`, label: 'Retrieval confidence', tone: 'good' },
          { value: String(drifting), label: 'Drifting from reality', tone: drifting ? 'attention' : 'good' },
          { value: String(knowledgeHealth.policyGaps), label: 'Policy gaps', tone: 'critical' },
          { value: String(knowledgeHealth.newLearnings), label: 'Learned this week' },
        ]}
      />

      {view === 'practical' ? (
        <KnowledgeTable objects={objects} />
      ) : (
        <div className="knowledge-grid">
          <section className="panel kmap-panel">
            <div className="panel-head">
              <div><h3>Company Knowledge Map</h3><small>Connected. Contextual. Always useful.</small></div>
            </div>
            <KnowledgeMap nodes={mapNodes} edges={mapEdges} />
          </section>

          <section className="panel ask-panel">
            <div className="panel-head"><div><h3>Ask your company</h3></div></div>
            <form className="ask-form" onSubmit={(e) => e.preventDefault()}>
              <label className="field-search">
                <Search size={14} aria-hidden="true" />
                <span className="sr-only">Ask your company</span>
                <input value={question} onChange={(e) => setQuestion(e.target.value)} />
              </label>
              <button type="submit" aria-label="Ask"><ArrowRight size={15} /></button>
            </form>

            <span className="eyebrow ask-found">InnerFlect found and analysed</span>
            <ul className="source-list">
              {retrievedSources.map((s) => (
                <li key={s.id}>
                  <span className="source-icon" aria-hidden="true"><BookOpen size={13} /></span>
                  <span className="source-body"><b>{s.label}</b><small>{s.detail}</small></span>
                  <span className="source-badge">{s.badge}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="panel-cta" aria-expanded={showAnswer} onClick={() => setShowAnswer(!showAnswer)}>
              {showAnswer ? 'Hide answer' : 'View full, traceable answer'} <ArrowRight size={13} />
            </button>
            {showAnswer && (
              <div className="answer">
                <p>
                  Payments to Acme Supplies outside standard terms have been approved three times in
                  the last quarter, each time because the goods were received and the PO matched.
                  Your payment policy permits this under the exceptional payments clause, but that
                  policy has not been verified for eight months and names a finance owner who does
                  not exist.
                </p>
                <p className="answer-caveat">
                  Confidence is limited by one stale source. Assigning a finance owner would raise it.
                </p>
              </div>
            )}
          </section>

          <section className="panel why-panel">
            <div className="panel-head">
              <div><h3>Why this was retrieved</h3></div>
              <span className="traceable-pill">Traceable</span>
            </div>
            <p>{retrievalReasoning}</p>
            <button type="button" className="panel-cta" aria-expanded={showReasoning} onClick={() => setShowReasoning(!showReasoning)}>
              See retrieval reasoning <ArrowRight size={13} />
            </button>
            {showReasoning && (
              <ol className="reasoning">
                <li><b>Question matched</b> against policy, decision and client indexes.</li>
                <li><b>Context applied</b> — Finance domain, current workflow state.</li>
                <li><b>Past patterns weighted</b> — 3 similar decisions, all approved.</li>
                <li><b>Sources ranked</b> by trust level and freshness.</li>
              </ol>
            )}
          </section>

          <section className="panel learnings-panel">
            <div className="panel-head">
              <div><h3>Recent learnings</h3></div>
              <button type="button" className="panel-cta inline" aria-expanded={allLearnings} onClick={() => setAllLearnings(!allLearnings)}>
                {allLearnings ? 'Show recent' : 'View all'} <ArrowRight size={12} />
              </button>
            </div>
            <ul className="learning-list">
              {(allLearnings ? [...recentLearnings, ...recentLearnings.map((l) => ({ ...l, id: `${l.id}-b`, at: 'last week' }))] : recentLearnings).map((l) => (
                <li key={l.id}>
                  <span className="source-icon" aria-hidden="true"><FileText size={13} /></span>
                  <span className="source-body"><b>{l.label}</b><small>{l.capturedFrom}</small></span>
                  <time>{l.at}</time>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel upgrades-panel">
            <div className="panel-head">
              <div><h3>Suggested memory upgrades</h3></div>
              <small className="panel-note">Turn today’s work into a smarter tomorrow.</small>
            </div>
            <ul className="upgrade-list">
              {memoryUpgrades.map((u, i) => (
                <li key={u.id}>
                  <span className="upgrade-icon" aria-hidden="true">{UPGRADE_ICON[i]}</span>
                  <b>{u.title}</b>
                  <p>{u.detail}</p>
                  <button
                    type="button"
                    className={`panel-cta${proposed.includes(u.id) ? ' is-done' : ''}`}
                    disabled={proposed.includes(u.id)}
                    onClick={() => setProposed((p) => [...p, u.id])}
                  >
                    {proposed.includes(u.id) ? 'Sent for approval' : u.cta} <ArrowRight size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
