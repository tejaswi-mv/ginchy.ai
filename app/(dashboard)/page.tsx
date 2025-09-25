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
                  <div className="w-full lg:w-[30%]">
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
                                              className="object-contain p-1"
                                          />
                                      </div>

                                      {/* Text Label Below Image */}
                                      <p className="text-xs text-center text-gray-500 lowercase pt-1 pb-1" style={{ fontFamily: 'Inter, Helvetica, sans-serif' }}>
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
                              src="/images/5.jpg" 
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
            router.push('/sign-in?redirect=/');
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
                       
                          <div className="grid grid-cols-13 gap-25 items-center">
                              <div className="col-span-12 lg:col-span-8">
                              <h2 className="text-center text-[32px] font-bold text-black mb-2">
                              CHOOSE YOUR MODEL
                          </h2>
                          <p className="text-center text-[14px] text-neutral-600 mb-8">
                              Browse our diverse library or generate a custom one.
                          </p>
                                 <div className="relative  overflow-hidden mb-6 p-0 border border-neutral-200">
                                      {isLoading ? (
                                          <div className="grid grid-cols-6 gap-2">
                                              {Array.from({ length: 18 }).map((_, i) => (
                                                  <div key={i} className="aspect-square  bg-neutral-200 animate-pulse"></div>
                                              ))}
                                          </div>
                                      ) : (
                                          <div className="grid grid-cols-6 gap-2">
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
                                 <div className="flex flex-col sm:flex-row gap-2">
                                      <button onClick={handleBrowseLibrary} className="flex-1 border border-black rounded-xl px-6 py-3 text-black font-semibold hover:bg-neutral-100 transition">
                                          BROWSE LIBRARY
                                      </button>
                                      <button onClick={() => router.push('/generate')} className="flex-1 bg-neutral-900 text-white rounded-xl px-6 py-3 font-semibold hover:bg-neutral-700 transition">
                                          GENERATE CUSTOM MODEL
                                      </button>
                                  </div>
                              </div>
                              <div className="col-span-12 lg:col-span-5">
                                <div className="relative w-full h-[900px] lg:h-[600px]  overflow-hidden bg-neutral-100 border border-neutral-200">
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
      <Hero />
      {/* ================== FULL WIDTH COMPANY LOGOS BANNER ================== */}
      <section className="w-full bg-black pt-2 pb-4 overflow-hidden">
        <div className="relative w-full h-20">
          <div className="flex animate-scroll-seamless">
            <Image 
              src="/images/logos.png" 
              alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
              width={1200}
              height={80}
              className="object-contain flex-shrink-0 filter contrast-200 brightness-150"
              unoptimized
            />
            <Image 
              src="/images/logos.png" 
              alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
              width={1200}
              height={80}
              className="object-contain flex-shrink-0 filter contrast-200 brightness-150"
              unoptimized
            />
            <Image 
              src="/images/logos.png" 
              alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
              width={1200}
              height={80}
              className="object-contain flex-shrink-0 filter contrast-200 brightness-150"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ================== SECTION 2 — Create/All types ================== */}
      <section className={`${tokens.gutter} py-20 bg-black text-white`} id="about">
        <div className={`mx-auto ${tokens.maxW}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left column: title + media with benefits on the right */}
            <div className="col-span-1 lg:col-span-7">
               <h2 className="font-[var(--font-display)] text-[32px] sm:text-[40px] font-extrabold tracking-tight mb-1 max-w-2xl">
                 Create, amplify and scale<br/>
                 professional product content.
               </h2>
               <div className="grid grid-cols-12 gap-6 items-start">
                 {/* media placeholder (video or image) */}
                 <div className="col-span-12 md:col-span-7">
                   <div className="relative inline-block mt-8 group">
                     <Image 
                       src="/images/ginchy-vi.gif" 
                       alt="Fashion model" 
                       width={520}
                       height={385}
                       className="w-[520px] h-[385px] object-cover object-center"
                       style={{
                         objectFit: 'cover', 
                         objectPosition: 'center',
                         borderRadius: '0px'
                       }}
                       unoptimized 
                     />
                     
                     {/* Overlay Image on top of video */}
                     <div className="absolute bottom-2 left-0 z-20" style={{ transform: 'translate(-70px, -170px) scale(1) rotate(0deg)' }}>
                       <Image 
                         src="/images/landingvidside.jpg" 
                         alt="Fashion overlay" 
                         width={250}
                         height={120}
                         className="w-[200px] h-[120px] object-cover shadow-lg border-0 border-white/20"
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
                <div className="col-span-12 md:col-span-5 text-sm sm:text-[15px] leading-6 flex items-end">
                  <div className="space-y-0 mt-1">
                    <div>
                      <h3 className="font-black text-white">Production efficiency</h3>
                      <p className="text-neutral-300">Speed up the design-to-production process by eliminating the need for physical sample to respond quickly to market demands.</p>
                    </div>
                    <div>
                      <h3 className="font-black text-white">Cost reduction</h3>
                      <p className="text-neutral-300">Eliminates the need for traditional photoshoots, reducing costs and resource consumption while simplifying content creation.</p>
                    </div>
                    <div>
                      <h3 className="font-black text-white">Sustainability</h3>
                      <p className="text-neutral-300">Reduces the environmental impact by minimizing the need for physical photoshoots and associated logistics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: heading + three cards layout */}
            <div className="col-span-12 lg:col-span-5">
              <h2 className="font-[var(--font-display)] text-[40px] sm:text-[50px] lg:text-[60px] font-extrabold tracking-tight mb-6 uppercase">
                ALL TYPES OF
                <br />
                <span className="italic text-[#1E90FF] font-['IBM_Plex_Serif','Georgia',serif] font-medium lowercase">[ fashion items ]</span>
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {/* Top row: shoes with small label on the right */}
                <div className="relative flex justify-start">
                  <div className="relative w-[250px] h-[200px] max-w-full overflow-hidden border border-neutral-700 bg-neutral-100">
                    <Image src="/images/1.jpg" alt="Shoes" fill className="object-cover object-center" style={{objectPosition: 'center 20%'}} unoptimized />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-[260px] border border-neutral-600 bg-black/60 px-4 py-2 text-[11px]">Shoes</div>
                </div>
                {/* second row: jewelry small square with label below */}
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div className="relative flex justify-start ml-8">
                    <div className="relative w-[160px] h-[150px] max-w-full overflow-hidden border border-neutral-700 bg-neutral-100">
                      <Image src="/images/2.jpg" alt="Accessories" fill className="object-cover" unoptimized />
                    </div>
                    <div className="absolute -bottom-9 left-[90px] -translate-x-1/2 w-[110px] text-center border border-neutral-600 bg-black/60 px-3.5 py-1 text-[10px]">Accessories</div>
                  </div>
                  {/* sunglasses big square with label on right */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="relative w-[300px] max-w-full overflow-hidden border border-neutral-700 bg-neutral-100 aspect-square">
                      <Image src="/images/3.jpg" alt="Sunglasses" fill className="object-cover" unoptimized />
                    </div>
                    <div className="border border-neutral-600 bg-black/60 px-3.5 py-1 text-[10px]">Sunglasses</div>
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
      <section className={`${tokens.gutter} py-24 bg-black text-white`} id="examples">
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Professional title styling */}
          <h2 className="text-center font-[var(--font-display)] text-white text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-tight leading-[1.1] mb-10">
            Customize your pictures the way you want
            <span className="text-white ml-2">✦</span>
          </h2>

          {/* container with left padding so the vertical pill is always visible */}
          <div className="relative pl-16 sm:pl-20 overflow-visible">
            {/* vertical pill - professional styling */}
            <div className="absolute left-0 top-0 h-full z-10">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
               {/* Sample placeholder - Desert scene */}
               <div className="relative h-[500px] overflow-hidden border-2 border-[#1E90FF] bg-neutral-800 rounded-lg">
                 <Image src="/images/1left-desert-lady.jpg" alt="Sample placeholder" unoptimized fill className="object-cover" />
               </div>
              
               {/* Customized 2 - New York scene */}
               <div className="relative h-[500px] overflow-hidden border-2 border-[#1E90FF] bg-neutral-800 rounded-lg">
                 <Image src="/images/city-2left.jpg" alt="Customized 2" unoptimized fill className="object-cover" />
               </div>
              
               {/* Customized 3 - White studio scene */}
               <div className="relative h-[500px] overflow-hidden border-2 border-[#1E90FF] bg-neutral-800 rounded-lg">
                 <Image src="/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png" alt="Customized 3" unoptimized fill className="object-cover" />
               </div>
              
               {/* Customized 4 - Snow environment scene */}
               <div className="relative h-[500px] overflow-hidden border-2 border-[#1E90FF] bg-neutral-800 rounded-lg">
                 <Image src="/images/snow-lady.jpg" alt="Customized 4" unoptimized fill className="object-cover" />
               </div>
            </div>

            {/* Bottom text - professional styling */}
            <p className="mt-8 text-center font-[var(--font-display)] text-white text-[24px] sm:text-[32px] lg:text-[36px] font-extrabold tracking-tight leading-[1.1]">
              Consistency Models + Unlimited Environments + Much more
            </p>
          </div>
        </div>
      </section>

      {/* ================== GENAI PLATFORM SECTION ================== */}
      <section className={`${tokens.gutter} pt-4 pb-20 bg-black text-white`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Company Logos Banner */}
          <div className="text-center mb-12">
            <p className="text-white text-xl mb-6">
              All the top GenAI models—plus Magnific, recently acquired
              <br />
              by Freepik
            </p>
          </div>
        </div>
        
        {/* Full Width Company Logos Banner */}
        <div className="w-full bg-black py-8 overflow-hidden">
          <div className="animate-scroll-seamless">
            <div className="flex items-center justify-center h-24 px-8">
              <Image 
                src="/images/logos.png" 
                alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
                width={1200}
                height={96}
                className="object-contain h-full"
                unoptimized
              />
            </div>
            <div className="flex items-center justify-center h-24 px-8">
              <Image 
                src="/images/logos.png" 
                alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
                width={1200}
                height={96}
                className="object-contain h-full"
                unoptimized
              />
            </div>
            <div className="flex items-center justify-center h-24 px-8">
              <Image 
                src="/images/logos.png" 
                alt="Company logos - ElevenLabs, Runway, Google, Magnific, KLING, Flux, ChatGPT" 
                width={1200}
                height={96}
                className="object-contain h-full"
                unoptimized
              />
            </div>
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
      <section className={`${tokens.gutter} py-50  bg-black text-white relative`}>
        {/* Background gradient image positioned like in screenshot */}
        <div className="absolute top-5 -right-4 w-1/2 h-full opacity-80 pointer-events-none">
          <Image 
            src="/images/sidegradient1.png" 
            alt="Side gradient background" 
            fill
            className="object-cover object-right"
            unoptimized
          />
        </div>
        <div className={`mx-auto ${tokens.maxW} relative z-10`}> 
          <h2 className=" font-[var(--font-display)] text-[#1E90FF] text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-tight leading-[1.1] mb-16 -ml-0">
            Personalize your outfit<sup className="ml-2 text-[#1E90FF] text- -top-2 relative">✦</sup>
          </h2>

          {/* two main sections - SOCIAL MEDIA and PRODUCT PAGES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
            
            {/* CENTER CIRCULAR IMAGES */}
            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block">
              <div className="flex flex-col gap-8">
                {/* Top circle - sunglasses */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg">
                  <Image 
                    src="/images/sunglasses.png" 
                    alt="Sunglasses" 
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                {/* Bottom circle - shoes */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-lg">
                  <Image 
                    src="/images/Shoes.png" 
                    alt="Shoes" 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>
            {/* LEFT SECTION - SOCIAL MEDIA */}
            <div className="space-y-6 bg-white ">
               {/* Profile card */}
               <div className="flex items-center space-x-3 bg-white/5  p-3 w-fit">
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
                   <p className="text-gray-400 text-xs">@lilmiquela • 2.7M followers</p>
                 </div>
               </div>

              {/* Main images - increased size to match right side */}
              <div className="grid grid-cols-2 gap-1">
                <div className="relative aspect-[4/5]  overflow-hidden bg-neutral-800">
                  <Image src="/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png" alt="Woman in floral top" unoptimized fill className="object-cover" />
                </div>
                <div className="relative aspect-[4/5]  overflow-hidden bg-neutral-800">
                  <Image src="/images/woman v2.png" alt="Woman in grey hoodie" unoptimized fill className="object-cover" />
                </div>
              </div>

              {/* Section label */}
              <p className="text-center bg text-[#1E90FF] font-bold text-sm tracking-wider">
                [SOCIAL MEDIA]
              </p>

              {/* Description text */}
              <p className="text-gray-300 bg-black text-base leading-relaxed">
                Swap garments and create on-brand looks that elevate your Instagram, website, and campaigns<br />
                — driving more engagement and a consistent visual identity.
              </p>
            </div>

            {/* RIGHT SECTION - PRODUCT PAGES */}
            <div className="space-y-6">
              {/* Product page image */}
              <div className="relative aspect-[4/3]  overflow-hidden bg-neutral-800 border-2 border-[#1E90FF]">
                <Image src="/images/website.png" alt="Product page" unoptimized fill className="object-cover" />
              </div>

              {/* Section label */}
              <p className="text-center text-[#1E90FF] font-bold text-sm tracking-wider">
                [PRODUCT PAGES]
              </p>

              {/* Description text */}
              <p className="text-gray-300 text-base leading-relaxed">
                try outfits on your AI self first and see the perfect fit<br />
                before you buy.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
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
      <section className={`${tokens.gutter} pt-4 pb-24 bg-black text-white`} style={{ background: 'radial-gradient(circle at 49% 55%, rgb(23, 11, 243) 10%, rgb(32, 32, 255) 12%, rgba(0, 0, 0, 1) 17%)' }}>
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Section Title */}
          <h2 className="text-center text-xl sm:text-2xl font-bold text-white mb-2 uppercase tracking-wide">
            WHAT OUR USERS
            <br />
            THINK ABOUT
            <br />
            GENCHY AI
          </h2>

          {/* Subtitle */}
          <p className="text-center text-white/80 text-base sm:text-lg mb-8">
            Real feedback from real people
            <br />
            I've had the pleasure to work with.
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
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> {/* Active dot */}
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          </div>
        </div>
      </section>

      {/* ================== SECTION 6 — Pricing ================== */}
      <section className={`${tokens.gutter} py-24 bg-black text-white`} id="pricing">
        <div className={`mx-auto ${tokens.maxW}`}>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight mb-10">Select Package</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className=" bg-neutral-900 border border-neutral-800 p-8 h-[600px] flex flex-col rounded-xl">
              <div className="text-center mb-6">
                <p className="text-sm text-neutral-400 font-semibold tracking-wide">STARTER</p>
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
                <p className="text-sm text-neutral-400 font-semibold tracking-wide">PRO</p>
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
                <p className="text-sm text-neutral-400 font-semibold tracking-wide">ENTERPRISE</p>
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