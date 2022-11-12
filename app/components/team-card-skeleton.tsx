const TeamCardSkeleton: React.FC = () => {
  return (
    <div className="shadow-md rounded-lg bg-white border-1 border-gray-200 mb-2 overflow-hidden">
      <div className="flex items-center border-b">
        <div className="skeleton-nr rounded-tl-lg rounded-br-xl w-24 h-9.5"></div>
        <h3 className="text-size-lg font-medium pl-2 pr-3 py-1 text-center flex-grow">
          <div className="skeleton h-5.75 w-48 mx-auto"></div>
        </h3>
      </div>
      <div className="px-3 py-2 flex text-4xl font-m45 font-light justify-between items-center">
        <div className="skeleton w-12 h-10"></div>
        <div className="skeleton w-52 h-14"></div>
      </div>
    </div>
  );
};

export default TeamCardSkeleton;
