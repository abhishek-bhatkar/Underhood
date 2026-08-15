import { topics, type ExperienceDef, type TopicDef } from '../content/registry';

function ExperienceCard({ experience }: { experience: ExperienceDef }) {
  return (
    <a className="home-card" href={`#/${experience.topicId}/${experience.id}`}>
      <p className="rail-eyebrow">{experience.topicId}</p>
      <h2 className="home-card-title">{experience.overview.title}</h2>
      <p className="home-card-summary">{experience.overview.summary}</p>
      <p className="home-card-meta">
        {Object.keys(experience.scenarios).length} scenario
        {Object.keys(experience.scenarios).length === 1 ? '' : 's'} · play, step, inspect
      </p>
    </a>
  );
}

function TopicSection({ topic }: { topic: TopicDef }) {
  return (
    <section className="home-topic">
      <div className="home-topic-head">
        <h2 className="home-topic-name">{topic.name}</h2>
        {topic.description ? <p className="home-topic-desc">{topic.description}</p> : null}
      </div>
      <div className="home-grid">
        {Object.values(topic.experiences).map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </div>
    </section>
  );
}

/** Topic index: every experience discovered from content/. */
export function Home() {
  return (
    <div className="home">
      <header className="app-header">
        <span className="app-brand">Underhood</span>
        <h1 className="app-title">Watch technical systems actually work</h1>
      </header>
      <main className="home-main">
        {Object.values(topics).map((topic) => (
          <TopicSection key={topic.id} topic={topic} />
        ))}
      </main>
    </div>
  );
}
