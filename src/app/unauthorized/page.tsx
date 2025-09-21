export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center flex-col text-center">
      <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-4 text-lg">
        You don’t have a valid role assigned. Please contact your administrator.
      </p>
    </div>
  );
}
