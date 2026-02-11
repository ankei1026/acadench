export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-yellow-100 text-sidebar-primary-foreground">
                <img
                    src="/assets/Logo2.png"
                    alt="AcadEnch Logo"
                    className="h-8 w-12"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-xl text-yellow-700">
                    ACADENCH
                </span>
            </div>
        </>
    );
}

