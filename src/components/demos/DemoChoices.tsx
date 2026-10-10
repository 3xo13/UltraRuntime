type DemoChoicesProps = {
  labels: string[];
  selected: number;
  onSelect: (index: number) => void;
  label: string;
  controls: string;
  className?: string;
  numbered?: boolean;
};

/** Native toggle buttons retain Tab, Enter and Space keyboard support. */
export default function DemoChoices({
  labels, selected, onSelect, label, controls, className = "tabs", numbered = false,
}: DemoChoicesProps) {
  return (
    <div className={className} role="group" aria-label={label}>
      {labels.map((text, index) => (
        <button
          key={text}
          type="button"
          aria-pressed={selected === index}
          aria-controls={controls}
          onClick={() => onSelect(index)}
        >
          {numbered && <span aria-hidden="true">{`0${index + 1}`} </span>}
          {text}
        </button>
      ))}
    </div>
  );
}
