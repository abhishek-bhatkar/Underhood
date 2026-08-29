import { topics, type ExperienceDef } from '../content/registry';
import { ThemeToggle } from './ThemeToggle';

function experienceSteps(experience: ExperienceDef): number {
  return Object.values(experience.scenarios).reduce((sum, s) => sum + s.events.length, 0);
}

export function catalogTotals(experiences: ExperienceDef[]) {
  return experiences.reduce(
    (acc, experience) => {
      acc.scenarios += Object.keys(experience.scenarios).length;
      acc.events += experienceSteps(experience);
      return acc;
    },
    { scenarios: 0, events: 0 },
  );
}

function ExperienceCard({ experience, index }: { experience: ExperienceDef; index: number }) {
  const topic = topics[experience.topicId];
  return (
    <a
      className="home-card"
      data-testid="systems-experience-card"
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

function TopicCard({ topic, index }: { topic: (typeof topics)[string]; index: number }) {
  const firstExperience = topic.experiences.traversal ?? Object.values(topic.experiences)[0];
  if (!firstExperience) return null;

  return (
    <a
      className="home-card"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      href={`#/${topic.id}/${firstExperience.id}`}
    >
      <div className="home-card-tick" aria-hidden />
      <h2 className="home-card-title">{topic.name}</h2>
      <p className="home-card-summary">{topic.description}</p>
      <p className="home-card-meta">
        <span className="home-card-topic">topic</span>
        <span className="home-card-arrow" aria-hidden>→</span>
      </p>
    </a>
  );
}

/** Topic index: every experience discovered from content/. */
export function Home() {
  const topicList = Object.values(topics);
  const systemsTopics = topicList.filter((topic) => topic.id !== 'arrays');
  const algorithmTopics = topicList.filter((topic) => topic.id === 'arrays');
  const allExperiences = topicList.flatMap((topic) => Object.values(topic.experiences));
  const experiences = systemsTopics.flatMap((topic) => Object.values(topic.experiences));
  const totals = catalogTotals(allExperiences);

  return (
    <div className="home">
      <a className="skip-link" href="#home-main">
        Skip to content
      </a>
      <header className="app-header">
        <span className="app-brand">Underhood</span>
        <span className="spacer" />
        <ThemeToggle />
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
          <section className="home-catalog-section" aria-labelledby="systems-heading">
            <p className="home-catalog-label" id="systems-heading">SYSTEMS</p>
            <div className="home-grid">
              {experiences.map((experience, i) => (
                <ExperienceCard key={`${experience.topicId}/${experience.id}`} experience={experience} index={i} />
              ))}
            </div>
          </section>
          <section className="home-catalog-section" aria-labelledby="algorithms-heading">
            <p className="home-catalog-label" id="algorithms-heading">
              ALGORITHMS &amp; DATA STRUCTURES
            </p>
            <div className="home-grid">
              {algorithmTopics.map((topic, i) => (
                <TopicCard key={topic.id} topic={topic} index={i} />
              ))}
            </div>
          </section>
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
