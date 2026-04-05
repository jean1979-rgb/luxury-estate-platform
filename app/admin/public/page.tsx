export default function PublicPlatformDashboard() {
  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-light mb-6">Public Platform</h1>

      <div className="grid grid-cols-2 gap-6">
        <a href="/admin/public/home" className="border p-6 rounded-xl">Home</a>
        <a href="/admin/public/destinations" className="border p-6 rounded-xl">Destinations</a>
        <a href="/admin/public/partners" className="border p-6 rounded-xl">Partners</a>
        <a href="/admin/public/experiences" className="border p-6 rounded-xl">Experiences</a>
        <a href="/admin/public/navigation" className="border p-6 rounded-xl">Navigation</a>
        <a href="/admin/public/publishing" className="border p-6 rounded-xl">Publishing</a>
      </div>
    </div>
  );
}
