"use client";

import { useState } from "react";
import { useDictionary } from "@/i18n/DictionaryProvider";
import DemoChoices from "./DemoChoices";

export default function ResearchDemo() {
  const { demos: { research: t } } = useDictionary();
  const [selected, setSelected] = useState(0);
  const document = t.documents[selected];

  return (
    <div className="demo research-demo">
      <DemoChoices
        labels={t.tabs}
        selected={selected}
        onSelect={setSelected}
        label={t.selectionLabel}
        controls="research-document"
        className="research-tabs"
        numbered
      />
      <div className="document" id="research-document" aria-live="polite">
        <small>{document.eyebrow}</small>
        <h3>{document.title}</h3>
        {document.checks.map((check) => <p key={check}>✓ {check}</p>)}
      </div>
    </div>
  );
}
