import { topics, type ExperienceDef } from '../content/registry';

function experienceSteps(experience: ExperienceDef): number {
  return Object.values(experience.scenarios).reduce((sum, s) => sum + s.events.length, 0);
}

function ExperienceCard({ experience, index }: { experience: ExperienceDef; index: number }) {
  const topic = topics[experience.topicId];
  return (
    <a
      className="home-card"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      href={`#/${experience.topicId}/${experience.id}`}
    >
      <div className="home-card-tick" aria-hidden />
      <h2 className="home-card-title">{experience.overview.title}</h2>
      <p className="home-card-summary">{experience.overview.summary}</p>
      <p className="home-card-meta">
        <span className="home-card-topic">{topic.name.toLowerCase()}</span>
        <span className="home-card-arrow" aria-hidden>
          →
        </span>
      </p>
    </a>
  );
}

/** Topic index: every experience discovered from content/. */
export function Home() {
  const topicList = Object.values(topics);
  const experiences = topicList.flatMap((topic) => Object.values(topic.experiences));
  const totals = experiences.reduce(
    (acc, experience) => {
      acc.scenarios += Object.keys(experience.scenarios).length;
      acc.events += experienceSteps(experience);
      return acc;
    },
    { scenarios: 0, events: 0 },
  );

  return (
    <div className="home">
      <a className="skip-link" href="#home-main">
        Skip to content
      </a>
      <header className="app-header">
        <span className="app-brand">Underhood</span>
      </header>
      <main className="home-main" id="home-main">
        <section className="home-hero">
          <h1 className="home-hero-title">
            Don't just read how it works.
            <br />
            <span className="home-hero-watch">Watch it work.</span>
          </h1>
          <p className="home-hero-sub">
            Interactive, step-by-step simulations of real systems. Every event
            explained, every component inspectable, every failure replayable.
          </p>
          <p className="home-hero-meta">
            {topicList.length} topics, {totals.scenarios} scenarios, {totals.events} events, all
            deterministic
          </p>
        </section>
        <section className="home-catalog" aria-label="All experiences">
          <div className="home-grid">
            {experiences.map((experience, i) => (
              <ExperienceCard
                key={`${experience.topicId}/${experience.id}`}
                experience={experience}
                index={i}
              />
            ))}
          </div>
        </section>
        <footer className="home-footer">
          <p>
            One engine, many systems: every topic is validated YAML over the same
            simulation core.{' '}
            <a
              href="https://github.com/abhishek-bhatkar/Underhood"
              rel="noreferrer"
              target="_blank"
            >
              Source on GitHub
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
