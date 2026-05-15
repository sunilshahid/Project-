import { 
  UserX, VenetianMask, Filter, Anchor, TrendingDown, Split, 
  Users, Coins, ShieldAlert, Brain, Eye, Lightbulb, 
  Target, Zap, Flame, MoveDown, Layers, Crosshair 
} from 'lucide-react';

export const STANDALONE_FALLACIES = [
  {
    id: 'ad-hominem',
    name: 'Ad Hominem',
    description: 'Attacking the person instead of the argument.',
    icon: UserX,
  },
  {
    id: 'strawman',
    name: 'Strawman',
    description: 'Misrepresenting an argument to make it easier to attack.',
    icon: VenetianMask,
  },
  {
    id: 'confirmation-bias',
    name: 'Confirmation Bias',
    description: 'Favoring information that confirms existing beliefs.',
    icon: Filter,
  },
  {
    id: 'anchoring',
    name: 'Anchoring Bias',
    description: 'Relying too heavily on the first piece of information offered.',
    icon: Anchor,
  },
  {
    id: 'slippery-slope',
    name: 'Slippery Slope',
    description: 'Assuming a relatively small step inevitably leads to a chain of related events.',
    icon: TrendingDown,
  },
  {
    id: 'false-dilemma',
    name: 'False Dilemma',
    description: 'Presenting two opposing options as the only possibilities.',
    icon: Split,
  },
  {
    id: 'bandwagon',
    name: 'Bandwagon Effect',
    description: 'Believing something is true because many others do.',
    icon: Users,
  },
  {
    id: 'sunk-cost',
    name: 'Sunk Cost Fallacy',
    description: 'Continuing a behavior as a result of previously invested resources.',
    icon: Coins,
  },
  {
    id: 'appeal-to-authority',
    name: 'Appeal to Authority',
    description: 'Insisting a claim is true simply because a valid authority says so.',
    icon: ShieldAlert,
  },
  {
    id: 'dunning-kruger',
    name: 'Dunning-Kruger Effect',
    description: 'People with low ability at a task overestimate their ability.',
    icon: Brain,
  },
  {
    id: 'hindsight-bias',
    name: 'Hindsight Bias',
    description: 'Believing that an event was predictable after it occurred.',
    icon: Eye,
  },
  {
    id: 'availability-heuristic',
    name: 'Availability Heuristic',
    description: 'Overestimating importance based on immediate examples that come to mind.',
    icon: Lightbulb,
  },
  {
    id: 'tu-quoque',
    name: 'Tu Quoque',
    description: 'Answering criticism with criticism, avoiding the argument.',
    icon: MoveDown,
  },
  {
    id: 'texas-sharpshooter',
    name: 'Texas Sharpshooter',
    description: 'Cherry-picking data clusters to suit an argument, or finding a pattern to fit a presumption.',
    icon: Target,
  },
  {
    id: 'halo-effect',
    name: 'Halo Effect',
    description: 'Letting one positive trait influence the overall judgment of a person or thing.',
    icon: Zap,
  },
  {
    id: 'appeal-to-emotion',
    name: 'Appeal to Emotion',
    description: 'Attempting to manipulate an emotional response in place of a valid or compelling argument.',
    icon: Flame,
  },
  {
    id: 'burden-of-proof',
    name: 'Burden of Proof',
    description: 'Saying that the burden of proof lies not with the person making the claim, but with someone else to disprove.',
    icon: Layers,
  },
  {
    id: 'no-true-scotsman',
    name: 'No True Scotsman',
    description: 'Making what could be called an appeal to purity as a way to dismiss relevant criticisms or flaws of an argument.',
    icon: Crosshair,
  }
];
