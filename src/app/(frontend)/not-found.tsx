const NotFound: React.FC = () => {
  return (
    <div className="flex h-screen-nav flex-col items-center justify-center gap-10">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        404 - Page Not Found
      </h1>
      <p className="text-lg">The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFound;
