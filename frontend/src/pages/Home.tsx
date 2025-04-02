import { useState } from "react";
import { BackgroundBeams } from "../ui/BackgroundBeams";

interface Props {}

function Home(props: Props) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

 async function handleSubscribe() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    console.log(email);
    
    if (emailRegex.test(email)) {
      setIsSubscribed(true); 
      try{const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/email/subscribe `, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      console.log(response);
      if (response.ok) {
      
       
        console.log("Email locked in:", email);
        setEmail("");
        return;
      }}
      catch(e){
        console.log(e);
      }
     
    } else {
      setIsInvalid(true); 
      setEmail(""); 
    }
  }

  return (
    <div className="h-screen w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4 relative z-10">
        <h1 className="pb-4 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold">
          Take the challenge
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center">
          DailyDSA isn’t for the faint-hearted or the lazy – it’s a brutal proving ground where coding challenges shred the weak and leave only the ruthless standing. Think you’re tough enough? Most aren’t, and we don’t care. If you can’t handle the grind, crawl back to your safe little corner and cry about it. The elite don’t flinch; they dominate. Subscribe if you’ve got the spine, or keep dreaming while the real ones rise. Your move, coward.
        </p>
        <div className="flex items-center justify-center p-4 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="Enter your email, punk"
            className="p-3 text-white rounded-lg border border-neutral-600 focus:ring-2 focus:ring-teal-500 w-full max-w-md bg-neutral-900 placeholder:text-neutral-500 outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="ml-3 px-5 py-3 bg-teal-900 cursor-pointer hover:bg-green-500 text-white font-semibold rounded-lg shadow-md transition-all"
            onClick={handleSubscribe}
          >
            Subscribe  
          </button>
        </div>
      </div>


      {isSubscribed && (
        <>
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md z-20" />
          <div className="absolute z-30 bg-neutral-900 p-6 rounded-lg shadow-lg max-w-md text-center border border-teal-500">
            <h2 className="text-2xl font-bold text-teal-500">You’re In, Warrior</h2>
            <p className="text-neutral-300 mt-2">
            Verify your email (it’s probably rotting there, or check the spam graveyard—your worthless inbox means nothing to me), then toughen up. Challenges slam in at 12:00 AM IST. Only the merciless survive.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-teal-900 hover:bg-green-500 text-white rounded-lg"
              onClick={() => setIsSubscribed(false)}
            >
              Got it, Let’s Crush It
            </button>
          </div>
        </>
      )}

      {/* Invalid Email Card - Pure Disdain */}
      {isInvalid && (
        <>
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md z-20" />
          <div className="absolute z-30 bg-neutral-900 p-6 rounded-lg shadow-lg max-w-md text-center border border-red-500">
            <button
              className="absolute top-2 right-2 text-red-500 hover:text-red-300 text-xl font-bold cursor-pointer"
              onClick={() => setIsInvalid(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-red-500">Pathetic Attempt</h2>
            <p className="text-neutral-300 mt-2">
              That email’s garbage. Stop wasting our time and try again, you amateur.
            </p>
          </div>
        </>
      )}

      <BackgroundBeams />
    </div>
  );
}

export default Home;