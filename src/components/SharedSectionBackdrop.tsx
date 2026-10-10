import type { ReactNode } from "react";
import styles from "./SharedSectionBackdrop.module.css";

type Props = {
  children: ReactNode;
  asset?: ArtworkAsset;
  name: string;
  rotation?: number;
  scale?: number;
  connection?: "outgoing" | "incoming";
};

type ArtworkAsset =
  | "connection"
  | "modular-assembly"
  | "orbit"
  | "automation-custom"
  | "apps-research"
  | "maintenance-support";

const artworkPaths: Record<ArtworkAsset, string> = {
  connection: "/assets/transparent/connection.png",
  "modular-assembly": "/assets/transparent/modular-assembly.png",
  orbit: "/assets/transparent/orbit.png",
  "automation-custom": "/assets/transparent/01-02-automation-custom.png",
  "apps-research": "/assets/transparent/03-04-apps-research.png",
  "maintenance-support": "/assets/transparent/05-06-maintenance-support.png",
};

const broadAssets = new Set<ArtworkAsset>([
  "automation-custom",
  "apps-research",
  "maintenance-support",
]);

/** A single decorative object follows the combined height of its sections. */
export default function SharedSectionBackdrop({
  children, asset = "connection", name, rotation = 0, scale = 1, connection,
}: Props) {
  const broad = broadAssets.has(asset);

  return (
    <div
      className={`${styles.container}${connection ? ` ${styles[connection]}` : ""}`}
      data-section-backdrop={name}
      data-connection={connection}
    >
      <div className={styles.artwork} aria-hidden="true">
        <div
          className={`${styles.sculpture}${broad ? ` ${styles.broad}` : ""}`}
          style={{
            backgroundImage: `url("${artworkPaths[asset]}")`,
            transform: `translateX(var(--sculpture-shift, 0%)) rotate(${rotation}deg) scale(${scale})`,
          }}
        />
      </div>
      {children}
    </div>
  );
}
