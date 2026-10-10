import { useDictionary } from "@/i18n/DictionaryProvider";
import type { Dictionary } from "@/i18n/types";
import ServiceDemo from "./ServiceDemo";

export default function ServiceSection({ service }: { service: Dictionary["services"][number] }) {
  const { serviceLabels: t } = useDictionary();
  const reverse = ["custom", "maintenance", "seo"].includes(service.id);

  return (
    <section className={`service section${reverse ? " reverse" : ""}`} id={service.id}>
      <div className="service-copy">
        <div className="number">{service.number} /</div>
        <h2>{service.title}</h2>
        <p>{service.body}</p>
        <div className="examples">
          <small>{t.examples}</small><span>{service.examples}</span>
        </div>
        {service.relatedWork && (
          <div className="proof">▱ &nbsp; {t.relatedWork} / <bdi>{service.relatedWork}</bdi></div>
        )}
      </div>
      <ServiceDemo id={service.id} />
    </section>
  );
}
