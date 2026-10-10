"use client";

import { useState } from "react";
import { useDictionary } from "@/i18n/DictionaryProvider";
import AutomationDemo from "./demos/AutomationDemo";
import SoftwareDemo from "./demos/SoftwareDemo";
import ResearchDemo from "./demos/ResearchDemo";
import MaintenanceDemo from "./demos/MaintenanceDemo";

const appointmentTimes = ["10:00", "11:30", "14:00"];

function ApplicationsDemo() {
  const [activeTime, setActiveTime] = useState(1);
  const { demos: { applications: t } } = useDictionary();

  return (
    <div className="demo device-demo">
      <div className="browser">
        <div className="window-bar"><span className="dots">•••</span> {t.label}</div>
        <div className="booking">
          <small>{t.eyebrow}</small>
          <h3>{t.title}</h3>
          <p>{t.description}</p>
          <div role="group" aria-label={t.description}>
            {appointmentTimes.map((time, index) => (
              <button
                aria-pressed={activeTime === index}
                aria-controls="selected-appointment"
                onClick={() => setActiveTime(index)}
                type="button"
                key={time}
              >
                <bdi>{time}</bdi>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="phone">
        <i /><span>◫</span><strong>{t.visit}</strong>
        <small>{t.detail}</small>
        <b id="selected-appointment" dir="ltr" aria-live="polite">{appointmentTimes[activeTime]}</b>
        <small>{t.selectedTime}</small>
      </div>
    </div>
  );
}

function SupportDemo() {
  const { demos: { support: t } } = useDictionary();
  return (
    <div className="demo support-demo">
      <div className="demo-label"><span>{t.label}</span><span>◌</span></div>
      <p className="message">{t.message}</p>
      <p className="message reply">{t.reply}</p>
      <div className="support-track">
        {t.steps.map((step) => <span key={step}>✓ {step}</span>)}
      </div>
      <p className="demo-note">{t.note}</p>
    </div>
  );
}

function SeoDemo() {
  const { demos: { seo: t } } = useDictionary();

  return (
    <div className="demo seo-demo">
      <div className="searchbar">⌕ &nbsp; {t.search}</div>
      <div className="search-result">
        <small>{t.business} / <bdi>yourwebsite.com</bdi></small>
        <h3>{t.title}</h3>
        <p>{t.description}</p>
      </div>
      {t.checks.map((check) => (
        <div className="seo-row" key={check}><span>{check}</span><b>✓</b></div>
      ))}
    </div>
  );
}

export default function ServiceDemo({ id }: { id: string }) {
  switch (id) {
    case "automation": return <AutomationDemo />;
    case "custom": return <SoftwareDemo />;
    case "apps": return <ApplicationsDemo />;
    case "research": return <ResearchDemo />;
    case "maintenance": return <MaintenanceDemo />;
    case "support": return <SupportDemo />;
    default: return <SeoDemo />;
  }
}
