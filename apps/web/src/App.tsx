import { useEffect, useState } from 'react';
import { Home } from './components/Home';
import { ExperienceView } from './components/ExperienceView';
import { topics } from './content/registry';

interface Route {
  topic: string;
  experience: string;
}

function parseHash(): Route | null {
  const match = window.location.hash.match(/^#\/([\w-]+)\/([\w-]+)$/);
  return match ? { topic: match[1], experience: match[2] } : null;
}

/** Hash router: #/ routes home, #/<topic>/<experience> routes an experience. */
export default function App() {
  const [route, setRoute] = useState<Route | null>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (!route) return <Home />;

  const experience = topics[route.topic]?.experiences[route.experience];
  if (!experience) return <Home />;
  return <ExperienceView key={`${route.topic}/${route.experience}`} experience={experience} />;
}
