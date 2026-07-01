// Auditable strip: the concentric-ring radar + the "your data stays auditable" copy.
export function Auditable() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="audit">
          <div className="radar">
            <span />
            <span />
            <span />
          </div>
          <div>
            <h3>Your data stays auditable</h3>
            <p>
              Every scan and analysis stores the exact config, the raw data
              collected, and the prompt + model used to generate your content.
              It&apos;s your data — nothing is hidden.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
