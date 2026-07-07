export default function StaticPage({ title, children }) {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-4xl md:text-5xl font-medium">{title}</h1>
        <div className="prose prose-stone mt-8 text-inkmuted leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
