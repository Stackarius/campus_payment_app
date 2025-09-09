export function PrimaryButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="px-5 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
            {children}
        </button>
    );
}
