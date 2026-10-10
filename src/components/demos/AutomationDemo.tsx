"use client";

import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/i18n/DictionaryProvider";
import DemoChoices from "./DemoChoices";

const stepDelay = 450;
const icons = ["□", "✦", "◌"];

export default function AutomationDemo() {
  const { demos: { automation: t } } = useDictionary();
  const [selected, setSelected] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const steps = selected === 0 ? t.steps : t.leadSteps;
  const complete = completedSteps === steps.length;

  function cancelRun() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function selectExample(index: number) {
    cancelRun();
    setSelected(index);
    setCompletedSteps(0);
    setRunning(false);
  }

  function runExample() {
    cancelRun();
    setCompletedSteps(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCompletedSteps(steps.length);
      setRunning(false);
      return;
    }

    setRunning(true);
    timers.current = steps.map((_, index) => setTimeout(() => {
      setCompletedSteps(index + 1);
      if (index === steps.length - 1) setRunning(false);
    }, (index + 1) * stepDelay));
  }

  const status = running ? t.running : complete
    ? (selected === 0 ? t.complete : t.leadComplete)
    : t.idle;

  return (
    <div className="demo workflow-demo">
      <div className="demo-label"><span>{t.label}</span><span aria-hidden="true">⌘</span></div>
      <DemoChoices
        labels={[t.customerService, t.leadFollowUp]}
        selected={selected}
        onSelect={selectExample}
        label={t.selectionLabel}
        controls="automation-workflow"
      />
      <div id="automation-workflow" aria-busy={running}>
        {steps.map(({ title, detail }, index) => (
          <div className={`flow-node ${index < completedSteps ? "done" : ""}`} key={index}>
            <span className="node-icon" aria-hidden="true">{icons[index]}</span>
            <div><strong>{title}</strong><small>{detail}</small></div>
            <span className="check" aria-hidden="true">✓</span>
          </div>
        ))}
      </div>
      <div className="demo-bottom">
        <button className="mini-button" onClick={runExample} disabled={running} type="button">
          <span aria-hidden="true">▶ </span>{complete ? t.again : t.run}
        </button>
        <small role="status" aria-live="polite">{status}</small>
      </div>
    </div>
  );
}
