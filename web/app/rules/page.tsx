// Placeholder copy - replace each section body with the community's actual
// rules before launch.
const RULE_SECTIONS = [
  {
    title: "Roleplay quality",
    body: "Stay in character, engage with fear/injury RP, and avoid metagaming or powergaming.",
  },
  {
    title: "Conduct",
    body: "Treat other players and staff with respect. Harassment, hate speech, and cheating are not tolerated.",
  },
  {
    title: "Combat and RDM/VDM",
    body: "No random deathmatch or vehicle deathmatch - every action needs an in-character reason.",
  },
  {
    title: "Streaming and recording",
    body: "Follow the community's streamer tag rules if you plan to stream or record sessions.",
  },
];

export default function RulesPage() {
  return (
    <main>
      <h1>Server Rules</h1>
      <p>The short version. Full rules are pinned in Discord.</p>
      {RULE_SECTIONS.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </main>
  );
}
