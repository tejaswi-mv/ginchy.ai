"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Cog, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react"; // icons

const tokens = {
  maxW: "max-w-[1200px]",
  gutter: "px-4 sm:px-6 lg:px-8",
  grid: "grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8",
};

// Image gallery data - mapping each image to related images
const imageGallery = {
  "/images/Woman.png": [
    "/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg",
    "/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png",
    "/images/woman v2.png"
  ],
  "/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg": [
    "/images/Woman.png",
    "/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png",
    "/images/woman v2.png"
  ],
  "/images/freepik__a-full-shot-of-a-smiling-black-man-around-24-years__34269.jpeg": [
    "/images/romain.gn_A_hand_holding_a_phone_--ar_5877_--raw_--profile_h5_5161a1f7-02d7-43a3-afd2-b77925b50fab_0.png",
    "/images/Woman.png"
  ],
  "/images/romain.gn_A_hand_holding_a_phone_--ar_5877_--raw_--profile_h5_5161a1f7-02d7-43a3-afd2-b77925b50fab_0.png": [
    "/images/freepik__a-full-shot-of-a-smiling-black-man-around-24-years__34269.jpeg",
    "/images/Woman.png"
  ],
  "/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png": [
    "/images/Woman.png",
    "/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg",
    "/images/woman v2.png"
  ],
  "/images/woman v2.png": [
    "/images/Woman.png",
    "/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg",
    "/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png"
  ],
  "/images/website.png": [
    "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png",
    "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53455 (1).png"
  ],
  "/images/freepik__we-see-in-derset-with-a-new-pose__53446 (1).png": [
    "/images/freepik__we-see-in-new-york-with-a-new-pose__53447 (1).png",
    "/images/freepik__we-see-her-in-snow-enviorment-with-a-new-pose__53458 (1).png",
    "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png"
  ],
  "/images/freepik__we-see-in-new-york-with-a-new-pose__53447 (1).png": [
    "/images/freepik__we-see-in-derset-with-a-new-pose__53446 (1).png",
    "/images/freepik__we-see-her-in-snow-enviorment-with-a-new-pose__53458 (1).png",
    "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png"
  ],
  "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png": [
    "/images/freepik__we-see-in-derset-with-a-new-pose__53446 (1).png",
    "/images/freepik__we-see-in-new-york-with-a-new-pose__53447 (1).png",
    "/images/freepik__we-see-her-in-snow-enviorment-with-a-new-pose__53458 (1).png"
  ],
  "/images/freepik__we-see-her-in-snow-enviorment-with-a-new-pose__53458 (1).png": [
    "/images/freepik__we-see-in-derset-with-a-new-pose__53446 (1).png",
    "/images/freepik__we-see-in-new-york-with-a-new-pose__53447 (1).png",
    "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png"
  ],
  "/images/image (1).png": [
    "/images/freepik__make-text-and-style-and-buttons-into-more-this-vib__85504 (1).png",
    "/images/Woman.png"
  ],
  "/images/freepik__make-text-and-style-and-buttons-into-more-this-vib__85504 (1).png": [
    "/images/image (1).png",
    "/images/Woman.png"
  ]
};

