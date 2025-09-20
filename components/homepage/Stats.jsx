export default function Stats() {
  const stats = [
    { label: "Active Members", value: "25k+" },
    { label: "Posts Published", value: "120k+" },
    { label: "Monthly Visitors", value: "500k+" },
    { label: "Countries Reached", value: "80+" },
  ];
  return (
    <section className="bg-white py-16 mt-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <h3 className="text-3xl font-bold text-blue-600">{s.value}</h3>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}