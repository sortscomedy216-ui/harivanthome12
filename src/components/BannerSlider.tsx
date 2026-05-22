import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Banner {
  id: string;
  image_url: string;
  link_url: string | null;
  title: string | null;
}

const BannerSlider = () => {
  const { data: banners = [] } = useQuery({
    queryKey: ["app-banners-active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_banners")
        .select("id, image_url, link_url, title")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return (data || []) as Banner[];
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (banners.length === 0) return null;

  const handleClick = (b: Banner) => {
    if (b.link_url) window.open(b.link_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mb-4">
      <div className="overflow-hidden rounded-2xl shadow-card" ref={emblaRef}>
        <div className="flex">
          {banners.map((b) => (
            <div
              key={b.id}
              className="flex-[0_0_100%] min-w-0 cursor-pointer"
              onClick={() => handleClick(b)}
            >
              <div className="aspect-[16/8] bg-muted overflow-hidden">
                <img
                  src={b.image_url}
                  alt={b.title || "Banner"}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                selectedIndex === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
