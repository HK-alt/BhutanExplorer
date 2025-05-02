import { useState } from 'react';
import { Users, Globe, Award, Home } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function AboutUs() {
  const [activeTab, setActiveTab] = useState('our-story');
  

  

  

  const teamMembers = [
    {
      name: "DEEPTI RAI",
      role: "B.E in Surveying & Geo informatics",
      bio: "Third Batch,2025",
      id: "Student No:05220057",
      
      image:  "images/deepti- rai.jpg" 
    },
    {
      name: "KARMA YANGZOM",
      role: "B.E in Surveying & Geo informatics",
      bio: "Third Batch,2025",
      id: "Student No:05220062",
      image: "/images/Karma Yangzom.jpg"
    },
    {
      name: "JIGME TENZIN",
      role: "B.E in Surveying & Geo informatics",
      bio: "Third Batch,2025",
      id: "Student No:05210356",
      image: "/images/Jigme Tenzin.jpg"
    },
    {
      name: "YENTON JAMTSHO",
      role: "B.E in Surveying & Geo informatics",
      bio: "Third Batch,2025",
      id: "Student No:05210310",
      image: "/images/Yenton Jamtsho.jpg"
    }
  ];

 

  return (
    
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
              <Link 
                to="/" 
                className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg 
                          hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg
                          transform hover:-translate-y-1 focus:outline-none focus:ring-2 
                          focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2
                          border-2 border-blue-600 hover:border-blue-700 text-sm md:text-base"
              >
                <Home size={18} className="flex-shrink-0" />
                <span>Back to Home</span>
              </Link>
              
              <div className="absolute inset-0 z-0">
                <img 
                  src="/public/images/college.jpg" 
                  alt="Company culture" 
                  className="w-full h-full object-cover md:object-center opacity-100"
                  srcSet="/images/college-sm.jpg 640w, /images/college.jpg 1920w"
                  sizes="(max-width: 640px) 100vw, 100vw"
                />
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                      About Us
                    </span>
                  </h1>
                  
                  {/* Responsive decorative elements */}
                  <div className="flex justify-center space-x-4 opacity-75 mb-8">
                    <div className="w-12 md:w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transform rotate-45"></div>
                    <div className="w-12 md:w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transform -rotate-45"></div>
                  </div>
      
                  {/* Responsive CTA button */}
                  <div className="mt-8 md:mt-12 animate-fade-in-delayed">
                    <button className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl">
                      Explore Our Work
                    </button>
                  </div>
                </div>
              </div>
            </section>
      

      {/* Tabs Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-2 md:py-4 space-x-4 md:space-x-8 scrollbar-hide">
            <button
              onClick={() => setActiveTab('our-story')}
              className={`px-3 py-1 md:px-4 md:py-2 font-medium text-sm rounded-md whitespace-nowrap ${
                activeTab === 'our-story' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Our Project
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 font-medium text-sm rounded-md ${
                activeTab === 'team' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Our Team
            </button>
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-4 py-2 font-medium text-sm rounded-md ${
                activeTab === 'mission' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Our Mission
            </button>
           
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeTab === 'our-story' && (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Project on Interactive Map</h2>
              <p className="text-lg mb-6">
               Embark on a digital journey through the mystical landscapes of the Kingdom of Bhutan with our Bhutan Explorer Interactive Map—a gateway to immersive discovery. 
              </p>
              <p className="text-lg mb-6">
                Through challenges and triumphs, we've remained committed to our core values of innovation, integrity, and impact.Start exploring—where every click brings you closer to the soul of Bhutan.
              </p>
              <div className="flex items-center space-x-2 text-blue-600">
                <Globe size={20} />
                <span>2025 PROJECT </span>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/images/map.jfif" 
                alt="Our College" 
                className="rounded-lg shadow-lg w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Users size={20} />
                  <span className="font-bold">4 team members</span>
                </div>
              </div>
            </div>
          </div>
        )}

{activeTab === 'team' && (
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">OUR TEAM</h2>
            <p className="text-lg max-w-3xl mx-auto">
              "A map is not just a tool for Navigation- it's a conversation between the user and the World"
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="relative group overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-64 object-cover transform transition duration-300 ease-in-out group-hover:scale-105"
                     loading="lazy"
                 />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all duration-300">
                    <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-sm font-medium p-4">
                      {member.id}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                  <p className="text-blue-600 mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        {activeTab === 'mission' && (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img 
                src="/images/mission.jpg" 
                alt="Team collaboration" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Our Mission & Values</h2>
              <p className="text-lg mb-8">
              Our mission is to build a dynamic, future-focused interactive map platform that empowers users to explore, understand, and shape the world of tomorrow. This map will serve as a digital window into future trends, sustainable development goals, urban growth, climate projections, technological advancements, and evolving human activities.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Award size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Innovation</h3>
                    <p>We constantly push boundaries to create forward-thinking solutions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Integrity</h3>
                    <p>We act with honesty and transparency in everything we do.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Globe size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Impact</h3>
                    <p>We measure our success by the positive difference we make in the world.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

       
      </div>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">CONTACT OUR TEAM</h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto">
            Contact us for more information
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <button className="bg-white text-blue-600 px-4 py-2 md:px-6 md:py-3 rounded-md font-medium text-sm md:text-base hover:bg-gray-100 transition-colors">
              EXPLORE THE MAP 
            </button>
            <button className="bg-transparent border-2 border-white px-4 py-2 md:px-6 md:py-3 rounded-md font-medium text-sm md:text-base hover:bg-blue-700 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
