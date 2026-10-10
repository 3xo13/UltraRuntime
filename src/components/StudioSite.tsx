"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import ServiceSection from "./ServiceSection";
import SharedSectionBackdrop from "./SharedSectionBackdrop";
import ConnectedBackdrops from "./ConnectedBackdrops";
import { logoPath } from "./brand";
import { DictionaryProvider, useDictionary } from "@/i18n/DictionaryProvider";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Header({ locale }: { locale: Locale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { navigation: t } = useDictionary();

  return (
    <header className="header glass" onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }}>
      <a href="#home" className="brand" aria-label={t.home}>
        <Image src={logoPath} alt="UltraRuntime" width={2172} height={724} priority />
      </a>
      <nav id="main-navigation" className={`nav ${menuOpen ? "open" : ""}`} aria-label={t.label}>
        {[
          [t.services, "#services"],
          [t.work, "#work"],
          [t.approach, "#approach"],
          [t.studio, "#studio"],
        ].map(([label, href]) => (
          <a href={href} onClick={() => setMenuOpen(false)} key={href}>{label}</a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="language-link" href={locale === "ar" ? "/en" : "/ar"}
          hrefLang={locale === "ar" ? "en" : "ar"} lang={locale === "ar" ? "en" : "ar"}
          aria-label={t.switchLanguage}>
          {locale === "ar" ? "EN" : "العربية"}
        </a>
        <a className="button compact" href="#contact">{t.talk}</a>
        <button
          className="menu"
          ref={menuButton}
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={t.toggleMenu}
          type="button"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>
    </header>
  );
}

function Hero() {
  const { hero: t } = useDictionary();
  return (
    <section className="hero section">
      <Image
        className="hero-art"
        src="/assets/with-background/hero-loop.png"
        alt=""
        fill
        priority
        sizes="(max-width: 700px) 100vw, 70vw"
      />
      <div className="hero-shade" />
      <div className="hero-copy">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title} <em>{t.emphasis}</em></h1>
        <p>{t.description}</p>
        <div className="actions">
          <a href="#contact" className="button">{t.start}</a>
          <a href="#services" className="button secondary">{t.explore}</a>
        </div>
      </div>
      <div className="hero-caption glass">
        <span className="caption-icon">⌘</span>
        <div>
          <strong>{t.caption}</strong>
          <small>{t.captionDetail}</small>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { services, navigation } = useDictionary();
  const pairAssets = ["automation-custom", "apps-research", "maintenance-support"] as const;
  // SEO continues into the work section, so it is rendered with that shared backdrop.
  const pairedServices = services.filter((service) => service.id !== "seo");
  const pairs = Array.from({ length: Math.ceil(pairedServices.length / 2) }, (_, index) =>
    pairedServices.slice(index * 2, index * 2 + 2));
  return (
    <>
      <nav id="services" className="service-index" aria-label={navigation.services}>
        {services.map((service) => (
          <a href={`#${service.id}`} key={service.id}>
            <b>{service.number}</b><span>{service.shortTitle}</span>
          </a>
        ))}
      </nav>
      <div className="services">
        {pairs.map((pair, index) => (
          <SharedSectionBackdrop
            key={pair[0].id}
            name={pair.map((service) => service.id).join("-")}
            asset={pairAssets[index]}
          >
            {pair.map((service) => <ServiceSection key={service.id} service={service} />)}
          </SharedSectionBackdrop>
        ))}
      </div>
    </>
  );
}

function Work() {
  const { work: t } = useDictionary();
  return (
    <section className="work section" id="work">
      <div className="section-intro">
        <div>
          <div className="eyebrow">{t.eyebrow}</div>
          <h2>{t.title}</h2>
        </div>
        <p>{t.description}</p>
      </div>
      <div className="work-grid">
        {t.projects.map((project, index) => (
          <article className={`work-card glass ${index === 0 ? "featured" : ""}`} key={project.title}>
            <div className="work-head">
              <small>{project.category}</small><span>{project.number} /</span>
            </div>
            <h3><bdi>{project.title}</bdi></h3>
            <p>{project.summary}</p>
            {index === 0 && (
              <div className="work-flow">
                <span>▧<small>{t.invoice}</small></span><b aria-hidden="true">→</b>
                <span className="focus">✦<small>{t.extraction}</small></span><b aria-hidden="true">→</b>
                <span>▤<small>{t.data}</small></span>
              </div>
            )}
            <div className="tags">
              {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <details>
              <summary>{t.details} <b>+</b></summary>
              <p>{project.detail}</p>
            </details>
          </article>
        ))}
      </div>
      <a className="work-cta" href="#contact">
        {t.cta} <ArrowIcon />
      </a>
    </section>
  );
}

function Approach() {
  const { approach: t } = useDictionary();
  return (
    <section className="approach section" id="approach">
      <div className="section-intro">
        <div><div className="eyebrow">{t.eyebrow}</div><h2>{t.title}</h2></div>
        <p>{t.description}</p>
      </div>
      <div className="process-grid">
        {t.steps.map(({ number, title, body }) => (
          <article key={number}><small>{number}</small><h3>{title}</h3><p>{body}</p></article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { contact: t } = useDictionary();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="contact section" id="contact">
      <div className="contact-copy">
        <div className="eyebrow">{t.eyebrow}</div>
        <h2>{t.title}</h2>
        <p>{t.description}</p>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <label><span>{t.name}</span><input name="name" autoComplete="name" placeholder={t.namePlaceholder} required /></label>
          <label><span>{t.email}</span><input name="email" type="email" dir="ltr" autoComplete="email" placeholder={t.emailPlaceholder} required /></label>
        </div>
        <label>
          <span>{t.project}</span>
          <textarea name="project" placeholder={t.projectPlaceholder} required />
        </label>
        <div className="form-bottom">
          <button className="button" type="submit">{t.submit}</button>
          <small>{t.preview}</small>
        </div>
        {submitted && (
          <p className="form-status" role="status">{t.status}</p>
        )}
      </form>
    </section>
  );
}

function Footer() {
  const { footer: t, whatsapp } = useDictionary();
  const [preview, setPreview] = useState("");
  return (
    <footer className="footer section">
      <div className="footer-top">
        <div>
          <Image src={logoPath} alt="UltraRuntime" width={2172} height={724} />
          <p>{t.tagline}</p>
        </div>
        <div className="footer-links">
          <button onClick={() => setPreview(t.emailPreview)} type="button">
            <span>{t.email}</span><strong>{t.emailPlaceholder}</strong>
          </button>
          <button onClick={() => setPreview(t.phonePreview)} type="button">
            <span>{t.phone}</span><strong>{t.phonePlaceholder}</strong>
          </button>
          <button onClick={() => setPreview(t.whatsappPreview)} type="button">
            <span>{whatsapp.label}</span><strong>{t.whatsappPlaceholder}</strong>
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} <bdi>UltraRuntime</bdi>. {t.rightsReserved}</p>
        <a href="#home">{t.backToTop} ↑</a>
      </div>
      <p className="contact-preview-status" role="status" aria-live="polite">{preview}</p>
    </footer>
  );
}

function StudioContent({ locale }: { locale: Locale }) {
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const whatsAppButton = useRef<HTMLButtonElement>(null);
  const { services, studio, whatsapp } = useDictionary();
  const seoService = services.find((service) => service.id === "seo");

  function closeWhatsApp() {
    setWhatsAppOpen(false);
    whatsAppButton.current?.focus();
  }

  return (
    <div className="site-shell" id="home" data-language={locale} onKeyDown={(event) => {
      if (event.key === "Escape" && whatsAppOpen) closeWhatsApp();
    }}>
      <Header locale={locale} />
      <main>
        <Hero />
        <div className="layered-main">
          <Services />
          <ConnectedBackdrops>
            <SharedSectionBackdrop name="seo-work" connection="outgoing">
              {seoService && <ServiceSection service={seoService} />}
              <Work />
            </SharedSectionBackdrop>
            <SharedSectionBackdrop name="approach-studio-contact" connection="incoming" rotation={180}>
              <Approach />
              <section className="about section" id="studio">
                <div>
                  <div className="eyebrow">{studio.eyebrow}</div>
                  <h2>{studio.title}</h2>
                </div>
                <div>
                  <p>{studio.description}</p>
                  <small>{studio.worldwide}</small>
                </div>
              </section>
              <Contact />
            </SharedSectionBackdrop>
          </ConnectedBackdrops>
          <Footer />
        </div>
      </main>
      {whatsAppOpen && (
        <div className="whatsapp-card glass" id="whatsapp-preview">
          <button onClick={closeWhatsApp} aria-label={whatsapp.close} type="button">×</button>
          <strong>{whatsapp.title}</strong>
          <p>{whatsapp.description}</p>
        </div>
      )}
      <button
        className="whatsapp"
        ref={whatsAppButton}
        onClick={() => setWhatsAppOpen((value) => !value)}
        aria-expanded={whatsAppOpen}
        aria-controls="whatsapp-preview"
        aria-label={whatsapp.label}
        type="button"
      >
        ◌ <span>{whatsapp.label}</span>
      </button>
    </div>
  );
}

export default function StudioSite({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  return (
    <DictionaryProvider dictionary={dictionary}>
      <StudioContent locale={locale} />
    </DictionaryProvider>
  );
}
