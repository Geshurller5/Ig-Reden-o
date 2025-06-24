import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Users2, Crown, Shield, Star, User } from 'lucide-react';

const SkeletonNode = () => (
  <div className="flex flex-col items-center text-center p-3 w-40">
    <Skeleton className="w-20 h-20 rounded-full mb-3" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-3 w-16 mt-2" />
  </div>
);

const SkeletonTier = ({ title, icon: Icon, nodeCount = 1, children }) => (
  <div className="flex flex-col items-center w-full gap-4">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <h2 className="text-xl font-bold text-muted-foreground">{title}</h2>
    </div>
    {nodeCount > 0 && (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
        {Array.from({ length: nodeCount }).map((_, i) => <SkeletonNode key={i} />)}
      </div>
    )}
    {children}
  </div>
);

const SkeletonMinistryGroup = () => (
  <div className="relative flex flex-col items-center p-4 pt-8 mt-4 border border-dashed rounded-lg w-full">
    <Skeleton className="absolute -top-3 h-6 w-32" />
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      <SkeletonNode />
    </div>
  </div>
);

const ConnectingLineSkeleton = () => (
    <div className="w-px h-12 bg-muted my-2"></div>
);

const OrganogramaSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div>
        <div className="flex items-center space-x-3">
          <Users2 className="h-8 w-8 text-muted-foreground" />
          <div>
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 animate-pulse">
        <SkeletonTier title="Pastorado" icon={Crown} nodeCount={2} />
        <ConnectingLineSkeleton />
        <SkeletonTier title="Diaconato" icon={Shield} nodeCount={2} />
        <ConnectingLineSkeleton />
        <SkeletonTier title="Líderes de Ministério" icon={Star} nodeCount={0}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full mt-4">
                <SkeletonMinistryGroup />
                <SkeletonMinistryGroup />
                <SkeletonMinistryGroup />
            </div>
        </SkeletonTier>
        <ConnectingLineSkeleton />
        <SkeletonTier title="Membros" icon={User} nodeCount={4} />
      </div>
    </div>
  );
};

export default OrganogramaSkeleton;