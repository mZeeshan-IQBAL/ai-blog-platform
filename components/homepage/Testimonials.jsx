const testimonials = [
  { name: "Sarah", role: "Researcher", text: "Great place to share ideas." },
  { name: "James", role: "Developer", text: "Learned so much from the community." },
  { name: "Priya", role: "Data Scientist", text: "Found collaborators for AI projects." },
];
export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-20 mt-16">
      <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-white p-6 rounded-xl shadow text-center">
            <p className="italic text-gray-600">“{t.text}”</p>
            <p className="mt-4 font-semibold">{t.name}</p>
            <p className="text-sm text-gray-500">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}