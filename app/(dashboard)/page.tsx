"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Cog, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { askQuestion, getPublicCharacters } from './actions';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { useRouter } from "next/navigation";
import Hero from '@/components/Hero';
import DraggableImage from '@/components/DraggableImage';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const tokens = {
  maxW: "max-w-[1200px]",
  gutter: "px-4 sm:px-6 lg:px-8",
  grid: "grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8",
};

type Character = {
  name: string;
  url: string;
};

// ================== MODAL COMPONENTS ==================

function ModelLibraryModal({ isOpen, onClose, characters, onSelect, selectedCharacter }: {
    isOpen: boolean;
    onClose: () => void;
    characters: Character[];
    onSelect: (character: Character) => void;
    selectedCharacter: Character | null;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative bg-white  p-6 max-w-4xl w-full text-black">
                <h3 className="text-xl font-bold">Model Library</h3>
                <p className="text-neutral-600 text-sm mt-1">Select a model to preview.</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mt-6 max-h-[70vh] overflow-y-auto">
                    {characters.map((char) => (
                        <div 
                            key={char.name} 
                            className={`relative aspect-square overflow-hidden cursor-pointer group transition-all duration-200 ${
                                selectedCharacter?.name === char.name 
                                    ? 'border-2 border-blue-500' 
                                    : 'border-2 border-transparent hover:border-blue-300'
                            }`} 
                            onClick={() => onSelect(char)}
                        >
                            <Image src={char.url} alt={char.name} fill className="object-cover"/>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 p-2  bg-neutral-100 hover:bg-neutral-200 transition">
                    <X className="w-5 h-5 text-black"/>
                </button>
            </div>
        </div>
    );
}

const imageGallery: Record<string, string[]> = {
  "/images/Woman.png": ["/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg", "/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png", "/images/woman v2.png"],
  "/images/freepik__a-full-shot-of-a-smiling-black-man-around-24-years__34269.jpeg": ["/images/romain.gn_A_hand_holding_a_phone_--ar_5877_--raw_--profile_h5_5161a1f7-02d7-43a3-afd2-b77925b50fab_0.png"],
};

const ImageModal = ({ isOpen, onClose, currentImage, relatedImages }: {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  relatedImages: string[];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = [currentImage, ...relatedImages];
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2  bg-black/50 text-white hover:bg-black/70 transition"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Navigation buttons */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2  bg-black/50 text-white hover:bg-black/70 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2  bg-black/50 text-white hover:bg-black/70 transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Main image */}
        <div className="relative w-full h-[80vh]  overflow-hidden">
          <Image
            src={allImages[currentIndex]}
            alt="Gallery image"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        
        {/* Thumbnail navigation */}
        <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
          {allImages.map((image, index) => (
            <button
              key={image}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16  overflow-hidden border-2 transition ${
                index === currentIndex ? 'border-[#1E90FF]' : 'border-transparent'
              }`}
            >
              <Image
                src={image}
                alt="Thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
        
        {/* Image counter */}
        <div className="text-center text-white mt-2 text-sm">
          {currentIndex + 1} of {allImages.length}
        </div>
      </div>
    </div>
  );
};

// ================== PAGE SECTIONS ==================
function ClothingSelectionSection() {
  const [selectedItem, setSelectedItem] = useState<number | null>(3); // Default to item 3 (strapless long dress)
  
  const clothingItems = [
      { id: 1, name: "White Jacket", image: "https://lejnqimkweslrzsojtsp.supabase.co/storage/v1/object/public/public-assets/landing-vi/freepik__white-background-blue-puffer-jacet__19944.png", type: "top" },
      { id: 2, name: "tech cargo vest", image: "https://lejnqimkweslrzsojtsp.supabase.co/storage/v1/object/public/public-assets/landing-vi/freepik__the-style-is-candid-image-photography-with-natural__77571.png", type: "vest" },
      { id: 3, name: "strapless long dress", image: "https://lejnqimkweslrzsojtsp.supabase.co/storage/v1/object/public/public-assets/landing-vi/freepik__white-background-fpuffer-jacet__19943.png", type: "dress", featured: true },
      { id: 4, name: "strapless long dress", image: "https://lejnqimkweslrzsojtsp.supabase.co/storage/v1/object/public/public-assets/landing-vi/freepik__white-background-baggy-jeans__19937.png", type: "dress", confirmed: true },
      { id: 5, name: "flared pants", image: "https://lejnqimkweslrzsojtsp.supabase.co/storage/v1/object/public/public-assets/landing-vi/freepik__white-background-dark-sneakers__66186.png", type: "pants" },
      { id: 6, name: "asymmetrical top", image: "https://lejnqimkweslrzsojtsp.supabase.co/storage/v1/object/public/public-assets/landing-vi/freepik__the-style-is-candid-image-photography-with-natural__77569.png", type: "top" }
  ];

  const handleItemSelect = (itemId: number) => {
      setSelectedItem(itemId);
  };

  return (
      <section className="py-8" style={{ backgroundColor: '#F9F9F9' }}>
          <div className="max-w-10xl mx-auto px-4 sm:px-3 lg:px-1">
              {/* Title */}
              <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-8" style={{ fontFamily: 'Inter, Helvetica, sans-serif' }}>
                  AI outfit generated with Genchy AI technology
              </h2>

              {/* Main Content - Horizontal Layout */}
              <div className="flex flex-col lg:flex-row items-stretch justify-between">
                  {/* Panel 1: Woman in Car (Far Left) */}
                  <div className="w-full lg:w-[40%]">
                      <div className="relative aspect-[2/3]  overflow-hidden">
                          <Image 
                              src="/images/Woman.png" 
                              alt="Woman in car" 
                              fill 
                              className="object-cover"
                          />
                      </div>
                  </div>

                  {/* Panel 2: Woman in Black Outfit */}
                  <div className="w-full lg:w-[40%]">
                      <div className="relative aspect-[2/3]  overflow-hidden">
                          <Image 
                              src="/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg" 
                              alt="Woman in black outfit" 
                              fill 
                              className="object-cover"
                          />
                      </div>
                  </div>

                  {/* Panel 3: Interactive Generator (Center) */}
                  <div className="w-full lg:w-[35%]">
                      <div className="p-4  h-full" style={{ backgroundColor: '#EEEEEE' }}>
                          <div className="grid grid-cols-2 gap-4">
                              {clothingItems.map((item) => (
                                  <div
                                      key={item.id}
                                      onClick={() => handleItemSelect(item.id)}
                                      className={`relative  cursor-pointer bg-white p-1 flex flex-col transition-all duration-200 ${
                                          selectedItem === item.id ? 'border-2' : 'border-2 border-transparent'
                                      }`}
                                      style={{
                                          borderColor: selectedItem === item.id ? '#D2FF00' : 'transparent'
                                      }}
                                  >
                                      {/* Image container with padding */}
                                      <div className="relative w-full aspect-square">
                                          <Image
                                              src={item.image}
                                              alt={item.name}
                                              fill
                                              className="object-contain "
                                          />
                                      </div>

                                      {/* Text Label Below Image */}
                                      <p className="text-xs text-center text-gray-500 lowercase " style={{ fontFamily: 'Inter, Helvetica, sans-serif' }}>
                                          {item.name}
                                      </p>

                                      {/* Confirmed State - Checkmark Icon */}
                                      {item.confirmed && (
                                          <div className="absolute top-1 right-1 w-4 h-4 bg-gray-600 text-white  flex items-center justify-center">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Panel 4: Man in Black Shirt */}
                  <div className="w-full lg:w-[40%]">
                      <div className="relative aspect-[2/3]  overflow-hidden">
                          <Image 
                              src="/images/56black.jpg" 
                              alt="Man in black shirt" 
                              fill 
                              className="object-cover"
                              style={{ objectPosition: 'center 40%' }}
                          />
                      </div>
                  </div>

                  {/* Panel 5: Man on Couch (Far Right) */}
                  <div className="w-full lg:w-[40%]">
                      <div className="relative aspect-[2/3]  overflow-hidden">
                          <Image 
                              src="/images/4.jpg" 
                              alt="Man on couch" 
                              fill 
                              className="object-cover"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </section>
  );
}

function ChooseModelSection() {
    const { data: user } = useSWR<User>('/api/user', fetcher);
    const router = useRouter();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCharacters() {
            try {
                setIsLoading(true);
                const result = await getPublicCharacters();
                console.log('Fetched characters:', result);
                if (result.data) {
                    setCharacters(result.data);
                    if (result.data.length > 0) {
                        setSelectedCharacter(result.data[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching characters:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCharacters();
    }, []);

    const handleBrowseLibrary = () => {
        if (!user) {
            router.push('/sign-in');
        } else {
            setIsModalOpen(true);
        }
    };
    
    const handleSelectCharacter = (character: Character) => {
        console.log('Selecting character:', character);
        setSelectedCharacter(character);
        setIsModalOpen(false);
    };

    const previewCharacters = characters.slice(0, 18);

    return (
        <section className={`${tokens.gutter} pt-3 pb-8 bg-white`}>
            <div className={`mx-auto ${tokens.maxW}`}>
                <div className="relative rounded-[24px] bg-white p-3 sm:p-3 lg:p-8">
                    <div>
                       
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                              <div className="col-span-1 lg:col-span-8">
                              <h2 className="text-center text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-black mb-2">
                              CHOOSE YOUR MODEL
                          </h2>
                          <p className="text-center text-[12px] sm:text-[14px] text-neutral-600 mb-6 sm:mb-8">
                              Browse our diverse library or generate a custom one.
                          </p>
                                 <div className="relative flex overflow-hidden mb-6">
                                     {/* Vertical text outside the box - hidden on mobile */}
                                     <div className="hidden sm:flex items-center justify-center" style={{ width: '30px' }}>
                                         <span 
                                              className="text-[12px] lg:text-[14px] font-medium text-black tracking-tight whitespace-nowrap"
                                             style={{ 
                                                 transform: 'rotate(-90deg)',
                                                 transformOrigin: 'center',
                                                 lineHeight: '1'
                                             }}
                                         >
                                             Explore 100+ of avatar options
                                         </span>
                                     </div>
                                     {/* Model grid container */}
                                     <div className="flex-1 p-2 sm:p-0 border border-neutral-200">
                                      {isLoading ? (
                                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-2">
                                              {Array.from({ length: 18 }).map((_, i) => (
                                                  <div key={i} className="aspect-square bg-neutral-200 animate-pulse"></div>
                                              ))}
                                          </div>
                                      ) : (
                                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-2">
                                              {previewCharacters.map((char) => (
                                              <div 
                                                  key={char.name} 
                                                  className={`relative aspect-square overflow-hidden cursor-pointer group transition-all duration-200 ${
                                                      selectedCharacter?.name === char.name 
                                                          ? 'border-2 border-blue-500' 
                                                          : 'border-2 border-transparent hover:border-blue-300'
                                                  }`} 
                                                  onClick={() => handleSelectCharacter(char)}
                                              >
                                                  <Image 
                                                      src={char.url} 
                                                      alt={char.name} 
                                                      fill 
                                                      className="object-cover"
                                                      onError={(e) => {
                                                          console.error('Image failed to load:', char.url);
                                                          e.currentTarget.style.display = 'none';
                                                      }}
                                                      onLoad={() => console.log('Image loaded successfully:', char.url)}
                                                  />
                                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                              </div>
                                          ))}
                                          </div>
                                      )}
                                  </div>
                                 </div>
                                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                       <button onClick={handleBrowseLibrary} className="flex-1 border border-black rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-black font-semibold hover:bg-neutral-100 transition">
                                           BROWSE LIBRARY
                                       </button>
                                       <button onClick={() => router.push('/generate')} className="flex-1 bg-neutral-900 text-white rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold hover:bg-neutral-700 transition">
                                           GENERATE CUSTOM MODEL
                                       </button>
                                   </div>
                               </div>
                               <div className="col-span-1 lg:col-span-4 mt-6 lg:mt-0">
                                 <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[600px] overflow-hidden bg-neutral-100 border border-neutral-200">
                                    {selectedCharacter ? (
                                        <Image 
                                            src={selectedCharacter.url} 
                                            alt={selectedCharacter.name} 
                                            unoptimized 
                                            fill 
                                            className="object-contain"
                                            onError={(e) => {
                                                console.error('Preview image failed to load:', selectedCharacter.url);
                                                e.currentTarget.style.display = 'none';
                                            }}
                                            onLoad={() => console.log('Preview image loaded successfully:', selectedCharacter.url)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">Select a model</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModelLibraryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                characters={characters}
                onSelect={handleSelectCharacter}
                selectedCharacter={selectedCharacter}
            />
        </section>
    );
}

// ================== MAIN PAGE COMPONENT ==================

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [relatedImages, setRelatedImages] = useState<string[]>([]);

  const openModal = (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setRelatedImages(imageGallery[imageSrc as keyof typeof imageGallery] || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentImage("");
    setRelatedImages([]);
  };

  const handleGetAccess = () => {
    // Redirect to pricing page
    window.location.href = "/pricing";
  };

  const handleEnhanceNow = () => {
    // You can customize this functionality - for now it will show an alert
    alert("Enhance Now clicked! This could redirect to the enhancement tool or AI editor.");
    // Example: window.location.href = "/enhance";
    // Example: window.open("https://your-enhancement-tool.com", "_blank");
  };

  const handleViewPricing = () => {
    // Redirect to pricing page
    window.location.href = "/pricing";
  };

  const [state, formAction] = useActionState(askQuestion, { success: '', error: '' });

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black text-white antialiased overflow-hidden">
      {/* neon background accents */}
      <div className="pointer-events-none absolute -z-10 inset-0">
        <div className="absolute left-[-120px] top-24 h-[260px] w-[260px]  bg-[#1E90FF] blur-[120px] opacity-25"></div>
        <div className="absolute right-[-100px] top-[520px] h-[300px] w-[300px]  bg-[#1E90FF] blur-[140px] opacity-20"></div>
        <div className="absolute left-1/3 bottom-[-120px] h-[280px] w-[280px]  bg-[#1E90FF] blur-[140px] opacity-15"></div>
      </div>
   

      {/* ================== HERO ================== */}
      <Hero largeOnHome={true} />
      {/* ================== FULL WIDTH COMPANY LOGOS BANNER ================== */}
      <section className="w-full bg-black pt-2 pb-4">
        <div className="relative w-full h-24">
          <div className="flex items-center justify-center h-full">
            <Image 
              src="/images/logos.png" 
              alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
              width={1200}
              height={96}
              className="object-contain filter contrast-200 brightness-150 saturate-110 invert-0"
              unoptimized
            />
          </div>
        </div>
      </section>

       {/* ================== SECTION 2 — Create/All types ================== */}
      <section className="pt-4 pb-12 sm:pb-16 lg:pb-20 bg-black text-white px-4 sm:px-6 lg:px-8" id="about">
        <div className="mx-auto max-w-[1200px] px-0">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-12">
             {/* Left column: title + media with benefits on the right */}
             <div className="col-span-1 lg:col-span-7 w-full">
                <h2 className="font-[var(--font-display)] text-[20px] sm:text-[32px] md:text-[36px] lg:text-[40px] font-extrabold tracking-tight leading-tight sm:leading-none max-w-full lg:max-w-2xl text-center lg:text-left">
                  Create, amplify and scale<br className="hidden sm:block"/>
                  <span className="sm:hidden"> </span>professional product content.
                </h2>
               <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 md:gap-6 items-start w-full">
                 {/* media placeholder (video or image) */}
                 <div className="col-span-1 md:col-span-7 flex justify-center md:justify-start w-full">
                   <div className="relative inline-block mt-4 sm:mt-6 lg:mt-8 group w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-none">
                     <Image 
                       src="/images/ginchy-vi.gif" 
                       alt="Fashion model" 
                       width={520}
                       height={385}
                       className="w-full h-auto object-cover object-center"
                       style={{
                         objectFit: 'cover', 
                         objectPosition: 'center',
                         borderRadius: '0px'
                       }}
                       unoptimized 
                     />
                     
                     {/* Overlay Image on top of video */}
                     <div className="absolute bottom-1 left-0 z-20 sm:bottom-2" style={{ transform: 'translate(-5px, 10px) scale(0.5) rotate(0deg) translate(-10px, 20px) scale(0.7) rotate(0deg)' }}>
                       <Image 
                         src="/images/landingvidside.jpg" 
                         alt="Fashion overlay" 
                         width={300}
                         height={220}
                         className="w-[80px] sm:w-[100px] md:w-[120px] lg:w-[160px] xl:w-[200px] h-auto object-cover shadow-lg"
                         style={{
                           objectFit: 'cover', 
                           objectPosition: 'center',
                           borderRadius: '8px'
                         }}
                         unoptimized 
                       />
                     </div>
                     
                     {/* Center Play Button */}
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <button 
                         className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                         title="Play"
                       >
                         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                         </svg>
                       </button>
                     </div>
                   </div>
                 </div>
                 {/* benefits text list */}
                 <div className="col-span-1 md:col-span-5 text-sm sm:text-[15px] leading-relaxed flex items-start md:items-end justify-center md:justify-start w-full">
                  <div className="space-y-4 sm:space-y-5 mt-4 sm:mt-6 md:mt-8 lg:mt-12 text-center md:text-left max-w-full sm:max-w-md md:max-w-none w-full px-2 sm:px-4 md:px-0">
                     <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 sm:p-3 md:p-0 md:bg-transparent">
                       <h3 className="font-bold text-white mb-2 text-base sm:text-lg md:text-base tracking-wide">Production efficiency</h3>
                       <p className="text-neutral-200 leading-relaxed text-sm sm:text-base md:text-sm font-light">Speed up the design-to-production process by eliminating the need for physical samples to respond quickly to market demands.</p>
                     </div>
                     <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 sm:p-3 md:p-0 md:bg-transparent">
                       <h3 className="font-bold text-white mb-2 text-base sm:text-lg md:text-base tracking-wide">Cost reduction</h3>
                       <p className="text-neutral-200 leading-relaxed text-sm sm:text-base md:text-sm font-light">Eliminates the need for traditional photoshoots, reducing costs and resource consumption while simplifying content creation.</p>
                     </div>
                     <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 sm:p-3 md:p-0 md:bg-transparent">
                       <h3 className="font-bold text-white mb-2 text-base sm:text-lg md:text-base tracking-wide">Sustainability</h3>
                       <p className="text-neutral-200 leading-relaxed text-sm sm:text-base md:text-sm font-light">Reduces the environmental impact by minimizing the need for physical photoshoots and associated logistics.</p>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Right column: heading + three cards layout */}
            <div className="col-span-12 lg:col-span-5 mt-6 lg:mt-0 w-full">
               <h2 className="font-[var(--font-display)] text-[18px] sm:text-[28px] md:text-[36px] lg:text-[44px] xl:text-[50px] font-extrabold tracking-tight mb-3 uppercase leading-tight text-center lg:text-left">
                 ALL TYPES OF
                 <br />
                 <span className="italic text-[#1E90FF] font-['IBM_Plex_Serif','Georgia',serif] font-medium lowercase">[ fashion items ]</span>
               </h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
                  {/* Top row: shoes with small label on the right */}
                  <div className="relative flex justify-center lg:justify-start max-w-full overflow-hidden w-full">
                    <div className="relative w-[100px] sm:w-[140px] md:w-[160px] lg:w-[180px] h-[100px] sm:h-[140px] md:h-[160px] lg:h-[180px] flex-shrink-0 overflow-hidden border border-neutral-700 bg-neutral-100">
                      <Image src="/images/1.jpg" alt="Shoes" fill className="object-cover object-center" style={{objectPosition: 'center 20%'}} unoptimized />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[110px] sm:left-[150px] md:left-[170px] lg:left-[190px] border border-neutral-600 bg-black/60 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[7px] sm:text-[9px] md:text-[10px] lg:text-[11px] whitespace-nowrap">Shoes</div>
                  </div>
               {/* second row: jewelry small square with label below */}
               <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start lg:justify-start gap-3 sm:gap-4 lg:gap-6 max-w-full overflow-hidden w-full">
                 <div className="relative flex justify-center sm:justify-start ml-0 sm:ml-0 lg:ml-6">
                   <div className="relative w-[80px] sm:w-[120px] md:w-[140px] lg:w-[160px] h-[70px] sm:h-[110px] md:h-[130px] lg:h-[150px] flex-shrink-0 overflow-hidden border border-neutral-700 bg-neutral-100">
                     <Image src="/images/2.jpg" alt="Accessories" fill className="object-cover" unoptimized />
                   </div>
                   <div className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-8 left-[40px] sm:left-[60px] md:left-[70px] lg:left-[80px] -translate-x-1/2 w-[60px] sm:w-[80px] md:w-[90px] lg:w-[100px] text-center border border-neutral-600 bg-black/60 px-1 sm:px-2 lg:px-3 py-1 text-[6px] sm:text-[8px] md:text-[9px] lg:text-[10px] whitespace-nowrap">Accessories</div>
                 </div>
                 {/* sunglasses big square with label on right */}
                 <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-4 sm:mt-0 max-w-full w-full">
                   <div className="relative w-[120px] sm:w-[160px] md:w-[180px] lg:w-[200px] h-[120px] sm:h-[160px] md:h-[180px] lg:h-[200px] flex-shrink-0 overflow-hidden border border-neutral-700 bg-neutral-100">
                     <Image src="/images/3.jpg" alt="Sunglasses" fill className="object-cover" unoptimized />
                   </div>
                   <div className="border border-neutral-600 bg-black/60 px-1 sm:px-2 lg:px-3 py-1 text-[6px] sm:text-[8px] md:text-[9px] lg:text-[10px] whitespace-nowrap">Sunglasses</div>
                 </div>
               </div>
              </div>
            </div>
          </div>
        </div>
      </section>
 {/* ================== CLOTHING SELECTION SECTION ================== */}
 <ClothingSelectionSection />
      {/* ================== SECTION 3 — AI outfit / Choose your model ================== */}
      <ChooseModelSection />

      {/* ================== SECTION 4 — Customize your pictures ================== */}
      <section className={`${tokens.gutter} pt-24 pb-8 bg-black text-white relative`} id="examples">
        {/* Get Access Gradient - positioned at far left without margin */}
        <div className="absolute left-0 top-0 h-full w-64 pointer-events-none z-0">
          <Image 
            src="/images/getaacessgrad.svg"
            alt="Get access gradient"
            fill
            className="object-contain object-left"
            unoptimized
          />
        </div>
        <div className={`mx-auto ${tokens.maxW} relative z-10`}>
          {/* Professional title styling */}
          <h2 className="text-left ml-12 font-[var(--font-display)] text-[#1E90FF] text-[28px] sm:text-[36px] lg:text-[42px] font-extrabold tracking-tight leading-[1.1] mb-10">
            Customize your pictures the way you want
            <span className="text-[#1E90FF] ml-2">✦</span>
          </h2>

          {/* container with left padding so the vertical pill is always visible */}
          <div className="relative pl-8 sm:pl-12 overflow-visible">
            {/* vertical pill - professional styling */}
            <div className="absolute -left-30 top-0 h-full z-10">
              <div 
                className="relative h-5/6 w-14 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={handleGetAccess}
              >
                {/* blue gradient fill */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600" />
                {/* vertical label - text from bottom to top */}
                <div className="absolute inset-0 flex items-center justify-center pb-2">
                  <span className="rotate-[-90deg] font-black text-white text-base tracking-wider whitespace-nowrap">
                    Get Access Now →
                  </span>
                </div>
              </div>
            </div>

            {/* four tall images row - professional images as specified */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
               {/* Sample placeholder - Desert scene */}
               <div className="relative h-[500px] overflow-hidden bg-neutral-800">
                 <Image src="/images/1left-desert-lady.jpg" alt="Sample placeholder" unoptimized fill className="object-cover" />
               </div>
              
               {/* Customized 2 - New York scene */}
               <div className="relative h-[500px] overflow-hidden bg-neutral-800">
                 <Image src="/images/city-2left.jpg" alt="Customized 2" unoptimized fill className="object-cover" />
               </div>
              
               {/* Customized 3 - White studio scene */}
               <div className="relative h-[500px] overflow-hidden bg-neutral-800">
                 <Image src="/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png" alt="Customized 3" unoptimized fill className="object-cover" />
               </div>
              
               {/* Customized 4 - Snow environment scene */}
               <div className="relative h-[500px] overflow-hidden bg-neutral-800">
                 <Image src="/images/snow-lady.jpg" alt="Customized 4" unoptimized fill className="object-cover" />
               </div>
            </div>

            {/* Bottom text - professional styling */}
            <p className="mt-6 text-center font-[var(--font-display)] text-[#1E90FF] text-[24px] sm:text-[32px] lg:text-[36px] font-extrabold tracking-tight leading-[1.1]">
              Consistency Models + Unlimited Environments + Much more
            </p>
          </div>
        </div>
      </section>

      {/* ================== GENAI PLATFORM SECTION ================== */}
      <section className={`${tokens.gutter} pt-0 pb-20 bg-black text-white`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Company Logos Banner */}
          <div className="text-center mb-0">
            <p className="text-white text-xl mb-0">
              All the top GenAI models—plus Magnific, recently acquired
              <br />
              by Freepik
            </p>
          </div>
        </div>
        
        {/* Full Width Company Logos Banner */}
        <div className="w-full bg-black py-8">
          <div className="flex items-center justify-center h-28 px-8">
            <Image 
              src="/images/logos.png" 
              alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
              width={1200}
              height={96}
              className="object-contain h-full filter contrast-200 brightness-150 saturate-110 invert-0"
              unoptimized
            />
          </div>
        </div>
        
        <div className={`mx-auto ${tokens.maxW}`}>

          {/* Main Application Interface */}
          <div className="relative w-full max-w-5xl mx-auto mb-12">
            <div className="relative w-full h-[400px]  overflow-hidden bg-neutral-900 border-2 border-neutral-700 shadow-2xl">
              <Image 
                src="/images/app-interface.png" 
                alt="Main application interface with AI editing tools" 
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 rounded-xl bg-neutral-700 text-white text-sm font-medium hover:bg-neutral-600 transition">
              Image editing
            </button>
            <button className="px-6 py-3 rounded-xl border border-neutral-600 text-white text-sm font-medium hover:bg-neutral-800 transition">
              Image generation
            </button>
            <button className="px-6 py-3 rounded-xl border border-neutral-600 text-white text-sm font-medium hover:bg-neutral-800 transition">
              Video generation
            </button>
            <button className="px-6 py-3 rounded-xl border border-neutral-600 text-white text-sm font-medium hover:bg-neutral-800 transition">
              Video editing
            </button>
            <button className="px-6 py-3 rounded-xl border border-neutral-600 text-white text-sm font-medium hover:bg-neutral-800 transition">
              Audio generation
            </button>
          </div>
        </div>
      </section>

      {/* ================== SECTION 5 — Personalize your outfit ================== */}
      <section className={`${tokens.gutter} py-8 bg-black text-white relative`}>
        {/* Background gradient image positioned like in screenshot */}
        <div className="hidden sm:block absolute top-5 -right-4 w-1/2 h-full opacity-80 pointer-events-none">
          <Image 
            src="/images/sidegradient1.png" 
            alt="Side gradient background" 
            fill
            className="object-cover object-right"
            unoptimized
          />
        </div>
        <div className={`mx-auto ${tokens.maxW} relative z-10`}> 
          <h2 className="text-left font-[var(--font-display)] text-[#1E90FF] text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-tight leading-[1.1] mb-16">
            Personalize your outfit<span className="ml-2 text-[#1E90FF]">✦</span>
          </h2>

          {/* two main sections - SOCIAL MEDIA and PRODUCT PAGES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-30 relative">
            
            {/* FIXED CIRCULAR IMAGES */}
            <DraggableImage 
              src="/images/glasses.png"
              alt="Glasses"
              initialX={560}
              initialY={20}
              width={120}
              height={120}
              className="hidden lg:block"
              fixed={true}
            />
            <DraggableImage 
              src="/images/Garment.png"
              alt="Garment"
              initialX={550}
              initialY={280}
              width={172}
              height={172}
              className="hidden lg:block"
              fixed={true}
            />
            {/* LEFT SECTION - SOCIAL MEDIA */}
            <div className="bg-black relative">
              {/* Social left gradient background */}
             
               {/* Profile card */}
               <div className="relative flex items-center space-x-3 bg-white  p-3 w-fit pr-81 z-10">
                 <div className="w-10 h-10 rounded-full overflow-hidden">
                   <Image 
                     src="/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png" 
                     alt="Profile picture" 
                     width={40}
                     height={40}
                     className="w-full h-full object-cover"
                     unoptimized
                   />
                 </div>
                 <div>
                   <p className="text-black font-semibold text-sm">Lil Miquela</p>
                    <p className="text-xs whitespace-nowrap flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                        <defs>
                          <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#833AB4" />
                            <stop offset="50%" stopColor="#E1306C" />
                            <stop offset="100%" stopColor="#F77737" />
                          </linearGradient>
                        </defs>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-[#0095F6]">lilmiquela</span>
                      <span className="text-gray-400">• 2.7M followers</span>
                    </p>
                   
                 </div>
                 
               </div>

              {/* Main images - increased size to match right side */}
              <div className="relative grid grid-cols-2 gap-0 z-10">
                <div className="relative aspect-[4/5]  overflow-hidden bg-neutral-800">
                  <Image src="/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png" alt="Woman in floral top" unoptimized fill className="object-cover object-top" style={{objectPosition: 'center top'}} />
                </div>
                <div className="relative aspect-[4/5]  overflow-hidden bg-neutral-800">
                  <Image src="/images/woman v2.png" alt="Woman in grey hoodie" unoptimized fill className="object-cover object-top" style={{objectPosition: 'center top'}} />
                </div>
              </div>

              {/* Section label */}
              <p className="text-center bg-black text-gray-500 font-bold text-sm tracking-wider italic font-['Times_New_Roman','Georgia',serif] transform translate-x-0.5 mt-4">
                [SOCIAL MEDIA]
              </p>

              {/* Description text */}
              <p className="text-gray-300 bg-black text-[15px] leading-none font-bold font-sans mt-16">
                Swap garments and create on-brand looks that elevate your<br />
                Instagram, website, and campaigns — driving more engagement<br />
                and a consistent visual identity.
              </p>

              {/* Social left gradient below content */}
              <div 
                className="relative mt-8 h-32 w-full"
                style={{
                  transform: 'translateX(-100px) translateY(-190px) scale(5) rotate(0deg)',
                  transformOrigin: 'left center'
                }}
              >
                <Image 
                  src="/images/socialleftgrad.svg"
                  alt="Social left gradient"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
            </div>

            {/* RIGHT SECTION - PRODUCT PAGES */}
            <div className="space-y-6">
              {/* Product page image */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-800 translate-x-8">
                <Image src="/images/website.png" alt="Product page" unoptimized fill className="object-cover" />
              </div>

              {/* Section label */}
              <p className="text-center text-gray-500 font-bold text-sm tracking-wider italic font-['Times_New_Roman','Georgia',serif] transform translate-x-0.5">
                [PRODUCT PAGES]
              </p>

              {/* Description text */}
              <p className="text-gray-300 text-base leading-none font-bold font-sans">
                try outfits on your AI self first<br />
                and see the perfect fit before<br />
                you buy.
              </p>
            </div>
          </div>

          <div className="mt- text-center">
            <button 
              className="inline-flex items-center justify-center rounded-xl bg-white px-16 py-4 text-black font-bold text-xl shadow-[0_0_0_6px_rgba(255,255,255,0.08)] hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={handleGetAccess}
            >
              Get Access Now →
            </button>
          </div>

          {/* divider with glow */}
          <div className="relative mt-16">
            <div className="h-px bg-white/30 mx-auto max-w-2xl"></div>
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-56  bg-[#1E90FF] blur-3xl opacity-20"></div>
          </div>
        </div>
      </section>

      {/* ================== TESTIMONIAL SECTION ================== */}
      <section className={`${tokens.gutter} pt-0 pb-24 bg-black text-white`} style={{ background: 'radial-gradient(circle at 49% 55%, rgba(89, 175, 255,1) 10%,rgb(74, 155, 232) 12%, rgba(0, 0, 0, 1) 17%)' }}>
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Section Title */}
          <h2 className="text-center text-[18px] sm:text-[22px] font-bold text-white mb-6 uppercase tracking-wide leading-none">
            WHAT OUR USERS
            <br />
            THINK ABOUT
            <br />
            GENCHY AI
          </h2>

          {/* Subtitle */}
          <p className="text-center text-white/80 text-[11px] mb-8">
            Real feedback from real people I've
            <br />
            had the pleasure to work with.
          </p>

          {/* Testimonial Cards Container (for positioning lines and the card) */}
          <div className="flex justify-center relative" >
            {/* Left Underline */}
            <div className="hidden sm:block absolute left-0 top-1/1 -translate-y-1/2 w-16 h-0.5 bg-white rounded-full md:w-24 lg:w-40 xl:w-90"></div>
            
            {/* Testimonial Card with separate gradient glow */}
            <div className="relative z-10"> {/* Added z-10 to ensure card is above glow */}
              {/* Gradient Glow - positioned behind the card */}
              <div className="absolute inset-0 -m-4 rounded-full blur-lg opacity-70" /* Adjust -m- values to control how much it extends */
                   style={{ 
                    
                     transform: 'scale(1.2)' /* Scale it up to make it bigger than the card */
                   }}>
              </div>

              {/* Actual Testimonial Card */}
              <div className="relative w-[280px] max-w-full rounded-xl text-white p-6  border border-white" > {/* Added bg-black to the card itself */}
                
                {/* Profile Picture */}
                <div className="flex items-start rounded-xl space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      <Image src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Alina M." fill className="object-cover rounded-full" unoptimized />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      o
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-white leading-relaxed mb-4">
                  &ldquo;It&apos;s the small touches that made the big difference. The attention to detail made everything feel so well-crafted.&rdquo;
                </p>

                {/* Author */}
                <div>
                  <p className="font-bold text-white">Alina M.</p>
                  <p className="text-sm text-white/60">Co-founder of Noura Skincare</p>
                </div>
              </div>
            </div>
            
            {/* Right Underline */}
            <div className="hidden sm:block absolute right-0 top-1/1 -translate-y-1/2 w-16 h-0.5 bg-white rounded-full md:w-24 lg:w-40 xl:w-90"></div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span className="w-2 h-2 border border-gray-600 rounded-full"></span> {/* Outlined dot */}
          </div>
        </div>
      </section>

      {/* ================== SECTION 6 — Pricing ================== */}
      <section className={`${tokens.gutter} pt-4 pb-24 bg-black text-white`} id="pricing">
        <div className={`mx-auto ${tokens.maxW}`}>
          <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-10">Select Package</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className=" bg-neutral-900 border border-neutral-800 p-8 h-[600px] flex flex-col rounded-xl">
              <div className="text-center mb-6">
                <p className="text-sm text-neutral-400 font-bold tracking-wide">STARTER</p>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">Best for individuals &<br />small small projects</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-extrabold tracking-tight text-white">$0<span className="text-lg font-medium text-neutral-400"> /month</span></div>
                <p className="text-sm text-neutral-400 mt-1">5 credits/month</p>
              </div>
              
              <div className="text-center mb-8">
                <a href="/pricing" className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-600 px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-all duration-200 hover:border-neutral-500">
                  Sign up Free <Cog className="w-4 h-4" />
                </a>
              </div>
              
              <div className="flex-grow">
                <p className="text-sm text-neutral-300 font-semibold mb-4 text-center">FEATURES INCLUDED:</p>
                <ul className="space-y-6 text-sm text-neutral-300">
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>5 Al background replacements</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>1 virtual models</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>1 brand style presets</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>720p resolution</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Community support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro (highlighted) */}
            <div className=" bg-neutral-900 border-2 border-[#1E90FF] p-8 h-[600px] flex flex-col shadow-[0_0_0_4px_rgba(0,154,255,0.15)] rounded-xl">
              <div className="text-center mb-6">
                <p className="text-sm text-neutral-400 font-bold tracking-wide">PRO</p>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">Ideal for growing<br />eCormences & freeloncers</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-extrabold tracking-tight text-white">$19<span className="text-lg font-medium text-neutral-400">/month</span></div>
                <p className="text-sm text-neutral-400 mt-1">50 credits/month</p>
              </div>
              
              <div className="text-center mb-8">
                <a href="/pricing" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-medium hover:bg-neutral-100 transition-all duration-200">
                  Go Pro <Cog className="w-4 h-4" />
                </a>
              </div>
              
              <div className="flex-grow">
                <p className="text-sm text-neutral-300 font-semibold mb-4 text-center">FEATURES INCLUDED:</p>
                <ul className="space-y-6 text-sm text-neutral-300">
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>50+ virtual models</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>10+ virtual models</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Unlimited brand style presets</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>4K resolution exports</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Priority email support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Enterprise */}
            <div className=" bg-neutral-900 border border-neutral-800 p-8 h-[600px] flex flex-col rounded-xl">
              <div className="text-center mb-6">
                <p className="text-sm text-neutral-400 font-bold tracking-wide">ENTERPRISE</p>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">For teams & businesses<br />with high high volume</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-medium tracking-tight text-white">Custom pricing</div>
                <p className="text-sm text-neutral-400 mt-1">Unlimited credits</p>
              </div>
              
              <div className="text-center mb-8">
                <a href="/pricing" className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-600 px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-all duration-200 hover:border-neutral-500">
                  Contact Sales <Cog className="w-4 h-4" />
                </a>
              </div>
              
              <div className="flex-grow">
                <p className="text-sm text-neutral-300 font-semibold mb-4 text-center">FEATURES INCLUDED:</p>
                <ul className="space-y-6 text-sm text-neutral-300">
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Dedicated Al model training</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Team callaboration (Shopily (seats)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Custom watermark designs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4  bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>24/7 VIP support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== SECTION 7 — Removed calculator per request ================== */}

      {/* ================== SECTION 8 — Final CTA (blue “Perfect”) ================== */}
      <section className={`${tokens.gutter} py-16 bg-white relative`}>
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-60 w-60  bg-[#1E90FF] blur-3xl opacity-25"></div>
        <div className={`relative mx-auto ${tokens.maxW} text-center`}>
          <h3 className="text-[24px] sm:text-[32px] font-semibold text-neutral-800 tracking-tight">
            Ready to <span className="font-extrabold text-[#1DA1FF]">Perfect</span> Your AI Art?
          </h3>
          <p className="mt-2 text-[12px] sm:text-[13px] text-neutral-500 max-w-md mx-auto">
            Join thousands of creators making their AI-generated images look naturally stunning.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button 
              className="inline-flex items-center justify-center  bg-[#1DA1FF] px-5 py-2.5 text-white text-sm font-semibold shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={handleEnhanceNow}
            >
              Enhance Now
            </button>
            <button 
              className="inline-flex items-center justify-center  bg-neutral-100 px-5 py-2.5 text-neutral-700 text-sm font-semibold border border-neutral-300 hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={handleViewPricing}
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* ================== FAQ Section ================== */}
      <section className={`${tokens.gutter} py-24 bg-black text-white`} id="faq">
        <div className={`mx-auto ${tokens.maxW}`}>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ask us a question
          </h2>
          <p className="text-center text-neutral-400 mb-10">
            Have something else you want to ask? Reach out to us.
          </p>
          <div className="max-w-2xl mx-auto">
            <form action={formAction} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="block w-full  border-neutral-700 bg-neutral-900 text-white shadow-sm focus:border-lime-500 focus:ring-lime-500 sm:text-sm h-10 px-3"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-neutral-300">
                  Question
                </label>
                <div className="mt-1">
                  <textarea
                    id="question"
                    name="question"
                    rows={4}
                    className="block w-full  border-neutral-700 bg-neutral-900 text-white shadow-sm focus:border-lime-500 focus:ring-lime-500 sm:text-sm p-3"
                    placeholder="Your question..."
                    required
                  />
                </div>
              </div>
              <div>
                <SubmitButton />
              </div>
              {'success' in state && state.success && (
                <p className="text-sm text-lime-500">{state.success}</p>
              )}
              {'error' in state && state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ================== FOOTER ================== */}
      <footer className={`${tokens.gutter} py-12 bg-[#0B0B0C] text-neutral-300`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
            <div>
              <div className=" border border-neutral-800 bg-black p-4">
                <div className="text-white font-extrabold tracking-[0.22em] uppercase">GINCHY</div>
                <p className="mt-2 text-xs text-neutral-400">AI models for fashion brands. Studio-quality visuals without studio overhead.</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white tracking-wide">PRODUCT</p>
              <ul className="mt-2 space-y-1">
                <li>Features</li>
                <li>Pricing</li>
                <li>Try Now</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white tracking-wide">SUPPORT</p>
              <ul className="mt-2 space-y-1">
                <li>Contact Us</li>
                <li>Report Bug</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white tracking-wide">LEGAL</p>
              <ul className="mt-2 space-y-1">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-xs text-neutral-500 text-center">© {new Date().getFullYear()} Create Without Limits Technologies INC.</div>
        </div>
      </footer>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={closeModal}
        currentImage={currentImage}
        relatedImages={relatedImages}
      />
    </main>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2  bg-[#1E90FF] px-8 py-3.5 text-white text-lg font-semibold hover:brightness-95 transition disabled:opacity-50"
    >
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}