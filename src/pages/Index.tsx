
import { KaraokeApp } from "@/components/KaraokeApp";
import { KaraokeProvider } from "@/context/KaraokeContext";

const Index = () => {
  return (
    <KaraokeProvider>
      <KaraokeApp />
    </KaraokeProvider>
  );
};

export default Index;
