"use client";

import { useState } from "react";
import { useDictionary } from "@/i18n/DictionaryProvider";
import DemoChoices from "./DemoChoices";

const icons = ["○", "⌖", "□"];

export default function MaintenanceDemo() {
  const { demos: { maintenance: t } } = useDictionary();
  const [selected, setSelected] = useState(0);
  const improved = selected === 1;
  const steps = improved ? t.improvedSteps : t.steps;

  return (
    <div className={`demo compare-demo ${improved ? "is-after" : ""}`}>
      <div className="demo-label">{t.label}</div>
      <DemoChoices
        labels={[t.before, t.after]}
        selected={selected}
        onSelect={setSelected}
        label={t.selectionLabel}
        controls="maintenance-preview"
      />
      <div id="maintenance-preview" aria-live="polite">
        <div className="compare-screen">
          <strong>{t.title}</strong>
          {steps.map((step, index) => <p key={step}>{step}<span aria-hidden="true">{icons[index]}</span></p>)}
        </div>
        <p className="demo-note">{improved ? t.improvedNote : t.note}</p>
      </div>
    </div>
  );
}
