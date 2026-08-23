import { topics, type ExperienceDef, type TopicDef } from '../content/registry';

function experienceSteps(experience: ExperienceDef): number {
  return Object.values(experience.scenarios).reduce((sum, s) => sum + s.events.length, 0);
}

function ExperienceCard({ experience, index }: { experience: ExperienceDef; index: number }) {
  const scenarios = Object.keys(experience.scenarios).length;
  return (
    <a
      className="home-card"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      href={`#/${experience.topicId}/${experience.id}`}
    >
      <div className="home-card-tick" aria-hidden />
      <p className="rail-eyebrow">{experience.topicId}</p>
      <h2 className="home-card-title">{experience.overview.title}</h2>
      <p className="home-card-summary">{experience.overview.summary}</p>
      <p className="home-card-meta">
        {scenarios} scenario{scenarios === 1 ? '' : 's'} · {experienceSteps(experience)} events
        <span className="home-card-arrow" aria-hidden>
          →
        </span>
      </p>
    </a>
  );
}

function TopicSection({ topic, topicIndex }: { topic: TopicDef; topicIndex: number }) {
  const experiences = Object.values(topic.experiences);
  return (
    <section className="home-topic">
      <div className="home-topic-head">
        <h2 className="home-topic-name">{topic.name}</h2>
        {topic.description ? <p className="home-topic-desc">{topic.description}</p> : null}
      </div>
      <div className="home-grid">
        {experiences.map((experience, i) => (
          <ExperienceCard key={experience.id} experience={experience} index={topicIndex + i} />
        ))}
      </div>
    </section>
  );
}

/** Topic index: every experience discovered from content/. */
export function Home() {
  const topicList = Object.values(topics);
  const totals = topicList.reduce(
    (acc, topic) => {
      for (const experience of Object.values(topic.experiences)) {
        acc.scenarios += Object.keys(experience.scenarios).length;
        acc.events += experienceSteps(experience);
      }
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
            Interactive, step-by-step simulations of real systems — every event
            explained, every component inspectable, every failure replayable.
          </p>
          <p className="home-hero-meta">
            {topicList.length} topics · {totals.scenarios} scenarios ·{' '}
            {totals.events} events · deterministic
          </p>
        </section>
        {topicList.map((topic, i) => (
          <TopicSection key={topic.id} topic={topic} topicIndex={i} />
        ))}
        <footer className="home-footer">
          <p>
            One engine, many systems — every topic is validated YAML over the same
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
