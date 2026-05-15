'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Maximize2, RotateCcw, AlertTriangle, UserX, HeartOff, TrendingDown, Target, Shuffle, Search, X } from 'lucide-react';
import { fallacies } from '../editor/fallacy-extension';

// Extended data for the game
const fallacyDetails = {
  'strawman': {
    icon: Target,
    sniffTest: "Are they attacking what you ACTUALLY said, or a distorted, extreme version of it?",
    example: "You: 'We should improve bike lanes.' Them: 'So you want to ban all cars and force everyone to ride bikes?!'",
    counter: "Point out the distortion: 'That's not my argument. My actual point is...'",
    tip: "Listen for phrases like 'So what you're saying is...' followed by something you definitely didn't say."
  },
  'ad-hominem': {
    icon: UserX,
    sniffTest: "Are they attacking YOU instead of your argument?",
    example: "Them: 'Why should we believe your economic plan? You can't even keep your own desk clean.'",
    counter: "Acknowledge the attack but pivot back: 'My desk organization aside, let's look at the actual numbers in the plan.'",
    tip: "Personal flaws do not invalidate logical points. Separate the arguer from the argument."
  },
  'appeal-emotion': {
    icon: HeartOff,
    sniffTest: "Are they trying to make you feel without making you think?",
    example: "Them: 'Think of the poor children! How could you not support this bill?'",
    counter: "Acknowledge the emotion, demand the logic: 'It's a tragic situation, but how exactly does this specific bill solve the root cause?'",
    tip: "Strong emotions (fear, pity, anger) often bypass the critical thinking centers of the brain."
  },
  'slippery-slope': {
    icon: TrendingDown,
    sniffTest: "Are they claiming a small step will inevitably lead to a disastrous extreme without proof?",
    example: "Them: 'If we let students redo this test, next they'll want to redo the whole year, and soon degrees will be meaningless!'",
    counter: "Demand the causal link: 'What specifically makes step B an unavoidable consequence of step A?'",
    tip: "Look for extreme leaps in logic without intermediate evidence."
  },
  'false-cause': {
    icon: Shuffle,
    sniffTest: "Are they mistaking correlation for causation?",
    example: "Them: 'Every time I wear my lucky socks, my team wins. Therefore, my socks cause the wins.'",
    counter: "Point out confounding variables or coincidence: 'Could it be that the team has been practicing more?'",
    tip: "Just because B follows A, doesn't mean A caused B."
  }
};

export function FallacyGrid() {
  const [selectedFallacy, setSelectedFallacy] = useState<string | null>(null);
  
  // We only show the ones we have detailed data for in the game for now
  const gameFallacies = fallacies.filter(f => Object.keys(fallacyDetails).includes(f.id));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {gameFallacies.map((fallacy) => {
          const detail = fallacyDetails[fallacy.id as keyof typeof fallacyDetails];
          const Icon = detail.icon;
          
          return (
            <FlipCard 
              key={fallacy.id} 
              fallacy={fallacy} 
              detail={detail} 
              onExpand={() => setSelectedFallacy(fallacy.id)} 
            />
          );
        })}
      </div>

      <Dialog open={!!selectedFallacy} onOpenChange={(open) => !open && setSelectedFallacy(null)}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-900 text-zinc-200">
          {selectedFallacy && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-zinc-900`}>
                    {(() => {
                      const Icon = fallacyDetails[selectedFallacy as keyof typeof fallacyDetails].icon;
                      return Icon ? <Icon className="w-6 h-6 text-zinc-400" /> : <AlertTriangle className="w-6 h-6 text-zinc-400" />;
                    })()}
                  </div>
                  <DialogTitle className="text-xl font-medium tracking-tight text-white">
                    {fallacies.find(f => f.id === selectedFallacy)?.name}
                  </DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">The Sniff Test</h4>
                  <p className="text-zinc-200">{fallacyDetails[selectedFallacy as keyof typeof fallacyDetails].sniffTest}</p>
                </div>
                
                <div className="space-y-2 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                  <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Example in the Wild</h4>
                  <p className="italic font-mono text-sm text-zinc-300">&quot;{fallacyDetails[selectedFallacy as keyof typeof fallacyDetails].example}&quot;</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">How to Counter</h4>
                  <p className="text-zinc-200">{fallacyDetails[selectedFallacy as keyof typeof fallacyDetails].counter}</p>
                </div>

                <div className="space-y-2 pb-4">
                  <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Skeptic&apos;s Tip</h4>
                  <p className="text-zinc-200">{fallacyDetails[selectedFallacy as keyof typeof fallacyDetails].tip}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FlipCard({ fallacy, detail, onExpand }: { fallacy: any, detail: any, onExpand: () => void }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = detail.icon;

  return (
    <div className="relative h-64 w-full [perspective:1000px] group">
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] transition-all duration-500 cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-zinc-700 transition-colors">
          <div className={`p-4 rounded-full bg-zinc-950 shadow-inner block ${fallacy.color.split(' ')[1]}`}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-zinc-100 tracking-tight">{fallacy.name}</h3>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute bottom-4 right-4 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(true);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] bg-zinc-800 border border-zinc-700 rounded-2xl p-6 flex flex-col overflow-hidden">
          <h3 className="text-base font-semibold text-white mb-2">{fallacy.name}</h3>
          <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3 mb-4">
            {detail.sniffTest}
          </p>
          
          <div className="mt-auto flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Deep Dive
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
