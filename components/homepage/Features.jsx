export default function Features() {
  const items = [
    { title: "AI-Powered", desc: "Enhance content discovery with AI", color: "bg-blue-100 text-blue-600" },
    { title: "Community Driven", desc: "Knowledge sharing for developers", color: "bg-green-100 text-green-600" },
    { title: "Innovation Hub", desc: "Contribute and learn new ideas", color: "bg-purple-100 text-purple-600" },
  ];
  return (
    <section className="grid md:grid-cols-3 gap-8 mt-12">
      {items.map((i) => (
        <div key={i.title} className="bg-white p-8 rounded-xl shadow">
          <div className={`${i.color} w-12 h-12 rounded-full mb-4`} />
          <h3 className="text-xl font-bold">{i.title}</h3>
          <p className="text-gray-600">{i.desc}</p>
        </div>
      ))}
    </section>
  );
}