// Modal component for image gallery
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
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Navigation buttons */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Main image */}
        <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
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
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                index === currentIndex ? 'border-[#B7FF2C]' : 'border-transparent'
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
    // You can customize this functionality - for now it will show an alert
    alert("Get Access Now clicked! This could redirect to signup, pricing, or contact form.");
    // Example: window.location.href = "/signup";
    // Example: window.open("https://your-signup-page.com", "_blank");
  };

  const handleEnhanceNow = () => {
    // You can customize this functionality - for now it will show an alert
    alert("Enhance Now clicked! This could redirect to the enhancement tool or AI editor.");
    // Example: window.location.href = "/enhance";
    // Example: window.open("https://your-enhancement-tool.com", "_blank");
  };

  const handleViewPricing = () => {
    // Scroll to the pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert("View Pricing clicked! This could redirect to pricing page.");
      // Example: window.location.href = "/pricing";
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white antialiased">
      {/* neon background accents */}
      <div className="pointer-events-none absolute -z-10 inset-0">
        <div className="absolute left-[-120px] top-24 h-[260px] w-[260px] rounded-full bg-[#B7FF2C] blur-[120px] opacity-25"></div>
        <div className="absolute right-[-100px] top-[520px] h-[300px] w-[300px] rounded-full bg-[#B7FF2C] blur-[140px] opacity-20"></div>
        <div className="absolute left-1/3 bottom-[-120px] h-[280px] w-[280px] rounded-full bg-[#B7FF2C] blur-[140px] opacity-15"></div>
      </div>
   

      {/* ================== HERO ================== */}
      <section className={`${tokens.gutter} pt-24 pb-16 bg-black text-white`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          <div className={tokens.grid}>
            {/* Left: copy */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
              <h1 className="font-[var(--font-display)] text-[64px] sm:text-[72px] lg:text-[88px] font-extrabold leading-[0.95] tracking-tight">
                <span className="text-[#D7FF00] drop-shadow-[0_0_22px_rgba(215,255,0,0.25)]">UNLOCK</span>
                <br />
                <span className="italic">GROWTH</span>
              </h1>
              <p className="mt-6 text-[18px] sm:text-[20px] text-neutral-200 max-w-xl leading-relaxed">
                Adopt the industry’s leading AI platform for in-house creation of PDP, Lookbook, and Campaign visuals.
              </p>
              <p className="mt-3 text-[#D7FF00] drop-shadow-[0_0_16px_rgba(215,255,0,0.35)] font-semibold tracking-wider text-[20px]">[ with Ginchy ]</p>
              <div className="mt-6">
                {/* CTA duplicated below hero media per screenshot; keep here for mobile */}
                <a href="#try" className="inline-flex lg:hidden items-center justify-center gap-2 rounded-full bg-[#D7FF00] px-8 py-3.5 text-black text-lg font-semibold hover:brightness-95 transition shadow-[0_0_0_8px_rgba(183,255,44,0.12)]">Try it now <ArrowRight className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Right: media frame placeholder */}
            <div className="col-span-12 lg:col-span-6 mt-10 lg:mt-0">
              <div className="relative overflow-hidden rounded-3xl border border-neutral-800 shadow-sm aspect-[16/10] bg-neutral-800">
                <Image src="/images/video.png" alt="Hero video" unoptimized fill className="object-cover" priority />
              </div>
              {/* CTA under hero showcase on desktop */}
              <div className="hidden lg:block mt-6">
                <a href="#try" className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D7FF00] px-10 py-4 text-black text-xl font-semibold hover:brightness-95 transition shadow-[0_0_0_10px_rgba(183,255,44,0.12)]">Try it now <ArrowRight className="w-6 h-6" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== SECTION 2 — Create/All types ================== */}
      <section className={`${tokens.gutter} py-20 bg-black text-white`} id="about">
        <div className={`mx-auto ${tokens.maxW}`}>
          <div className={tokens.grid}>
            {/* Left column: title + media with benefits on the right */}
            <div className="col-span-12 lg:col-span-7">
              <h2 className="font-[var(--font-display)] text-[30px] sm:text-[36px] font-extrabold tracking-tight mb-6 max-w-2xl">
                Create, amplify and scale professional product content.
              </h2>
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* media placeholder (video or image) */}
                <div className="col-span-12 md:col-span-7">
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-900 aspect-[4/3]">
                    <Image src="https://images.pexels.com/photos/3268732/pexels-photo-3268732.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Fashion model" fill className="object-cover" unoptimized />
                  </div>
                  {/* small overlay thumbnail bottom-left */}
                  <div className="relative -mt-10 ml-6 w-44 h-28 rounded-md overflow-hidden border border-neutral-700 bg-neutral-800">
                    <Image src="https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Fashion model thumbnail" fill className="object-cover" unoptimized />
                  </div>
                </div>
                {/* benefits text list */}
                <div className="col-span-12 md:col-span-5 text-sm sm:text-[15px] leading-6">
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-white">Production efficiency</h3>
                      <p className="text-neutral-300">Speed up the design-to-production process by eliminating the need for physical sample to respond quickly to market demands.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Cost reduction</h3>
                      <p className="text-neutral-300">Eliminates the need for traditional photoshoots, reducing costs and resource consumption while simplifying content creation.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Sustainability</h3>
                      <p className="text-neutral-300">Reduces the environmental impact by minimizing the need for physical photoshoots and associated logistics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: heading + three cards layout */}
            <div className="col-span-12 lg:col-span-5">
              <h2 className="font-[var(--font-display)] text-[34px] sm:text-[40px] font-extrabold tracking-tight mb-6 uppercase">
                ALL TYPES OF
                <br />
                <span className="italic text-[#D7FF00]">[ fashion items ]</span>
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {/* Top row: shoes with small label on the right */}
                <div className="relative flex justify-start">
                  <div className="relative w-[360px] max-w-full rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-100 aspect-[4/3]">
                    <Image src="/images/Shoes.png" alt="Shoes" fill className="object-cover" unoptimized />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 rounded-md border border-neutral-600 bg-black/60 px-3.5 py-1 text-[10px]">Shoes</div>
                </div>
                {/* second row: jewelry small square with label below */}
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div className="relative flex justify-start">
                    <div className="relative w-[180px] max-w-full rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-100 aspect-square">
                      <Image src="/images/Garment.png" alt="Accessories" fill className="object-cover" unoptimized />
                    </div>
                    <div className="absolute -bottom-7 left-[90px] -translate-x-1/2 w-[110px] text-center rounded-md border border-neutral-600 bg-black/60 px-3.5 py-1 text-[10px]">Accessories</div>
                  </div>
                  {/* sunglasses big square with label on right */}
                  <div className="relative flex justify-start">
                    <div className="relative w-[260px] max-w-full rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-100 aspect-square">
                      <Image src="/images/glasses.png" alt="Sunglasses" fill className="object-cover" unoptimized />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 rounded-md border border-neutral-600 bg-black/60 px-3.5 py-1 text-[10px]">Sunglasses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== SECTION 3 — AI outfit / Choose your model ================== */}
      <section className={`${tokens.gutter} py-20 bg-white`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          <div className="relative rounded-[24px] bg-white border-[8px] border-black p-6 sm:p-8 lg:p-10">

            {/* AI outfit generated section */}
            <div className="mb-16">
              <h2 className="text-center text-[20px] font-semibold text-neutral-900 mb-6">
                AI outfit generated with Genchy AI technology
              </h2>
              
              {/* Outfit grid - matching screenshot layout exactly with proper sizing */}
              <div className="flex items-center justify-center gap-6">
                {/* Woman in car - far left */}
                <div className="relative w-48 h-60 rounded-lg overflow-hidden bg-neutral-200">
                  <Image src="/images/Woman.png" alt="Woman in car" unoptimized fill className="object-cover" />
                </div>
                
                {/* Athletic outfit - middle left */}
                <div className="relative w-48 h-60 rounded-lg overflow-hidden bg-neutral-200">
                  <Image src="/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg" alt="Athletic outfit" unoptimized fill className="object-cover" />
                </div>
                
                {/* Center - 3x2 clothing grid - larger size */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-200">
                    <Image src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Black tee" unoptimized fill className="object-cover" />
                  </div>
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-200">
                    <Image src="https://images.pexels.com/photos/1964970/pexels-photo-1964970.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Cargo vest" unoptimized fill className="object-cover" />
                  </div>
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-200 border-2 border-yellow-400">
                    <Image src="https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Black dress" unoptimized fill className="object-cover" />
                  </div>
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-200">
                    <Image src="https://images.pexels.com/photos/2026960/pexels-photo-2026960.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Black dress 2" unoptimized fill className="object-cover" />
                  </div>
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-200">
                    <Image src="https://images.pexels.com/photos/1597554/pexels-photo-1597554.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Flared pant" unoptimized fill className="object-cover" />
                  </div>
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-200">
                    <Image src="https://images.pexels.com/photos/1485637/pexels-photo-1485637.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Asymmetrical top" unoptimized fill className="object-cover" />
                  </div>
                </div>
                
                {/* Man in grey shirt - middle right */}
                <div className="relative w-48 h-60 rounded-lg overflow-hidden bg-neutral-200">
                  <Image src="/images/freepik__a-full-shot-of-a-smiling-black-man-around-24-years__34269.jpeg" alt="Man in grey shirt" unoptimized fill className="object-cover" />
                </div>
                
                {/* Man in cream outfit - far right */}
                <div className="relative w-48 h-60 rounded-lg overflow-hidden bg-neutral-200">
                  <Image src="/images/romain.gn_A_hand_holding_a_phone_--ar_5877_--raw_--profile_h5_5161a1f7-02d7-43a3-afd2-b77925b50fab_0.png" alt="Man in cream outfit" unoptimized fill className="object-cover" />
                </div>
              </div>
            </div>

            {/* Choose your model section */}
            <div>
              <h2 className="text-center text-[32px] font-bold text-black mb-2">
                CHOOSE YOUR MODEL
              </h2>
              <p className="text-center text-[14px] text-neutral-600 mb-8">
                Browse our diverse library or generate a custom one.
              </p>
              
              {/* Model grid and buttons */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                  {/* Model headshots grid - using the original image with click functionality */}
                  <div 
                    className="relative rounded-lg overflow-hidden mb-6 cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => openModal("/images/freepik__make-text-and-style-and-buttons-into-more-this-vib__85504 (1).png")}
                  >
                    <Image 
                      src="/images/freepik__make-text-and-style-and-buttons-into-more-this-vib__85504 (1).png" 
                      alt="Model headshots grid" 
                      unoptimized 
                      width={800} 
                      height={400} 
                      className="w-full h-auto" 
                    />
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button className="flex-1 border border-black rounded-lg px-6 py-3 text-black font-semibold hover:bg-neutral-50 transition">
                      BROWSE LIBRARY
                    </button>
                    <button className="flex-1 bg-neutral-800 text-white rounded-lg px-6 py-3 font-semibold hover:bg-neutral-700 transition">
                      GENERATE CUSTOM MODEL
                    </button>
                  </div>
                </div>
                
                {/* Right side - full body model */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-neutral-200">
                    <Image src="/images/image (1).png" alt="Full body model" unoptimized fill className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== SECTION 4 — Customize your pictures ================== */}
      <section className={`${tokens.gutter} py-24 bg-black text-white`} id="examples">
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Title with exact font and color from screenshot */}
          <h2 className="text-center font-bold text-[#B7FF2C] text-[32px] leading-tight mb-10">
            Customize your pictures the way you want
            <span className="text-[#B7FF2C] ml-1">✱</span>
          </h2>

          {/* container with left padding so the vertical pill is always visible */}
          <div className="relative pl-20 overflow-visible">
            {/* vertical lime pill - exact styling from screenshot */}
            <div className="absolute left-0 top-0 h-full z-10">
              <div 
                className="relative h-full w-12 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={handleGetAccess}
              >
                {/* lime gradient fill */}
                <div className="absolute inset-0 bg-[#B7FF2C]" />
                {/* vertical label - text from bottom to top */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rotate-[-90deg] font-black text-black text-sm tracking-wider whitespace-nowrap">
                    Get Access Now →
                  </span>
                </div>
              </div>
            </div>

            {/* four tall images row - professional images as specified */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Sample placeholder - Desert scene */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#B7FF2C] bg-neutral-800">
                <Image src="/images/freepik__we-see-in-derset-with-a-new-pose__53446 (1).png" alt="Sample placeholder" unoptimized fill className="object-cover" />
                <div className="absolute top-3 left-3 h-6 w-6 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_12px_rgba(183,255,44,0.5)]"></div>
                <div className="absolute bottom-4 right-4 h-8 w-8 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_14px_rgba(183,255,44,0.5)]"></div>
              </div>
              
              {/* Customized 2 - New York scene */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#B7FF2C] bg-neutral-800">
                <Image src="/images/freepik__we-see-in-new-york-with-a-new-pose__53447 (1).png" alt="Customized 2" unoptimized fill className="object-cover" />
                <div className="absolute top-3 left-3 h-6 w-6 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_12px_rgba(183,255,44,0.5)]"></div>
                <div className="absolute bottom-4 right-4 h-8 w-8 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_14px_rgba(183,255,44,0.5)]"></div>
              </div>
              
              {/* Customized 3 - White studio scene */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#B7FF2C] bg-neutral-800">
                <Image src="/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png" alt="Customized 3" unoptimized fill className="object-cover" />
                <div className="absolute top-3 left-3 h-6 w-6 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_12px_rgba(183,255,44,0.5)]"></div>
                <div className="absolute bottom-4 right-4 h-8 w-8 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_14px_rgba(183,255,44,0.5)]"></div>
              </div>
              
              {/* Customized 4 - Snow environment scene */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#B7FF2C] bg-neutral-800">
                <Image src="/images/freepik__we-see-her-in-snow-enviorment-with-a-new-pose__53458 (1).png" alt="Customized 4" unoptimized fill className="object-cover" />
                <div className="absolute top-3 left-3 h-6 w-6 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_12px_rgba(183,255,44,0.5)]"></div>
                <div className="absolute bottom-4 right-4 h-8 w-8 border-2 border-[#B7FF2C] rounded-sm shadow-[0_0_14px_rgba(183,255,44,0.5)]"></div>
              </div>
            </div>

            {/* Bottom text - exact styling from screenshot */}
            <p className="mt-8 text-center font-bold text-[#B7FF2C] text-[32px] tracking-wide">
              Consistency Models + Unlimited Environments + Much more
            </p>
          </div>
        </div>
      </section>

      {/* ================== GENAI MODELS SECTION ================== */}
      <section className={`${tokens.gutter} py-24 bg-black text-white`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Main interactive display area - just placeholder for the entire image */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border-2 border-[#B7FF2C] bg-neutral-900 shadow-[0_0_40px_rgba(183,255,44,0.40)]">
            <div className="grid grid-cols-3 grid-rows-2 w-full h-full gap-2 p-2">
              <div className="relative col-span-1 row-span-1 rounded-2xl overflow-hidden"><Image src="https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=800" alt="GenAI Model 1" fill className="object-cover" unoptimized /></div>
              <div className="relative col-span-1 row-span-1 rounded-2xl overflow-hidden"><Image src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=800" alt="GenAI Model 2" fill className="object-cover" unoptimized /></div>
              <div className="relative col-span-1 row-span-2 rounded-2xl overflow-hidden"><Image src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=800" alt="GenAI Model 3" fill className="object-cover" unoptimized /></div>
              <div className="relative col-span-1 row-span-1 rounded-2xl overflow-hidden"><Image src="https://images.pexels.com/photos/2100063/pexels-photo-2100063.jpeg?auto=compress&cs=tinysrgb&w=800" alt="GenAI Model 4" fill className="object-cover" unoptimized /></div>
              <div className="relative col-span-1 row-span-1 rounded-2xl overflow-hidden"><Image src="https://images.pexels.com/photos/2773977/pexels-photo-2773977.jpeg?auto=compress&cs=tinysrgb&w=800" alt="GenAI Model 5" fill className="object-cover" unoptimized /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== SECTION 5 — Personalize your outfit ================== */}
      <section className={`${tokens.gutter} py-24 bg-black text-white`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-[#B7FF2C] mb-16 drop-shadow-[0_0_14px_rgba(183,255,44,0.45)]">
            Personalize your outfit<span className="ml-2 text-[#B7FF2C]">✱</span>
          </h2>

          {/* two main sections - SOCIAL MEDIA and PRODUCT PAGES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* LEFT SECTION - SOCIAL MEDIA */}
            <div className="space-y-6">
              {/* Profile card */}
              <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 w-fit">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500"></div>
                <div>
                  <p className="text-white font-semibold text-sm">Lil Miquela</p>
                  <p className="text-gray-400 text-xs">@lilmiquela • 2.7M followers</p>
                </div>
              </div>

              {/* Main images - increased size to match right side */}
              <div className="grid grid-cols-2 gap-8">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-neutral-800">
                  <Image src="/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png" alt="Woman in floral top" unoptimized fill className="object-cover" />
                </div>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-neutral-800">
                  <Image src="/images/woman v2.png" alt="Woman in grey hoodie" unoptimized fill className="object-cover" />
                </div>
              </div>

              {/* Section label */}
              <p className="text-center text-[#B7FF2C] font-bold text-sm tracking-wider">
                [SOCIAL MEDIA]
              </p>

              {/* Description text */}
              <p className="text-gray-300 text-base leading-relaxed">
                Swap garments and create on-brand looks that elevate your Instagram, website, and campaigns<br />
                — driving more engagement and a consistent visual identity.
              </p>
            </div>

            {/* RIGHT SECTION - PRODUCT PAGES */}
            <div className="space-y-6">
              {/* Product page image */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-800 border-2 border-[#B7FF2C]">
                <Image src="/images/website.png" alt="Product page" unoptimized fill className="object-cover" />
              </div>

              {/* Section label */}
              <p className="text-center text-[#B7FF2C] font-bold text-sm tracking-wider">
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
              className="inline-flex items-center justify-center rounded-full bg-white px-12 py-6 text-black font-bold text-xl shadow-[0_0_0_6px_rgba(255,255,255,0.08)] hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={handleGetAccess}
            >
              Get Access Now →
            </button>
          </div>

          {/* divider with glow */}
          <div className="relative mt-16">
            <div className="h-px bg-white/30 mx-auto max-w-2xl"></div>
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-[#B7FF2C] blur-3xl opacity-20"></div>
          </div>
        </div>
      </section>

      {/* ================== TESTIMONIAL SECTION ================== */}
      <section className={`${tokens.gutter} py-24 bg-black text-white`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          {/* Section Title */}
          <h2 className="text-center text-2xl font-bold text-white mb-4 uppercase tracking-wide whitespace-nowrap">
            WHAT OUR USERS THINK ABOUT GENCHY AI
          </h2>
          
          {/* Subtitle */}
          <p className="text-center text-white/80 text-lg mb-16">
            Real feedback from real people<br />I&apos;ve had the pleasure to work with.
          </p>

          {/* Testimonial Cards */}
          <div className="flex justify-center">
            <div className="relative w-[400px] max-w-full rounded-2xl bg-white text-black p-6 shadow-[0_0_40px_rgba(183,255,44,0.60)] border border-[#B7FF2C]">
              {/* Profile Picture */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    <Image src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Alina M." fill className="object-cover" unoptimized/>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    0
                  </div>
                </div>
              </div>
              
              {/* Quote */}
              <p className="text-gray-800 leading-relaxed mb-4">
                &ldquo;It&apos;s the small touches that made the big difference. The attention to detail made everything feel so well-crafted.&rdquo;
              </p>
              
              {/* Author */}
              <div>
                <p className="font-bold text-gray-900">Alina M.</p>
                <p className="text-sm text-gray-600">Co-founder of Noura Skincare</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== SECTION 6 — Pricing ================== */}
      <section className={`${tokens.gutter} py-24 bg-black text-white`} id="pricing">
        <div className={`mx-auto ${tokens.maxW}`}>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight mb-10">Select Package</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
              <p className="text-sm text-neutral-400">STARTER</p>
              <div className="mt-2 text-3xl font-extrabold tracking-tight">$0<span className="text-base font-medium">/month</span></div>
              <p className="text-xs text-neutral-400">5 credits / month</p>
              <a className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-4 py-2 text-sm">
                Sign up Free <Cog className="w-4 h-4" />
              </a>
              <ul className="mt-6 space-y-2 text-sm text-neutral-300">
                <li>5 AI background replacements</li>
                <li>1 virtual models</li>
                <li>1 brand style presets</li>
                <li>720p resolution</li>
                <li>Community support</li>
              </ul>
            </div>

            {/* Pro (highlighted) */}
            <div className="rounded-2xl bg-neutral-900 border-2 border-[#B7FF2C] p-6 shadow-[0_0_0_4px_rgba(183,255,44,0.15)]">
              <p className="text-sm text-neutral-400">PRO</p>
              <div className="mt-2 text-3xl font-extrabold tracking-tight">$19<span className="text-base font-medium">/month</span></div>
              <p className="text-xs text-neutral-400">50 credits / month</p>
              <div className="mt-4 inline-flex rounded-full bg-white p-1 text-sm text-black">
                <button className="px-5 py-2 rounded-full font-semibold">Go Pro</button>
                <button className="px-5 py-2 rounded-full text-neutral-600">•</button>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-neutral-300">
                <li>50+ virtual models</li>
                <li>10+ virtual models</li>
                <li>Unlimited brand style presets</li>
                <li>4K resolution exports</li>
                <li>Priority email support</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
              <p className="text-sm text-neutral-400">ENTERPRISE</p>
              <div className="mt-2 text-3xl font-extrabold tracking-tight">Custom pricing</div>
              <p className="text-xs text-neutral-400">Unlimited credits</p>
              <a className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-4 py-2 text-sm">
                Contact Sales <Cog className="w-4 h-4" />
              </a>
              <ul className="mt-6 space-y-2 text-sm text-neutral-300">
                <li>Dedicated AI model training</li>
                <li>Team collaboration (Shopify seats)</li>
                <li>API access</li>
                <li>Custom watermark designs</li>
                <li>24/7 VIP support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================== SECTION 7 — Removed calculator per request ================== */}

      {/* ================== SECTION 8 — Final CTA (blue “Perfect”) ================== */}
      <section className={`${tokens.gutter} py-16 bg-white relative`}>
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-60 w-60 rounded-full bg-[#B7FF2C] blur-3xl opacity-25"></div>
        <div className={`relative mx-auto ${tokens.maxW} text-center`}>
          <h3 className="text-[28px] sm:text-[32px] font-semibold text-neutral-800 tracking-tight">
            Ready to <span className="font-extrabold text-[#1DA1FF]">Perfect</span> Your AI Art?
          </h3>
          <p className="mt-2 text-[12px] sm:text-[13px] text-neutral-500">
            Join thousands of creators making their AI-generated images look naturally stunning.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button 
              className="inline-flex items-center justify-center rounded-full bg-[#1DA1FF] px-5 py-2.5 text-white text-sm font-semibold shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={handleEnhanceNow}
            >
              Enhance Now
            </button>
            <button 
              className="inline-flex items-center justify-center rounded-full bg-neutral-100 px-5 py-2.5 text-neutral-700 text-sm font-semibold border border-neutral-300 hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={handleViewPricing}
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* ================== FOOTER ================== */}
      <footer className={`${tokens.gutter} py-12 bg-[#0B0B0C] text-neutral-300`}>
        <div className={`mx-auto ${tokens.maxW}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
            <div>
              <div className="rounded-md border border-neutral-800 bg-black p-4">
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
          <div className="mt-8 text-xs text-neutral-500">© {new Date().getFullYear()} Create Without Limits Technologies INC.</div>
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