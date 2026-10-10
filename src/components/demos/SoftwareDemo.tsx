"use client";

import { useState } from "react";
import { useDictionary } from "@/i18n/DictionaryProvider";
import DemoChoices from "./DemoChoices";

export default function SoftwareDemo() {
  const { demos: { software: t } } = useDictionary();
  const [selected, setSelected] = useState(0);
  const columns = selected === 0 ? [t.item, t.location, t.status] : t.invoiceColumns;
  const rows = selected === 0 ? t.rows : t.invoiceRows;

  return (
    <div className="demo app-demo">
      <div className="window-bar"><span className="dots">•••</span> {t.label}</div>
      <div className="app-layout">
        <aside aria-hidden="true"><span>⌂</span><span>□</span><span>≡</span></aside>
        <div className="app-main">
          <strong>{t.title}</strong>
          <DemoChoices
            labels={[t.inventory, t.invoices]}
            selected={selected}
            onSelect={setSelected}
            label={t.selectionLabel}
            controls="software-table"
            className="app-tabs"
          />
          <div id="software-table" role="table" aria-label={selected === 0 ? t.inventory : t.invoices} aria-live="polite">
            <div className="data-row data-heading" role="row">
              {columns.map((column) => <span role="columnheader" key={column}>{column}</span>)}
            </div>
            {rows.map(({ item, location, status }) => (
              <div className="data-row" role="row" key={item}>
                <span role="cell"><bdi>{item}</bdi></span>
                <span role="cell">{location}</span>
                <em role="cell">{status}</em>
              </div>
            ))}
          </div>
          <p className="demo-note">{t.note}</p>
        </div>
      </div>
    </div>
  );
}
