export default function SkyBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* Sky Base Gradient matching the product photo tone */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8CBDF6] via-[#A0CCFD] to-[#F6FAFE]" />

      {/* Atmospheric Soft Clouds */}
      <div className="absolute -top-12 left-10 w-[500px] h-[300px] bg-white/40 rounded-full blur-3xl opacity-80" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[400px] bg-white/50 rounded-full blur-3xl opacity-75" />
      <div className="absolute bottom-12 left-1/3 w-[550px] h-[350px] bg-white/60 rounded-full blur-3xl opacity-90" />

      {/* Soft vector cloud accents */}
      <svg
        className="absolute top-8 left-12 w-72 h-36 text-white/35 blur-[1px]"
        viewBox="0 0 200 100"
        fill="currentColor"
      >
        <path d="M 30,70 Q 20,40 50,40 Q 65,20 90,30 Q 115,15 140,35 Q 165,30 170,55 Q 185,70 160,75 Z" />
      </svg>
      <svg
        className="absolute top-20 right-16 w-96 h-48 text-white/30 blur-[2px]"
        viewBox="0 0 200 100"
        fill="currentColor"
      >
        <path d="M 20,60 Q 10,35 40,35 Q 55,15 85,25 Q 110,10 135,30 Q 160,25 175,50 Q 190,65 160,70 Z" />
      </svg>
    </div>
  );
}
